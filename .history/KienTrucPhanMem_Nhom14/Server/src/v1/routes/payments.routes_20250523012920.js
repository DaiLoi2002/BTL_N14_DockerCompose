const express = require("express");
const router = express.Router();
const { Pay, Callback } = require("../controllers/payments.controller.js");
router.post("/callback", Callback);
router.post("/create", Pay);

module.exports = router;
