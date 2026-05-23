// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import {
//   ShoppingCart,
//   User,
//   LogOut,
//   Menu,
//   X,
//   MessageSquare,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useAppStore } from "@/lib/store";
// import { AuthModal } from "@/components/auth-modal";
// import { useAuth } from "@/lib/auth-context";
// import { useSearchParams, useRouter } from "next/navigation";

// export function Navbar() {
//   const { user, isAuthenticated, logout } = useAuth();
//   const [showModal, setShowModal] = useState(false);
//   const [modalMode, setModalMode] = useState<"login" | "register">("login");
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const cart = useAppStore((state) => state.cart);
//   const cartCount =
//     cart?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

//   useEffect(() => {
//     console.log("NAVBAR CART UPDATED:", cart);
//   }, [cart]);

//   // ── Unread messages count poll karo ──────────────
//   useEffect(() => {
//     if (!user) return;

//     const fetchUnread = async () => {
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/api/messages/conversations`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           },
//         );
//         const data = await res.json();

//         const count = (data.conversations || []).filter(
//           (c: any) =>
//             c.lastMessage && c.lastSenderId !== user.id && c.lastRead === false,
//         ).length;
//         setUnreadCount(count);
//       } catch (err) {
//         // silent fail
//       }
//     };

//     fetchUnread();
//     const interval = setInterval(fetchUnread, 10000);
//     return () => clearInterval(interval);
//   }, [user]);

//   const openLogin = () => {
//     setModalMode("login");
//     setShowModal(true);
//   };
//   const openRegister = () => {
//     setModalMode("register");
//     setShowModal(true);
//   };
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   useEffect(() => {
//     const auth = searchParams.get("auth");
//     if (auth === "login" || auth === "register") {
//       setModalMode(auth);
//       setShowModal(true);
//       router.replace("/");
//     }
//   }, [searchParams]);

//   return (
//     <>
//       <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo */}
//             <Link href="/" className="flex items-center gap-2">
//               <img
//                 src="/logo.jpeg"
//                 alt="logo"
//                 className="h-10 w-10 rounded-full object-cover"
//               />
//               <span className="font-bold text-lg text-gray-900">
//                 Art Fusion
//               </span>
//             </Link>

//             {/* Desktop Links */}
//             <div className="hidden md:flex items-center gap-8">
//               <Link
//                 href="/"
//                 className="text-sm text-gray-600 hover:text-black transition-colors"
//               >
//                 Home
//               </Link>
//               <Link
//                 href="/gallery"
//                 className="text-sm text-gray-600 hover:text-black transition-colors"
//               >
//                 Gallery
//               </Link>
//               <Link
//                 href="/about"
//                 className="text-sm text-gray-600 hover:text-black transition-colors"
//               >
//                 About
//               </Link>
//             </div>

//             {/* Right side */}
//             <div className="flex items-center gap-3">
//               {/* Cart  */}
//               <Link href="/cart">
//                 <Button variant="ghost" size="icon" className="relative">
//                   <ShoppingCart className="h-5 w-5" />
//                   {cartCount > 0 && (
//                     <span className="absolute -top-1 -right-1 text-[10px] bg-black text-white px-1.5 rounded-full">
//                       {cartCount}
//                     </span>
//                   )}
//                 </Button>
//               </Link>

//               {/* Messages icon — sabke liye jab logged in ho */}
//               {isAuthenticated && user && (
//                 <Link href="/messages">
//                   <Button variant="ghost" size="icon" className="relative">
//                     <MessageSquare className="h-5 w-5" />
//                     {unreadCount > 0 && (
//                       <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white px-1.5 rounded-full">
//                         {unreadCount}
//                       </span>
//                     )}
//                   </Button>
//                 </Link>
//               )}

//               {/* Auth / User dropdown */}
//               {isAuthenticated && user ? (
//                 <div className="relative">
//                   <button
//                     onClick={() => setDropdownOpen(!dropdownOpen)}
//                     className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 transition-colors"
//                   >
//                     <div className="w-6 h-6 rounded-full overflow-hidden bg-black flex items-center justify-center">
//                       {user.avatar ? (
//                         <img
//                           src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`}
//                           alt={user.name}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <span className="text-white text-xs font-bold">
//                           {user.name?.charAt(0).toUpperCase()}
//                         </span>
//                       )}
//                     </div>
//                     <span className="text-sm font-medium text-gray-800 hidden sm:block">
//                       {user.name?.split(" ")[0]}
//                     </span>
//                   </button>

//                   {/* Dropdown */}
//                   {dropdownOpen && (
//                     <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
//                       {/* User info */}
//                       <div className="px-4 py-2 border-b border-gray-100">
//                         <p className="text-sm font-medium text-gray-900">
//                           {user.name}
//                         </p>
//                         <p className="text-xs text-gray-500 capitalize">
//                           {user.role}
//                         </p>
//                       </div>

//                       {/* Profile */}
//                       <Link
//                         href={
//                           user.role === "artist"
//                             ? `/artist/${user.id}`
//                             : "/profile"
//                         }
//                         className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                         onClick={() => setDropdownOpen(false)}
//                       >
//                         <User className="h-4 w-4" />
//                         Profile
//                       </Link>

//                       {/* Messages — dropdown mein bhi */}
//                       <Link
//                         href="/messages"
//                         className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                         onClick={() => setDropdownOpen(false)}
//                       >
//                         <MessageSquare className="h-4 w-4" />
//                         Messages
//                         {unreadCount > 0 && (
//                           <span className="ml-auto text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">
//                             {unreadCount}
//                           </span>
//                         )}
//                       </Link>

//                       {/* Admin dashboard */}
//                       {user.role === "admin" && (
//                         <Link
//                           href="/admin/dashboard"
//                           className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                           onClick={() => setDropdownOpen(false)}
//                         >
//                           🎨 Dashboard
//                         </Link>
//                       )}

//                       {/* Logout */}
//                       <button
//                         onClick={() => {
//                           logout();
//                           setDropdownOpen(false);
//                         }}
//                         className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                       >
//                         <LogOut className="h-4 w-4" />
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-2">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={openLogin}
//                     className="text-sm"
//                   >
//                     Login
//                   </Button>
//                   <Button
//                     size="sm"
//                     onClick={openRegister}
//                     className="bg-black hover:bg-gray-800 text-white text-sm"
//                   >
//                     Register
//                   </Button>
//                 </div>
//               )}

//               {/* Mobile menu button */}
//               <button
//                 className="md:hidden"
//                 onClick={() => setMenuOpen(!menuOpen)}
//               >
//                 {menuOpen ? (
//                   <X className="h-5 w-5" />
//                 ) : (
//                   <Menu className="h-5 w-5" />
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Mobile menu */}
//           {menuOpen && (
//             <div className="md:hidden py-3 border-t border-gray-100">
//               <div className="flex flex-col gap-2">
//                 <Link
//                   href="/"
//                   className="px-2 py-2 text-sm text-gray-700"
//                   onClick={() => setMenuOpen(false)}
//                 >
//                   Home
//                 </Link>
//                 <Link
//                   href="/gallery"
//                   className="px-2 py-2 text-sm text-gray-700"
//                   onClick={() => setMenuOpen(false)}
//                 >
//                   Gallery
//                 </Link>
//                 <Link
//                   href="/artists"
//                   className="px-2 py-2 text-sm text-gray-700"
//                   onClick={() => setMenuOpen(false)}
//                 >
//                   Artists
//                 </Link>
//                 {/* Messages mobile menu mein bhi */}
//                 {isAuthenticated && (
//                   <Link
//                     href="/messages"
//                     className="px-2 py-2 text-sm text-gray-700 flex items-center gap-2"
//                     onClick={() => setMenuOpen(false)}
//                   >
//                     <MessageSquare className="h-4 w-4" />
//                     Messages
//                     {unreadCount > 0 && (
//                       <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">
//                         {unreadCount}
//                       </span>
//                     )}
//                   </Link>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </nav>

//       <AuthModal
//         isOpen={showModal}
//         onClose={() => setShowModal(false)}
//         defaultMode={modalMode}
//       />
//     </>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/lib/auth-context";
import { useSearchParams, useRouter } from "next/navigation";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("login");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cart = useAppStore((state) => state.cart);
  const cartCount =
    cart?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  useEffect(() => {
    console.log("NAVBAR CART UPDATED:", cart);
  }, [cart]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setMenuOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Unread messages poll
  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/messages/conversations`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        const count = (data.conversations || []).filter(
          (c: any) =>
            c.lastMessage && c.lastSenderId !== user.id && c.lastRead === false
        ).length;
        setUnreadCount(count);
      } catch (err) {
        // silent fail
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const openLogin = () => {
    setModalMode("login");
    setShowModal(true);
  };
  const openRegister = () => {
    setModalMode("register");
    setShowModal(true);
  };

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "login" || auth === "register") {
      setModalMode(auth);
      setShowModal(true);
      router.replace("/");
    }
  }, [searchParams]);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/logo.jpeg"
                alt="logo"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
              />
              <span className="font-bold text-base sm:text-lg text-gray-900 leading-tight">
                Art Fusion
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link href="/" className="text-sm text-gray-600 hover:text-black transition-colors">
                Home
              </Link>
              <Link href="/gallery" className="text-sm text-gray-600 hover:text-black transition-colors">
                Gallery
              </Link>
              <Link href="/about" className="text-sm text-gray-600 hover:text-black transition-colors">
                About
              </Link>
            </div>

            {/* ── Right Side Icons ── */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 text-[9px] sm:text-[10px] bg-black text-white px-1 sm:px-1.5 rounded-full min-w-[16px] text-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Messages icon — only when logged in, hidden on mobile (in burger menu) */}
              {isAuthenticated && user && (
                <Link href="/messages" className="hidden sm:block">
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 text-[9px] sm:text-[10px] bg-red-500 text-white px-1 sm:px-1.5 rounded-full min-w-[16px] text-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}

              {/* Auth / User Dropdown — desktop */}
              {isAuthenticated && user ? (
                <div className="relative hidden sm:block" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-2 sm:px-3 py-1.5 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-black flex items-center justify-center shrink-0">
                      {user.avatar ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xs font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-800 hidden lg:block max-w-[80px] truncate">
                      {user.name?.split(" ")[0]}
                    </span>
                  </button>

                  {/* Dropdown — safe positioning */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>

                      <Link
                        href={user.role === "artist" ? `/artist/${user.id}` : "/profile"}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>

                      <Link
                        href="/messages"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Messages
                        {unreadCount > 0 && (
                          <span className="ml-auto text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>

                      {user.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setDropdownOpen(false)}
                        >
                          🎨 Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Auth buttons — desktop */
                <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                  <Button variant="ghost" size="sm" onClick={openLogin} className="text-sm px-2 sm:px-3">
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={openRegister}
                    className="bg-black hover:bg-gray-800 text-white text-sm px-2 sm:px-3"
                  >
                    Register
                  </Button>
                </div>
              )}

              {/* ── Mobile Burger ── */}
              <button
                className="md:hidden flex items-center justify-center h-9 w-9 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* ── Mobile Menu ── */}
          {menuOpen && (
            <div className="md:hidden border-t border-gray-100 py-2">
              <div className="flex flex-col">
                {/* Nav links */}
                {[
                  { href: "/", label: "Home" },
                  { href: "/gallery", label: "Gallery" },
                  { href: "/about", label: "About" },
                  { href: "/artists", label: "Artists" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Messages in mobile menu */}
                {isAuthenticated && user && (
                  <Link
                    href="/messages"
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full ml-1">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                <div className="border-t border-gray-100 mt-1 pt-1">
                  {isAuthenticated && user ? (
                    <>
                      {/* User info row */}
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-black flex items-center justify-center shrink-0">
                          {user.avatar ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm font-bold">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                      </div>

                      <Link
                        href={user.role === "artist" ? `/artist/${user.id}` : "/profile"}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                        onClick={() => setMenuOpen(false)}
                      >
                        <User className="h-4 w-4" /> Profile
                      </Link>

                      {user.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                          onClick={() => setMenuOpen(false)}
                        >
                          🎨 Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => { logout(); setMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2 px-3 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { openLogin(); setMenuOpen(false); }}
                        className="flex-1 text-sm"
                      >
                        Login
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => { openRegister(); setMenuOpen(false); }}
                        className="flex-1 bg-black hover:bg-gray-800 text-white text-sm"
                      >
                        Register
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        defaultMode={modalMode}
      />
    </>
  );
}