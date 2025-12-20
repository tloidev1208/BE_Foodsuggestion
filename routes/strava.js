//Gm8A4PyuG0B75fnp
//ngthcgiangvvk_db_user

const express = require("express");
const axios = require("axios");

const router = express.Router();

/**
 * @swagger
 * /strava/token:
 *   post:
 *     summary: Get Strava access token from refresh token
 *     tags: [Strava]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_id:
 *                 type: string
 *                 example: "177974"
 *               client_secret:
 *                 type: string
 *                 example: "7092d11e41c2b89bef2b24678d29d27f587aa0b4"
 *               refresh_token:
 *                 type: string
 *                 example: "0640a4dfef5184406480e3a7ae7bf61f59ccde8d"
 *     responses:
 *       200:
 *         description: Access token info
 */

router.post("/token", async (req, res) => {
  try {
    const {client_id, client_secret, refresh_token} = req.body;

    const response = await axios.post("https://www.strava.com/oauth/token", {
      client_id,
      client_secret,
      refresh_token,
      grant_type: "refresh_token",
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

/**
 * @swagger
 * /strava/activities:
 *   get:
 *     summary: Get athlete activities from Strava
 *     tags: [Strava]
 *     parameters:
 *       - in: query
 *         name: access_token
 *         schema:
 *           type: string
 *         required: true
 *         description: Strava access token
 *     responses:
 *       200:
 *         description: List of activities
 */
router.get("/activities", async (req, res) => {
  try {
    const {access_token} = req.query;

    const response = await axios.get(
      "https://www.strava.com/api/v3/athlete/activities",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

/**
 * @swagger
 * /strava/activities/{id}:
 *   get:
 *     summary: Get activity details by ID from Strava
 *     tags: [Strava]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Activity ID
 *       - in: query
 *         name: access_token
 *         schema:
 *           type: string
 *         required: true
 *         description: Strava access token
 *     responses:
 *       200:
 *         description: Activity details
 */
router.get("/activities/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const {access_token} = req.query;

    const response = await axios.get(
      `https://www.strava.com/api/v3/activities/${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;
