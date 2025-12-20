const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Recipe = require("../models/recipe");
const imagekit = require("../config/imagekit");
/**
 * @swagger
 * /api/recipes/save:
 *   post:
 *     summary: Lưu một công thức vào tài khoản người dùng
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "692874fcf8589fcd7883cbcb"
 *               recipe:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Salad cà chua"
 *                   ingredients:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["cà chua", "hành tây", "rau thơm"]
 *                   instructions:
 *                     type: string
 *                     example: "Cắt cà chua, trộn với hành tây và rau thơm. Thêm gia vị vừa ăn."
 *                   image:
 *                     type: string
 *                     example: "https://images.unsplash.com/photo-1528825871115-3581a5387919"
 *                   cook_time:
 *                     type: string
 *                     example: "30 phút"
 *                   nutrition:
 *                     type: object
 *                     properties:
 *                       calories:
 *                         type: string
 *                         example: "200 kcal"
 *                       protein:
 *                         type: string
 *                         example: "5g"
 *                       fat:
 *                         type: string
 *                         example: "8g"
 *                       carbs:
 *                         type: string
 *                         example: "15g"
 *     responses:
 *       200:
 *         description: Lưu thành công
 */
router.post("/save", async (req, res) => {
  try {
    const { recipe } = req.body;

    if (!recipe) {
      return res.status(400).json({ error: "Thiếu recipe" });
    }

    let imageUrl = "";
    let imageId = "";

if (recipe.image && recipe.image.startsWith("http")) {
  try {
    const axios = require("axios");

    // Fetch ảnh từ URL crawl được
    const response = await axios.get(recipe.image, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",  // Giả trình duyệt để tránh bị chặn
      },
    });

    // Upload buffer (base64) lên ImageKit
    const uploaded = await imagekit.upload({
      file: Buffer.from(response.data).toString("base64"),
      fileName: `recipe-${Date.now()}.jpg`,
      folder: "recipes",
    });

    imageUrl = uploaded.url;
    imageId = uploaded.fileId;

  } catch (err) {
    console.error("Lỗi fetch/upload ảnh:", err.message);
  }
}


    const newRecipe = await Recipe.create({
      name: recipe.name,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || "",
      image: imageUrl,
      imageId,
      cook_time: recipe.cook_time || "",
      nutrition: {
        calories: recipe.nutrition?.calories || "Không rõ",
        protein: recipe.nutrition?.protein || "Không rõ",
        fat: recipe.nutrition?.fat || "Không rõ",
        carbs: recipe.nutrition?.carbs || "Không rõ",
      },
    });

    res.status(201).json({
      message: "Lưu công thức thành công (không cần userId)",
      recipe: newRecipe,
    });
  } catch (error) {
    console.error("Lỗi lưu recipe:", error);
    res.status(500).json({ error: error.message });
  }
});


/**
 * @swagger
 * /api/recipes/saved:
 *   get:
 *     summary: Lấy tất cả công thức nấu ăn (không cần userId)
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: Danh sách toàn bộ công thức
 */
router.get("/saved", async (req, res) => {
  try {
    const recipes = await Recipe.find();

    res.status(200).json({
      count: recipes.length,
      recipes,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách recipes:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Lấy chi tiết một món ăn theo ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của món ăn
 *     responses:
 *       200:
 *         description: Chi tiết món ăn
 *       404:
 *         description: Không tìm thấy món ăn
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({ error: "Không tìm thấy món ăn" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error("Lỗi lấy recipe theo ID:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
