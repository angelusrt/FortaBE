//Imports 
const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")

//Initiate express
const app = express()

//Get enviroment variable
dotenv.config()

//Connect to DB
mongoose.connect(
    process.env.DB_CONNECT, 
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true 
    },
    () => console.log("connected to db")
)

//Import Routes
const auth = require("./routes/auth")
const posts = require("./routes/posts")

//Route Middleware
app.use(express.json())
app.use("/api/user", auth)
app.use("/posts", posts)

//Response
app.get("/", (req, res) => {
    res.send("We are on home")
})

//Initiate server
app.listen(3000)
