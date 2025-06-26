import { type Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact us',
  description: 'Modern ticketing is a modern ticketing solution',
  keywords: 'modern ticketing',
  alternates: { canonical: 'https://www.modern-ticketing.com/contact' },
  openGraph: {
    title: 'Contact us',
    description: 'Modern ticketing is a modern ticketing solution',
    url: 'https://www.modern-ticketing.com/contact',
    type: 'website',
    siteName: 'Modern Ticketing',
    images: 'https://www.modern-ticketing.com/logo192.png',
  },
};

export default function Page() {
  return <ContactPageClient />;
}
