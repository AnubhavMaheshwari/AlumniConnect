import { Link } from 'react-router-dom';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-primary  text-white border-t  border-white/10 mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-14">

                {/* 2. Three Columns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center mb-12">
                    {/* Quick Links */}
                    <div className="flex flex-col items-center">
                        <h3 className="text-white font-bold mb-4 text-lg">Quick Links</h3>
                        <ul className="space-y-3 text-sm text-blue-100">
                            <li><Link to="/directory" className="hover:text-white transition-colors">Directory</Link></li>
                            <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>
                        </ul>
                    </div>

                    {/* Platform */}
                    <div className="flex flex-col items-center">
                        <h3 className="text-white font-bold mb-4 text-lg">Platform</h3>
                        <ul className="space-y-3 text-sm text-blue-100">
                            <li><Link to="/jobs" className="hover:text-white transition-colors">Jobs</Link></li>
                            <li><Link to="/news" className="hover:text-white transition-colors">News</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="flex flex-col items-center">
                        <h3 className="text-white font-bold mb-4 text-lg">Support</h3>
                        <ul className="space-y-3 text-sm text-blue-100">
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                        </ul>
                    </div>
                </div>

                {/* The Social/Contact Block (Maintained in your original position) */}
                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-blue-100/80 text-center text-sm">
                        Adityapur, Jamshedpur • <a href="mailto:alumni@nitjsr.ac.in" className="hover:text-white transition">alumni@nitjsr.ac.in</a> • +91 657 237 4000
                    </p>
                    <div className="flex gap-6 mt-4 text-2xl">
                        <a href="#" className="text-blue-100 hover:text-white transition-transform hover:-translate-y-1">
                            <FaLinkedin />
                        </a>
                        <a href="#" className="text-blue-100 hover:text-white transition-transform hover:-translate-y-1">
                            <FaGithub />
                        </a>
                        <a href="#" className="text-blue-100 hover:text-white transition-transform hover:-translate-y-1">
                            <FaEnvelope />
                        </a>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 my-8 opacity-50"></div>

                {/* 3. Copyright Row */}
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-xs font-medium tracking-wide">
                    <p className="text-blue-100/60 text-center uppercase">
                        © {new Date().getFullYear()} NIT Jamshedpur Alumni Portal.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;