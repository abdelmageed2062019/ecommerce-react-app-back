const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Coupon = require("../models/coupon");
const stripe = require("stripe")(process.env.SRTIPE_SECRET);

exports.createPaymentIntent = async (req, res) => {
  const { couponApplied } = req.body;
  // console.log(req.body);
  // return;
  const user = await User.findOne({ email: req.user.email }).exec();

  const { cartTotal, totalAfterDiscount } = await Cart.findOne({
    orderedBy: user._id,
  }).exec();

  // console.log(
  //   "CART TOTAL CHARGED",
  //   cartTotal,
  //   "AFTER DISC",
  //   totalAfterDiscount
  // );

  let finalAmount = 0;

  if (couponApplied && totalAfterDiscount) {
    finalAmount = Math.round(totalAfterDiscount * 100);
  } else {
    finalAmount = Math.round(cartTotal * 100);
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: finalAmount,
    currency: "usd",
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
    cartTotal,
    totalAfterDiscount,
    payable: finalAmount,
  });
};
