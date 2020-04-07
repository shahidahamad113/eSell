var mongoose=require("mongoose");

var aucgroundsSchema=new mongoose.Schema({
    name:String,
    price:String,
    category:String,
    image: {
		type: Buffer,
	},
    description:String,
    createdAt:{type:Date,default:Date.now},
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
    username:String,
    avatar:String,
    contact:String,
    firstName:String,
    lastName:String,
    },
    comments: [
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
        } ,
    ],
    likes:[
        {
            type:mongoose.Types.ObjectId,
            ref:"User"
        },
    ]
});
module.exports=mongoose.model("aucground",aucgroundsSchema);
