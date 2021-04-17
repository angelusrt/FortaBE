//Imports
const router = require("express").Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const verify = require("./verifyToken")
const User = require("../models/User")

const { registerValidation, loginValidation } = require("../validation")

//API requests and responses

//Registering user in DB
router.post("/register", async (req, res) => {    
    try{
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
        
        //Save user
        const savedUser = await user.save()
        //res.send(savedUser)

        //Sends token
        const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET)
        res.header("auth-token", token).send(token)
    } catch(err){
        res.status(400).send(err)
    }
})

//Login in as user in DB
router.post("/login", async (req, res) => {
    console.log(req)
    //validate the user data
    const {error} = loginValidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    
    //checking if user exists
    const user = await User.findOne({email: req.body.email})
    if (!user) return res.status(400).send("Email doesn't exist")

    //Authenticate Password
    const authPass = await bcrypt.compare(req.body.password, user.password)
    if(!authPass) return res.status(400).send("Invalid Password")

    //Sends token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET)
    res.header("auth-token", token).send(token)
})

//Get user infos
router.get("/infos", verify, async (req, res) => {
    try{
        //console.log(req)
        //Gets user
        const user = await User.findById(req.user)

        //Creates object with infos
        const userInfos = {
            id: req.user.toString(),
            bios: user.bios,
            username: user.username,
            email: user.email
        }

        //Sends json
        res.json(userInfos)
        //console.log(res)
    } catch(err){
        res.status(400).send(err)
    }
})

//Get user myForums
router.get("/myForums", verify, async (req, res) => {
    try{
        //Gets user
        const user = await User.findById(req.user)

        //Gets myForums
        const userForums = user.myForums

        //Sends json
        res.json(userForums)
    } catch(err){
        res.status(400).send(err)
    }
})

//Get user myChat
router.get("/myChat", verify, async (req, res) => {
    try{
        //Gets user
        const user = await User.findById(req.user)

        //Gets myChat
        const userChat = user.myChat

        //console.log(userChat)
        //Sends json
        res.json(userChat)
    } catch(err){
        res.status(400).send(err)
    }
})

//Get user myInvites
router.get("/myInvites", verify, async (req, res) => {
    try{
        //Gets user
        const user = await User.findById(req.user)

        //Gets myInvites
        const userInvites = user.myInvites

        //Sends json
        res.json(userInvites)
    } catch(err){
        res.status(400).send(err)
    }
})

module.exports = router