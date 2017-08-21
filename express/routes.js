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
        errorMessage: 'Error happened creating new user into database'
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
    res.render('profile');
  });

  app.post('/profile',function(req,res){
    const {age,city,homepage} = req.body;
    console.log(age,city,homepage);
    res.redirect('/petition');
  });


  app.get('/petition',function(req,res){
    //retrieve number of signed people
    dbMethods.getSigners()
    .then(function(signers){
      return dbMethods.getPetitionGoal()
      .then(function(goal){
        return {
          signers: signers,
          goal: goal
        }
      })
    })
    .then(function(signersAndGoalObj){
      //grab user's first and last name from cookie to populate template
      const {first,last} = req.session.user;
      res.render('petition',{
        first: first,
        last: last,
        signersNumber: signersAndGoalObj.signers.length,
        goal: signersAndGoalObj.goal
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
    dbMethods.createSignature(user_id,first,last,signature)
    .then(function(){
      //redirect user away after saving signature
      res.redirect('/signed');
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.render('error',{
        errorMessage: 'Error happened saving your signature into database'
      });
    });
  });


  app.get('/signed',function(req,res){
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

  app.get('/signers',function(req,res){
    //retrieve signed people's name from database and pass data to template
    dbMethods.getSigners()
    .then(function(signers){
      return dbMethods.getPetitionGoal()
      .then(function(goal){
        return {
          signers: signers,
          goal: goal
        }
      })
    })
    .then(function(signersAndGoalObj){
      const {first,last} = req.session.user;
      res.render('signers',{
        first: first,
        last: last,
        signers: signersAndGoalObj.signers,
        signersNumber: signersAndGoalObj.signers.length,
        goal: signersAndGoalObj.goal
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
