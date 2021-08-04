//Imports 
const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")

//Initiate express
const app = express()

//Get enviroment variable
dotenv.config()

console.log(process.env.DB_CONNECT)

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
const forums = require("./routes/forums")
const invites = require("./routes/invites")
const chats = require("./routes/chats")
const groups = require("./routes/groups")

//Route Middleware
app.use(express.json())
app.use("/api/user", auth)
app.use("/api/forums", forums)

app.use("/api/invites", invites) 
app.use("/api/chats", chats)
app.use("/api/groups", groups)

//Response
app.get("/", (req, res) => {
    res.send("We are on home")
})

//Initiate server
app.listen(3000)
