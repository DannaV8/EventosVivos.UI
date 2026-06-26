export type ReservationStatus = 'PendingPayment' | 'Confirmed' | 'Cancelled';

export interface Reservation {
  id: string;
  eventId: string;
  eventTitle: string;
  quantity: number;
  status: ReservationStatus;
  reservationCode: string | null;
  creationDate: string;
}

export interface CreateReservationRequest {
  eventId: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
}
