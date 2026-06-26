import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EventService } from './event.service';
import { Event } from '../../core/models/event.model';

const BASE = 'https://eventosvivos-api-q5jw.onrender.com/api';

describe('EventService', () => {
  let service: EventService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EventService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('availableTickets = maxCapacity - confirmed - lost', () => {
    const event = { maxCapacity: 100, confirmedTickets: 30, lostTickets: 5 } as Event;
    expect(service.availableTickets(event)).toBe(65);
  });

  it('getById GETs /events/{id}', () => {
    service.getById('ev-1').subscribe();
    const call = http.expectOne(`${BASE}/events/ev-1`);
    expect(call.request.method).toBe('GET');
    call.flush({} as Event);
  });

  it('list passes filters and pagination as query params', () => {
    service.list({ type: 'Concert', venueId: 2 }, 3, 9).subscribe();

    const call = http.expectOne(
      (r) => r.url === `${BASE}/events`
        && r.params.get('type') === 'Concert'
        && r.params.get('venueId') === '2'
        && r.params.get('page') === '3'
        && r.params.get('pageSize') === '9',
    );
    expect(call.request.method).toBe('GET');
    call.flush({ items: [], totalCount: 0, page: 3, pageSize: 9 });
  });
});
