const mongoose = require("mongoose")
const { Schema, SchemaTypes } = require("mongoose")

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        max: 32,
    },
    email: {
        type: String,
        required: true,
        min: 7,
        max: 32,
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 256
    },
    bios: {
        type: String,
        required: false,
        default: "Hello World",
        min: 1,
        max: 256
    },
    myChat: [{
        type: SchemaTypes.ObjectId,
        favorite: Boolean,
        favoriteDefault: false,
        ref: 'Chat'
    }],
    myForums: [{
        type: SchemaTypes.ObjectId,
        favorite: Boolean,
        favoriteDefault: false,
        ref: 'Forum'
    }],
    myInvites: [{
        type: SchemaTypes.ObjectId,
        ref: 'Invite'
    }]
})

module.exports = mongoose.model('User', userSchema)