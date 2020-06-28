var mongoose = require("mongoose");
var Schema = mongoose.Schema;

(questionSchema = new Schema({
  unique_id: Number,
  question: String,
  type: String,
  sub_type: String

})),
  (Question = mongoose.model("Question", questionSchema));

module.exports = Question;
