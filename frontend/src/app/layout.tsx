import type { Metadata, Viewport } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const fontSans = Outfit({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: {
    default: 'Carte de Vivabilité — Trouvez votre lieu de vie idéal en France',
    template: '%s | Carte de Vivabilité',
  },
  description:
    'Découvrez les communes françaises qui correspondent à vos critères de vie : proximité mer et montagne, qualité de l\'air, transports, emploi, et plus encore.',
  keywords: [
    'vivabilité',
    'France',
    'communes',
    'qualité de vie',
    'carte interactive',
    'où vivre',
    'déménagement',
    'mer',
    'montagne',
    'pollution',
  ],
  authors: [{ name: 'Carte de Vivabilité' }],
  creator: 'Carte de Vivabilité',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://carte-vivabilite.fr',
    title: 'Carte de Vivabilité — Trouvez votre lieu de vie idéal en France',
    description:
      'Découvrez les communes françaises qui correspondent à vos critères de vie.',
    siteName: 'Carte de Vivabilité',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carte de Vivabilité',
    description:
      'Découvrez les communes françaises qui correspondent à vos critères de vie.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0f1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
