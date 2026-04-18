import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext"; // [NEW]
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { WishlistProvider } from "./context/WishlistContext";
import { MonitorOff, Construction } from "lucide-react"; // [NEW]
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
          <MaintenanceContent>
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
          </MaintenanceContent>
        </SettingsProvider>
      </body>
    </html>
  );
}

function MaintenanceContent({ children }) {
    const { settings, loading } = useSettings();
    const { user } = useAuth();
    
    // Allow admins to bypass maintenance mode
    if (!loading && settings?.maintenanceMode && user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 animate-pulse text-primary border border-primary/20">
                    <Construction size={48} />
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Under Maintenance</h1>
                <p className="text-slate-400 max-w-md text-lg font-medium">
                    We're currently fine-tuning the ecosystem to bring you an even better experience. We'll be back online shortly.
                </p>
                <div className="mt-12 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    <MonitorOff size={14} /> System Safeguard Active
                </div>
            </div>
        );
    }
    
    return children;
}
