const express  = require("express");

const mongoose = require("mongoose");

const passport = require("passport");

const app = express();

const db = require("./config/keys").mongoURI;

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const bodyParser = require("body-parser");

//body-parser middleware for processing req.body
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
//passport middleware
app.use(passport.initialize());
require('./config/passport')(passport);

mongoose
.connect(db)
.then(()=>console.log("DB success"))
.catch(err => console.log(err))

app.get("/",(req,res)=>res.send("Hello world"));

//using routes

app.use("/api/users",users);
app.use("/api/posts",posts);
app.use("/api/profile",profile);

const port = process.env.port || 5000;

app.listen(port,()=>console.log(`server running in port ${port}`));