const mongoose = require("mongoose");


const hierarchySchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },


    level:{
        type:Number,
        required:true
    },


    parentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hierarchy",
        default:null
    },

    description:{
        type:String,
        trim:true,
        default:null
    },


    status:{
        type:String,
        enum:[
            "active",
            "inactive"
        ],
        default:"active"
    },


    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }

},
{
    timestamps:true
});


module.exports = mongoose.model(
    "Hierarchy",
    hierarchySchema
);