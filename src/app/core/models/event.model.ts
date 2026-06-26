export type EventType = 'Conference' | 'Workshop' | 'Concert';
export type EventStatus = 'Active' | 'Cancelled' | 'Completed';

export const EVENT_TYPE_MAP: Record<number, EventType> = {
  0: 'Conference',
  1: 'Workshop',
  2: 'Concert',
};

export const VENUE_MAP: Record<number, string> = {
  1: 'Central Auditorium',
  2: 'North Hall',
  3: 'South Arena',
};

export interface Event {
  id: string;
  title: string;
  description: string;
  venueId: number;
  venueName: string;
  maxCapacity: number;
  confirmedTickets: number;
  lostTickets: number;
  startDateTime: string;
  endDateTime: string;
  ticketPrice: number;
  type: EventType;
  status: EventStatus;
}

export interface EventFilters {
  title?: string;
  type?: EventType;
  venueId?: number;
  status?: EventStatus;
  startDate?: string;
  endDate?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface EventOccupancy {
  eventId: string;
  title: string;
  soldTickets: number;
  availableTickets: number;
  occupancyPercentage: number;
  totalRevenue: number;
  status: EventStatus;
}
