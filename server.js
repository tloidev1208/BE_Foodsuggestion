require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const swaggerDocs = require("./swagger");

// Routes
const foodRoutes = require("./routes/food");
const recipeRoutes = require("./routes/recipes");
const foodRecipesRoutes = require("./routes/food-recipes");
const authRoutes = require("./routes/auth");
const serpImagesRouter = require("./routes/serpImages");
const mealPlannerRoutes = require("./routes/mealPlanner");
const nutritionRoutes = require("./routes/nutritionAdvice");
const stravaRoutes = require("./routes/strava");
const createPost = require("./routes/posts/createPost");
const deletePost = require("./routes/posts/deletePost");
const getAllPost = require("./routes/posts/getAllPost");
const getById = require("./routes/posts/getById");
const updatePost = require("./routes/posts/update");
const recipeSaveRoutes = require("./routes/recipesave");
const foodDetailRoutes = require("./routes/foodDetail");
const recoveryRouter = require("./routes/recovery");

const app = express();
const PORT = process.env.PORT || 5000;

/* =======================
   ✅ CORS CHUẨN COOKIE
======================= */
const allowedOrigins = [
  "http://localhost:3000",
  "https://food-suggestions.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // cho phép Postman / curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


/* =======================
   ✅ MIDDLEWARE CHUẨN
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =======================
   ✅ MONGODB CONNECT
======================= */
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "Food_Suggestions",
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* =======================
   ✅ ROUTES
======================= */
app.use("/api/food", foodRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/food-recipes", foodRecipesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/serp-images", serpImagesRouter);

app.use("/api/meal-planner", mealPlannerRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/strava", stravaRoutes);

app.use("/api/posts", createPost);
app.use("/api/posts", deletePost);
app.use("/api/posts", getAllPost);
app.use("/api/posts", getById);
app.use("/api/posts", updatePost);

app.use("/api/recipes", recipeSaveRoutes);
app.use("/api/food-detail", foodDetailRoutes);
app.use("/api/recovery", recoveryRouter);

/* =======================
   ✅ SWAGGER
======================= */
swaggerDocs(app);

/* =======================
   ✅ START SERVER
======================= */
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📄 Swagger Docs: http://localhost:${PORT}/api-docs`);
});
