const express = require("express");
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
