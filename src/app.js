const express = require('express')
const app = express()
const userModel = require('./models/user')
const postModel = require('./models/post')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.render('index')
})
app.get('/profile',isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({email: req.user.email}).populate('posts')
    res.render('profile', {user})
})
app.get('/edit/:id',isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({_id: req.params.id})
    res.render('edit', {post})
})
app.post('/update', isLoggedIn, async (req, res) => {
    let {postTitle, postData, id} = req.body
    let post = await postModel.findOneAndUpdate(
        {_id: id

        },
        {
            postTitle,
            postData
        }
    )
    res.redirect('/profile')
})
app.get('/delete/:id', isLoggedIn, async (req, res) => {
    await postModel.findOneAndDelete({_id: req.params.id})
    res.redirect('/profile')
})
app.post('/register', async (req, res) => {
    let {name, username, email, password, age} = req.body
    let isUser = await userModel.findOne({email})
    if(isUser) return res.send("User already registered")
    const hash = await bcrypt.hash(password, 10)
    let user = await userModel.create({
        name,
        email,   
        password: hash
    })
    const token = jwt.sign({email, userid: user._id}, "this is the word")
    res.cookie("token", token)
    res.redirect("/profile")
})
app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', async (req, res) => {
    let {email, password} = req.body
    let user = await userModel.findOne({email})
    if(!user) return res.send("Something went wrong")
    
    const result = await bcrypt.compare(password, user.password)
    if(result) {
        const token = jwt.sign({email, userid: user._id}, "this is the word")
        res.cookie("token", token)
        res.redirect('/profile')
        
        
    }
    else res.redirect("/login")
    
    
})

app.get('/logout', (req, res) => {
    res.cookie("token", "")
    res.redirect('/login')
})

function isLoggedIn(req, res, next){
    if(req.cookies.token === "") res.redirect('/login')
    else{
        const data = jwt.verify(req.cookies.token, "this is the word")
        req.user = data
    }
    next()
}

app.post('/addnote/:id',isLoggedIn, async (req, res) => {
    let {title, note} = req.body
    let id = req.params.id
    let post = await postModel.create({
        postTitle: title,
        postData: note
    })
    let user = await userModel.findOne({_id: id})
    user.posts.push(post._id)
    await user.save()
    res.redirect('/profile')
    
    console.log(id)

})

app.listen(process.env.PORT)