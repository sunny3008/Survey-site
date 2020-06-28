var mongoose = require("mongoose");
var Schema = mongoose.Schema;

(responseSchema = new Schema({
  email: { type: String },
  responses: [
    {
      question: String,
      question_type: String,
      question_sub_type: String,
      frequency: String,
      intensity: String,
      fscore: Number,
      iscore: Number
    }
  ]
})),
  (Response = mongoose.model("Response", responseSchema));

module.exports = Response;
