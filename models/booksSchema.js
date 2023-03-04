const  mongoose = require("mongoose")

const booksSchema=mongoose.Schema({
    title:{
        type:String,
        min:3,
        required:true
    },
    book_id:{
        type:Number,
        required:true
    },
    publisher:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    total_copies:{
        type:Number,
        required:true
    },
    available_copies:{
        type:Number,
        required:true
    }
},{collection:"books"})
module.exports=mongoose.model("booksSchema",booksSchema)
