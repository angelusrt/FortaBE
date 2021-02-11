const mongoose = require("mongoose")
const { Schema } = require("mongoose")

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
        type: Schema.ObjectId, 
        ref: 'User'
    },
    forum: {
        type: Schema.ObjectId, 
        ref: 'Forum'
    },
    upvotes: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    comentaries: {
        type: Array, 
        ref: 'Comentaries'
    }
})

module.exports = mongoose.model('Post', postSchema)