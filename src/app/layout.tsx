import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/footer";
import SiteHeader from "./components/SiteHeader";
import JsonLd from "./components/JsonLd";
import GoogleTagManager from "./components/GoogleTagManager";
import Analytics from "./components/analytics";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ScrollManager from "./components/ScrollManager";
import { Providers } from "./providers";
import { SITE } from "@/lib/site";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  authors: [{ name: SITE.fullName, url: SITE.website }],
  creator: SITE.fullName,
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: SITE.twitterCard,
    title: SITE.title,
    description: SITE.description,
  },
  alternates: {
    canonical: SITE.url,
    types: {
      "application/rss+xml": `${SITE.url}/feed.xml`,
    },
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

// Applies the saved theme before first paint so dark-mode readers never see a white flash.
// Default stays light (an explicit choice from the earlier design); "dark" only when saved.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`;

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE.url}/#person`,
      name: SITE.fullName,
      alternateName: SITE.name,
      url: SITE.website,
      image: `${SITE.url}/icon.png`,
      sameAs: [SITE.website],
      jobTitle: "Automation engineer and product builder",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      publisher: { "@id": `${SITE.url}/#person` },
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/?search={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const GTM_ID = "GTM-KJKN7R99";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={siteJsonLd} />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <GoogleTagManager gtmId={GTM_ID} />
          <Analytics />
          <ScrollManager />
          <SiteHeader />
          {children}
          <SpeedInsights />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
