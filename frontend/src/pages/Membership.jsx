import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { LuCheck, LuInfo, LuShieldCheck, LuArrowRight } from 'react-icons/lu';
import Button from '../components/ui/Button';

const plans = [
  {
    name: 'Alumni Basic',
    price: 'Free',
    priceSuffix: '',
    desc: 'Standard networking access for all verified students & alumni.',
    features: [
      'Alumni directory search',
      'Event registrations & RSVPs',
      'Community news & stories',
      'Direct peer messaging',
    ],
    key: 'basic',
    highlight: false,
  },
  {
    name: 'Elite Membership',
    price: '\u20B9999',
    priceSuffix: '/ year',
    desc: 'Enhanced visibility, priority mentorship, and job board posting.',
    features: [
      'Advanced directory filters (company & title)',
      '1-on-1 mentorship priority queue',
      'Job and internship posting rights',
      'Verified Alumni Member badge',
      'Direct alumni contact introductions',
    ],
    key: 'premium',
    highlight: true,
  },
  {
    name: 'Lifetime Legacy',
    price: '\u20B94,999',
    priceSuffix: 'one-time',
    desc: 'Permanent lifetime access and contribution to student funds.',
    features: [
      'All Elite Membership features permanently',
      'Distinguished Wall of Fame recognition',
      'Annual alumni meet VIP privileges',
      'Lifetime digital member credentials',
      'Exclusive student scholarship voting rights',
    ],
    key: 'lifetime',
    highlight: false,
  },
];

const Membership = () => {
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const { data } = await API.get('/membership/status');
      setStatus(data);
    } catch (err) {
      console.error('Error fetching membership status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscription = async (planKey) => {
    setProcessing(true);
    try {
      const { data } = await API.post('/membership/order', { plan: planKey });
      if (data.isMock) {
        toast.info('Development Mode: Simulating secure payment...');
        setTimeout(async () => {
          await API.post('/membership/verify', {
            razorpay_order_id: data.order.id,
            razorpay_payment_id: 'pay_mock_' + Date.now(),
            razorpay_signature: 'mock_sig',
            plan: planKey,
          });
          toast.success(`${planKey.toUpperCase()} Membership successfully activated!`);
          fetchStatus();
          if (loadUser) loadUser();
          setProcessing(false);
        }, 1200);
        return;
      }
      toast.warning('Razorpay payment gateway credentials not set.');
      setProcessing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction could not be completed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  const currentPlan = status?.membership?.plan || 'basic';

  return (
    <div style={{ padding: '64px 24px 96px', maxWidth: 1120, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="badge badge-accent" style={{ marginBottom: 12 }}>
          Support Your Alma Mater
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(28px, 4.5vw, 42px)',
            fontWeight: 800,
            color: 'var(--color-text)',
            marginBottom: 12,
          }}
        >
          Membership Plans & Privileges
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'var(--color-text-secondary)',
            maxWidth: 580,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Support student scholarships, sponsor campus technical clubs, and gain priority networking privileges across batches.
        </p>
      </div>

      {/* Pricing Plans Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          marginBottom: 48,
          alignItems: 'stretch',
        }}
      >
        {plans.map((p) => {
          const isCurrent = currentPlan === p.key;

          return (
            <div
              key={p.key}
              className="card"
              style={{
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: p.highlight ? 'var(--color-accent)' : undefined,
                borderWidth: p.highlight ? 2 : 1,
                position: 'relative',
              }}
            >
              {p.highlight && (
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--color-accent)',
                    color: '#FFFFFF',
                    padding: '4px 14px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Most Popular
                </div>
              )}

              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: 6,
                  }}
                >
                  {p.name}
                </h3>
                <p
                  style={{
                    fontSize: 13.5,
                    color: 'var(--color-text-secondary)',
                    marginBottom: 20,
                    minHeight: 40,
                  }}
                >
                  {p.desc}
                </p>

                <div style={{ marginBottom: 24 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 34,
                      fontWeight: 800,
                      color: 'var(--color-text)',
                    }}
                  >
                    {p.price}
                  </span>
                  {p.priceSuffix && (
                    <span
                      style={{
                        fontSize: 13.5,
                        color: 'var(--color-text-muted)',
                        marginLeft: 6,
                      }}
                    >
                      {p.priceSuffix}
                    </span>
                  )}
                </div>

                {/* Features List */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    marginBottom: 28,
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: 20,
                  }}
                >
                  {p.features.map((feat) => (
                    <div
                      key={feat}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: 13.5,
                        color: 'var(--color-text)',
                      }}
                    >
                      <LuCheck
                        size={16}
                        strokeWidth={2.2}
                        style={{ color: 'var(--color-success)', flexShrink: 0 }}
                      />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isCurrent ? (
                  <Button variant="secondary" size="md" disabled className="w-full">
                    Current Plan
                  </Button>
                ) : p.key === 'basic' ? (
                  <Button variant="secondary" size="md" disabled className="w-full">
                    Included with Account
                  </Button>
                ) : (
                  <Button
                    variant={p.highlight ? 'primary' : 'secondary'}
                    size="md"
                    className="w-full"
                    onClick={() => handleSubscription(p.key)}
                    disabled={processing}
                    loading={processing}
                  >
                    {p.highlight ? 'Upgrade to Elite' : 'Choose Lifetime'} <LuArrowRight size={14} />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Guarantee Note */}
      <div
        className="card"
        style={{
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'var(--color-panel)',
        }}
      >
        <LuShieldCheck
          size={24}
          strokeWidth={1.8}
          style={{ color: 'var(--color-accent)', flexShrink: 0 }}
        />
        <div style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--color-text)' }}>Institutional Trust & Transparency: </strong>
          All membership fees directly support student competitive coding chapters, campus solar initiatives, and hardship travel grants for student conferences.
        </div>
      </div>
    </div>
  );
};

export default Membership;
