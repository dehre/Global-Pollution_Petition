const express = require('express');
//methods for working with database
const dbMethods = require('../database/methods');
//get back secret for hashing cookies
const {sessionSecret} = require('../secret.json');
//set all middlewares used inside express app
module.exports.middlewares = function(app){
  app.use(require('body-parser').urlencoded({
      extended: false
  }));
  //use 'cookie-session' to provide data integrity for cookies
  app.use(require('cookie-session')({
    secret: sessionSecret,
    maxAge: 1000*60*60*24*14
  }));
  //redirect not registered users to GET'/register' if they're accessing private pages
  app.use(function(req,res,next){
    const allowedUrls = ['/register','/login'];
    if(allowedUrls.indexOf(req.url)===-1 && !req.session.user){
      return res.redirect('/register');
    }
    next();
  });
};

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
