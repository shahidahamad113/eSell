var express=require("express");
var router=express.Router({mergeParams:true});
var aucground=require("../models/aucground");
var user=require("../models/user");
var Message=require("../models/message");
var room=require("../models/room");
var middleware=require("../middleware");

router.get("/chat/new",middleware.isLoggedIn,function(req,res){

    user.findById(req.params.id,function(err,found){
        if(err){
            console.log(err);
        }else{
            user.findById(req.user._id).populate("messages").exec(function(err,foundData){
                if(err){
                    console.log(err);
                }else{
                    Message.find({}).populate("Room").exec(function(err,done){
                        if(err){
                            console.log(err);
                        }else{
                            res.render("chat/new",{seller:found,MyData:foundData,messageNew:done});
                        }
                    });
                }
            })
         }
    });
});
router.post("/chat/",middleware.isLoggedIn,function(req,res){
    if(req.user._id==req.params.id){
        console.log(req.user._id);
        req.flash("error","You Cant text Yourself");
        req.redirect("back");
    }
   user.findById(req.params.id).populate("messages").exec(function(err,found){
       if(err){
           console.log(err);
       }else{
        var text=req.body.text;
        var newUser=req.user._id;
        var newName=req.user.username;
        var newAvatar=req.user.avatar;
        var sender=req.params.id;
        var username=found.username;
        var avatar=found.avatar;
        var RoomMessage={
            text:text,
            username:req.user.username
        }
        var author={
            id:req.user._id
        };
        var data;
        found.messages.forEach(function(element){
            if(element.username===newName && element.newName===username){
                data=element._id;
            }
        });
        Message.find(data,function(err,done){
            if(err){
                console.log(err);
            }else{
                if(data===undefined){
                    console.log("1");
                    room.create(RoomMessage,function(err,newRoom){
                        if(err){
                            console.log(err);
                        }else{
                            var message={
                                Room:newRoom._id,
                                newUser:sender,
                                 newName:username,
                                newAvatar:avatar,
                                sender:newUser,
                                username:newName,
                                avatar:newAvatar,
                                author:author
                            };
                            Message.create(message,function(err,newMessage){
                                if(err){
                                    console.log(err);
                                }else{
                                    found.messages.push(newMessage);
                                    found.save();
                                    user.findById(req.user._id).populate("messages").exec(function(err,fond){
                                        if(err){
                                            console.log(err);
                                        }else{
                                            var Ndata;
                                            luther={
                                                id:req.params.id
                                            }
                                            var messages={
                                                Room:newRoom._id,
                                                newUser:newUser,
                                                newName:newName,
                                                newAvatar:newAvatar,
                                                sender:sender,
                                                username:username,
                                                avatar:avatar,
                                                author:luther
                                            };
                                            fond.messages.forEach(function(element){
                                                if(element.newName===username && element.username===username){
                                                    Ndata=element._id;
                                                }
                                            });
                                            if(Ndata===undefined){
                                                Message.create(messages,function(err,newMessage){
                                                    if(err){
                                                        console.log(err);
                                                    }else{
                                                        fond.messages.push(newMessage);
                                                        fond.save();
                                                        res.redirect("back");
                                                    }
                                                })
                                            }
                                            else{
                                             var id;
                                             fond.messages.forEach(function(data){
                                                 if(data.newName===newName){
                                                     id=data._id;
                                                 }
                                             });
                                             Message.findById(id,function(err,done){
                                                 if(err){
                                                     console.log(err);
                                                 }else{
                                                     done.Room.push(newRoom);
                                                     done.save();
                                                     res.redirect("back");
                                                 }
                                             })
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                }else{
                    console.log("kya karu yaar");
                   Message.findById(data,function(err,done){
                       if(err){
                           console.log(err);
                       }else{
                        room.create(RoomMessage,function(err,newRoom){
                            if(err){
                                console.log(err);
                            }else{
                                console.log("Disha");
                                done.Room.push(newRoom);
                                done.save();
                                user.findById(req.user._id).populate("messages").exec(function(err,fond){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        var Ndata;
                                        luther={
                                            id:req.params.id
                                        }
                                        var messages={
                                            Room:newRoom._id,
                                            newUser:newUser,
                                            newName:newName,
                                            newAvatar:newAvatar,
                                            sender:sender,
                                            username:username,
                                            avatar:avatar,
                                            author:luther
                                        };
                                        fond.messages.forEach(function(element){
                                            if(element.newName===newName && element.username===username){
                                                Ndata=element._id;
                                            }
                                        });
                                        if(Ndata===undefined){
                                            Message.create(messages,function(err,newMessage){
                                                if(err){
                                                    console.log(err);
                                                }else{
                                                    fond.messages.push(newMessage);
                                                    fond.save();
                                                    res.redirect("back");
                                                }
                                            })
                                        }
                                        else{
                                         var id;
                                         console.log(fond);
                                         fond.messages.forEach(function(data){
                                             if(data.newName===newName && data.username===username){
                                                 id=data._id;
                                             }
                                         });
                                         Message.findById(id,function(err,done){
                                             if(err){
                                                 console.log(err);
                                             }else{
                                                 console.log(done);
                                                 done.Room.push(newRoom);
                                                 done.save();
                                                 res.redirect("back");
                                             }
                                         })
                                        }
                                    }
                                });
                            }
                        });
                       }
                   })
                }
            }
        });
       }
   });
});
module.exports=router;