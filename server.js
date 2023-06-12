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
const client = new MongoClient("mongodb+srv://admin:vanio3768@cluster0.kwogv5a.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
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
                    res.render("accountPage", {login_error: "", register_error: ""})
                }
            }
            else
            {
                res.render("accountPage", {login_error: "", register_error: ""})
            }
        }
    }
    catch{
        res.render("accountPage", {login_error: "", register_error: ""})
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
                        let json = await response.text()
                        json = JSON.parse(json)
                        let i = 0
                        while(json[i].sub_category != 'uplink_confirmed'){
                            console.log(json.category)
                            console.log(json[i].data.payload)
                            i++;
                        }
                        console.log(i);
                        console.log(json[i]);
                        let payload = json[i].data.payload
                        console.log(payload)
                        let payload_d;
                        try {
                        const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
                        payload_d = decodedPayload;
                        } catch (error) {
                        console.error('An error occurred while decoding the payload:', error);
                        }

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
                    res.render("accountPage", {login_error: "", register_error: ""})
                }
            }
            else
            {
                res.render("accountPage", {login_error: "", register_error: ""})
            }
        }
    }
    catch(err){
        console.error(err)
        res.render("accountPage", {login_error: "", register_error: ""})
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
                    res.render("accountPage", {login_error: "", register_error: ""})
                }
            }
            else
            {
                res.render("accountPage", {login_error: "", register_error: ""})
            }
        }
    }
    catch{
        res.render("accountPage", {login_error: "", register_error: ""})
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
        res.render("accountPage", {login_error: "", register_error: "Passwords don't match"})  
    }
    else if(Validator.isEmail(data.email) == false)
    {
        res.render("accountPage", {login_error: "", register_error: "The email is incorrect"})  
    }
    else if(await collection.findOne({email: data.email}))
    {
        res.render("accountPage", {login_error: "", register_error: "An account with this email already exists"})  
    }
    else
    {
        email1 = data.email
        hash1 = await bcrypt.hash(data.password, 10)
        email_authorization()
        res.render("accVerifPage", {error:""})
        
    }

});

async function email_authorization()
{
    auth_code = Math.floor(100000 + Math.random() * 900000)
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'petsafe37@gmail.com',
            pass: 'qqyokzrqpyelygke'
        }
    });

    let mailOptions = {
    from: 'PetSafe2FA',
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
        res.render("accVerifPage", {error:"The verification code is incorrect"})
    }
})

//Login
app.post("/login", async (req, res) => {
    let data = req.body;
    if(Validator.isEmail(data.email) == false)
    {
        res.render("accountPage", {login_error: "The email is invalid", register_error: ""})  
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
            res.render("accountPage", {login_error: "The credentials are incorrect", register_error: ""})  
        }
    }
    else
    {
        res.render("accountPage", {login_error: "The credentials are incorrect", register_error: ""}) 
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
