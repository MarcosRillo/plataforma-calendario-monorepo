'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  ExternalLink,
  Share2
} from 'lucide-react';
import moment from 'moment';
import { Event } from '@/types/event.types';
import { eventPublicExportService } from '@/features/events/services/eventPublicService';
import ShareButtons from './ShareButtons';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export default function EventDetailModal({
  isOpen,
  onClose,
  event
}: EventDetailModalProps) {
  if (!event) return null;

  const formatDate = (dateString: string) => {
    return moment(dateString).format('dddd, DD [de] MMMM [de] YYYY');
  };

  const formatTime = (dateString: string) => {
    return moment(dateString).format('HH:mm');
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = moment(startDate);
    const end = endDate ? moment(endDate) : start;
    
    if (start.isSame(end, 'day')) {
      return `${formatDate(startDate)} de ${formatTime(startDate)} a ${formatTime(endDate || startDate)}`;
    } else {
      return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate || startDate)} ${formatTime(endDate || startDate)}`;
    }
  };

  const getLocation = () => {
    if (event.locations && event.locations.length > 0) {
      return event.locations.map(loc => loc.name).join(', ');
    }
    if (event.location) {
      return event.location.name;
    }
    if (event.location_text) {
      return event.location_text;
    }
    if (event.virtual_link) {
      return 'Evento Virtual';
    }
    return 'Ubicación no especificada';
  };

  const getLocationAddress = () => {
    if (event.locations && event.locations.length > 0) {
      return event.locations[0].address;
    }
    if (event.location) {
      return event.location.address;
    }
    return null;
  };

  const handleAddToGoogleCalendar = () => {
    const url = eventPublicExportService.getGoogleCalendarUrl(event);
    window.open(url, '_blank');
  };

  const handleAddToOutlookCalendar = () => {
    const url = eventPublicExportService.getOutlookCalendarUrl(event);
    window.open(url, '_blank');
  };

  const handleDownloadICal = async () => {
    try {
      const iCalUrl = eventPublicExportService.getEventICalUrl(event.id);
      const link = document.createElement('a');
      link.href = iCalUrl;
      link.download = `evento-${event.id}.ics`;
      link.click();
    } catch (error) {
      console.error('Error downloading iCal:', error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="relative">
                  {event.featured_image && (
                    <img
                      src={event.featured_image}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className={`${event.featured_image ? 'absolute inset-0 bg-black bg-opacity-40' : ''} flex items-end`}>
                    <div className="p-6 text-white">
                      <Dialog.Title as="h3" className="text-2xl font-bold leading-6">
                        {event.title}
                      </Dialog.Title>
                      {event.is_featured && (
                        <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-yellow-500 text-yellow-900 rounded-full">
                          Destacado
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Event Details */}
                  <div className="space-y-4 mb-6">
                    {/* Date and Time */}
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Fecha y hora</p>
                        <p className="text-gray-600">{formatDateRange(event.start_date, event.end_date)}</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Ubicación</p>
                        <p className="text-gray-600">{getLocation()}</p>
                        {getLocationAddress() && (
                          <p className="text-sm text-gray-500">{getLocationAddress()}</p>
                        )}
                        {event.virtual_link && (
                          <a
                            href={event.virtual_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-1 text-sm text-green-600 hover:text-green-700"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Unirse al evento virtual
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="flex items-start space-x-3">
                      <div
                        className="w-5 h-5 rounded-full mt-0.5"
                        style={{ backgroundColor: event.category?.color || '#228B22' }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">Categoría</p>
                        <p className="text-gray-600">{event.category?.name}</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    {(event.contact_email || event.contact_phone) && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Información de contacto</h4>
                        <div className="space-y-2">
                          {event.contact_email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <a
                                href={`mailto:${event.contact_email}`}
                                className="text-green-600 hover:text-green-700"
                              >
                                {event.contact_email}
                              </a>
                            </div>
                          )}
                          {event.contact_phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <a
                                href={`tel:${event.contact_phone}`}
                                className="text-green-600 hover:text-green-700"
                              >
                                {event.contact_phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {event.description && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                      <div
                        className="prose prose-sm max-w-none text-gray-600"
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
                    </div>
                  )}

                  {/* Website Link */}
                  {event.website_url && (
                    <div className="mb-6">
                      <a
                        href={event.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-green-600 hover:text-green-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Más información
                      </a>
                    </div>
                  )}

                  {/* Call to Action */}
                  {event.cta_text && event.cta_link && (
                    <div className="mb-6">
                      <a
                        href={event.cta_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {event.cta_text}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Add to Calendar */}
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Añadir a mi calendario</h5>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={handleAddToGoogleCalendar}
                            className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Google Calendar
                          </button>
                          <button
                            onClick={handleAddToOutlookCalendar}
                            className="px-3 py-2 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                          >
                            Outlook
                          </button>
                          <button
                            onClick={handleDownloadICal}
                            className="px-3 py-2 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Descargar iCal
                          </button>
                        </div>
                      </div>

                      {/* Share */}
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Compartir evento</h5>
                        <ShareButtons event={event} />
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}