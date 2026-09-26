"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { newsroomClient, roleLabel, type Role } from "@/lib/newsroom/client";

export interface Member {
  userId: string;
  email: string;
  name: string;
  role: Role;
  /** This person's byline (authors row), if they have one. */
  authorId: string | null;
}

const MemberContext = createContext<Member | null>(null);

/** The logged-in newsroom member. Only usable inside <NewsroomShell>. */
export function useMember(): Member {
  const m = useContext(MemberContext);
  if (!m) throw new Error("useMember must be used inside NewsroomShell");
  return m;
}

type State =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "no-access"; email: string }
  | { kind: "ready"; member: Member };

const NAV: Array<{ href: string; label: string; roles?: Role[] }> = [
  { href: "/newsroom", label: "Stories" },
  { href: "/newsroom/stories/new", label: "New story", roles: ["admin", "editor", "reporter"] },
  { href: "/newsroom/breaking", label: "Breaking", roles: ["admin", "editor"] },
  { href: "/newsroom/tips", label: "News tips", roles: ["admin", "editor"] },
  { href: "/newsroom/team", label: "Team", roles: ["admin"] },
  { href: "/newsroom/account", label: "My account" },
];

export function NewsroomShell({ logo, children }: { logo: React.ReactNode; children: React.ReactNode }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const pathname = usePathname() ?? "/newsroom";

  const load = useCallback(async (session: Session | null) => {
    if (!session) return setState({ kind: "signed-out" });
    const db = newsroomClient();
    const { data: row } = await db
      .from("newsroom_members")
      .select("role, display_name")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!row) return setState({ kind: "no-access", email: session.user.email ?? "" });
    const { data: author } = await db.from("authors").select("id").eq("member_id", session.user.id).maybeSingle();
    setState({
      kind: "ready",
      member: {
        userId: session.user.id,
        email: session.user.email ?? "",
        name: row.display_name,
        role: row.role as Role,
        authorId: author?.id ?? null,
      },
    });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const db = newsroomClient();
    db.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = db.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") void load(session);
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const signOut = () => void newsroomClient().auth.signOut();

  if (!isSupabaseConfigured) {
    return (
      <Centered logo={logo}>
        <p className="text-ink-2">The newsroom needs Supabase to be configured (NEXT_PUBLIC_SUPABASE_URL and key).</p>
      </Centered>
    );
  }
  if (state.kind === "loading") {
    return (
      <Centered logo={logo}>
        <p className="t-meta" role="status">
          Loading newsroom…
        </p>
      </Centered>
    );
  }
  if (state.kind === "signed-out") return <LoginScreen logo={logo} />;
  if (state.kind === "no-access") {
    return (
      <Centered logo={logo}>
        <h1 className="font-serif text-2xl font-bold">No newsroom access</h1>
        <p className="mt-2 text-ink-2">
          You are signed in as <strong>{state.email}</strong>, but this account has not been added to the newsroom. Ask an admin
          to add you under Team.
        </p>
        <button type="button" onClick={signOut} className="mt-6 min-h-11 rounded-xs border border-line-strong px-4 font-semibold">
          Sign out
        </button>
      </Centered>
    );
  }

  const { member } = state;
  const nav = NAV.filter((n) => !n.roles || n.roles.includes(member.role));
  const isActive = (href: string) =>
    href === "/newsroom"
      ? pathname === "/newsroom" || (pathname.startsWith("/newsroom/stories/") && pathname !== "/newsroom/stories/new")
      : pathname.startsWith(href);

  return (
    <MemberContext.Provider value={member}>
      <div className="min-h-dvh bg-paper">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-[1320px] items-center gap-4 px-4 py-2 md:px-6">
            <Link href="/newsroom" className="flex shrink-0 items-center gap-3" aria-label="Newsroom home">
              {logo}
              <span className="hidden border-l border-line pl-3 font-sans text-xs font-extrabold tracking-[0.18em] text-navy-900 uppercase sm:inline">
                Newsroom
              </span>
            </Link>
            <div className="ml-auto flex items-center gap-3 text-sm">
              <Link href="/" target="_blank" className="hidden font-semibold text-cobalt hover:underline md:inline">
                View site ↗
              </Link>
              <span className="hidden text-right leading-tight sm:block">
                <span className="block font-semibold text-ink">{member.name}</span>
                <span className="block text-xs text-muted">{roleLabel[member.role]}</span>
              </span>
              <button type="button" onClick={signOut} className="min-h-10 rounded-xs border border-line-strong px-3 font-semibold hover:border-ink">
                Sign out
              </button>
            </div>
          </div>
          <nav aria-label="Newsroom" className="border-t border-line bg-navy-900">
            <ul className="scroll-rail mx-auto flex max-w-[1320px] gap-1 px-2 md:px-4">
              {nav.map((n) => (
                <li key={n.href} className="shrink-0">
                  <Link
                    href={n.href}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className={`relative flex h-11 items-center px-3 text-[0.9375rem] font-semibold whitespace-nowrap ${
                      isActive(n.href) ? "text-white after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:bg-red" : "text-white/75 hover:text-white"
                    }`}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main className="mx-auto max-w-[1320px] px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </MemberContext.Provider>
  );
}

function Centered({ logo, children }: { logo: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper px-4 py-10">
      <div className="w-full max-w-md border-t-4 border-red bg-white p-6 shadow-menu md:p-8">
        <div className="mb-6 flex items-center gap-3">
          {logo}
          <span className="border-l border-line pl-3 font-sans text-xs font-extrabold tracking-[0.18em] text-navy-900 uppercase">Newsroom</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginScreen({ logo }: { logo: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await newsroomClient().auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setError(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
  }

  return (
    <Centered logo={logo}>
      <h1 className="font-serif text-2xl font-bold text-ink">Sign in</h1>
      <p className="t-meta mt-1">For Anjaan Khabar staff only.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="nr-email" className="font-semibold text-ink">
            Email
          </label>
          <input
            id="nr-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 h-12 w-full border border-line-strong px-3 focus:border-cobalt focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="nr-password" className="font-semibold text-ink">
            Password
          </label>
          <input
            id="nr-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 h-12 w-full border border-line-strong px-3 focus:border-cobalt focus:outline-none"
          />
        </div>
        {error ? (
          <p className="text-sm text-red" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={busy} className="min-h-12 w-full rounded-xs bg-red font-semibold text-white hover:bg-red-700 disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </Centered>
  );
}
