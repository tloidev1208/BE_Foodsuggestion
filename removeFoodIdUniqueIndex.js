require("dotenv").config();

const mongoose = require("mongoose");

async function removeIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Kết nối thành công đến MongoDB Atlas!");

    const result = await mongoose.connection
      .collection("posts")
      .dropIndex("foodId_1");

    console.log("Đã xóa unique index foodId_1:", result);
  } catch (err) {
    console.error("Lỗi:", err.message);
  } finally {
    process.exit();
  }
}

removeIndex();
