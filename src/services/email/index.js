const { sendEmail } = require("./email.service");
const { emailVerificationTemplate } = require("./email.template");

module.exports = {
    sendEmail,
    emailVerificationTemplate
};