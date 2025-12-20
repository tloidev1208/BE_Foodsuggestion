const express = require("express");
const router = express.Router();

// POST /api/auth/logout
router.post("/", (req, res) => {
  try {
    // Nếu bạn dùng cookie để lưu JWT hoặc session
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    // Nếu dùng session, xóa session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
      });
    }

    res.status(200).json({ message: "Logout thành công" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout thất bại" });
  }
});

module.exports = router;
