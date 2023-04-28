import { Publisher, PaymentCreatedEvent, Subjects } from '@shatatickets/shared';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
