"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white text-black font-black text-lg md:text-2xl w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center shadow-lg">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[9px] md:text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

interface CampaignData {
  title: string;
  subtitle: string;
  end_date: string;
}

export function FlashSaleCountdown() {
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  // Fetch active campaign
  useEffect(() => {
    fetch("/api/flash-sale")
      .then((r) => r.json())
      .then((data) => {
        if (data.campaign) {
          setCampaign(data.campaign);
        }
      })
      .catch(() => {});
  }, []);

  // Countdown timer
  useEffect(() => {
    setMounted(true);
    if (!campaign) return;

    function calc() {
      const diff = new Date(campaign!.end_date).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }

    setTime(calc());
    const interval = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(interval);
  }, [campaign]);

  // Don't render if no campaign or not mounted
  if (!mounted || !campaign) {
    return null;
  }

  // Don't render if expired
  const isExpired = new Date(campaign.end_date).getTime() <= Date.now();
  if (isExpired) return null;

  return (
    <div className="flash-sale-bar rounded-2xl p-5 md:p-6 mx-4 md:mx-0" id="flash-sale-banner">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl"></span>
          <h2 className="text-white text-xl md:text-2xl font-black tracking-tight">
            {campaign.title}
          </h2>
          <span className="text-primary text-sm font-medium ml-1">
            {campaign.subtitle}
          </span>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-1">
          <span className="text-white/60 text-xs mr-2 hidden md:block">FIN DANS</span>
          <TimeBlock value={time.days} label="Jours" />
          <span className="text-white text-2xl font-light mx-0.5 mt-[-14px]">:</span>
          <TimeBlock value={time.hours} label="Heures" />
          <span className="text-white text-2xl font-light mx-0.5 mt-[-14px]">:</span>
          <TimeBlock value={time.minutes} label="Min" />
          <span className="text-white text-2xl font-light mx-0.5 mt-[-14px]">:</span>
          <TimeBlock value={time.seconds} label="Sec" />
        </div>

        {/* CTA */}
        <Link
          href="/promotions"
          className="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap"
          id="flash-sale-cta"
        >
          VOIR TOUTES LES OFFRES &rsaquo;
        </Link>
      </div>
    </div>
  );
}
