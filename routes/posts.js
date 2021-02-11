const router = require("express").Router()
const User = require("../models/User")
const verify = require("./verifyToken")

router.post("/", verify, (req, res) => {
    res.send(req.user)
    //User.findById({_id: req.user})
})

module.exports = router