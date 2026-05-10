import "./globals.css";

export const metadata = {
  title: "MarketMind",
  description: "Analiza cualquier negocio o sector con IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
