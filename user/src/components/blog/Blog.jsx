import { useEffect, useState } from "react";
import { ArrowRight, Search, Calendar } from "lucide-react";
import { format } from "date-fns";
import React from "react";
import Navbar from "../navbar/Navbar";

// Blog post type interface (optional for TS, ignore in JS)
const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API}/get-blog`
        );

        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Filter posts based on search term
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.categories.some((category) =>
        category.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Category color helper
  const getCategoryColorClasses = (index) => {
    const colorCombinations = [
      "bg-purple-100 text-purple-700",
      "bg-blue-100 text-blue-700",
      "bg-green-100 text-green-700",
      "bg-indigo-100 text-indigo-700",
      "bg-pink-100 text-pink-700",
      "bg-yellow-100 text-yellow-700",
      "bg-red-100 text-red-700",
      "bg-teal-100 text-teal-700",
    ];

    return colorCombinations[index % colorCombinations.length];
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20">
        {/* Hero Section with Search */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Blog
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Insights, guides, and expert opinions on technology, business, and
              more.
            </p>
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Unable to load blog posts
              </h2>
              <p className="text-gray-600 mb-6">
                There was an error loading the blog posts. Please try again
                later.
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                No blog posts found
              </h2>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? `No posts match "${searchTerm}"`
                  : "Check back soon for new content!"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow duration-300"
                >
                  {/* Use normal anchor for navigation */}
                  <a href={`/blog/${post.slug}`} className="block group">
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
                        {post.categories.map((category, i) => (
                          <span
                            key={i}
                            className={`text-xs px-3 py-1 rounded-full ${getCategoryColorClasses(
                              i
                            )}`}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Blog;
