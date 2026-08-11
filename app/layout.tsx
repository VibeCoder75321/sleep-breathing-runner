import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GoogleAnalytics from "./google-analytics";
import "./globals.css";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath =
  process.env.GITHUB_ACTIONS === "true" && repositoryName
    ? `/${repositoryName}`
    : "";

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
    "Check whether a sleep study conclusively rules out sleep breathing disorders.",
  openGraph: {
    title: "Sleep Study Check",
    description:
      "Check whether a sleep study conclusively rules out sleep breathing disorders.",
    type: "website",
    url: "https://sleep-breathing-runner.workspace-066083.chatgpt.site/",
    images: [
      {
        url: "https://sleep-breathing-runner.workspace-066083.chatgpt.site/og.png",
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
      "Check whether a sleep study conclusively rules out sleep breathing disorders.",
    images: ["https://sleep-breathing-runner.workspace-066083.chatgpt.site/og.png"],
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
