import mongoose, { Schema } from "mongoose"

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        max: 16,
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
        type: Schema.ObjectId,
        favorite: Boolean,
        favoriteDefault: false,
        ref: 'Chat'
    }],
    myForums: [{
        type: Schema.ObjectId,
        favorite: Boolean,
        favoriteDefault: false,
        ref: 'Forum'
    }],
    myInvites: [{
        type: Schema.ObjectId,
        favorite: Boolean,
        favoriteDefault: false,
        ref: 'Invites'
    }]

})

export default userSchema