var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Question = require("../models/question");
var Response = require("../models/response");
var Score = require("../models/scores")

var d_sub=[]
var a_sub=[]
router.get("/", function (req, res, next) {
  return res.render("index.ejs");
});

router.get("/register", function (req, res, next) {
  // var friend = { question: "Sunny", answer: "Rathod" };
  // const restaurantId = "5e6d0521bff75c1f44ccb5a5";
  // Response.findOneAndUpdate(
  //   { _id: restaurantId },
  //   { $push: { subQuestions: friend } },
  //   function(error, success) {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       console.log(success);
  //     }
  //   }
  // );
  //console.log("sggs");
  return res.render("register.ejs");
});

router.post("/register", function (req, res, next) {
  console.log(req.body);
  console.log("asd");
  var personInfo = req.body;

  if (
    !personInfo.email ||
    !personInfo.username ||
    !personInfo.password ||
    !personInfo.passwordConf
  ) {
    res.send();
  } else {
    if (personInfo.password == personInfo.passwordConf) {
      User.findOne({ email: personInfo.email }, function (err, data) {
        if (!data) {
          var c;
          User.findOne({}, function (err, data) {
            if (data) {
              console.log("if");
              c = data.unique_id + 1;
            } else {
              c = 1;
            }
            var friend = { question: "Harry", answer: "Potter" };
            var newPerson = new User({
              unique_id: c,
              email: personInfo.email,
              username: personInfo.username,
              password: personInfo.password,
              passwordConf: personInfo.passwordConf
            });
            // var newResponse = new Response({
            //   email: personInfo.email,
            //   sunQuestions: friend,
            //   answer: personInfo.password
            // });

            newPerson.save(function (err, Person) {
              if (err) console.log(err);
              else console.log("Success");
            });
            // newResponse.save(function(err, Person) {
            //   if (err) console.log(err);
            //   else console.log("Success");
            // });
          })

            .sort({ _id: -1 })
            .limit(1);
          res.send({ Success: "You are regestered,You can login now." });
        } else {
          res.send({ Success: "Email is already used." });
        }
      });
    } else {
      res.send({ Success: "password is not matched" });
    }
  }
});

router.get("/login", function (req, res, next) {
  return res.render("login.ejs");
});

router.post("/login", function (req, res, next) {
  //console.log(req.body);
  User.findOne({ email: req.body.email }, function (err, data) {
    if (data) {
      if (data.password == req.body.password) {
        //console.log("Done Login");
        req.session.userId = data.unique_id;
        //console.log(req.session.userId);
        res.send({ Success: "Success!" });
      } else {
        res.send({ Success: "Wrong password!" });
      }
    } else {
      res.send({ Success: "This Email Is not regestered!" });
    }
  });
});

router.get("/profile", function (req, res, next) {
  console.log("profile");
  User.findOne({ unique_id: req.session.userId }, function (err, data) {
    console.log("data");
    console.log(data);
    if (!data) {
      res.redirect("/");
    } else {
      //console.log("found");
      return res.render("data.ejs", { name: data.username, email: data.email });
    }
  });
});
router.get("/logout", function (req, res, next) {
  console.log("logout");
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/");
      }
    });
  }
});
router.get("/survey/:page", function (req, res, next) {
  console.log("profile");
  var perPage = 1;
  var page = req.params.page || 1;
  Question.find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function (err, data) {
      //
      //

      if (!data) {
        res.redirect("/");
      }
      User.findOne({ unique_id: req.session.userId }, function (err, users) {
        console.log("data");
        console.log(data);
        if (!data) {
          res.redirect("/");
        }
        Response.findOne({ email: users.email }, function (err, data1) {
          if (!data1) {
            var newResponse = new Response({
              email: users.email
            });
            var newScore = new Score({
              email: users.email
            });

            newScore.save(function (err, sc) {
              if (err) console.log(err);
              else console.log("Success")
            });
            newResponse.save(function (err, Person) {
              if (err) console.log(err);
              else console.log("Success");
            });
          } else {
            console.log("Already Exits");
          }
        });

        Question.count().exec(function (err, count) {
          if (err) return next(err);
          //console.log("found");
          res.render("survey.ejs", {
            user: req.user,

            surveys: data,
            current: page,
            pages: Math.ceil(count / perPage),
            user: users
          });
        });
      });
    });
});

router.get("/insertres/:email/:question/:question_type/:sub_type/:page/:frequency/:intensity", function (
  req,
  res,
  next
) {
  var pagen = parseInt(req.params.page) + 1;

  var sc
  if (req.params.frequency == 'Never')
    sc = 0
  else if (req.params.frequency == 'Rarely')
    sc = 1
  else if (req.params.frequency == 'Occasionally')
    sc = 2
  else if (req.params.frequency == 'Many times')
    sc = 3
  else
    sc = 4
  var isc
  if (req.params.intensity == 'No')
    isc = 0
  else if (req.params.intensity == 'Mild')
    isc = 1
  else if (req.params.intensity == 'Moderate')
    isc = 2
  else if (req.params.intensity == 'Severe')
    isc = 3
  else
    isc = 4
  var response = {
    question: req.params.question,
    question_type: req.params.question_type,
    question_sub_type:req.params.sub_type,
    frequency: req.params.frequency,
    intensity: req.params.intensity,
    fscore: sc,
    iscore: isc
  };
  // Response.findOne({ email: req.params.email, 'responses.question': req.params.question }, function (errr, daata) {
  //   if (errr) console.log(err)
  //   else if (!daata) {
  //     Score.findOne({
  //       email: req.params.email,
  //       "scr.sub_type": req.params.sub_type
  //     }, { 'scr.sub_type.$': 1 }, function (error1, aa) {
  //       if (error1) console.log(error1)
  //       else if (!aa) {
  //         console.log(aa.scr[0].score)
  //         sc = sc + aa.scr[0].score
  //         console.log(sc)
  //       }
  //     });
  //   }
  // });



  Response.update(
    {
      email: req.params.email,
      "responses.question": req.params.question
    },
    { $set: { "responses.$": response } },
    { new: true },
    function (err, data) {
      if (err) console.log(err);
      if (!data.n) {
        Response.findOneAndUpdate(
          { email: req.params.email },
          { $push: { responses: response } },
          function (error, success) {
            if (error) {
              console.log(error);
            } else {
              console.log(success);
              return res.redirect("/survey/" + pagen);
            }
          }
        );
      } else {
        //console.log(responses.$.question);
        //console.log(data);
        //console.log(data.n);
        //  console.log("SUnnyyy");
        return res.redirect("/survey/" + pagen);
      }
    }
  );
});

router.get(
  "/submitsurvey/:email/:question/:question_type/:sub_type/:page/:frequency/:intensity",
  function (req, res, next) {
    

    
    var sc
    if (req.params.frequency == 'Never')
      sc = 0
    else if (req.params.frequency == 'Rarely')
      sc = 1
    else if (req.params.frequency == 'Occasionally')
      sc = 2
    else if (req.params.frequency == 'Many times')
      sc = 3
    else
      sc = 4

    var isc
    if (req.params.intensity == 'No')
      isc = 0
    else if (req.params.intensity == 'Mild')
      isc = 1
    else if (req.params.intensity == 'Moderate')
      isc = 2
    else if (req.params.intensity == 'Severe')
      isc = 3
    else
      isc = 4

    var response = {
      question: req.params.question,
      question_type: req.params.question_type,
      question_sub_type: req.params.sub_type,
      frequency: req.params.frequency,
      intensity: req.params.intensity,
      fscore: sc,
      iscore: isc
    };
    Response.update(
      {
        email: req.params.email,
        "responses.question": req.params.question
      },
      { $set: { "responses.$": response } },
      { new: true },
      function (err, data) {
        if (err) console.log(err);
        if (!data.n) {
          Response.findOneAndUpdate(
            { email: req.params.email },
            { $push: { responses: response } },
            function (error, success) {
              if (error) {
                console.log(error);
              } else {
                console.log(success);

                return res.redirect("/calculate");
              }
            }
          );
        } else {
          //console.log(responses.$.question);
          //console.log(data);
          //console.log(data.n);
          //  console.log("SUnnyyy");

          return res.redirect("/calculate");
        }
      }
    );
  }
);

router.get("/calculate", function (req, res, next) {

  Question.find({},function(err,qs){
    if(err){
      console.log(err);
    }

    for(var i=0;i<qs.length;i++){
      if(qs[i].type=="Depression"){
        if(d_sub.includes(qs[i].sub_type) ==false){
          d_sub.push(qs[i].sub_type);
        }
      }
      else if(qs[i].type=="Anxiety"){
        if(a_sub.includes(qs[i].sub_type) ==false){
          a_sub.push(qs[i].sub_type);
      }
    }
  }
  })

  res.render("calculate.ejs");
});

router.get("/result", function (req, res, next) {

var k=[]
  console.log(d_sub)
 console.log(a_sub)
  User.findOne({ unique_id: req.session.userId }, function (err, users) {
    var df_score_arr=[];
    var di_score_arr=[];
    var af_score_arr=[];
    var ai_score_arr=[];
    for(var i=0;i<d_sub.length;i++){
      Response.aggregate([{ $match: { $and: [{ "email": users.email }, { "responses.question_type": "Depression" },{"responses.question_sub_type":d_sub[i]}] } },
      { $unwind: "$responses" },
      { $match: { $and: [{ "email": users.email }, { "responses.question_type": "Depression" },{"responses.question_sub_type":d_sub[i]}] } },
      {
        $group: {
          _id: "$_id", dftotal: { $sum: "$responses.fscore" },
          dfcount: { $sum: 1 }
        }
      }], function (err, dfresult) {
        console.log(dfresult[0].dftotal)
        var dfreq = (dfresult[0].dftotal) / ((dfresult[0].dfcount) * 4) * 10
        df_score_arr.push(dfreq);
      })

      Response.aggregate([{ $match: { $and: [{ "email": users.email }, { "responses.question_type": "Depression" },{"responses.question_sub_type":d_sub[i]}] } },
      { $unwind: "$responses" },
      { $match: { $and: [{ "email": users.email }, { "responses.question_type": "Depression" },{"responses.question_sub_type":d_sub[i]}] } },
      {
        $group: {
          _id: "$_id", ditotal: { $sum: "$responses.iscore" },
          dicount: { $sum: 1 }
        }
      }], function (err, diresult) {
        console.log(diresult[0].ditotal)
        var dinten = (diresult[0].ditotal) / ((diresult[0].dicount) * 4) * 10
        di_score_arr.push(dinten);
      })
    }

    for(var i=0;i<a_sub.length;i++){
      Response.aggregate([{ $match: { $and: [{ "email": users.email }, { "responses.question_type": "Anxiety" },{"responses.question_sub_type":a_sub[i]}] } },
      { $unwind: "$responses" },
      { $match: { $and: [{ "email": users.email }, { "responses.question_type": "Anxiety" },{"responses.question_sub_type":a_sub[i]}] } },
      {
        $group: {
          _id: "$_id", aftotal: { $sum: "$responses.fscore" },
          afcount: { $sum: 1 }
        }
      }], function (err, afresult) {
        console.log(afresult[0].aftotal)
        var afreq = (afresult[0].aftotal) / ((afresult[0].afcount) * 4) * 10
        af_score_arr.push(afreq);
      })

      Response.aggregate([{ $match: { $and: [{ "email": users.email }, { "responses.question_type": "Anxiety" },{"responses.question_sub_type":a_sub[i]}] } },
      { $unwind: "$responses" },
      { $match: { $and: [{ "email": users.email }, { "responses.question_type": "Anxiety" },{"responses.question_sub_type":a_sub[i]}] } },
      {
        $group: {
          _id: "$_id", aitotal: { $sum: "$responses.iscore" },
          aicount: { $sum: 1 }
        }
      }], function (err, airesult) {
        console.log(airesult[0].aitotal)
        var ainten = (airesult[0].aitotal) / ((airesult[0].aicount) * 4) * 10
        ai_score_arr.push(ainten);
      })
    }




          Question.count({"type": "Depression"}).maxTime(10000).exec(function(err,cnt){
            Question.count({"type": "Anxiety"}).maxTime(10000).exec(function(err,cnt1){
            
            
            

            console.log(df_score_arr);
            console.log(
              df_score_arr.reduce((a, b) => a + b, 0)
            )
            console.log(di_score_arr);
            console.log(af_score_arr);
            console.log(ai_score_arr);

            var dfreq=(((df_score_arr.reduce((a, b) => a + b, 0))/(4*cnt))*20).toFixed(1);
            var dinten = (((di_score_arr.reduce((a, b) => a + b, 0))/(4*cnt))*20).toFixed(1);
            var afreq=(((af_score_arr.reduce((a, b) => a + b, 0))/(4*cnt1))*20).toFixed(1);
            var ainten=(((ai_score_arr.reduce((a, b) => a + b, 0))/(4*cnt1))*20).toFixed(1);
            Score.findOneAndUpdate({email : users.email},{$set : {drep_freq:dfreq} },{new:true},function(err,done){
            })
            Score.findOneAndUpdate({email : users.email},{$set : {anxi_freq:afreq} },{new:true},function(err,done){
            })
            Score.findOneAndUpdate({email : users.email},{$set : {drep_inten:dinten} },{new:true},function(err,done){
            })
            Score.findOneAndUpdate({email : users.email},{$set : {anxi_inten: ainten} },{new:true},function(err,done){
            })

            return res.render("result.ejs", {
              dfreq: dfreq,
              afreq: afreq,
              ainten: ainten,
              dinten: dinten
            });

        });
      });
});
});
//res.render("result.ejs");
//});
router.get("/messages", function (req, res, next) {
  res.render("message.ejs");
});

router.get("/forgetpass", function (req, res, next) {
  res.render("forget.ejs");
});

router.post("/forgetpass", function (req, res, next) {
  //console.log('req.body');
  //console.log(req.body);
  User.findOne({ email: req.body.email }, function (err, data) {
    console.log(data);
    if (!data) {
      res.send({ Success: "This Email Is not regestered!" });
    } else {
      // res.send({"Success":"Success!"});
      if (req.body.password == req.body.passwordConf) {
        data.password = req.body.password;
        data.passwordConf = req.body.passwordConf;

        data.save(function (err, Person) {
          if (err) console.log(err);
          else console.log("Success");
          res.send({ Success: "Password changed!" });
        });
      } else {
        res.send({
          Success: "Password does not matched! Both Password should be same."
        });
      }
    }
  });
});

module.exports = router;
