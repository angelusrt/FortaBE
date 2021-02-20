const router = require("express").Router()

const verify = require("./verifyToken")
const { createInvites } = require("./invites")

const Group = require("../models/Group")

//Creates Group
router.post("/", verify, (req, res) => {
    try {
        //Creates group
        const group = new Group({
            groupName: req.body.groupName,
            bios: req.body.bios,
            members: [
                {
                    member: req.User,
                    stats: "nU"
                },
                ...req.body.users.map(item => {return {
                    member: item.user,
                    stats: "pendent"
                }})
            ]
        })

        //Creates invite and sends it
        createInvites(req.user, req.body.user, "Group", group.id)

        //Saves it and sends message
        group.save()
        res.send("Invited")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Gets Group
router.get("/:groupId", verify, async (req, res) => {
    try {
        //Gets group
        const group = await Group.findById(req.params.groupId)

        //verify permission
        if(req.user !== group.members.map(user => user.member.toString()))
            return res.status(401).send("Action denied, you don't have permission")
        
        //Sends it    
        res.json(group)
    } catch (err) {
        res.status(400).send(err)
    }
})

//update Group
router.patch("/:groupId", verify, async (req, res) => {
    try {
        //Gets group
        const group = await Group.findById(req.params.groupId)
        const groupUser = group.members.filter(user => user.member.toString() !== req.user)
    
        //verify permission
        if(req.user !== groupUser.member.toString() &&
            groupUser.stats !== "sU"
        )
            return res.status(401).send("Action denied, you don't have permission")
        
        //Update permission
        group.groupName = req.body.groupName || group.groupName,
        group.bios = req.body.bios || group.bios
        //group.members

        //Saves and sends message
        group.save()    
        res.send("Updated")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Up your stats
router.patch("/:groupId/pendent", verify, async (req, res) => {
    try {
        //Gets group
        const group = await Group.findById(req.params.groupId)
        const groupUser = group.members.filter(user => user.member.toString() !== req.user)
    
        //verify permission
        if(req.user !== groupUser.member.toString() &&
            groupUser.stats !== "pendent"
        )
            return res.status(401).send("Action denied, you don't have permission")
        
        //Update permission
        groupUser.stats = "nU"

        //Saves and sends message
        group.save()    
        res.send("Updated")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Remove yourself
router.delete("/:groupId/pendent", verify, async (req, res) => {
    try {
        //Gets group
        const group = await Group.findById(req.params.groupId)
        const groupUser = group.members.filter(user => user.member.toString() !== req.user)
    
        //verify permission
        if(req.user !== groupUser.member.toString() &&
            groupUser.stats !== "pendent"
        )
            return res.status(401).send("Action denied, you don't have permission")
        
        //Update permission
        group.members = [
            ...group.members.filter(user => user.member.toString !== req.user)
        ]

        //Saves and sends message
        group.save()    
        res.send("Updated")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Add users
router.patch("/:groupId/members", verify, async (req, res) => {
    try {
        //Gets group
        const group = await Group.findById(req.params.groupId)
        const groupUser = group.members.filter(user => user.member.toString() !== req.user)
    
        //verify permission
        if(req.user !== groupUser.member.toString() &&
            groupUser.stats !== "sU"
        )
            return res.status(401).send("Action denied, you don't have permission")
        
        req.body.members.map(mem => {
            //creates member
            const member = {
                member: mem,
                stats: pendent
            }

            //Update permission
            group.members.push(member)
        })

        //Saves and sends message
        group.save()    
        res.send("Added")
    } catch (err) {
        res.status(400).send(err)
    }
})

//remove users
router.patch("/:groupId/members", verify, async (req, res) => {
    try {
        //Gets group
        const group = await Group.findById(req.params.groupId)
        const groupUser = group.members.filter(user => user.member.toString() !== req.user)
    
        //verify permission
        if(req.user !== groupUser.member.toString() &&
            groupUser.stats !== "sU"
        )
            return res.status(401).send("Action denied, you don't have permission")
        
        //Update permission
        group.members = [
            ...group.members.filter(user => {
                user.member.toString() !== req.body.members.map(mem => mem)
            })
        ]

        //Saves and sends message
        group.save()    
        res.send("Removed")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Sends message
router.post("/:groupId/messages", verify, async (req, res) => {
    try {
        //Gets group
        const group = await Group.findById(req.params.groupId)
        const groupUser = group.members.filter(user => user.member.toString() !== req.user)

        //verify permission
        if(req.user !== groupUser.member.toString())
            return res.status(401).send("Action denied, you don't have permission") 

        //Create message
        const message = {
            message: req.body.message,
            author: req.user
        }

        //Push message
        group.messages.push(message)

        //Saves it and sends it
        group.save()
        res.send("Sent")
    } catch (err) {
        res.status(400).send(err)
    }
})
 
//Updates message
router.patch("/:groupId/messages/:messageId", verify, async (req, res) => {
    try {
        //Gets group
        const group = await Group.findById(req.params.groupId)
        const groupUser = group.members.filter(user => user.member.toString() !== req.user)
        const message = group.messages.id(req.params.messageId)

        //verify permission
        if(req.user !== groupUser.member.toString())
            return res.status(401).send("Action denied, you don't have permission") 

        //Updates message
        message.message = req.body.message

        //Saves it and sends it
        group.save()
        res.send("Updated")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Deletes message
router.delete("/:groupId/messages/:messageId", verify, async (req, res) => {
    try {
        //Gets group
        const group = await Group.findById(req.params.groupId)
        const groupUser = group.members.filter(user => user.member.toString() !== req.user)

        //verify permission
        if(req.user !== groupUser.member.toString())
            return res.status(401).send("Action denied, you don't have permission") 

        //Updates message
        group.messages = [
            ...group.messages.filter(item => item._id.toString() !== req.params.messageId)
        ]

        //Saves it and sends it
        group.save()
        res.send("Deleted")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Deletes group
router.delete("/", verify, (req, res) => {
    try {
        //Gets group
        const group = await Group.findById(req.params.groupId)
        const groupUser = group.members.filter(user => user.member.toString() !== req.user)

        //verify permission
        if(req.user !== groupUser.member.toString())
            return res.status(401).send("Action denied, you don't have permission") 

        //Updates message
        group.remove()

        //Saves it and sends it
        group.save()
        res.send("Removed")
    } catch (err) {
        res.status(400).send(err)
    }
})
