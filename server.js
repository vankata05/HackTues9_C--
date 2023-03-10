const express = require('express')
const app = express()
const fs = require('fs')
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt')
const Validator = require('validator')
app.use(express.urlencoded({ extended: true }));
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
let email1;
let hash1;
let auth_code;


//Connect to DB
const client = new MongoClient("mongodb+srv://DbUser:wAEFLnsCKuh8qppA@hacktues.klqsa4r.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect()
const collection = client.db("Users").collection("Login");

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
                    res.sendFile(__dirname + "/public/LoggedInAccPage.html")
                }
                else{
                    res.sendFile(__dirname + "/public/accountPage.html")
                }
            }
            else
            {
                res.sendFile(__dirname + "/public/accountPage.html")
            }
        }
    }
    catch{
        res.sendFile(__dirname + "/public/accountPage.html")
    }

})

app.get("/accountPage.html", async(req, res) => {
    res.redirect("/accountPage")
})

app.get("/LoggedInAccPage.html", (req, res) => {
    res.redirect("/accountPage")
})

app.get("/LoggedInAccPage", (req, res) => {
    res.redirect("/accountPage")
})

app.get("/trackersPage.html", async(req, res) => {
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
                    res.sendFile(__dirname + "/public/trackersPage.html")
                    await collection.updateOne({token:cookie}, {$set:{expire:generateDate()}})
                }
                else{
                    res.sendFile(__dirname + "/public/accountPage.html")
                }
            }
            else
            {
                res.sendFile(__dirname + "/public/accountPage.html")
            }
        }
    }
    catch{
        res.sendFile(__dirname + "/public/accountPage.html")
    }

})

app.get("/trackersPage", async(req, res) =>{
    res.redirect("/trackersPage")
})

app.get("/", (req, res) => {
    res.redirect("/homePage")
})

app.get("/paymentPage", async(req, res) => {
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
                    res.sendFile(__dirname + "/public/paymentPage.html")
                }
                else{
                    res.sendFile(__dirname + "/public/accountPage.html")
                }
            }
            else
            {
                res.sendFile(__dirname + "/public/accountPage.html")
            }
        }
    }
    catch{
        res.sendFile(__dirname + "/public/accountPage.html")
    }

})

app.get("/paymentPage.html", async(req, res) => {
    res.redirect("/paymentPage")
})

app.get("*", async (req,res) => {
    let url = req.url
    await res.sendFile(__dirname + "/public/" + url, async(err) => {
        await res.sendFile(__dirname + "/public/" + url + ".html", (error) => {
            res.end("Not Found")
        })
    });
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
        await collection.insertOne({email:email1, password: hash1, token:token, expire:expire})
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

app.listen(3000)
