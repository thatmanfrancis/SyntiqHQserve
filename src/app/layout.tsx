import type { Metadata } from "next";
import { Syne, Manrope } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  weight: ["400", "600", "800"],
  subsets: ["latin"],
});

const title = "SyntiqHQ — Website Design, Development & Online Booking for Growing Businesses";
const description =
  "SyntiqHQ is a web design and development studio building fast, search-friendly websites, web apps and online booking systems for businesses in every industry, from healthcare to fintech. Websites live in around 4 weeks.";

export const metadata: Metadata = {
  title: {
    template: "%s | SyntiqHQ",
    default: title,
  },
  description,
  metadataBase: new URL(process.env.PUBLIC_SITE_URL || "https://syntiqhq.com"),
  openGraph: {
    type: "website",
    siteName: "SyntiqHQ",
    url: "/",
    title,
    description,
  },
  icons: {
    icon: [
      { url: "/syntiqhqfavicon-black.png", media: "(prefers-color-scheme: light)" },
      { url: "/syntiqhqfavicon.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${syne.variable} h-full antialiased`}
      suppressHydrationWarning
      
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
