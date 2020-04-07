var aucground=require("../models/aucground");
var Comment=require("../models/comment");
var middlewareObj={};
middlewareObj.checkAucgroundOwnership=function(req,res,next){
    if(req.isAuthenticated()){
        aucground.findById(req.params.id,function(err,found){
            if(err){
                req.flash("error","not found!!");
                res.redirect("back");
            } else{
                if(found.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error","You dont have Pemission");
       res.redirect("back");  
    }
}
middlewareObj.checkCommentOwnership=function(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,found){
            if(err){
                res.redirect("back");
            } else{
                if(found.author.id.equals(req.user._id)|| req.user.isAdmin){
                    next();
                }else{
                    req.flash("error","You dont have Permission");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error","You need to be logged in to do that");
       res.redirect("back");  
    }
}
middlewareObj.isLoggedIn=function(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error","You need to be logged in to do that");
        res.redirect("/login");
}
module.exports=middlewareObj;