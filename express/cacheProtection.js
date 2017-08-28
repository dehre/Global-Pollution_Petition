//use Redis cache for preventing hack attacks --> block users from making too many wrong <form> submissions
const redisCache = require('../database/redisCache');

module.exports = function(req,res){
  //get bad login email
  const {email} = req.body;
  //get back array of email that attempt bad login
  return redisCache.get(email)
  .then(function(wrongAttemptStr){
    //if that mail doesn't exist there, add it with value of 1
    if(!wrongAttemptStr){
      return redisCache.setex(email,20,1)
      .then(function(){return 1})
    }
    return wrongAttemptStr;
  })
  .then(function(wrongAttemptStr){
    const wrongAttempt = parseInt(wrongAttemptStr);
    if(wrongAttempt>=3){
      //if user tries bad login more than 3 times, give him punish time of 90sec, 180sec, 360 sec and so on
      const punishTime = 9*(2**(wrongAttempt-3));
      req.session.punishFailures = wrongAttempt;
      req.session.punishTime =punishTime;
      return redisCache.setex(email,punishTime,JSON.stringify(wrongAttempt+1));
    }
    return redisCache.setex(email,20,JSON.stringify(wrongAttempt+1));
  })
}
