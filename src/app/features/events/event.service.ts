import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Event, EventFilters, PagedResult, EventOccupancy } from '../../core/models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;

  availableTickets(event: Event): number {
    return Math.max(0, event.maxCapacity - (event.confirmedTickets ?? 0) - (event.lostTickets ?? 0));
  }

  list(filters: EventFilters = {}, page = 1, pageSize = 9) {
    let params = new HttpParams();
    if (filters.title) params = params.set('title', filters.title);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.venueId) params = params.set('venueId', String(filters.venueId));
    if (filters.status) params = params.set('status', filters.status);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', `${filters.endDate}T23:59:59`);
    params = params.set('page', String(page));
    params = params.set('pageSize', String(pageSize));

    return this.http.get<PagedResult<Event>>(`${this.base}/events`, { params });
  }

  getById(id: string) {
    return this.http.get<Event>(`${this.base}/events/${id}`);
  }

  report(eventId: string) {
    return this.http.get<EventOccupancy>(`${this.base}/events/${eventId}/report`);
  }

  listReports() {
    return this.http.get<EventOccupancy[]>(`${this.base}/events/reports`);
  }
}
