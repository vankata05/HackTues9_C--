const express = require('express')
const app = express()
const fs = require('fs')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Validator = require('validator')
app.use(express.urlencoded({ extended: true }));


//Connect to DB
async function connectdb() {
    await mongoose.connect('mongodb+srv://DbUser:wAEFLnsCKuh8qppA@hacktues.klqsa4r.mongodb.net/?retryWrites=true&w=majority');
}
connectdb();


//Create User Model
const UserSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    password: String
});
const UserModel =  mongoose.model('UserModel', UserSchema)



//Get the registration form
app.get("/register", (req, res) => {
    fs.readFile("site/register.html", (err, data) => {
        res.end(data)
    })

});

app.get("/", (req, res) => {
    res.redirect("/login")
})

//Get the login form
app.get("/login", (req, res) => {
    fs.readFile("site/login.html", (err, data) => {
        res.end(data)
    })

});

//Register 
app.post("/register", async (req, res) => {
    let data = req.body
    if(data.password != data.repeat_password)
    {
        res.end("The passwords aren't the same")  
    }
    else if(Validator.isEmail(data.email) == false)
    {
        res.end("Invalid Email")
    }
    else if(await UserModel.findOne({email: data.email}))
    {
        res.end("Email already exists")
    }
    else
    {
        
        hash = await bcrypt.hash(data.password, 10)
        let User = new UserModel({email: data.email, password: hash})
        User.save()
        res.end("User Created")
    }

});

//Login
app.post("/login", async (req, res) => {
    let data = req.body;
    if(Validator.isEmail(data.email) == false)
    {
        res.end("Invalid Email")
    }
    else if(await UserModel.findOne({email: data.email}))
    {
        let user = await UserModel.findOne({email: data.email});
        let iscorrect = await bcrypt.compare(data.password, user.password);
        if(iscorrect)
        {
            res.end("Logged in");
        }
        else
        {
            res.end("Invalid information");
        }
    }
    else
    {
        res.end("Invalid information");
    }
})

app.listen(3000)
