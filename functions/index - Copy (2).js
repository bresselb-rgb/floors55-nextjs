const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// --- NOTIFICATION HELPERS (Email & Twilio) ---
async function sendAlerts(subject, messageText) {
    const db = admin.firestore();
    const settingsDoc = await db.collection("artifacts").doc("floors55-admin").collection("public").doc("data").collection("settings").doc("notifications").get();
    
    if (!settingsDoc.exists) return;
    const settings = settingsDoc.data();

    // Send Email Alert
    if (settings.emailEnabled && settings.emailAddress && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
            await transporter.sendMail({
                from: `"Floors 55 System" <${process.env.EMAIL_USER}>`,
                to: settings.emailAddress,
                subject: subject,
                text: messageText
            });
            console.log("Email alert sent successfully.");
        } catch (err) { console.error("Email Error:", err); }
    }
}

// --- AUTOMATED ALERTS TRIGGERS ---
exports.alertNewProApp = onDocumentCreated("artifacts/{appId}/public/data/wholesale_requests/{docId}", async (event) => {
    const data = event.data.data();
    await sendAlerts("New Pro Application", `Company: ${data.business}\nName: ${data.name}\nPhone: ${data.phone}`);
});

exports.alertNewQuote = onDocumentCreated("artifacts/{appId}/public/data/quote_requests/{docId}", async (event) => {
    const data = event.data.data();
    await sendAlerts("New Quote Request", `Client: ${data.name}\nProduct: ${data.product || 'N/A'}`);
});

exports.alertNewSample = onDocumentCreated("artifacts/{appId}/public/data/sample_requests/{docId}", async (event) => {
    const data = event.data.data();
    await sendAlerts("New Sample Order", `Ship to: ${data.name}\nProduct: ${data.product || 'N/A'}`);
});

exports.alertNewMessage = onDocumentCreated("artifacts/{appId}/public/data/general_inquiries/{docId}", async (event) => {
    const data = event.data.data();
    await sendAlerts("New Website Message", `From: ${data.name}\nSubject: ${data.subject}`);
});

// --- NEW: PRO ACTIVITY ALERTS ---
exports.alertNewBoard = onDocumentCreated("artifacts/{appId}/public/data/client_boards/{docId}", async (event) => {
    const data = event.data.data();
    const db = admin.firestore();
    
    // Look up the Pro's business name
    const proDoc = await db.doc(`artifacts/${event.params.appId}/public/data/users/${data.proId}`).get();
    const proName = proDoc.exists ? (proDoc.data().business || "Unknown Pro") : "Unknown Pro";
    
    await sendAlerts("New Client Board Created", `Pro Partner: ${proName}\nClient Board: ${data.name}`);
});

exports.alertNewProposal = onDocumentCreated("artifacts/{appId}/public/data/pro_quotes/{docId}", async (event) => {
    const data = event.data.data();
    const db = admin.firestore();
    
    // Look up the Pro's business name
    const proDoc = await db.doc(`artifacts/${event.params.appId}/public/data/users/${data.proId}`).get();
    const proName = proDoc.exists ? (proDoc.data().business || "Unknown Pro") : "Unknown Pro";
    
    await sendAlerts("New Proposal Generated", `Pro Partner: ${proName}\nClient Name: ${data.clientName}\nProject: ${data.projectName || 'N/A'}\nTotal Amount: $${data.totals?.turnkeyRetail?.toFixed(2)}`);
});


// --- AUTOMATED PRO ONBOARDING WELCOME EMAIL ---
exports.sendProWelcomeEmail = onDocumentCreated("artifacts/{appId}/public/data/users/{userId}", async (event) => {
    const userData = event.data.data();
    if (!userData || userData.role === 'admin') return; // Don't send this to staff

    try {
        // 1. Get the user's email securely from Firebase Auth using their new ID
        const userRecord = await admin.auth().getUser(event.params.userId);
        const email = userRecord.email;

        // 2. Generate the Secure Password Reset Link
        const resetLink = await admin.auth().generatePasswordResetLink(email);

        // 3. Format Account Manager details
        const amName = userData.accountManager?.name || "General Support";
        const amPhone = userData.accountManager?.phone || "503-555-0199";
        const amEmail = userData.accountManager?.email || "support@floors55.com";

        // 4. Send the Beautiful HTML Welcome Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"Floors 55 Pro" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to the Floors 55 Pro Portal - Access Your Account",
            html: `
                <div style="font-family: Arial, sans-serif; max-w-600px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                    <h2 style="color: #111827; margin-top: 0; font-size: 24px;">Welcome to Floors 55!</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Your wholesale flooring portal has been successfully provisioned. You can now access exclusive pricing, order live samples, and generate instant quotes.</p>
                    
                    <div style="background-color: #f9fafb; border-left: 4px solid #c5a059; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Your Account Manager:</strong></p>
                        <p style="margin: 5px 0 0 0; color: #111827; font-size: 16px; font-weight: bold;">${amName}</p>
                        <p style="margin: 5px 0 0 0; color: #4b5563; font-size: 14px;">📞 ${amPhone} <br> ✉️ ${amEmail}</p>
                    </div>

                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">To activate your account and securely log in, please click the button below to set your private password:</p>
                    
                    <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; margin-top: 15px; letter-spacing: 1px;">SET MY PASSWORD</a>
                    
                    <p style="margin-top: 40px; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                        <strong>Security Notice:</strong> This activation link expires in exactly <strong>1 hour</strong>. If your link has expired, simply visit <a href="https://floors55pro.com" style="color: #c5a059;">floors55pro.com</a>, click "Sign In", and use the "Forgot Password" button to request a new activation link.
                    </p>
                </div>
            `
        });
        console.log(`Successfully sent Welcome Onboarding email to ${email}`);
    } catch (err) {
        console.error("Error generating Welcome email:", err);
    }
});