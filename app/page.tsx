"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArtworkCard } from "@/components/artwork-card";
// import { mockArtworks, mockUsers } from '@/lib/data'
import { CATEGORIES } from "@/lib/categories";

// ── Category images & styles (slug se match) ──
const catMeta: Record<
  string,
  { image: string; gradient: string; badge: string }
> = {
  paintings: {
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=500&fit=crop",
    gradient: "from-amber-500/80 to-amber-900/90",
    badge: "bg-amber-100 text-amber-800",
  },
  sketching: {
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=500&fit=crop",
    gradient: "from-stone-500/80 to-stone-900/90",
    badge: "bg-stone-100 text-stone-800",
  },
  digital: {
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=500&fit=crop",
    gradient: "from-blue-500/80 to-blue-900/90",
    badge: "bg-blue-100 text-blue-800",
  },
  handmade: {
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop",
    gradient: "from-rose-500/80 to-rose-900/90",
    badge: "bg-rose-100 text-rose-800",
  },
  cartoon: {
    image:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&h=500&fit=crop",
    gradient: "from-purple-500/80 to-purple-900/90",
    badge: "bg-purple-100 text-purple-800",
  },
};

// ─────────────────────────────────────────────
// CATEGORY CARD
// ─────────────────────────────────────────────
function CategoryCard({ cat }: { cat: (typeof CATEGORIES)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const meta = catMeta[cat.slug] ?? {
    image: "",
    gradient: "from-gray-500/80 to-gray-900/90",
    badge: "bg-gray-100 text-gray-800",
  };
  const visibleSubs = expanded
    ? cat.subcategories
    : cat.subcategories.slice(0, 4);
  const hasMore = cat.subcategories.length > 4;

  return (
    <div className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 bg-white flex flex-col">
      <Link href={`/gallery?category=${cat.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={meta.image}
            alt={cat.label}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${meta.gradient}`}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl">{cat.emoji}</span>
              <div>
                <h3 className="font-bold text-sm leading-tight">{cat.label}</h3>
                <p className="text-xs text-white/70">
                  {cat.subcategories.length} styles
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Subcategory chips — same IDs as gallery filters */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-1.5">
          {visibleSubs.map((sub) => (
            <Link
              key={sub.id}
              href={`/gallery?category=${cat.id}&subcategory=${sub.id}`}
            >
              <span
                className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer hover:opacity-75 transition-opacity ${meta.badge}`}
              >
                {sub.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Medium chips — only for paintings, shown when expanded */}
        {cat.mediums && cat.mediums.length > 0 && expanded && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Medium
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cat.mediums.map((med) => (
                <Link
                  key={med.id}
                  href={`/gallery?category=${cat.slug}&medium=${med.id}`}
                >
                  <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-500 transition-colors cursor-pointer">
                    {med.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Expand toggle */}
        {hasMore && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors self-start"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> +
                {cat.subcategories.length - 4} more
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default function HomePage() {
  const [featuredArtworks, setFeaturedArtworks] = useState<any[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalArtists: 0,
    totalCollectors: 0,
  });

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/artworks?limit=6`,
        );
        const data = await res.json();
        setFeaturedArtworks(data?.artworks || []);

        const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/stats`);
        const statsData = await res2.json();
        if (statsData?.stats) setStats(statsData.stats);
      } catch (err) {
        console.error("Featured fetch error:", err);
      }
    };

    fetchFeatured();
  }, []);

  const nextSlide = () =>
    setCarouselIndex((prev) => (prev + 1) % featuredArtworks.length);
  const prevSlide = () =>
    setCarouselIndex(
      (prev) => (prev - 1 + featuredArtworks.length) % featuredArtworks.length,
    );

  return (
    <div className="min-h-screen bg-background">

      <main>
        {/* ── Hero ─────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="relative z-10">
                <Badge variant="secondary" className="mb-4">
                  <Star className="mr-1 h-3 w-3 fill-accent text-accent" />
                  Discover Exceptional Art
                </Badge>
                <h1
                  className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Where Art Finds Its{" "}
                  <span className="text-accent">Perfect Home</span>
                </h1>
                <p className="mt-6 text-lg text-muted-foreground text-pretty max-w-xl">
                  Connect with talented artists worldwide and discover unique
                  artworks that speak to your soul. From paintings to handmade
                  crafts, find your next masterpiece.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button size="lg" asChild>
                    <Link href="/gallery">
                      Explore Gallery
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/?auth=register">Become an Artist</Link>
                  </Button>
                </div>
                <div className="mt-10 flex items-center gap-8">
                  <div>
                    <p className="text-3xl font-bold">
                      {stats.totalArtworks > 1000
                        ? `${(stats.totalArtworks / 1000).toFixed(0)}K+`
                        : `${stats.totalArtworks}+`}
                    </p>
                    <p className="text-sm text-muted-foreground">Artworks</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <p className="text-3xl font-bold">
                      {stats.totalArtists > 1000
                        ? `${(stats.totalArtists / 1000).toFixed(0)}K+`
                        : `${stats.totalArtists}+`}
                    </p>
                    <p className="text-sm text-muted-foreground">Artists</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <p className="text-3xl font-bold">
                      {stats.totalCollectors > 1000
                        ? `${(stats.totalCollectors / 1000).toFixed(0)}K+`
                        : `${stats.totalCollectors}+`}
                    </p>
                    <p className="text-sm text-muted-foreground">Collectors</p>
                  </div>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="relative aspect-square">
                  <div className="absolute right-0 top-0 h-80 w-64 overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=700&fit=crop"
                      alt="Featured artwork"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 h-72 w-56 overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=500&h=700&fit=crop"
                      alt="Featured sculpture"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute bottom-20 right-20 h-48 w-40 overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=500&fit=crop"
                      alt="Digital art"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Categories ───────────────────────── */}
        <section className="bg-card py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2
                className="text-3xl font-bold lg:text-4xl"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Explore by Category
              </h2>
              <p className="mt-3 text-muted-foreground">
                5 categories • 28+ styles • click any tag to filter instantly
              </p>
            </div>

            {/* 5 category cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {CATEGORIES.map((cat) => (
                <CategoryCard key={cat.id} cat={cat} />
              ))}
            </div>

            {/* Quick-access popular subcategory pills */}
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {CATEGORIES.flatMap((cat) =>
                cat.subcategories.slice(0, 2).map((sub) => (
                  <Link
                    key={`${cat.slug}-${sub.id}`}
                    href={`/gallery?category=${cat.id}&subcategory=${sub.id}`}
                  >
                    <span className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-black hover:text-black transition-colors cursor-pointer shadow-sm">
                      {sub.label}
                    </span>
                  </Link>
                )),
              )}
              <Link href="/gallery">
                <span className="text-xs px-3 py-1.5 bg-black text-white rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-sm">
                  View All →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Featured Artworks ─────────────────── */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2
                  className="text-3xl font-bold lg:text-4xl"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Featured Artworks
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Curated selection of exceptional pieces
                </p>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="outline" size="icon" onClick={prevSlide}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextSlide}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button variant="outline" size="lg" asChild>
                <Link href="/gallery">
                  View All Artworks
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────── */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-accent/20 via-accent/10 to-transparent">
              <div className="grid items-center lg:grid-cols-2">
                <div className="p-8 lg:p-12">
                  <h2
                    className="text-3xl font-bold lg:text-4xl text-balance"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Ready to Start Your Art Collection?
                  </h2>
                  <p className="mt-4 text-muted-foreground text-pretty">
                    Join thousands of collectors who have found their perfect
                    pieces on Art Fusion. Create your account today and start
                    exploring.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button size="lg" asChild>
                      <Link href="/gallery">Start Collecting</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/about">Learn More</Link>
                    </Button>
                  </div>
                </div>
                <div className="relative hidden h-80 lg:block">
                  <div className="absolute -right-20 bottom-0 top-0 w-96">
                    <Image
                      src="https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&h=400&fit=crop"
                      alt="Art collection"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
