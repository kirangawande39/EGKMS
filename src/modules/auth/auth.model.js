const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters"]
        },


        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email address"
            ]
        },


        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false
        },


        role: {
            type: String,
            enum: {
                values: ["admin", "employee", "manager"],
                message: "Role must be admin, employee or manager"
            },
            default: "employee"
        },

        isActive: {
            type: Boolean,
            default: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        refreshTokenHash: {
            type: String,
            select: false,
            default: null
        },

        lastLogin: {
            type: Date,
            default: null
        }


    },
    {
        timestamps: true
    });


// Remove sensitive data when sending response
userSchema.methods.toJSON = function () {

    const user = this.toObject();

    delete user.password;

    return user;
};


module.exports = mongoose.model("User", userSchema);