require("dotenv").config(); 

const express = require("express");
const axios = require("axios");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// Clarifai Config
const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY;
const CLARIFAI_MODEL_ID = process.env.CLARIFAI_MODEL_ID;
const CLARIFAI_MODEL_VERSION = process.env.CLARIFAI_MODEL_VERSION;

// Multer Config (lưu file tạm)
const storage = multer.diskStorage({});
const upload = multer({ storage });

/**
 * @swagger
 * /api/food/detect:
 *   post:
 *     summary: Upload ảnh, nhận diện nguyên liệu từ Clarifai
 *     tags: [Food]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Danh sách nguyên liệu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       confidence:
 *                         type: number
 */

router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Vui lòng tải lên một ảnh" });
    }

    // ✅ Upload ảnh lên Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "food-ingredients",
    });
    const imageUrl = uploadResult.secure_url;

    console.log("✅ Ảnh đã upload lên Cloudinary:", imageUrl);

    // ✅ Gửi URL sang Clarifai
    const response = await axios.post(
      `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/versions/${CLARIFAI_MODEL_VERSION}/outputs`,
      {
        inputs: [{ data: { image: { url: imageUrl } } }],
      },
      {
        headers: {
          Authorization: `Key ${CLARIFAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    
    const ingredients =
      response.data.outputs[0].data.concepts
        .filter((c) => c.value > 0.8)
        .map((c) => ({
          name: c.name,
          confidence: c.value,
        }));

    res.json({
      status: "success",
      imageUrl,
      ingredients,
    });
  } catch (err) {
    console.error("Clarifai Error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Lỗi khi gọi Clarifai API",
      details: err.response?.data || err.message,
    });
  }
});

module.exports = router;
