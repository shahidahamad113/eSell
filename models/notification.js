var mongoose=require("mongoose");
var NotificationSchema=new mongoose.Schema({
    text:String,
    user:{type:mongoose.Schema.Types.ObjectId,
    ref:"User"},
    createdAt:{type:Date,default:Date.now},
    read : { type : Boolean, default : false }
});
module.exports=mongoose.model("notification",NotificationSchema);