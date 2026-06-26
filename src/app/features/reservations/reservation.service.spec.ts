import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReservationService } from './reservation.service';
import { CreateReservationRequest } from '../../core/models/reservation.model';

const BASE = 'https://eventosvivos-api-q5jw.onrender.com/api';

describe('ReservationService', () => {
  let service: ReservationService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReservationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('create POSTs the request body to /reservations and returns the id', () => {
    const req: CreateReservationRequest = {
      eventId: 'ev-1', quantity: 2, buyerName: 'Ana', buyerEmail: 'ana@test.com',
    };
    let result: { id: string } | undefined;
    service.create(req).subscribe((r) => (result = r));

    const call = http.expectOne(`${BASE}/reservations`);
    expect(call.request.method).toBe('POST');
    expect(call.request.body).toEqual(req);
    call.flush({ id: 'res-99' });

    expect(result).toEqual({ id: 'res-99' });
  });

  it('myReservations GETs /reservations', () => {
    service.myReservations().subscribe();
    const call = http.expectOne(`${BASE}/reservations`);
    expect(call.request.method).toBe('GET');
    call.flush([]);
  });

  it('cancel PUTs to /reservations/{id}/cancel', () => {
    service.cancel('res-99').subscribe();
    const call = http.expectOne(`${BASE}/reservations/res-99/cancel`);
    expect(call.request.method).toBe('PUT');
    call.flush(null);
  });
});
