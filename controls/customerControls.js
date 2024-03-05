const customerModel = require("../Models/customerModel");
const tryCatchHandler = require("../Middleware/trycatchHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../Config/config");
const nodemailer = require("nodemailer");
const CustomerModel = require("../Models/customerModel");

// Send OTP to customer email ---------------
const otpSendByEmail = tryCatchHandler(async (req, res) => {
  const { email } = req.body;
  // Check if user already exists
  const checkuser = await CustomerModel.findOne({ email: email });

  if (checkuser) {
    return res.status(400).json({
      message: "User already exists",
      success: false,
    });
  }

  // Generate OTP
  const OTP = Math.floor(1000 + Math.random() * 9000);

  console.log("Generated OTP: " + OTP);

  const hashedOTP = await bcrypt.hash(OTP.toString(), 10)

  // Set OTP cookie
  res.cookie("otp", hashedOTP, { httpOnly: true, secure: true });

  // Send OTP to the user's email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: config.email.user, pass: config.email.pass },
  });

  const mailOptions = {
    from: config.email.user,
    to: email,
    subject: "OTP for Account Verification",
    html: `<p>Your OTP is: <strong>${OTP}</strong></p>`,
  };

  transporter.sendMail(mailOptions, async (err, info) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error sending OTP", success: false });
    }

    res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  });
});

//Verify OTP and add user to database------------------
const registerUser = tryCatchHandler(async (req, res) => {
  const { userData, otp } = req.body;
  const { name, email, password } = userData;

  const otpInCookie = req.cookies.otp;


  const checkUser = await CustomerModel.find({ email: email });

  if (checkUser.length > 0) {
    res.status(400).json({
      message: "User already exists",
      success: false,
    });
    return;
  }

  const isOtpValid = await bcrypt.compare(otp, otpInCookie)

  if (!isOtpValid) {
    res.status(400).json({
      message: "invalid otp",
      success: false,
    });
    return;
  }
  res.clearCookie("otp");
  const hashedPassword = await bcrypt.hash(password, 10);
  const customer = new CustomerModel({
    name,
    email,
    password: hashedPassword,
  });

  await customer.save();

  res.status(200).json({
    message: "Successful register",
    success: true,
  });
});

//Customer Login-------------------
const customerLogin = tryCatchHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await customerModel.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email address" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res
      .status(400)
      .json({ success: false, message: "The password is incorrect" });
  }

  // Generate JWT
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET
  );

  res.status(200).json({
    token: token,
    message: "Sign-in successful. Start shopping...",
    userData: user,
  });
});

module.exports = {
  otpSendByEmail,
  registerUser,
  customerLogin,
};
