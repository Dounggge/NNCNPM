const express = require("express");
const router = express.Router();

// Route test: GET /api/households
router.get("/", (req, res) => {
  res.json([
    { id: 1, householdCode: "HK001", head: "Nguyễn Văn A" },
    { id: 2, householdCode: "HK002", head: "Trần Thị B" },
  ]);
});

module.exports = router;
