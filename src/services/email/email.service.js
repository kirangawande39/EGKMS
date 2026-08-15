const transporter = require("../../config/mail");

const sendEmail = async ({ to, subject, html }) => {
    console.log("📧 EMAIL SEND START");
    console.log("📧 To:", to);
    console.log("📧 Subject:", subject);

    console.time("📧 SMTP SEND TIME");

    try {
        console.log("📧 Calling transporter.sendMail()...");

        const result = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html
        });

        console.timeEnd("📧 SMTP SEND TIME");

        console.log("✅ EMAIL SEND SUCCESS");
        console.log("📧 Message ID:", result.messageId);

        return result;
    } catch (error) {
        console.timeEnd("📧 SMTP SEND TIME");

        console.error("❌ EMAIL SEND FAILED");
        console.error("❌ Error:", error.message);
        console.error("❌ Code:", error.code);

        throw error;
    }
};

module.exports = {
    sendEmail
};