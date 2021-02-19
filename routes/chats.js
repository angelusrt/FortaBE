const router = require("express").Router()

const verify = require("./verifyToken")
const { createInvites } = require("./invites")

const User = require("../models/User")
const Chat = require("../models/Chat")

//Creates Chat
router.post("/", verify, (req, res) => {
    //Creates invite
    //Saves it and sends message
})

//Gets Chat
router.get("/", verify, (req, res) => {
    //Gets Chat
    //Sends it    
})

//Delete Chat
router.delete("/", verify, (req, res) => {
    //Gets chat
    //Deletes it
    //Saves it and sends message
})
