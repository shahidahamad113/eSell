const express       =require("express"),
    app           =express(),
    path          =require("path"),
    server        =require("http").createServer(app),
    io            =require("socket.io")(server), 
    bodyParser    =require("body-parser"),
    mongoose      =require("mongoose"),
    passport      =require("passport"),
    flash         =require("connect-flash"),
    LocalStrategy =require("passport-local"),
    methodOverride=require("method-override"),
    aucground     =require("./models/aucground"),
    Comment       =require("./models/comment"),
    User          =require("./models/user"),
    moment        =require("moment");
    

const port=process.env.PORT || 3000;
//requiring routes
const commentRoutes =require("./routes/comments"),
    chatRoutes    =require("./routes/chat"),
    aucgroundRoutes=require("./routes/aucgrounds"),
    indexRoutes     =require("./routes/index");
    app.locals.moment=require("moment");

mongoose.connect("mongodb://localhost:27017/Auction",{useNewUrlParser:true,useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(express.static('uploads'));
app.use(methodOverride("_method"));
app.use(flash());
//Passport Confiquration

app.use(require("express-session")({
    secret:"Shahid",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    next();
})
app.use("/",indexRoutes);
app.use("/aucgrounds/:id/comments",commentRoutes);
app.use("/aucgrounds/:id/",chatRoutes);
app.use("/aucgrounds",aucgroundRoutes); 
app.listen(port,function(){
    console.log("eSell Server has started");
});