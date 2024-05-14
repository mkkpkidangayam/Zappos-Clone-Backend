const mongoose = require("mongoose");

const TopBarSchema = new mongoose.Schema({
  text: {
    type: String,
    trim: true,
  },
},{
    timestamps: true
});

const TopBarModel = mongoose.model("topbar", TopBarSchema);
module.exports = TopBarModel;
