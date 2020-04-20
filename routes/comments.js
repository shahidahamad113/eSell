var express=require("express");
var router =express.Router({mergeParams:true});
var aucground=require("../models/aucground");
var Comment=require("../models/comment");
var user=require("../models/user");
var notification=require("../models/notification");
var middleware=require("../middleware");
router.get("/new",middleware.isLoggedIn,function(req,res){   
    aucground.findById(req.params.id,function(err,aucground){
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/new",{aucground:aucground})
        }
    });
});
router.post("/",middleware.isLoggedIn,function(req,res){   
    aucground.findById(req.params.id,function(err,aucground){
        if(err){
            console.log(err);
        }
        else{
          Comment.create(req.body.comment,function(err,comment){
            if(err){
                req.flash("error","Something went wrong");
                console.log(err);
            }
            else{
                comment.author.id=req.user._id;
                comment.author.username=req.user.username;
                comment.author.avatar=req.user.avatar;
                comment.save();
                aucground.comments.push(comment);
                aucground.save();
                user.findById(aucground.author.id,function(err,Data){
                    if(err){
                        console.log(err);
                    }else{
                        newNotification={
                            text:"commented",
                            user:req.user._id
                        };
                        notification.create(newNotification,function(err,done){
                            if(err){
                                console.log(err);
                            }else{
                                Data.Notification.push(done);
                                Data.save();
                                req.flash("error","Successfully added comment");
                                res.redirect("/aucgrounds/"+aucground._id);
                            }
                        })
                    }
                })
            }
        });
       }
    });
});
router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
    Comment.findById(req.params.comment_id,function(err,found){
        if(err){
            res.redirect("back");
        }else{
            res.render("comments/edit",{aucground_id:req.params.id,comment:found});
        }
    });

});
router.put("/:comment_id/",middleware.checkCommentOwnership,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,UpdatedCommented){
        if(err){
            res.redirect("back");
        }
        else{
            res.redirect("/aucgrounds/"+req.params.id);
        }
    });
});
router.post("/:comment_id/like",middleware.isLoggedIn,function(req,res){
    Comment.findById(req.params.comment_id,function(err,found){
        if(err){
            console.log(err);
            res.redirect("back");
        }else{
            var foundUserLike=found.likes.some(function(like){
                return like.equals(req.user._id);
            });
            if(foundUserLike){
                found.likes.pull(req.user._id);
            }else{
                found.likes.push(req.user);
            }
                found.save(function(err){
                    if(err){
                        console.log(err);
                        return res.redirect("/aucground");
                    }
                    return res.redirect("back");
                });
        }
    });
});
router.delete("/:comment_id",middleware.checkCommentOwnership,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            res.redirect("back");
        }
        else{
            req.flash("error","Comment Deleted Successfully");
            res.redirect("/aucgrounds/"+req.params.id);
        }
    });
});


module.exports=router;