import React, { useEffect, useState, useMemo } from "react";
import {
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  Calendar,
  User,
} from "lucide-react";
import axios from "axios";

export default function Submissions() {
  const [contacts, setContacts] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [activeTab, setActiveTab] = useState("contacts");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contactRes, quoteRes] = await Promise.all([
          axios.get("http://localhost:5000/api/contact"),
          axios.get("http://localhost:5000/api/quotes"),
        ]);
        setContacts(contactRes.data);
        setQuotes(quoteRes.data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and pagination logic
  const currentData = activeTab === "contacts" ? contacts : quotes;
  const filteredData = useMemo(() => {
    return currentData.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentData, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset pagination when switching tabs or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6 px-2">
        <div className="text-sm text-gray-600">
          Showing{" "}
          {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)}{" "}
          to {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
          {filteredData.length} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === page
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span key={page} className="text-gray-400">
                  ...
                </span>
              );
            }
            return null;
          })}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderTable = (data, type) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Name
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">
                      No{" "}
                      {type === "contacts"
                        ? "contact messages"
                        : "quote requests"}{" "}
                      yet.
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      When submissions come in, they'll appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item._id}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-[1.01] cursor-pointer group"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{item.email}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelected({ ...item, type })}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                        type === "contacts"
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                          : "bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:from-yellow-500 hover:to-orange-500"
                      }`}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Submissions
          </h1>
          <p className="text-gray-400">
            Manage contact messages and quote requests
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => handleTabChange("contacts")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              activeTab === "contacts"
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Contact Messages ({contacts.length})
          </button>
          <button
            onClick={() => handleTabChange("quotes")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              activeTab === "quotes"
                ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Quote Requests ({quotes.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${
                activeTab === "contacts" ? "contact messages" : "quote requests"
              }...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-gray-700 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 ml-4">Loading submissions...</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <>
            {activeTab === "contacts" && renderTable(paginatedData, "contacts")}
            {activeTab === "quotes" && renderTable(paginatedData, "quotes")}
            {renderPagination()}
          </>
        )}

        {/* Modal */}
        {selected && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative border border-gray-100"
              style={{ animation: "slideInUp 0.3s ease-out" }}
            >
              {/* Modal Header */}
              <div
                className={`px-6 py-4 rounded-t-3xl ${
                  selected.type === "contacts"
                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                    : "bg-gradient-to-r from-yellow-400 to-orange-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-xl font-bold ${
                      selected.type === "contacts"
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {selected.type === "contacts" ? (
                      <>
                        <Mail className="w-5 h-5 inline mr-2" />
                        Contact Message
                      </>
                    ) : (
                      <>
                        <Building2 className="w-5 h-5 inline mr-2" />
                        Quote Request
                      </>
                    )}
                  </h2>
                  <button
                    onClick={() => setSelected(null)}
                    className={`p-1 rounded-full transition-colors ${
                      selected.type === "contacts"
                        ? "text-white hover:bg-white hover:bg-opacity-20"
                        : "text-gray-900 hover:bg-black hover:bg-opacity-10"
                    }`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {selected.name}
                    </h3>
                    <p className="text-gray-600">{selected.email}</p>
                  </div>
                </div>

                {selected.type === "quotes" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-xs text-blue-600 uppercase font-semibold">
                          Phone
                        </p>
                        <p className="text-gray-900 font-medium">
                          {selected.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Building2 className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-xs text-green-600 uppercase font-semibold">
                          Business
                        </p>
                        <p className="text-gray-900 font-medium">
                          {selected.business}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
                    Message
                  </p>
                  <p className="text-gray-900 leading-relaxed">
                    {selected.message}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(selected.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
