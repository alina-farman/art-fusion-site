"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCart } from "@/lib/api";

export function CartSheet() {
  const { user } = useAuth();
  const {
    cart,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    setCart,
  } = useAppStore();

  const total = Array.isArray(cart)
    ? cart.reduce((sum, item) => {
        const price = Number(item?.artwork?.price || 0);
        const qty = Number(item?.quantity || 0);

        if (!item?.artwork) return sum;

        return sum + price * qty;
      }, 0)
    : 0;
  const shipping = total > 0 ? 25 : 0;
  const grandTotal = total + shipping;

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({cart?.length || 0})
          </SheetTitle>
        </SheetHeader>

        {!cart || cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add some beautiful artworks to your collection
              </p>
            </div>
            <Button onClick={() => setCartOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4">
              <div className="space-y-4">
                {cart.map((item) => {
                  const artwork = item?.artwork || item;

                  if (!artwork) return null;

                  return (
                    <div
                      key={item?.artwork?.id}
                      className="flex gap-4 rounded-lg border border-border p-3"
                    >
                      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={
                            artwork?.image
                              ? artwork.image.startsWith("http")
                                ? artwork.image
                                : `${process.env.NEXT_PUBLIC_API_URL}${artwork.image}`
                              : "/placeholder.png"
                          }
                          alt={artwork?.title || "Artwork"}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium line-clamp-1">
                              {artwork.title || "Untitled"}
                            </h4>

                            <p className="text-xs text-muted-foreground">
                              by{" "}
                              {artwork?.artist?.name ||
                                artwork?.artistName ||
                                "Unknown Artist"}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(artwork.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(artwork.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>

                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(artwork.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <p className="text-sm font-semibold">
                            {(
                              Number(artwork?.price || 0) *
                              Number(item.quantity || 1)
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs.{total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Rs.{shipping}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>Rs.{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-col">
                <Button className="w-full" size="lg">
                  Checkout
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCartOpen(false)}
                >
                  Continue Shopping
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
