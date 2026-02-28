import "./globals.css";
import RegisterSW from "@/components/pwa/register-sw";

export const metadata = {
  title: "Wishlist Streaming Compartida",
  description: "App privada para wishlist de películas, series, libros y cómics",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
