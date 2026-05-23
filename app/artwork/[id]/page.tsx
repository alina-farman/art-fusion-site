"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  ChevronLeft,
  Eye,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArtworkCard } from "@/components/artwork-card";
import { useAppStore } from "@/lib/store";

export default function ArtworkPage() {
  const params = useParams();
  const id = params?.id as string;

  const { addToCart } = useAppStore();

  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArtworks, setRelatedArtworks] = useState<any[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${artwork.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      addToCart(artwork);
      setAddedToCart(true);
    } catch (err: any) {
      alert(err.message || "Cart mein add nahi hua");
    }
  };

  // FETCH SINGLE ARTWORK
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/artworks/${id}`,
        );
        const data = await res.json();
        const artworkData = data?.artwork || data;

        setArtwork({
          ...artworkData,
          artist: {
            id: artworkData.artistId,
            name: artworkData.artistName,
            avatar: artworkData.artistAvatar,
          },
        });
      } catch (err) {
        console.error("Artwork fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  // FETCH RELATED ARTWORKS
  useEffect(() => {
    if (!artwork?.categoryId) return;

    const fetchRelated = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/artworks?category=${artwork.categoryId}&limit=4`,
        );
        const data = await res.json();
        setRelatedArtworks(
          (data?.artworks || []).filter((a: any) => a.id !== artwork.id),
        );
      } catch (err) {
        console.error("Related fetch error:", err);
      }
    };

    fetchRelated();
  }, [artwork?.categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading artwork...</p>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Artwork not found</h1>
          <p className="mt-2 text-muted-foreground">
            The artwork you are looking for does not exist.
          </p>
          <Button asChild className="mt-6">
            <Link href="/gallery">Back to Gallery</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <div className="mb-6">
          <Link
            href="/gallery"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Gallery
          </Link>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* IMAGE */}
          {/* IMAGE */}
          <div className="space-y-4">
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              style={{ userSelect: "none", WebkitUserSelect: "none" }}
            >
              <Image
                src={
                  artwork.image?.trim()
                    ? artwork.image.startsWith("http")
                      ? artwork.image
                      : `${process.env.NEXT_PUBLIC_API_URL}${artwork.image}`
                    : "/placeholder.png"
                }
                alt={artwork.title?.trim() ? artwork.title : "Artwork image"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                draggable={false}
                style={{ pointerEvents: "none" }}
              />

              {/* ✅ Watermark — detail page pe thoda bada */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.3)",
                    transform: "rotate(-30deg)",
                    whiteSpace: "nowrap",
                    letterSpacing: 2,
                    textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  © {artwork.artistName}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {artwork.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" /> {artwork.likes}
              </span>
            </div>
          </div>

          {/* DETAILS */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{artwork.categoryId}</Badge>
              <h1 className="text-3xl font-bold">{artwork.title}</h1>

              {/* price  */}
              <p className="text-2xl font-semibold text-primary mt-2">
                Rs. {artwork.price?.toLocaleString()}
              </p>
            </div>

            {/* ARTIST */}
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={artwork.artist?.avatar} />
                  <AvatarFallback>
                    {artwork.artist?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{artwork.artist?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {artwork.artist?.location}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/artist/${artwork.artist?.id}`}>View</Link>
                </Button>
              </CardContent>
            </Card>

            {/* ACTIONS */}
            <div className="flex gap-3">
              <Button
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={addedToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {addedToCart ? "Added to Cart ✓" : "Add to Cart"}
              </Button>
            </div>

            <Separator />

            {/* DESCRIPTION */}
            <Tabs defaultValue="description">
              <TabsList className="w-full">
                <TabsTrigger value="description" className="flex-1">
                  Description
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description">
                <p className="text-muted-foreground">{artwork.description}</p>
              </TabsContent>
            </Tabs>

            {/* CONTACT */}
            <Card>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">Ask about this artwork</p>
                  <p className="text-sm text-muted-foreground">
                    Message the artist
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link
                    href={`/messages?receiverId=${artwork.artistId}&name=${encodeURIComponent(
                      artwork.artistName || "",
                    )}`}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RELATED */}
        {relatedArtworks.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedArtworks.map((item: any) => (
                <ArtworkCard key={item.id} artwork={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
