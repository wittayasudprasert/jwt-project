require('dotenv').config();
require('./config/database').conect();

const express = require('express');
const User =  require('./model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

const app = express();

const bodyparser  = require('body-parser')   //npm install body-parser
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
app.use(express.json());

// Register 
app.post("/register", async (req, res) => {
    // our register logic goes here

    try{

       const { first_name, last_name, email, password } = req.body;
       console.log(first_name);
       console.log(last_name);
       console.log(email);
       console.log(password);

       // Validate user input 
       if (!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required");
       }

       // check if user already exist
       // Validate idf user exist in database
       const oldUser = await User.findOne({ email });

       if (oldUser) {
            res.status(409).send("User already exist. Please login");
       }

       // Encrypt user password
       encryptedPassword = await bcrypt.hash(password, 10);

       // Create user in database
       const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword
       });

       // Create token
       const token = jwt.sign(
            { user_id: user._id, email},
            process.env.TOKEN_KEY, {
                expiresIn: '2h'
            }
        )
       
        // save user token
        user.token = token;

        // return user 
        res.status(201).json(user);

    }catch (err) {
        console.log(err);
    }
});
// Login 
app.post("/login", async (req, res) => {
    // our login logic goes here

    try{

        // Get user input
        const { email, password } = req.body;        

        // Validate user input 
       if (!(email && password)) {
         res.status(400).send("All input is required");
       }

       // Validate if user exist in our database
       const user = await User.findOne({ email });

       if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign(
                { user_id: user._id, email},
                process.env.TOKEN_KEY, {
                    expiresIn: '2h'
                }
            )
              // save user token
             user.token = token;

            // return user 
            res.status(200).json(user);
       }

      res.status(400).send("Invalid Credentials");

    } catch (err) {
        console.log(err);
    }
});



app.post('/welcome', auth, (req, res)=> {
    res.status(200).send("Welcome");
});

app.post('/exit', auth, (req, res)=> {
    res.status(200).send("Bye");
});

module.exports = app;