const router = require("express").Router()

const verify = require("./verifyToken")
const { createInvites } = require("./invites")

const User = require("../models/User")
const Chat = require("../models/Chat")


//Gets users that mach name
router.get("/find/:username", async(req, res) => {
    try{
        //Gets the users
        const user = await User.find({username: { '$regex': req.params.username, '$options': 'i' }})
        const userFiltered = user.map(data => {
            return {username: data.username, bios: data.bios}    
        })
        console.log(userFiltered)

        //Sends its
        res.json(userFiltered)
    } catch(err){
        res.status(400).send(err)
    }
})

//Creates Chat
router.post("/", verify, async (req, res) => {
    try {
        const sender = await User.findById(req.user)
        const receiver = await User.findById(req.body.user)

        //Creates chat
        const chat = new Chat({
            members: [
                {
                    member: req.user,
                    stats: "nU"
                },
                {
                    member: req.body.user,
                    stats: "pendent"
                }
            ]
        })

        //Creates invite and sends it
        createInvites(req.user, req.body.user, "chat", chat.id)

        //Adds chat to sender
        sender.myChat.push(chat._id)
        receiver.myChat.push(chat._id)
        
        //Saves it and sends message
        chat.save()
        sender.save()
        receiver.save()
        res.send("Invited")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Gets Chat
router.get("/:chatId", verify, async (req, res) => {
    try {
        //Gets Chat
        const chat = await Chat.findById(req.params.chatId)

        //verify permission
        if(req.user !== chat.members.map(user => user.member.toString())
        .filter(user => user === req.user)[0])
            return res.status(401).send("Action denied, you don't have permission")

        //Sends it
        res.json(chat)
    } catch (err) {
        res.status(400).send(err)
    }
})

//updates chat
router.patch("/:chatId", verify, async (req, res) => {
    try {
        //Gets Chat
        const chat = await Chat.findById(req.params.chatId)
        const chatUser = chat.members.filter(user => user.member.toString() === req.user)
        
        //verify permission
        if( req.user !== chatUser[0].member.toString() && chatUser[0].stats !== "pendent" )
            return res.status(401).send("Action denied, you don't have permission")
        
        //Update permission
        chatUser[0].stats = "nU"

        //Saves and sends message
        chat.save()
        res.send("Updated")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Sends message
router.post("/:chatId/messages", verify, async (req, res) => {
    try {
        //Gets chat
        const chat = await Chat.findById(req.params.chatId)
        const chatUser = chat.members.filter(user => user.member.toString() === req.user)

        //verify permission
        if(req.user !== chatUser[0].member.toString())
            return res.status(401).send("Action denied, you don't have permission") 

        //Create message
        const message = {
            message: req.body.message,
            author: req.user
        }

        //Push message
        chat.messages.push(message)

        //Saves it and sends it
        chat.save()
        res.send("Sent")
    } catch (err) {
        res.status(400).send(err)
    }
})
 
//Updates message
router.patch("/:chatId/messages/:messageId", verify, async (req, res) => {
    try {
        //Gets chat
        const chat = await Chat.findById(req.params.chatId)
        const chatUser = chat.members.filter(user => user.member.toString() !== req.user)
        const message = chat.messages.id(req.params.messageId)

        //verify permission
        if(req.user !== chatUser.member.toString())
            return res.status(401).send("Action denied, you don't have permission") 

        //Updates message
        message.message = req.body.message

        //Saves it and sends it
        chat.save()
        res.send("Updated")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Deletes message
router.delete("/:chatId/messages/:messageId", verify, async (req, res) => {
    try {
        //Gets chat
        const chat = await Chat.findById(req.params.chatId)
        const chatUser = chat.members.filter(user => user.member.toString() !== req.user)

        //verify permission
        if(req.user !== chatUser.member.toString())
            return res.status(401).send("Action denied, you don't have permission") 

        //Updates message
        chat.messages = [
            ...chat.messages.filter(item => item._id.toString() !== req.params.messageId)
        ]

        //Saves it and sends it
        chat.save()
        res.send("Deleted")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Deletes Chat
router.delete("/", verify, async (req, res) => {
    try {
        //Gets chat
        const chat = await Chat.findById(req.params.chatId)
        const chatUser = chat.members.filter(user => user.member.toString() !== req.user)

        //verify permission
        if(req.user !== chatUser.member.toString())
            return res.status(401).send("Action denied, you don't have permission") 

        //Updates message
        chat.remove()

        //Saves it and sends it
        chat.save()
        res.send("Removed")
    } catch (err) {
        res.status(400).send(err)
    }
})

module.exports = router