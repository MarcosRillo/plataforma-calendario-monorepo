import { Metadata } from 'next';
import CalendarPageClient from './CalendarPageClient';

export const metadata: Metadata = {
  title: 'Calendario de Eventos - Tucumán Turismo',
  description: 'Descubre todos los eventos turísticos y culturales de Tucumán. Calendario público con eventos, festivales, exposiciones y actividades.',
  keywords: 'tucuman, turismo, eventos, calendario, festivales, cultura, actividades',
  openGraph: {
    title: 'Calendario de Eventos - Tucumán Turismo',
    description: 'Descubre todos los eventos turísticos y culturales de Tucumán',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calendario de Eventos - Tucumán Turismo',
    description: 'Descubre todos los eventos turísticos y culturales de Tucumán',
  },
  alternates: {
    canonical: '/calendar'
  }
};

export default function CalendarPage() {
  return <CalendarPageClient />;
}