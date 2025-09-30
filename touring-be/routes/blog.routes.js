// routes/blog.routes.js
const router = require("express").Router();
const Blog = require("../models/Blog");

// GET list (có pagination & filter)
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const q = {};
    if (req.query.region) q.region = req.query.region;
    if (req.query.tag) q.tags = req.query.tag;
    if (req.query.search) q.title = { $regex: req.query.search, $options: "i" };

    const [items, total] = await Promise.all([
      Blog.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Blog.countDocuments(q),
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "BLOG_LIST_FAILED", message: err.message });
  }
});

// GET by slug (chi tiết)
router.get("/:slug", async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ error: "NOT_FOUND" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "BLOG_DETAIL_FAILED", message: err.message });
  }
});

module.exports = router;
