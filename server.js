var express = require("express"),
    path= require("path"),
    urlParser = require("url").parse,
    mongoose = require("mongoose"),
    dotenv = require("dotenv"),
    routes = require(process.cwd() + "/app/routes");
    
dotenv.load();


    
var app = express();

//db connect
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/imageSearch");

//middles ware

app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/controllers", express.static(path.join(process.cwd(), "app", "controllers")));

//routes

routes(app, urlParser);

//listening

app.listen(process.env.PORT || 8080, function(){
  console.log("express server is listening on port : " + process.env.PORT || 8080);
});