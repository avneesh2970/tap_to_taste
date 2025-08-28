import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // if using react-router
// import { Helmet } from "react-helmet-async";
import BlogPostContent from "./Blog_post_content";
import React from "react";
import axios from "axios";
import Navbar from "../navbar/Navbar";
const Blogpage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/get-blog/${slug}`
        );

        const data = response.data;
        console.log("Fetched blog post:", data);
        setPost(data);
      } catch (error) {
        console.error("Error fetching blog:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPost();
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Blog Post Not Found</p>;

  // ✅ Structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: post.featuredImage ? [post.featuredImage] : [],
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    publisher: {
      "@type": "Organization",
      name: "novanectar",
      logo: {
        "@type": "ImageObject",
        url: "https://novanectar.co.in/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${
        import.meta.env.VITE_APP_URL || "https://novanectar.co.in"
      }/blog/${post.slug}`,
    },
  };

  return (
    <>
      {/* ✅ SEO metadata */}
      {/* <Helmet> */}
      <title>{post.metaTitle || post.title}</title>
      <meta name="description" content={post.metaDescription || post.excerpt} />

      {/* Open Graph */}
      <meta property="og:title" content={post.metaTitle || post.title} />
      <meta
        property="og:description"
        content={post.metaDescription || post.excerpt}
      />
      {post.featuredImage && (
        <meta property="og:image" content={post.featuredImage} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.metaTitle || post.title} />
      <meta
        name="twitter:description"
        content={post.metaDescription || post.excerpt}
      />
      {post.featuredImage && (
        <meta name="twitter:image" content={post.featuredImage} />
      )}

      {/* Canonical */}
      <link
        rel="canonical"
        href={`${
          import.meta.env.VITE_BACKEND_API || "https://novanectar.co.in"
        }/blog/${post.slug}`}
      />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      {/* </Helmet> */}
      <Navbar />
      {/* ✅ Render actual blog content */}
      <BlogPostContent slug={slug} />
    </>
  );
};

export default Blogpage;
