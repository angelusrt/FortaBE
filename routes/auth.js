//Imports
const router = require("express").Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { registerValidation, loginValidation } = require("../validation")

//API requests and responses
router.post("/register", async (req, res) => {

    //validate the user data
    const {error} = registerValidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    
    //checking user uniqueness
    const emailExist = await User.findOne({email: req.body.email})
    if (emailExist) return res.status(400).send("Email already exists")

    //Hash Password
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    //create new user
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        bios: req.body.bios
    })
    
    try{
        const savedUser = await user.save()
        res.send(savedUser)
    } catch(err){
        res.status(400).send(err)
    }
})

router.post("/login", async (req, res) => {
    //validate the user data
    const {error} = loginValidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    
    //checking if user exists
    const user = await User.findOne({email: req.body.email})
    if (!user) return res.status(400).send("Email doesn't exist")

    //Authenticate Password
    const authPass = await bcrypt.compare(req.body.password, user.password)
    if(!authPass) return res.status(400).send("Invalid Password")

    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET)
    res.header("auth-token", token).send(token)
    //res.send("Logged sucessfully")
    
})

module.exports = router