//Validation
const Joi = require("@hapi/joi")

//Register validation
const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().max(32).required(),
        email: Joi.string().min(7).max(32).required().email(),
        password: Joi.string().min(8).required(),
        bios: Joi.string().default("Hello World!").min(1).max(256)
    })

    return schema.validate(data)
}

//Register validation
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().min(7).max(32).required().email(),
        password: Joi.string().min(8).required()
    })

    return schema.validate(data)
}

module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation