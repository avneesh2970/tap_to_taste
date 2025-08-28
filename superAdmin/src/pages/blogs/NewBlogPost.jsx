import React from "react";
// import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Save, ImageIcon, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import BlogEditor from "./Blogeditor";
import { ArrowRight, Search, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function NewBlogPost() {
  //   const router = useRouter();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState(""); // Added author state
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("create");
  const [blog, setBlog] = useState([]);

  // useEffect(() => {
  //   const isLoggedIn = sessionStorage.getItem("blogLoggedIn");
  //   if (!isLoggedIn) {
  //     router.push("/blog-admin");
  //   }
  // }, [router]);

  // Generate slug from title
  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-");
      setSlug(generatedSlug);
    }
  }, [title]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size exceeds 5MB limit");
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error(
          "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."
        );
        return;
      }

      setFeaturedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const removeCategory = (categoryToRemove) => {
    setCategories(
      categories.filter((category) => category !== categoryToRemove)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validations
    if (!title.trim() || !content.trim() || !excerpt.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!author.trim()) {
      toast.error("Please enter an author name");
      return;
    }
    if (featuredImage && !imageAltText.trim()) {
      toast.error("Please provide alt text for the featured image");
      return;
    }

    setSaving(true);

    try {
      // ✅ Use FormData because we are uploading image + text fields
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("excerpt", excerpt);
      formData.append("content", content);
      formData.append("author", author);
      formData.append("metaTitle", metaTitle);
      formData.append("metaDescription", metaDescription);
      formData.append("featuredImageAlt", imageAltText);
      formData.append("categories", JSON.stringify(categories)); // send as JSON string

      if (featuredImage) {
        formData.append("featuredImage", featuredImage); // multer expects "featuredImage"
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/blog`, // 👈 your Express endpoint
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Blog post created successfully");
      navigate("/blog-admin/dashboard");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.error || "Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/get-blog`
        );
        console.log("ravish", res);
        setBlog(res.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 shadow-sm">
        <div className="flex ">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 text-lg font-semibold ${
              activeTab === "create"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Create New Blog Post
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={`ml-4 px-4 py-2 text-lg font-semibold ${
              activeTab === "view"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            View Blogs
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {previewMode ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Post Preview
              </h2>
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-purple-100 text-purple-700"
              >
                <X className="h-4 w-4" />
                <span>Close Preview</span>
              </button>
            </div>

            <div className="border-b border-gray-200 pb-6 mb-6">
              {imagePreview && (
                <div className="relative w-full h-64 mb-6">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt={imageAltText || title || "Blog post featured image"}
                    fill
                    className="object-contain bg-gray-50 rounded-lg"
                  />
                </div>
              )}

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {title || "Post Title"}
              </h1>
              <p className="text-gray-600 mb-4">
                {excerpt || "Post excerpt will appear here..."}
              </p>

              {/* Display author in preview */}
              {author && (
                <p className="text-sm text-gray-500 mb-4">By {author}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <span
                    key={index}
                    className="text-sm px-3 py-1 bg-purple-100 text-blue-600 rounded-full"
                  >
                    {category}
                  </span>
                ))}
                {categories.length === 0 && (
                  <span className="text-sm text-gray-400">
                    No categories added
                  </span>
                )}
              </div>
            </div>

            <div
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        ) : (
          activeTab === "create" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Featured Image */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Featured Image
                </h2>

                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt={imageAltText || title || "Featured image for blog"}
                      width={500}
                      height={256}
                      className="w-full h-64 object-cover rounded-lg"
                      style={{ objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    <img className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-1">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, WebP or GIF (max. 5MB)
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />

                {imagePreview && (
                  <div className="mt-4">
                    <label
                      htmlFor="imageAltText"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Image Alt Text <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="imageAltText"
                      value={imageAltText}
                      onChange={(e) => setImageAltText(e.target.value)}
                      placeholder="Describe the image for accessibility and SEO"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      A clear description of the image content for screen
                      readers and search engines
                    </p>
                  </div>
                )}

                {isUploading && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Uploading: {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>

              {/* Post Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Post Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                      required
                    />
                  </div>

                  {/* Author field */}
                  <div>
                    <label
                      htmlFor="author"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Author <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Enter author name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="slug"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      custom url <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      URL-friendly version of the title (e.g., my-blog-post)
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="excerpt"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Excerpt <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                      required
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500">
                      A brief summary of the post (displayed in blog listings)
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="metaTitle"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Meta Title{" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="metaTitle"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                      placeholder="Custom title for search engines (leave empty to use post title)"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Recommended length: 50-60 characters. Currently:{" "}
                      {metaTitle.length} characters
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="metaDescription"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Meta Description{" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      id="metaDescription"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                      placeholder="Custom description for search engines (leave empty to use excerpt)"
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500">
                      Recommended length: 150-160 characters. Currently:{" "}
                      {metaDescription.length} characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {categories.map((category, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
                        >
                          <span className="text-sm">{category}</span>
                          <button
                            type="button"
                            onClick={() => removeCategory(category)}
                            className="ml-1 text-purple-600 hover:text-purple-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Add a category"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCategory();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addCategory}
                        className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Content <span className="text-red-500">*</span>
                </h2>
                <BlogEditor content={content} onChange={setContent} />
              </div>

              {/* Submit Button - Removed the Preview button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving || isUploading}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Publish Post</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )
        )}
      </main>
      {activeTab === "view" && (
        <div className="flex-col justify-center items-center ">
          <p className="-mt-10 text-center  text-blue-600 text-2xl mb-8">
            Blogs
          </p>
          <div className="flex justify-center items-center flex-wrap gap-6">
            {blog.map((post) => (
              <div
                key={post._id}
                className="bg-white w-80 rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow duration-300"
              >
                {/* Use normal anchor for navigation */}
                {/* <a href={`/blog/${post.slug}`} className="block group"> */}
                  {/* Image Section */}
                  <div className="relative w-full h-48 overflow-hidden bg-gray-50">
                    <img
                      src={post.featuredImage}
                      alt={post.featuredImageAlt || post.title}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {format(new Date(post.createdAt), "dd MMM yyyy")}
                      </span>
                    </div>

                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 pr-4 group-hover:text-purple-600 transition-colors duration-200">
                        {post.title}
                      </h3>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors duration-200 flex-shrink-0" />
                    </div>

                    {post.author && (
                      <p className="text-sm text-gray-500 mb-2">
                        By {post.author}
                      </p>
                    )}

                    <p className="text-gray-600 text-sm line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {/* {post.categories.map((category, i) => (
                                 <span
                                   key={i}
                                   className={`text-xs px-3 py-1 rounded-full ${getCategoryColorClasses(
                                     i
                                   )}`}
                                 >
                                   {category}
                                 </span>
                               ))} */}
                    </div>
                  </div>
                {/* </a> */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
