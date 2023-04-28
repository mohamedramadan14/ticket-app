import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedSubscriber } from './events/subscribers/ticket-created-subscriber';
import { TicketUpdatedSubscriber } from './events/subscribers/ticket-updated-subscriber';
import { PaymentCreatedSubscriber } from './events/subscribers/payment-created-subscriber';
import { ExpirationCompleteSubscriber } from './events/subscribers/expiration-complete-subscriber';

const start = async () => {
  console.log('Starting Orders....');

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

    new TicketCreatedSubscriber(natsWrapper.client).listen();
    new TicketUpdatedSubscriber(natsWrapper.client).listen();
    new ExpirationCompleteSubscriber(natsWrapper.client).listen();
    new PaymentCreatedSubscriber(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);

    console.log('Database (MongoDB) Connected in : ORDERS SERVICE');
  } catch (error) {
    console.error(error);
  }

  app.listen(3000, () => {
    console.log('Orders Service live: Listening on PORT: 3000');
  });
};

start();
