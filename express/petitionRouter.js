const express = require('express');
const router = express.Router();
//middleware for preventing csrf attacks on <form> submissions
const {csrfProtection} = require('./middlewares');

//middlewares to apply to specific routes
const {isSigned} = require('./middlewares.js');
//methods for working with database
const dbMethods = require('../database');

//  // //  // //  // //  // //  // //  // //  //
// ALL PATHS HERE ARE APPENDED TO '/petition' //
//  // //  // //  // //  // //  // //  // //  //

router.route('/')
  .all(csrfProtection)
  .get(isSigned,function(req,res){
    const {first,last} = req.session.user;
    res.render('petition',{
      first: first,
      last: last,
      csrfToken: req.csrfToken(),
      showError: req.session.errorMessage,
      showMessage: req.session.successMessage
    });
    req.session.errorMessage = null;
    req.session.successMessage = null;
  })
  .post(function(req,res){
    const {signature} = req.body;
    const {user_id} = req.session.user;
    if(!signature){
      req.session.errorMessage = 'Signature was not filled';
      return res.redirect('/petition');
    }
    //save signature to database
    dbMethods.createSignature(user_id,signature)
    .then(function(){
      res.redirect('/petition/signed');
    })
    .catch(function(err){
      res.render('error',{errorMessage: 'Error happened saving your signature into database'});
    });
  });


router.get('/signed',function(req,res){
  //take user's id from cookies and  grab his signature from DB
  dbMethods.getSignature(req.session.user.user_id)
  .then(function(signature){
    //pass the signature I got back to 'signed' template
    res.render('signed',{
      first: req.session.user.first,
      signature:signature,
      showMessage: req.session.successMessage
    });
    req.session.successMessage = null;
  })
  .catch(function(err){
    res.render('error',{errorMessage: 'Error happened retrieving your signature from database'});
  })
});


router.get('/signers/:city?',function(req,res){
  //if 'city' passed to url, make specific query for those signers, otherwise retrieve them all
  let cityName;
  if(req.params.city){cityName=req.params.city.toLowerCase()}
  dbMethods.getSigners(cityName)
  .then(function(signers){
    const goal = req.session.goal;
    res.render('signers',{
      first: req.session.user.first,
      signers: signers,
      signersNumber: signers.length,
      goal: goal
    });
  })
  .catch(function(err){
    res.render('error',{errorMessage: 'Error happened retrieving data from database'});
  });
});


router.get('/signed/delete',function(req,res){
  const {user_id} = req.session.user;
  dbMethods.deleteSignature(user_id)
  .then(function(){
    res.redirect('/petition');
  })
  .catch(function(err){
    res.render('error',{errorMessage: `Error deleting your signature`});
  });
});


module.exports = router;
