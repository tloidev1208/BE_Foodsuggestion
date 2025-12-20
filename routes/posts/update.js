const express = require("express");
const router = express.Router();
const Post = require("../../models/post");
const multer = require("multer");
const imagekit = require("../../config/imagekit");
const upload = multer({storage: multer.memoryStorage()});

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: Quản lý bài viết về món ăn
 */

/**
 * @swagger
 * /api/posts/food/{foodId}:
 *   put:
 *     summary: Cập nhật bài viết theo foodId
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: foodId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID món ăn cần cập nhật (userId + số thứ tự)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foodName:
 *                 type: string
 *                 description: Tên món ăn mới
 *               content:
 *                 type: string
 *                 description: Nội dung bài viết mới
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh mới để thay thế ảnh cũ
 *     responses:
 *       200:
 *         description: Cập nhật bài viết thành công
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
 *                   example: "https://ik.imagekit.io/xxx/foods/new.jpg"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */

router.put("/food/:foodId", upload.single("image"), async (req, res) => {
  try {
    const {foodId} = req.params;
    const {foodName, content} = req.body;

    if (!foodName && !content && !req.file) {
      return res.status(400).json({
        message: "Phải có foodName, content hoặc ảnh để cập nhật",
      });
    }

    const post = await Post.findOne({foodId});

    if (!post) {
      return res.status(404).json({message: "Không tìm thấy bài viết"});
    }

    // ✏ Cập nhật text nếu có
    if (foodName) post.foodName = foodName;
    if (content) post.content = content;

    // 📸 Nếu upload ảnh mới
    if (req.file) {
      // Xóa ảnh cũ trên ImageKit (nếu có)
      if (post.imageId) {
        try {
          await imagekit.deleteFile(post.imageId);
        } catch (err) {
          console.log("Không xóa được ảnh cũ:", err.message);
        }
      }

      // Upload ảnh mới
      const result = await imagekit.upload({
        file: req.file.buffer,
        fileName: Date.now() + "_" + req.file.originalname,
        folder: "foods",
      });

      post.imageUrl = result.url;
      post.imageId = result.fileId;
    }

    await post.save();

    res.status(200).json({
      message: "Cập nhật bài viết thành công",
      data: {
        user: post.user,
        foodId: post.foodId,
        foodName: post.foodName,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật bài viết:", error);
    res.status(500).json({error: error.message});
  }
});

module.exports = router;