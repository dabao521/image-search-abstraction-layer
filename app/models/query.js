var mongoose =  require("mongoose");
var Schema = mongoose.Schema;

var querySchema =  new Schema({
    "term" : String,
    "when" : String
});

module.exports = mongoose.model("Query", querySchema);