const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

// Initialize Firebase Admin to securely access the database
admin.initializeApp();

// Twilio credentials from .env
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

// Email credentials from .env
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

// Create the email transporter (Connects to Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

/**
 * Core Helper Function: Sends Twilio SMS
 */
async function sendSmsAlert(message, settings) {
    if (!accountSid || !authToken || !twilioPhone) return;
    if (!settings.smsEnabled || !settings.smsPhone) return;

    const client = twilio(accountSid, authToken);
    try {
        await client.messages.create({
            body: message,
            from: twilioPhone,
            to: settings.smsPhone
        });
        console.log(`✅ SMS Alert sent successfully to ${settings.smsPhone}`);
    } catch (err) {
        console.error("❌ Twilio Error:", err);
    }
}

/**
 * Core Helper Function: Sends Email Alert
 */
async function sendEmailAlert(subject, message, settings) {
    if (!emailUser || !emailPass) return;
    if (!settings.emailEnabled || !settings.emailAddress) return;

    try {
        await transporter.sendMail({
            from: `"Floors 55 Alerts" <${emailUser}>`,
            to: settings.emailAddress,
            subject: subject,
            text: message,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                      <h2 style="color: #c5a059; margin-top:0;">${subject}</h2>
                      <p style="font-size: 16px; line-height: 1.5; color: #333;">${message}</p>
                      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
                      <p style="font-size: 12px; color: #888;">This is an automated alert from the Floors 55 System.</p>
                   </div>`
        });
        console.log(`✅ Email Alert sent successfully to ${settings.emailAddress}`);
    } catch (err) {
        console.error("❌ Nodemailer Error:", err);
    }
}

/**
 * Master Dispatcher: Grabs settings and fires all enabled alerts
 */
async function dispatchAlerts(subject, message) {
    const db = admin.firestore();
    const settingsSnap = await db.doc('artifacts/floors55-admin/public/data/settings/notifications').get();
    
    if (!settingsSnap.exists) return;
    const settings = settingsSnap.data();

    // Run both alerts in parallel
    await Promise.all([
        sendSmsAlert(message, settings),
        sendEmailAlert(subject, message, settings)
    ]);
}

// ============================================================================
// 1. TRIGGER: New Pro Application (Wholesale Request)
// ============================================================================
exports.alertNewProApp = onDocumentCreated("artifacts/floors55-admin/public/data/wholesale_requests/{docId}", async (event) => {
    const data = event.data.data();
    const subject = `F55 Alert: New Pro Application`;
    const msg = `New trade application received from ${data.name} at ${data.business}. Log in to review and approve.`;
    await dispatchAlerts(subject, msg);
});

// ============================================================================
// 2. TRIGGER: New Quote / Estimate Request
// ============================================================================
exports.alertNewQuote = onDocumentCreated("artifacts/floors55-admin/public/data/quote_requests/{docId}", async (event) => {
    const data = event.data.data();
    const productInfo = data.product ? ` for ${data.product}` : '';
    const subject = `F55 Alert: New Quote Request`;
    const msg = `${data.name} requested a flooring estimate${productInfo}. Check the Admin Console for details.`;
    await dispatchAlerts(subject, msg);
});

// ============================================================================
// 3. TRIGGER: New Sample Order
// ============================================================================
exports.alertNewSample = onDocumentCreated("artifacts/floors55-admin/public/data/sample_requests/{docId}", async (event) => {
    const data = event.data.data();
    const subject = `F55 Alert: New Sample Order`;
    const msg = `${data.name} ordered a physical sample of ${data.product} (${data.color}). Fulfillment required.`;
    await dispatchAlerts(subject, msg);
});

// ============================================================================
// 4. TRIGGER: New General Inquiry / Contact Message
// ============================================================================
exports.alertNewMessage = onDocumentCreated("artifacts/floors55-admin/public/data/general_inquiries/{docId}", async (event) => {
    const data = event.data.data();
    const subject = `F55 Alert: New Contact Message`;
    const msg = `New message from ${data.name} regarding "${data.subject}". Check your Admin Console inbox.`;
    await dispatchAlerts(subject, msg);
});