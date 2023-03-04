const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const body_parser=require("body-parser")
const app=express()
const jwt=require("jsonwebtoken")
const path=require("path")
const bcrypt=require("bcrypt")
const booksSchema=require("./models/booksSchema")
const bookingsSchema=require("./models/bookingsSchema")
const verify=require("./verifyuser")
const sendMail=require("./nodemailer")
const {registerValidation,loginValidation}=require("./validations/user_validations")
app.use(cors())
app.use(body_parser.json())
app.use(body_parser.urlencoded({extended:false}))
mongoose.set('strictQuery', true)
const dotenv=require("dotenv")
dotenv.config()
mongoose.connect("mongodb://localhost:27017/se",{
    useNewUrlParser:true
},()=>{
    console.log("DB CONNECTED")
})
//userschema
const user_schema=require("./models/usersSchema")
const { number } = require("joi")
//User Routes
app.post("/login",async(req,res)=>{
    const {error}=loginValidation(req.body);
    if(error) return res.send({message:error})
    try{
    //checking if email exists or  not
    const user_email_exist= await user_schema.findOne({email:req.body.email})
    if(!user_email_exist) return res.status(400).send("User is not registered")
    //password validation
    const validPass=await bcrypt.compare(req.body.password,user_email_exist.password)
    if(!validPass) return res.send({message:"Invalid password!"})
    else{
        const token=jwt.sign({_id:user_email_exist._id,email:user_email_exist.email},process.env.TOKEN_SECRET,{expiresIn:'1d'});
        console.log({message:"Login Successfull",user:user_email_exist,token:token})
        res.send({message:"Login Successfull",user:user_email_exist,token:token})
    }}
    catch(err){
        res.send({message:err})
    }

});
app.post("/register",async(req,res)=>{
    //validate the data entered
    const {error}=registerValidation(req.body);
    if(error) return res.send({message:error.details[0].message})
    //checking if email exists or  not
    const emailexist=await user_schema.findOne({email:req.body.email})
    if(emailexist) return res.send({message:"User already exists"})
    //hashing password
    const salt=await bcrypt.genSalt(10);
    const hashedpassword= await bcrypt.hash(req.body.password,salt)
    try{
        const usernew=new user_schema({
            name:req.body.name,
            email:req.body.email,
            password:hashedpassword,
            address:req.body.address,
            mobile:req.body.mobile
        })
        await usernew.save()
        res.send({message:"Successfully Registered,Please Login now"})
    }
    catch(err){
        res.send({message:err.message})
    }
})
app.post("/forgotpassword",async(req,res)=>{
    email=req.body.email
    try{
        const isuser=await user_schema.findOne({email:email})
        if(!isuser){
            return res.send({message:"User not exists!"})
        }
        const secret=process.env.TOKEN_SECRET+isuser.password
        const token=jwt.sign({email:isuser.email},secret,{expiresIn:"5m"})
        const link=`http://localhost:9002/reset-password/${isuser.email}/${token}`
        const subject = "Reset Password"
        await sendMail(isuser.email,subject,link)
        return res.send({message:"Reset Password Mail sent"})
    }
    catch(err){
        return res.send(err.message)
    }
})
app.get("/reset-password/:email/:token",async(req,res)=>{
    const email1=req.params.email
    const token1=req.params.token
    const isuser=await user_schema.findOne({email:email1})
    if(!isuser){
        return res.send({message:"User not exist!"})
    }
    const secret=process.env.TOKEN_SECRET+isuser.password
    try{
        const verify1=jwt.verify(token1,secret)
        res.sendFile(path.join(__dirname,"/files","/index.html"))
        console.log(verify1.email)
    }
    catch(error){
        res.send({message:error})

    }
})
app.post("/reset-password/:email/:token",async(req,res)=>{
    const email2=req.params.email
    const token2=req.params.token
    const isuser=await user_schema.findOne({email:email2})
    if(!isuser){
        return res.send("User not exist!")
    }
    const password = req.body.password
    const password1 = req.body.confirm_password
    if(password === password1)
    {
        try{
        const secret = process.env.TOKEN_SECRET+ isuser.password
        const verify = jwt.verify(token2,secret)
        const salt=await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt)
        await user_schema.findOneAndUpdate({email:email2},{$set :{password:hashPassword}})
        res.status(200).send({message:"Password updated succesfully"})
    }
        catch(err){
            res.send({message:err.message})
        }
    }
    else{
        res.send({message:"Password didtn't matched"})
    }
})
app.post("/homepage",(req,res)=>{
    res.send("my api homepage")
})
app.post("/booksdata",async(req,res)=>{
    const query=new RegExp(req.body.searchkey,'i');
    if(query!==''){
        try{
            const search_results=await booksSchema.find({title:query})
            const search_results1=await booksSchema.find({author:query})
            Array.prototype.push.apply(search_results,search_results1)
            res.status(200).send({message:search_results})
        }
        catch(err){
            console.log(err)
            res.send({message:"No Matched Book"})
        }
    }
    else{
        res.send({message:"No query title"})
    }

})
app.get("/booksdata",async(req,res)=>{
    const data=await booksSchema.find({})
    res.send({message:data})
})
app.post("/booking/:id",async(req,res)=>{
    // const search=await booksSchema.findOne({book_id:req.params.id})
    // res.send(search)
    const {error}=loginValidation(req.body);
    if(error) return res.send({message:error.details[0].message})
    //checking if email exists or  not
    try{
    const user_email_exist= await user_schema.findOne({email:req.body.email})
    if(!user_email_exist) return res.send({message:"User is not registered"})
    //password validation
    const validPass=await bcrypt.compare(req.body.password,user_email_exist.password)
    if(!validPass) return res.send({message:"Invalid password!"})
    const available=await booksSchema.findOne({book_id:req.params.id})
    if(user_email_exist.limit!=0){
    if(available.available_copies!=0){
        const bookingnew=new bookingsSchema({
            book_id:req.params.id,
            email:req.body.email
        })
        console.log(bookingnew)
        const a=await bookingnew.save()
        const b=await booksSchema.findOneAndUpdate({book_id:req.params.id},{$inc:{available_copies:-1}})
        const c=await userschema.findOneAndUpdate({email:req.body.email},{$inc:{limit:-1}})
        return res.send({message:"Your request for book has been recorded"})
    }
    else{
        return res.send({message:"Sorry book is currently not availble"})
    }
    }
    else{
        return res.send({message:"Your limit for books borrowed has been exceeded,please return them inorder to request for new books"})
    }
    }
    catch(err){
        return res.send(error)
    }
})
//Librarian routes
//There is no registration for the librarian only login and after login it should redirect to librarian dashboard
app.post("/librarian-login",async(req,res)=>{
    const {email,password}=req.body
    try{
    if(email==="librarian123@gmail.com" && password==="librarian123")
    {
        res.send({message:"Login Successful",librarian:req.body})
    }
    else{
        res.send({message:"Incorrect Email or password"})
    }
    }
    catch(err)
    {
        res.send({message:err})
    }
})
app.post("/add-book",async(req,res)=>{
    const bookdata=await booksSchema.findOne({book_id:req.body.book_id})
    if(!bookdata) {
        try{
            const newbook=new booksSchema({
                book_id:req.body.book_id,
                author:req.body.author,
                publisher:req.body.publisher,
                total_copies:req.body.total_copies,
                available_copies:req.body.total_copies,
                title:req.body.title
            })
            await newbook.save()
            return res.send({message:"Book data stored to database"})
        }
        catch(err){
            res.send({message:err})
        }
    }
    else{
        res.send({message:"Book data is already stored in database"})
    }
})
app.post("/update-data",async(req,res)=>{
    const bookdata=await booksSchema.findOne({book_id:req.body.book_id})
    if (!bookdata){
        return res.send({message:"Given Book id data is not in database"})
    }
    else{
        try{
            const number=req.body.modify;
            await booksSchema.findOneAndUpdate({book_id:req.body.book_id},{$inc:{total_copies:number}})
            await booksSchema.findOneAndUpdate({book_id:req.body.book_id},{$inc:{available_copies:number}})
            res.send({message:"Book data Modified"})
        }
        catch(err){
            res.send({message:err})
        }
    }
})
app.get("/issue",async(req,res)=>{
    const data=await bookingsSchema.find({})
    const data1=data.filter(x=>!x.issued_date)
    res.send({message:data1})
})
app.get("/issue/:id",async(req,res)=>{
    const data=await bookingsSchema.find({_id:req.params.id})
    const book_id=data[0].book_id
    const email=data[0].email
    const data1=await booksSchema.find({book_id:book_id})
    const date=new Date()
    const due_date=date.getDate()+7
    date.setDate(due_date)
    await bookingsSchema.findOneAndUpdate({_id:req.params.id},{issued_date:new Date()})
    await bookingsSchema.findOneAndUpdate({_id:req.params.id},{due_date:date})
    const subject="Book issued"
    const body="Your request for the book "+data1[0].title+" has been approved.You can collect it at the library now."
    await sendMail(email,subject,body)
    return res.send({message:"Request is approved and Email has been already sent to the requested user"})    
})
app.get("/borrow",async(req,res)=>{
    const data=await bookingsSchema.find({})
    const data1=data.filter(x=>x.issued_date && x.due_date && !x.borrowed_date)
    return res.send({message:data1})
})
app.get("/borrow/:id",async(req,res)=>{
    await bookingsSchema.findByIdAndUpdate({_id:req.params.id},{borrowed_date:new Date()})
    return res.send({message:"Borrowed date saved successfully"})
})
app.get("/return",async(req,res)=>{
    const data=await bookingsSchema.find({})
    const data1=data.filter(x=>x.issued_date && x.due_date && x.borrowed_date && !x.returned_date)
    return(res.send({message:data1}))
})
app.get("/return/:id",async(req,res)=>{
    await bookingsSchema.findByIdAndUpdate({_id:req.params.id},{returned_date:new Date()})
    const data=await bookingsSchema.findById({_id:req.params.id})
    const number=1
    await userschema.findOneAndUpdate({email:data.email},{$inc:{limit:number}})
    await booksSchema.findOneAndUpdate({book_id:data.book_id},{$inc:{available_copies:number}})
    return res.send({message:"Returned book is updated successfully"})
})
app.listen(9002,()=>{
    console.log("Listening at 9002")
})