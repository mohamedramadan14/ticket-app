import mongoose from 'mongoose';
import { app } from './app';
import { OrderCancelledSubscriber } from './events/subscribers/order-cancelled-subscriber';
import { OrderCreatedSubscriber } from './events/subscribers/order-created-subscriber';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT Sign Key must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URI must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS client closed');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreatedSubscriber(natsWrapper.client).listen();
    new OrderCancelledSubscriber(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);

    console.log('Database (MongoDB) Connected in : PAYMENTS SERVICE');
  } catch (error) {
    console.error(error);
  }

  app.listen(3000, () => {
    console.log('PAYMENTS Service live: Listening on PORT: 3000');
  });
};

start();
