"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {
  ConfirmedOrder,
  DeliverySlotType,
  useShopState,
} from "../data/shopState";

const QUICK_AREAS = [
  { name: "Salt Lake", pincode: "700091" },
  { name: "Chingrighata", pincode: "700105" },
  { name: "New Town", pincode: "700156" },
  { name: "Park Street", pincode: "700016" },
  { name: "Ballygunge", pincode: "700019" },
  { name: "Howrah", pincode: "711101" },
];

const STANDARD_WINDOWS = [
  "10:00 AM – 1:00 PM",
  "1:00 PM – 4:00 PM",
  "4:00 PM – 7:00 PM",
  "7:00 PM – 10:00 PM",
];

const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Love & Romance",
  "Congratulations",
  "Thank You",
  "Best Wishes",
];

const COUPONS = [
  {
    code: "KOLKATA10",
    label: "10% OFF (up to ₹250)",
    minOrder: 0,
  },
  {
    code: "FIRST100",
    label: "Flat ₹100 OFF on ₹599+",
    minOrder: 599,
  },
  {
    code: "MSFLOWERS50",
    label: "Flat ₹50 OFF",
    minOrder: 0,
  },
];

function computeCouponDiscount(
  code: string | null,
  subtotal: number
): { discount: number; error: string | null } {
  if (!code) return { discount: 0, error: null };
  const normalized = code.trim().toUpperCase();

  if (normalized === "KOLKATA10") {
    return {
      discount: Math.min(250, Math.round(subtotal * 0.1), subtotal),
      error: null,
    };
  }
  if (normalized === "FIRST100") {
    if (subtotal < 599) {
      return {
        discount: 0,
        error: "FIRST100 is valid on orders of ₹599 or more.",
      };
    }
    return {
      discount: Math.min(100, subtotal),
      error: null,
    };
  }
  if (normalized === "MSFLOWERS50") {
    return {
      discount: Math.min(50, subtotal),
      error: null,
    };
  }
  return {
    discount: 0,
    error: "Invalid coupon code. Try KOLKATA10, FIRST100, or MSFLOWERS50.",
  };
}

function formatReadableDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    hydrated,
    selectedPincode,
    selectedAreaLabel,
    itemsSubtotal,
    addonsSubtotal,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    setPincodeInfo,
    placeOrder,
  } = useShopState();

  // Section 1: Recipient & Gift State
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [flatHouse, setFlatHouse] = useState("");
  const [streetLocality, setStreetLocality] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincodeOverride, setPincodeOverride] = useState<string | null>(null);

  const [isGift, setIsGift] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [keepSurprise, setKeepSurprise] = useState(false);

  // Section 2: Schedule State
  const [dateChoice, setDateChoice] = useState<"today" | "tomorrow" | "custom">("today");
  const [customDate, setCustomDate] = useState("");
  const [minDateIso, setMinDateIso] = useState("");
  const [slotTypeOverride, setSlotTypeOverride] = useState<DeliverySlotType | null>(null);
  const [standardWindow, setStandardWindow] = useState(STANDARD_WINDOWS[1]);

  // Section 3: Personalization State
  const [occasion, setOccasion] = useState("Birthday");
  const [cakeMessageOverride, setCakeMessageOverride] = useState<string | null>(null);
  const [cardMessageOverride, setCardMessageOverride] = useState<string | null>(null);
  const [deliveryNote, setDeliveryNote] = useState("");

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form Error State
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const effectivePincode = pincodeOverride ?? selectedPincode;

  const defaultSlotFromCart = useMemo<DeliverySlotType>(() => {
    const found = cart.find((item) => item.selectedSlot);
    return found?.selectedSlot ?? "standard";
  }, [cart]);

  const effectiveSlotType = slotTypeOverride ?? defaultSlotFromCart;

  const defaultCakeMessage = useMemo(
    () => cart.find((item) => item.cakeMessage)?.cakeMessage ?? "",
    [cart]
  );
  const defaultCardMessage = useMemo(
    () => cart.find((item) => item.cardMessage)?.cardMessage ?? "",
    [cart]
  );

  const effectiveCakeMessage = cakeMessageOverride ?? defaultCakeMessage;
  const effectiveCardMessage = cardMessageOverride ?? defaultCardMessage;

  const slotFee =
    effectiveSlotType === "express"
      ? 99
      : effectiveSlotType === "midnight"
      ? 149
      : 0;

  const slotTimeWindow =
    effectiveSlotType === "express"
      ? "Within 90 Minutes"
      : effectiveSlotType === "midnight"
      ? "11:30 PM – 12:15 AM"
      : standardWindow;

  const { discount: couponDiscount, error: activeCouponError } = useMemo(
    () => computeCouponDiscount(appliedCoupon, cartSubtotal),
    [appliedCoupon, cartSubtotal]
  );

  const grandTotal = Math.max(0, cartSubtotal + slotFee - couponDiscount);

  function computeTodayIso() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getDeliveryDateLabel(): string {
    const now = new Date();
    if (dateChoice === "today") {
      return `Today, ${formatReadableDate(now)}`;
    }
    if (dateChoice === "tomorrow") {
      const tmrw = new Date(now);
      tmrw.setDate(tmrw.getDate() + 1);
      return `Tomorrow, ${formatReadableDate(tmrw)}`;
    }
    if (customDate) {
      const parsed = new Date(`${customDate}T00:00:00`);
      if (!Number.isNaN(parsed.getTime())) {
        return formatReadableDate(parsed);
      }
    }
    return "Custom Date";
  }

  function handleApplyCoupon(codeToApply?: string) {
    const raw = (codeToApply ?? couponInput).trim().toUpperCase();
    if (!raw) {
      setCouponFeedback({ type: "error", text: "Please enter a coupon code." });
      return;
    }

    const result = computeCouponDiscount(raw, cartSubtotal);
    if (result.error) {
      setAppliedCoupon(null);
      setCouponFeedback({ type: "error", text: result.error });
      return;
    }

    setAppliedCoupon(raw);
    setCouponInput(raw);
    setCouponFeedback({
      type: "success",
      text: `${raw} applied! You saved ₹${result.discount}.`,
    });
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponFeedback(null);
  }

  function handleSubmitOrder(e: React.FormEvent) {
    e.preventDefault();
    const errors: string[] = [];

    if (!recipientName.trim()) {
      errors.push("Recipient Full Name is required.");
    }
    const cleanRecipientPhone = recipientPhone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(cleanRecipientPhone)) {
      errors.push("Please enter a valid 10-digit Recipient Mobile Number.");
    }
    if (!flatHouse.trim()) {
      errors.push("Flat / House No. / Building is required.");
    }
    if (!streetLocality.trim()) {
      errors.push("Street / Locality / Area is required.");
    }

    const cleanPin = effectivePincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      errors.push("Please enter a valid 6-digit pincode.");
    } else if (!cleanPin.startsWith("700") && !cleanPin.startsWith("711")) {
      errors.push(
        "Currently we deliver only across Kolkata (700xxx) and Howrah (711xxx) pincodes."
      );
    }

    if (isGift) {
      if (!senderName.trim()) {
        errors.push("Sender Full Name is required for gift orders.");
      }
      const cleanSenderPhone = senderPhone.replace(/\D/g, "");
      if (!/^\d{10}$/.test(cleanSenderPhone)) {
        errors.push("Please enter a valid 10-digit Sender Mobile Number.");
      }
    }

    if (dateChoice === "custom" && !customDate) {
      errors.push("Please pick a delivery date.");
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setFormErrors([]);

    const matchedQuickArea = QUICK_AREAS.find((a) => a.pincode === cleanPin);
    const resolvedAreaLabel = matchedQuickArea
      ? `${matchedQuickArea.name}, ${cleanPin}`
      : cleanPin === selectedPincode
      ? selectedAreaLabel
      : `Kolkata, ${cleanPin}`;

    setPincodeInfo(cleanPin, resolvedAreaLabel);

    const orderId = `#MSF-${Math.floor(10000 + Math.random() * 90000)}`;
    const placedAt = new Date().toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const confirmedOrder: ConfirmedOrder = {
      orderId,
      placedAt,
      status: "Order Confirmed",
      paymentMethod: "Cash on Delivery (COD)",
      items: cart,
      deliveryDetails: {
        recipientName: recipientName.trim(),
        recipientPhone: cleanRecipientPhone,
        flatHouse: flatHouse.trim(),
        streetLocality: streetLocality.trim(),
        landmark: landmark.trim() || undefined,
        pincode: cleanPin,
        areaLabel: resolvedAreaLabel,
        isGift,
        senderName: isGift ? senderName.trim() : undefined,
        senderPhone: isGift ? senderPhone.replace(/\D/g, "") : undefined,
        keepSurprise: isGift ? keepSurprise : false,
      },
      schedule: {
        deliveryDateLabel: getDeliveryDateLabel(),
        slotType: effectiveSlotType,
        slotTimeWindow,
        slotFee,
      },
      personalization: {
        occasion,
        cakeMessage: effectiveCakeMessage.trim() || undefined,
        cardMessage: effectiveCardMessage.trim() || undefined,
        deliveryNote: deliveryNote.trim() || undefined,
      },
      pricing: {
        itemsSubtotal,
        addonsSubtotal,
        slotFee,
        couponCode: couponDiscount > 0 && appliedCoupon ? appliedCoupon : undefined,
        couponDiscount,
        grandTotal,
      },
    };

    placeOrder(confirmedOrder);
    router.push("/order-confirmation");
  }

  return (
    <div className="min-h-screen bg-[#faf8f7] text-zinc-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-9">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 mb-5 font-semibold">
          <Link href="/" className="hover:text-[#c8102e] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-950">Checkout</span>
        </nav>

        {!hydrated ? (
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-12 text-center text-sm text-zinc-500 font-medium">
            Loading your checkout...
          </div>
        ) : cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xs p-8 sm:p-14 text-center max-w-2xl mx-auto my-6">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-[#c8102e] flex items-center justify-center text-2xl mx-auto mb-4">
              🛒
            </div>
            <h1 className="text-2xl font-black text-zinc-950">Your Cart is Empty</h1>
            <p className="text-sm text-zinc-600 mt-2 max-w-md mx-auto">
              Add fresh flower bouquets, freshly baked celebration cakes, or combos to proceed with
              checkout.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/flowers"
                className="px-5 py-2.5 rounded-xl bg-[#c8102e] hover:bg-[#a60c25] text-white text-xs sm:text-sm font-bold transition-colors"
              >
                Browse Flowers
              </Link>
              <Link
                href="/cakes"
                className="px-5 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 text-xs sm:text-sm font-bold transition-colors"
              >
                Browse Cakes
              </Link>
              <Link
                href="/combos"
                className="px-5 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 text-xs sm:text-sm font-bold transition-colors"
              >
                Explore Combos
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} noValidate>
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Checkout
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1">
                Same-day &amp; 90-minute hyperlocal delivery across Kolkata &amp; Howrah
              </p>
            </div>

            {formErrors.length > 0 && (
              <div
                role="alert"
                className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-900 space-y-1"
              >
                <p className="font-extrabold text-[#c8102e]">
                  Please fix the following before placing your order:
                </p>
                <ul className="list-disc pl-5 space-y-0.5 font-medium">
                  {formErrors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* ================= LEFT COLUMN: CHECKOUT STEPS ================= */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                {/* STEP 1: DELIVERY ADDRESS & GIFT MODE */}
                <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-zinc-200/90 shadow-2xs space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
                    <span className="w-7 h-7 rounded-full bg-[#c8102e] text-white text-xs font-black flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-zinc-950">
                        Delivery Details
                      </h2>
                      <p className="text-xs text-zinc-500 font-medium">
                        Where should our Salt Lake rider deliver your order?
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                        Recipient Full Name <span className="text-[#c8102e]">*</span>
                      </label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="e.g. Ananya Chatterjee"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#c8102e] focus:ring-2 focus:ring-rose-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                        Recipient Mobile Number <span className="text-[#c8102e]">*</span>
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={recipientPhone}
                        onChange={(e) =>
                          setRecipientPhone(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#c8102e] focus:ring-2 focus:ring-rose-100"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                        Flat / House No. / Building / Floor{" "}
                        <span className="text-[#c8102e]">*</span>
                      </label>
                      <input
                        type="text"
                        value={flatHouse}
                        onChange={(e) => setFlatHouse(e.target.value)}
                        placeholder="e.g. Flat 4B, Block CD-112, 2nd Floor"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#c8102e] focus:ring-2 focus:ring-rose-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                        Street / Locality / Area <span className="text-[#c8102e]">*</span>
                      </label>
                      <input
                        type="text"
                        value={streetLocality}
                        onChange={(e) => setStreetLocality(e.target.value)}
                        placeholder="e.g. Salt Lake Sector I"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#c8102e] focus:ring-2 focus:ring-rose-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g. Near City Centre 1"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#c8102e] focus:ring-2 focus:ring-rose-100"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-xs font-bold text-zinc-700">
                        Kolkata / Howrah Pincode <span className="text-[#c8102e]">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={effectivePincode}
                          onChange={(e) =>
                            setPincodeOverride(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="e.g. 700091"
                          className="sm:w-44 px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold text-zinc-900 focus:outline-hidden focus:border-[#c8102e] focus:ring-2 focus:ring-rose-100"
                        />
                        <div className="flex flex-wrap items-center gap-1.5">
                          {QUICK_AREAS.map((area) => {
                            const active = effectivePincode === area.pincode;
                            return (
                              <button
                                key={area.pincode}
                                type="button"
                                onClick={() => setPincodeOverride(area.pincode)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                                  active
                                    ? "bg-rose-50 border-[#c8102e] text-[#c8102e]"
                                    : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300"
                                }`}
                              >
                                {area.name} ({area.pincode})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {effectivePincode.length === 6 &&
                        (effectivePincode.startsWith("700") ||
                        effectivePincode.startsWith("711") ? (
                          <p className="text-xs font-semibold text-emerald-700">
                            ✓ Express &amp; Same-Day Delivery Available for {effectivePincode}
                          </p>
                        ) : (
                          <p className="text-xs font-semibold text-[#c8102e]">
                            Currently we deliver to Kolkata (700xxx) &amp; Howrah (711xxx)
                            pincodes only.
                          </p>
                        ))}
                    </div>
                  </div>

                  {/* Option 2: Ordering as a Gift Toggle */}
                  <div className="pt-2">
                    <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-rose-200/80 bg-rose-50/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGift}
                        onChange={(e) => setIsGift(e.target.checked)}
                        className="w-4 h-4 accent-[#c8102e] rounded shrink-0"
                      />
                      <div>
                        <span className="text-sm font-bold text-zinc-950 block">
                          Ordering this as a gift for someone else?
                        </span>
                        <span className="text-xs text-zinc-600 font-medium">
                          Add your sender details so we can keep you updated without spoiling the
                          surprise.
                        </span>
                      </div>
                    </label>

                    {isGift && (
                      <div className="mt-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-4">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-700">
                          Sender Details (Your Info)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                              Sender Full Name <span className="text-[#c8102e]">*</span>
                            </label>
                            <input
                              type="text"
                              value={senderName}
                              onChange={(e) => setSenderName(e.target.value)}
                              placeholder="Your full name"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-sm font-medium text-zinc-900 focus:outline-hidden focus:border-[#c8102e]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                              Sender Mobile / WhatsApp <span className="text-[#c8102e]">*</span>
                            </label>
                            <input
                              type="tel"
                              inputMode="numeric"
                              maxLength={10}
                              value={senderPhone}
                              onChange={(e) =>
                                setSenderPhone(e.target.value.replace(/\D/g, ""))
                              }
                              placeholder="10-digit mobile number"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-sm font-medium text-zinc-900 focus:outline-hidden focus:border-[#c8102e]"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-zinc-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={keepSurprise}
                            onChange={(e) => setKeepSurprise(e.target.checked)}
                            className="w-4 h-4 accent-[#c8102e] rounded"
                          />
                          <span>Keep my identity a surprise (Deliver anonymously)</span>
                        </label>
                      </div>
                    )}
                  </div>
                </section>

                {/* STEP 2: DELIVERY DATE & SLOT */}
                <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-zinc-200/90 shadow-2xs space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
                    <span className="w-7 h-7 rounded-full bg-[#c8102e] text-white text-xs font-black flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-zinc-950">
                        Delivery Date &amp; Time Slot
                      </h2>
                      <p className="text-xs text-zinc-500 font-medium">
                        Choose when your flowers and cakes should arrive
                      </p>
                    </div>
                  </div>

                  {/* Date Selector */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-700">
                      Select Delivery Date
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: "today" as const, title: "Today", sub: "Same-Day" },
                        { id: "tomorrow" as const, title: "Tomorrow", sub: "Next Day" },
                        { id: "custom" as const, title: "Pick a Date", sub: "Calendar" },
                      ].map((opt) => {
                        const active = dateChoice === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setDateChoice(opt.id);
                              if (opt.id === "custom" && !minDateIso) {
                                setMinDateIso(computeTodayIso());
                              }
                            }}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              active
                                ? "border-[#c8102e] bg-rose-50/60 ring-1 ring-[#c8102e]/20"
                                : "border-zinc-200 bg-white hover:border-zinc-300"
                            }`}
                          >
                            <span className="block text-xs sm:text-sm font-extrabold text-zinc-950">
                              {opt.title}
                            </span>
                            <span className="block text-[11px] font-medium text-zinc-500 mt-0.5">
                              {opt.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {dateChoice === "custom" && (
                      <div className="pt-1">
                        <input
                          type="date"
                          min={minDateIso || undefined}
                          value={customDate}
                          onFocus={() => {
                            if (!minDateIso) {
                              setMinDateIso(computeTodayIso());
                            }
                          }}
                          onChange={(e) => setCustomDate(e.target.value)}
                          className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold text-zinc-900 focus:outline-hidden focus:border-[#c8102e]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Delivery Speed / Slot Cards */}
                  <div className="space-y-3">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-700">
                      Select Delivery Speed
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setSlotTypeOverride("standard")}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          effectiveSlotType === "standard"
                            ? "border-[#c8102e] bg-rose-50/60 ring-1 ring-[#c8102e]/20"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-extrabold text-zinc-950">
                            Standard Slot
                          </span>
                          <span className="text-xs font-black text-emerald-700">FREE</span>
                        </div>
                        <p className="text-xs text-zinc-600 font-medium mt-1">
                          Pick your preferred 3-hour window
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSlotTypeOverride("express")}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          effectiveSlotType === "express"
                            ? "border-[#c8102e] bg-rose-50/60 ring-1 ring-[#c8102e]/20"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-extrabold text-zinc-950">
                            90-Min Express
                          </span>
                          <span className="text-xs font-black text-purple-800">+₹99</span>
                        </div>
                        <p className="text-xs text-zinc-600 font-medium mt-1">
                          Priority rider dispatch within 90 minutes
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSlotTypeOverride("midnight")}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          effectiveSlotType === "midnight"
                            ? "border-[#c8102e] bg-rose-50/60 ring-1 ring-[#c8102e]/20"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-extrabold text-zinc-950">
                            Midnight Surprise
                          </span>
                          <span className="text-xs font-black text-indigo-800">+₹149</span>
                        </div>
                        <p className="text-xs text-zinc-600 font-medium mt-1">
                          Celebration drop 11:30 PM – 12:15 AM
                        </p>
                      </button>
                    </div>

                    {effectiveSlotType === "standard" && (
                      <div className="pt-1">
                        <p className="text-xs font-bold text-zinc-700 mb-2">
                          Choose Time Window:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {STANDARD_WINDOWS.map((win) => {
                            const active = standardWindow === win;
                            return (
                              <button
                                key={win}
                                type="button"
                                onClick={() => setStandardWindow(win)}
                                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                                  active
                                    ? "bg-[#c8102e] border-[#c8102e] text-white"
                                    : "bg-zinc-50 border-zinc-200 text-zinc-800 hover:border-zinc-300"
                                }`}
                              >
                                {win}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* STEP 3: OCCASION & PERSONALIZATION */}
                <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-zinc-200/90 shadow-2xs space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
                    <span className="w-7 h-7 rounded-full bg-[#c8102e] text-white text-xs font-black flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-zinc-950">
                        Occasion &amp; Personalization
                      </h2>
                      <p className="text-xs text-zinc-500 font-medium">
                        Add your complimentary greeting card note or cake icing message
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-700 mb-2">
                      Select Occasion
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS.map((occ) => {
                        const active = occasion === occ;
                        return (
                          <button
                            key={occ}
                            type="button"
                            onClick={() => setOccasion(occ)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                              active
                                ? "bg-[#c8102e] border-[#c8102e] text-white"
                                : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300"
                            }`}
                          >
                            {occ}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-zinc-700">
                          Name / Message on Cake (If ordering cake)
                        </label>
                        <span className="text-[10px] text-zinc-400">Max 25 chars</span>
                      </div>
                      <input
                        type="text"
                        maxLength={25}
                        value={effectiveCakeMessage}
                        onChange={(e) => setCakeMessageOverride(e.target.value)}
                        placeholder="e.g. Happy Birthday Tina!"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#c8102e]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-zinc-700">
                          Delivery Instructions (Optional)
                        </label>
                      </div>
                      <input
                        type="text"
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        placeholder="e.g. Call on arrival, leave with security"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#c8102e]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                        Complimentary Greeting Card Message (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={effectiveCardMessage}
                        onChange={(e) => setCardMessageOverride(e.target.value)}
                        placeholder="Write a heartfelt note for your free printed greeting card..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#c8102e]"
                      />
                    </div>
                  </div>
                </section>

                {/* STEP 4: PAYMENT METHOD (ONLY COD ACTIVE, OTHERS COMING SOON) */}
                <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-zinc-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
                    <span className="w-7 h-7 rounded-full bg-[#c8102e] text-white text-xs font-black flex items-center justify-center shrink-0">
                      4
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-zinc-950">
                        Payment Method
                      </h2>
                      <p className="text-xs text-zinc-500 font-medium">
                        Select how you would like to pay for your order
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Active COD Card */}
                    <label className="flex items-start justify-between gap-3 p-4 rounded-2xl border-2 border-[#c8102e] bg-rose-50/40 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked
                          readOnly
                          className="mt-1 w-4 h-4 accent-[#c8102e]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-zinc-950">
                              Cash on Delivery (COD)
                            </span>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              Available
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 font-medium mt-1">
                            Pay cash at your doorstep when your flowers or cake arrives.
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-zinc-950 shrink-0">
                        ₹{grandTotal}
                      </span>
                    </label>

                    {/* Disabled UPI Option */}
                    <div
                      aria-disabled="true"
                      className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50 opacity-60 cursor-not-allowed select-none"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          disabled
                          className="w-4 h-4"
                        />
                        <div>
                          <span className="text-sm font-bold text-zinc-800 block">
                            UPI (Google Pay, PhonePe, Paytm)
                          </span>
                          <span className="text-xs text-zinc-500">
                            Instant scan &amp; pay via any UPI app
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full shrink-0">
                        Coming Soon
                      </span>
                    </div>

                    {/* Disabled Cards & NetBanking Option */}
                    <div
                      aria-disabled="true"
                      className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50 opacity-60 cursor-not-allowed select-none"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          disabled
                          className="w-4 h-4"
                        />
                        <div>
                          <span className="text-sm font-bold text-zinc-800 block">
                            Credit / Debit Cards &amp; NetBanking
                          </span>
                          <span className="text-xs text-zinc-500">
                            Visa, Mastercard, RuPay &amp; major Indian banks
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full shrink-0">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              {/* ================= RIGHT COLUMN: STICKY ORDER SUMMARY ================= */}
              <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-5">
                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-zinc-200/90 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <h2 className="text-base sm:text-lg font-extrabold text-zinc-950">
                      Order Summary
                    </h2>
                    <span className="text-xs font-bold text-zinc-500">
                      {cart.reduce((s, i) => s + i.quantity, 0)} item(s)
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1 divide-y divide-zinc-100">
                    {cart.map((item) => {
                      const perItemAddons = item.addons.reduce((s, a) => s + a.price, 0);
                      const lineTotal = (item.unitBasePrice + perItemAddons) * item.quantity;
                      return (
                        <div key={item.cartItemId} className="pt-3 first:pt-0 flex gap-3">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shrink-0">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-1">
                                {item.product.name}
                              </p>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.cartItemId)}
                                aria-label={`Remove ${item.product.name}`}
                                className="text-zinc-400 hover:text-[#c8102e] text-xs cursor-pointer shrink-0"
                              >
                                ✕
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.weight && (
                                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                                  {item.weight}
                                </span>
                              )}
                              {item.addons.map((addon) => (
                                <span
                                  key={addon.id}
                                  className="text-[10px] font-semibold bg-rose-50 text-[#c8102e] px-1.5 py-0.5 rounded"
                                >
                                  +{addon.name}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="inline-flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-white">
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.cartItemId, -1)}
                                  className="w-6 h-6 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 text-xs font-bold cursor-pointer"
                                >
                                  −
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-zinc-900">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.cartItemId, 1)}
                                  className="w-6 h-6 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 text-xs font-bold cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-sm font-black text-zinc-950">₹{lineTotal}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Coupon Code Section */}
                  <div className="pt-4 border-t border-zinc-100 space-y-2.5">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-700">
                      Have a Coupon Code?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm font-bold uppercase text-zinc-900 placeholder:normal-case placeholder:font-medium placeholder:text-zinc-400 focus:outline-hidden focus:border-[#c8102e]"
                      />
                      {appliedCoupon ? (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-[#c8102e] text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      )}
                    </div>

                    {couponFeedback && (
                      <p
                        className={`text-xs font-semibold ${
                          couponFeedback.type === "success"
                            ? "text-emerald-700"
                            : "text-[#c8102e]"
                        }`}
                      >
                        {couponFeedback.text}
                      </p>
                    )}

                    {appliedCoupon && activeCouponError && (
                      <p className="text-xs font-semibold text-[#c8102e]">
                        {activeCouponError}
                      </p>
                    )}

                    {/* Quick Apply Chips */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-bold text-zinc-500">
                        Available Offers (Tap to apply):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {COUPONS.map((c) => {
                          const isApplied = appliedCoupon === c.code;
                          return (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => handleApplyCoupon(c.code)}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                                isApplied
                                  ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                                  : "bg-rose-50/50 border-rose-200 text-[#c8102e] hover:bg-rose-50"
                              }`}
                            >
                              {c.code} • {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bill Breakdown */}
                  <div className="pt-4 border-t border-zinc-100 space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between text-zinc-600 font-medium">
                      <span>Items Total</span>
                      <span className="font-bold text-zinc-900">₹{itemsSubtotal}</span>
                    </div>
                    {addonsSubtotal > 0 && (
                      <div className="flex items-center justify-between text-zinc-600 font-medium">
                        <span>Add-ons Total</span>
                        <span className="font-bold text-zinc-900">₹{addonsSubtotal}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-zinc-600 font-medium">
                      <span>
                        Delivery Slot (
                        {effectiveSlotType === "express"
                          ? "90-Min Express"
                          : effectiveSlotType === "midnight"
                          ? "Midnight"
                          : "Standard"}
                        )
                      </span>
                      <span
                        className={`font-bold ${
                          slotFee === 0 ? "text-emerald-700" : "text-zinc-900"
                        }`}
                      >
                        {slotFee === 0 ? "FREE" : `+₹${slotFee}`}
                      </span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex items-center justify-between text-emerald-700 font-bold">
                        <span>Coupon Discount ({appliedCoupon})</span>
                        <span>−₹{couponDiscount}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-200 text-base font-black text-zinc-950">
                      <span>Total Payable (COD)</span>
                      <span>₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* Place Order CTA */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 rounded-xl bg-[#c8102e] hover:bg-[#a60c25] text-white font-extrabold text-sm sm:text-base shadow-md transition-all cursor-pointer"
                  >
                    Place Order (Cash on Delivery) • ₹{grandTotal}
                  </button>

                  <p className="text-[11px] text-center text-zinc-500 font-medium">
                    100% Freshness &amp; Safe Delivery Guarantee from our Chingrighata, Salt Lake
                    hub.
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
