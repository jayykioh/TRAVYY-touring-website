const express = require("express");
const router = express.Router();
const Blog = require("../models/Blogs");

router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
