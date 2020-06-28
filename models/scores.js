var mongoose = require("mongoose");
var Schema = mongoose.Schema;

(scoreSchema = new Schema({
    email: String ,
    drep_freq: Number,
    anxi_freq: Number,
    drep_inten: Number,
    anxi_inten: Number

})),
    (Score = mongoose.model("Score", scoreSchema));

module.exports = Score;