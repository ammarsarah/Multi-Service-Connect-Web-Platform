import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, CreditCard, Star } from 'lucide-react';
import requestService from '../../services/requestService';
import paymentService from '../../services/paymentService';
import { useAuth } from '../../hooks/useAuth';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import StarRating from '../../components/StarRating.jsx';
import serviceService from '../../services/serviceService';
import PaymentForm from '../../components/payments/PaymentForm.jsx';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { STRIPE_PUBLISHABLE_KEY } from '../../utils/constants';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const STATUS_STEPS = ['pending', 'accepted', 'completed'];

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await requestService.getRequestById(id);
      setRequest(data.request || data);
    } catch { navigate('/requests'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handlePayment = async () => {
    try {
      const { data } = await paymentService.createPaymentIntent(id);
      setClientSecret(data.clientSecret);
      setPayModalOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize payment');
    }
  };

  const handleReview = async () => {
    setReviewLoading(true);
    try {
      await serviceService.addReview(request.service?._id || request.service, review);
      toast.success('Review submitted!');
      setReviewModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setReviewLoading(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Spinner size="lg" /></div>;
  if (!request) return null;

  const { status, service, provider, message, scheduledDate, createdAt, price } = request;
  const currentStep = STATUS_STEPS.indexOf(status);
  const canPay = status === 'accepted' && user?.role === 'client';
  const canReview = status === 'completed' && user?.role === 'client';

  return (
    <div style={{ maxWidth: '800px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>
              {service?.title || 'Service Request'}
            </h1>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Request ID: {id.slice(-8).toUpperCase()} · {formatDate(createdAt)}
            </div>
          </div>
          <Badge status={status} size="md" />
        </div>

        {/* Status timeline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', margin: '20px 0' }}>
          {STATUS_STEPS.map((step, idx) => {
            const done = idx <= currentStep;
            const active = idx === currentStep;
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center', flex: idx < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: done ? '#6366f1' : '#e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: active ? '3px solid #6366f1' : 'none',
                    color: done ? '#fff' : '#94a3b8', flexShrink: 0,
                  }}>
                    {done ? <CheckCircle size={16} /> : <Clock size={14} />}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: done ? '#6366f1' : '#94a3b8', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{step}</span>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: idx < currentStep ? '#6366f1' : '#e2e8f0', margin: '0 4px', marginBottom: '20px' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>PROVIDER</div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>{provider?.name || 'N/A'}</div>
          </div>
          {scheduledDate && (
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>SCHEDULED DATE</div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>{formatDate(scheduledDate)}</div>
            </div>
          )}
          {price && (
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>AMOUNT</div>
              <div style={{ fontWeight: '700', fontSize: '16px', color: '#6366f1' }}>{formatCurrency(price)}</div>
            </div>
          )}
        </div>

        {message && (
          <div style={{ marginTop: '16px', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>YOUR MESSAGE</div>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>{message}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {canPay && (
          <Button onClick={handlePayment}>
            <CreditCard size={16} /> Pay Now — {price && formatCurrency(price)}
          </Button>
        )}
        {canReview && (
          <Button variant="outline" onClick={() => setReviewModalOpen(true)}>
            <Star size={16} /> Leave a Review
          </Button>
        )}
        {status === 'pending' && user?.role === 'client' && (
          <Button variant="danger" onClick={async () => {
            try {
              await requestService.cancelRequest(id, 'Cancelled by client');
              toast.success('Request cancelled');
              load();
            } catch { toast.error('Failed to cancel'); }
          }}>
            <XCircle size={16} /> Cancel Request
          </Button>
        )}
      </div>

      {/* Payment Modal */}
      <Modal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} title="Secure Payment">
        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm
              clientSecret={clientSecret}
              amount={price}
              onSuccess={() => { setPayModalOpen(false); toast.success('Payment successful!'); load(); }}
              onCancel={() => setPayModalOpen(false)}
            />
          </Elements>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Leave a Review"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
            <Button loading={reviewLoading} onClick={handleReview}>Submit Review</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '10px' }}>Rating</label>
            <StarRating value={review.rating} size={32} onChange={r => setReview(p => ({ ...p, rating: r }))} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Comment</label>
            <textarea
              value={review.comment}
              onChange={e => setReview(p => ({ ...p, comment: e.target.value }))}
              placeholder="Share your experience..."
              rows={4}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
