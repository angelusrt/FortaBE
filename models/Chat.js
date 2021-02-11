const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const chatSchema = new Schema({
    members: [{
        type: Schema.ObjectId, 
        ref: 'User'
    }],
    messages: [{
        type: String,
        author: {
            type: Schema.ObjectId, 
            ref: 'User'
        },
        date: Date,
        default: Date.now
    }]
})

module.exports = mongoose.model('Chat', chatSchema)