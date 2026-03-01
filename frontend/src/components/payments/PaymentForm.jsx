import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, CreditCard } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '15px',
      color: '#1e293b',
      fontFamily: 'Inter, sans-serif',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#ef4444' },
  },
};

export default function PaymentForm({ clientSecret, amount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setCardError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        setCardError(error.message);
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess?.(paymentIntent);
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Amount display */}
      {amount && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', background: 'linear-gradient(135deg, #f0f0ff, #faf0ff)',
          borderRadius: '10px', marginBottom: '20px', border: '1px solid #e0e0ff',
        }}>
          <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>Amount to pay</span>
          <span style={{ fontWeight: '900', fontSize: '22px', color: '#6366f1' }}>{formatCurrency(amount)}</span>
        </div>
      )}

      {/* Card element */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
          Card Details
        </label>
        <div style={{
          border: `1.5px solid ${cardError ? '#ef4444' : '#e2e8f0'}`,
          borderRadius: '8px', padding: '12px 14px', background: '#fff',
          transition: 'border-color 0.15s',
        }}
          onFocus={() => {}}
        >
          <CardElement options={CARD_STYLE} onChange={(e) => setCardError(e.error?.message || null)} />
        </div>
        {cardError && (
          <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{cardError}</p>
        )}
      </div>

      {/* Test card hint */}
      <div style={{
        padding: '10px 12px', background: '#f0fdf4', borderRadius: '8px',
        border: '1px solid #bbf7d0', marginBottom: '20px',
        fontSize: '12px', color: '#166534',
      }}>
        <strong>Test card:</strong> 4242 4242 4242 4242 · Any future date · Any CVC
      </div>

      {/* Security note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px', marginBottom: '20px' }}>
        <Lock size={12} color="#10b981" />
        <span>Your payment is encrypted and secure. Powered by Stripe.</span>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button type="button" variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          type="submit"
          loading={processing}
          disabled={!stripe || !elements}
          style={{ flex: 2, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
        >
          <CreditCard size={16} />
          {processing ? 'Processing...' : `Pay ${amount ? formatCurrency(amount) : 'Now'}`}
        </Button>
      </div>
    </form>
  );
}
