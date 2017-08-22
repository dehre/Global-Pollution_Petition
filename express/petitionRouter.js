const express = require('express');
const router = express.Router();

//middlewares to apply to specific routes
const {isSigned} = require('./middlewares.js');
//methods for working with database
const dbMethods = require('../database/methods');

//  // //  // //  // //  // //  // //  // //  //
// ALL PATHS HERE ARE APPENDED TO '/petition' //
//  // //  // //  // //  // //  // //  // //  //

router.get('/',isSigned,function(req,res){
  //retrieve number of signed people
  dbMethods.getSigners()
  .then(function(signers){
    //grab user's first and last name from cookie to populate navbar
    const {first,last} = req.session.user;
    const goal = req.session.goal;
    res.render('petition',{
      first: first,
      last: last,
      signersNumber: signers.length,
      goal: goal
    });
  })
  .catch(function(err){
    console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
    res.render('error',{
      errorMessage: 'Error happened retrieving data from database'
    });
  });
});

router.post('/',function(req,res){
  const {signature} = req.body;
  const {user_id,first,last} = req.session.user;
  if(!signature){
    //if signature (<canvas>) is not filled, just render the 'petition' template again with an error message, then exit the function
    return res.render('petition',{
      first: first,
      last: last,
      showError: true,
    });
  }
  //if all <input> fields filled,save signature to database
  dbMethods.createSignature(user_id,signature)
  .then(function(){
    //redirect user away after saving signature
    res.redirect('/petition/signed');
  })
  .catch(function(err){
    console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
    res.render('error',{
      errorMessage: 'Error happened saving your signature into database'
    });
  });
});

router.get('/signed',function(req,res){
  //take user's id from cookies and  grab his signature from DB
  dbMethods.getSignature(req.session.user.user_id)
  .then(function(signature){
    const {first,last} = req.session.user;
    //pass the signature I got back to 'signed' template
    res.render('signed',{
      first: first,
      last: last,
      signature:signature
    });
  })
  .catch(function(err){
    console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
    res.render('error',{
      errorMessage: 'Error happened retrieving your signature from database'
    });
  })
});

router.get('/signers/:city?',function(req,res){
  //if 'city' passed to url, make specific query for those signers, otherwise retrieve them all
  let cityName;
  if(req.params.city){cityName=req.params.city.toLowerCase()}
  dbMethods.getSigners(cityName)
  .then(function(signers){
    //grab user's first and last name from cookie to populate navbar
    const {first,last} = req.session.user;
    const goal = req.session.goal;
    res.render('signers',{
      first: first,
      last: last,
      signers: signers,
      signersNumber: signers.length,
      goal: goal
    });
  })
  .catch(function(err){
    console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
    res.render('error',{
      errorMessage: 'Error happened retrieving data from database'
    });
  });
});

router.get('/delete',function(req,res){
  const {user_id} = req.session.user;
  dbMethods.deleteSignature(user_id)
  .then(function(){
    res.redirect('/petition');
  })
  .catch(function(err){
    console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
    res.render('error',{
      errorMessage: `Error deleting your signature`
    });
  });
});

module.exports = router;
