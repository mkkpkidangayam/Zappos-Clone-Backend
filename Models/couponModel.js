const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  text: {
    type: String,
    trim: true,
  },
});

const couponModel = mongoose.model("coupon", couponSchema);
module.exports = couponModel;
