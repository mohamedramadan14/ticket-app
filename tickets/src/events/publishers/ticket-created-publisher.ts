import { Publisher, Subjects, TicketCreatedEvent } from '@shatatickets/shared';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
