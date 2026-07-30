const User = require('./auth.model');
const bcrypt = require("bcrypt");


const registerUser = async (userData) => {

    const {
        name,
        email,
        password,
        role
    } = userData;


    // Check existing user

    const existingUser = await User.findOne({
        email
    });


    if(existingUser){
        throw new Error("User already exists with this email");
    }


    // Hash password

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
        password,
        salt
    );


    // Create user

    const user = await User.create({

        name,
        email,
        password: hashedPassword,
        role

    });


    return user;

};


module.exports = {
    registerUser
};