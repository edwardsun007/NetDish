// express
const express = require("express");

// nodemailer
const nodemailer = require('nodemailer');

// mailer configuration
const transport = {
  service: 'gmail',
  auth: {
    user: 'netdishgo@gmail.com',
    pass: 'woailanqiu8'
  }
};

/* require models */
const User = require('../models/user');
const Food = require('../models/food');
const Order = require('../models/order');

/* router instance */
const router = express.Router();

// JWT
const jwt = require('jsonwebtoken');

// checkAuth middleware
const checkAuth = require('../../client/middleware/check-auth');

// bcrypt
const bcrypt = require("bcryptjs");

// multer middleware
const multer = require("multer");

// mime type mapping
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}

// multer configuration
const storage = multer.diskStorage({
  // destination executes whenever multer try to save file
  destination: (req, file, callback)=>{
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid){
      error = null;
    }
    callback(error, "server/uploads"); // this path is relative to server.js not route.js
  },
  filename: (req,file,cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');//replace whitespace with dash
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now()+ '.' + ext)
  }
})


//module.exports = function(app){ 
/* RESTFUL api */

/********  Food and Menu API **********/

// create new menu item route
// single("image"), one single file, we should look for req.body.image
// image is property
router.post('/foods', checkAuth, multer({storage: storage}).single('image'), (req,res)=>{
  const url = req.protocol + '://' + req.get("host");
  console.log('api post/foods->req.userData.userId=', req.userData.userId);
  var new_food = new Food({
    food_name: req.body.title,
    price: req.body.price,
    description: req.body.description,
    imagePath: url+ "/uploads/"+req.file.filename,
    creator: req.userData.userId
  });

  new_food.save()
    .then(
      createdFood=>{
        console.log('got createdFood.');
        res.status(201).json({
          message: 'food created',
          food: {
            createdFood
          }
        })
      }
    )
    .catch(err=>{
      console.log('new_food.save has err:',err);
      res.status(400).json({error:err});
    })
});

/* get all existing food */
router.get('/foods', (req, res)=> {
  Food.find({}, (err, foods)=>{
      if (err) {
          console.log("get all foods has err",err);
          res.status(401).json({error: err});
      } else {
          res.status(200).json({
            // userData: req.userData, // test
            data: foods
          });
      }
  })
});
/******************food api ends****************/

/*******  user API ********/

/* check_user is made for social login  */
router.post('/checkuser', (req, res)=> {
  console.log('routes->/checkuser starts');
    // console.log(req.body);
    if(req.body.email == null) {
      res.json("require email!");
    }
    else {
      User.findOne({email: req.body.email}, (err, user)=> {
        if(err) {
          console.log("err from check user: ", err);
          res.json({error:err});
        }
        else {
          if(user == null) {
            res.json({message:"none", user:user});
          }
          else {
            res.json({message:"yes", user:user});
          }
        }
      })
    }
})

/* get user level for front end access to certern menu */
router.get('/accesslevel/:id', (req, res)=>{
  User.findOne({_id:req.params.id})
    .then(
      user=>{
        if(!user){
          console.log('user not exists');
          res.status(500).json({error:'User not exist!'});
        }else{
          // return true of false value only
          if (user.user_level==9){
            res.status(200).json({admin: 1});
          }else{
            res.status(200).json({admin: 0});
          }
        }
      }
    )
    .catch(err=>{
      res.status(500).json({'message':'accesslevel api call failed.', error:err});
    })
})


/* reg and login */
router.post('/register', (req, res)=> {
    User.find({}, (err, users)=>{
      if(err) {
        console.log('find{} err:',err);
        res.status(500).json({error: err});
      }else{
        /* generate salt 1st */
        bcrypt.genSalt(10, (err, salt)=>{
          if(err){
            console.log('genSalt err:', err);
          } else {
            /* gen hash */
            bcrypt.hash(req.body.password, salt, (err,hash)=>{
              if (err) {
                console.log('bcrypt hash err',err)
              } else {
                const userIns = new User ({
                  email: req.body.email,
                  first_name: req.body.first_name,
                  last_name: req.body.last_name,
                  password: hash
                })
                   /* if user table is empty */
                if (users.length == 0) {
                  userIns.user_level = 9; // admin user code
                } else {
                  userIns.user_level = 0 // normal user code
                }

                /* save the instance of user not Model! */
                userIns.save( (err, new_user)=> {
                  if(err){
                    console.log('save user failed:',err);
                    res.status(500).json({error:err});
                  }else{
                    res.json({message: 'success', user:new_user})
                  }
                });
              }
            })
          }
        }) 
      }
    })
  });

  // non social user login
  router.post('/login', (req,res)=>{
    console.log('routes->/login starts');
    User.findOne({ email:req.body.email })
      .then( user=> {
        if(!user){
          res.status(401).json({error: 'Email Invalid'}); // change to general message later
        }
        // check password
        bcrypt.compare(req.body.password,  user.password, (err,result)=>{
          if(err){
            res.status(401).json({error: 'Password Invalid'}); // change to general msg
          }
          if(!result){
            res.status(401).json({error: 'Password Invalid'});
          } else { // success, creat token
            console.log('first_name=', user.first_name);
            console.log('user access=',user.user_level);
            const admin = (user.user_level==9)?true:false;
            const token = jwt.sign(
              {first_name: user.first_name, last_name: user.last_name, userId: user._id, email: user.email},
              'secret_usually_should_be_long',
              { expiresIn: '1h'}
            );
                      
            res.status(200).json({
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              token: token,
              expiresIn: 3600,  // secs of 1h
              userId: user._id,
              admin: admin
            });
          }
        })
      })
  });

  /* update/creater profile if social user not registered with us */
   router.post('/social_update', (req, res)=> {
    console.log('social_update api->req.body=', req.body);
    /*
    1st case user has to create profile with emailuser log in with gmail, user only provide password
    */
    var name = req.body.user.name.split(" ");
    var email;
    var user = new User();
    if (req.body.user.email == ""){
      user.email = req.body.reg.email;
    } else {
      user.email = req.body.user.email;
    }

    bcrypt.genSalt(10, (err, salt)=>{
      if(err){
        console.log('genSalt err:', err);
      } else {
        console.log('got salt:',salt);
        /* gen hash */
        bcrypt.hash(req.body.reg.password, salt, (err,hash)=>{
          if (err) {
            console.log('bcrypt hash err',err);
          } 
          else 
          {
            user.first_name = name[0];
            user.last_name = name[1];
            user.password = hash;
            user.user_level = 0;
            console.log('api checking created user=',user);
            user.save((err, new_user)=> {
              if(err){
                console.log('save user failed:',err);
                res.status(500).json({error:err});
              }else{
                res.json(new_user);
              }
            });
          }
        });
      }
    });
  });

  /****************** order and checkout ****************/
  router.post('/orders/:id', (req,res)=>{
      console.log('api /orders/id starts:');
      console.log(req.params.id);
      var user_id = req.params.id;
      var items = req.body;
      console.log('items=',items);
      User.findOne(
        {_id: user_id},
        (err, user)=>{
          if (err){
            console.log('err to find user',err);
          } else {
            // create new order for this user
            var order = new Order(); // new instance
            order.total_price=0;
            order.order_user = user._id;
            order.info = "";

            let body_part='';
            let attachments = []; // for embedded image purpose

            for (var i = 0; i < items.length; i++) {
              order.foods.push(items[i]);
              console.log(items[i].price * items[i].quantity);
              order.total_price+=(items[i].price * items[i].quantity);
              order.info += (items[i].food_name+": "+items[i].quantity+";");

              var filename = items[i].imagePath.split('/uploads/')[1]
              body_part+=`
                <div>
                <p>${items[i].food_name}</p>
                <br>
                <img src=\"cid:${items[i]._id}\" style="width:200px; height:200px;">
                <br>
                <p>Quantity: ${items[i].quantity}</p>
                <br>
                </div>`;
              attachments.push({
                filename:filename,
                path:items[i].imagePath,
                cid:items[i]._id
              })
            }
            console.log('check body_part=', body_part);
            console.log('check attachments=', attachments);
            order.save( (err)=>{
              if(err){
                console.log('err to save order:', err);
              } else {
                res.json({message: "order submit success"});
                let transporter = nodemailer.createTransport(transport);

                let body = `
                <div style="text-align: center;">
                    <h1> Thank you for choosing NetDish !</h1>
                    <hr>
                    <h3> Order Number: ${order._id}</h3>
                    <p style="font-weight:600;font-size:2em;">${user.first_name} ${user.last_name}</p>
                </div>`
                    + body_part +
                    `<p style="color:red; font-size:2em;">Order Total:<span style="color:gold">$</span> ${order.total_price}</p>
                    <p>Order date: ${order.createdAt}</p>
                    `;

                let mailList = [
                  user.email,
                  "netdishgo@gmail.com"
                ];

                let mailOptions = {
                  from:"netdishgo@gmail.com",
                  to: mailList,
                  subject: `Thank you for ordering on NetDish # ${order._id}`,
                  html: body,
                  attachments: attachments
                };

                transporter.sendMail(mailOptions, (error, info)=>{
                  if(error){
                    console.log('sendMail error!',error);
                  }else{
                    console.log('Email sent: ', info);
                  }
                });
              }
            });
          }
        }
      )
  });


  /****** like a food api ******/
  router.post('/like/:user_id/:food_id', (req, res)=>{
    console.log('like api starts');
    var userId = req.params.user_id;
    var foodId = req.params.food_id;
    console.log('check user_id=',userId);
    console.log('check food_id=',foodId);
    Food.findOne(
      {_id:foodId}
    ).populate("likeBy").exec( (err,food)=>{
      if(err){
        console.log('populate query err:',err);
        res.status(500).json({error:err});
      } else {
        console.log('likeBy[1] before:',food.likeBy[food.likeBy.length-1])
        food.likeBy.push(userId);
        console.log('check likeBy now:',food.likeBy[food.likeBy.length-1]);
        food.save((err)=>{
          if (err) {
            console.log(err);
            res.status(500).json({error:err});
          } else {
            res.status(200).json({message:'like success'});
          }
        })
      }
    }); 
  });

  /* order history APIs */
  // retrieve orders of single user
  router.get('/orders/:id', (req, res) => {
    console.log('order hist api starts');
    var userId = req.params.id;
    console.log(userId);
    Order.find({    // all orders in desc belong to this user
      order_user:userId
    }).sort({
      createdAt: "desc"
    }).populate('foods').exec( (err, order) => {
      if (err) {
        console.log("err in getOneOrder api:",err);
      } else {
        res.status(200).json(order);
      }
    }) // populate the fields that you need to return to Angular
  });


  router.get('/getallorders', (req, res) => {
    console.log('getallorder api starts');
    Order.find({}).populate("order_user").populate("foods").exec((err,orders)=>{
      if(err){
        console.log("err in getallorders api:",err);
      }else{
        res.status(200).json(orders);
      }
    })
  });


  /******** Delete a food *******/
  router.delete('/deletefood/:food_id', (req,res)=>{
      Food.deleteOne({_id: req.params.food_id}).then(
        result=>{
          if (result.n > 0){
            res.status(200).json({message: 'deleted successful'});
          }
        }
      ).catch(err=>{
        res.status(500).json({error:err});
      });
  });

module.exports = router;