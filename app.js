const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const ejsMate = require("ejs-mate");
const multer = require("multer")
const User = require('./userModel');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET || 'this-is-my-secret';
const expires = process.env.EXPIRES || 1000

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));    

app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
})); 

const signToken = (id) => {
    return jwt.sign({ id }, secret, { expiresIn: expires });
}

const sendOTP = (num, otp) => { 
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);
    client.messages
      .create({
        to: num,
        from: "+16163742088",
        body: `Your one time password for user registeration is: ${otp}`,
      })
      .then((message) => console.log(message.sid))
      .catch((error) => console.log(error));
}


app.post('/otp', async (req, res) => {
    try {
      req.session.otp = Math.floor(Math.random() * 10000) + 1000;
      console.log(req.body);
      const email = await User.findOne({email: req.body.email}) 
      if (email) {
        res.status(400).json({
            status: 'failed',
            messaage: 'email already exists!'
        })
        return;
      }  
      sendOTP(req.body.mobile, req.session.otp);  
      req.session.userData = req.body;
      req.session.file = req.file;
      res.status(200).render("verification.ejs");
    } catch (err) {
        console.log(err);
       res.status(400).json({
        status: "failed",
        messaage: "invalid data",
          data: {
            error: err
        }
      });
    }
})

app.get("/", (req, res) => {
    res.render("register.ejs");
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/register", async (req, res) => {
    try {
        if (req.session.otp == req.body.otp) {
            req.body = req.session.userData;
            req.file = req.session.file
            if (req.file) {
                console.log('here')
                multer({ storage }).single(req.file);
                req.session.userData.attachment = req.session.userData.attachment.path
            } 
            const newUser = await User.create(req.session.userData);
            const token = signToken(newUser._id);
            res.status(200).json({
                status: 'success',
                message: 'user registered and logged in!',
                userID: req.session.userData._id,
                tokenID: token
            });
        }
        else {
            res.status(400).json({
                status: 'failed',
                messagge: 'invalid otp',
            })
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({
            status: 'failed',
            messaage: 'some error occured'
        })
    }
});

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    if (!email && !password) {
        res.status(400).json({
            status: 'bad request',
            message: 'Please provide email and password'
        })
        return;
    }
    const user = await User.findOne({ email}).select('+password');
    //const correct = await user.correctPassword(password, user.password)
    if (!user || !(await user.correctPassword(password, user.password))) {
      res.status(401).json({
        message: "Incorrect username or password",
      });
      return;
    }
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        message: 'User Logged in!',
        userID: req.session.userData._id,
        tokenID: token
    });
});

module.exports = app;
  