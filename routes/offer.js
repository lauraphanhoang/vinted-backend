//import des packages
const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

// utilisation du Router
const router = express.Router();

// import du modèle, middleware, util
const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const convertedPicture = convertToBase64(req.files.picture);

      const result = await cloudinary.uploader.upload(convertedPicture, {
        folder: "vinted/offers",
      });
      // console.log(result);

      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          { MARQUE: req.body.brand },
          { TAILLE: req.body.size },
          { ETAT: req.body.condition },
          { COULEUR: req.body.color },
          { EMPLACEMENT: req.body.city },
        ],
        owner: req.user,
        product_image: result,
      });
      await newOffer.save();

      const dataToDisplay = await Offer.find().populate(
        "owner",
        "account username, _id"
      );
      return res.status(201).json(dataToDisplay);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;
    const limit = 5;
    const filters = {};
    const regExp = new RegExp(title, "i");

    if (title) {
      filters.product_name = new RegEx(title, "i");
    }

    if (priceMin) {
      filters.product_price = { $gte: Number(priceMin) };
    }

    if (priceMax) {
      if (priceMin) {
        filters.product_price.$lte = Number(priceMax);
      } else {
        filters.product_price = { $lte: Number(priceMax) };
      }
    }

    //SORTS
    const sortObj = {};
    if (sort === "price-asc") {
      sortObj.product_price = "asc";
    } else if (sort === "price-desc") {
      sortObj.product_price = "desc";
    }

    let skip = 0;

    if (page) {
      skip = (page - 1) * limit;
    }

    const offers = await Offer.find({ filters })
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate("owner", "account");

    return res.json(offers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
