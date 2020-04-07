var mongoose=require("mongoose");
const MessageSchema = mongoose.Schema({
    Room:[
        {
            type:mongoose.Types.ObjectId,
            ref:"room"
        }
    ],
    newUser:{ type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
    newName:String,
    newAvatar:String,
    sender: { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
    username:String,
    avatar:String,
    read: { type:Date },
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    },
});
module.exports=mongoose.model("Message",MessageSchema);