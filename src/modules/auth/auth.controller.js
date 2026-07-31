const { generateAccessToken ,generateRefreshToken } = require("../../utils/jwt");
const authService = require("./auth.service");
const { hashToken } = require("../../utils/hash");
        


const register = async (req, res) => {

    try {
        const user = await authService.registerUser(
            req.body
        );
        res.status(201).json({

            success: true,
            message: "User registered successfully",
            data: user

        });
    }
    catch (error) {

        res.status(400).json({

            success: false,
            message: error.message

        });
    }
};






const login = async (req, res, next) => {

    try {

        const user = req.user;


        const accessToken = generateAccessToken(user);

        const refreshToken = generateRefreshToken(user);


        const refreshTokenHash = await hashToken(refreshToken);


        await User.findByIdAndUpdate(
            user._id,
            {
                refreshTokenHash,
                lastLogin: new Date()
            }
        );

        res.cookie(
            "accessToken",
            accessToken,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000 // 15 min
            }
        );


        // Refresh Token Cookie
        res.cookie(
            "refreshToken",
            refreshToken,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            }
        );


        return res.status(200).json({

            success: true,

            message: "Login successful",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });


    }
    catch (error) {

        next(error);

    }

};





const sendEmailOTP = async (req, res, next) => {

    try {

        const { email } = req.body;

        const result = await authService.sendEmailOTP(email);

        return res.status(200).json({

            success: true,

            message: result.message

        });

    } catch (error) {

        next(error);

    }

};



const verifyEmailOTP = async (req, res, next) => {

    try {

        const { email, otp } = req.body;

        const result = await authService.verifyEmailOTP(email, otp);

        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {

        next(error);

    }

};


module.exports = {
    register, login ,verifyEmailOTP , sendEmailOTP
};