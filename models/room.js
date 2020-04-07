var mongoose  = require('mongoose');
var RoomSchema = new mongoose.Schema({
        text: String,
        username:String
});
module.exports =mongoose.model("room",RoomSchema);