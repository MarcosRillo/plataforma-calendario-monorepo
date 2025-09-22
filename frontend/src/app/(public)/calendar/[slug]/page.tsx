import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Event } from '@/types/event.types';
import EventDetailPage from './EventDetailPage';

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  try {
    // Try to get the event by ID or slug
    const { slug } = await params;
    const eventId = parseInt(slug) || slug;
    const response = await apiClient.get<{data: Event}>(`/v1/public/events/${eventId}`);
    const event = response.data;

    const eventUrl = `/calendar/${slug}`;
    const eventDate = new Date(event.start_date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      title: `${event.title} - Eventos Tucumán`,
      description: event.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `${event.title} - ${eventDate}`,
      keywords: `tucuman, turismo, evento, ${event.title}, ${event.category?.name}`,
      openGraph: {
        title: event.title,
        description: event.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `${event.title} - ${eventDate}`,
        type: 'article',
        locale: 'es_AR',
        publishedTime: event.created_at,
        modifiedTime: event.updated_at,
        images: event.featured_image ? [
          {
            url: event.featured_image,
            width: 1200,
            height: 630,
            alt: event.title,
          }
        ] : [],
        section: event.category?.name || 'Eventos',
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description: event.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `${event.title} - ${eventDate}`,
        images: event.featured_image ? [event.featured_image] : [],
      },
      alternates: {
        canonical: eventUrl
      },
      other: {
        'event:start_time': event.start_date,
        'event:end_time': event.end_date || event.start_date,
        'event:location': event.location?.name || event.location_text || '',
      }
    };
  } catch {
    return {
      title: 'Evento no encontrado - Tucumán Turismo',
      description: 'El evento solicitado no fue encontrado o no está disponible.',
    };
  }
}

export default async function EventPage({ params }: EventPageProps) {
  try {
    // Try to get the event by ID or slug
    const { slug } = await params;
    const eventId = parseInt(slug) || slug;
    const response = await apiClient.get<{data: Event}>(`/v1/public/events/${eventId}`);
    const event = response.data;

    return <EventDetailPage event={event} />;
  } catch (error) {
    console.error('Error fetching event:', error);
    notFound();
  }
}