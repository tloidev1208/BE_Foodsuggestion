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
 * /api/recipes/food-suggest:
 *   post:
 *     summary: Gợi ý công thức món ăn bằng OpenAI dựa trên nguyên liệu
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tomato", "cucumber", "egg"]
 *     responses:
 *       200:
 *         description: Danh sách món ăn gợi ý từ OpenAI
 */
router.post("/food-suggest", async (req, res) => {
  const {ingredients} = req.body;

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({error: "Vui lòng cung cấp ingredients"});
  }

  try {
    const prompt = `Tôi có các nguyên liệu: ${ingredients.join(", ")}.
Hãy gợi ý cho tôi 4 món ăn ngon có thể nấu từ các nguyên liệu trên.

Yêu cầu:
- Chỉ trả về kết quả dưới dạng JSON hợp lệ
- Không trả thêm giải thích hay ký tự thừa
- Nếu không tìm được ảnh thực tế, để chuỗi rỗng ""

Mỗi món ăn có cấu trúc:
[
  {
    "name": "Tên món",
    "ingredients": ["nguyên liệu1", "nguyên liệu2"],
    "instructions": "Cách nấu ngắn gọn, tối đa 3 câu",
    "image": "Link ảnh thực tế (jpg, png hoặc webp) từ Website trên Google",
    "cook_time": "Thời gian nấu (phút hoặc giờ)",
    "nutrition": {
      "calories": "Số kcal",
      "protein": "Số gam protein",
      "fat": "Số gam chất béo",
      "carbs": "Số gam tinh bột"
    }
  }
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{role: "user", content: prompt}],
      temperature: 1.0,
    });

    let text = completion.choices[0].message.content;
    let cleanText = text.replace(/```json|```/g, "").trim();

    let recipes;
    try {
      recipes = JSON.parse(cleanText);
    } catch (err) {
      recipes = [{note: "OpenAI trả về không phải JSON chuẩn", raw: text}];
    }

    res.json({status: "success", recipes});
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({
      error: "Lỗi khi gọi OpenAI API",
      details: error.message,
    });
  }
});

module.exports = router;
