// Cloudflare Pages Function — POST /api/contact
// Forwards contact form submissions to a destination email via Resend (or similar).
// Set the following env vars in Cloudflare Pages:
//   RESEND_API_KEY — your Resend API key
//   CONTACT_TO     — target email (e.g. sefic91@gmail.com)
//   CONTACT_FROM   — verified sender (e.g. "hello@semsudin.com")
// Optional:
//   TURNSTILE_SECRET — Cloudflare Turnstile secret for captcha (enable in Cloudflare dash)

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  TURNSTILE_SECRET?: string;
}

interface Payload {
  name?: string;
  email?: string;
  company?: string;
  engagement?: string;
  message?: string;
  website?: string; // honeypot
  'cf-turnstile-response'?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Payload = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // Honeypot
  if (body.website && body.website.trim() !== '') {
    return json({ ok: true }, 200); // pretend success
  }

  // Minimal validation
  if (!body.name || !body.email || !body.message) {
    return json({ error: 'Missing required fields' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return json({ error: 'Invalid email' }, 400);
  }

  // Optional Turnstile verification
  if (env.TURNSTILE_SECRET && body['cf-turnstile-response']) {
    const turn = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET,
        response: body['cf-turnstile-response'],
      }),
    }).then((r) => r.json() as Promise<{ success: boolean }>);
    if (!turn.success) return json({ error: 'Captcha failed' }, 400);
  }

  // Compose email
  const subject = `[semsudin.com] ${body.engagement ?? 'inquiry'} — ${body.name}`;
  const text = [
    `From: ${body.name} <${body.email}>`,
    body.company ? `Company: ${body.company}` : null,
    `Engagement: ${body.engagement ?? 'n/a'}`,
    '',
    '---',
    body.message,
  ]
    .filter(Boolean)
    .join('\n');

  // Send via Resend
  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    console.warn('Contact form received but email env vars not set', { body });
    return json({ ok: true, warning: 'delivery-unconfigured' }, 200);
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: body.email,
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error', res.status, err);
    return json({ error: 'Delivery failed' }, 502);
  }

  return json({ ok: true }, 200);
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
