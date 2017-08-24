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
      showError: req.session.errorMessage
    });
    req.session.errorMessage = null;
  })
  .post(function(req,res){
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
      redisCache.get('wrongAttempt')
      .then(function(wrongAttempt){
        console.log('wrongAttempt',wrongAttempt);
        if(wrongAttempt){
          return redisCache.setex('wrongAttempt',15,parseInt(wrongAttempt)+1)
        }
        return redisCache.setex('wrongAttempt',15,1);
      })

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
