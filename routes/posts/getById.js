const express = require("express");
const router = express.Router();
const Post = require("../../models/post");

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: Quản lý bài viết về món ăn
 */

/**
 * @swagger
 * /api/posts/food/{foodId}:
 *   get:
 *     summary: Lấy bài viết theo foodId
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: foodId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID món ăn (userId + số thứ tự)
 *     responses:
 *       200:
 *         description: Bài viết được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                 foodId:
 *                   type: string
 *                 foodName:
 *                   type: string
 *                 content:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *                   example: "https://ik.imagekit.io/xxx/foods/pho.jpg"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */

router.get("/food/:foodId", async (req, res) => {
  try {
    const {foodId} = req.params;

    const post = await Post.findOne({foodId}).populate("user", "name");

    if (!post) {
      return res.status(404).json({message: "Không tìm thấy bài viết"});
    }

    const formattedPost = {
      user: post.user.name || post.user._id,
      foodId: post.foodId,
      foodName: post.foodName,
      content: post.content,
      createdAt: post.createdAt,
      imageUrl: post.imageUrl,
    };

    res.status(200).json(formattedPost);
  } catch (error) {
    console.error("Lỗi khi lấy bài viết:", error);
    res.status(500).json({error: error.message});
  }
});

module.exports = router;
