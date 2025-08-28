import mongoose, { Schema } from "mongoose";

const BlogPostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
      default: "Novanectar",
    },
    featuredImage: {
      type: String,
    },
    featuredImageAlt: {
      type: String,
      trim: true,
    },
    categories: {
      type: [String],
      default: [],
    },
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const BlogPost =
  mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);

export default BlogPost;
