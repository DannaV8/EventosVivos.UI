export type ReservationStatus = 'PendientePago' | 'Confirmada' | 'Cancelada';

export interface Reservation {
  id: string;
  eventId: string;
  eventTitle: string;
  quantity: number;
  status: ReservationStatus;
  reservationCode: string | null;
  createdAt: string;
}

export interface CreateReservationRequest {
  eventId: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
}
