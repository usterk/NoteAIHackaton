import type { Metadata } from "next";
import "./globals.css";
import { EncryptionProvider } from "./context/EncryptionContext";
import { SoundEffects } from "./components/SoundEffects";

export const metadata: Metadata = {
  title: "Secure Notes App - E2E Encrypted",
  description: "Aplikacja do bezpiecznych, end-to-end szyfrowanych notatek",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">
        <SoundEffects />
        <EncryptionProvider>
          {children}
        </EncryptionProvider>
      </body>
    </html>
  );
}
