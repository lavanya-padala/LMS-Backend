const joi=require("joi")
const registerValidation=(data)=>{
    const sch=joi.object({
        name:joi.string().required().min(3),
        email:joi.string().required().email(),
        password:joi.string().required().min(6),
        address:joi.string().required(),
        mobile:joi.string().required().min(10),
        reEnterPassword:joi.string()
    });
    
    return sch.validate(data)
}

const loginValidation=(data)=>{
    const sch=joi.object({
        email:joi.string().required().email(),
        password:joi.string().required().min(6)
    });
    
    return sch.validate(data)
}
module.exports.registerValidation=registerValidation
module.exports.loginValidation=loginValidation