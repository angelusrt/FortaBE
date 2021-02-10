import mongoose, { Schema, SchemaTypes } from "mongoose"

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

export default chatSchema