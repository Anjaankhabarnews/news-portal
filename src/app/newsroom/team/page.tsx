"use client";

import { useCallback, useEffect, useState } from "react";
import { newsroomClient, roleLabel, type Role } from "@/lib/newsroom/client";
import { useMember } from "@/components/newsroom/shell";
import { btnOutline, btnPrimary, field, fmt, Label, Notice, PageTitle, Panel } from "@/components/newsroom/ui";

interface MemberRow {
  user_id: string;
  display_name: string;
  role: Role;
  created_at: string;
}

const ROLE_HELP: Record<Role, string> = {
  reporter: "Writes stories and submits them for review",
  editor: "Edits, publishes, breaking news, reads tips",
  admin: "Everything, plus managing the team",
  ad_manager: "Manages advertisements",
};

export default function TeamPage() {
  const me = useMember();
  const db = newsroomClient();
  const [rows, setRows] = useState<MemberRow[] | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "reporter" as Role });
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await db.from("newsroom_members").select("user_id,display_name,role,created_at").order("created_at");
    setRows((data as MemberRow[]) ?? []);
  }, [db]);

  useEffect(() => {
    void load();
  }, [load]);

  if (me.role !== "admin") return <Notice>Only admins can manage the team.</Notice>;

  async function call(method: "POST" | "PATCH" | "DELETE", body: object) {
    const { data } = await db.auth.getSession();
    const res = await fetch("/api/newsroom/team", {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await call("POST", form);
      setMsg({ tone: "success", text: `${form.name} added. Share their email and temporary password privately; they can change it under My account.` });
      setForm({ name: "", email: "", password: "", role: "reporter" });
      void load();
    } catch (err) {
      setMsg({ tone: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(r: MemberRow, role: Role) {
    try {
      await call("PATCH", { userId: r.user_id, role });
      void load();
    } catch (err) {
      setMsg({ tone: "error", text: (err as Error).message });
    }
  }

  async function remove(r: MemberRow) {
    if (!confirm(`Remove ${r.display_name}'s newsroom access and login? Their bylines on past stories stay.`)) return;
    try {
      await call("DELETE", { userId: r.user_id });
      void load();
    } catch (err) {
      setMsg({ tone: "error", text: (err as Error).message });
    }
  }

  const generate = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const bytes = crypto.getRandomValues(new Uint32Array(14));
    setForm((f) => ({ ...f, password: Array.from(bytes, (b) => chars[b % chars.length]).join("") }));
  };

  return (
    <>
      <PageTitle>Team</PageTitle>
      <div className="grid gap-5 lg:grid-cols-12">
        <Panel title="Add a person" className="lg:col-span-5">
          <form onSubmit={add} className="space-y-4">
            <div>
              <Label htmlFor="t-name" hint="(used as their byline)">
                Full name
              </Label>
              <input id="t-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${field} h-11`} />
            </div>
            <div>
              <Label htmlFor="t-email">Email</Label>
              <input id="t-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${field} h-11`} />
            </div>
            <div>
              <Label htmlFor="t-pass" hint="(10+ characters)">
                Temporary password
              </Label>
              <div className="flex gap-2">
                <input id="t-pass" required minLength={10} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${field} h-11 font-mono`} />
                <button type="button" onClick={generate} className={`${btnOutline} mt-1.5 shrink-0 text-sm`}>
                  Generate
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="t-role">Role</Label>
              <select id="t-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className={`${field} h-11`}>
                {(Object.keys(roleLabel) as Role[]).map((r) => (
                  <option key={r} value={r}>
                    {roleLabel[r]} — {ROLE_HELP[r]}
                  </option>
                ))}
              </select>
            </div>
            {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
            <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
              {busy ? "Adding…" : "Add to newsroom"}
            </button>
          </form>
        </Panel>

        <Panel title="Newsroom members" className="lg:col-span-7">
          {rows === null ? (
            <p className="t-meta">Loading…</p>
          ) : (
            <ul className="divide-y divide-line">
              {rows.map((r) => (
                <li key={r.user_id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">
                      {r.display_name}
                      {r.user_id === me.userId ? <span className="t-meta ml-2 text-xs">(you)</span> : null}
                    </p>
                    <p className="t-meta text-xs">Added {fmt(r.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <select
                      aria-label={`Role for ${r.display_name}`}
                      value={r.role}
                      disabled={r.user_id === me.userId}
                      onChange={(e) => changeRole(r, e.target.value as Role)}
                      className="h-9 rounded-xs border border-line-strong px-2 text-sm"
                    >
                      {(Object.keys(roleLabel) as Role[]).map((role) => (
                        <option key={role} value={role}>
                          {roleLabel[role]}
                        </option>
                      ))}
                    </select>
                    {r.user_id !== me.userId ? (
                      <button type="button" onClick={() => remove(r)} className={`${btnOutline} min-h-9 px-3 text-sm text-red`}>
                        Remove
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
