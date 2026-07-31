const mongoose = require("mongoose");


const employeeSchema = new mongoose.Schema(
{

    name:{
        type:String,
        required:true,
        trim:true
    },


    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },


    role:{
        type:String,
        enum:[
            "admin",
            "manager",
            "employee"
        ],
        default:"employee"
    },


    department:{
        type:String,
        default:null
    },


    isRegistered:{
        type:Boolean,
        default:false
    }


},
{
    timestamps:true
});


module.exports = mongoose.model(
    "Employee",
    employeeSchema
);