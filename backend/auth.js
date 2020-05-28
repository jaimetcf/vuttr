const jwt = require('jsonwebtoken');

require('./globals');
const HttpError = require('./http-error');


module.exports = (req, res, next) => {

  if (req.method === 'OPTIONS') {  
    // If request is a CORS client checking, allows it
    return next();
  }

  try {
    // Extracts token from request header
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    
    if (!token) {
      // If request has no token at all
      console.log('getAuth => No token');
      throw new HttpError('Authentication failed!', UNAUTHENTICATED );
    }

    // If this verify method does not throw an error, the token matches
    const decodedToken = jwt.verify(token, VUTTR_AUTH_KEY);
    req.userData = { userId: decodedToken.userId };
    
    // AUTHENTICATION SUCCEED !
    // So, allows request to proceed and be treated by the assigned endpoint
    console.log('getAuth => Authentication succeed!');
    next();  

  } catch (err) {
    // Token does not match 
    console.log('getAuth => Token does not match');
    return next( new HttpError('Authentication failed!', UNAUTHENTICATED ) );
  }
};
