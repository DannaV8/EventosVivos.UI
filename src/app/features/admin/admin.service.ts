import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CreateEventRequest {
  title: string;
  description: string;
  type: string;
  venueId: number;
  maxCapacity: number;
  ticketPrice: number;
  startDateTime: string;
  endDateTime: string;
}

/** API client for admin-only operations (confirm reservations, create events). */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;

  confirmReservation(id: string) {
    return this.http.put<{ reservationCode: string }>(`${this.base}/reservations/${id}/confirm`, {});
  }

  createEvent(req: CreateEventRequest) {
    return this.http.post<{ id: string }>(`${this.base}/events`, req);
  }
}
