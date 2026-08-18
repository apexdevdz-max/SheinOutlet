"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const PHONE_NUMBER = "213550000000"; // Replace with actual number
const WHATSAPP_URL = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent("Bonjour ! Je suis intéressé(e) par vos produits sur SHEIN Outlet.")}`;
const FACEBOOK_URL = "https://m.me/sheinoutletdz"; // Replace with actual Messenger link
const INSTAGRAM_URL = "https://instagram.com/sheinoutletdz"; // Replace with actual Instagram

export function ContactDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Listen for custom event to open drawer from header / mobile menu
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-contact-drawer", handler);
    return () => window.removeEventListener("open-contact-drawer", handler);
  }, []);

  // Hide on admin/login
  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return null;

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 rounded-full bg-black text-white shadow-2xl shadow-black/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="Nous contacter"
        id="contact-trigger"
      >
        {/* Headset / support icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      </button>

      {/* ── Drawer overlay ── */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          {/* ── Side panel (from right) ── */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl animate-slide-in-right flex flex-col">

            {/* ── Header ── */}
            <div className="px-8 pt-8 pb-6 flex-shrink-0">
              <div className="flex items-start justify-between mb-5">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Contactez-nous
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors -mt-1 -mr-2"
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Où que vous soyez, nos conseillers seront ravis de vous assister.
              </p>
            </div>

            {/* ── Contact channels ── */}
            <div className="flex-1 overflow-y-auto px-8">
              <div className="space-y-1">

                {/* Phone */}
                <a
                  href={`tel:+${PHONE_NUMBER}`}
                  className="flex items-center gap-4 py-5 border-b border-gray-100 hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center flex-shrink-0 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">
                      +213 550 000 000
                    </span>
                    <span className="text-xs text-gray-400">Appel direct</span>
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 py-5 border-b border-gray-100 hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center flex-shrink-0 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">WhatsApp</span>
                </a>

                {/* Facebook Messenger */}
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 py-5 border-b border-gray-100 hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center flex-shrink-0 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.89 1.434 5.473 3.678 7.164V22l3.375-1.852A11.298 11.298 0 0012 20.486c5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2zm1.065 12.439l-2.545-2.714-4.97 2.714 5.467-5.804 2.609 2.714 4.906-2.714-5.467 5.804z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Facebook Messenger</span>
                </a>

                {/* Instagram */}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 py-5 hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center flex-shrink-0 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Instagram</span>
                </a>
              </div>

              {/* ── Separator ── */}
              <div className="border-t border-gray-100 my-6" />

              {/* ── Secondary links ── */}
              <div className="space-y-1 pb-8">
                <a
                  href="/faq"
                  onClick={() => setOpen(false)}
                  className="block py-3 text-xs font-semibold tracking-[0.15em] text-gray-500 hover:text-gray-900 uppercase transition-colors"
                >
                  FAQ
                </a>
                <a
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="block py-3 text-xs font-semibold tracking-[0.15em] text-gray-500 hover:text-gray-900 uppercase transition-colors"
                >
                  Mon compte
                </a>
                <a
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="block py-3 text-xs font-semibold tracking-[0.15em] text-gray-500 hover:text-gray-900 uppercase transition-colors"
                >
                  Suivi de commande
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
