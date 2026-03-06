import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PlayerProvider } from "@/lib/PlayerContext";
import PlayerBar from "@/components/player/PlayerBar";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Allegro",
  description: "Your cinematic music experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${playfair.variable} ${dmSans.variable} antialiased`}>
        <TooltipProvider>
          <PlayerProvider>
            <div className="flex flex-col h-screen">
              <div className="flex-1 overflow-hidden">{children}</div>
              <PlayerBar />
            </div>
          </PlayerProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
