const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const User = require("../modules/auth/auth.model");
const bcrypt = require("bcrypt");

const ApiError = require("../utils/ApiError");


passport.use(
    new LocalStrategy(
        {
            usernameField: "email"
        },

        async (email, password, done) => {

            try {

                const user = await User.findOne({ email }).select("+password");


                if (!user) {
                    return done(
                        new ApiError(
                            404,
                            "User not found"
                        )
                    );
                }

                if (!user.isEmailVerified) {

                    return done(null, false, {
                        message: "Please verify your email before logging in."
                    });

                }


                const isMatch = await bcrypt.compare(
                    password,
                    user.password
                );


                if (!isMatch) {
                    return done(
                        new ApiError(
                            401,
                            "Invalid email or password"
                        )
                    );
                }


                return done(null, user);

            } catch (error) {

                return done(
                    new ApiError(
                        500,
                        error.message
                    )
                );

            }

        }
    )
);


module.exports = passport;