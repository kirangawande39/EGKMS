const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const User = require("../modules/auth/auth.model");
const bcrypt = require("bcrypt");


passport.use(
    new LocalStrategy(
        {
            usernameField: "email"
        },

        async (email, password, done) => {

            try {

                const user = await User.findOne({ email }).select("+password");

                console.log("Email:", email);
                console.log("Password from request:", password);
                console.log("User:", user);

                console.log("User Password:", user?.password);


                if (!user) {
                    return done(null, false, {
                        message: "User not found"
                    });
                }


                const isMatch = await bcrypt.compare(
                    password,
                    user.password
                );


                if (!isMatch) {
                    return done(null, false, {
                        message: "Invalid password"
                    });
                }


                return done(null, user);

            }
            catch (error) {
                return done(error);
            }

        }));


module.exports = passport;