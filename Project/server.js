const express = require('express');
const validator = require('validator');
const bodyParser = require('body-parser')
const app = express();
const fs = require('fs');
const bcrypt = require('bcrypt')
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://DbUser:wAEFLnsCKuh8qppA@hacktues.klqsa4r.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

async function login(email, password)
{
    await client.connect();
    console.log("Connected")
    const collection = client.db("Users").collection("Login");
    let find = await collection.findOne({email:email});
    console.log(find)
    if(find == null)
    {
        client.close();
        return 0;
    }
    else
    {
        let isCorrect = await bcrypt.compare(password, find.password)
        console.log(isCorrect)
        if(isCorrect)
        {
            
            await client.close();
            return 1; 
        }
        else
        {
            client.close();
            return 0;
        }
        
    }
    
}


async function register(email, password)
{
    await client.connect();
    console.log("Connected")
    const collection = client.db("Users").collection("Login");
    await collection.insertOne({email:email, password:password})
    client.close();
}



app.get("/", (req, res) => {
    fs.readFile("test.html", (err, data) => {
        res.end(data)
    })
})

app.post("/register", (req, res) => {
    let data = req.body
     if(data.password == data.confirmpassword && validator.isEmail(data.email))
    {
        console.log("Yes")
        bcrypt.hash(data.password, 10, function(err, hash) {
            register(data.email, hash)
            res.end("UserCreated")

        });

    }
    else
    {
        console.log("No")
        res.end("Passwords aren't the same or the email is incorrect")
    }
});

app.post("/login", async (req, res) => {
    let data = req.body;
    let iscorrect = await login(data.email, data.password)
    
    if(iscorrect == 1)
    {
        res.end("Logged in");
    }
    else
    {
        res.end("Wrong Email or Password");
    }
});

app.listen(3000)