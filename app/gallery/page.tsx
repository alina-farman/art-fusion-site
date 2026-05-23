"use client";

// app/gallery/page.tsx — Full gallery with filters

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";
import {
  getArtworks,
  addToCart,
  toggleLike,
  deleteArtwork,
  createArtwork,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth-modal";
import { ArtworkCard } from "@/components/artwork-card";
import { useAppStore } from "@/lib/store";

function GalleryPage() {
  const { isAuthenticated, user } = useAuth();
  const searchParams = useSearchParams();

  // ✅ FIX: seedha URL se initial value — no blink, no race condition
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get("category") || ""
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    () => searchParams.get("subcategory") || ""
  );
  const [selectedMediums, setSelectedMediums] = useState<string[]>(() => {
    const med = searchParams.get("medium");
    return med ? [med] : [];
  });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const isArtist = user?.role === "artist" || user?.role === "admin";

  // Data state
  const galleryRefreshKey = useAppStore((s) => s.galleryRefreshKey);
  const triggerGalleryRefresh = useAppStore((s) => s.triggerGalleryRefresh);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cartMsg, setCartMsg] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [newArtwork, setNewArtwork] = useState({
    title: "",
    description: "",
    price: 0,
    categoryId: "",
    subcategoryId: "",
    medium: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const selectedCat = CATEGORIES.find((cat) => cat.id === newArtwork.categoryId);
  const activeCat = CATEGORIES.find((c) => c.id === selectedCategory);
  const [liked, setLiked] = useState<string[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch artworks
  const fetchArtworks = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getArtworks({
        category: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined,
        medium: selectedMediums.length ? selectedMediums.join(",") : undefined,
        search: search || undefined,
        sort,
        page,
        limit: 12,
      });

      setArtworks(result?.artworks || []);
      setTotal(result?.total || 0);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSubcategory, selectedMediums, search, sort, page]);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks, galleryRefreshKey]);

  // Reset subcategory when category changes
  const handleCategoryClick = (catId: string) => {
    setSelectedCategory((prev) => (prev === catId ? "" : catId));
    setSelectedSubcategory("");
    setSelectedMediums([]);
    setPage(1);
  };

  const toggleMedium = (id: string) => {
    setSelectedMediums((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
    setPage(1);
  };

  const handleLike = async (artworkId: string) => {
    if (!isAuthenticated) {
      setCartMsg("Please login first...");
      setShowLoginModal(true);
      setTimeout(() => setCartMsg(null), 2000);
      return;
    }
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artworks/${artworkId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchArtworks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateArtwork = async () => {
    try {
      const formData = new FormData();
      formData.append("title", newArtwork.title);
      formData.append("description", newArtwork.description);
      formData.append("price", String(newArtwork.price));
      formData.append("categoryId", newArtwork.categoryId);
      formData.append("subcategoryId", newArtwork.subcategoryId);
      formData.append("medium", newArtwork.medium);

      if (selectedImage) formData.append("image", selectedImage);

      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artworks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      console.log("CREATE RESPONSE:", data);

      setShowAddModal(false);
      setNewArtwork({
        title: "",
        description: "",
        price: 0,
        categoryId: "",
        subcategoryId: "",
        medium: "",
      });
      setSelectedImage(null);
      setSearch("");
      setSelectedCategory("");
      setSelectedSubcategory("");
      setSelectedMediums([]);
      setPage(1);

      triggerGalleryRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast message */}
      {cartMsg && (
        <div className="fixed top-20 right-4 z-50 bg-black text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {cartMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Gallery</h1>

          {/* ✅ Active filter badge — user ko pata chale kaunsa filter laga hai */}
          {selectedCategory && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm text-gray-500">Filtering by:</span>
              <span className="inline-flex items-center gap-1.5 bg-black text-white text-xs px-3 py-1 rounded-full">
                {CATEGORIES.find((c) => c.id === selectedCategory)?.emoji}{" "}
                {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                {selectedSubcategory && (
                  <>
                    {" "}→{" "}
                    {
                      CATEGORIES.find((c) => c.id === selectedCategory)
                        ?.subcategories.find((s) => s.id === selectedSubcategory)
                        ?.label
                    }
                  </>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedSubcategory("");
                    setSelectedMediums([]);
                    setPage(1);
                  }}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </div>
          )}

          {user?.role === "artist" && (
            <Button className="mb-4" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Artwork
            </Button>
          )}

          {/* Search + Filter bar */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Artwork By Name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter by Category
              {(selectedCategory || selectedMediums.length > 0) && (
                <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(selectedCategory ? 1 : 0) + selectedMediums.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="w-64 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedSubcategory("");
                    setSelectedMediums([]);
                    setPage(1);
                  }}
                  className="text-xs text-gray-500 hover:text-black"
                >
                  Clear all
                </button>
              </div>

              {/* Categories */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Category
                </p>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                        selectedCategory === cat.id
                          ? "bg-black text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span>{cat.emoji}</span> {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories */}
              {activeCat && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Style
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCat.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setSelectedSubcategory((prev) =>
                            prev === sub.id ? "" : sub.id
                          );
                          setPage(1);
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                          selectedSubcategory === sub.id
                            ? "bg-black text-white border-black"
                            : "border-gray-300 text-gray-600 hover:border-black"
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mediums */}
              {activeCat?.mediums && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Medium
                  </p>
                  <div className="space-y-1.5">
                    {activeCat.mediums.map((med) => (
                      <label key={med.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMediums.includes(med.id)}
                          onChange={() => toggleMedium(med.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{med.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Artworks Grid */}
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-4">{total} Artwork found</p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl h-64 animate-pulse border border-gray-100"
                />
              ))}
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">🎨</p>
              <p className="text-lg font-medium">No Artwork found</p>
              <p className="text-sm mt-1">Change filters or Clear search</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artworks.map((artwork: any) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onCartAdd={() => fetchArtworks()}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 12 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {page}
              </span>
              <Button
                variant="outline"
                disabled={artworks.length < 12}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Artwork Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Artwork</h2>
            <div className="space-y-3">
              <input
                placeholder="Title"
                value={newArtwork.title}
                onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <textarea
                placeholder="Description"
                value={newArtwork.description}
                onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Price e.g.100"
                value={newArtwork.price}
                onChange={(e) => setNewArtwork({ ...newArtwork, price: Number(e.target.value) })}
                className="w-full border p-2 rounded"
              />
              <select
                value={newArtwork.categoryId}
                onChange={(e) =>
                  setNewArtwork({ ...newArtwork, categoryId: e.target.value, subcategoryId: "", medium: "" })
                }
                className="w-full border p-2 rounded"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>

              {selectedCat && selectedCat.subcategories?.length > 0 && (
                <select
                  value={newArtwork.subcategoryId}
                  onChange={(e) => setNewArtwork({ ...newArtwork, subcategoryId: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Subcategory</option>
                  {selectedCat.subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.label}</option>
                  ))}
                </select>
              )}

              {selectedCat?.mediums?.length ? (
                <select
                  value={newArtwork.medium}
                  onChange={(e) => setNewArtwork({ ...newArtwork, medium: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Medium</option>
                  {selectedCat.mediums.map((med) => (
                    <option key={med.id} value={med.id}>{med.label}</option>
                  ))}
                </select>
              ) : null}

              <input
                type="file"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                className="w-full border p-2 rounded"
              />

              <div className="flex gap-2">
                <Button onClick={handleCreateArtwork}>Save</Button>
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        defaultMode="login"
      />
    </div>
  );
}

export default function GalleryPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <GalleryPage />
    </Suspense>
  );
}