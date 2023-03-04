const  mongoose = require("mongoose")

const bookingsSchema=mongoose.Schema({
    book_id:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    requested_date:{
        type:Date,
        default:new Date()
    },
    issued_date:{
        type:Date
    },
    borrowed_date:{
        type:Date
    },
    due_date:{
        type:Date
    },
    returned_date:{
        type:Date
    }
},{collection:"bookings"})
module.exports=mongoose.model("bookingsSchema",bookingsSchema)