const jwt = require ('jsonwebtoken');

module.exports = {
  decodeMod: function(token) {
      try {
        const decoded = jwt.verify(token, 'secret_usually_should_be_long');
        console.log('decoded.first_name=',decoded.first_name);
      } catch (error) {
        console.error(error);
      }
  }
};
