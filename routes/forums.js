const router = require("express").Router()
const mongoose = require("mongoose")

const verify = require("./verifyToken")
const { createInvites } = require("./invites")
 
const Forum = require("../models/Forum")
const Post = require("../models/Post")
const Comentaries = require("../models/Comentaries")
const User = require("../models/User")

//Gets forums that maches name ✓
router.get("/find/:groupName", async(req, res) => {
    try{
        //Gets the forum
        const forum = await Forum.find({groupName: { '$regex': req.params.groupName, '$options': 'i' }})
        console.log(forum)
        //Sends its
        res.json(forum)
    } catch(err){
        res.status(400).json(err)
    }
})

//Submits forum ✓
router.post("/", verify, async (req, res) => {
    try {
        const user = await User.findById(req.user)

        //Creates the forum
        const forum = new Forum({
            groupName: req.body.groupName,
            bios: req.body.bios,
            tags: req.body.tags,
            owner: req.user
        })

        //Pushes into owner forum list
        user.myForums.push(forum._id)

        //Saves it
        forum.save()
        user.save()

        //Sends id
        res.json(forum._id)
    } catch (err) {
        res.status(400).json(err)
    }
})

//Gets forum ✓
router.get("/:forumId", async(req, res) => {
    try{
        //Gets the forum
        const forum = await Forum.findById(req.params.forumId)

        //Sends it
        res.json(forum)
    } catch(err){
        res.status(400).json(err)
    }
})

//Updates forum ✓
router.patch("/:forumId", verify, async (req, res) => {
    try {    
        //Gets the forum
        const forum = await Forum.findById(req.params.forumId)

        //Verify Permission
        if(req.user !== forum.owner.toString())
            return res.status(401).json("Action denied, you don't have permission")

        //Updates it 
        forum.groupName = req.body.groupName || forum.groupName
        forum.bios = req.body.bios || forum.bios
        forum.tags = req.body.tags || forum.tags

        //Saves and sends
        forum.save()
        res.json("Updated")
    } catch (err) {
        res.status(400).sends(err)
    }
})

//Gets rules 
router.get("/:forumId/rules", async(req, res) => {
    try{
        //Gets the rules
        const forum = await Forum.findById(req.params.forumId)

        //Sends it
        res.json({rules: forum.rules, owner: forum.owner})
    } catch(err){
        res.status(400).json(err)
    }
})

//Updates rules 
router.patch("/:forumId/rules", verify, async (req, res) => {
    try {    
        //Gets the forum
        const forum = await Forum.findById(req.params.forumId)

        //Verify Permission
        if(req.user !== forum.owner.toString())
            return res.status(401).json("Action denied, you don't have permission")

        //Updates rules
        forum.rules = req.body.rules

        //Saves and sends
        forum.save()
        res.json("Updated")
    } catch (err) {
        res.status(400).sends(err)
    }
})

//Add mod to forum ✓
router.post("/:forumId/mods", verify, async (req, res) => {
    try {    
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)
        
        //Verify permission
        if(req.user !== forum.owner.toString())
            return res.status(401).json("Action denied, you don't have permission")

        //Updates the mod collection
        forum.mods.push({ mod: req.body.mods[0].mod, stats: false })

        //antique method
        //forum.mods.push(...req.body.mods.map( item => { return { mod: item.mod, stats: false } } ))

        //Makes the invite and sends it
        createInvites(req.user, req.body.mods[0].mod, "mod", req.params.forumId)

        //antique method
        // for (let i = 0; i < req.body.mods.length; i++) {
        //     createInvites(req.user, req.body.mods[i].mod, "mod", req.params.forumId)   
        // }

        //Saves and sends
        forum.save()
        res.json("Updated")
    } catch (err) {
        res.status(400).json(err)
    }
})

//Updates mod status ✓
router.patch("/:forumId/mods", verify, async (req, res) => {
    try {    
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)
        const mod = await forum.mods.findOne({mod: req.user})

        //Updates the mod collection
        mod.stats = true
        
        //Saves and sends
        forum.save()
        res.json("Updated")
    } catch (err) {
        res.status(400).json(err)
    }
})

//Removes mod from a forum ✓
router.delete("/:forumId/mods", verify, async (req, res) => {
    try { 
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)

        //Verify permission
        if((req.user !== forum.owner.toString()) ||
            req.body.mods.length === 1 && 
            req.body.mods[0].mod === req.user 
        )
            return res.status(401).json("Action denied, you don't have permission")
        
        //Updates the mod collection
        forum.mods = [
            ...forum.mods.filter(item => {
                // for (let i = 0; i < req.body.mods.length; i++) {
                //     item.mod.toString() !== req.body.mods[i].mod
                // }
                item.mod.toString() !== req.body.mods[0].mod
            })
        ]
        
        //Saves and sends
        forum.save()
        res.json("Removed")
    } catch (err) {
        res.status(400).json(err)
    }
})

//Gets flags info  
router.get("/:forumId/flags", async(req, res) => {
    try{
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)

        //creates flags object to send
        const flags = {
            flags: [
                ...forum.flags.map(flag => { return {
                    isItPost: flag.isItPost,
                    post: flag.post,
                    comentaries: flag.isItPost ? "" : flag.comentaries 
                }})
            ], 
            owner: forum.owner, 
            mods: forum.mods
        }

        //Sends flags
        res.json(flags)
    } catch(err){
        res.status(400).json(err)
    }
})

//Gets flags flag  
router.get("/:forumId/flags/:postId", async(req, res) => {
    try{
        //Gets forum and flags
        const forum = await Forum.findById(req.params.forumId)
        const flags = forum.flags.find(flag => (
            flag.isItPost === true && flag.post == req.params.postId
        ))
        console.log(flags)
        //creates flags object to send
        const flag = {
            flags: flags.flags, 
            owner: forum.owner, 
            mods: forum.mods
        }

        //Sends flags
        res.json(flag)
    } catch(err){
        res.status(400).json(err)
    }
})

//Gets flags flag  
router.get("/:forumId/flags/:postId/:comentaryId", async(req, res) => {
    try{
        //Gets forum and flags
        const forum = await Forum.findById(req.params.forumId)
        const flags = forum.flags.find(flag => {
            return flag.isItPost === false && flag.post == req.params.postId &&
            flag.comentaries == req.params.comentaryId
        })

        //creates flags object to send
        const flag = {
            flags: flags.flags, 
            owner: forum.owner, 
            mods: forum.mods
        }

        //Sends flags
        res.json(flag)
    } catch(err){
        res.status(400).json(err)
    }
})

//Posts flag 
router.post("/:forumId/flags", verify, async (req, res) => {
    try {    
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)

        //Creates flag
        const flag = {
            sender: req.user,
            message: req.body.message
        }
        
        //Gets flags
        let flags, flagInfo
        
        if(req.body.isItPost) {            
            flags = forum.flags.find(flag => {
                return flag.isItPost === req.body.isItPost && flag.post == req.body.post
            })
            
            //Creates flags info
            flagInfo = {
                isItPost: req.body.isItPost,
                post: req.body.post,
                flags: [flag]
            }
        } else {
            flags = forum.flags.find(flag => {
                return flag.isItPost === req.body.isItPost && flag.post == req.body.post &&
                flag.comentaries == req.body.comentaries
            })

            //Creates flags info
            flagInfo = {
                isItPost: req.body.isItPost,
                post: req.body.post,
                comentaries: req.body.comentaries,
                flags: [flag]
            }
        }

        //Posts flag info
        flags == null ? forum.flags.push(flagInfo) : flags.flags.push(flag)
        
        //Saves and sends
        forum.save()
        res.json("Updated")
    } catch (err) {
        res.status(400).json(err)
    }
})

//Gets if already flagged
router.get("/:forumId/flags/verify", verify, async(req, res) => {
    try{
        //Gets forum and flag
        const forum = await Forum.findById(req.params.forumId)

        //Gets dynamically flags
        let flags
        
        req.body.isItPost ?
        flags = forum.flags.find(flag => {
            return flag.isItPost === req.body.isItPost && flag.post == req.body.post
        }) :
        flags = forum.flags.find(flag => {
            return flag.isItPost === req.body.isItPost && flag.post == req.body.post &&
            flag.comentaries == req.body.comentaries
        })

        //Gets flags object
        const flag = flags.flags.find(flag => flag.sender.toString() === req.user)
        console.log(flag)
        //Sends is it is available
        res.json(flag == null ? "Available" : "Flagged")
    } catch(err){
        res.status(400).json(err)
    }
})

//Patches flag 
router.patch("/:forumId/flags", verify, async (req, res) => {
    try {    
        //Gets the forum
        const forum = await Forum.findById(req.params.forumId)

        //Gets dynamically flags
        let flags

        req.body.isItPost ?
        flags = forum.flags.find(flag => {
            return flag.isItPost === req.body.isItPost && flag.post == req.body.post
        }) :
        flags = forum.flags.find(flag => {
            return flag.isItPost === req.body.isItPost && flag.post == req.body.post &&
            flag.comentaries == req.body.comentaries
        })

        //Gets flags object
        const flag = flags.flags.find(flag => flag.sender.toString() === req.user)
        
        //Updates flag
        flag.message = req.body.message

        //Saves and sends
        forum.save()
        res.json("Updated")
    } catch (err) {
        res.status(400).sends(err)
    }
})

//Deletes flag 
router.delete("/:forumId/flags/:isItPost/:post/:comentary/:sender", verify, async (req, res) => {
    try {
        //Gets the forum
        const forum = await Forum.findById(req.params.forumId)
        
        //Gets dynamically flags
        let flags, flag
        
        req.params.isItPost === "true" ?
        flags = forum.flags.find(flag => (
            flag.isItPost.toString() === req.params.isItPost && 
            flag.post.toString() === req.params.post
        )) :
        flags = forum.flags.find(flag => (
            flag.isItPost.toString() === req.params.isItPost && 
            flag.post.toString() === req.params.post &&
            flag.comentaries.toString() === req.params.comentary
        ))
        
        //Gets flags object
        req.params.sender === "0" ? 
        flag = flags.flags.find(flag => flag.sender.toString() === req.user) :
        flag = flags.flags.find(flag => flag.sender.toString() === req.params.sender)
        
        
        //Verify permission
        if( req.user !== forum.owner.toString() && 
            req.user !== forum.mods.map(item => item.mod.toString()) &&
            req.user !== flag.sender.toString()
        )
            return res.status(401).json("Action denied, you don't have permission")
        
        //Removes flag
        flag.remove()
        flags.flags = [
            ...flags.flags.filter(flag => flag.sender.toString() !== req.user)
        ]
        
        //Deletes the flag info if flag is the final one
        if(flags.flags.length === 0){
            if(req.params.isItPost.toString() === "true") {
                forum.flags = [
                    ...forum.flags.filter(flag => (
                        flag.isItPost !== req.params.isItPost && 
                        flag.post != req.params.post 
                    ))
                ]
            } else {
                forum.flags = [
                    ...forum.flags.filter(flag => (
                        flag.isItPost !== req.params.isItPost && 
                        flag.post != req.params.post &&
                        flag.comentaries != req.params.comentary 
                    ))
                ]
            }
        }
        
        //Saves and sends
        forum.save()
        res.json("Removed")
    } catch (err) {
        res.status(400).json(err)
    }
})

//Follows a forum ✓
router.patch("/:forumId/follow", verify, async (req, res) => {
    try {    
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)
        const user = await User.findById(req.user)
        
        //Updates followers
        forum.followers.push(req.user)
        user.myForums.push(forum._id)
        
        //Saves and sends
        forum.save()
        user.save()
        res.json("Followed")
    } catch (err) {
        res.status(400).json(err)
    }
})

//Unfollows a forum ✓
router.delete("/:forumId/follow", verify, async (req, res) => {    
    try {    
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)
        const user = await User.findById(req.user)

        //Removes it 
        forum.followers = [
            ...forum.followers.filter(item => item.toString() !== req.user)
        ]
        user.myForums = [
            ...user.myForums.filter(item => item.toString() !== req.params.forumId)
        ]

        //Saves it and sends
        forum.save()
        user.save()
        res.json("Removed")
        console.log(user.myForums)
    } catch (err) {
        res.status(400).json(err)
    }
})

//Deletes forum ✓
router.delete("/:forumId",verify, async (req, res) => {
    try {        
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)
 
        //Verifies permission
        if(req.user !== forum.owner.toString())
            return res.status(401).json("Action denied, you don't have permission")

        for (let i = 0; i < forum.followers.length; i++) {
            //finds followers
            const user = await User.findById(forum.followers[i])

            //Removes it from users list
            user.myForums = [
                ...user.myForums.filter(item => item.toString() !== req.params.forumId)
            ]
            
            //Saves it
            user.save()
        }

        //Removes it from owner user
        const user = await User.findById(forum.owner)
        user.myForums = [
            ...user.myForums.filter(item => item.toString() !== req.params.forumId)
        ]

        //Removes it
        forum.remove()

        //Saves it
        user.save()

        //Sends 
        res.json("Removed")
    } catch (err) {
        res.status(400).json(err)
    }
})

//Submits a post ✓
router.post("/:forumId/posts/", verify, async (req, res) => {
    try {
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)
    
        //Creates post
        const post = new Post({
            title: req.body.title,
            bodyText: req.body.bodyText,
            author: req.user,
            forum: req.params.forumId
        })

        //Saves it and sends it
        forum.posts.push(post)
        forum.save()
        res.json(post._id)
    } catch (err) {
        res.status(400).json(err)
    }
})

//Gets post ✓
router.get("/:forumId/posts/:postId", async(req, res) => {
    try{
        //Gets post
        const forum = await Forum.findById(req.params.forumId)
        const post = await forum.posts.id(req.params.postId)


        //creates object to send
        const obj = {
            owner: forum.owner,
            mods: forum.mods,
            post: post
        }

        //Sends it
        res.json(obj)
    } catch(err){
        res.status(400).json(err)
    }
})

//Updates post ✓
router.patch("/:forumId/posts/:postId", verify, async (req, res) => {
    try {    
        //Gets post
        const forum = await Forum.findById(req.params.forumId)
        const post = await forum.posts.id(req.params.postId)

        //User permission
        if(req.user !== post.author.toString())
            return res.status(401).json("Action denied, you don't have permission")        

        //Updates it
        post.title = req.body.title || post.title
        post.bodyText = req.body.bodyText || post.bodyText
        
        //Saves it and sends message
        forum.save()
        res.json("Updated")
    } catch (err) {
        res.status(400).json(err)
    }
})

//Deletes post ✓
router.delete("/:forumId/posts/:postId", verify, async (req, res) => {
    try {    

        //User permission
        const forum = await Forum.findById(req.params.forumId)
        const post = await forum.posts.id(req.params.postId)

        if ( 
            req.user !== post.author.toString() &&
            req.user !== forum.owner.toString() && 
            req.user !== forum.mods.map(item => item.mod.toString())
        )
            return res.status(401).json("Action denied, you don't have permission")

        //Removes flags
        forum.flags = [
            ...forum.flags.filter(flag => (
                flag.post.toString() !== req.params.postId
            ))
        ]

        //Removes it
        post.remove()

        //Saves it and sends a message
        forum.save()
        res.json("Removed")
    } catch (err) {
        res.status(400).json(err)
    }
})

//Submits a comentary ✓
router.post("/:forumId/posts/:postId/", verify, async (req, res) => {
    try {
        //Gets the post
        const forum = await Forum.findById(req.params.forumId)    
        const post = forum.posts.id(req.params.postId)

        //Creates the comentary
        const comentary = new Comentaries({
            bodyText: req.body.bodyText,
            author: req.user,
            forum: req.params.forumId
        })

        //Saves it and sends it
        post.comentaries.push(comentary)
        forum.save()
        res.json(comentary)
    } catch (err) {
        res.status(400).json(err)
    }
})

//Gets comentary ✓
router.get("/:forumId/posts/:postId/comentaries/:comentaryId", async(req, res) => {
    try{
        //Gets comentary
        const forum = await Forum.findById(req.params.forumId)
        const post = forum.posts.id(req.params.postId) 
        const comentary = post.comentaries.id(req.params.comentaryId)
        
        //Creates object to send
        const obj = {
            owner: forum.owner,
            mods: forum.mods,
            comentary: comentary
        }

        //Sends it
        res.json(obj)
    } catch(err){
        res.status(400).json(err)
    }
})

//Updates a comentary ✓ 
router.patch("/:forumId/posts/:postId/comentaries/:comentaryId", verify, async (req, res) => {
    try {    
        //Gets comentary
        const forum = await Forum.findById(req.params.forumId)
        const post = forum.posts.id(req.params.postId) 
        const comentary = post.comentaries.id(req.params.comentaryId)

        //User permission
        if(req.user !== comentary.author.toString())
            return res.status(401).json("Action denied, you don't have permission")        

        //Updates text
        comentary.bodyText = req.body.bodyText

        //Saves and sends
        forum.save()
        res.json(comentary)
    } catch (err) {
        res.status(400).json(err)
    }
})

//Deletes comentary ✓
router.delete("/:forumId/posts/:postId/comentaries/:comentaryId", verify, async (req, res) => {
    try {  
        //Gets comentary
        const forum = await Forum.findById(req.params.forumId)
        const post = forum.posts.id(req.params.postId) 
        const comentary = post.comentaries.id(req.params.comentaryId)
        
        //User permission
        if (
            req.user !== comentary.author.toString() &&
            req.user !== forum.owner.toString() &&
            req.user !== forum.mods.map(item => item.mod.toString())
        )
            return res.status(401).json("Action denied, you don't have permission")

        //Removes flags
        forum.flags = [
            ...forum.flags.filter(flag => (
                flag.isItPost !== false &&
                (
                    flag.isItPost === false &&
                    flag.comentaries.toString() !== req.params.comentaryId
                ) 
            ))
        ]

        //Removes comentary
        comentary.remove()

        //Saves and sends
        forum.save()
        res.json("Deleted")
    } catch (err) {
        res.status(400).json(err)
    }
})

module.exports = router