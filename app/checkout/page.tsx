"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/image";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Check
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { useOrderStore } from "@/lib/store/order-store";
import { formatPrice, generateOrderNumber } from "@/lib/utils";
import { Order } from "@/lib/types/product";

// Zod Schema for Checkout
const checkoutSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^[0-9+ -]+$/, "Invalid phone format"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  address: z.string().min(5, "Street address is required"),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "PIN Code must be 6 digits").max(6, "PIN Code must be 6 digits"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getDiscountAmount, getShippingFee, getTotal, promoCode, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "priority">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod" | "netbanking">("upi");
  const [isProcessing, setIsProcessing] = useState(false);

  // Card mock state
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8892");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("•••");
  const [upiId, setUpiId] = useState("sneakerhead@okaxis");

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const baseShipping = getShippingFee();
  const shippingCost = shippingMethod === "priority" ? baseShipping + 299 : baseShipping;
  const grandTotal = Math.max(0, subtotal - discount + shippingCost);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "alex.streets@gmail.com",
      phone: "+91 98765 43210",
      firstName: "Alex",
      lastName: "Kapoor",
      address: "Flat 402, High Street Towers, Linking Road",
      apartment: "Tower B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
    },
  });

  const onAddressSubmit = () => {
    setStep(2);
  };

  const [checkoutError, setCheckoutError] = useState("");

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setCheckoutError("");

    try {
      const formData = getValues();
      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            apartment: formData.apartment || "",
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: "India",
          },
          shippingMethod,
          paymentMethod,
          promoCode,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || "Order checkout failed. Please check your details.");
        setIsProcessing(false);
        return;
      }

      const serverOrder = data.order;
      const newOrder: Order = {
        id: serverOrder.id,
        orderNumber: serverOrder.orderNumber,
        createdAt: new Date().toISOString(),
        status: serverOrder.status,
        items: [...items],
        subtotal: serverOrder.subtotal,
        discount: serverOrder.discount,
        shipping: serverOrder.shipping,
        total: serverOrder.total,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: "India",
        },
        paymentMethod:
          paymentMethod === "upi"
            ? `UPI (${upiId})`
            : paymentMethod === "card"
            ? "Credit / Debit Card"
            : paymentMethod === "cod"
            ? "Cash on Delivery"
            : "Net Banking",
        paymentStatus: serverOrder.paymentStatus,
        trackingNumber: serverOrder.trackingNumber,
        estimatedDelivery: serverOrder.estimatedDelivery,
      };

      addOrder(newOrder);

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if not supported
      }

      clearCart();
      setIsProcessing(false);
      router.push(`/checkout/confirmation?orderId=${newOrder.orderNumber}`);
    } catch (err) {
      setCheckoutError("A network error occurred while placing your order. Please try again.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FAF8F5]">
        <h1 className="font-display font-black text-2xl uppercase tracking-tight text-[#12110E]">
          No items in bag to checkout
        </h1>
        <p className="text-xs text-[#6B665F] mt-2">Add your preferred kicks to bag first.</p>
        <button
          onClick={() => router.push("/shop")}
          className="mt-6 px-6 py-3 bg-[#12110E] text-white text-xs font-black uppercase tracking-wider"
        >
          Go to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator Header */}
        <div className="pb-8 border-b border-[#E4DFD5]">
          <div className="flex items-center justify-between">
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#12110E]">
              Secure Checkout
            </h1>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold uppercase">
              <Lock className="w-4 h-4" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>

          {/* Steps Progress */}
          <div className="grid grid-cols-3 gap-2 mt-6">
            <div
              className={`p-2.5 border-t-4 text-xs font-black uppercase tracking-wider transition-colors ${
                step >= 1 ? "border-[#E85D2C] text-[#12110E]" : "border-[#E4DFD5] text-[#8C877E]"
              }`}
            >
              1. Address & Contact
            </div>
            <div
              className={`p-2.5 border-t-4 text-xs font-black uppercase tracking-wider transition-colors ${
                step >= 2 ? "border-[#E85D2C] text-[#12110E]" : "border-[#E4DFD5] text-[#8C877E]"
              }`}
            >
              2. Shipping Method
            </div>
            <div
              className={`p-2.5 border-t-4 text-xs font-black uppercase tracking-wider transition-colors ${
                step >= 3 ? "border-[#E85D2C] text-[#12110E]" : "border-[#E4DFD5] text-[#8C877E]"
              }`}
            >
              3. Payment & Review
            </div>
          </div>
        </div>

        {/* Main Grid: Form Steps (Left) + Order Recap (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
          {/* Left Column: Multi-Step Forms */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: Shipping Address Form */}
            {step === 1 && (
              <form
                onSubmit={handleSubmit(onAddressSubmit)}
                className="bg-white border border-[#E4DFD5] p-6 sm:p-8 space-y-6"
              >
                <div className="border-b border-[#E4DFD5] pb-4">
                  <h2 className="font-display font-black text-lg uppercase tracking-tight text-[#12110E]">
                    Contact & Delivery Address
                  </h2>
                  <p className="text-xs text-[#6B665F] mt-1">
                    Please provide accurate delivery coordinates for express courier dispatch.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className="w-full p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                      Phone Number (For Tracking SMS) *
                    </label>
                    <input
                      type="tel"
                      {...register("phone")}
                      className="w-full p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black font-mono"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      {...register("firstName")}
                      className="w-full p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                    />
                    {errors.firstName && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      {...register("lastName")}
                      className="w-full p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                    />
                    {errors.lastName && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                    Street Address / House / Building *
                  </label>
                  <input
                    type="text"
                    {...register("address")}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                  />
                  {errors.address && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      {...register("city")}
                      className="w-full p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                    />
                    {errors.city && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      {...register("state")}
                      className="w-full p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                    />
                    {errors.state && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      {...register("pincode")}
                      className="w-full p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black font-mono"
                    />
                    {errors.pincode && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.pincode.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#E4DFD5]">
                  <button
                    type="button"
                    onClick={() => router.push("/cart")}
                    className="text-xs font-bold uppercase text-[#6B665F] hover:text-black flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Bag</span>
                  </button>

                  <button
                    type="submit"
                    className="px-8 py-4 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                  >
                    <span>Continue to Shipping</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Shipping Method Form */}
            {step === 2 && (
              <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 space-y-6">
                <div className="border-b border-[#E4DFD5] pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-black text-lg uppercase tracking-tight text-[#12110E]">
                      Select Delivery Method
                    </h2>
                    <p className="text-xs text-[#6B665F] mt-1">
                      All shipments are fully insured with tamper-evident packaging.
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-[#E85D2C] underline uppercase"
                  >
                    Edit Address
                  </button>
                </div>

                <div className="space-y-3">
                  <label
                    onClick={() => setShippingMethod("standard")}
                    className={`p-4 border flex items-center justify-between cursor-pointer transition-all ${
                      shippingMethod === "standard"
                        ? "border-[#E85D2C] bg-[#FFF0EB] ring-1 ring-[#E85D2C]"
                        : "border-[#E4DFD5] bg-[#FAF8F5] hover:border-black"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="ship-method"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                        className="accent-[#E85D2C]"
                      />
                      <div>
                        <span className="font-display font-black text-sm uppercase text-[#12110E] block">
                          Standard Express Courier
                        </span>
                        <span className="text-xs text-[#6B665F]">
                          Dispatched within 24h. Metro cities: 2–3 business days. Rest of India: 3–5 business days.
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-[#12110E]">
                      {baseShipping === 0 ? "FREE" : formatPrice(baseShipping)}
                    </span>
                  </label>

                  <label
                    onClick={() => setShippingMethod("priority")}
                    className={`p-4 border flex items-center justify-between cursor-pointer transition-all ${
                      shippingMethod === "priority"
                        ? "border-[#E85D2C] bg-[#FFF0EB] ring-1 ring-[#E85D2C]"
                        : "border-[#E4DFD5] bg-[#FAF8F5] hover:border-black"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="ship-method"
                        checked={shippingMethod === "priority"}
                        onChange={() => setShippingMethod("priority")}
                        className="accent-[#E85D2C]"
                      />
                      <div>
                        <span className="font-display font-black text-sm uppercase text-[#12110E] block flex items-center gap-1.5">
                          <span>VIP Priority Overnight Air</span>
                          <span className="text-[9px] bg-[#E85D2C] text-white px-1.5 py-0.2 font-sans font-bold">
                            FASTEST
                          </span>
                        </span>
                        <span className="text-xs text-[#6B665F]">
                          Guaranteed next-day priority air cargo dispatch.
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-[#12110E]">
                      {formatPrice(baseShipping + 299)}
                    </span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#E4DFD5]">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold uppercase text-[#6B665F] hover:text-black flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Address</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-8 py-4 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment UI Form */}
            {step === 3 && (
              <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 space-y-6">
                <div className="border-b border-[#E4DFD5] pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-black text-lg uppercase tracking-tight text-[#12110E]">
                      Select Payment Method
                    </h2>
                    <p className="text-xs text-[#6B665F] mt-1">
                      Choose your preferred payment method. Transactions are secured.
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-[#E85D2C] underline uppercase"
                  >
                    Change Shipping
                  </button>
                </div>

                {/* Payment Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`p-3 border text-xs font-black uppercase text-center transition-all ${
                      paymentMethod === "upi"
                        ? "border-[#E85D2C] bg-[#12110E] text-white shadow-sm"
                        : "border-[#E4DFD5] bg-[#FAF8F5] text-[#12110E] hover:border-black"
                    }`}
                  >
                    UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-3 border text-xs font-black uppercase text-center transition-all ${
                      paymentMethod === "card"
                        ? "border-[#E85D2C] bg-[#12110E] text-white shadow-sm"
                        : "border-[#E4DFD5] bg-[#FAF8F5] text-[#12110E] hover:border-black"
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("netbanking")}
                    className={`p-3 border text-xs font-black uppercase text-center transition-all ${
                      paymentMethod === "netbanking"
                        ? "border-[#E85D2C] bg-[#12110E] text-white shadow-sm"
                        : "border-[#E4DFD5] bg-[#FAF8F5] text-[#12110E] hover:border-black"
                    }`}
                  >
                    NetBanking
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-3 border text-xs font-black uppercase text-center transition-all ${
                      paymentMethod === "cod"
                        ? "border-[#E85D2C] bg-[#12110E] text-white shadow-sm"
                        : "border-[#E4DFD5] bg-[#FAF8F5] text-[#12110E] hover:border-black"
                    }`}
                  >
                    COD
                  </button>
                </div>

                {/* Payment Details Container */}
                <div className="p-5 bg-[#FAF8F5] border border-[#E4DFD5]">
                  {paymentMethod === "upi" && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block">
                        Enter UPI ID (Google Pay / PhonePe / Paytm / BHIM)
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full p-3 bg-white border border-[#E4DFD5] text-xs font-mono focus:outline-none focus:border-black font-bold"
                      />
                      <p className="text-[11px] text-[#6B665F]">
                        A collect request for <strong>{formatPrice(grandTotal)}</strong> will be initiated upon order placement.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full p-3 bg-white border border-[#E4DFD5] text-xs font-mono font-bold focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full p-3 bg-white border border-[#E4DFD5] text-xs font-mono font-bold focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                            CVV Code
                          </label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full p-3 bg-white border border-[#E4DFD5] text-xs font-mono font-bold focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "netbanking" && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block">
                        Select Bank
                      </label>
                      <select className="w-full p-3 bg-white border border-[#E4DFD5] text-xs font-semibold focus:outline-none focus:border-black">
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>State Bank of India</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#12110E]">
                        Cash on Delivery Available
                      </p>
                      <p className="text-xs text-[#6B665F]">
                        Pay in cash or via UPI to the courier upon delivery at your doorstep.
                      </p>
                    </div>
                  )}
                </div>

                {checkoutError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {checkoutError}
                  </div>
                )}

                {/* Final Submit CTA */}
                <div className="pt-4 flex items-center justify-between border-t border-[#E4DFD5]">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold uppercase text-[#6B665F] hover:text-black flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Shipping</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handlePlaceOrder}
                    className="px-8 py-4 bg-[#E85D2C] hover:bg-[#D44E1F] disabled:opacity-50 text-white font-display font-black text-sm uppercase tracking-wider shadow-lg transition-colors flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <span>Processing Order...</span>
                    ) : (
                      <>
                        <span>Place Order • {formatPrice(grandTotal)}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Recap */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E4DFD5] p-6 space-y-6 sticky top-24">
              <h3 className="font-display font-black text-base uppercase tracking-wider text-[#12110E] pb-3 border-b border-[#E4DFD5]">
                Order Items ({items.length})
              </h3>

              {/* Items List */}
              <div className="space-y-4 max-h-80 overflow-y-auto divide-y divide-[#F2EDE4]">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <div className="relative w-14 h-16 bg-[#F2EDE4] border border-[#E4DFD5] shrink-0 overflow-hidden">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-black text-xs uppercase text-[#12110E] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-[#6B665F] font-semibold">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-xs text-[#12110E]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Summary */}
              <div className="space-y-2 text-xs text-[#6B665F] pt-4 border-t border-[#E4DFD5]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#12110E] font-mono">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#E85D2C] font-semibold">
                    <span>Discount ({promoCode})</span>
                    <span className="font-mono">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery ({shippingMethod === "priority" ? "Priority Overnight" : "Standard"})</span>
                  <span className="font-semibold text-[#12110E]">
                    {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-display font-black text-[#12110E] pt-3 border-t border-[#E4DFD5]">
                  <span>Total Amount</span>
                  <span className="font-mono text-xl text-[#E85D2C]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Trust Notes */}
              <div className="p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-[11px] text-[#6B665F] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#12110E]">
                  <ShieldCheck className="w-4 h-4 text-[#E85D2C]" />
                  <span>Cally Wear Authenticity Guarantee</span>
                </div>
                <p>
                  Every order includes tracked doorstep dispatch and a 7-day size replacement guarantee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
