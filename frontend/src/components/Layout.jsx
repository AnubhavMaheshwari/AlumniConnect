import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text-primary)', transition: 'background 0.3s, color 0.3s' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;