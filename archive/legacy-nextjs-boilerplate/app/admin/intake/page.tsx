"use client";

import { FormEvent, useState } from "react";

export default function IntakePage() {
  const [password, setPassword] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const auth = await fetch("/api/admin/intake/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!auth.ok) {
      setBusy(false);
      setMessage("كلمة المرور غير صحيحة.");
      return;
    }

    const form = new FormData();
    Array.from(files ?? []).forEach((file) => form.append("source", file));
    const upload = await fetch("/api/admin/intake/upload", { method: "POST", body: form });
    const result = (await upload.json().catch(() => ({}))) as { message?: string; error?: string };
    setBusy(false);
    setMessage(upload.ok ? result.message || "تم استقبال المصدر للمراجعة." : result.message || result.error || "تم رفض المصدر.");
  }

  return (
    <main className="intake-shell" dir="rtl">
      <section className="intake-card" aria-labelledby="intake-title">
        <div className="intake-kicker">P1 · SOURCE INTAKE · CLOSED</div>
        <h1 id="intake-title">استقبال المصدر المعتمد</h1>
        <p>هذه الصفحة لا تفتح الكتالوج ولا تنشئ أي منتج. ارفع فاتورة أو صورًا حقيقية فقط للمراجعة.</p>
        <form onSubmit={submit}>
          <label htmlFor="password">كلمة مرور الاستقبال</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          <label htmlFor="source">الفاتورة أو صور المنتج</label>
          <input id="source" type="file" accept="image/*,application/pdf" multiple onChange={(event) => setFiles(event.target.files)} required />
          <small>المسموح: صور أو PDF فقط، بحد أقصى 10MB لكل ملف. لا ترفع بيانات تجريبية.</small>
          <button type="submit" disabled={busy}>{busy ? "جارٍ التحقق…" : "إرسال للمراجعة"}</button>
        </form>
        {message && <p className="intake-message" role="status">{message}</p>}
        <div className="intake-lock">Gate: CLOSED · P1: CLOSED · Products API: 503</div>
      </section>
    </main>
  );
}
