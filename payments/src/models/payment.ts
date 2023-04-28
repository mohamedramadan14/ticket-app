import mongoose, { Document, Model, Schema } from 'mongoose';

interface PaymentsAttrs {
  stripeId: string;
  orderId: string;
}

interface PaymentDoc extends Document {
  stripeId: string;
  orderId: string;
}

interface PaymentModel extends Model<PaymentDoc> {
  build(attrs: PaymentsAttrs): PaymentDoc;
}

const paymentSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

paymentSchema.statics.build = (attrs: PaymentsAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  'Payment',
  paymentSchema
);

export { Payment };
