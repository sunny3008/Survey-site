var express = require("express");
var router = express.Router();
var request = require("request");
var Admin = require("../models/Admin");
var User = require("../models/user");
var Question = require("../models/question");
const path = require('path')
const moment = require('moment');
const mdq = require('mongo-date-query');
var Score = require("../models/scores");
var Response = require("../models/response")
const fs = require('fs');
const json2csv = require('json2csv').parse;
const fields = ['email','drep_freq','anxi_freq','drep_inten','anxi_inten'];
//var helper = require("./../helpers/helper");
//var keyConfig = require("./../config");
var userType = "Guest";

var d_sub=[]
var a_sub=[]
router.get("/", function (req, res, next) {
  console.log("ABCD");

  console.log("1");
  //console.log(userType);
  if (userType == "admin") {
    User.find({}, function (err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }

      Question.find({}, function (err, question) {
        if (err) {
          console.log(err);
          return next(err);
        }
        // Question.aggregate([{ _id: null, $group: { "unique_no": { $sum: "$unique_id" } } }], function (err, no) {
        //   if (err) {
        //     console.log(err);
        //     return next(err);
        //   }
        //   else {
        //     console.log(no)
        //   }
        // });

        // Response.aggregate([
        //   { "$match": { "_id": null } },
        //   { "$unwind": "$responses" },
        //   { "$match": { "responses.score": 0 } }],
        //   function (err, data) {

        //     if (err)
        //       throw err;
        //     console.log("aaa")
        //     console.log(JSON.stringify(data, undefined, 2));

        //   }
        // );
        // var score;

        return res.render("admin", {
          JWTData: req.JWTData,
          users: data,
          questions: question
        });

      });
    });
  } else {
    return res.redirect("/admin/alogin");
  }
});

router.get("/alogin", function (req, res, next) {
  console.log("cd");
  if (userType == "admin") {
    return res.redirect("/");
  } else {
    return res.render("alogin", {
      JWTData: req.JWTData
    });
  }
});

router.get("/addquest", function (req, res, nest) {
  console.log("sunny");
  return res.render("addquest.ejs");
});

router.get("/download",function(req,res,next){

  var filename   = "res.csv";
  var dataArray;

  Score.find({}, function(err, scores) {
    if (err) res.send(err);
    else {
      let csv
      try {
        csv = json2csv(scores, { fields });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ err });
      }
      const dateTime = moment().format('YYYYMMDDhhmmss');
      const filePath = path.join(__dirname, "..", "public", "csv-" + dateTime + ".csv")
      
      res.setHeader('Content-disposition', 'attachment; filename=shifts-report.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csv);

      fs.writeFile(filePath, csv, function (err) {
        if (err) {
          console.log(err)
          return res.json(err).status(500);
        }
        else {
          setTimeout(function () {
            fs.unlinkSync(filePath); // delete this file after 30 seconds
          }, 30000)

          //res.end("/exports/csv-" + dateTime + ".csv")
          //return res.json("/exports/csv-" + dateTime + ".csv");
        }
      });

    }
  })

});

router.get("/aresult",function(req, res,next){

  var filename   = "res.csv";
  var dataArray;

 
  Score.find({},function(err,scores){
    if(err){
      console.log(err);
        return next(err);
    }

    return res.render("aresult.ejs", {
      JWTData: req.JWTData,
      scores:scores
    });

  })
});

router.post("/addquest", function (req, res, next) {
  console.log(req.body);
  console.log("asd");
  var questionInfo = req.body;

  if (!questionInfo.question) {
    res.send();
  } else {
    Question.findOne({ question: questionInfo.question }, function (err, data) {
      if (!data) {
        var c;
        Question.findOne({}, function (err, data) {
          if (data) {
            console.log("if");
            c = data.unique_id + 1;
          } else {
            c = 1;
          }

          var newQuestion = new Question({
            unique_id: c,
            question: questionInfo.question,
            type: req.body.type,
            sub_type: req.body.subtype
          });

          newQuestion.save(function (err, Person) {
            if (err) console.log(err);
            else console.log("Success");
          });
        });
        console.log("added");
        res.send({ Success: "Question Added" });
        console.log("Added");
      } else {
        res.send({ Success: "Email is already used." });
      }
    });
  }
});
// router.get("/logout", function(req, res, next) {
//   res.clearCookie("token");
//   return res.redirect("/");
// });

router.get("/deletequestion/:id", function (req, res, next) {
  console.log("aghasgh");
  console.log(req.params.id);
  if (userType == "admin") {
    Question.findOneAndRemove({ _id: req.params.id }, function (err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }
      console.log("sunny");
      //data.isValid = true;

      // data.save();

      return res.redirect("/admin");
    });
  } else {
    return res.redirect("/admin/login");
  }
});

router.post("/alogin", function (req, res, next) {
  console.log("Entered post /login");
  console.log(req.body.login_id);
  Admin.findOne(
    {
      login_id: req.body.login_id
    },
    function (err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }
      console.log(data.password);
      if (data.password == req.body.password) {
        var payload = {
          userType: "admin",
          firstName: "Admin"
        };
        userType = "admin";
        console.log(userType);

        //var token = req.app.jwt.sign(payload, req.app.jwtSecret);
        // add token to cookie
        //res.cookie("token", token);
        console.log("d");
        res.redirect("/admin");
      } else {
        res.redirect("/admin/alogin");
      }
    }
  );
});

// router.get("/fetchvoters", function(req, res, next) {
//   req.app.db.models.Voter.find({}, function(err, data) {
//     if (err) {
//       console.log(err);
//       return next(err);
//     }
//     res.send(data);
//   });
// });

// router.post("/addcandidate", function(req, res, next) {
//   var candidate = {
//     name: req.body.cand_name,
//     constituency: req.body.cand_constituency
//   };

//   req.app.db.models.Candidate.create(candidate, function(err, data) {
//     if (err) {
//       console.log(err);
//       return next(err);
//     }
//     return res.redirect("/admin");
//   });
// });

module.exports = router;
