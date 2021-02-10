import mongoose, { Schema, SchemaTypes } from "mongoose"

const comentariesSchema = new Schema({
    bodyText: {
        type: String,
        required: true,
        min: 1,
        max: 512,
    },
    author: {
        type: Schema.ObjectId, 
        ref: 'User'
    },   
    forum: {
        type: Schema.ObjectId, 
        ref: 'Forum'
    },
    upvotes: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    comentaries: [{
        type: Schema.ObjectId, 
        ref: 'Comentaries'
    }]
})

export default comentariesSchema