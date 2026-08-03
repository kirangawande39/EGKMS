
const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);


require("dotenv").config();


const app = require('./app');

// console.log(process.env.MONGO_URI);
const connectDB = require('./config/db')


const PORT = process.env.PORT || 5000;

const startServer = async()=>{

    await connectDB();


    app.listen(PORT,()=>{

        console.log(
            `Server running on port ${PORT}`
        );

    });

};


startServer();