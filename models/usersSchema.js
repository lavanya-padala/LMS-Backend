const  mongoose = require("mongoose")

const userSchema=mongoose.Schema({
    name:{
        type:String,
        min:3
    },
    email:{
        type:String,
        min:3
    },
    password:{
        type:String,
        min:6
    },
    mobile:{
        type:String,
        min:10
    },
    address:{
        type:String,
    },
    limit:{
        type:Number,
        default:4
    }
},{collection:"users"})
module.exports=mongoose.model("userSchema",userSchema)