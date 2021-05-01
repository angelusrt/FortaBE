const router = require("express").Router()

const verify = require("./verifyToken")

const User = require("../models/User")
const Invite = require("../models/Invite")

//Creates invites and sends it 
async function createInvites(sender, receiver, description, path){
    try {
        //Gets users
        const userSender = await User.findById(sender)
        const userReceiver = await User.findById(receiver)

        //Create invite
        const invite = new Invite({
            sender,
            receiver,
            description,
            path
        })

        //Sends invite
        userSender.myInvites.push(invite.id)
        userReceiver.myInvites.push(invite.id)

        //Saves invite
        invite.save()
        userReceiver.save()
        userSender.save()

    } catch (err) {
        return err
    }
}

//Gets invite
router.get("/:inviteId", verify, async(req, res) => {
    try{
        //Gets invite
        const invite = await Invite.findById(req.params.inviteId)
        
        //Sends it
        res.json(invite)
    } catch(err){
        res.status(400).send(err)
    }
})

//Delete invite
router.delete("/:inviteId", verify, async (req, res) => {
    try {    
        //Gets invite
        const invite = await Invite.findById(req.params.inviteId)
        
        //Verify permission
        if(req.user !== (invite.sender.toString() && invite.receiver.toString()))
            return res.status(401).send("Action denied, you don't have permission")

        //Gets users
        const userSender = await User.findById(invite.sender)
        const userReceiver = await User.findById(invite.receiver)

        //Removes it 
        userSender.myInvites = [
            ...userSender.myInvites.filter(item => item === req.params.inviteId)
        ]
        userReceiver.myInvites = [
            ...userReceiver.myInvites.filter(item => item === req.params.inviteId)
        ]
        invite.remove()
        
        //Saves and Sends message
        userSender.save()
        userReceiver.save()
        invite.save()
        res.send("Deleted sucessfully")
    } catch (err) {
        res.status(400).send(err)
    }
})

module.exports = router
module.exports.createInvites = createInvites