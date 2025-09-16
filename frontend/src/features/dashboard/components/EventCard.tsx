/**
 * Event Card Component
 * Compact card display for dashboard events with essential information
 */

'use client';

import { DashboardEvent } from '@/services/dashboardService';
import { CalendarIcon, ClockIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface EventCardProps {
  event: DashboardEvent;
  onViewDetail: (eventId: number) => void;
}

export const EventCard = ({ event, onViewDetail }: EventCardProps) => {
  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const isSameDay = start.toDateString() === end.toDateString();
    
    if (isSameDay) {
      return {
        date: start.toLocaleDateString('es-ES', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        }),
        time: `${start.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })} - ${end.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`,
      };
    } else {
      return {
        date: `${start.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short' 
        })} - ${end.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short' 
        })}`,
        time: `${start.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`,
      };
    }
  };

  const getStatusColor = (statusCode: string) => {
    switch (statusCode) {
      case 'pending_internal_approval':
      case 'pending_public_approval':
      case 'requires_changes':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'approved_internal':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIndicator = (event: DashboardEvent) => {
    if (event.has_ended) return null;
    
    const now = new Date();
    const eventStart = new Date(event.start_date);
    const daysUntilEvent = Math.ceil((eventStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent <= 3 && daysUntilEvent > 0) {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <ClockIcon className="w-3 h-3 mr-1" />
          Próximo ({daysUntilEvent}d)
        </div>
      );
    }
    
    if (event.is_happening) {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <div className="w-2 h-2 bg-blue-600 rounded-full mr-1 animate-pulse" />
          En curso
        </div>
      );
    }
    
    return null;
  };

  const { date, time } = formatEventDate(event.start_date, event.end_date);
  const urgencyIndicator = getUrgencyIndicator(event);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:border-[#228B22] hover:shadow-md transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {event.title}
              </h3>
              {event.is_featured && (
                <StarIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <BuildingOffice2Icon className="w-4 h-4 mr-1" />
              <span className="truncate">{event.entity.name}</span>
            </div>
          </div>

          {urgencyIndicator && (
            <div className="ml-3 flex-shrink-0">
              {urgencyIndicator}
            </div>
          )}
        </div>

        {/* Status and Category */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.status.status_code)}`}>
            {event.status.status_name}
          </span>
          
          {event.category && (
            <span 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border text-white"
              style={{ 
                backgroundColor: event.category.color,
                borderColor: event.category.color,
              }}
            >
              {event.category.name}
            </span>
          )}
        </div>

        {/* Date and Time */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 ml-6">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span>{time}</span>
          </div>
        </div>

        {/* State Duration and Actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            En estado actual: {event.current_state_duration.formatted}
          </div>
          
          <button
            onClick={() => onViewDetail(event.id)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-[#228B22] bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#228B22] transition-colors duration-200"
          >
            Ver Detalle
          </button>
        </div>
      </div>
    </div>
  );
};