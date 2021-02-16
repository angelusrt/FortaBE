const mongoose = require("mongoose")
const { Schema, SchemaTypes } = require("mongoose")

const inviteSchema = new Schema({
    sender: {
        type: SchemaTypes.ObjectId, 
        required: true,
        ref: 'User'
    },
    receiver: {
        type: SchemaTypes.ObjectId, 
        required: true,
        ref: 'User'
    },
    description: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Invite', inviteSchema)