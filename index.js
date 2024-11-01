const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI);

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// import de Router
const userRouter = require("./routes/user");
const offerRouter = require("./routes/offer");

app.use(userRouter);
app.use(offerRouter);

const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

// configuration de cloudinary
cloudinary.config({
  cloud_name: "dkfawp1r9",
  api_key: "185119449123149",
  api_secret: "YCoMlADA99HuGZje3vO-ue21UI4",
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});
app.listen(process.env.PORT, () => {
  console.log("Server started 🛍️");
});
