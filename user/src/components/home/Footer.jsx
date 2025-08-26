import React from "react";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-6 lg:px-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h2 className="text-xl font-semibold mb-4">Digital Menu</h2>
          <p className="text-sm text-gray-400">
            Upgrade your restaurant with a fast, contactless digital menu—easy
            to manage, effortless for guests.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">Features</a>
            </li>
            <li>
              <a href="#">Pricing</a>
            </li>
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">Contact Us</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Social Media</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="#">Twitter</a>
            </li>
            <li>
              <a href="#">Instagram</a>
            </li>
            <li>
              <a href="#">Youtube</a>
            </li>
            <li>
              <a href="#">Facebook</a>
            </li>
            <li>
              <a href="#">LinkedIn</a>
            </li>
          </ul>
        </div>
      </div>

      <hr className="border-gray-700 my-8" />

      <div className="flex flex-col md:flex-row justify-between text-sm text-gray-500">
        <p>&copy; 2025 Digital Menu. All rights reserved.</p>
        <ul className="flex flex-wrap gap-4 mt-4 md:mt-0">
          <li>
            <a href="#">Terms & Conditions</a>
          </li>
          <li>
            <a href="#">Privacy Policy</a>
          </li>
          <li>
            <a href="#">Cookie Policy</a>
          </li>
          <li>
            <a href="#">Help Center</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
