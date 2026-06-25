import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Reservation, CreateReservationRequest } from '../../core/models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;

  create(req: CreateReservationRequest) {
    return this.http.post<{ id: string }>(`${this.base}/reservations`, req);
  }

  myReservations() {
    return this.http.get<Reservation[]>(`${this.base}/reservations`);
  }

  cancel(id: string) {
    return this.http.put<void>(`${this.base}/reservations/${id}/cancel`, {});
  }
}
