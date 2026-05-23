"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  MapPin,
  Edit3,
  Save,
  X,
  ShoppingBag,
  Heart,
  Camera,
  LogOut,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  getMyProfile,
  getMyOrders,
  updateProfile,
  logoutUser,
} from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  verification_pending: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  jazzcash: "JazzCash",
  easypaisa: "Easypaisa",
  bank: "Bank Transfer",
};


const clean = (val: any): string =>
  !val || val === "null" || val === "undefined" ? "" : String(val);

const roleLabel = (role: string) => {
  if (role === "artist") return "🎨 Artist";
  if (role === "admin") return "👑 Admin";
  return "🛒 Buyer";
};

const formatDate = (dateStr: any, options?: Intl.DateTimeFormatOptions) => {
  if (!dateStr || dateStr === "null") return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-PK", options || { year: "numeric", month: "long" });
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, setUser, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/"); return; }
    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const profileData = await getMyProfile();
      const ordersData = await getMyOrders();

      const userData =
        profileData?.userData ||
        profileData?.user ||
        profileData?.data ||
        profileData;

      const orderList = ordersData?.orders || ordersData?.data || [];

      // ✅ FIX: "null" strings clean karke state mein set karo
      const cleanedProfile = {
        ...userData,
        bio:      clean(userData?.bio),
        location: clean(userData?.location),
        avatar:   clean(userData?.avatar),
        phone:    clean(userData?.phone),
      };

      setProfile(cleanedProfile);
      setOrders(orderList);

      setName(clean(userData?.name) || userData?.name || "");
      setBio(clean(userData?.bio));
      setLocation(clean(userData?.location));
    } catch (e: any) {
      console.error("FETCH ERROR:", e);
      setError(e.message);
    } finally {
      setPageLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

const handleSave = async () => {
  setSaving(true);
  setError("");
  setSuccess("");
  try {
    const formData = new FormData();
    formData.append("name", name.trim() || profile.name);
    formData.append("bio", bio.trim());
    formData.append("location", location.trim());
    if (avatar) formData.append("avatar", avatar);

    await updateProfile(formData);

    const profileData = await getMyProfile();
    const userData = profileData?.userData || profileData?.user || profileData;

    const updatedUser = {
      ...user!,
      name: userData.name || user!.name,
      avatar: userData.avatar || null,
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setSuccess("Profile updated! ✅");
    setEditing(false);
    setPreview("");
    setAvatar(null);
    fetchData();
  } catch (e: any) {
    setError(e.message);
  } finally {
    setSaving(false);
  }
};

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (pageLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <p className="text-gray-500">
          Profile not loaded.{" "}
          <Link href="/" className="underline">Go to Home</Link>
        </p>
        <p className="text-sm mt-2 text-red-500">{error}</p>
      </div>
    );

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">

        {/* ── Top card ─────────────────────────── */}
        <Card className="border-0 shadow-md mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary via-accent/60 to-primary/40" />

          <CardContent className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-12 left-6 flex items-end gap-3">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage
                    src={
                      preview ||
                      (profile.avatar ? `${apiUrl}${profile.avatar}` : undefined)
                    }
                    alt={profile.name}
                  />
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {profile.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {editing && (
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
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2 gap-2">
              {editing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setEditing(false); setPreview(""); }}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-gray-800">
                    <Save className="h-4 w-4 mr-1" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-1" /> Edit Profile
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="h-4 w-4 mr-1" /> Logout
                  </Button>
                </>
              )}
            </div>

            {/* Profile info */}
            <div className="mt-10">
              {editing ? (
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                    <input value={location} onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                      rows={3} placeholder="Write some description about you..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                    {/* ✅ FIX: roleLabel() use karo */}
                    <Badge variant={profile.role === "artist" ? "default" : "secondary"} className="capitalize">
                      {roleLabel(profile.role)}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4" /> {profile.email}
                    </span>
                    {/* ✅ FIX: "null" string bhi check */}
                    {profile.location && profile.location !== "null" && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" /> {profile.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" /> Member since{" "}
                      {/* ✅ FIX: formatDate() use karo */}
                      {formatDate(profile.createdAt, { year: "numeric", month: "long" })}
                    </span>
                  </div>

                  {profile.bio && profile.bio !== "null" && (
                    <p className="mt-3 text-sm text-gray-600 max-w-xl">{profile.bio}</p>
                  )}
                </>
              )}

              {error && (
                <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
                  {success}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Tabs ─────────────────────────────── */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 shadow-sm p-1 mb-6 w-fit">
          {[
            { key: "profile", label: "Profile", icon: User },
            { key: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key ? "bg-black text-white" : "text-gray-600 hover:text-gray-900"
                }`}>
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Profile Tab ──────────────────────── */}
        {activeTab === "profile" && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-md md:col-span-2">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" /> Account Details
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Full Name", value: profile.name },
                    { label: "Email", value: profile.email },
                    // ✅ FIX: roleLabel() use karo
                    { label: "Role", value: roleLabel(profile.role) },
                    // ✅ FIX: "null" string handle
                    { label: "Location", value: profile.location || "—" },
                    // ✅ FIX: formatDate() use karo
                    {
                      label: "Member Since",
                      value: formatDate(profile.createdAt, { year: "numeric", month: "long", day: "numeric" }),
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      <span className="text-sm font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick stats */}
            <div className="space-y-4">
              <Card className="border-0 shadow-md">
                <CardContent className="p-5 text-center">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Orders</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-5 text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-3xl font-bold text-gray-900">
                    {orders.filter((o) => o.status === "delivered").length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Delivered</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-5 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-rose-500" />
                  <p className="text-3xl font-bold text-gray-900">
                    Rs.{" "}
                    {orders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Total Spent</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── Orders Tab ───────────────────────── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">There's no order currently</p>
                <Button asChild><Link href="/gallery">Check Gallery</Link></Button>
              </div>
            ) : (
              orders.map((order: any) => (
                <Card key={order.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 12)}...</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {formatDate(order.createdAt, { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={STATUS_COLORS[order.paymentStatus] || STATUS_COLORS.pending}>
                          {order.paymentStatus === "verification_pending" ? "⏳ Verifying" : order.paymentStatus}
                        </Badge>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {(order.items || []).map((item: any, i: number) => (
                        <div key={i} className="flex gap-3 items-center">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {item.image ? (
                              <img src={`${apiUrl}${item.image}`} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">🎨</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                            <p className="text-xs text-gray-500">by {item.artistName}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 shrink-0">
                            Rs. {item.price?.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Delivery to</p>
                        <p className="text-sm text-gray-700 truncate max-w-xs">{order.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-bold text-gray-900">Rs. {order.totalAmount?.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}