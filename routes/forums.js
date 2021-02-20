const router = require("express").Router()
const mongoose = require("mongoose")

const verify = require("./verifyToken")
const { createInvites } = require("./invites")
 
const Forum = require("../models/Forum")
const Post = require("../models/Post")
const Comentaries = require("../models/Comentaries")

//Submits a forum ✓
router.post("/", verify, (req, res) => {
    //Creates the forum
    const forum = new Forum({
        groupName: req.body.groupName,
        bios: req.body.bios,
        tags: req.body.tags,
        owner: req.user
    })

    //Saves it
    forum.save()
    .then( data => {
        res.json(data)
    }).catch( err => {
        res.status(400).send(err)
    })
})

//Gets forum ✓
router.get("/:forumId", async(req, res) => {
    try{
        //Gets the forum
        const forum = await Forum.findById(req.params.forumId)

        //Sends it
        res.json(forum)
    } catch(err){
        res.status(400).send(err)
    }
})

//Updates a forum ✓
router.patch("/:forumId", verify, async (req, res) => {
    try {    
        //Gets the forum
        const forum = await Forum.findById(req.params.forumId)

        //Verify Permission
        if(req.user !== forum.owner.toString())
            return res.status(401).send("Action denied, you don't have permission")

        //Updates it 
        forum.groupName = req.body.groupName || forum.groupName
        forum.bios = req.body.bios || forum.bios
        forum.tags = req.body.tags || forum.tags

        //Saves and sends
        forum.save()
        res.send("Updated")
    } catch (err) {
        res.status(400).sends(err)
    }
})

//Add Mods to a forum ✓
router.patch("/:forumId/mods", verify, async (req, res) => {
    try {    
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)
        
        //Verify permission
        if(req.user !== forum.owner.toString())
            return res.status(401).send("Action denied, you don't have permission")

        //Updates the mod collection
        forum.mods.push(...req.body.mods.map( item => { return { mod: item.mod, stats: false } } ))

        //Makes the invice and sends it
        for (let i = 0; i < req.body.mods.length; i++) {
            createInvites(req.user, req.body.mods[i].mod, "mod", req.params.forumId)   
        }

        //Saves and sends
        forum.save()
        res.json("Added one or various mods")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Remove Mods to a forum ✓
router.delete("/:forumId/mods", verify, async (req, res) => {
    try { 
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)

        //Verify permission
        if((req.user !== forum.owner.toString()) ||
            req.body.mods.length === 1 && 
            req.body.mods[0].mod === req.user 
        )
            return res.status(401).send("Action denied, you don't have permission")

        //Updates the mod collection
        forum.mods = [
            ...forum.mods.filter(item => {
                for (let i = 0; i < req.body.mods.length; i++) {
                    item.mod.toString() !== req.body.mods[i].mod
                }
            })
        ]
        
        //Saves and sends
        forum.save()
        res.send("One or several were deleted")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Follows a forum ✓
router.patch("/:forumId/follow", verify, async (req, res) => {
    try {    
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)
        
        //Updates followers
        forum.followers.push(req.user)

        //Saves and sends
        forum.save()
        res.send("You followed")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Unfollows a forum ✓
router.delete("/:forumId/follow", verify, async (req, res) => {    
    try {    
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)

        //Removes it 
        forum.followers = [
            ...forum.followers.filter(item => item.toString() !== req.user)
        ]

        //Saves it and sends
        forum.save()
        res.send("Removed sucessfully")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Deletes forum ✓
router.delete("/:forumId",verify, async (req, res) => {
    try {        
        //Gets forum
        const forum = await Forum.findById(req.params.forumId)
 
        //Verifies permission
        if(req.user !== forum.owner.toString())
            return res.status(401).send("Action denied, you don't have permission")

        //Removes it
        forum.remove()

        //Sends 
        res.send("It was deleted")
    } catch (err) {
        res.status(400).send(err)
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
        res.json(post)
    } catch (err) {
        res.status(400).send(err)
    }
})

//Gets post ✓
router.get("/:forumId/posts/:postId", async(req, res) => {
    try{
        //Gets post
        const forum = await Forum.findById(req.params.forumId)
        const post = await forum.posts.id(req.params.postId)

        //Sends it
        res.json(post)
    } catch(err){
        res.status(400).send(err)
    }
})

//Update a post ✓
router.patch("/:forumId/posts/:postId", verify, async (req, res) => {
    try {    
        //Gets post
        const forum = await Forum.findById(req.params.forumId)
        const post = await forum.posts.id(req.params.postId)

        //User permission
        if(req.user !== post.author.toString())
            return res.status(401).send("Action denied, you don't have permission")        

        //Updates it
        post.title = req.body.title || post.title
        post.bodyText = req.body.bodyText || post.bodyText
        
        //Saves it and sends message
        forum.save()
        res.send("Updated")
    } catch (err) {
        res.status(400).send(err)
    }
})

//Delete post ✓
router.delete("/:forumId/posts/:postId", verify, async (req, res) => {
    try {    

        //User permission
        const forum = await Forum.findById(req.params.forumId)
        const post = await forum.posts.id(req.params.postId)

        if(req.user !== 
            (
                post.author.toString() ||
                forum.owner.toString() || 
                forum.mods.map(item => item.mod.toString())
            )
        )
            return res.status(401).send("Action denied, you don't have permission")

        //Removes it
        post.remove()

        //Saves it and sends a message
        forum.save()
        res.send("Removed")
    } catch (err) {
        res.status(400).send(err)
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
        res.status(400).send(err)
    }
})

//Get comentary ✓
router.get("/:forumId/posts/:postId/comentaries/:comentaryId", async(req, res) => {
    try{
        //Gets comentary
        const forum = await Forum.findById(req.params.forumId)
        const post = forum.posts.id(req.params.postId) 
        const comentary = post.comentaries.id(req.params.comentaryId)
        
        //Sends it
        res.json(comentary)
    } catch(err){
        res.status(400).send(err)
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
            return res.status(401).send("Action denied, you don't have permission")        

        //Updates text
        comentary.bodyText = req.body.bodyText

        //Saves and sends
        forum.save()
        res.json(comentary)
    } catch (err) {
        res.status(400).send(err)
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
        if(req.user !== 
            (
                comentary.author.toString() || 
                forum.owner.toString() || 
                forum.mods.map(item => item.mod.toString())
            )
        )
            return res.status(401).send("Action denied, you don't have permission")

        //Removes comentary
        comentary.remove()

        //Saves and sends
        forum.save()
        res.send("Deleted")
    } catch (err) {
        res.status(400).send(err)
    }
})



module.exports = router