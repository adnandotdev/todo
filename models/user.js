const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

// mongoose.connect(process.env.MONGO_URL)
mongoose.connect('mongodb+srv://quillnotes:qIY6irXpqB5lpKp1@notes.qrb1p.mongodb.net/');

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post"
        }
    ]
})

module.exports = mongoose.model("user", userSchema)