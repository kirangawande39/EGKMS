const emailVerificationTemplate = (otp) => {

    return `
        <h2>Email Verification</h2>

        <p>Your OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP is valid for 5 minutes.</p>
    `;

};

module.exports = {
    emailVerificationTemplate
};