const mongoose = require("mongoose");


const connectDB = async () => {

    try {

        const connection = await mongoose.connect(
            process.env.MONGO_URI
        );


        console.log(
            `MongoDB connected: ${connection.connection.host}`
        );


    } catch (error) {

        console.error(
            "MongoDB connection error:",
            error.message
        );

        process.exit(1);

    }

};

// MongoDB connection events

mongoose.connection.on(
    "disconnected",
    () => {
        console.log("MongoDB disconnected");
    }
);


mongoose.connection.on(
    "error",
    (error) => {
        console.error(
            "MongoDB error:",
            error.message
        );
    }
);


module.exports = connectDB;