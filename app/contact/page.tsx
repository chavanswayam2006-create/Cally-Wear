"use client";

import React, { useState } from "react";
import { PhoneCall, MapPin, Mail, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState(""); // hidden bot-trap field
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: subject || "General Inquiry",
          message,
          honeypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send message. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
    } catch {
      setError("Network error occurred while submitting message.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="pb-8 border-b border-[#E4DFD5]">
          <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block mb-1">
            CUSTOMER DESK & STUDIO
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#12110E]">
            Get In Touch With Us
          </h1>
          <p className="text-xs sm:text-sm text-[#6B665F] max-w-xl mt-2 leading-relaxed">
            Have questions regarding sizing, custom drop orders, or doorstep size exchange? Reach out below.
          </p>
        </div>

        {/* Main Grid: Info (Left) + Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp VIP Card */}
            <div className="p-6 bg-[#12110E] text-white border border-[#282622] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#25D366] text-black flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base uppercase text-white">
                    Instant WhatsApp Concierge
                  </h3>
                  <p className="text-xs text-[#99948D]">Fastest response for order & sizing queries</p>
                </div>
              </div>
              <a
                href="https://wa.me/919876543210?text=Hi%20Cally%20Wear,%20I'd%20like%20assistance%20with%20my%20footwear%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-[#25D366] text-black font-black text-xs uppercase tracking-wider text-center hover:opacity-90 transition-opacity"
              >
                Chat on WhatsApp (+91 98765 43210)
              </a>
            </div>

            {/* Store Coordinates */}
            <div className="p-6 bg-white border border-[#E4DFD5] space-y-4">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#12110E] pb-3 border-b border-[#E4DFD5]">
                Physical Retail & Experience Center
              </h3>

              <div className="space-y-3 text-xs text-[#4A4742]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#E85D2C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#12110E] block uppercase font-bold">Mumbai Flagship</strong>
                    <span>Shop No. 9, Sadguru Darshan, Liberty Garden, Road No. 3, Malad West, Mumbai — 400064</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#E85D2C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#12110E] block uppercase font-bold">Store Hours</strong>
                    <span>Monday – Sunday: 11:00 AM – 9:30 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#E85D2C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#12110E] block uppercase font-bold">Official Email</strong>
                    <a href="mailto:support@callywear.com" className="hover:text-black underline">
                      support@callywear.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <InstagramIcon className="w-4 h-4 text-[#E85D2C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#12110E] block uppercase font-bold">Instagram DM</strong>
                    <a href="https://www.instagram.com/cally_wear" target="_blank" rel="noopener noreferrer" className="hover:text-black underline">
                      @cally_wear
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Side */}
          <div className="lg:col-span-7 bg-white border border-[#E4DFD5] p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-display font-black text-xl uppercase tracking-tight text-[#12110E]">
                Send Us a Message
              </h2>
              <p className="text-xs text-[#6B665F] mt-1">
                Our support team typically replies within 2–4 business hours.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {submitted ? (
              <div className="p-8 bg-[#FAF8F5] border border-[#E85D2C] text-center space-y-3 animate-in fade-in duration-300">
                <CheckCircle2 className="w-10 h-10 text-[#E85D2C] mx-auto" />
                <h3 className="font-display font-black text-lg uppercase text-[#12110E]">
                  Message Received
                </h3>
                <p className="text-xs text-[#6B665F] max-w-sm mx-auto">
                  Thank you for reaching out, {name}. A member of our concierge desk will connect via email or WhatsApp shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field for bot trapping (invisible to real users) */}
                <input
                  type="text"
                  name="cally_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Alex Kapoor"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                    Subject / Order Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sizing Advice for Apex Tech Runner / Order #CW-84920"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="How can we assist your rotation today?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? "Sending..." : "Send Message"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
