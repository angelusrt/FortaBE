const mongoose = require("mongoose")
const { Schema, SchemaTypes } = require("mongoose")

const chatSchema = new Schema({
    members: [{
        type: SchemaTypes.ObjectId, 
        ref: 'User'
    }],
    messages: [{
        type: String,
        author: {
            type: SchemaTypes.ObjectId, 
            ref: 'User'
        },
        date: Date,
        default: Date.now
    }]
})

module.exports = mongoose.model('Chat', chatSchema)