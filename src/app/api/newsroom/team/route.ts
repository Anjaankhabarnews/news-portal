import { NextResponse } from "next/server";
import { slugify } from "@/lib/newsroom/body";
import { verifyStaff, type StaffRole } from "@/lib/newsroom/verify";
import { getServiceClient } from "@/lib/supabase/server";

const ROLES: StaffRole[] = ["admin", "editor", "reporter", "ad_manager"];
const ROLE_BYLINE: Record<StaffRole, string> = { admin: "Editor", editor: "Editor", reporter: "Reporter", ad_manager: "Advertising" };

async function adminOnly(req: Request) {
  const staff = await verifyStaff(req);
  if (!staff || staff.role !== "admin") return null;
  return staff;
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Admin-only team management (needs SUPABASE_SECRET_KEY on the server).
 * POST   — create a staff login + newsroom role + byline
 * PATCH  — change a member's role
 * DELETE — remove newsroom access (their past bylines stay)
 */
export async function POST(req: Request) {
  const admin = await adminOnly(req);
  if (!admin) return bad("Only admins can manage the team.", 403);
  const db = getServiceClient();
  if (!db) return bad("Server is missing SUPABASE_SECRET_KEY.", 500);

  let body: { email?: string; password?: string; name?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request.");
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim().slice(0, 80);
  const role = body.role as StaffRole;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("Enter a valid email address.");
  if (password.length < 10) return bad("Temporary password must be at least 10 characters.");
  if (name.length < 2) return bad("Enter the person's name (used as their byline).");
  if (!ROLES.includes(role)) return bad("Choose a valid role.");

  const { data: created, error: createErr } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (createErr || !created.user) return bad(createErr?.message ?? "Could not create the login.");
  const userId = created.user.id;

  const { error: memberErr } = await db.from("newsroom_members").insert({ user_id: userId, display_name: name, role });
  if (memberErr) {
    await db.auth.admin.deleteUser(userId);
    return bad(memberErr.message);
  }

  let slug = slugify(name);
  const { data: taken } = await db.from("authors").select("id").eq("slug", slug).maybeSingle();
  if (taken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  await db.from("authors").insert({ slug, name, role: ROLE_BYLINE[role], is_desk: false, member_id: userId });

  return NextResponse.json({ ok: true, userId });
}

export async function PATCH(req: Request) {
  const admin = await adminOnly(req);
  if (!admin) return bad("Only admins can manage the team.", 403);
  const db = getServiceClient();
  if (!db) return bad("Server is missing SUPABASE_SECRET_KEY.", 500);
  const { userId, role } = (await req.json().catch(() => ({}))) as { userId?: string; role?: StaffRole };
  if (!userId || !role || !ROLES.includes(role)) return bad("Invalid request.");
  if (userId === admin.userId && role !== "admin") return bad("You cannot remove your own admin role.");
  const { error } = await db.from("newsroom_members").update({ role }).eq("user_id", userId);
  if (error) return bad(error.message);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = await adminOnly(req);
  if (!admin) return bad("Only admins can manage the team.", 403);
  const db = getServiceClient();
  if (!db) return bad("Server is missing SUPABASE_SECRET_KEY.", 500);
  const { userId } = (await req.json().catch(() => ({}))) as { userId?: string };
  if (!userId) return bad("Invalid request.");
  if (userId === admin.userId) return bad("You cannot remove yourself.");
  // Keep their byline on past stories; unlink it and remove newsroom access + login.
  await db.from("authors").update({ member_id: null }).eq("member_id", userId);
  const { error } = await db.from("newsroom_members").delete().eq("user_id", userId);
  if (error) return bad(error.message);
  await db.auth.admin.deleteUser(userId);
  return NextResponse.json({ ok: true });
}
