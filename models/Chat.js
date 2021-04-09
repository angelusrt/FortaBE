const mongoose = require("mongoose")
const { Schema, SchemaTypes } = require("mongoose")

const chatSchema = new Schema({
    members: [{
        member: {
            type: SchemaTypes.ObjectId,
            required: true, 
            ref: 'User'
        },
        stats: String
    }],
    messages: [{
        message: String,
        author: {
            type: SchemaTypes.ObjectId, 
            required: true,
            ref: 'User'
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
})

module.exports = mongoose.model('Chat', chatSchema)