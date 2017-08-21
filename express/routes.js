//middlewares to apply to specific routes
const {isSigned} = require('./middlewares.js');
//methods for working with database
const dbMethods = require('../db/methods');

//set all routes used inside express app
module.exports = function(app){

  app.get('/register',function(req,res){
    res.render('register');
  });

  app.post('/register',function(req,res){
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
      res.redirect('/profile');
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.render('error',{
        errorMessage: 'A user with this email exists already'
      });
    });
  });


  app.get('/login',function(req,res){
    res.render('login');
  });

  app.post('/login',function(req,res){
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
      res.redirect('/petition');
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      //redirect users to 'login' page with error message
      res.render('login',{showError:true});
    });
  });


  app.get('/profile',function(req,res){
    //grab existing user's profile data if any, then render 'profile' template using them
    const {user_id} = req.session.user;
    dbMethods.getUserProfile(user_id)
    .then(function(userProfile){
      res.render('profile',userProfile);
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.render('error',{
        errorMessage: `Error happened retrieving user's profile from database`
      });
    });
  });

  app.post('/profile',function(req,res){
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


  app.get('/petition',isSigned,function(req,res){
    //retrieve number of signed people
    dbMethods.getSigners()
    .then(function(signers){
      //grab user's first and last name from cookie to populate navbar
      const {first,last} = req.session.user;
      res.render('petition',{
        first: first,
        last: last,
        signersNumber: signers.length,
        goal: signers[0].petition_goal
      });
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.render('error',{
        errorMessage: 'Error happened retrieving data from database'
      });
    });
  });

  app.post('/petition',function(req,res){
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


  // CHANGE '/PETITION/SIGNED'
  app.get('/petition/signed',function(req,res){
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

  // CHANGE '/PETITION/SIGNERS'
  app.get('/petition/signers',function(req,res){
    //retrieve signed people's name from database and pass data to template
    dbMethods.getSigners()
    .then(function(signers){
      //grab user's first and last name from cookie to populate navbar
      const {first,last} = req.session.user;
      res.render('signers',{
        first: first,
        last: last,
        signers: signers,
        signersNumber: signers.length,
        goal: signers[0].petition_goal
      });
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.render('error',{
        errorMessage: 'Error happened retrieving data from database'
      });
    });
  });

  // CHANGE '/PETITION/SIGNERS/:CITY'
  app.get('/petition/signers/:city',function(req,res){
    dbMethods.getSigners(req.params.city.toLowerCase())
    .then(function(signers){
      //grab user's first and last name from cookie to populate navbar
      const {first,last} = req.session.user;
      res.render('signers',{
        first: first,
        last: last,
        signers: signers,
        signersNumber: signers.length,
        goal: signers[0].petition_goal
      });
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.render('error',{
        errorMessage: 'Error happened retrieving data from database'
      });
    });
  });


  app.get('/logout',function(req,res){
    req.session.user = null;
    res.redirect('/register');
  });

  app.get('/error',function(req,res){
    res.render('error',{
      errorMessage: 'Error happened retrieving data from database'
    });
  });

  //handle browser's requests for 'favicon.ico'
  app.get('/favicon.ico', function(req, res){
    res.status(204);
  });

  //catch all request for unexisting routes
  app.get('*',function(req,res){
    res.redirect('/petition');
  });

};
