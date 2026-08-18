const { sendEmail } = require("./email.service");
const { emailVerificationTemplate } = require("./email.template");

const { passwordResetTemplate } = require('./passwordResetTemp')

module.exports = {
    sendEmail,
    emailVerificationTemplate,
    passwordResetTemplate
};