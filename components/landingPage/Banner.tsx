"use client";

import Image from "next/image";
import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import Link from "next/link";
import {
  useGetHeroDataQuery,
  useGetPublicSettingsQuery,
} from "@/redux/features/home/homeApi";
import { HeroData } from "@/types/home";
import { useAppSelector } from "@/redux/hooks";

const Banner = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading, isError } = useGetHeroDataQuery();
  const { data: settings } = useGetPublicSettingsQuery();

  const activeHero = useMemo(() => {
    return data?.data?.find((hero: HeroData) => hero.is_active);
  }, [data]);

  const titleRef = useRef(null);
  const textRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!activeHero) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(titleRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
      })
        .from(
          textRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.4",
        )
        .from(
          btnRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.3",
        );
    });

    return () => ctx.revert();
  }, [activeHero]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#050B14]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60 font-medium animate-pulse">
            Initializing Experience...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !activeHero) {
    return null; // Fallback or static version could be placed here
  }

  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: activeHero.background_color }}
    >
      {/* Background Image / Hero Image */}
      <div className="absolute inset-0">
        <Image
          src={activeHero.hero_image || "/images/banner.png"}
          alt={activeHero.title}
          fill
          className="object-cover opacity-60"
          priority
          unoptimized={
            typeof activeHero.hero_image === "string" &&
            activeHero.hero_image.startsWith("http")
          }
        />
        {/* Dynamic Overlay Gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/40 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center max-w-5xl">
        <div className="flex flex-col items-center mb-8">
          {settings?.platformLogo ? (
            <div className="relative h-[120px] md:h-[180px] w-[180px] mb-4">
              <Image
                src={settings.platformLogo}
                alt={settings.platformName || "Logo"}
                fill
                className="drop-shadow-2xl object-contain"
                priority
                unoptimized
              />
            </div>
          ) : (
            <Image
              src="/images/banner-log.png"
              alt="NextGen Pros Logo"
              width={180}
              height={180}
              style={{ width: "auto", height: "auto" }}
              className="drop-shadow-2xl mb-4"
              priority
            />
          )}
          {(() => {
            const name = settings?.platformName || "NextGen Pros";
            const firstSpaceIndex = name.indexOf(" ");
            if (firstSpaceIndex !== -1) {
              return (
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-white font-bold text-3xl md:text-4xl tracking-tight">
                    {name.substring(0, firstSpaceIndex)}
                  </span>
                  <span
                    className="font-black text-2xl md:text-3xl tracking-widest uppercase"
                    style={{ color: "var(--primary-cyan, #00E5FF)" }}
                  >
                    {name.substring(firstSpaceIndex + 1)}
                  </span>
                </div>
              );
            }
            return (
              <span className="text-white font-bold text-4xl mt-2 italic shadow-2xl">
                {name}
              </span>
            );
          })()}
        </div>

        {/* Dynamic Subtitle */}
        <span
          className="inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-6 border border-white/20 backdrop-blur-sm shadow-xl"
          style={{
            color: activeHero.subtitle_color,
            backgroundColor: `${activeHero.subtitle_color}10`,
          }}
        >
          {activeHero.subtitle}
        </span>

        {/* Dynamic Title */}
        <h1
          ref={titleRef}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight mb-6 uppercase leading-[0.9] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          style={{ color: activeHero.title_color }}
        >
          {activeHero.title}
        </h1>

        {/* Dynamic Description */}
        <p
          ref={textRef}
          className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-12 px-4 drop-shadow-md leading-relaxed"
        >
          {activeHero.description}
        </p>

        {/* Dynamic Buttons */}
        <div
          ref={btnRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg mx-auto"
        >
          {
            !user && activeHero.primary_button_url && activeHero.primary_button_text && (
              <Link
                href={activeHero.primary_button_url}
                className="group relative w-full sm:w-auto overflow-hidden px-10 py-4 bg-white text-black font-black rounded-xl text-base uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.15)]"
              >
                <span className="relative z-10">
                  {activeHero.primary_button_text}
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
            )
          }

          {/* {!user && activeHero.secondary_button_url && activeHero.secondary_button_text && (
            <Link
              href={activeHero.secondary_button_url}
              className="w-full sm:w-auto px-10 py-4 bg-transparent text-white font-black rounded-xl text-base border-2 border-white/30 backdrop-blur-md uppercase tracking-wider transition-all hover:bg-white hover:text-black hover:border-white shadow-xl hover:scale-105 active:scale-95 text-center"
            >
              {activeHero.secondary_button_text}
            </Link>
          )} */}
        </div>
      </div>

      {/* Modern gradient at bottom to blend with next section */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-linear-to-t from-[#050B14] to-transparent pointer-events-none" />

      {/* Decorative Light Leak */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 blur-[150px] rounded-full pointer-events-none" />
    </section>
  );
};

export default Banner;
