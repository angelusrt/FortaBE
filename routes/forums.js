const router = require("express").Router()
const mongoose = require("mongoose")

const verify = require("./verifyToken")

const User = require("../models/User")
const Forum = require("../models/Forum")
const Post = require("../models/Post")
const Comentaries = require("../models/Comentaries")

//Submits a forum
router.post("/", verify, (req, res) => {

    const forum = new Forum({
        groupName: req.body.groupName,
        bios: req.body.bios,
        tags: req.body.tags,
        owner: req.user
    })

    forum.save().then( data => {
        res.json(data)
    }).catch( err => {
        res.status(400).send(err)
    })
    //User.findById({_id: req.user})
})

//Get forum
router.get("/:forumId", async(req, res) => {
    try{
        const forum = await Forum.findById(req.params.forumId)
        res.json(forum)
    } catch(err){
        res.status(400).send(err)
    }
})

//Update a forum 
router.patch("/:forumId", verify, async (req, res) => {
    try {    
        const forum = await Forum.findById(req.params.forumId)

        if(req.user !== forum.owner.toString())
            return res.status(401).send("Action denied, you don't have permission")

        const updatedForum = await Forum.updateOne(
            { _id: req.params.forumId }, 
            { 
                $set: { 
                    groupName: req.body.groupName || forum.groupName,
                    bios: req.body.bios || forum.bios,
                    tags: req.body.tags || forum.tags
                } 
            }
        )

        res.json(updatedForum)
    } catch (err) {
        res.status(400).sends(err)
    }
})

//Add Mods to a forum 
router.patch("/:forumId/mods", verify, async (req, res) => {
    
    //Verify permission
    const forum = await Forum.findById(req.params.forumId)
    if(req.user !== forum.owner.toString())
        return res.status(401).send("Action denied, you don't have permission")
    
    const forumMods = forum.mods

    //Verifiy if mods already were added in DB //needs a test

    // const numbOfModsAdded = req.body.mods.filter(item => console.log(forumMods.find({mod: item.mod})) )
    // if(numbOfModsAdded.length !== 0)
    //     return res.status(400).send("One or more mods already were added")
    
    try {    
        const updatedForumMods = await Forum.updateOne(
            { _id: req.params.forumId }, 
            { 
                $set: { 
                    mods: [
                        ...req.body.mods.map( item => { return { mod: item.mod, stats: false } } ),
                        ...forumMods
                    ]
                } 
            }
        )

        res.json(updatedForumMods)
    } catch (err) {
        res.status(400).send(err)
    }
})

//Remove Mods to a forum 
router.delete("/:forumId/mods", verify, async (req, res) => {
    //Verify permission
    const forum = await Forum.findById(req.params.forumId)
    if(req.user !== forum.owner.toString())
        return res.status(401).send("Action denied, you don't have permission")

    const forumMods = forum.mods
    //Verifiy if mods exists //needs a test    
    // if(req.body.mods.filter(mod => await (forumMods.findById(mod) === null)).length !== 0)
    //     return res.status(400).send("One or many mods already have been removed or didn't exist")
    
    try {    
        //Remove mods
        // const removedForumMods = req.body.mods.map( item => {
        //     return forumMods.find({mod: item.mod}).delete()
        // })
        
        const updatedForumMods = await Forum.updateOne(
            { _id: req.params.forumId }, 
            { 
                $set: { 
                    mods: [
                        ...forumMods.filter(item => {
                            for (let i = 0; i < req.body.mods.length; i++) {
                                item.mod.toString() !== req.body.mods[i].mod
                            }
                        })
                    ]
                } 
            }
        )

        res.json(updatedForumMods)
    } catch (err) {
        res.status(400).send(err)
    }
})

//Follow a forum
router.patch("/:forumId/follow", verify, async (req, res) => {
    
    const forumFollowers = (await Forum.findById(req.params.forumId)).followers

    //Verifiy if already follows //need to be tested
    // if(forumFollowers.findById(req.body.id) !== null)
    //     return res.status(400).send("You already follows")
    
    try {    
        const updatedForumFollowers = await Forum.updateOne(
            { _id: req.params.forumId }, 
            { 
                $set: { 
                    followers: [
                        req.user,
                        ...forumFollowers
                    ]
                } 
            }
        )
        res.json(updatedForumFollowers)
    } catch (err) {
        res.status(400).send(err)
    }
})

//Unfollow a forum
router.delete("/:forumId/follow", verify, async (req, res) => {
    //Verifiy if already unfollows //need to be tested
    const forumFollowers = (await Forum.findById(req.params.forumId)).followers
    //forumFollowers.map(item => item.toString() !== req.user)
    // const forumFollowUser = await forumFollowers.findById(req.body.id)
    // if( forumFollowUser == null)
    //     return res.status(400).send("You already don't follow")
        
    try {    
        //const updatedForumFollowers = await forumFollowers.remove({_id: req.body.id})
        
        //const updatedForumFollowers = forumFollowers.remove(req.user)
        //console.log(forumFollowers)
        
        const updatedForumFollowers = await Forum.updateOne(
            { _id: req.params.forumId }, 
            { 
                $set: { 

                    followers: [
                        ...forumFollowers.filter(item => item.toString() !== req.user)
                    ]
                } 
            }
        )

        res.json(updatedForumFollowers)
    } catch (err) {
        res.status(400).send(err)
    }
})

//Delete forum
router.delete("/:forumId",verify, async (req, res) => {
    if(req.user !== Forum.findById(req.params.forumId).owner)
        return res.status(401).send("Action denied, you don't have permission")
    
    try {    
        const removedForum = await Forum.remove({_id: req.params.forumId})
        res.json(removedForum)
    } catch (err) {
        res.status(400).send(err)
    }
})


//Submits a post
router.post("/:forumId/posts/", verify, async (req, res) => {
    //res.send(req.user)
    
    const forum = await Forum.findById(req.params.forumId)
    
    const post = new Post({
        title: req.body.title,
        bodyText: req.body.bodyText,
        author: req.user,
        forum: req.params.forumId
    })

    try {
        const updatedForumPosts = await Forum.updateOne(
            { _id: req.params.forumId }, 
            { 
                $set: { 
                    posts: [
                        post,
                        ...forum.posts
                    ]
                } 
            }
        )
        res.json(updatedForumPosts)
    } catch (err) {
        res.status(400).send(err)
    }

    //User.findById({_id: req.user})
})

//Get post
router.get("/:forumId/posts/:postId", async(req, res) => {
    try{
        const forum = await Forum.findById(req.params.forumId)

        const post = await forum.posts.filter(item => item._id !== req.params.postId)

        console.log(post)
        res.json(post)
    } catch(err){
        res.status(400).send(err)
    }
})

//Update a post 
router.patch("/:forumId/posts/:postId", verify, async (req, res) => {
    try {    

        //User permission
        const forum = await Forum.findById(req.params.forumId)
        const posts = forum.posts
        const post = await posts.filter(item => item._id !== req.params.postId)[0]

        if(req.user !== post.author.toString())
            return res.status(401).send("Action denied, you don't have permission")        

        const updatedPost = await Forum.updateOne(
            { _id: req.params.forumId }, 
            { 
                $set: { 
                    
                    posts: [
                        {
                            _id: post._id,
                            title: req.body.title || post.title,
                            bodyText: req.body.bodyText || post.bodyText,
                            author: post.author,
                            forum: post.forum,
                            date: post.date,
                            comentaries: [...post.comentaries]
                        },
                        ...posts.filter(item => item._id === req.params.postId)
                    ]
                } 
            }
        )
        res.json(updatedPost)
    } catch (err) {
        res.status(400).send(err)
    }
})

//Delete post
router.delete("/:forumId/posts/:postId", verify, async (req, res) => {
    try {    

        //User permission
        const forum = await Forum.findById(req.params.forumId)
        const posts = forum.posts
        const post = await posts.filter(item => item._id !== req.params.postId)[0]

        if(req.user !== (post.author.toString() || forum.owner.toString() || forum.mods.map(item => item.mod.toString)))
            return res.status(401).send("Action denied, you don't have permission")
            
        const removedPost = await Forum.updateOne(
            { _id: req.params.forumId }, 
            { 
                $set: { 
                    
                    posts: [
                        ...posts.filter(item => item._id === req.params.postId)
                    ]
                } 
            }
        )

        res.json(removedPost)
    } catch (err) {
        res.status(400).send(err)
    }
})



//Submits a comentary
router.post("/:forumId/posts/:postId/", verify, async (req, res) => {
    //res.send(req.user)
    
    const forum = await Forum.findById(req.params.forumId)
    
    const comentary = new Comentaries({
        bodyText: req.body.bodyText,
        author: req.user,
        forum: req.params.forumId
    })

    try {
        const updatedForumPosts = await Forum.updateOne(
            { _id: req.params.forumId }, 
            { 
                $set: { 
                    posts: [
                        post,
                        ...forum.posts
                    ]
                } 
            }
        )
        res.json(updatedForumPosts)
    } catch (err) {
        res.status(400).send(err)
    }

    //User.findById({_id: req.user})
})

//Get post
router.get("/:forumId/posts/:postId", async(req, res) => {
    try{
        const forum = await Forum.findById(req.params.forumId)

        const post = await forum.posts.filter(item => item._id !== req.params.postId)

        console.log(post)
        res.json(post)
    } catch(err){
        res.status(400).send(err)
    }
})

//Update a post 
router.patch("/:forumId/posts/:postId", verify, async (req, res) => {
    try {    

        //User permission
        const forum = await Forum.findById(req.params.forumId)
        const posts = forum.posts
        const post = await posts.filter(item => item._id !== req.params.postId)[0]

        if(req.user !== post.author.toString())
            return res.status(401).send("Action denied, you don't have permission")        

        const updatedPost = await Forum.updateOne(
            { _id: req.params.forumId }, 
            { 
                $set: { 
                    
                    posts: [
                        {
                            _id: post._id,
                            title: req.body.title || post.title,
                            bodyText: req.body.bodyText || post.bodyText,
                            author: post.author,
                            forum: post.forum,
                            date: post.date,
                            comentaries: [...post.comentaries]
                        },
                        ...posts.filter(item => item._id === req.params.postId)
                    ]
                } 
            }
        )
        res.json(updatedPost)
    } catch (err) {
        res.status(400).send(err)
    }
})

//Delete post
router.delete("/:forumId/posts/:postId", verify, async (req, res) => {
    try {    

        //User permission
        const forum = await Forum.findById(req.params.forumId)
        const posts = forum.posts
        const post = await posts.filter(item => item._id !== req.params.postId)[0]

        if(req.user !== (post.author.toString() || forum.owner.toString() || forum.mods.map(item => item.mod.toString)))
            return res.status(401).send("Action denied, you don't have permission")
            
        const removedPost = await Forum.updateOne(
            { _id: req.params.forumId }, 
            { 
                $set: { 
                    
                    posts: [
                        ...posts.filter(item => item._id === req.params.postId)
                    ]
                } 
            }
        )

        res.json(removedPost)
    } catch (err) {
        res.status(400).send(err)
    }
})



module.exports = router