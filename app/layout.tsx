import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Art Director",
  description: "Developed by Zeemal Farooq",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="antialiased"
    >
      <body>{children}</body>
    </html>
  );
}
