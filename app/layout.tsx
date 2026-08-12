import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GoogleAnalytics from "./google-analytics";
import "./globals.css";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath =
  process.env.GITHUB_ACTIONS === "true" && repositoryName
    ? `/${repositoryName}`
    : "";
const siteUrl = "https://vibecoder75321.github.io/sleep-study-check";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sleep Study Check",
  description:
    "Check whether a sleep study conclusively rules out obstructive sleep breathing disorders based on current AASM clinical guidelines.",
  openGraph: {
    title: "Sleep Study Check",
    description:
      "Check whether a sleep study conclusively rules out obstructive sleep breathing disorders based on current AASM clinical guidelines.",
    type: "website",
    url: `${siteUrl}/`,
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1536,
        height: 1024,
        alt: "Sleep Study Check",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sleep Study Check",
    description:
      "Check whether a sleep study conclusively rules out obstructive sleep breathing disorders based on current AASM clinical guidelines.",
    images: [`${siteUrl}/og.png`],
  },
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <GoogleAnalytics
          measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
        />
      </body>
    </html>
  );
}
