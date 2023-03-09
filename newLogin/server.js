const express = require('express')
const app = express()
const fs = require('fs')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Validator = require('validator')
app.use(express.urlencoded({ extended: true }));
var nodemailer = require('nodemailer');
let email1;
let hash1;
let auth_code;
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



//Get pages

app.get("/", (req, res) => {
    res.redirect("/homePage")
})

app.get("*", async (req,res) => {
    let url = req.url
    await res.sendFile(__dirname + "/public/" + url, async(err) => {
        await res.sendFile(__dirname + "/public/" + url + ".html", (error) => {
            res.end("Not Found")
        })
    });
})


//Register 
app.post("/register", async (req, res) => {
    let data = req.body
    if(data.password != data.repeat_password)
    {
        res.end('<p>The passwords are not the same</p> <br> <a href="/accountPage"><button>Try Again</button></a>')  
    }
    else if(Validator.isEmail(data.email) == false)
    {
        res.end('<p>The email you have entered is invalid</p> <br> <a href="/accountPage"><button>Try Again</button></a>')
    }
    else if(await UserModel.findOne({email: data.email}))
    {
        res.end('<p>Account with that email already exists</p> <br> <a href="/accountPage"><button>Try Again</button></a>')
    }
    else
    {
        email1 = data.email
        hash1 = await bcrypt.hash(data.password, 10)
        email_authorization()
        fs.readFile("public/accVerifPage.html", (err, data) => {
            res.end(data)
        })
        
    }

});

async function email_authorization()
{
    auth_code = Math.floor(100000 + Math.random() * 900000)
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'petsafe1234@gmail.com',
            pass: 'tjggczeipbzkxutn'
        }
    });

    let mailOptions = {
    from: 'petsafe1234@gmail.com',
    to: email1,
    subject: 'Authorization Code',
    text: auth_code.toString()
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
}

//Auth page

app.post("/authorization", async(req, res) => {
    if(req.body.auth_code == auth_code)
    {
        let User = new UserModel({email: email1, password: hash1})
        await User.save()
        res.end("Registration Done")
    }
    else
    {
        res.end('<p>The authorization code you have entered is incorrect</p> <br> <a href="/accountPage"><button>Try Again</button></a>')
    }
})

//Login
app.post("/login", async (req, res) => {
    let data = req.body;
    if(Validator.isEmail(data.email) == false)
    {
        res.end('<p>The email you have entered is invalid</p> <br> <a href="/accountPage"><button>Try Again</button></a>')
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
            res.end('<p>The email or the password you have entered is invalid</p> <br> <a href="/accountPage"><button>Try Again</button></a>')
        }
    }
    else
    {
        res.end('<p>The email or the password you have entered is invalid</p> <br> <a href="/accountPage"><button>Try Again</button></a>')
    }
})

app.listen(3000)
