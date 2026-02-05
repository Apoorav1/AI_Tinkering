import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata = {
  title: "Niobium Supply Chain Explorer",
  description: "Interactive map for niobium supply chains"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
