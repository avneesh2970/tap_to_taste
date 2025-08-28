import express from "express";
import BlogPost from "../../models/Blog.js";
import { uploadBlogImage } from "../../config/multerConfig.js";
const router = express.Router();

router.get("/get-blog", async (req, res) => {
  console.log("get blog: running");
  try {
    const blogs = await BlogPost.find();
    res.status(200).json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve blogs" });
  }
});

router.get("/get-blog/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await BlogPost.findOne({ slug });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve blog" });
  }
});

router.post(
  "/blog",
  uploadBlogImage.single("featuredImage"),
  async (req, res) => {
    try {
      const data = req.body;

      // Parse categories if sent as JSON string
      if (data.categories) {
        try {
          data.categories = JSON.parse(data.categories);
        } catch {
          data.categories = [];
        }
      }

      // Add image path if file uploaded
      if (req.file) {
        data.featuredImage = req.file.path;
      }

      // Create new blog
      const newPost = new BlogPost(data);
      await newPost.save();

      res.status(201).json(newPost);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create post" });
    }
  }
);

export default router;
