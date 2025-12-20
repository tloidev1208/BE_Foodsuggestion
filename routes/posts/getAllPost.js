const express = require("express");
const router = express.Router();
const Post = require("../../models/post");
const {image} = require("../../config/cloudinary");

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: Quản lý bài viết vè món ăn
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Lấy danh sách tất cả bài viết về món ăn
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: Danh sách bài viết
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: string
 *                   foodId:
 *                     type: string
 *                   foodName:
 *                     type: string
 *                   ingredient:
 *                     type: string
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Lỗi server
 */

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({createdAt: -1})
      .populate("user", "name"); // nếu muốn lấy tên user

    // Chỉ giữ những field cần thiết
    const formattedPosts = posts.map((post) => ({
      user: post.user.name || post.user._id, // nếu user chưa populate thì dùng _id
      foodId: post.foodId,
      foodName: post.foodName,
      ingredient: post.ingredient,
      content: post.content,
      createdAt: post.createdAt,
      imageUrl: post.imageUrl,
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error("Lỗi khi lấy bài viết:", error);
    res.status(500).json({error: error.message});
  }
});

module.exports = router;
