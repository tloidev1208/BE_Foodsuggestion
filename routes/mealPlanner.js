require("dotenv").config();

const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @swagger
 * /api/recipes/meal-planner:
 *   post:
 *     summary: Lập kế hoạch bữa ăn cho nhiều ngày dựa trên mục tiêu dinh dưỡng
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 example: 7
 *               nutrition_target:
 *                 type: object
 *                 properties:
 *                   calories:
 *                     type: integer
 *                     example: 2000
 *                   protein:
 *                     type: integer
 *                     example: 100
 *                   fat:
 *                     type: integer
 *                     example: 70
 *                   carbs:
 *                     type: integer
 *                     example: 250
 *     responses:
 *       200:
 *         description: Kế hoạch bữa ăn cho nhiều ngày
 */
router.post("/meal-planner", async (req, res) => {
  const { days = 7, nutrition_target } = req.body;

  if (!nutrition_target) {
    return res.status(400).json({ error: "Vui lòng cung cấp nutrition_target" });
  }

  try {
    const prompt = `Hãy lập kế hoạch bữa ăn cho ${days} ngày dựa trên mục tiêu dinh dưỡng:
${JSON.stringify(nutrition_target)}.

Yêu cầu:
- Mỗi ngày có 3 bữa: sáng, trưa, tối
- Trả kết quả dưới dạng JSON hợp lệ, không thêm văn bản khác
- Mỗi bữa ăn gồm:
  {
    "meal": "Tên bữa (sáng/trưa/tối)",
    "name": "Tên món ăn",
    "ingredients": ["nguyên liệu 1", "nguyên liệu 2"],
    "instructions": "Hướng dẫn nấu ngắn gọn, tối đa 3 câu",
    "image": "Link ảnh thực tế",
    "nutrition": {
      "calories": "Số kcal",
      "protein": "g protein",
      "fat": "g fat",
      "carbs": "g carbs"
    }
  }
- Trả về dạng:
[
  {
    "day": 1,
    "meals": [ ...3 bữa ăn... ]
  },
  ...
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    let text = completion.choices[0].message.content;
    let cleanText = text.replace(/```json|```/g, "").trim();

    let mealPlan;
    try {
      mealPlan = JSON.parse(cleanText);
    } catch (err) {
      mealPlan = [{ note: "OpenAI trả về không phải JSON chuẩn", raw: text }];
    }

    res.json({ status: "success", meal_plan: mealPlan });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({
      error: "Lỗi khi gọi OpenAI API",
      details: error.message,
    });
  }
});

module.exports = router;
