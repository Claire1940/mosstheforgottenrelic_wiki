"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Gauge,
  GraduationCap,
  Lightbulb,
  MonitorSmartphone,
  Puzzle,
  Route,
  Scroll,
  Skull,
  Sparkles,
  Sword,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
// import { SidebarAd } from "@/components/ads/SidebarAd";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  locale: string;
}

// 8 个首页模块的标题图标（与 Tools Grid 导航卡一一对应）
const MODULE_ICONS = {
  releaseDatePricePlatforms: MonitorSmartphone,
  beginnerGuide: GraduationCap,
  walkthroughChapterOrder: Route,
  puzzleSolutions: Puzzle,
  scrollsDustSecrets: Scroll,
  weaponsAbilities: Sword,
  bossesCombatGuide: Skull,
  gameLengthPerformanceAccessibility: Gauge,
} as const;

// 通用模块标题块：图标徽章 + 标题 + intro
function ModuleHeader({
  icon: Icon,
  title,
  intro,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  intro: string;
}) {
  return (
    <div className="text-center mb-8 md:mb-12 scroll-reveal">
      <div className="mb-3 md:mb-4 flex justify-center">
        <div
          className="h-11 w-11 md:h-14 md:w-14 rounded-2xl
                     bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                     flex items-center justify-center"
        >
          <Icon className="h-5 w-5 md:h-7 md:w-7 text-[hsl(var(--nav-theme-light))]" />
        </div>
      </div>
      <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 leading-tight">
        {title}
      </h2>
      <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
        {intro}
      </p>
    </div>
  );
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.mosstheforgottenrelic.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Moss: The Forgotten Relic Wiki",
        description:
          "Complete Moss: The Forgotten Relic Wiki covering walkthroughs, puzzle solutions, collectibles, combat, bosses, achievements, controls, and performance tips across Steam, PS5, Xbox, and Nintendo Switch.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Moss: The Forgotten Relic - Storybook Puzzle Adventure",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Moss: The Forgotten Relic Wiki",
        alternateName: "Moss: The Forgotten Relic",
        url: siteUrl,
        description:
          "Complete Moss: The Forgotten Relic Wiki resource hub for walkthroughs, puzzle solutions, collectibles, combat, achievements, and performance guides",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Moss: The Forgotten Relic Wiki - Storybook Puzzle Adventure",
        },
        sameAs: [
          "https://store.steampowered.com/app/3914860/Moss_The_Forgotten_Relic/",
          "https://discord.gg/polyarcgames",
          "https://www.reddit.com/r/MossGame/",
          "https://www.youtube.com/@PolyarcGames",
          "https://x.com/PolyarcGames",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Moss: The Forgotten Relic",
        gamePlatform: [
          "PC",
          "Steam",
          "PlayStation 5",
          "Xbox One",
          "Xbox Series X|S",
          "Nintendo Switch",
          "Nintendo Switch 2",
        ],
        applicationCategory: "Game",
        genre: ["Adventure", "Puzzle", "Platformer", "Storybook"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 1,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://store.steampowered.com/app/3914860/Moss_The_Forgotten_Relic/",
        },
      },
      {
        "@type": "VideoObject",
        name: "Moss: The Forgotten Relic | Gameplay Trailer",
        description:
          "Official Moss: The Forgotten Relic gameplay trailer from Polyarc Games, showcasing the storybook puzzle adventure across Steam, PS5, Xbox, and Nintendo Switch.",
        uploadDate: "2026-07-16",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/hs2z7dvTFtg",
        url: "https://www.youtube.com/watch?v=hs2z7dvTFtg",
      },
    ],
  };

  // Accordion states
  const [walkthroughOpen, setWalkthroughOpen] = useState<number | null>(0);
  const [bossesOpen, setBossesOpen] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <a
                href="https://store.steampowered.com/app/4607010/Moss_The_Forgotten_Relic_DEMO/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </a>
              <a
                href="https://store.steampowered.com/app/3914860/Moss_The_Forgotten_Relic/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnSteamCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="hs2z7dvTFtg"
              title="Moss: The Forgotten Relic | Gameplay Trailer"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {t.tools.cards.map((card: any, index: number) => {
              // 映射卡片索引到 section ID（与 8 个模块一一对应）
              const sectionIds = [
                "release-date-price-platforms",
                "beginner-guide",
                "walkthrough-chapter-order",
                "puzzle-solutions",
                "scrolls-dust-secrets",
                "weapons-abilities",
                "bosses-combat-guide",
                "game-length-performance-accessibility",
              ];
              const sectionId = sectionIds[index];

              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Release Date, Price and Platforms (table) */}
      <section
        id="release-date-price-platforms"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={MODULE_ICONS.releaseDatePricePlatforms}
            title={t.modules.releaseDatePricePlatforms.title}
            intro={t.modules.releaseDatePricePlatforms.intro}
          />

          {/* 桌面表格 */}
          <div className="hidden md:block overflow-x-auto scroll-reveal rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[hsl(var(--nav-theme)/0.1)] border-b border-[hsl(var(--nav-theme)/0.3)] text-left">
                  <th className="p-4 font-semibold">Platform</th>
                  <th className="p-4 font-semibold">Release Date</th>
                  <th className="p-4 font-semibold">Launch Price</th>
                  <th className="p-4 font-semibold">Availability</th>
                  <th className="p-4 font-semibold">Key Details</th>
                </tr>
              </thead>
              <tbody>
                {t.modules.releaseDatePricePlatforms.platforms.map(
                  (p: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-border last:border-b-0 align-top"
                    >
                      <td className="p-4 font-semibold text-[hsl(var(--nav-theme-light))]">
                        {p.name}
                      </td>
                      <td className="p-4 text-muted-foreground">{p.release}</td>
                      <td className="p-4 text-muted-foreground">{p.price}</td>
                      <td className="p-4 text-muted-foreground">
                        {p.availability}
                      </td>
                      <td className="p-4 text-muted-foreground">{p.details}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {/* 移动端堆叠卡片 */}
          <div className="md:hidden space-y-3 scroll-reveal">
            {t.modules.releaseDatePricePlatforms.platforms.map(
              (p: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 border border-border rounded-xl"
                >
                  <h3 className="font-bold text-[hsl(var(--nav-theme-light))] mb-2">
                    {p.name}
                  </h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Release</dt>
                      <dd className="text-right">{p.release}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Price</dt>
                      <dd className="text-right">{p.price}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Availability</dt>
                      <dd className="text-right">{p.availability}</dd>
                    </div>
                  </dl>
                  <p className="text-xs text-muted-foreground mt-2">
                    {p.details}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Beginner Guide (step-by-step) */}
      <section
        id="beginner-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={MODULE_ICONS.beginnerGuide}
            title={t.modules.beginnerGuide.title}
            intro={t.modules.beginnerGuide.intro}
          />

          <div className="scroll-reveal space-y-3 md:space-y-4">
            {t.modules.beginnerGuide.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                  <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-2">
                    {step.description}
                  </p>
                  <div className="flex items-start gap-2 text-xs md:text-sm bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)] rounded-lg p-2.5">
                    <Lightbulb className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{step.tip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 3: Walkthrough and Chapter Order (accordion) */}
      <section
        id="walkthrough-chapter-order"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={MODULE_ICONS.walkthroughChapterOrder}
            title={t.modules.walkthroughChapterOrder.title}
            intro={t.modules.walkthroughChapterOrder.intro}
          />

          <div className="scroll-reveal space-y-3">
            {t.modules.walkthroughChapterOrder.sections.map(
              (section: any, index: number) => {
                const isOpen = walkthroughOpen === index;
                return (
                  <div
                    key={index}
                    className="border border-border rounded-xl overflow-hidden bg-white/5"
                  >
                    <button
                      onClick={() =>
                        setWalkthroughOpen(isOpen ? null : index)
                      }
                      className="w-full flex items-center justify-between gap-3 p-4 md:p-5 text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="font-bold text-base md:text-lg">
                        {section.title}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 flex-shrink-0 text-[hsl(var(--nav-theme-light))] transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 md:px-5 pb-5 space-y-3">
                        {section.chapters.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {section.chapters.map((ch: string, ci: number) => (
                              <span
                                key={ci}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-xs"
                              >
                                <Route className="w-3 h-3 text-[hsl(var(--nav-theme-light))]" />
                                {ch}
                              </span>
                            ))}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--nav-theme-light))] mb-1">
                            Main Objective
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {section.objective}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--nav-theme-light))] mb-1">
                            Key Mechanics
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {section.mechanics}
                          </p>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-white/[0.03] border border-border rounded-lg p-2.5">
                          <Lightbulb className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                          <span>{section.spoilerNote}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 4: Puzzle Solutions (step cards) */}
      <section
        id="puzzle-solutions"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={MODULE_ICONS.puzzleSolutions}
            title={t.modules.puzzleSolutions.title}
            intro={t.modules.puzzleSolutions.intro}
          />

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.puzzleSolutions.puzzles.map((p: any, index: number) => (
              <div
                key={index}
                className="p-5 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Puzzle className="w-5 h-5 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                  <h3 className="font-bold text-base md:text-lg">{p.puzzle}</h3>
                </div>
                <span className="inline-block text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] mb-3">
                  {p.mechanic}
                </span>
                <ol className="space-y-1.5 mb-3">
                  {p.steps.map((s: string, si: number) => (
                    <li
                      key={si}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--nav-theme)/0.15)] text-[hsl(var(--nav-theme-light))] text-xs font-bold flex items-center justify-center">
                        {si + 1}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)] rounded-lg p-2.5">
                  <Lightbulb className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                  <span>{p.tip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 5: Scrolls, Dust and Secrets (checklist) */}
      <section
        id="scrolls-dust-secrets"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={MODULE_ICONS.scrollsDustSecrets}
            title={t.modules.scrollsDustSecrets.title}
            intro={t.modules.scrollsDustSecrets.intro}
          />

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.scrollsDustSecrets.groups.map((g: any, index: number) => (
              <div
                key={index}
                className="p-5 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.15)] border border-[hsl(var(--nav-theme)/0.3)] text-[hsl(var(--nav-theme-light))] font-semibold">
                    {g.label}
                  </span>
                  <h3 className="font-bold text-base md:text-lg">{g.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{g.target}</p>
                {g.locations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {g.locations.map((loc: string, li: number) => (
                      <span
                        key={li}
                        className="inline-block text-xs px-2 py-0.5 rounded-md bg-white/5 border border-border"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                )}
                <ul className="space-y-2">
                  {g.checklist.map((item: string, ci: number) => (
                    <li key={ci} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 6: Weapons and Abilities (card list) */}
      <section
        id="weapons-abilities"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={MODULE_ICONS.weaponsAbilities}
            title={t.modules.weaponsAbilities.title}
            intro={t.modules.weaponsAbilities.intro}
          />

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.weaponsAbilities.items.map((item: any, index: number) => (
              <div
                key={index}
                className="p-5 bg-white/5 border border-border rounded-xl flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] flex items-center justify-center flex-shrink-0">
                    <DynamicIcon
                      name={item.icon}
                      className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold leading-tight">{item.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {item.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {item.availability}
                </p>
                <div className="space-y-2.5 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Combat:{" "}
                    </span>
                    {item.combatUse}
                  </p>
                  <div className="bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)] rounded-lg p-2.5">
                    <p className="font-semibold text-[hsl(var(--nav-theme-light))] text-xs mb-1">
                      {item.ability}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      {item.abilityUnlock}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.abilityUse}
                    </p>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    <span className="font-semibold text-foreground">
                      Exploration:{" "}
                    </span>
                    {item.explorationUse}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 320×50 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 7: Bosses and Combat Guide (accordion) */}
      <section
        id="bosses-combat-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={MODULE_ICONS.bossesCombatGuide}
            title={t.modules.bossesCombatGuide.title}
            intro={t.modules.bossesCombatGuide.intro}
          />

          <div className="scroll-reveal space-y-3">
            {t.modules.bossesCombatGuide.bosses.map((boss: any, index: number) => {
              const isOpen = bossesOpen === index;
              return (
                <div
                  key={index}
                  className="border border-border rounded-xl overflow-hidden bg-white/5"
                >
                  <button
                    onClick={() => setBossesOpen(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-3 p-4 md:p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-bold text-base md:text-lg">
                      <Skull className="w-5 h-5 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                      {boss.title}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 text-[hsl(var(--nav-theme-light))] transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 md:px-5 pb-5 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {boss.encounter}
                      </p>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--nav-theme-light))] mb-1.5">
                          Attack Patterns
                        </p>
                        <ul className="space-y-1">
                          {boss.attackPatterns.map((a: string, ai: number) => (
                            <li
                              key={ai}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-[hsl(var(--nav-theme-light))] mt-1">
                                •
                              </span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--nav-theme-light))] mb-1.5">
                          Strategy
                        </p>
                        <ul className="space-y-1">
                          {boss.strategy.map((s: string, si: number) => (
                            <li
                              key={si}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--nav-theme-light))] mb-1">
                          Reader Role
                        </p>
                        <p className="text-muted-foreground">{boss.readerRole}</p>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-white/[0.03] border border-border rounded-lg p-2.5">
                        <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        <span>{boss.skipCombat}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Module 8: Game Length, Performance and Accessibility (table) */}
      <section
        id="game-length-performance-accessibility"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={MODULE_ICONS.gameLengthPerformanceAccessibility}
            title={t.modules.gameLengthPerformanceAccessibility.title}
            intro={t.modules.gameLengthPerformanceAccessibility.intro}
          />

          {/* 桌面表格 */}
          <div className="hidden md:block overflow-x-auto scroll-reveal rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[hsl(var(--nav-theme)/0.1)] border-b border-[hsl(var(--nav-theme)/0.3)] text-left">
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Scope</th>
                  <th className="p-4 font-semibold">Details</th>
                  <th className="p-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {t.modules.gameLengthPerformanceAccessibility.rows.map(
                  (r: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-border last:border-b-0 align-top"
                    >
                      <td className="p-4 font-semibold text-[hsl(var(--nav-theme-light))]">
                        {r.category}
                      </td>
                      <td className="p-4 text-muted-foreground">{r.scope}</td>
                      <td className="p-4 font-medium">{r.data}</td>
                      <td className="p-4 text-muted-foreground">{r.notes}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {/* 移动端堆叠卡片 */}
          <div className="md:hidden space-y-3 scroll-reveal">
            {t.modules.gameLengthPerformanceAccessibility.rows.map(
              (r: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 border border-border rounded-xl"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.15)] border border-[hsl(var(--nav-theme)/0.3)] text-[hsl(var(--nav-theme-light))] font-semibold">
                      {r.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {r.scope}
                    </span>
                  </div>
                  <p className="font-bold text-[hsl(var(--nav-theme-light))] mb-1">
                    {r.data}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.notes}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.gg/polyarcgames"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/PolyarcGames"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://steamcommunity.com/app/3914860"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://store.steampowered.com/app/3914860/Moss_The_Forgotten_Relic/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
