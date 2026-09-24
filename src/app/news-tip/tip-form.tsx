"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { whatsappLink } from "@/config/site";
import { TIP_LIMITS, tipCategories, tipToWhatsappText, validateFiles, validateTip, type TipErrors, type TipFields } from "@/lib/tips";
import { CheckIcon, UploadIcon, WhatsAppIcon } from "@/components/icons";
import { btn } from "@/components/ui/primitives";
import { createTipUploads, submitTip, type TipState } from "./actions";

const field = "mt-1.5 block w-full border border-line-strong bg-white px-3 text-[1rem] text-ink placeholder:text-muted focus:border-cobalt focus:outline-none aria-[invalid=true]:border-red";

function readFields(form: HTMLFormElement): TipFields {
  const fd = new FormData(form);
  const s = (k: string) => String(fd.get(k) ?? "").trim();
  return { name: s("name"), phone: s("phone"), location: s("location"), category: s("category"), description: s("description") };
}

export function TipForm({ uploadsEnabled }: { uploadsEnabled: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<TipState, FormData>(submitTip, { status: "idle" });
  const [pending, startTransition] = useTransition();
  const [clientErrors, setClientErrors] = useState<TipErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<string | null>(null);
  const [lastFields, setLastFields] = useState<TipFields | null>(null);

  const errors: TipErrors = { ...(state.status === "invalid" ? state.errors : {}), ...clientErrors };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fields = readFields(form);
    setLastFields(fields);
    const errs = validateTip(fields, (form.elements.namedItem("consent") as HTMLInputElement).checked);
    const fileErr = files.length ? validateFiles(files) : null;
    if (fileErr) errs.files = fileErr;
    setClientErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      form.querySelector<HTMLElement>(`[name="${first === "files" ? "media" : first}"]`)?.focus();
      return;
    }

    const fd = new FormData(form);
    fd.delete("media");

    if (files.length && uploadsEnabled) {
      setProgress("Preparing upload…");
      const res = await createTipUploads(files.map((f) => ({ type: f.type, size: f.size })));
      if (!res.ok) {
        setProgress(null);
        setClientErrors({ files: res.error === "rate-limited" ? "Too many attempts. Please wait a few minutes." : "Uploads are unavailable right now. You can send media on WhatsApp instead." });
        return;
      }
      const { getBrowserClient } = await import("@/lib/supabase/browser");
      const db = getBrowserClient();
      for (let i = 0; i < files.length; i++) {
        setProgress(`Uploading ${i + 1} of ${files.length}…`);
        const { path, token } = res.uploads[i];
        const { error } = await db.storage.from("tips").uploadToSignedUrl(path, token, files[i], { contentType: files[i].type });
        if (error) {
          setProgress(null);
          setClientErrors({ files: "A file failed to upload. Please try again or use WhatsApp." });
          return;
        }
        fd.append("media_paths", path);
      }
      setProgress(null);
    }
    startTransition(() => formAction(fd));
  }

  if (state.status === "success") {
    return (
      <div className="border-t-4 border-success bg-paper p-6 md:p-8" role="status">
        <p className="flex items-center gap-2 font-serif text-2xl font-bold text-ink">
          <CheckIcon size={26} className="text-success" /> Thank you — your tip has reached the newsroom.
        </p>
        <p className="t-dek mt-3">
          An editor reviews every tip. If we need more details we will contact you on the number you provided. We never publish your
          identity without your permission.
        </p>
      </div>
    );
  }

  const busy = pending || progress !== null;

  return (
    // `action` = progressive enhancement: before hydration the form POSTs to the server
    // action (never a GET — personal data must not land in the URL). Once hydrated,
    // onSubmit takes over to validate instantly and upload media first.
    <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate className="space-y-6" aria-describedby="tip-privacy">
      {state.status === "not-configured" && lastFields ? (
        <div className="border-l-4 border-gold bg-paper p-5" role="alert">
          <p className="font-semibold text-ink">Online submissions are being set up.</p>
          <p className="mt-1 text-[0.9375rem] text-ink-2">
            Please send your tip on WhatsApp for now — we've filled in what you typed. Attach photos or videos in the chat.
          </p>
          <a href={whatsappLink(tipToWhatsappText(lastFields))} target="_blank" rel="noopener" className={`${btn("whatsapp")} mt-4`}>
            <WhatsAppIcon size={18} /> Continue on WhatsApp
          </a>
        </div>
      ) : null}
      {state.status === "rate-limited" ? (
        <p className="border-l-4 border-red bg-red-50 p-4 text-ink" role="alert">
          Too many submissions from this connection. Please wait a few minutes, or use WhatsApp.
        </p>
      ) : null}
      {state.status === "error" ? (
        <p className="border-l-4 border-red bg-red-50 p-4 text-ink" role="alert">
          Something went wrong while sending. Please try again, or use WhatsApp.
        </p>
      ) : null}

      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="tip-name" className="font-semibold text-ink">
            Your name <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="tip-name" name="name" autoComplete="name" maxLength={80} className={`${field} h-12`} />
        </div>
        <div>
          <label htmlFor="tip-phone" className="font-semibold text-ink">
            Mobile number <span className="text-red">*</span>
          </label>
          <input
            id="tip-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={16}
            placeholder="98765 43210"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "err-phone" : "hint-phone"}
            className={`${field} h-12`}
          />
          {errors.phone ? (
            <p id="err-phone" className="mt-1 text-sm text-red">
              {errors.phone}
            </p>
          ) : (
            <p id="hint-phone" className="t-meta mt-1">
              Only used by our editors to verify your tip.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="tip-location" className="font-semibold text-ink">
            Location <span className="text-red">*</span>
          </label>
          <input
            id="tip-location"
            name="location"
            required
            maxLength={120}
            placeholder="e.g. Sakchi, Jamshedpur"
            aria-invalid={Boolean(errors.location)}
            aria-describedby={errors.location ? "err-location" : undefined}
            className={`${field} h-12`}
          />
          {errors.location ? (
            <p id="err-location" className="mt-1 text-sm text-red">
              {errors.location}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="tip-category" className="font-semibold text-ink">
            Category
          </label>
          <select id="tip-category" name="category" defaultValue="" className={`${field} h-12`}>
            <option value="">Choose a category</option>
            {tipCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="tip-description" className="font-semibold text-ink">
          What happened? <span className="text-red">*</span>
        </label>
        <textarea
          id="tip-description"
          name="description"
          required
          rows={6}
          maxLength={TIP_LIMITS.descriptionMax}
          placeholder="Describe what you saw or know: what, where, when, and who is affected."
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "err-description" : undefined}
          className={`${field} py-3 leading-relaxed`}
        />
        {errors.description ? (
          <p id="err-description" className="mt-1 text-sm text-red">
            {errors.description}
          </p>
        ) : null}
      </div>

      <div>
        <p className="font-semibold text-ink" id="media-label">
          Photos or videos <span className="font-normal text-muted">(optional, up to {TIP_LIMITS.maxFiles})</span>
        </p>
        <label
          htmlFor="tip-media"
          className="mt-1.5 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-line-strong bg-paper px-4 py-5 text-center hover:border-ink"
        >
          <UploadIcon size={22} className="text-muted" />
          <span className="text-sm font-semibold text-ink">Choose files</span>
          <span className="t-meta text-xs">JPG, PNG, WebP, HEIC, MP4 or MOV · max 50 MB each</span>
        </label>
        <input
          id="tip-media"
          name="media"
          type="file"
          multiple
          accept={TIP_LIMITS.allowedTypes.join(",")}
          className="sr-only"
          aria-labelledby="media-label"
          aria-describedby={errors.files ? "err-files" : undefined}
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []);
            setFiles(list);
            setClientErrors((c) => ({ ...c, files: validateFiles(list) ?? undefined }));
          }}
        />
        {files.length ? (
          <ul className="mt-2 space-y-1 text-sm text-ink-2">
            {files.map((f) => (
              <li key={f.name + f.size} className="truncate">
                {f.name} <span className="text-muted">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
              </li>
            ))}
          </ul>
        ) : null}
        {errors.files ? (
          <p id="err-files" className="mt-1 text-sm text-red">
            {errors.files}
          </p>
        ) : null}
        {!uploadsEnabled ? <p className="t-meta mt-1">Large files are easiest to send on WhatsApp.</p> : null}
      </div>

      <div>
        <label className="flex items-start gap-3 text-[0.9375rem] text-ink-2">
          <input
            type="checkbox"
            name="consent"
            className="mt-1 size-5 shrink-0 accent-navy-900"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "err-consent" : undefined}
          />
          I confirm this information is true to the best of my knowledge, and I agree that Anjaan Khabar may contact me about it.
        </label>
        {errors.consent ? (
          <p id="err-consent" className="mt-1 text-sm text-red">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
        <button type="submit" disabled={busy} className={`${btn("primary", "lg")} disabled:opacity-60`}>
          {progress ?? (pending ? "Sending…" : "Send tip to newsroom")}
        </button>
        <p id="tip-privacy" className="t-meta">
          Your details are private and only seen by our editors.
        </p>
      </div>
    </form>
  );
}
