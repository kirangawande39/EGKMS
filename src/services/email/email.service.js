const transporter = require("../../config/mail");

const sendEmail = async ({ to, subject, html }) => {
    

    try {
        

        const result = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html
        });

        return result;
    } catch (error) {
   
        throw error;
    }
};

module.exports = {
    sendEmail
};