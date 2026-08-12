const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const {
  Strategy: JwtStrategy,
  ExtractJwt,
} = require("passport-jwt");

const bcrypt = require("bcrypt");

const User = require("../modules/auth/auth.model");
const Employee = require("../modules/employee/employee.model");

// LOCAL STRATEGY
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false,
    },

    async (email, password, done) => {
      console.time("PASSPORT LOGIN TOTAL");

      try {
        console.time("EMAIL NORMALIZATION");

        const normalizedEmail = email
          .toLowerCase()
          .trim();

        console.timeEnd("EMAIL NORMALIZATION");


        // Get user with password
        console.time("USER QUERY");

        const user = await User.findOne({
          email: normalizedEmail,
        }).select("+password");

        console.timeEnd("USER QUERY");


        if (!user) {
          console.timeEnd("PASSPORT LOGIN TOTAL");

          return done(null, false, {
            message: "Invalid email or password.",
          });
        }


        // Check account status
        if (user.accountStatus !== "ACTIVE") {
          console.timeEnd("PASSPORT LOGIN TOTAL");

          return done(null, false, {
            message: "Account is not active.",
          });
        }


        // Get linked employee
        console.time("EMPLOYEE QUERY");

        const employee = await Employee.findById(
          user.employeeId
        );

        console.timeEnd("EMPLOYEE QUERY");


        if (!employee) {
          console.timeEnd("PASSPORT LOGIN TOTAL");

          return done(null, false, {
            message: "Employee record not found.",
          });
        }


        // Check employee status
        if (employee.status !== "ACTIVE") {
          console.timeEnd("PASSPORT LOGIN TOTAL");

          return done(null, false, {
            message: "Employee account is not active.",
          });
        }


        // Check email verification
        if (!user.isEmailVerified) {
          console.timeEnd("PASSPORT LOGIN TOTAL");

          return done(null, false, {
            message: "Please verify your email first.",
          });
        }


        // Compare password
        console.time("BCRYPT PASSWORD CHECK");

        const isPasswordValid =
          await bcrypt.compare(
            password,
            user.password
          );

        console.timeEnd("BCRYPT PASSWORD CHECK");


        if (!isPasswordValid) {

          console.time("FAILED LOGIN SAVE");

          user.failedLoginAttempts += 1;

          await user.save();

          console.timeEnd("FAILED LOGIN SAVE");

          console.timeEnd("PASSPORT LOGIN TOTAL");

          return done(null, false, {
            message: "Invalid email or password.",
          });
        }


        // Reset failed attempts after successful login
        console.time("SUCCESS USER SAVE");

        if (
          user.failedLoginAttempts !== 0 ||
          user.lockUntil !== null
        ) {
          user.failedLoginAttempts = 0;
          user.lockUntil = null;

          await user.save();
        }

        console.timeEnd("SUCCESS USER SAVE");


        // Attach employee information
        user._employee = employee;


        console.timeEnd("PASSPORT LOGIN TOTAL");

        return done(null, user);

      } catch (error) {

        console.timeEnd("PASSPORT LOGIN TOTAL");

        return done(error);
      }
    }
  )
);



// JWT STRATEGY


const jwtSecret = process.env.JWT_ACCESS_SECRET;

if (!jwtSecret) {
  throw new Error(
    "JWT_ACCESS_SECRET is not configured."
  );
}



// ACCESS TOKEN COOKIE EXTRACTOR

const cookieExtractor = (req) => {
  if (
    req &&
    req.cookies &&
    req.cookies.accessToken
  ) {
    return req.cookies.accessToken;
  }

  return null;
};



// JWT AUTHENTICATION
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,

      secretOrKey: jwtSecret,

      algorithms: ["HS256"],
    },

    async (payload, done) => {
      try {
        const userId =
          payload.id || payload.userId;

        if (!userId) {
          return done(null, false);
        }

        // Get current user
        const user = await User.findById(
          userId
        );

        if (!user.isEmailVerified) {
          return done(null, false, {
            message: "Please verify your email first.",
          });
        }

        if (!user) {
          return done(null, false);
        }

        // Account must remain active
        if (user.accountStatus !== "ACTIVE") {
          return done(null, false);
        }

        // Get current employee state
        const employee = await Employee.findById(
          user.employeeId
        ).select(
          "_id employeeId firstName lastName hierarchyLevel department team status"
        );

        if (!employee) {
          return done(null, false);
        }

        // Employee must remain active
        if (employee.status !== "ACTIVE") {
          return done(null, false);
        }

        // Attach current employee information
        user._employee = employee;

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

module.exports = passport;
