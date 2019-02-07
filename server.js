var express = require('express');
var scrypt = require("scrypt");
var nodemailer = require("nodemailer");
var exphbs = require("express-handlebars");
var bodyParser = require('body-parser');
const debug = require('debug')('node-angular');

const apiRoutes = require('./server/config/routes'); // all API 

var path = require('path')

var app = express();

app.use(express.static(path.join(__dirname,'./client/dist')));

//app.use(bodyParser.urlencoded({extends: true}));

// app.use(bodyParser.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true})); // extended true will use qs lib instead of querystring in url

// server/uploads dir
app.use("/uploads", express.static(path.join("server/uploads")));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // node tell browser allow code from any origin to access our resource on server
    res.setHeader(
      "Access-Control-Allow-Headers", // node tell browser which HTTP header can be used
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    next();
  });

app.use('/api/', apiRoutes); // api prefix in url

var port = 8000;
app.set('port', (process.env.PORT || port));
var server = app.listen(app.get('port'), function () {
    console.log("App is running on port 8000!");
})

var io = require('socket.io').listen(server); 
// after server starts, then create instance of io for that running
// instance of express server

var users = [];
io.sockets.on('connection',  (socket)=> {
    console.log("Client/socket is connected!");
    console.log("Client/socket id is: ", socket.id);
    // all the server socket code goes in here
    socket.on('login', (data)=> {
        console.log('handle login event');
        console.log('data.user=', data.user); // data.user._id
        var user_not_existed = true;
        var user = {
            info: data.user, // { _id:, first_name: , last_name: } user.info._id = the real user id
            id: socket.id,   // user.id is socket.id
        }
        console.log('server check user.info=', user.info);
        console.log('server check user.info._id=',user.info._id);
        console.log('server check socketid=',user.id);
        for(var i=0; i < users.length; i++){
            if(users[i].id == user.id){  // filter by socket id, if socket id in local array ignore
                console.log('server found socket.id ignore this will not update users array!');
                user_not_existed = false;
            }
        }
        if(user_not_existed){
            users.push(user);
        }
        console.log(users)
        io.emit('online', { users:users });
        // parameter for data is users array
        // server emit online event to client both login and logout user event
    })

    socket.on('logout', function(data){
        console.log('server handle logout starts');
        console.log('current users array in server =',users);
        console.log('data.user._id=',data.user._id);
        var rest_user = users.filter(function(el){  // return array that exclude this user
            console.log('el.info._id=',el.info._id);
            return el.info._id != data.user._id;
        })
        users = rest_user;
        console.log('rest_user=', rest_user);
        io.emit('online',{users:users}); 
    })

    socket.on('disconnect', function(){
        console.log("disconnect id is: ", socket.id);
        var rest_user = users.filter(function(el){
            return el.id != socket.id;
        })
        users = rest_user;
        console.log(users.length)
        io.emit('online',{users:users});
    })
    socket.on('updatelike', function (data) { io.emit('updatelike', {}); })
  })


require('./server/config/mongoose.js');

//require('./server/config/routes.js')(app);