import { type Paddle, initializePaddle } from '@paddle/paddle-js';
import { config } from 'config';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Organization } from '~/types';
import { Button } from '../ui/button';

const Subscription = ({ organization }: { organization: Organization }) => {
  const { t } = useTranslation();

  console.log('org billing', organization);

  // Create a local state to store Paddle instance
  const [paddle, setPaddle] = useState<Paddle>();

  // Callback to open a checkout
  const openCheckout = (priceId: string) => {
    paddle?.Checkout.open({
      items: [{ priceId, quantity: 1 }],
    });
  };

  // Download and initialize Paddle instance from CDN
  useEffect(() => {
    initializePaddle({
      // environment: config.mode === 'development' ? 'sandbox' : 'production',
      environment: 'sandbox',
      token: config.paddleToken,
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, []);

  return (
    <>
      <Button variant="gradient" className="w-40" onClick={() => openCheckout(config.paddlePriceIds.donate)}>
        {t('common:checkout')}
      </Button>
    </>
  );
};

export default Subscription;
