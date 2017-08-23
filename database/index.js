//export all database methods
const userMethods = require('./userMethods');
const signatureMethods = require('./signatureMethods');

module.exports = {...userMethods,...signatureMethods};
