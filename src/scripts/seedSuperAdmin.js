require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const connectDB = require("../config/db");

const Employee = require("../modules/employee/employee.model");
const User = require("../modules/auth/auth.model");


const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be defined in .env"
      );
    }

    // CHECK EXISTING SUPER ADMIN EMPLOYEE

    let employee = await Employee.findOne({
      email: email.toLowerCase(),
    });

    if (employee) {
      console.log("ℹ️ Employee already exists.");

      // Make sure existing employee is Super Admin
      employee.hierarchyLevel = "SUPER_ADMIN";
      employee.status = "ACTIVE";
      employee.isRegistered = true;

      await employee.save();
    } else {
      employee = await Employee.create({
        employeeId: "SA-001",

        firstName: "Super",

        lastName: "Admin",

        email: email.toLowerCase(),

        hierarchyLevel: "SUPER_ADMIN",

        department: null,

        team: null,

        reportingManager: null,

        status: "ACTIVE",

        isRegistered: true,
      });

      console.log("✅ Super Admin Employee created.");
    }


    
    // CHECK EXISTING USER
    

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      console.log("ℹ️ Super Admin User already exists.");

      await mongoose.connection.close();
      process.exit(0);
    }


    
    // HASH PASSWORD
    

    const hashedPassword = await bcrypt.hash(password, 12);


    
    // CREATE AUTH USER
    

    await User.create({
      employeeId: employee._id,

      email: email.toLowerCase(),

      password: hashedPassword,

      accountStatus: "ACTIVE",

      isEmailVerified: true,

      refreshTokenHash: null,

      failedLoginAttempts: 0,

      lockUntil: null,

      passwordChangedAt: new Date(),

      lastLogin: null,
    });


    console.log("-----------------------------------");
    console.log("✅ Super Admin created successfully.");
    console.log(`Email    : ${email}`);
    console.log("Password : [from .env]");
    console.log("-----------------------------------");


    await mongoose.connection.close();

    process.exit(0);

  } catch (error) {
    console.error("❌ Super Admin seed failed:");
    console.error(error);

    await mongoose.connection.close();

    process.exit(1);
  }
};


seedSuperAdmin();
