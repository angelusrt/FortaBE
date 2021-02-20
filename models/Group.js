const mongoose = require("mongoose")
const { Schema, SchemaTypes } = require("mongoose")

const groupSchema = new Schema({
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
        date: Date,
        default: Date.now
    }]
})

module.exports = mongoose.model('Group', groupSchema)