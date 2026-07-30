const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes')
const passport = require("./config/passport");
const cookieParser = require("cookie-parser");
const errorMiddleware=require('./middleware/error.middleware')


const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(passport.initialize());

app.use('/api/v1', routes);

app.use(errorMiddleware)


module.exports = app;
