const dbMethods = require('../db/methods');
const {publicize,privatize} = require('./middleware_helpers');

//set all routes used inside express app
module.exports = function(app){

  app.get('/register',function(req,res){
    res.render('register');
  });

  app.get('/login',function(req,res){
    res.render('login');
  });

  app.get('/petition',publicize,function(req,res){
    res.render('petition',{
      showError: false
    });
  });

  app.post('/petition',function(req,res){
    const {firstName,lastName,signature} = req.body;
    //if all <input> fields filled,save signed person to database
    if(firstName && lastName && signature){
      dbMethods.savePerson(firstName,lastName,signature)
      .then(function(result){
        //grab 'id' of currently saved signature on DB, and set it as cookie on user's browser
        req.session.userId = result.rows.pop().id;
        //redirect user away
        res.redirect('/signed');
      })
      .catch(function(err){
        res.send('Error happened saving data to DB');
      });
    } else {
      //if not all fields were filled, just render the petition page again with an error message
      res.render('petition',{
        showError: true
      });
    }
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
      res.send('Error happened retrieving data from DB');
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
      res.send('Error happened retrieving data from DB');
    });
  });

  //catch all request for unexisting routes
  app.get('*',function(req,res){
    res.redirect('/petition');
  });


};
