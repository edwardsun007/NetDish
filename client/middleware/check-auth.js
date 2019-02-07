/*
In order to grant user access to protected routes such as
delete post -- we don't want all user be able to do these to route like
edit post
....
this ts file handles the above task by these steps:
1. check user has a token attached to a request
2. validate the token attached to it
*/

const jwt = require('jsonwebtoken');

// experiment -- user router to navigate to login page
const router = require('@angular/router');

/* middleware should be function not class */
module.exports = (req, res, next) => {
  /* if its not authenticated there will be no token in header, so wrap it in try */
  try {
    const token = req.headers.authorization.split(" ")[1]; // 2nd part after Bearer space
    console.log('check-Auth token=',token);
    const decodedToken = jwt.verify(token,'secret_usually_should_be_long');   // verify the token, secret has to be same used for creating the token
    req.userData = {first_name:decodedToken.first_name, last_name: decodedToken.last_name, email: decodedToken.email, userId: decodedToken.userId};
    next();
  } catch (error) {
    // jwt.verify fails will also throw error, make sure its inside try block
    res.status(401).json({message:'check-Auth middleware error block->Auth failed!'});
  }
  // typical token format: "Bearer somelongtokenstring"
};
