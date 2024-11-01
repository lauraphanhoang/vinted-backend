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
      // conversion de l'image grâce à la fonction 'convertToBase64(file)'
      // console.log(req.files.picture); pour visualiser les files
      // console.log(convertedPicture); pour visualiser les files converties

      // envoi de l'image dans 'cloudinary', dans un dossiers 'offers', lui même placé dans un dossier 'vinted'
      const result = await cloudinary.uploader.upload(convertedPicture, {
        folder: "vinted/offers",
      });
      // console.log(result);

      // LE DESTRUCTURING : je crée des variables et je stocke pour un gain de temps
      // const { title, description, price, brand, city, size, condition, color } = req.body;
      //console.log(title, description, price, brand, city, size, condition, color);

      // création de la nouvelle offre à enregistrer en base de données (MongoDB)
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
        product_image: result, // envoi de l'objet de l'image, venant de 'cloudinary'
      });
      await newOffer.save(); // envoi de la nouvelle offre complète en base de données (MongoDB)

      // création de la variable permettant d'afficher les informations souhaitées dans la réponse
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

// router.get("/offers", async (req, res) => {
//   try {
//     //destructuring :
//     const { title, priceMin, priceMax, sort, page } = req.query;

//     // console.log(title, priceMin, priceMax, sort, page);
//     const limit = 5;
//     const filters = {}; // si j'ai un title => {product_name : new RegEx(title,"i")}
//     const regExp = new RegExp(title, "i");
//     // si on m'a envoyé un titre alors j'ajouter à filters une clé product_name qui contient ma regexp
//     if (title) {
//       filters.product_name = new RegEx(title, "i");
//     }

//     // si j'ai priceMin => {product_price : {$gte: Number(priceMin)}
//     if (priceMin) {
//       filters.product_price = { $gte: Number(priceMin) };
//     }

//     // si j'ai priceMax => {product_price : {$lte: Number(priceMax)}
//     if (priceMax) {
//       //attention : si priceMin existe ! L'objet product_price existe déjà !
//       // il ne faut donc pas l'écraser !
//       if (priceMin) {
//         filters.product_price.$lte = Number(priceMax);
//       } else {
//         filters.product_price = { $lte: Number(priceMax) };
//       }
//     }

//     //SORTS
//     const sortObj = {};
//     if (sort === "price-asc") {
//       sortObj.product_price = "asc";
//     } else if (sort === "price-desc") {
//       sortObj.product_price = "desc";
//     }

//     // par défaut je suis à la page 1
//     let skip = 0;
//     // page 1 => 0*limit / (page-1*limit) => skip 0
//     // page 2 => 1*limit / (page-1*limit) => skip 5
//     // page 3 => 2*limit / (page-1*limit) => skip 10
//     // SI J'AI UNE PAGE INDIQUÉE => alors je change skip pour => (page - 1) * limit

//     if (page) {
//       skip = (page - 1) * limit;
//     }
//     // console.log(filters);

//     const offers = await Offer.find({ filters })
//       .sort(sortObj)
//       .skip(skip)
//       .limit(limit)
//       .populate("owner", "account");
//     // .select("product_name product_price");

//     return res.json(offers);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error.message });
//   }
// });

module.exports = router;
