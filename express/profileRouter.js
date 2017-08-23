const express = require('express');
const router = express.Router();
//middleware for preventing csrf attacks on <form> submissions
const {csrfProtection} = require('./middlewares');
//methods for working with database
const dbMethods = require('../database/methods');

//  // //  // //  // //  // //  // //  //
// ALL PATHS HERE ARE APPENDED TO '/profile' //
//  // //  // //  // //  // //  // // //

router.route('/')
  .all(csrfProtection)
  .get(function(req,res){
    res.render('profile',{
      csrfToken: req.csrfToken()
    });
  })
  .post(function(req,res){
    const {age,city,homepage} = req.body;
    const {user_id} = req.session.user;
    dbMethods.createUserProfile(user_id,age,city.toLowerCase(),homepage)
    .then(function(){
      res.redirect('/petition');
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.render('error',{
        errorMessage: `Error happened adding user's profile into database`
      });
    });
  });


router.route('/edit')
  .all(csrfProtection)
  .get(function(req,res){
    //grab existing user's data, then prepopulate fields inside 'editUser' template
    const {user_id} = req.session.user;
    dbMethods.getUserInfo(user_id)
    .then(function(userProfile){
      res.render('editUser',{
        ...userProfile,
        csrfToken: req.csrfToken()
      });
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.render('error',{
        errorMessage: `Error happened retrieving user's personal data from database`
      });
    });
  })
  .post(function(req,res){
    const {firstName,lastName,email,age,city,homepage} = req.body;
    const {user_id} = req.session.user;
    //update user info inside database
    dbMethods.updateUserInfo(user_id,firstName,lastName,email,age,city.toLowerCase(),homepage)
    .then(function(){
      res.redirect('/petition');
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.render('error',{
        errorMessage: `Error happened updating user's personal info into database`
      });
    });
  });


router.route('/edit/password')
  .all(csrfProtection)
  .get(function(req,res){
    res.render('editUserPassword',{
      first: req.session.user.first,
      csrfToken: req.csrfToken()
    });
  })
  .post(function(req,res){
    const {oldPsw,newPsw,newPswAgain} = req.body;
    const {user_id} = req.session.user;
    if(newPsw !== newPswAgain){
      //if new passwords don't match, just render the 'editUserPassword' template again with an error message, then exit the function
      return res.render('editUserPassword',{
        first: req.session.user.first,
        showError: true,
        csrfToken: req.csrfToken()
      });
    }
    dbMethods.changePassword(user_id,oldPsw,newPsw)
    .then(function(pass){
      res.redirect('/petition');
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.render('error',{
        errorMessage: `Error happened updating password`
      });
    });
  });


module.exports = router;
