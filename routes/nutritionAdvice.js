// routes/nutritionAdvice.js
require("dotenv").config();

const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @swagger
 * /api/recipes/nutrition-advice:
 *   post:
 *     summary: Tư vấn dinh dưỡng cá nhân dựa trên chiều cao, cân nặng, tuổi, giới tính
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               height:
 *                 type: number
 *                 description: Chiều cao (cm)
 *                 example: 170
 *               weight:
 *                 type: number
 *                 description: Cân nặng (kg)
 *                 example: 68
 *               age:
 *                 type: integer
 *                 description: Tuổi (năm)
 *                 example: 30
 *               gender:
 *                 type: string
 *                 description: "Nam / Nữ (male/female hoặc Nam/Nữ)"
 *                 example: "Nam"
 *               activity_level:
 *                 type: string
 *                 description: "Một trong: sedentary, light, moderate, active, very_active"
 *                 example: "moderate"
 *               goal:
 *                 type: string
 *                 description: "maintain | lose | gain"
 *                 example: "maintain"
 *     responses:
 *       200:
 *         description: Kết quả tư vấn dinh dưỡng (BMI, BMR, TDEE, macros, meal suggestions)
 */
router.post("/nutrition-advice", async (req, res) => {
  try {
    const {
      height,
      weight,
      age,
      gender,
      activity_level = "moderate",
      goal = "maintain",
    } = req.body;

    if (
      typeof height !== "number" ||
      typeof weight !== "number" ||
      typeof age !== "number" ||
      !gender
    ) {
      return res.status(400).json({
        error:
          "Thiếu hoặc sai dữ liệu. Vui lòng gửi height(number cm), weight(number kg), age(number), gender(string).",
      });
    }

    // BMI
    const heightM = height / 100;
    const bmi = Number((weight / (heightM * heightM)).toFixed(1));

    // BMI status (WHO)
    let bmi_status = "Unknown";
    if (bmi < 18.5) bmi_status = "Gầy (Underweight)";
    else if (bmi < 25) bmi_status = "Bình thường (Normal)";
    else if (bmi < 30) bmi_status = "Thừa cân (Overweight)";
    else bmi_status = "Béo phì (Obese)";

    // BMR - Harris-Benedict (original)
    // Men: BMR = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    // Women: BMR = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    const g = (gender + "").toLowerCase();
    let bmr;
    if (g === "male" || g === "m" || g === "nam") {
      bmr =
        88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      // female default
      bmr =
        447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
    }
    bmr = Math.round(bmr);

    // Activity multipliers
    const activityMap = {
      sedentary: 1.2, // ít vận động
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const multiplier =
      activityMap[
        (activity_level + "").toLowerCase()
      ] || activityMap["moderate"];

    let tdee = Math.round(bmr * multiplier);

    // Adjust for goal
    let recommended_calories = tdee;
    if (goal === "lose") recommended_calories = Math.max(1200, tdee - 500);
    else if (goal === "gain") recommended_calories = tdee + 300;

    // Macro distribution (example baseline, can tweak by goal)
    // default: protein 25%, fat 30%, carbs 45%
    let proteinPerc = 0.25;
    let fatPerc = 0.30;
    let carbsPerc = 0.45;

    if (goal === "lose") {
      proteinPerc = 0.30;
      fatPerc = 0.25;
      carbsPerc = 0.45;
    } else if (goal === "gain") {
      proteinPerc = 0.25;
      fatPerc = 0.30;
      carbsPerc = 0.45;
    }

    const proteinG = Math.round((recommended_calories * proteinPerc) / 4);
    const fatG = Math.round((recommended_calories * fatPerc) / 9);
    const carbsG = Math.round((recommended_calories * carbsPerc) / 4);

    const macros = {
      protein: { percent: proteinPerc * 100, grams: proteinG },
      fat: { percent: fatPerc * 100, grams: fatG },
      carbs: { percent: carbsPerc * 100, grams: carbsG },
    };

    // Basic response skeleton
    const baseResult = {
      bmi,
      bmi_status,
      bmr,
      tdee,
      recommended_calories,
      macros,
    };

    // If OpenAI key present, call OpenAI to generate food suggestions + sample meal plan
    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `
Bạn là chuyên gia dinh dưỡng.
Người dùng có:
- Chiều cao: ${height} cm
- Cân nặng: ${weight} kg
- Tuổi: ${age} tuổi
- Giới tính: ${gender}
- Mức độ hoạt động: ${activity_level}
- Mục tiêu: ${goal}
- BMI: ${bmi}
- BMR: ${bmr}
- TDEE (ước tính): ${tdee}
- Recommended calories: ${recommended_calories}
- Macros (protein g, fat g, carbs g): ${proteinG}g, ${fatG}g, ${carbsG}g

Yêu cầu:
1) Trả về một JSON hợp lệ duy nhất (không thêm chữ thừa).
2) Dạng trả về:
{
  "foods_to_eat": ["..."],
  "foods_to_limit": ["..."],
  "sample_meal_plan": {
    "breakfast": "Mô tả món + ước tính kcal",
    "lunch": "Mô tả món + ước tính kcal",
    "dinner": "Mô tả món + ước tính kcal",
    "snack": "Mô tả bữa phụ + ước tính kcal"
  },
  "advice": "Lời khuyên ngắn (1-2 câu)"
}
3) Ưu tiên nguyên liệu dễ tìm ở Việt Nam; mỗi món mô tả ngắn gọn.
4) Tổng kcal trong sample_meal_plan nên xấp xỉ recommended_calories (±10%).
`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });

        let aiText = completion.choices[0].message.content;
        let clean = aiText.replace(/```json|```/g, "").trim();

        let aiJson;
        try {
          aiJson = JSON.parse(clean);
        } catch (e) {
          // If parse fails, wrap raw content
          aiJson = { parse_error: "OpenAI trả về không phải JSON chuẩn", raw: aiText };
        }

        return res.json({ status: "success", ...baseResult, ai: aiJson });
      } catch (aiErr) {
        console.error("OpenAI call error:", aiErr);
        return res.json({
          status: "success",
          ...baseResult,
          ai_error: aiErr.message || "Không thể gọi OpenAI",
        });
      }
    } else {
      // No OpenAI key: return baseResult only
      return res.json({ status: "success", ...baseResult });
    }
  } catch (err) {
    console.error("NutritionAdvice Error:", err);
    return res.status(500).json({ error: "Lỗi server", details: err.message });
  }
});

module.exports = router;
