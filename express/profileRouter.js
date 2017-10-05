const express = require('express');
const router = express.Router();
//middleware for preventing csrf attacks on <form> submissions
const {csrfProtection} = require('./middlewares');
//methods for working with database
const dbMethods = require('../database');

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
      console.log(`Error POST '/profile' --> ${err}`);
      res.render('error',{errorMessage: `Error happened adding user's profile into database`});
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
        csrfToken: req.csrfToken(),
        showError: req.session.errorMessage
      });
      req.session.errorMessage = null;
    })
    .catch(function(err){
      console.log(`Error GET '/profile/edit' --> ${err}`);
      res.render('error',{errorMessage: `Error happened retrieving your data from database`});
    });
  })
  .post(function(req,res){
    const {firstName,lastName,email,age,city,homepage} = req.body;
    const {user_id} = req.session.user;
    if(!(firstName && lastName && email)){
      req.session.errorMessage = 'First Name, Last Name and Email fields are required';
      return res.redirect('/profile/edit');
    }
    //update user info inside database
    dbMethods.updateUserInfo(user_id,firstName,lastName,email,age,city.toLowerCase(),homepage)
    .then(function(changedUser){
      //update cookies
      req.session.user.first = changedUser.first;
      req.session.user.last = changedUser.last;
      req.session.successMessage = "Profile updated!";
      res.redirect('/petition');
    })
    .catch(function(err){
      console.log(`Error POST '/profile/edit' --> ${err}`);
      req.session.errorMessage = 'Sorry something went wrong. Please try again';
      return res.redirect('/profile/edit');
    });
  });


router.route('/edit/password')
  .all(csrfProtection)
  .get(function(req,res){
    res.render('editUserPassword',{
      first: req.session.user.first,
      csrfToken: req.csrfToken(),
      showError: req.session.errorMessage
    });
    req.session.errorMessage = null;
  })
  .post(function(req,res){
    const {oldPsw,newPsw,newPswAgain} = req.body;
    const {user_id} = req.session.user;
    if(newPsw !== newPswAgain){
      req.session.errorMessage = "New passwords weren't equal";
      return res.redirect('/profile/edit/password');
    }
    dbMethods.changePassword(user_id,oldPsw,newPsw)
    .then(function(pass){
      req.session.successMessage = "Password updated!";
      res.redirect('/petition');
    })
    .catch(function(err){
      console.log(`Error POST '/profile/edit/password' --> ${err}`);
      req.session.errorMessage = "Your old password wasn't right";
      return res.redirect('/profile/edit/password');
    });
  });


module.exports = router;
