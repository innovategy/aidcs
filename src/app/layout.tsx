// /src/app/layout.tsx
// Root layout component with providers and global styles
// src/app/layout.tsx

import { Inter } from 'next/font/google';
import { ConfigProvider } from '@/context/ConfigContext';
import { DataProvider } from '@/context/DataContext';
import Header from '@/components/layout/Header';
import './globals.css';  // Add this line if it's missing

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'AI-Powered Data Cleansing System',
    description: 'Enterprise employee data validation and cleansing system',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <ConfigProvider>
            <DataProvider>
                <div className="min-h-screen bg-background">
                    <Header />
                    <main className="container mx-auto px-4 py-6">
                        {children}
                    </main>
                </div>
            </DataProvider>
        </ConfigProvider>
        </body>
        </html>
    );
}
