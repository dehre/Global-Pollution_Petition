const express = require('express');
//get back secret for hashing cookies
const {sessionSecret} = require('./secret.json');
//set all middlewares used inside express app
module.exports = function(app){

  app.use(require('body-parser').urlencoded({
      extended: false
  }));

  app.use(require('cookie-parser')());

  //use 'cookie-session' to provide data integrity for cookies
  app.use(require('cookie-session')({
    secret: sessionSecret,
    maxAge: 1000*60*60*24*14
  }));

  //serve static files
  app.use('/static',express.static(__dirname + '/static'));

  //TO MODIFY --> KEEP UNSIGNED USERS AWAY FROM SIGNED PAGES
  //if user signed already, redirect to '/signed'
  // app.use(function(req,res,next){
  //   if(req.url !== '/signed' && req.cookies.signed){
  //     res.redirect('/signed')
  //   } else {
  //     next();
  //   };
  // });

};
