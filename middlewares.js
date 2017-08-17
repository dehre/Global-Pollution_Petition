const express = require('express');
//set all middlewares used inside express app
module.exports = function(app){
  app.use(require('body-parser').urlencoded({
      extended: false
  }));
  app.use(require('cookie-parser')());
  //serve static files
  app.use('/static',express.static(__dirname + '/static'));
  //if user signed already, redirect to '/signed'
  app.use(function(req,res,next){
    if(req.url !== '/signed' && req.cookies.signed){
      res.redirect('/signed')
    } else {
      next();
    };
  });
};
