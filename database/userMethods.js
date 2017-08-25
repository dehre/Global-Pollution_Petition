const db = require('./db');
//import useful functions for hashing passwords
const {hashPassword,checkPassword} = require('./hashing');
const redisCache = require('./redisCache');


//create new user inside 'users' table
module.exports.createUser = function(firstName,lastName,email,password){
  //hash user's password before putting into database
  return hashPassword(password)
  .then(function(hash){
    //set up query to put data into DB
    const query = 'INSERT INTO users (first,last,email,password) VALUES ($1,$2,$3,$4) RETURNING id,first,last';
    return db.query(query,[firstName,lastName,email,hash]);
  })
  .then(function(userData){
    //return from promise 'id','firstName','lastName' of newly registered user
    return {
      user_id:userData.rows[0].id,
      first:userData.rows[0].first,
      last:userData.rows[0].last,
    }
  });
}

//retrieve existing user from 'users' database
module.exports.getUser = function(email,plainTextPassword){
  //search by 'email' into 'users' database
  const query = 'SELECT id,first,last,email,password FROM users WHERE email = $1';
  return db.query(query,[email])
  .then(function(userData){
    //create object containing useful user's data
    return {
      id:userData.rows[0].id,
      first:userData.rows[0].first,
      last:userData.rows[0].last,
      email:userData.rows[0].email,
      hashedPassword:userData.rows[0].password
    }
  })
  .then(function(userObj){
    //compare saved password with new one provided from user
    return checkPassword(plainTextPassword,userObj.hashedPassword)
    .then(function(doesMatch){
      //if passwords match return from promise 'id','firstName','lastName' of currently searched user, otherwise throw an error
      if(!doesMatch){
        throw 'Passwords do not match!';
      }
      return {
        user_id: userObj.id,
        first: userObj.first,
        last: userObj.last
      };
    })
  });
}

//save-update user's profile inside 'user_profiles' table
module.exports.createUserProfile = function(user_id,age,city,homepage){
  //set optional values to NULL if not provided
  if(!age){age=null};
  if(!city){city=null};
  if(!homepage){homepage=null};
  const query = 'INSERT INTO user_profiles (user_id,age,city,homepage) VALUES ($1,$2,$3,$4)';
  return db.query(query,[user_id,age,city,homepage]);
}

// get user's informatins (first,last,email,age,city,homepage) given his 'id'
module.exports.getUserInfo = function(user_id){
  //search by 'user_id' from 'user_profiles' table
  const query = 'SELECT first,last,email,age,city,homepage FROM users JOIN user_profiles ON users.id = user_profiles.user_id WHERE user_id = $1';
  return db.query(query,[user_id])
  .then(function(userObj){
    return userObj.rows[0]
  });
}

//allow user to change his personal data
module.exports.updateUserInfo = function(user_id,firstName,lastName,email,age,city,homepage){
  //update data into both 'users' and 'user_profiles' table
  //set optional values to NULL if not provided
  if(!age){age=null};
  if(!city){city=null};
  if(!homepage){homepage=null};
  const query = 'UPDATE user_profiles SET age=$2, city=$3,homepage=$4 WHERE user_id=$1';
  return db.query(query,[user_id,age,city,homepage])
  .then(function(){
    const query = 'UPDATE users SET first=$2, last=$3,email=$4 WHERE id=$1 RETURNING first,last';
    return db.query(query,[user_id,firstName,lastName,email])
  })
  .then(function(firstLastObj){
    return firstLastObj.rows[0]
  })
  .then(function(firstLast){
    //clear Redis cache, and keep first-last name passed
    return redisCache.set('signers','')
    .then(function(){
      return firstLast
    })
  });
}

//allow user to change his password
module.exports.changePassword = function(user_id,oldPsw,newPsw){
  //search password by 'id' into 'users' database
  const query = 'SELECT password FROM users WHERE id = $1';
  return db.query(query,[user_id])
  .then(function(passwordObj){
    //grab the hashed old password
    return passwordObj.rows[0].password
  })
  .then(function(databasePassword){
    //compare saved password with the one provided from user
    return checkPassword(oldPsw,databasePassword)
  })
  .then(function(doesMatch){
    //if passwords match hash the new one and save into database, otherwise throw an error
    if(!doesMatch){
      throw 'Passwords do not match!';
    }
    return hashPassword(newPsw)
  })
  .then(function(hash){
    //set up query to put data into DB
    const query = 'UPDATE users SET password=$1 WHERE id=$2';
    return db.query(query,[hash,user_id]);
  })
}
