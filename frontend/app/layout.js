import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext"; // [NEW]
import MaintenanceGuard from "./components/MaintenanceGuard"; // [NEW]
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { WishlistProvider } from "./context/WishlistContext";
import SalesNotifications from "./components/SalesNotifications";

export const metadata = {
  title: "KeeStore — Premium Digital Assets",
  description: "The most secure, lightning-fast platform for premium digital keys and software assets.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <SettingsProvider>
          <MaintenanceGuard>
            <ThemeProvider>
              <AuthProvider>
                <LanguageProvider>
                  <CurrencyProvider>
                    <ToastProvider>
                      <WishlistProvider>
                        <CartProvider>
                          <Navbar />
                          <main className="flex-grow pt-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full">
                          {children}
                          </main>
                          <Footer />
                          <SalesNotifications />
                        </CartProvider>
                      </WishlistProvider>
                    </ToastProvider>
                  </CurrencyProvider>
                </LanguageProvider>
              </AuthProvider>
            </ThemeProvider>
          </MaintenanceGuard>
        </SettingsProvider>
      </body>
    </html>
  );
}
