const mongoose = require("mongoose")
const { Schema, SchemaTypes } = require("mongoose")
const { postSchema } = require("./Post")

const forumSchema = new Schema({
    groupName: {
        type: String,
        required: true,
        max: 16,
    },
    bios: {
        type: String,
        required: true,
        default: "Hello World",
        min: 1,
        max: 256
    },
    tags: {
        type: [String],
        required: true,
        max: 4
    },
    followers: {
        type: [SchemaTypes.ObjectId],
        ref: 'User'
    },
    owner: {
        type: SchemaTypes.ObjectId, 
        required: true,
        ref: 'User'
    },
    mods: [{
        mod: {
            type: SchemaTypes.ObjectId,
            ref: 'User'
        },
        stats: Boolean 
    }],
    rules: {
        type: String,
        max: 1024
    },
    flags: [{
        isItPost: {
            required: true,
            type: Boolean
        },
        post: {
            required: true,
            type: SchemaTypes.ObjectId,
            ref: 'Post' 
        },
        comentaries:{
            required: false,
            type: SchemaTypes.ObjectId,
            ref: 'Comentaries' 
        },
        flags: [
            {
                sender: {
                    required: true,
                    type: SchemaTypes.ObjectId,
                    ref: 'User'
                },
                message: {
                    required: true,
                    type: String,
                    max: 128
                }
            }
        ]
    }],
    posts: [postSchema]
})

module.exports = mongoose.model('Forum', forumSchema)
module.exports.forumSchema = forumSchema