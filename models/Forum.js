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
    posts: [postSchema]
})

module.exports = mongoose.model('Forum', forumSchema)
module.exports.forumSchema = forumSchema