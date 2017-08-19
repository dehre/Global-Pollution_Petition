const express = require('express');
//methods for working with database
const dbMethods = require('../db/methods');
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

  //if users try to sign petition that have signed already, redirect to '/signed' to show they're signature
  app.use('/petition',function(req,res,next){
    dbMethods.getSignature(req.session.user.user_id)
    .then(function(signature){
      if(signature.rows[0]){
        return res.redirect('/signed');
      }
      next();
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.send(`Error happened retrieving signature from DB.`);
    })
  });

};
