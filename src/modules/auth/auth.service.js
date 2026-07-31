const User = require('./auth.model');
const bcrypt = require("bcrypt");
const ApiError = require('../../utils/ApiError')
const { generateVerificationToken } = require("../../utils/token");
const { sendEmail, emailVerificationTemplate } = require("../../services/email");
const OTP = require("./otp.model");
const generateOTP = require("../../utils/otp");
const Employee = require("../employee/employee.model");


const registerUser = async (userData) => {

    const {
        name,
        email,
        password,
        role

    } = userData;



    const employee = await Employee.findOne({
        email
    });


    if (!employee) {

        throw new ApiError(
            403,
            "Email is not authorized by company."
        );

    }

    const verifiedOTP = await OTP.findOne({
        email,
        isVerified: true
    });

    if (!verifiedOTP) {

        throw new ApiError(
            400,
            "Please verify your email first."
        );

    }

    const existingUser = await User.findOne({
        email
    });

    if (existingUser) {

        throw new ApiError(
            409,
            "User already exists with this email"
        );

    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
        password,
        salt
    );

    const user = await User.create({

        name,
        email,
        password: hashedPassword,
        role: employee.role,
        isEmailVerified: true

    });

    employee.isRegistered = true;

    await employee.save();

    await OTP.deleteOne({
        email
    });

    return user;
};


const sendEmailOTP = async (email) => {

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(
            409,
            "User already exists with this email"
        );
    }

    const otp = generateOTP();

    await OTP.deleteOne({ email });

    await OTP.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendEmail({
        to: email,
        subject: "Verify Your Email",
        html: emailVerificationTemplate(otp)
    });

    return {
        message: "OTP sent successfully"
    };

};




const verifyEmailOTP = async (email, otp) => {

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
        throw new ApiError(
            404,
            "OTP not found. Please request a new OTP."
        );
    }

    if (otpRecord.expiresAt < new Date()) {

        await OTP.deleteOne({ email });

        throw new ApiError(
            400,
            "OTP has expired. Please request a new OTP."
        );

    }

    if (otpRecord.otp !== otp) {

        throw new ApiError(
            400,
            "Invalid OTP."
        );

    }

    otpRecord.isVerified = true;

    await otpRecord.save();

    return {
        message: "Email verified successfully"
    };

};



module.exports = {
    registerUser, sendEmailOTP, verifyEmailOTP
};