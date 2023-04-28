import { queueGroupName } from './queue-group-name';
import {
  Subscriber,
  Subjects,
  OrderCancelledEvent,
  OrderStatus,
} from '@shatatickets/shared';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCancelledSubscriber extends Subscriber<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findByEvent(data);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
