var express = require('express');
var router = express.Router();
const {body, validationResult, check} = require('express-validator');
const User = require('../models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const passport = require('passport')
/* GET home page. */
router.get("/", function (req, res) {
  res.redirect("/catalog");
});

router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register'
  })
})

router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login',
  })
})

router.post('/login',  passport.authenticate('local', {
  successRedirect:'/',
  failureRedirect:'/login'}))

//GET login page
router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Please log in'})
})

router.post('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) {return next(err)}
    res.redirect('/login')
  })
})


//GET sign up form
router.get('/register', function(req, res, next) {
  res.render('register', {title: 'Sign Up'})
})

//POST sign up form -- copied from my message board app
router.post('/register',
  
  //all validators need to pass in the function arguments - per express-validator docs
  body('password', 'A strong password must be 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one symbol.').trim().isStrongPassword(), 
  body('username', 'Usernames must be at least 4 characters.').trim().isLength({min:4}),
  
  //custom validator to check if the passwords match

  body('password').custom((value, {req}) => {
    if (value !== req.body.confirmpassword) {
      throw new Error('Passwords must match.')
    } else {
      return true
    }
  }),
  
  //custom validator to check if username is taken
  body('username').custom(async (value) => {
      try {
        mongoose.connect(process.env.DB_STRING)
        const user = await User.find({username:value})
        if (user[0] !== undefined) {
          throw new Error('Username is taken.')
        } else {
          return true
        }      
      } catch (err) {
        throw err
      }
  }),
//after validator tests, process request
async function(req, res, next) {
  //first run validation check; if errors, render the sign-up-form with the errors
  const errors = validationResult(req);
  console.log(errors)
  if (!errors.isEmpty()) {
    res.render('register', {errors:errors.array(), 
      username:req.body.username
    })
  } else {
    //No errors, so continue on with the request
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      mongoose.connect(process.env.MONGO_URI)
      const user = new User({
        username: req.body.username,
        password: hashedPassword,
      })
      user.save()
      res.redirect('/login')
      } catch (error) {
      res.render('error', {error:error})
  }}
});


module.exports = router;