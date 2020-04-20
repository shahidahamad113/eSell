var express=require("express");
var router =express.Router();
var aucground=require("../models/aucground");
var middleware=require("../middleware");
var user=require("../models/user");
var notification=require("../models/notification");
var multer = require('multer');
var path = require('path');
var notifications=require('../models/notification');
var storage = multer.diskStorage({
    destination: './public/uploads/',
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
router.get("/", function(req, res){
    
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        aucground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allaucgrounds) {
            aucground.count({name: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allaucgrounds.length < 1) {
                        noMatch = "No  match found, please try again.";
                    }
                   res.render("aucground/indexx", {
                    aucground: allaucgrounds,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage),
                    noMatch: noMatch,
                    search: req.query.search
                });
                }
            });
        });
    } else {
        aucground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allaucgrounds) {
            aucground.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {  
                   res.render("aucground/indexx", {
                    aucground: allaucgrounds,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage),
                    noMatch: noMatch,
                    search: false
                });
                }
            });
        });
    }
});
router.post("/",middleware.isLoggedIn,function(req,res){
    upload(req,res,(err)=> {
        var name=req.body.name;
		var	image="uploads/"+req.file.filename;
        var description=req.body.description;
        var category=req.body.category;
        var price=req.body.price;
        var author={
            id:req.user._id,
            username:req.user.username,
            avatar:req.user.avatar,
            contact:req.user.contact,
            firstName:req.user.firstName,
            lastName:req.user.lastName,
        }
            var newAucgrounds={
             name: name,
             image: image,
             description:description,
             category:category,
             author:author,
             price:price,
            }
        aucground.create(newAucgrounds,function(err,newlyCreated){
            if(err){
                console.log(err);
            }
            else{
             req.flash("success","Successfully added");
                res.redirect("/aucgrounds");
            }
        });
      });
});

router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    aucground.findById(req.params.id, function (err, foundaucground) {
        if (err) {
            console.log(err);
            return res.redirect("/aucgrounds");
        }
        var foundUserLike = foundaucground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            foundaucground.likes.pull(req.user._id);
        } else {
            foundaucground.likes.push(req.user);
        }

        foundaucground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/aucgrounds");
            }
            user.findById(foundaucground.author.id,function(err,Data){
                if(err){
                    console.log(err);
                }else{
                    newNotification={
                        text:"liked",
                        user:req.user._id
                    };
                    notification.create(newNotification,function(err,done){
                        if(err){
                            console.log(err);
                        }else{
                            Data.Notification.push(done);
                            Data.save();
                            return res.redirect("/aucgrounds/" + foundaucground._id);
                        }
                    })
                }
            })
        });
    });
 });
 router.get("/category",function(req,res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        aucground.find({category: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allaucgrounds) {
            aucground.count({name: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allaucgrounds.length < 1) {
                        noMatch = "Yet Have to be Add.";
                    }
                    console.log(allaucgrounds);
                    res.render("aucground/category", {
                        aucground: allaucgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
            });
        });
    }
 });
router.get("/new",middleware.isLoggedIn,function(req,res){
    req.flash("error","You need to be logged in to do that");
   res.render("aucground/new");
});
router.get("/:id",function(req,res){   
    aucground.findById(req.params.id).populate("comments likes").exec(function(err,found){
        if(err){
            console.log(err);
        }
        else{
            res.render("aucground/show",{aucground:found});
        }
    });
});


router.get("/:id/edit",middleware.checkAucgroundOwnership,function(req,res){
    aucground.findById(req.params.id,function(err,found){
        if(err){
            req.flash("error","You dont have permission");
            res.redirect("/aucgrounds");
        }
        else{
            res.render("aucground/edit",{aucground:found});   
        }
    });
});
router.put("/:id",middleware.checkAucgroundOwnership,function(req,res){
    upload(req,res,(err)=>{
        aucground.findByIdAndUpdate(req.params.id,req.body.aucground,function(err,UpdatedStatus){
        if(err){
            res.redirect("/aucgrounds");
        }
        else{
            res.redirect("/aucgrounds/"+ req.params.id);
        }
    });
    })
});
router.delete("/:id",middleware.checkAucgroundOwnership,function(req,res){
    aucground.findByIdAndRemove(req.params.id,function(err,found){
        if(err){
            res.redirect("/aucgrounds");
        }else{
            req.flash("success","Successfully deleted");
            res.redirect("/aucgrounds");
        }
    });
});
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");
};

module.exports=router;