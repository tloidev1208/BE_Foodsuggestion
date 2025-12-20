/**
 * @swagger
 * tags:
 *   name: Post
 *   description: Quản lý bài viết về món ăn
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Tạo bài viết mới về món ăn
 *     tags: [Post]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - foodName
 *               - content
 *               - ingredient
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "655abc123456"
 *               foodName:
 *                 type: string
 *                 example: "Phở bò"
 *               ingredient:
 *                 type: string
 *                 example: "Thịt bò, bánh phở, hành lá"
 *               content:
 *                 type: string
 *                 example: "Món ăn rất ngon"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh món ăn upload lên ImageKit
 *
 *
 *     responses:
 *       201:
 *         description: Bài viết được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 user:
 *                   type: string
 *                 foodId:
 *                   type: string
 *                 foodName:
 *                   type: string
 *                 ingredient:
 *                   type: string
 *                 content:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *                   example: "https://ik.imagekit.io/xxx/foods/pho.jpg"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Thiếu dữ liệu
 *       500:
 *         description: Lỗi server
 */

const express = require("express");
const router = express.Router();
const Post = require("../../models/post");
const multer = require("multer");
const imagekit = require("../../config/imagekit");

// MULTER: upload vào RAM
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { userId, content, foodName,ingredient } = req.body;

    if (!userId || !content || !foodName || !ingredient) {
      return res.status(400).json({
        message: "userId, foodName và content là bắt buộc",
      });
    }

    let imageUrl = "";
    let imageId = "";

    // Nếu có file thì upload ImageKit
    if (req.file) {
      const result = await imagekit.upload({
        file: req.file.buffer,
        fileName: Date.now() + "_" + req.file.originalname,
        folder: "foods",
      });

      imageUrl = result.url;
      imageId = result.fileId;
    }

    const count = await Post.countDocuments({ user: userId });
    const foodId = `${userId}_${count + 1}`;

    const post = new Post({
      user: userId,
      foodId,
      foodName,
      content,
      ingredient,
      imageUrl,
      imageId,
    });

    await post.save();

    res.status(201).json(post);
  } catch (error) {
    console.error("Lỗi khi tạo bài viết:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
