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
    },
    path: {
        type: SchemaTypes.ObjectId,
        required: false,
        ref: doc => { 
            doc.description === "mod"? "Forum":
            doc.description === "chat"? "Chat":
            "Group"
        }
    }
})

module.exports = mongoose.model('Invite', inviteSchema)