"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary";
import Link from "next/link";

const BANNERS = [
  { id: 1, image: "/images/hero/banner1.png", alt: "Nouvelle Collection — Jusqu'à -70%", href: "/categories" },
  { id: 2, image: "/images/hero/banner2.png", alt: "Édition Limitée — Jusqu'à -50%", href: "/?filter=promo" },
  { id: 3, image: "/images/hero/banner3.png", alt: "Streetwear Homme — Jusqu'à -60%", href: "/?cat=homme" },
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  return (
    <section className="relative w-full" id="hero-carousel">
      {/* Full-width on both mobile and desktop — carousel goes behind the transparent header */}
      <div>
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {BANNERS.map((b) => (
              <Link
                key={b.id}
                href={b.href}
                className="flex-[0_0_100%] min-w-0 relative aspect-[1.8/1] md:aspect-[2.8/1] block"
              >
                <Image
                  src={b.image}
                  alt={b.alt}
                  fill
                  priority={b.id === 1}
                  loader={cloudinaryLoader}
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1280px"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Arrows — hidden on mobile for clean look, visible on desktop */}
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

      {/* Dots — bottom center on mobile, bottom right on desktop */}
      <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 flex items-center gap-1.5 z-10">
        {BANNERS.map((b, i) => (
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
    </section>
  );
}
