const form = document.getElementById("loginForm");
  const message = document.getElementById("message");
  let client = null;

  // Keep Supabase's URL callback/session handling, but never keep an allowlist in the browser.
  try {
    const m = await import("https://esm.sh/@supabase/supabase-js@2.117.2");
    const response = await fetch("/api/auth/config", { cache: "no-store" });
    const config = await response.json();
    if (config.supabaseUrl && config.publishableKey) {
      client = m.createClient(config.supabaseUrl, config.publishableKey);
      const { data } = await client.auth.getSession();
      if (data.session) {
        const verifyResponse = await fetch("/api/auth/session", {
          headers: { Authorization: "Bearer " + data.session.access_token },
          cache: "no-store",
        });
        const verified = await verifyResponse.json().catch(() => ({}));
        if (!verifyResponse.ok || !verified.authenticated) {
          await client.auth.signOut();
          message.textContent = "هذا الحساب غير مخوّل للوصول إلى مركز التشغيل.";
          message.className = "message err";
        } else {
          message.textContent = "تم التحقق من جلسة الدخول.";
          message.className = "message ok";
        }
      }
    }
  } catch {
    message.textContent = "تعذر التحقق من جلسة الدخول. حاولي تحديث الصفحة.";
    message.className = "message err";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const button = form.querySelector("button");
    button.disabled = true;
    message.textContent = "";
    message.className = "message";

    try {
      const response = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email }),
        cache: "no-store",
      });

      if (response.status === 429) {
        message.textContent = "تم الوصول إلى حد طلبات الدخول. حاولي مرة أخرى بعد قليل.";
        message.className = "message err";
        return;
      }
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        message.textContent = payload.reason === "AUTH_EMAIL_INVALID"
          ? "أدخلي بريدًا إلكترونيًا صالحًا."
          : "خدمة الدخول غير متاحة مؤقتًا. حاولي لاحقًا.";
        message.className = "message err";
        return;
      }
      message.textContent = payload.message || "إذا كان البريد مصرحًا به، فسيتم إرسال رابط الدخول.";
      message.className = "message ok";
    } catch {
      message.textContent = "تعذر الاتصال بخدمة الدخول. حاولي لاحقًا.";
      message.className = "message err";
    } finally {
      button.disabled = false;
    }
  });
