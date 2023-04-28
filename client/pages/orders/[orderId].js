import React, { useState, useEffect } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const timeLeft = new Date(order.expireAt) - new Date();
      setTimeLeft(Math.round(timeLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => clearInterval(timerId);
  }, []);

  if (timeLeft <= 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      Time left to pay : {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey='pk_test_51MGL3dG2LzXl7jutyKUTFtZy92JO5qSUGungNb14iC86sacmWzgiTTBoEnTV6BkapsafwYFrOwFdgFifLKDiQ4G700ILFlOQFh'
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};
export default OrderShow;
