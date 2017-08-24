const express = require('express');
const router = express.Router();
//middleware for preventing csrf attacks on <form> submissions
const {csrfProtection} = require('./middlewares');
//methods for working with database
const dbMethods = require('../database');
//use Redis cache for preventing hack attacks
const redisCache = require('../database/redisCache');


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
      //grab 'id','firstName','lastName' of new registered user, and set them as cookie on user's browser
      req.session.user = result;
      //set petition goal number as cookie (if app grows, allow user to select which petition is gonna see)
      return dbMethods.getPetitionGoal()
    })
    .then(function(goal){
      req.session.goal = goal;
      res.redirect('/profile');
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
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
      showPunishTime: req.session.punishTime
    });
    req.session.errorMessage = null;
    req.session.punishTime = null;
  })
  .post(function(req,res){
    //global reference to 'request' object
    const request = req;
    const {email, password} = req.body;
    if(!(email && password)){
      req.session.errorMessage = 'All fields are required when logging in'
      return res.redirect('/login');
    }
    dbMethods.getUser(email,password)
    .then(function(result){
      //set 'id','firstName','lastName' of logged in user as cookies on user's browser
      req.session.user = result;
      //set petition goal number as cookie (if app grows, allow user to select which petition is gonna see)
      return dbMethods.getPetitionGoal()
    })
    .then(function(goal){
      req.session.goal = goal;
      res.redirect('/petition');
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      //take count of bad logins
      return redisCache.get('wrongAttempt')
    })
    .then(function(wrongAttemptStr){
      const wrongAttempt = parseInt(wrongAttemptStr) || 1;
      return wrongAttempt
    })
    .then(function(wrongAttempt){
      if(wrongAttempt>=3){
        //if user tries bad login more than 3 times, give him punish time of 90sec, 180sec, 360 sec and so on
        return redisCache.get('punishTime')
        .then(function(timeStr){
          return parseInt(timeStr) || 90;
        })
        .then(function(time){
          req.session.punishTime = `You failed ${wrongAttempt} times. Please wait ${time} seconds before trying again`;
          return redisCache.setex('punishTime',time,JSON.stringify(time*2))
          .then(function(){
            return {wrongAttempt,time}
          })
        })
      }
      //return a default time of 10 seconds if no one provided
      return {wrongAttempt:wrongAttempt,time:10};
    })
    .then(function(obj){
      return redisCache.setex('wrongAttempt',obj.time,JSON.stringify(obj.wrongAttempt+1))
    })
    .then(function(){
      req.session.errorMessage = 'Incorrect credentials. Please try again'
      return res.redirect('/login');
    });
  });

router.get('/logout',function(req,res){
  req.session = null;
  res.redirect('/register');
});

//handle browser's request for 'favicon.ico'
router.get('/favicon.ico', function(req, res){
  res.redirect('/static/images/favicon.ico');
});

module.exports = router;
