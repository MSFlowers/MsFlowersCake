"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { Product } from "./types";

export interface CartAddon {
  id: string;
  name: string;
  price: number;
}

export type DeliverySlotType = "standard" | "express" | "midnight";

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  unitBasePrice: number;
  unitOriginalPrice: number;
  weight?: string;
  selectedSlot?: DeliverySlotType;
  cakeMessage?: string;
  cardMessage?: string;
  addons: CartAddon[];
}

export interface ConfirmedOrder {
  orderId: string;
  placedAt: string;
  status: "Order Confirmed";
  paymentMethod: "Cash on Delivery (COD)";
  items: CartItem[];
  deliveryDetails: {
    recipientName: string;
    recipientPhone: string;
    flatHouse: string;
    streetLocality: string;
    landmark?: string;
    pincode: string;
    areaLabel?: string;
    isGift: boolean;
    senderName?: string;
    senderPhone?: string;
    keepSurprise?: boolean;
  };
  schedule: {
    deliveryDateLabel: string;
    slotType: DeliverySlotType;
    slotTimeWindow: string;
    slotFee: number;
  };
  personalization: {
    occasion?: string;
    cakeMessage?: string;
    cardMessage?: string;
    deliveryNote?: string;
  };
  pricing: {
    itemsSubtotal: number;
    addonsSubtotal: number;
    slotFee: number;
    couponCode?: string;
    couponDiscount: number;
    grandTotal: number;
  };
}

export interface AddToCartInput {
  product: Product;
  quantity?: number;
  unitBasePrice?: number;
  unitOriginalPrice?: number;
  weight?: string;
  selectedSlot?: DeliverySlotType;
  cakeMessage?: string;
  cardMessage?: string;
  addons?: CartAddon[];
}

interface ShopSnapshot {
  cart: CartItem[];
  wishlist: Product[];
  selectedPincode: string;
  selectedAreaLabel: string;
  cartOpen: boolean;
  wishlistOpen: boolean;
  lastOrder: ConfirmedOrder | null;
  hydrated: boolean;
}

const STORAGE_KEYS = {
  cart: "msf_cart_v1",
  wishlist: "msf_wishlist_v1",
  pincode: "msf_pincode_v1",
  lastOrder: "msf_last_order_v1",
} as const;

const SERVER_SNAPSHOT: ShopSnapshot = {
  cart: [],
  wishlist: [],
  selectedPincode: "700091",
  selectedAreaLabel: "Salt Lake, 700091",
  cartOpen: false,
  wishlistOpen: false,
  lastOrder: null,
  hydrated: false,
};

let snapshot: ShopSnapshot = SERVER_SNAPSHOT;
let hasHydrated = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function persistStorage(partial: Partial<ShopSnapshot>) {
  if (typeof window === "undefined") return;
  try {
    if ("cart" in partial) {
      window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(snapshot.cart));
    }
    if ("wishlist" in partial) {
      window.localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(snapshot.wishlist));
    }
    if ("selectedPincode" in partial || "selectedAreaLabel" in partial) {
      window.localStorage.setItem(
        STORAGE_KEYS.pincode,
        JSON.stringify({
          pincode: snapshot.selectedPincode,
          areaLabel: snapshot.selectedAreaLabel,
        })
      );
    }
    if ("lastOrder" in partial && snapshot.lastOrder) {
      window.localStorage.setItem(
        STORAGE_KEYS.lastOrder,
        JSON.stringify(snapshot.lastOrder)
      );
    }
  } catch {
    // Ignore storage quota / privacy mode errors cleanly
  }
}

function updateSnapshot(partial: Partial<ShopSnapshot>, persist = false) {
  snapshot = { ...snapshot, ...partial };
  if (persist) {
    persistStorage(partial);
  }
  notifyListeners();
}

function hydrateFromStorage() {
  if (hasHydrated || typeof window === "undefined") return;
  hasHydrated = true;

  const savedCart = safeParseJson<CartItem[]>(
    window.localStorage.getItem(STORAGE_KEYS.cart),
    []
  );
  const savedWishlist = safeParseJson<Product[]>(
    window.localStorage.getItem(STORAGE_KEYS.wishlist),
    []
  );
  const savedPincode = safeParseJson<{ pincode?: string; areaLabel?: string } | null>(
    window.localStorage.getItem(STORAGE_KEYS.pincode),
    null
  );
  const savedOrder = safeParseJson<ConfirmedOrder | null>(
    window.localStorage.getItem(STORAGE_KEYS.lastOrder),
    null
  );

  updateSnapshot({
    cart: Array.isArray(savedCart) ? savedCart : [],
    wishlist: Array.isArray(savedWishlist) ? savedWishlist : [],
    selectedPincode: savedPincode?.pincode || snapshot.selectedPincode,
    selectedAreaLabel: savedPincode?.areaLabel || snapshot.selectedAreaLabel,
    lastOrder: savedOrder,
    hydrated: true,
  });
}

function buildCartItemId(input: AddToCartInput): string {
  const addonIds = (input.addons ?? [])
    .map((a) => a.id)
    .sort()
    .join(",");
  const weight = input.weight || "";
  const cakeMsg = input.cakeMessage?.trim() || "";
  const cardMsg = input.cardMessage?.trim() || "";
  return [input.product.id, weight, addonIds, cakeMsg, cardMsg].join("::");
}

function getDefaultWeight(product: Product): string | undefined {
  if (product.weight) return product.weight;
  if (product.id.startsWith("ck-") && product.category !== "bento") {
    return "500g";
  }
  return undefined;
}

export function addToCart(input: AddToCartInput) {
  const cartItemId = buildCartItemId(input);
  const quantityToAdd = Math.max(1, input.quantity ?? 1);
  const existingIndex = snapshot.cart.findIndex(
    (item) => item.cartItemId === cartItemId
  );

  let nextCart: CartItem[];
  if (existingIndex >= 0) {
    nextCart = snapshot.cart.map((item, idx) =>
      idx === existingIndex
        ? {
            ...item,
            quantity: item.quantity + quantityToAdd,
            selectedSlot: input.selectedSlot ?? item.selectedSlot,
          }
        : item
    );
  } else {
    const newItem: CartItem = {
      cartItemId,
      product: input.product,
      quantity: quantityToAdd,
      unitBasePrice: input.unitBasePrice ?? input.product.price,
      unitOriginalPrice: input.unitOriginalPrice ?? input.product.originalPrice,
      weight: input.weight,
      selectedSlot: input.selectedSlot,
      cakeMessage: input.cakeMessage?.trim() || undefined,
      cardMessage: input.cardMessage?.trim() || undefined,
      addons: input.addons ?? [],
    };
    nextCart = [...snapshot.cart, newItem];
  }

  updateSnapshot({ cart: nextCart }, true);
}

export function updateCartQuantity(cartItemId: string, delta: number) {
  const nextCart = snapshot.cart
    .map((item) =>
      item.cartItemId === cartItemId
        ? { ...item, quantity: item.quantity + delta }
        : item
    )
    .filter((item) => item.quantity > 0);

  updateSnapshot({ cart: nextCart }, true);
}

export function removeFromCart(cartItemId: string) {
  const nextCart = snapshot.cart.filter(
    (item) => item.cartItemId !== cartItemId
  );
  updateSnapshot({ cart: nextCart }, true);
}

export function clearCart() {
  updateSnapshot({ cart: [] }, true);
}

export function toggleWishlist(product: Product) {
  const exists = snapshot.wishlist.some((p) => p.id === product.id);
  const nextWishlist = exists
    ? snapshot.wishlist.filter((p) => p.id !== product.id)
    : [product, ...snapshot.wishlist];

  updateSnapshot({ wishlist: nextWishlist }, true);
}

export function clearWishlist() {
  updateSnapshot({ wishlist: [] }, true);
}

export function moveWishlistToCart(product: Product) {
  addToCart({
    product,
    quantity: 1,
    weight: getDefaultWeight(product),
  });
  const nextWishlist = snapshot.wishlist.filter((p) => p.id !== product.id);
  updateSnapshot({ wishlist: nextWishlist }, true);
}

export function moveAllWishlistToCart() {
  if (snapshot.wishlist.length === 0) return;
  for (const product of snapshot.wishlist) {
    addToCart({
      product,
      quantity: 1,
      weight: getDefaultWeight(product),
    });
  }
  updateSnapshot({ wishlist: [] }, true);
}

export function setPincodeInfo(pincode: string, areaLabel: string) {
  updateSnapshot(
    { selectedPincode: pincode, selectedAreaLabel: areaLabel },
    true
  );
}

export function setCartOpen(open: boolean) {
  updateSnapshot({
    cartOpen: open,
    ...(open ? { wishlistOpen: false } : {}),
  });
}

export function setWishlistOpen(open: boolean) {
  updateSnapshot({
    wishlistOpen: open,
    ...(open ? { cartOpen: false } : {}),
  });
}

export function placeOrder(order: ConfirmedOrder) {
  updateSnapshot(
    {
      lastOrder: order,
      cart: [],
      cartOpen: false,
      wishlistOpen: false,
    },
    true
  );
}

export function useShopState() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  const derived = useMemo(() => {
    const totalCartCount = state.cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const wishlistCount = state.wishlist.length;
    const itemsSubtotal = state.cart.reduce(
      (sum, item) => sum + item.unitBasePrice * item.quantity,
      0
    );
    const addonsSubtotal = state.cart.reduce((sum, item) => {
      const perItemAddons = item.addons.reduce((s, a) => s + a.price, 0);
      return sum + perItemAddons * item.quantity;
    }, 0);
    const cartSubtotal = itemsSubtotal + addonsSubtotal;

    return {
      totalCartCount,
      wishlistCount,
      itemsSubtotal,
      addonsSubtotal,
      cartSubtotal,
    };
  }, [state.cart, state.wishlist]);

  return {
    cart: state.cart,
    wishlist: state.wishlist,
    selectedPincode: state.selectedPincode,
    selectedAreaLabel: state.selectedAreaLabel,
    cartOpen: state.cartOpen,
    wishlistOpen: state.wishlistOpen,
    lastOrder: state.lastOrder,
    hydrated: state.hydrated,
    ...derived,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    clearWishlist,
    isProductWishlisted: (productId: string) =>
      state.wishlist.some((p) => p.id === productId),
    moveWishlistToCart,
    moveAllWishlistToCart,
    setPincodeInfo,
    setCartOpen,
    setWishlistOpen,
    placeOrder,
  };
}
