var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");
var bcrypt=require("bcrypt");
var UserSchema=new mongoose.Schema({
    username:String,
    password:String,
    avatar:String,
    contact:String,
    firstName:String,
    lastName:String,
    email:{type:String,unique:true,required:true},
    resetPasswordToken:String,
    resetPasswordExpires:Date,
    isAdmin:{type:Boolean,default:false},
    messages:[
        {
            type:mongoose.Types.ObjectId,
            ref:"Message"
        }
    ],
    follow:[
        {
            type:mongoose.Types.ObjectId,
            ref:"User"
        }
    ],
    bio:String
});
UserSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",UserSchema);
