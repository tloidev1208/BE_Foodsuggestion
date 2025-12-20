require("dotenv").config();

const express = require("express");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const { OpenAI } = require("openai");

const router = express.Router();

// Clarifai Config
const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY;
const CLARIFAI_MODEL_ID = process.env.CLARIFAI_MODEL_ID;
const CLARIFAI_MODEL_VERSION = process.env.CLARIFAI_MODEL_VERSION;

// OpenAI Config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Multer Config
const storage = multer.diskStorage({});
const upload = multer({ storage });

/**
 * @swagger
 * /api/food-recipes/suggest:
 *   post:
 *     summary: Upload ảnh → Nhận diện nguyên liệu → Gợi ý món ăn
 *     tags: [Food & Recipes]
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
 *         description: Ảnh, nguyên liệu và danh sách món ăn gợi ý
 */
router.post("/suggest", upload.array("images", 3), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Vui lòng upload ít nhất 1 ảnh" });
    }

    let allIngredients = [];
    for (const file of files) {
      const fileData = fs.readFileSync(file.path);
      const base64 = fileData.toString("base64");

      const clarifaiRes = await axios.post(
        `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/versions/${CLARIFAI_MODEL_VERSION}/outputs`,
        { inputs: [{ data: { image: { base64 } } }] },
        { headers: { Authorization: `Key ${CLARIFAI_API_KEY}` } }
      );

      const concepts = clarifaiRes.data.outputs[0].data.concepts.filter(
        (c) => c.value > 0.8
      );

      allIngredients.push(...concepts.map((c) => c.name));
    }

    allIngredients = [...new Set(allIngredients)];
    const prompt = `Tôi có các nguyên liệu: ${allIngredients.join(", ")}.
Hãy gợi ý cho tôi 4 món ăn ngon có thể nấu từ cá.  
Trả về kết quả dưới dạng JSON, mỗi món ăn có dạng:

[
  {
    "name": "Tên món",
    "ingredients": ["nguyên liệu1", "nguyên liệu2"],
    "instructions": "Cách nấu ngắn gọn, tối đa 3 câu",
    "image": "Link ảnh thực tế (jpg, png hoặc webp) từ Website trên Google KHÔNG để trống",
    "cook_time": "Thời gian nấu (phút hoặc giờ)",
    "nutrition": {
      "calories": "Số kcal",
      "protein": "Số gam protein",
      "fat": "Số gam chất béo",
      "carbs": "Số gam tinh bột"
    }
  }
]

Chỉ trả về JSON, không giải thích thêm.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 1.0,
    });

    let text = completion.choices[0].message.content;
    let cleanText = text.replace(/```json|```/g, "").trim();

    let recipes;
    try {
      recipes = JSON.parse(cleanText);
    } catch (err) {
      recipes = [{ note: "OpenAI trả về không phải JSON chuẩn", raw: text }];
    }

    res.json({
      status: "success",
      ingredients: allIngredients,
      recipes,
    });
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Lỗi khi xử lý",
      details: err.response?.data || err.message,
    });
  }
});

module.exports = router;
