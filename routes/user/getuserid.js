const express = require("express");
const mongoose = require("mongoose");
const User = require("../../models/user");

const router = express.Router();

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng theo userId
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của người dùng (MongoDB ObjectId)
 *         schema:
 *           type: string
 *           example: 64f1a8b2c8d9e1a123456789
 *     responses:
 *       200:
 *         description: Lấy thông tin người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 savedRecipes:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: UserId không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */

// GET user by ID
router.get("/:id", async (req, res) => {
  const {id} = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({message: "UserId không hợp lệ"});
  }

  try {
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({message: "Không tìm thấy người dùng"});
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({message: "Lỗi server", error});
  }
});

module.exports = router;
