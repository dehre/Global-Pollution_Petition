const express = require('express');
//get back secret for hashing cookies
const {sessionSecret} = require('../secret.json');
//set all middlewares used inside express app
module.exports = function(app){

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
