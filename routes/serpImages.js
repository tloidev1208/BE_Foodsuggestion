// routes/serpImages.js
const express = require('express');
const SerpApi = require('google-search-results-nodejs');
const router = express.Router();

const SERPAPI_KEY = process.env.SERPAPI_KEY;
if (!SERPAPI_KEY) {
  console.error('Thiếu SERPAPI_KEY trong env');
}

const client = new SerpApi.GoogleSearch(SERPAPI_KEY);

/**
 * @swagger
 * tags:
 *   name: SerpApiImageSearch
 *   description: Tìm kiếm ảnh từ Google Images thông qua SerpAPI
 */

/**
 * @swagger
 * /api/serp-images/search:
 *   get:
 *     summary: Tìm kiếm ảnh từ Google Images (SerpAPI)
 *     tags: [SerpApiImageSearch]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm ảnh
 *     responses:
 *       200:
 *         description: Danh sách link ảnh từ SerpAPI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       source:
 *                         type: string
 *                       original:
 *                         type: string
 *                       thumbnail:
 *                         type: string
 *                       width:
 *                         type: integer
 *                       height:
 *                         type: integer
 *                       position:
 *                         type: integer
 *                 serpapi_metadata:
 *                   type: object
 *                   description: Metadata từ SerpAPI
 *       400:
 *         description: Thiếu từ khóa query
 *       500:
 *         description: Lỗi khi gọi SerpAPI
 */
router.get('/search', async (req, res) => {
  const q = req.query.query;
  if (!q) return res.status(400).json({ error: 'Thiếu từ khóa query' });

  const params = {
    engine: 'google_images',
    q,
    ijn: 0,
  };

  try {
    client.json(params, (data) => {
      const images = (data.images_results || []).slice(0, 1).map(img => ({
        title: img.title,
        source: img.source,
        original: img.original,
        thumbnail: img.thumbnail,
        width: img.original_width,
        height: img.original_height,
        position: img.position
      }));

      res.json({
        images,
        serpapi_metadata: { search_parameters: data.search_parameters }
      });
    });
  } catch (err) {
    console.error('SerpApi error:', err);
    res.status(500).json({ error: 'Lỗi khi gọi SerpApi' });
  }
});

module.exports = router;