const express = require("express");
const router = express.Router();

// ⬇️ IMPORT MODEL
const Food = require("../models/post");
const Recipe = require("../models/recipe");

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search món ăn từ tất cả danh sách
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: "Từ khoá tìm kiếm (ví dụ: phở)"
 *     responses:
 *       200:
 *         description: Danh sách món ăn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: number
 *                 data:
 *                   type: array
 */
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;

    // ❌ Không có keyword
    if (!q || q.trim() === "") {
      return res.json({
        success: true,
        total: 0,
        data: [],
      });
    }

    const regex = new RegExp(q.trim(), "i");

    // 🔍 SEARCH POST
    const foods = await Food.find({
      $or: [
        { foodName: regex },
        { ingredient: regex },
        { content: regex },
      ],
    });

    // 🔍 SEARCH RECIPE
    const recipes = await Recipe.find({
      $or: [
        { name: regex },
        { ingredients: regex }, // ✅ ĐÚNG cho array string
      ],
    });

    // 🧠 Gắn type để FE dễ xử lý
    const foodResults = foods.map((item) => ({
      ...item.toObject(),
      type: "post",
    }));

    const recipeResults = recipes.map((item) => ({
      ...item.toObject(),
      type: "recipe",
    }));

    res.json({
      success: true,
      total: foodResults.length + recipeResults.length,
      data: [...foodResults, ...recipeResults],
    });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
