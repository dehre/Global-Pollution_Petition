const dbMethods = require('../db/methods');
const {publicize,privatize} = require('./middleware_helpers');

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
    .then(function(id){
      console.log('User saved! id retrieved is',id);
      res.send('saved!')
    })
    .catch(function(err){
      res.send(`Error happened saving new user into DB. Error is:\n${err}`);
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
    res.send('retrieved from database!');
  });


  app.get('/petition',publicize,function(req,res){
    res.render('petition');
  });

  app.post('/petition',function(req,res){
    const {firstName,lastName,signature} = req.body;
    if(!(firstName && lastName && signature)){
      //if not all fields were filled, just render the 'petition' template again with an error message, then exit the function
      return res.render('petition',{showError: true});
    }
    //if all <input> fields filled,save signed person to database
    dbMethods.savePerson(firstName,lastName,signature)
    .then(function(result){
      //grab 'id' of currently saved signature on DB, and set it as cookie on user's browser
      req.session.userId = result.rows.pop().id;
      //redirect user away
      res.redirect('/signed');
    })
    .catch(function(err){
      res.send(`Error happened saving data to DB. Error is:\n${err}`);
    });
  });

  app.get('/signed',privatize,function(req,res){
    //take user's id from cookies and  grab his signature from DB
    dbMethods.getSignature(req.session.userId)
    .then(function(signature){
      //pass the signature I got back to 'signed' template
      res.render('signed',{
        signature:signature.rows.pop().signature
      });
    })
    .catch(function(err){
      res.send(`Error happened retrieving data from DB. Error is:\n${err}`);
    })
  });

  app.get('/signers',function(req,res){
    //retrieve signed people's name from database and pass data to template
    dbMethods.retrievePeople()
    .then(function(results){
      res.render('signers',{
        signers: results.rows
      });
    })
    .catch(function(err){
      res.send(`Error happened retrieving data from DB. Error is:\n${err}`);
    });
  });

  //catch all request for unexisting routes
  app.get('*',function(req,res){
    res.redirect('/petition');
  });


};
