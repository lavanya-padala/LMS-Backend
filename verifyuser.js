const jwt=require("jsonwebtoken");

module.exports=async function(req,res,next){
    const token=await req.headers.authorization.split(" ")[1];
    if(!token) return res.status(400).send("Access denied")
    try{
        const verified=jwt.verify(token,process.env.TOKEN_SECRET);
        req.userData={email:verified.email,_id:verified._id}
        next();
    }
    catch(err){
        res.status(400).send("Invalid token")
    }
}