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
        //validates the user data
        const {error} = registerValidation(req.body)
        if(error) return res.status(400).json(error.details[0].message)
        
        //checks user uniqueness
        const emailExist = await User.findOne({email: req.body.email})
        if (emailExist) return res.status(400).json("Email already exists")

        //Hashes Password
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        //creates new user
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            bios: req.body.bios
        })
        
        //Saves user
        user.save()

        //Sends token
        const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET)
        res.header("auth-token", token).json(token)
    } catch(err){
        res.status(400).json(err)
    }
})

//Login as user in DB
router.post("/login", async (req, res) => {
    
    //validates the user data
    const {error} = loginValidation(req.body)
    if(error) return res.status(400).json(error.details[0].message)
    
    //checks if user exists
    const user = await User.findOne({email: req.body.email})
    if (!user) return res.status(400).json("Email doesn't exist")

    //Authenticates Password
    const authPass = await bcrypt.compare(req.body.password, user.password)
    if(!authPass) return res.status(400).json("Invalid Password")

    //Sends token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET)
    res.header("auth-token", token).json(token)
})

//Gets user infos
router.get("/infos", verify, async (req, res) => {
    try{
        
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
    } catch(err){
        res.status(400).json(err)
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
        res.status(400).json(err)
    }
})

//Get user myChat
router.get("/myChat", verify, async (req, res) => {
    try{
        //Gets user
        const user = await User.findById(req.user)

        //Gets myChat
        const userChat = user.myChat

        //Sends json
        res.json(userChat)
    } catch(err){
        res.status(400).json(err)
    }
})

//Gets user myInvites
router.get("/myInvites", verify, async (req, res) => {
    try{
        //Gets user
        const user = await User.findById(req.user)

        //Gets myInvites
        const userInvites = user.myInvites

        //Sends json
        res.json(userInvites)
    } catch(err){
        res.status(400).json(err)
    }
})

//Patches username
router.patch("/username", verify, async (req, res) => {
    try{
        //Gets user
        const user = await User.findById(req.user)

        //Updates username
        user.username = req.body.username

        //Saves changes and sends message
        user.save()
        res.json("Updated")
    } catch(err){
        res.status(400).json(err)
    }
})

//Patches bios
router.patch("/bios", verify, async (req, res) => {
    try{
        //Gets user
        const user = await User.findById(req.user)

        //Updates bios
        user.bios = req.body.bios

        //Saves changes and sends message
        user.save()
        res.json("Updated")
    } catch(err){
        res.status(400).json(err)
    }
})

//Patches email
router.patch("/email", verify, async (req, res) => {
    try{
        //Gets user
        const user = await User.findById(req.user)
        const emailExist = await User.findOne({email: req.body.email})

        //Checks if email is not in use and updates it
        if(emailExist === null){
            user.email = req.body.email   
        }

        //Saves changes and sends message
        user.save()
        res.json("Updated")
    } catch(err){
        res.status(400).json(err)
    }
})

//Patches password
router.patch("/password", verify, async (req, res) => {
    try{
        //Gets user
        const user = await User.findById(req.user)

        //Hash Password
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        //Updates password
        user.password = hashedPassword

        //Saves changes and sends message
        user.save()
        res.json("Updated")
    } catch(err){
        res.status(400).json(err)
    }
})

//Deletes user
router.delete("/user", verify, async (req, res) => {
    try{
        //Gets user
        const user = await User.findById(req.user)

        //Saves changes and sends message
        user.remove()
        res.json("Removed")
    } catch(err){
        res.status(400).json(err)
    }
})

module.exports = router