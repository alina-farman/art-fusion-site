"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/lib/store";
import { addToCart as addToCartAPI } from "@/lib/api";

interface ArtworkCardProps {
  artwork: any;
  onCartAdd?: () => void;
}

export function ArtworkCard({ artwork, onCartAdd }: ArtworkCardProps) {
  const { user } = useAuth();
  const setAuthModalOpen = useAppStore((state) => state.setAuthModalOpen);
  const setAuthMode = useAppStore((state) => state.setAuthMode);
  const setCartOpen = useAppStore((state) => state.setCartOpen);
  const triggerGalleryRefresh = useAppStore((s) => s.triggerGalleryRefresh);
  const { addToCart } = useAppStore();

  const handleCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setAuthMode("login");
      setAuthModalOpen(true);
      toast.error("Please login first");
      return;
    }

    try {
      await addToCartAPI(artwork.id);
      addToCart({
        id: artwork.id,
        title: artwork.title,
        price: artwork.price,
        image: artwork.image,
        artistName: artwork.artistName,
      } as any);
      triggerGalleryRefresh();
      toast.success("Added to cart!");
      setCartOpen(true);
      onCartAdd?.();
    } catch (err: any) {
      if (err?.message === "Pehle se cart mein hai") {
        toast.success("Already in cart");
        setCartOpen(true);
        return;
      }
      toast.error(err.message || "Something went wrong");
    }
  };

  const imageUrl = artwork.image?.startsWith("http")
    ? artwork.image
    : `${process.env.NEXT_PUBLIC_API_URL}${
        artwork.image?.startsWith("/") ? "" : "/"
      }${artwork.image}`;

  return (
    <Link href={`/artwork/${artwork.id}`}>
      <Card className="group overflow-hidden border-0 bg-transparent shadow-none hover:shadow-xl transition-all">
        <CardContent className="p-0">
          {/* ✅ Image container — protection wrapper */}
          <div
            className="relative aspect-[4/5] rounded-lg overflow-hidden bg-muted"
            // ✅ Right-click disable
            onContextMenu={(e) => e.preventDefault()}
            // ✅ Drag disable
            onDragStart={(e) => e.preventDefault()}
            style={{ userSelect: "none", WebkitUserSelect: "none" }}
          >
            <Image
              src={imageUrl}
              alt={artwork.title}
              fill
              sizes="(max-width:768px) 50vw, (max-width:1200px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform"
              // ✅ Pointer events off on image itself — drag block
              draggable={false}
              style={{ pointerEvents: "none" }}
            />

            {/* ✅ Watermark overlay — artist name diagonal */}
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
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.35)",
                  transform: "rotate(-30deg)",
                  whiteSpace: "nowrap",
                  letterSpacing: 1,
                  textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                }}
              >
                © {artwork.artistName}
              </span>
            </div>

            <Badge className="absolute top-3 left-3">{artwork.categoryId}</Badge>

            {/* Cart button */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition">
              <Button onClick={handleCartClick} className="w-full">
                Add to Cart
              </Button>
            </div>
          </div>

          <div className="mt-4" style={{ userSelect: "none" }}>
            <h3 className="font-medium">{artwork.title}</h3>
            <p className="text-sm text-gray-500">{artwork.artistName}</p>
            <p className="font-bold">Rs. {artwork.price}</p>
            <div className="flex gap-3 text-xs text-gray-500 mt-2">
              <span>
                <Eye className="h-3 w-3 inline" /> {artwork.views || 0}
              </span>
              <span>
                <Heart className="h-3 w-3 inline" /> {artwork.likes || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}