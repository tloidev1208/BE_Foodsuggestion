require("dotenv").config();
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

// ⚙️ Cấu hình OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @swagger
 * /api/recipes/food-detail:
 *   post:
 *     summary: Gợi ý công thức chi tiết dựa trên tên món ăn
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Phở bò"
 *     responses:
 *       200:
 *         description: Công thức chi tiết món ăn
 */
router.post("/food-detail", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Vui lòng cung cấp tên món ăn" });
  }

  try {
    const prompt = `
Hãy tạo công thức món ăn cho món: "${name}".

Yêu cầu:
- Trả về đúng định dạng JSON hợp lệ
- Không trả thêm văn bản, giải thích hay ký tự thừa ngoài JSON
- Nếu không có ảnh thật, để image = ""

Cấu trúc JSON cần trả về:
{
  "name": "Tên món ăn",
  "description": "Mô tả ngắn gọn",
  "ingredients": ["nguyên liệu 1", "nguyên liệu 2", ...],
  "instructions": ["Bước 1", "Bước 2", ...],
  "cook_time": "Thời gian nấu",
  "servings": "Khẩu phần",
  "image": "link ảnh món ăn (jpg/png/webp)",
  "nutrition": {
    "calories": "xxx kcal",
    "protein": "xx g",
    "fat": "xx g",
    "carbs": "xx g"
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    let text = completion.choices[0].message.content;
    let cleanText = text.replace(/```json|```/g, "").trim();

    let recipe;
    try {
      recipe = JSON.parse(cleanText);
    } catch (err) {
      recipe = {
        error: "OpenAI trả về JSON không hợp lệ",
        raw: text,
      };
    }

    res.json({ status: "success", recipe });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({
      error: "Lỗi khi gọi OpenAI API",
      details: error.message,
    });
  }
});

module.exports = router;
