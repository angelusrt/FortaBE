const router = require("express").Router()
const verify = require("./verifyToken")
const User = require("../models/User")
const Forum = require("../models/Forum")
const Invite = require("../models/Invite")


//Get invite
router.get("/:inviteId", async(req, res) => {
    try{
        const invite = await Invite.findById(req.params.inviteId)
        res.json(invite)
    } catch(err){
        res.status(400).json({ message: err })
    }
})

//Delete invite
router.delete("/:inviteId", verify, async (req, res) => {
    try {    
        const removedInvite = await Invite.remove({_id: req.params.inviteId})
        res.json(removedInvite)
    } catch (err) {
        res.status(400).json({ message: err })
    }
})


//Submits a invite
router.post("/", verify, (req, res) => {

    const invite = new Invite({
        sender: req.body.sender,
        receiver: req.body.receiver,
        description: req.body.description
    })
    
    User.findById({_id: req.receiver}).updateOne(
        { _id: invite.id }, 
        { $set: { myInvites: invite.id } }
    )

    invite.save().then( data => {
        res.json(data)
    }).catch( err => {
        res.status(400).json({ message: err })
    })

    User.save().then( data => {
        res.json(data)
    }).catch( err => {
        res.status(400).json({ message: err })
    })

    //User.findById({_id: req.user})
})

module.exports = router