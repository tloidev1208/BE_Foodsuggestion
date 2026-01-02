const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Recipe = require("../models/recipe");
const Post = require("../models/post");

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Thống kê tổng quan hệ thống
 *     description: Lấy số lượng người dùng, món ăn và món ăn do người dùng đăng
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Thống kê thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: number
 *                       example: 120
 *                     recipes:
 *                       type: number
 *                       example: 350
 *                     userPosts:
 *                       type: number
 *                       example: 87
 *       500:
 *         description: Lỗi server
 */
router.get("/stats", async (req, res) => {
  try {
    const [users, recipes, userPosts] = await Promise.all([
      User.countDocuments(),
      Recipe.countDocuments(),
      Post.countDocuments(),
    ]);

    res.json({
      status: "success",
      data: {
        users,
        recipes,
        userPosts,
      },
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({
      status: "error",
      message: "Không thể lấy thống kê",
    });
  }
});

module.exports = router;
