require("dotenv").config();
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

// ⚙️ OpenAI config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @swagger
 * /api/recovery:
 *   post:
 *     summary: Gợi ý hồi phục sức khỏe sau tập luyện dựa trên dữ liệu người dùng
 *     tags: [Health]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               distance: 5.2
 *               calories: 420
 *               avg_speed: 8.5
 *               duration: 0.6
 *     responses:
 *       200:
 *         description: Gợi ý hồi phục sau tập luyện
 */
router.post("/", async (req, res) => {
  const { distance, calories, avg_speed, duration } = req.body;

  if ([distance, calories, avg_speed, duration].some(v => v === undefined)) {
    return res.status(400).json({
      error: "Vui lòng cung cấp đầy đủ distance, calories, avg_speed và duration."
    });
  }

  try {
    const prompt = `
Dựa trên dữ liệu buổi tập sau:

${JSON.stringify({ distance, calories, avg_speed, duration }, null, 2)}

Hãy phân tích mức độ gắng sức và đưa ra gợi ý hồi phục.

TRẢ VỀ ĐÚNG JSON, KHÔNG GIẢI THÍCH, KHÔNG THÊM TEXT.

Cấu trúc JSON:

{
  "intensity": "Đánh giá mức độ buổi tập: nhẹ / trung bình / nặng",
  "summary": "Giải thích tổng quan buổi tập",
  "water_intake": "Lượng nước nên uống (ml)",
  "electrolytes": "Có cần bù điện giải không? (có/không + lý do)",
  "nutrition": [
    "Gợi ý dinh dưỡng sau tập"
  ],
  "stretching": [
    "Bài giãn cơ nên làm"
  ],
  "rest_time": "Thời gian nghỉ ngơi lý tưởng trước khi tập lại",
  "warnings": [
    "Cảnh báo nếu buổi tập quá sức hoặc có rủi ro"
  ]
}

Trả về JSON sạch, không markdown.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let text = completion.choices[0].message.content;
    let cleanText = text.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(cleanText);
    } catch (err) {
      result = { error: "Kết quả không phải JSON hợp lệ", raw: text };
    }

    res.json({ status: "success", result });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({
      error: "Lỗi khi gọi OpenAI API",
      details: error.message
    });
  }
});

module.exports = router;
