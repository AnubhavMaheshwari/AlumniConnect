import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
    FaCrown, FaCheck, FaRocket, FaGem, FaArrowRight, 
    FaCreditCard, FaRegCalendarCheck, FaHistory, FaInfoCircle
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

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
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscription = async (plan) => {
        setProcessing(true);
        try {
            // 1. Create Order
            const { data } = await API.post('/membership/order', { plan });
            
            if (data.isMock) {
                // Handle Mock Payment for Dev
                toast.info('Development Mode: Simulating Payment...');
                setTimeout(async () => {
                    await API.post('/membership/verify', {
                        razorpay_order_id: data.order.id,
                        razorpay_payment_id: 'pay_mock_' + Date.now(),
                        razorpay_signature: 'mock_sig',
                        plan
                    });
                    toast.success(`${plan.toUpperCase()} Membership Activated!`);
                    fetchStatus();
                    loadUser(); // Refresh user context
                    setProcessing(false);
                }, 1500);
                return;
            }

            // Real Razorpay Integration would go here using window.Razorpay
            toast.warning('Razorpay keys not configured. Use mock mode or add keys.');
            setProcessing(false);

        } catch (err) {
            toast.error(err.response?.data?.message || 'Transaction failed');
            setProcessing(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--blue-faint)', borderTopColor: 'var(--blue-light)', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 24px 120px', fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                    <FaCrown style={{ color: 'var(--blue-light)', fontSize: 13 }} />
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--blue-light)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Membership Plans</span>
                </div>
                
                <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>
                    Unlock Premium <span style={{ color: 'var(--blue-light)' }}>Privileges</span>
                </h1>
                <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 60px', lineHeight: 1.6 }}>
                    Join our exclusive membership to access advanced search, premium networking, and special event discounts.
                </p>

                {/* PLANS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, marginBottom: 80 }}>
                    {/* BASIC */}
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 28, padding: 40, textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: 32 }}>
                            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Campus Basic</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Standard access for all students</p>
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 800, margin: '0 0 40px' }}>Free</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48, flex: 1 }}>
                            {[ 'Directory Search', 'Event RSVP', 'News & Stories', 'Basic Networking' ].map((f, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14.5, color: 'var(--text-secondary)' }}>
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--blue-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaCheck style={{ color: 'var(--blue-light)', fontSize: 10 }} />
                                    </div>
                                    {f}
                                </div>
                            ))}
                        </div>
                        <button disabled style={{ width: '100%', padding: '16px', borderRadius: 14, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 15, fontWeight: 700 }}>Current Plan</button>
                    </div>

                    {/* PREMIUM - HIGH LIGHTED */}
                    <div style={{ background: 'var(--bg-secondary)', border: '2px solid var(--blue-light)', borderRadius: 28, padding: 40, textAlign: 'left', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 20px 50px var(--card-shadow)' }}>
                        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--blue-light)', color: '#fff', padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Most Popular</div>
                        <div style={{ marginBottom: 32 }}>
                            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Elite Premium</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Enhanced features & credibility</p>
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 800, margin: '0 0 40px' }}>₹999 <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>/ year</span></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48, flex: 1 }}>
                            {[ 'Advanced Search Filters', 'Mentorship Priority', 'Job Posting Privileges', 'Verified Member Badge', 'No Registration Limits' ].map((f, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14.5, color: 'var(--text-secondary)' }}>
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaCheck style={{ color: '#fff', fontSize: 10 }} />
                                    </div>
                                    {f}
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => handleSubscription('premium')}
                            disabled={processing || status?.membership?.plan === 'premium'}
                            style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, var(--blue-light), var(--blue))', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px rgba(32,54,113,0.3)', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {status?.membership?.plan === 'premium' ? 'Plan Active' : processing ? 'Processing...' : 'Get Premium →'}
                        </button>
                    </div>

                    {/* LIFETIME */}
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 28, padding: 40, textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: 32 }}>
                            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Lifetime Legacy</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>One-time payment forever</p>
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 800, margin: '0 0 40px' }}>₹4,999</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48, flex: 1 }}>
                            {[ 'All Premium Features', 'Wall of Fame Recognition', 'Exclusive Campus Meetup', 'Lifetime Access Token', 'VIP Support' ].map((f, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14.5, color: 'var(--text-secondary)' }}>
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--blue-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaCheck style={{ color: 'var(--blue-light)', fontSize: 10 }} />
                                    </div>
                                    {f}
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => handleSubscription('lifetime')}
                            disabled={processing || status?.membership?.plan === 'lifetime'}
                            style={{ width: '100%', padding: '16px', borderRadius: 14, border: '1px solid var(--blue-border)', background: 'var(--blue-faint)', color: 'var(--blue-light)', fontSize: 15, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            {status?.membership?.plan === 'lifetime' ? 'Plan Active' : 'Go Lifetime'}
                        </button>
                    </div>
                </div>

                {/* FOOTER INFO */}
                <div style={{ background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', borderRadius: 24, padding: 32, display: 'flex', alignItems: 'center', gap: 24, textAlign: 'left' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
                        <FaInfoCircle />
                    </div>
                    <div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px' }}>Secure Payments with Razorpay</h4>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Your data is protected with enterprise-grade encryption. Support available 24/7 for payment queries.</p>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Membership;
