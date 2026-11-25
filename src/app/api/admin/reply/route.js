import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!idToken) {
      return NextResponse.json({ error: 'Missing admin authorization token.' }, { status: 401 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCSO1glwpfcl6zMsDsxalO1_zTW89qiTqI';
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'floors-55';

    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    const verifyData = await verifyRes.json();
    const firebaseUser = verifyData?.users?.[0];
    if (!verifyRes.ok || !firebaseUser?.localId) {
      return NextResponse.json({ error: 'Invalid or expired admin session. Please sign in again.' }, { status: 401 });
    }

    const staffUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/artifacts/floors55-admin/public/data/staff/${firebaseUser.localId}`;
    const staffRes = await fetch(staffUrl, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    if (!staffRes.ok) {
      return NextResponse.json({ error: 'Access denied: Staff record not found.' }, { status: 403 });
    }

    const staffDoc = await staffRes.json();
    const fields = staffDoc.fields || {};
    const hasConsoleAccess =
      fields.hasConsoleAccess?.booleanValue === true ||
      (fields.hasConsoleAccess === undefined && fields.role?.stringValue === 'admin');

    if (!hasConsoleAccess) {
      return NextResponse.json({ error: 'Access denied: Console permission required.' }, { status: 403 });
    }

    const { to, toName, subject, message, replyTo, contactPhone, ccEmail } = await request.json();
    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Recipient email, subject, and message are required.' }, { status: 400 });
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const fromName = process.env.SMTP_FROM_NAME || 'Floors 55 Pro';
    const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: 'SMTP_USER and SMTP_PASS are not configured in Environment Variables.' },
        { status: 500 }
      );
    }

    const effectiveReplyTo = (replyTo && replyTo.trim()) || 'admin@floors55pro.com';
    const displayPhone = (contactPhone && contactPhone.trim()) || '(503) 662-9230';
    const telDigits = displayPhone.replace(/\D/g, '');
    const telHref =
      telDigits.length === 10
        ? `+1${telDigits}`
        : telDigits.length === 11 && telDigits.startsWith('1')
        ? `+${telDigits}`
        : `+${telDigits || '15036629230'}`;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const formattedHtmlBody = escapeHtml(message).replace(/\r?\n/g, '<br>');

    const htmlTemplate = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #111827; padding: 20px 28px; border-bottom: 4px solid #c5a059;">
          <span style="font-size: 20px; font-weight: 900; letter-spacing: 1px; color: #ffffff;">FLOORS <span style="color: #c5a059;">55</span> PRO</span>
        </div>
        <div style="padding: 28px; font-size: 15px; line-height: 1.65; color: #1f2937;">
          ${formattedHtmlBody}
        </div>
        <div style="background: #f9fafb; padding: 18px 28px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; line-height: 1.6;">
          <strong style="color: #111827;">Floors 55 Pro &amp; Showrooms</strong> &bull; Call / Text: <a href="tel:${telHref}" style="color: #c5a059; font-weight: bold; text-decoration: none;">${escapeHtml(displayPhone)}</a><br>
          Email: <a href="mailto:${escapeHtml(effectiveReplyTo)}" style="color: #111827; font-weight: bold; text-decoration: none;">${escapeHtml(effectiveReplyTo)}</a> &bull; <a href="https://www.floors55pro.com" style="color: #111827; font-weight: bold; text-decoration: none;">www.floors55pro.com</a><br>
          Portland Showroom: 1320 SE Water Ave, Portland, OR 97214<br>
          Lake Oswego Showroom: 25 S State St Ste 2110, Lake Oswego, OR 97034
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: toName ? `"${toName.replace(/"/g, '')}" <${to}>` : to,
      replyTo: effectiveReplyTo.includes('<') ? effectiveReplyTo : `"${fromName}" <${effectiveReplyTo}>`,
      subject: subject.trim(),
      text: message,
      html: htmlTemplate,
    };

    if (ccEmail && ccEmail.includes('@')) {
      mailOptions.cc = ccEmail.trim();
    }

    const info = await transporter.sendMail(mailOptions);
    return NextResponse.json({ ok: true, messageId: info.messageId, sentBy: firebaseUser.email });
  } catch (err) {
    console.error('Admin email reply error:', err);
    return NextResponse.json({ error: err.message || 'Failed to send email.' }, { status: 500 });
  }
}