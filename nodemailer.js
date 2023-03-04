const nodemailer=require('nodemailer')

const sendMail= async(email,subject,body)=>{
    try {
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:'lavanyapadala666@gmail.com',
                pass:"mptkmgeoydgbinsc"
            }
        })

        await transporter.sendMail({
            from:'lavanyapadala666@gmail.com',
            to:email,
            subject:subject,
            text:body
        })

        console.log("Email sent successfully");


    } catch (error) {
        console.log(error,"Email not sent succesfully");
    }
    
}
module.exports=("sendMail",sendMail)