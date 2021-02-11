const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const forumSchema = new Schema({
    groupname: {
        type: String,
        required: true,
        max: 16,
    },
    bios: {
        type: String,
        required: false,
        default: "Hello World",
        min: 1,
        max: 256
    },
    tags: {
        type: [String],
        required: true,
        max: 4
    },
    followers: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    owner: {
        type: Schema.ObjectId, 
        required: true,
        ref: 'User'
    },
    mods: {
        type: [Schema.ObjectId], 
        required: false,
        ref: 'User'
    },
    comentaries: {
        type: Array, 
        required: false,
        ref: 'Comentaries'
    }
})

module.exports = mongoose.model('Forum', forumSchema)