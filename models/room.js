var mongoose  = require('mongoose');
var RoomSchema = new mongoose.Schema({
        text: String,
        username:String,
        read : { type : Boolean, default : false }
});
module.exports =mongoose.model("room",RoomSchema);