const express = require('express');
const router = express.Router();
//middleware for preventing csrf attacks on <form> submissions
const {csrfProtection} = require('./middlewares');
//methods for working with database
const dbMethods = require('../database');
const redisCache = require('../database/redisCache');
const cacheSecurityForm = require('./cacheSecurityForm');

//  // //  // //  // //  // //  // //  //
// ALL PATHS HERE ARE APPENDED TO '/' //
//  // //  // //  // //  // //  // // //

router.route('/register')
  .all(csrfProtection)
  .get(function(req,res){
    res.render('register',{
      csrfToken: req.csrfToken(),
      showError: req.session.errorMessage
    });
    req.session.errorMessage = null;
  })
  .post(function(req,res){
    const {firstName,lastName,email, password} = req.body;
    if(!(firstName && lastName && email && password)){
      req.session.errorMessage = 'All fields are required when registering'
      return res.redirect('/register');
    }
    //save new user to database
    dbMethods.createUser(firstName,lastName,email,password)
    .then(function(result){
      //set 'id','firstName','lastName' of user as cookie
      req.session.user = result;
      //set petition goal number as cookie
      return dbMethods.getPetitionGoal()
    })
    .then(function(goal){
      req.session.goal = goal;
      res.redirect('/profile');
    })
    .catch(function(err){
      req.session.errorMessage = 'A user with this email already exists'
      return res.redirect('/register');
    });
  });


router.route('/login')
  .all(csrfProtection)
  .get(function(req,res){
    res.render('login',{
      csrfToken: req.csrfToken(),
      showError: req.session.errorMessage,
      punishFailures: req.session.punishFailures,
      punishTime: req.session.punishTime
    });
    req.session.errorMessage = null;
    req.session.punishTime = null;
  })
  .post(function(req,res){
    //check if user needs to wait punish time for bad logins
    redisCache.get('punishTime')
    .then(function(time){
      if(time){throw 'Need to wait punish time before trying again'}
      return;
    })
    .then(function(){
      //search for user if all <input> fields filled
      const {email, password} = req.body;
      if(!(email && password)){
        req.session.errorMessage = 'All fields are required when logging in'
        return res.redirect('/login');
      }
      return dbMethods.getUser(email,password)
    })
    .then(function(result){
      //set 'id','firstName','lastName' of user as cookie
      req.session.user = result;
      //set petition goal number as cookie
      return dbMethods.getPetitionGoal()
    })
    .then(function(goal){
      req.session.goal = goal;
      res.redirect('/petition');
    })
    .catch(function(err){
      cacheSecurityForm(req,res)
      .then(function(){
        req.session.errorMessage = 'Incorrect credentials. Please try again'
        return res.redirect('/login');
      });
    })
  });


router.get('/logout',function(req,res){
  req.session = null;
  res.redirect('/register');
});


module.exports = router;
