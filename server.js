var express = require("express");
const cool = require('cool-ascii-faces')
var ejs = require("ejs");
var path = require("path");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);

mongoose.connect(
  "mongodb+srv://Sunny3008:12345@cluster0-b1ra3.mongodb.net/test?retryWrites=true&w=majority"
);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () { });

app.use(
  session({
    secret: "work hard",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db
    })
  })
);

app.get('/cool', (req, res) => res.send(cool()))
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/views"));

var index = require("./routes/index");
var admin = require("./routes/admin");
app.use("/", index);
app.use("/admin", admin);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("File Not Found");
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});

// listen on port 3000
app.listen(3000, function () {
  console.log("Express app listening on port 3000");
});
