import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import {Toaster} from 'react-hot-toast'
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import QueryProvider from "@/lib/query-client";
import { StoreProvider } from "@/store/store";
import NextTopLoader from 'nextjs-toploader';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Deploy pro",
  description: "Easiest solution to deploy react applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
    <html lang="en">
      <QueryProvider>
         <StoreProvider>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}

      >   <NextTopLoader color="black"  showSpinner={false}/>
       
        <Navbar/>
        {children}
        <Toaster/>
        <Footer/>
      </body>
      </StoreProvider>
      </QueryProvider>
    </html>
    </SessionProvider>
  );
}
