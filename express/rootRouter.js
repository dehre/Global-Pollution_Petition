const express = require('express');
const router = express.Router();

//methods for working with database
const dbMethods = require('../database/methods');

//  // //  // //  // //  // //  // //  //
// ALL PATHS HERE ARE APPENDED TO '/' //
//  // //  // //  // //  // //  // // //

router.get('/register',function(req,res){
  res.render('register');
});

router.post('/register',function(req,res){
  const {firstName,lastName,email, password} = req.body;
  if(!(firstName && lastName && email && password)){
    //if not all fields were filled, just render the 'register' template again with an error message, then exit the function
    return res.render('register',{showError: true});
  }
  //if all <input> fields filled,save new user to database
  dbMethods.createUser(firstName,lastName,email,password)
  .then(function(result){
    //grab 'id','firstName','lastName' of new registered user, and set them as cookie on user's browser
    req.session.user = result;
    //set petition goal number as cookie (if app grows, allow user to select which petition is gonna see)
    return dbMethods.getPetitionGoal()
  })
  .then(function(goal){
    req.session.goal = goal;
    res.redirect('/profile');
  })
  .catch(function(err){
    console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
    res.render('error',{
      errorMessage: 'A user with this email exists already'
    });
  });
});

router.get('/login',function(req,res){
  res.render('login');
});

router.post('/login',function(req,res){
  const {email, password} = req.body;
  if(!(email && password)){
    //if not all fields were filled, just render the 'register' template again with an error message, then exit the function
    return res.render('login',{showError: true});
  }
  //if all <input> fields filled,retrieve person database
  dbMethods.getUser(email,password)
  .then(function(result){
    //set 'id','firstName','lastName' of logged in user as cookies on user's browser
    req.session.user = result;
    //set petition goal number as cookie (if app grows, allow user to select which petition is gonna see)
    return dbMethods.getPetitionGoal()
  })
  .then(function(goal){
    req.session.goal = goal;
    res.redirect('/petition');
  })
  .catch(function(err){
    console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
    //redirect users to 'login' page with error message
    res.render('login',{showError:true});
  });
});

router.get('/profile',function(req,res){
  res.render('profile');
});

router.post('/profile',function(req,res){
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

router.get('/profile/edit',function(req,res){
  //grab existing user's data, then render 'editUser' template using them
  const {user_id} = req.session.user;
  dbMethods.getUserInfo(user_id)
  .then(function(userProfile){
    res.render('editUser',userProfile);
  })
  .catch(function(err){
    console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
    res.render('error',{
      errorMessage: `Error happened retrieving user's personal data from database`
    });
  });
});

router.post('/profile/edit',function(req,res){
  const {firstName,lastName,email,age,city,homepage} = req.body;
  const {user_id} = req.session.user;
  //don't allow user to leave 'firstName','lastName' and 'email' empty, otherwise render the 'editUser' template again with an error message, then exit the function
  if(!(firstName && lastName && email)){
    return dbMethods.getUserInfo(user_id)
    .then(function(userProfile){
      res.render('editUser',{
        ...userProfile,
        showError: true
      });
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.render('error',{
        errorMessage: `Error happened retrieving user's personal data from database`
      });
    });
  }
  //update user info inside database
  dbMethods.updateUserInfo(user_id,firstName,lastName,email,age,city,homepage)
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

router.get('/logout',function(req,res){
  req.session = null;
  res.redirect('/register');
});

//handle browser's request for 'favicon.ico'
router.get('/favicon.ico', function(req, res){
  res.redirect('/static/images/favicon.ico');
});

module.exports = router;
