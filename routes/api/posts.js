const express = require("express");
const router = express.Router();
router.get("/test",(req,res)=> res.json({msg:"it works"}));
module.exports = router;