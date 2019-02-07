var mongoose = require('mongoose');
var path = require('path');

var fs = require('fs');

mongoose.connect('mongodb+srv://dev007:GsKRfHS2DVIkqG3z@cluster0-wumrx.gcp.mongodb.net/netdish?retryWrites=true')
.then(
	() => {
		console.log("Connected to database!");
})
.catch(() => {
    console.log("Connection failed!");
});
// var uristring =
// 	process.env.MONGOLAB_URI ||
// 	process.env.MONGOHQ_URL ||
// 	'mongodb://bruce:bruce@ds261917.mlab.com:61917/food'
// mongoose.connect(uristring);
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'db connection error:'));
// db.once('open', function() {
//   console.log('Connection to db successful!');
// });

var models_path = path.join(__dirname, './../models');

fs.readdirSync(models_path).forEach(function(file){
	if(file.indexOf('.js') >= 0) {
    // require the file (this runs the model file which registers the schema)
	    require(models_path + '/' + file);
	}
})
