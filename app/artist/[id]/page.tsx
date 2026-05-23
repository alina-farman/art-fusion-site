"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPin, Calendar, Package, Trash2,
  Edit3, Save, X, Camera
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/artwork-card";
import { useAuth } from "@/lib/auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const clean = (val: any) =>
  !val || val === "null" || val === "undefined" ? "" : String(val);

const formatDate = (dateStr: any) => {
  if (!dateStr || dateStr === "null") return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-PK", { year: "numeric", month: "long" });
};

export default function ArtistProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [artist, setArtist] = useState<any>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const isOwner = user?.id === id;

  useEffect(() => {
    if (!id) return;
    const fetchArtist = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/artists/${id}`);
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "Artist not found");
        setArtist(data.artist);
        setArtworks(data.artworks || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [id]);

  const startEditing = () => {
    setName(clean(artist?.name));
    setBio(clean(artist?.bio));
    setLocation(clean(artist?.location));
    setAvatarFile(null);
    setPreview("");
    setSaveError("");
    setSuccess("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setPreview("");
    setAvatarFile(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", name.trim() || artist.name);
      formData.append("bio", bio.trim());
      formData.append("location", location.trim());
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await fetch(`${API_URL}/api/artists/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Update failed");

      setArtist(data.artist);

      if (setUser && user) {
        const updatedUser = {
          ...user,
          name: data.artist.name || user.name,
          avatar: data.artist.avatar || null,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setSuccess("Profile updated! ✅");
      setEditing(false);
      setPreview("");
      setAvatarFile(null);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (artworkId: string) => {
    if (!confirm("Delete this artwork?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/artworks/${artworkId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setArtworks((prev) => prev.filter((a) => a.id !== artworkId));
    } catch (err: any) {
      alert(err.message || "Delete nahi hua");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{error || "Artist not found"}</p>
        <Link href="/gallery">
          <Button>Back to Gallery</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover */}
      <div className="h-48 bg-gradient-to-r from-primary via-accent/60 to-primary/40" />

      <div className="max-w-5xl mx-auto px-4 pb-12">
        {/* Profile Card */}
        <Card className="border-0 shadow-md -mt-16 mb-8 overflow-hidden">
          <CardContent className="p-6">

            {/* Avatar + Actions Row */}
            <div className="flex items-start justify-between">
              {/* Avatar */}
              <div className="relative -mt-12">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage
                    src={
                      preview ||
                      (clean(artist.avatar) ? `${API_URL}${artist.avatar}` : undefined)
                    }
                    alt={artist.name}
                  />
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {artist.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Camera button —  editing mode mein */}
                {editing && isOwner && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 h-8 w-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 shadow"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {/* Action Buttons — just for owner */}
              {isOwner && (
                <div className="flex gap-2 pt-2">
                  {editing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={cancelEditing} disabled={saving}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-gray-800">
                        <Save className="h-4 w-4 mr-1" />
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={startEditing}>
                      <Edit3 className="h-4 w-4 mr-1" /> Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="mt-4">
              {editing ? (
                // ── Editing Mode ──
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Apne baare mein kuch likhein..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    />
                  </div>

                  {saveError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                      ⚠️ {saveError}
                    </div>
                  )}
                </div>
              ) : (
                // ── View Mode ──
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{artist.name}</h1>
                    <Badge variant="default">🎨 Artist</Badge>
                    {isOwner && <Badge variant="secondary">Your Profile</Badge>}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                    {clean(artist.location) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {artist.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> Joined {formatDate(artist.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4" /> {artworks.length} Artworks
                    </span>
                  </div>

                  {clean(artist.bio) && (
                    <p className="mt-3 text-sm text-gray-600 max-w-xl">{artist.bio}</p>
                  )}

                  {success && (
                    <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm w-fit">
                      {success}
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Artworks */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Artworks by {artist.name}
          </h2>

          {artworks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <p className="text-4xl mb-3">🎨</p>
              <p className="text-gray-500">No artworks yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artworks.map((artwork: any) => (
                <div key={artwork.id} className="relative">
                  <ArtworkCard artwork={artwork} />
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(artwork.id);
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg shadow hover:bg-red-700 z-10"
                      title="Delete artwork"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}