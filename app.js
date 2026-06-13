const express = require("express")
const app = express();
const cookieParser = require("cookie-parser")
const userModel = require("./models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const postModel = require("./models/post");
const upload = require("./config/multerconfig")
const path = require("path");
const { statSync } = require("fs");

app.set('view engine', "ejs")
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

app.get("/", (req,res)=>{
    res.render("index");
})

app.post("/register", async (req,res)=>{
    let {username, name, email, password, age} = req.body;

    let user = await userModel.findOne({email});
    console.log(email);
    if(user) return res.render("register");
    
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password, salt, async (err, hash)=>{
            let user = await userModel.create({
                name,
                username,
                password: hash,
                age,
                email
            })

            let token = jwt.sign({email: email, userid:user._id}, "shhhhhhhhh");
            
            res.cookie("token", token);
            res.redirect("/login")
        })
    })
})

app.get("/login", (req,res)=>{
    res.render("login");
})

app.post("/login", async (req,res)=>{
    let {email, password} = req.body;

    let user = await userModel.findOne({email})
    if(!user){
        return res.status(409).send("Something went wrong")
    } 

    bcrypt.compare(password, user.password ,(err, result)=>{
        if(result) {

            let token = jwt.sign({email: email, userid:user._id}, "shhhhhhhhh");
            
            res.cookie("token", token);
            res.redirect("/profile");
        }
        else res.redirect("/login");
    })
})

app.get("/profile", isLoggedIn, async (req,res)=>{

    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    res.render("profile", {user})
})

app.get("/logout",(req,res)=>{
    res.cookie("token","");
    res.redirect("/login")
})

app.post("/post", isLoggedIn, async (req,res)=>{
    
    let user = await userModel.findOne({email : req.user.email});
    let {post} = req.body;
    let postData = await postModel.create({
        content : post,
        user : user._id,
    })

    user.posts.push(postData._id);
    await user.save();
    res.redirect("/profile");
})

app.get("/like/:id", isLoggedIn, async (req, res)=>{
    let post = await postModel.findOne({_id : req.params.id}).populate("user")
    
    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    } else{
        post.likes.splice(post.likes.indexOf(req.user.userid),1);
    }
    await post.save();
    res.redirect("/profile")
})

app.get("/edit/:id", isLoggedIn, async (req, res)=>{
    let post = await postModel.findOne({_id : req.params.id}).populate("user")
    
    res.render("edit",{post})
})

app.post("/edit/:id", async (req,res)=>{
    let post = await postModel.findOne({_id : req.params.id})

    post.content = req.body.post;
    await post.save();
    res.redirect("/profile");
})

app.post("/profile/:id", isLoggedIn, upload.single("image"), async (req,res)=>{
    let user = await userModel.findOne({_id : req.params.id})
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile");
})

function isLoggedIn(req, res, next){
    if(req.cookies.token == ""){
        return res.redirect("/login");
    } else{
        let data = jwt.verify(req.cookies.token,"shhhhhhhhh");
        req.user = data;
        next();
    }
}


app.listen(3000)