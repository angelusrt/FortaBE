const mongoose = require("mongoose")
const { Schema, SchemaTypes } = require("mongoose")

const comentariesSchema = new Schema({
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
        required: true,
        default: 0,
        min: 0,
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
})

module.exports = mongoose.model('Comentaries', comentariesSchema)
module.exports.comentariesSchema = comentariesSchema