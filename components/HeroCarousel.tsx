"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import type { Banner } from "@/lib/types";

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Fetch active banners from API
  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBanners(data);
      })
      .catch(() => {});
  }, []);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  // Don't render if no banners
  if (banners.length === 0) return null;

  return (
    <section className="relative w-full" id="hero-carousel">
      <div>
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {banners.map((b, i) => (
              <Link
                key={b.id}
                href={b.href || "/"}
                className="flex-[0_0_100%] min-w-0 relative aspect-[1.8/1] md:aspect-[2.8/1] block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image_url}
                  alt={b.title}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
                {/* Text overlay */}
                {b.show_text && (b.title || b.subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-4 md:p-8 lg:p-12">
                    {b.title && (
                      <h2 className="text-white text-lg md:text-3xl lg:text-4xl font-black drop-shadow-lg leading-tight max-w-2xl">
                        {b.title}
                      </h2>
                    )}
                    {b.subtitle && (
                      <p className="text-white/85 text-xs md:text-base lg:text-lg mt-1 md:mt-2 drop-shadow max-w-xl">
                        {b.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Arrows — hidden on mobile for clean look, visible on desktop */}
      {banners.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm shadow items-center justify-center hover:bg-white transition-all z-10 group"
            aria-label="Précédent"
          >
            <svg className="w-4 h-4 text-text group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollNext}
            className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm shadow items-center justify-center hover:bg-white transition-all z-10 group"
            aria-label="Suivant"
          >
            <svg className="w-4 h-4 text-text group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 flex items-center gap-1.5 z-10">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => scrollTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? "w-5 h-2 md:w-3 md:h-3 bg-white md:bg-primary"
                  : "w-2 h-2 md:w-2.5 md:h-2.5 bg-white/50 md:bg-white/60 hover:bg-primary/50"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
