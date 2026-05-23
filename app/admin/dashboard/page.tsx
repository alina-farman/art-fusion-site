"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Users, ImageIcon, TrendingUp,
  DollarSign, Search, ChevronDown, MoreHorizontal, X,
  Mail, MapPin, Phone, Calendar, Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL;
const getToken = () => localStorage.getItem("token");

const fmt = (d: any, opts?: Intl.DateTimeFormatOptions) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-PK", opts || { year: "numeric", month: "short", day: "numeric" });
};

const clean = (val: any) =>
  !val || val === "null" || val === "undefined" ? "—" : String(val);

const PIE_COLORS = ["#111", "#555", "#888", "#aaa", "#ccc"];

const ROLE_STYLE: Record<string, string> = {
  admin:  "bg-black text-white",
  artist: "border border-gray-400 text-gray-700",
  buyer:  "border border-gray-300 text-gray-500",
};

const STATUS_STYLE: Record<string, string> = {
  available:            "border border-emerald-500 text-emerald-600",
  sold:                 "border border-gray-400 text-gray-500",
  pending:              "border border-yellow-500 text-yellow-600",
  verification_pending: "border border-blue-400 text-blue-600",
  delivered:            "border border-emerald-500 text-emerald-600",
  cancelled:            "border border-red-400 text-red-600",
};

// ── User Detail Modal ─────────────────────────
function UserDetailModal({ user, onClose }: { user: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500" />

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors">
          <X className="h-4 w-4" />
        </button>

        {/* Avatar */}
        <div className="absolute top-12 left-6">
          <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600 shadow-lg">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="pt-14 px-6 pb-6">
          {/* Name + Role */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium mt-1 inline-block ${ROLE_STYLE[user.role] || "border border-gray-300 text-gray-500"}`}>
                {user.role === "admin" ? "👑 Admin" : user.role === "artist" ? "🎨 Artist" : "🛒 Buyer"}
              </span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-500 text-emerald-600 font-medium mt-1">
              Active
            </span>
          </div>

          {/* Info */}
          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-700">{clean(user.email)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-700">{clean(user.location)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-700">{clean(user.phone)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-700">Joined {fmt(user.createdAt, { year:"numeric", month:"long", day:"numeric" })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-700 font-mono text-xs break-all">{user.id}</span>
            </div>
          </div>

          {user.bio && user.bio !== "null" && (
            <p className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">
              {user.bio}
            </p>
          )}

          <button onClick={onClose}
            className="mt-5 w-full py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [users, setUsers]         = useState<any[]>([]);
  const [artworks, setArtworks]   = useState<any[]>([]);
  const [orders, setOrders]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "artworks" | "orders">("users");
  const [userSearch, setUserSearch]       = useState("");
  const [artworkSearch, setArtworkSearch] = useState("");
  const [roleFilter, setRoleFilter]       = useState("all");
  const [openMenu, setOpenMenu]           = useState<string | null>(null);
  const [selectedUser, setSelectedUser]   = useState<any | null>(null);  // ✅ modal state

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") router.push("/");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    (async () => {
      try {
        setLoading(true);
        const h = { Authorization: `Bearer ${getToken()}` };
        const [uR, aR, oR] = await Promise.all([
          fetch(`${API}/api/admin/users`,  { headers: h }),
          fetch(`${API}/api/artworks`,     { headers: h }),
          fetch(`${API}/api/admin/orders`, { headers: h }),
        ]);
        const [uD, aD, oD] = await Promise.all([uR.json(), aR.json(), oR.json()]);
        setUsers(uD?.users || uD || []);
        setArtworks(aD?.artworks || []);
        setOrders(oD?.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const totalRevenue  = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const activeArtists = users.filter(u => u.role === "artist").length;
  const soldArtworks  = artworks.filter(a => a.status === "sold").length;

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const salesByMonth = monthNames.map((month, i) => {
    const mo = orders.filter(o => new Date(o.createdAt).getMonth() === i);
    return { month, Revenue: mo.reduce((s, o) => s + (o.totalAmount || 0), 0), Orders: mo.length };
  }).filter(m => m.Revenue > 0 || m.Orders > 0);

  const catCount: Record<string, number> = {};
  artworks.forEach(a => {
    const cat = a.categoryId || a.category || "Other";
    catCount[cat] = (catCount[cat] || 0) + 1;
  });
  const pieData = Object.entries(catCount).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    pct: Math.round((value / artworks.length) * 100),
  }));

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });
  const filteredArtworks = artworks.filter(a =>
    a.title?.toLowerCase().includes(artworkSearch.toLowerCase())
  );

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f4f0]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f5f4f0] font-sans">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage users, artworks, and monitor platform performance</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users",    value: users.length.toLocaleString(),          sub: `${activeArtists} artists`,                                  icon: <Users className="h-5 w-5 text-gray-400" />,      subColor: "text-emerald-600" },
            { label: "Total Revenue",  value: `Rs. ${totalRevenue.toLocaleString()}`, sub: `${orders.length} orders`,                                   icon: <DollarSign className="h-5 w-5 text-gray-400" />, subColor: "text-emerald-600" },
            { label: "Total Artworks", value: artworks.length.toLocaleString(),       sub: `${soldArtworks} sold`,                                      icon: <ImageIcon className="h-5 w-5 text-gray-400" />, subColor: "text-amber-500"   },
            { label: "Active Artists", value: activeArtists.toLocaleString(),         sub: `${users.filter(u => u.role === "buyer").length} buyers`,     icon: <TrendingUp className="h-5 w-5 text-gray-400" />, subColor: "text-emerald-600" },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-sm bg-white rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500">{s.label}</p>
                  {s.icon}
                </div>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className={`text-xs mt-1 font-medium ${s.subColor}`}>{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Sales Trend</CardTitle>
              <p className="text-xs text-gray-400">Monthly sales and orders overview</p>
            </CardHeader>
            <CardContent>
              {salesByMonth.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No sales data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={salesByMonth} barGap={4}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      formatter={(v: any, n: string) => [n === "Revenue" ? `Rs. ${Number(v).toLocaleString()}` : v, n]} />
                    <Bar dataKey="Revenue" fill="#111" radius={[4,4,0,0]} />
                    <Bar dataKey="Orders"  fill="#888" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Category Distribution</CardTitle>
              <p className="text-xs text-gray-400">Artwork breakdown by category</p>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No artwork data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      dataKey="value" paddingAngle={3}
                      label={({ name, pct }) => `${name} ${pct}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => [v, "Artworks"]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
          {(["users","artworks","orders"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab ? "bg-black text-white" : "text-gray-500 hover:text-gray-900"
              }`}>
              {tab} ({tab === "users" ? users.length : tab === "artworks" ? artworks.length : orders.length})
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">User Management</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">View and manage platform users</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                      placeholder="Search users..."
                      className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black w-52" />
                  </div>
                  <div className="relative">
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="artist">Artist</option>
                      <option value="buyer">Buyer</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400 py-10">No users found</TableCell>
                    </TableRow>
                  ) : filteredUsers.map(u => (
                    <TableRow key={u.id} className="border-gray-50 hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_STYLE[u.role] || "border border-gray-300 text-gray-500"}`}>
                          {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{fmt(u.createdAt)}</TableCell>
                      <TableCell>
                        <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-500 text-emerald-600 font-medium">Active</span>
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <button onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </button>
                          {openMenu === u.id && (
                            <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-36">
                              {/* ✅ View Profile — modal open karo */}
                              <button
                                onClick={() => { setSelectedUser(u); setOpenMenu(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                View Profile
                              </button>
                              <button
                                onClick={() => setOpenMenu(null)}
                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                                Remove User
                              </button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Artworks Tab */}
        {activeTab === "artworks" && (
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Artwork Management</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">All uploaded artworks on the platform</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input value={artworkSearch} onChange={e => setArtworkSearch(e.target.value)}
                    placeholder="Search artworks..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black w-52" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead>Title</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArtworks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400 py-10">No artworks found</TableCell>
                    </TableRow>
                  ) : filteredArtworks.map(a => (
                    <TableRow key={a.id} className="border-gray-50 hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-sm">{a.title}</TableCell>
                      <TableCell className="text-sm text-gray-500">{a.artistName || "—"}</TableCell>
                      <TableCell className="text-sm text-gray-500 capitalize">{a.categoryId || a.category || "—"}</TableCell>
                      <TableCell className="text-sm font-medium">Rs. {a.price?.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[a.status] || "border border-gray-300 text-gray-500"}`}>
                          {a.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">All Orders</CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">Complete order history across the platform</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-400 py-10">No orders found</TableCell>
                    </TableRow>
                  ) : orders.map(o => (
                    <TableRow key={o.id} className="border-gray-50 hover:bg-gray-50 transition-colors">
                      <TableCell className="font-mono text-xs text-gray-500">#{o.id?.slice(0,10)}...</TableCell>
                      <TableCell className="text-sm">{o.buyerName || o.buyerId?.slice(0,8) || "—"}</TableCell>
                      <TableCell className="text-sm font-medium">Rs. {o.totalAmount?.toLocaleString()}</TableCell>
                      <TableCell className="text-sm capitalize text-gray-500">{o.paymentMethod}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[o.paymentStatus] || "border border-gray-300 text-gray-500"}`}>
                          {o.paymentStatus === "verification_pending" ? "Verifying" : o.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{fmt(o.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

      </main>

      {/* Click outside — menu band karo */}
      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}

      {/* ✅ User Detail Modal */}
      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}