"use client";

import { useState } from "react";
import { newsroomClient, roleLabel } from "@/lib/newsroom/client";
import { useMember } from "@/components/newsroom/shell";
import { btnPrimary, field, Label, Notice, PageTitle, Panel } from "@/components/newsroom/ui";

export default function AccountPage() {
  const me = useMember();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function change(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 10) return setMsg({ tone: "error", text: "Use at least 10 characters." });
    if (pw !== pw2) return setMsg({ tone: "error", text: "The two passwords don't match." });
    setBusy(true);
    const { error } = await newsroomClient().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg({ tone: "error", text: error.message });
    setPw("");
    setPw2("");
    setMsg({ tone: "success", text: "Password changed." });
  }

  return (
    <>
      <PageTitle>My account</PageTitle>
      <div className="grid max-w-3xl gap-5 md:grid-cols-2">
        <Panel title="Profile">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="t-meta">Name</dt>
              <dd className="font-semibold">{me.name}</dd>
            </div>
            <div>
              <dt className="t-meta">Email</dt>
              <dd className="font-semibold">{me.email}</dd>
            </div>
            <div>
              <dt className="t-meta">Role</dt>
              <dd className="font-semibold">{roleLabel[me.role]}</dd>
            </div>
          </dl>
        </Panel>
        <Panel title="Change password">
          <form onSubmit={change} className="space-y-4">
            <div>
              <Label htmlFor="a-pw">New password</Label>
              <input id="a-pw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={`${field} h-11`} />
            </div>
            <div>
              <Label htmlFor="a-pw2">Repeat new password</Label>
              <input id="a-pw2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={`${field} h-11`} />
            </div>
            {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy ? "Saving…" : "Change password"}
            </button>
          </form>
        </Panel>
      </div>
    </>
  );
}
