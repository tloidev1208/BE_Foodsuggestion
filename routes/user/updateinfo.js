const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../../models/user");

const router = express.Router();

/**
 * @swagger
 * /api/user/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng theo userId
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 example: a@gmail.com
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
router.put("/update/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const {name, email} = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {name, email},
      {new: true, runValidators: true}
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;

/**
 * @swagger
 * /api/user/change-password/{id}:
 *   put:
 *     summary: Đổi mật khẩu cho người dùng
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldPassword123
 *               newPassword:
 *                 type: string
 *                 example: NewPass!234
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Yêu cầu không hợp lệ hoặc mật khẩu hiện tại sai
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
/**
 * PUT /api/user/change-password/:id
 * body: { currentPassword, newPassword }
 */
router.put("/change-password/:id", async (req, res) => {
  const {id} = req.params;
  const {currentPassword, newPassword} = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({status: "error", message: "UserId không hợp lệ"});
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      status: "error",
      message: "Vui lòng cung cấp currentPassword và newPassword",
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({status: "error", message: "Không tìm thấy người dùng"});
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({status: "error", message: "Mật khẩu hiện tại không đúng"});
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res
      .status(200)
      .json({status: "success", message: "Đổi mật khẩu thành công"});
  } catch (error) {
    res.status(500).json({status: "error", message: error.message});
  }
});
