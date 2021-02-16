const mongoose = require("mongoose")
const { Schema, SchemaTypes } = require("mongoose")
const { comentariesSchema } = require("./Comentaries")

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        min: 1,
        max: 128,
    },
    bodyText: {
        type: String,
        required: true,
        min: 1,
        max: 512,
    },
    author: {
        type: SchemaTypes.ObjectId, 
        required: true,
        ref: 'User'
    },
    forum: {
        type: SchemaTypes.ObjectId, 
        ref: 'Forum'
    },
    upvotes: {
        type: Number,
        required: false,
        default: 0,
        min: 0,
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    comentaries: [comentariesSchema]
})

module.exports = mongoose.model('Post', postSchema)
module.exports.postSchema = postSchema