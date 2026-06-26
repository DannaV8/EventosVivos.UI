import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminService, CreateEventRequest } from './admin.service';

const BASE = 'https://localhost:62323/api';

describe('AdminService', () => {
  let service: AdminService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('confirmReservation PUTs to /reservations/{id}/confirm and returns the code', () => {
    let result: { reservationCode: string } | undefined;
    service.confirmReservation('res-1').subscribe((r) => (result = r));

    const call = http.expectOne(`${BASE}/reservations/res-1/confirm`);
    expect(call.request.method).toBe('PUT');
    call.flush({ reservationCode: 'EV-123456' });

    expect(result).toEqual({ reservationCode: 'EV-123456' });
  });

  it('createEvent POSTs the body to /events and returns the id', () => {
    const req: CreateEventRequest = {
      title: 'Jazz Night', description: 'Live jazz', type: 'Concert',
      venueId: 2, maxCapacity: 200, ticketPrice: 50,
      startDateTime: '2026-07-01T20:00:00.000Z', endDateTime: '2026-07-01T23:00:00.000Z',
    };
    let result: { id: string } | undefined;
    service.createEvent(req).subscribe((r) => (result = r));

    const call = http.expectOne(`${BASE}/events`);
    expect(call.request.method).toBe('POST');
    expect(call.request.body).toEqual(req);
    call.flush({ id: 'ev-77' });

    expect(result).toEqual({ id: 'ev-77' });
  });
});
