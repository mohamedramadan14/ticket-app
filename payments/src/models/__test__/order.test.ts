import { Order } from '../order';
import { OrderStatus } from '@shatatickets/shared';
import mongoose from 'mongoose';

describe('Order model', () => {
  it('should build and save a new order', async () => {
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      userId: 'user1',
      price: 10,
      status: OrderStatus.Created,
    });

    await order.save();

    const foundOrder = await Order.findById(order.id);

    expect(foundOrder!.version).toBe(0);
    expect(foundOrder!.userId).toBe('user1');
    expect(foundOrder!.price).toBe(10);
    expect(foundOrder!.status).toBe(OrderStatus.Created);
  });

  it('should update the version number on save', async () => {
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      userId: 'user1',
      price: 10,
      status: OrderStatus.Created,
    });

    await order.save();

    expect(order.version).toBe(0);

    await order.save();

    expect(order.version).toBe(1);
  });
});

test('transforms toJSON', () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 1,
    userId: 'user1',
    price: 100,
    status: OrderStatus.Created,
  });

  const json = order.toJSON();

  expect(json.id).toBeDefined();
  expect(json.__V).toBeUndefined();
  expect(json._id).toBeUndefined();
  expect(json.userId).toBe('user1');
  expect(json.price).toBe(100);
  expect(json.status).toBe(OrderStatus.Created);
});
