import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});
const metadata = {
  title: "BookBridge AI \u2013 Smart Book Exchange & Delivery Platform",
  description: "Buy, sell, exchange and deliver used books with a smart fair-price system."
};
function RootLayout({
  children
}) {
  return <html
    lang="en"
    className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
  >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>;
}
export {
  RootLayout as default,
  metadata
};
