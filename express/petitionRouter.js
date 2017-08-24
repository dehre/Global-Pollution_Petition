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
    //grab goal to populate progress-bar
    const goal = req.session.goal;
    //retrieve number of signed people
    dbMethods.getSigners()
    .then(function(signers){
      res.render('petition',{
        first: first,
        last: last,
        signersNumber: signers.length,
        goal: goal,
        csrfToken: req.csrfToken(),
        showMessage: req.session.successMessage
      });
      req.session.successMessage = null;
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.render('error',{
        errorMessage: 'Error happened retrieving data from database'
      });
    });
  })
  .post(function(req,res){
    const {signature} = req.body;
    const {user_id,first,last} = req.session.user;
    const goal = req.session.goal;
    if(!signature){
      //if signature (<canvas>) is not filled, just render the 'petition' template again with an error message, then exit the function
      return dbMethods.getSigners()
      .then(function(signers){
        res.render('petition',{
          first: first,
          last: last,
          signersNumber: signers.length,
          goal: goal,
          csrfToken: req.csrfToken(),
          showError: true
        });
      })
      .catch(function(err){
        console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
        res.render('error',{
          errorMessage: 'Error happened retrieving data from database'
        });
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
    //pass the signature I got back to 'signed' template
    res.render('signed',{
      first: req.session.user.first,
      signature:signature,
      showMessage: req.session.successMessage
    });
    req.session.successMessage = null;
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
    const goal = req.session.goal;
    res.render('signers',{
      first: req.session.user.first,
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


router.get('/signed/delete',function(req,res){
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
