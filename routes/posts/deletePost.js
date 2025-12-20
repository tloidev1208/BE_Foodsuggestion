const express = require("express");
const router = express.Router();
const Post = require("../../models/post");
const imagekit = require("../../config/imagekit");
/**
 * @swagger
 * tags:
 *   name: Post
 *   description: Quản lý bài viết về món ăn
 */

/**
 * @swagger
 * /api/posts/food/{foodId}:
 *   delete:
 *     summary: Xóa bài viết theo foodId
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: foodId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID món ăn cần xóa (userId + số thứ tự)
 *     responses:
 *       200:
 *         description: Xóa bài viết thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Xóa bài viết thành công!
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */

router.delete("/food/:foodId", async (req, res) => {
  try {
    const {foodId} = req.params;

    // Tìm post trước
    const post = await Post.findOne({foodId});

    if (!post) {
      return res.status(404).json({message: "Không tìm thấy bài viết"});
    }

    // Nếu có ảnh → xóa trên ImageKit
    if (post.imageId) {
      await imagekit.deleteFile(post.imageId);
    }

    // Xóa trong MongoDB
    await Post.deleteOne({foodId});

    res.json({message: "Xóa bài viết và ảnh thành công!"});
  } catch (error) {
    console.error("Lỗi khi xóa bài viết:", error);
    res.status(500).json({error: error.message});
  }
});

module.exports = router;
