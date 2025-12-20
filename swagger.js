require("dotenv").config(); // Thêm dòng này ở đầu file

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Food & Recipe API",
      version: "1.0.0",
      description: "API cho nhận diện nguyên liệu và gợi ý món ăn",
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "${process.env.NEXT_PUBLIC_API_URL}",
      },
    ],
  },
  apis: ["./routes/**/*.js", "./routes/posts/*.js"], // ✅ Quét tất cả các file route
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = swaggerDocs;
