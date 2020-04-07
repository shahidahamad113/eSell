var express=require("express");
var router =express.Router();
var passport=require("passport");
var User=require("../models/user");
var Aucground=require("../models/aucground");
var message=require("../models/message");
var comment=require("../models/comment");
var async=require("async");
var nodemailer=require("nodemailer");
var crypto=require("crypto");
var middleware=require("../middleware");
var multer = require('multer');
var path = require('path');
var storage = multer.diskStorage({
    destination: './public/user/',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  var upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('image');

  function checkFileType(file, cb){
   var filetypes = /jpeg|jpg|png|gif/;
   var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
   var mimetype = filetypes.test(file.mimetype);
 
   if(mimetype && extname){
     return cb(null,true);
   } else {
     cb('Error: Images Only!');
   }
 }

router.get("/",function(req,res){
    res.render("landing");
});
;


router.get("/register",function(req,res){
   res.render("register");
});
router.post("/register",function(req,res){
   upload(req,res,(err)=>{

   var newUser=new User(
      {
         username:req.body.username,
         firstName:req.body.firstName,
         lastName:req.body.lastName,
         contact:req.body.contact,
         email:req.body.email,
         avatar:"user/"+req.file.filename
      });
   if(req.body.admincode==='secret'){
      newUser.isAdmin=true;
   }
   User.register(newUser,req.body.password,function(err,user){
       if(err){
           req.flash("error",err.message);
           return res.render("register");
       }
       passport.authenticate("local")(req,res,function(){
        req.flash("success","Welcome to eSell "+user.username);
           res.redirect("/aucgrounds");
       })
   });
});
});

router.get("/login",function(req,res){
   res.render("login");
});

router.post("/login",passport.authenticate("local",
   {  
       successRedirect:"/aucgrounds",
       failureRedirect:"/login",
       failureFlash:true,
       }),
       function(req,res){
});

router.get("/logout",function(req,res){
   req.logout();
   req.flash("success","Logged you out");
   res.redirect("/aucgrounds");
});

router.get("/forgot",function(req,res){
   res.render("forgot");
});
router.post("/forgot",function(req,res,next){
   async.waterfall([
      function(done){
         crypto.randomBytes(20,function(err,buf){
            var token=buf.toString("hex");
            done(err,token);
         });
      },
      function(token,done){
         User.findOne({email:req.body.email},function(err,user){
            if(!user){
               req.flash("error","No accouont with that email address exists");
               return  res.redirect("/forgot");
            }
            user.resetPasswordToken=token;
            user.resetPasswordExpires=Date.now()+3600000; //1 hour

            user.save(function(err){
               done(err,token,user);
            });
         });
      },
      function(token,user,done){
         var smtpTransport=nodemailer.createTransport({
            service:"Gmail",
            auth:{
               user:"shahidaf830@gmail.com",
               pass:8573901254
            }
         });
         var mailOptions={
            to:user.email,
            from:"shahidaf830@gmail.com",
            subject:"NOde.js Password Reset",
            text:"This is Shahid and You have requested tp reset your password"+
            "Please click on the following link" + " " +
            "http://" + req.headers.host + "/reset/"+token + "\n\n"+
            "If you did not Ignore kar be"
         };
         smtpTransport.sendMail(mailOptions,function(err){
            console.log("mail sent");
            req.flash("success","An e-mail has been sent to "+ user.email+" with further instructions")
            done(err,"done");
         });
      }
   ],function(err){
      if(err) return next(err);
      res.redirect("/forgot");
   });
});
router.get("/reset/:token",function(req,res){
   User.findOne({resetPasswordToken:req.params.token,resetPasswordExpires:{$gt:Date.now()}},function(err,user){
      if(!user){
         req.flash("error","Password reset taken is invalid or has expired");
         return res.redirect("/forgot");
      }
      res.render("reset",{token:req.params.token});
   });
});
router.post("/reset/:token",function(req,res){
   async.waterfall([
      function(done){
         User.findOne({resetPasswordExpires:req.params.token,resetPasswordExpires:{$gt:Date.now()}},function(err,user){
            if(!user){
               req.flash("error","Password reset taken is invalid or has expired");
               return res.redirect("back");
            }
            if(req.body.password==req.body.confirm){
               user.setPassword(req.body.password,function(err){
                  user.resetPasswordToken=undefined;
                  user.resetPasswordExpires=undefined;
                  user.save(function(err){
                     req.logIn(user,function(err){
                        done(err,user);
                     });
                  });
               });
            }else{
               req.flash("error","password do not match");
               return res.redirect("back");
            }
         });
      },
      function(user,done){
         var smtpTransport=nodemailer.createTransport({
            service:"Gmail",
            auth:{
               user:"shahidaf830@gmail.com",
               pass:8573901254
            }
         });
         var mailOptions={
            to:user.email,
            from:"shahidaf830@gmail.com",
            subject:"Your password has been changed",
            text:"This is Shahid \n\n" + "This is a confirmation that the password fro your account "
            + user.email + " has just updated"
         };
         smtpTransport.sendMail(mailOptions,function(err){
            console.log("mail sent");
            req.flash("success","An e-mail has been sent to "+ user.email+" with further instructions")
            done(err,"done");
         });
      }
   ],function(err){
      res.redirect("/aucgrounds");
   });
})
router.get("/users/:id",function(req,res){
   User.findById(req.params.id).populate("follow").exec(function(err,found){
      if(err){
         req.flash("error","Something went wrong");
         res.redirect("/aucgrounds");
      }
     else{
      Aucground.find().where("author.id").equals(found._id).exec(function(err,aucgrounds){
         if(err){
            req.flash("error","Something went wrong");
           res.redirect("/aucgrounds");
         }
         else{
            res.render("users/show",{user:found,aucgrounds:aucgrounds});
         }
      });
     }
   });
});
router.post("/users/:id/follow", middleware.isLoggedIn, function (req, res) {
   User.findById(req.params.id, function (err, foundaucground) {
       if (err) {
           console.log(err);
           return res.redirect("back");
       }

       // check if req.user._id exists in foundCampground.follow
       var foundUserFollow = foundaucground.follow.some(function (follow) {
           return follow.equals(req.user._id);
       });

       if (foundUserFollow) {
           // user already followed, removing follow
           foundaucground.follow.pull(req.user._id);
       } else {
           // adding the new user follow
           foundaucground.follow.push(req.user);
       }

       foundaucground.save(function (err) {
           if (err) {
               console.log(err);
               return res.redirect("back");
           }
           return res.redirect("back");
       });
   });
});
router.get("/:id/profile",function(req,res){
   User.findById(req.params.id,function(err,found){
      if(err){
        req.flash("error","Something went wrong");
        res.redirect("/aucgrounds");
            }
      else{
         res.render("profile",{user:found});
      }
   });
});
router.put("/:id",function(req,res){
   User.findById(req.params.id,function(err,lound){
      if(err){
         res.redirect("/aucgrounds");
      }
      else{
         var name=lound.username;
         lound.username=req.body.username;
         lound.avatar=req.body.avatar;
         lound.contact=req.body.contact;
         lound.firstName=req.body.firstName;
         lound.lastName=req.body.lastName;
         lound.save();
         Aucground.find().where("author.id").equals(lound._id).exec(function(err,done){
         if(err){
         }else{   
            done.forEach(function(element){
               element.author.username=req.body.username;
               element.author.avatar=req.body.avatar;
               element.author.contact=req.body.contact;
               element.author.firstName=req.body.firstName;
               element.author.lastName=req.body.lastName;
               element.save();
            })
         }
      });
      message.find({newName:name},function(err,got){
         if(err){
            console.log(err);
         }else{
            got.forEach(function(element){
               element.newName=req.body.username;
               element.newAvatar=req.body.avatar;
               element.save();
            })
            res.redirect("/aucgrounds");
         }
      });
      comment.find().where("author.id").equals(lound._id).exec(function(err,done){
         if(err){
            console.log(err);
         }else{
            done.forEach(function(element){
               element.author.username=req.body.username;
               element.author.avatar=req.body.avatar;
               element.author.contact=req.body.contact;
               element.author.firstName=req.body.firstName;
               element.author.lastName=req.body.lastName;
               element.save();
            })
         }
      })
      }
   })
})
module.exports=router;