const express = require('express');
//methods for working with database
const dbMethods = require('../database');
//store session into Redis
const session = require('express-session');
const Store = require('connect-redis')(session);
//grab url configurations for working with Redis from both localhost and Heroku
let redisObj;
process.env.REDIS_URL ? redisObj = {store:process.env.REDIS_URL} : redisObj = {ttl:3600,host:'localhost',port:6379};
//create secret for hashing cookies --> so cannot be hacked on client side
let sessionSecret;
process.env.SESSION_SECRET ? sessionSecret = process.env.SESSION_SECRET : sessionSecret = 'secret';

//set all middlewares used inside express app
module.exports.middlewares = function(app){

  app.use(require('body-parser').urlencoded({
      extended: false
  }));

  //store session data into Redis
  app.use(session({
    store: new Store(redisObj),
    resave: false,
    saveUninitialized: true,
    secret: sessionSecret
  }));

  //redirect non-registered users to GET'/register' if they're accessing private pages; also redirect registered users to GET'/petition' if they're trying to access registration-login pages
  app.use(function(req,res,next){
    const publicUrls = ['/register','/login'];
    if(publicUrls.indexOf(req.url)===-1 && !req.session.user){
      return res.redirect('/register');
    } else if(publicUrls.indexOf(req.url)>-1 && req.session.user){
      return res.redirect('/petition');
    }
    next();
  });

}; //end 'module.exports'

//middleware for preventing csrf attacks on <form> submissions
const csrf = require('csurf');
module.exports.csrfProtection = csrf();

//if users try to sign petition that have signed already (so they try to GET'/petition'), redirect to '/signed' to show they're signature
module.exports.isSigned = function(req,res,next){
  dbMethods.getSignature(req.session.user.user_id)
  .then(function(signature){
    return res.redirect('/petition/signed');
  })
  .catch(function(err){
    //if signature is not found, promise is rejected, so just catch the error and move user along
    next();
  })
};
