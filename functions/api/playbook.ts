// Cloudflare Pages Function — POST /api/playbook
// Delivers the Enterprise GenAI Reliability Checklist PDF to the submitter
// and notifies hello@semsudin.com with the lead details.
//
// Required env vars (set via `wrangler pages secret put ...`):
//   RESEND_API_KEY  — Resend API key
//   CONTACT_TO      — where lead notifications go (e.g. sefic91@gmail.com or hello@semsudin.com)
//   CONTACT_FROM    — verified sender (e.g. hello@semsudin.com)

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

interface Payload {
  name?: string;
  email?: string;
  role?: string;
  company?: string;
  website?: string; // honeypot
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Payload = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (body.website && body.website.trim() !== '') {
    return json({ ok: true }, 200);
  }

  if (!body.name || !body.email) {
    return json({ error: 'Missing required fields' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return json({ error: 'Invalid email' }, 400);
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    console.warn('Playbook request received but email env vars not set', { body });
    return json({ ok: true, warning: 'delivery-unconfigured' }, 200);
  }

  // 1. Pull PDF from the same deployment (static asset)
  const pdfUrl = new URL('/downloads/enterprise-genai-reliability-checklist.pdf', request.url);
  const pdfResp = await fetch(pdfUrl.toString());
  if (!pdfResp.ok) {
    console.error('Failed to fetch PDF', pdfResp.status);
    return json({ error: 'Could not retrieve the playbook file' }, 500);
  }
  const pdfBuf = await pdfResp.arrayBuffer();
  const pdfB64 = arrayBufferToBase64(pdfBuf);

  const firstName = body.name.split(' ')[0];

  // 2. Deliver PDF to the lead
  const toLeadPromise = fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Semsudin Sefić <${env.CONTACT_FROM}>`,
      to: [body.email],
      reply_to: env.CONTACT_FROM,
      subject: 'Your playbook: The Enterprise GenAI Reliability Checklist',
      text: leadEmailText(firstName),
      html: leadEmailHtml(firstName),
      attachments: [
        {
          filename: 'enterprise-genai-reliability-checklist.pdf',
          content: pdfB64,
        },
      ],
    }),
  });

  // 3. Notify Semsudin of the new lead
  const leadNotification = [
    `New playbook download`,
    '',
    `Name:     ${body.name}`,
    `Email:    ${body.email}`,
    body.role ? `Role:     ${body.role}` : null,
    body.company ? `Company:  ${body.company}` : null,
    '',
    `User-Agent: ${request.headers.get('User-Agent') || 'unknown'}`,
    `CF-Country: ${request.headers.get('CF-IPCountry') || 'unknown'}`,
    `Timestamp:  ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join('\n');

  const toSelfPromise = fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `semsudin.com leads <${env.CONTACT_FROM}>`,
      to: [env.CONTACT_TO],
      reply_to: body.email,
      subject: `[lead] Playbook downloaded — ${body.name}${body.company ? ` @ ${body.company}` : ''}`,
      text: leadNotification,
    }),
  });

  const [leadRes, selfRes] = await Promise.allSettled([toLeadPromise, toSelfPromise]);

  if (leadRes.status === 'fulfilled' && !leadRes.value.ok) {
    const err = await leadRes.value.text();
    console.error('Playbook delivery failed', leadRes.value.status, err);
    return json({ error: 'Delivery failed' }, 502);
  }
  if (leadRes.status === 'rejected') {
    console.error('Playbook delivery rejected', leadRes.reason);
    return json({ error: 'Delivery failed' }, 502);
  }
  if (selfRes.status === 'fulfilled' && !selfRes.value.ok) {
    // Non-fatal — user already got the PDF, we just didn't get the notification
    console.warn('Lead notification failed', selfRes.value.status);
  }

  return json({ ok: true }, 200);
};

function leadEmailText(firstName: string) {
  return `Hi ${firstName},

Attached is the Enterprise GenAI Reliability Checklist — 42 items across 6 categories that I actually run through when architecting or reviewing production AI systems.

How to use it: print it, run through it with your team in an architecture review, and count the unchecked boxes. Most enterprise teams discover 5–10 on first review.

If you'd like to walk through a specific system together, I do paid architecture reviews in this exact format. Reply to this email or book a 30-minute intro call: https://calendly.com/sefic91/30min

Either way, good luck with your AI build.

— Šemsudin
AI Systems Architect
https://semsudin.com`;
}

function leadEmailHtml(firstName: string) {
  return `<p>Hi ${escapeHtml(firstName)},</p>

<p>Attached is <strong>The Enterprise GenAI Reliability Checklist</strong> — 42 items across 6 categories that I actually run through when architecting or reviewing production AI systems.</p>

<p><strong>How to use it:</strong> print it, run through it with your team in an architecture review, and count the unchecked boxes. Most enterprise teams discover 5–10 on first review.</p>

<p>If you'd like to walk through a specific system together, I do paid architecture reviews in this exact format. Reply to this email or <a href="https://calendly.com/sefic91/30min">book a 30-minute intro call</a>.</p>

<p>Either way — good luck with your AI build.</p>

<p>— Šemsudin<br>
<em>AI Systems Architect</em><br>
<a href="https://semsudin.com">semsudin.com</a></p>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function arrayBufferToBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, slice as unknown as number[]);
  }
  return btoa(binary);
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
