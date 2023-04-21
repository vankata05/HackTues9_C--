const express = require('express')
const app = express()
const fs = require('fs')
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt')
const Validator = require('validator')
app.use(express.urlencoded({ extended: true }));
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const { atob } = require('buffer');
app.use(cookieParser());
let email1;
let hash1;
let auth_code;
app.set("view engine", "ejs");

//Connect to DB
const client = new MongoClient("mongodb+srv://DbUser:wAEFLnsCKuh8qppA@hacktues.klqsa4r.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect()
const collection = client.db("Users").collection("Login");

app.get("/contactsPage", async(req, res) => {
    res.render("contactsPage")
})

//accountPage
app.get("/accountPage", async(req, res) => {
    try
    {
        let cookie = req.cookies.Login.token
        if(cookie)
        {
            let FindToken = await collection.findOne({token:cookie})
            if(FindToken)
            {
                const d = new Date()
                let date = d.getTime()
                if(date < FindToken.expire)
                {
                    await collection.updateOne({token:cookie}, {$set:{expire:generateDate()}})
                    res.render("LoggedInAccPage")
                }
                else{
                    res.render("accountPage")
                }
            }
            else
            {
                res.render("accountPage")
            }
        }
    }
    catch{
        res.render("accountPage")
    }

})


app.get("/LoggedInAccPage", (req, res) => {
    res.redirect("/accountPage")
})

app.get("/trackersPage", async(req, res) => {
    try
    {
        let cookie = req.cookies.Login.token
        if(cookie)
        {
            let FindToken = await collection.findOne({token:cookie})
            if(FindToken)
            {
                const d = new Date()
                let date = d.getTime()
                if(date < FindToken.expire)
                {
                    if(FindToken.apiKey)
                    {
                        let apiKey = FindToken.apiKey
                        let response = await fetch('https://console.helium.com/api/v1/devices/1b870fc2-269b-4760-b038-9c924a585c19/events', {
                            headers: {
                                'key': apiKey
                            }
                        })
                        console.log(response)
                        let json = await response.text()
                        console.log(json)
                        json = JSON.parse(json)
                        console.log(json)
                        let payload = json[0].data.payload
                        console.log(payload)
                        let payload_d = atob(payload); 
                        console.log(payload_d)
                        
                        let coords_arr = payload_d.split(",")
                        let coord1 = coords_arr[0]
                        let coord2 = coords_arr[1].slice(1)
                        let coords = coord1 + "," + coord2;
                        await res.render("trackersPage", {coords})
                        await collection.updateOne({token:cookie}, {$set:{expire:generateDate()}})
                    }
                    else
                    {
                        await res.redirect("/addDevicePage")
                    }
                }
                else
                {
                    res.render("accountPage")
                }
            }
            else
            {
                res.render("accountPage")
            }
        }
    }
    catch(err){
        console.error(err)
        res.render("accountPage")
    }

})


app.get("/", (req, res) => {
    res.render("homePage")
})


app.get("/addDevicePage", async(req, res) => {
    try
    {
        let cookie = req.cookies.Login.token
        if(cookie)
        {
            let FindToken = await collection.findOne({token:cookie})
            if(FindToken)
            {
                const d = new Date()
                let date = d.getTime()
                if(date < FindToken.expire)
                {
                    await collection.updateOne({token:cookie}, {$set:{expire:generateDate()}})
                    res.render("addDevicePage")
                }
                else{
                    res.render("accountPage")
                }
            }
            else
            {
                res.render("accountPage")
            }
        }
    }
    catch{
        res.render("accountPage")
    }
})

app.get("*", async (req,res) => {
    let url = req.url
    try{
        await res.sendFile(__dirname + "/views/" + url);
    }
    catch
    {
        res.end("Not Found")
    }
})


//LogOut
app.post("/logout", (req, res) => {
    res.clearCookie("Login")
    res.redirect("/accountPage")
})

//Register 
app.post("/register", async (req, res) => {
    let data = req.body
    if(data.password != data.repeat_password)
    {
        res.end()  
    }
    else if(Validator.isEmail(data.email) == false)
    {
        res.end('<p>The email you have entered is invalid</p> <br> <a href="/accountPage"><button>Try Again</button></a>')
    }
    else if(await collection.findOne({email: data.email}))
    {
        res.end('<p>Account with that email already exists</p> <br> <a href="/accountPage"><button>Try Again</button></a>')
    }
    else
    {
        email1 = data.email
        hash1 = await bcrypt.hash(data.password, 10)
        email_authorization()
        res.render("accVerifPage")
        
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

//Generate Token
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.@_/';

function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

//generate expiration date
function generateDate()
{
    const d = new Date();
    const newDate = new Date(d.getTime() + 30*60000)
    return newDate
}

//Auth Page

app.post("/authorization", async(req, res) => {
    if(req.body.auth_code == auth_code)
    {
        let token = generateString(30);
        let expire = generateDate();        
        await collection.insertOne({email:email1, password: hash1, token:token, expire:expire, apiKey: null})
        res.cookie("Login", {token: token})
        res.redirect("/accountPage");
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
    else if(await collection.findOne({email: data.email}))
    {
        let user = await collection.findOne({email: data.email});
        let iscorrect = await bcrypt.compare(data.password, user.password);
        if(iscorrect)
        {
            let token = generateString(30)
            let expire = generateDate()
            await collection.updateOne({email:data.email}, {$set:{token: token, expire:expire}})
            res.cookie("Login", {token: token})
            res.redirect("/accountPage");
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

//add api key

app.post("/api_key", async(req, res) => {
    let data = req.body
    let cookie = req.cookies.Login.token
    await collection.updateOne({token:cookie}, {$set:{apiKey:data.api_key}})
    res.redirect("/trackersPage")
})

app.listen(3000)
