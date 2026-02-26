import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const HomeLayout = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-background-light font-display text-gray-900 antialiased">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 w-full border-b border-solid border-slate-200 bg-white/80 backdrop-blur-md px-6 md:px-10 py-3 transition-all duration-300">
                <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-900">
                        <Link to="/home" className="flex items-center gap-3">
                            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-background-dark" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold leading-tight tracking-tight">POD Print</h2>
                        </Link>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link className="text-slate-600 text-sm font-medium hover:text-primary transition-colors" to="/home">Home</Link>
                        <Link className="text-slate-600 text-sm font-medium hover:text-primary transition-colors" to="/home/catalog">Catalog</Link>
                        <Link className="text-slate-600 text-sm font-medium hover:text-primary transition-colors" to="/home/my-orders">My Orders</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        {/* Search Icon */}
                        <button className="text-slate-600 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[24px]">search</span>
                        </button>

                        {/* Cart */}
                        <button
                            onClick={() => navigate('/home/cart')}
                            className="relative size-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors group cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">shopping_cart</span>
                            <span className="absolute top-1.5 right-1.5 size-4 bg-primary text-[#11221c] text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">3</span>
                        </button>

                        {/* User Profile */}
                        <button
                            onClick={() => navigate('/home/login')}
                            className="flex items-center gap-2 pl-4 ml-2 border-l border-slate-200 text-slate-600 hover:text-primary transition-colors cursor-pointer"
                            title="Sign In / Account"
                        >
                            <span className="material-symbols-outlined text-[24px]">account_circle</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-hidden flex flex-col">
                <Outlet />
            </main>

            {/* Robust Footer */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
                <div className="max-w-[1440px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
                    {/* Brand Column */}
                    <div>
                        <Link to="/home" className="flex items-center gap-3 mb-6">
                            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-background-dark" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900">POD Print</h2>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Your premium partner for custom apparel and merchandise. High-quality prints, fast fulfillment, and global shipping.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-[#11221c] transition-colors"><span className="text-lg font-bold">f</span></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-[#11221c] transition-colors"><span className="text-lg font-bold">𝕏</span></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-[#11221c] transition-colors"><span className="text-lg font-bold">in</span></a>
                        </div>
                    </div>

                    {/* Catalog Column */}
                    <div>
                        <h3 className="text-slate-900 font-bold mb-6">Catalog</h3>
                        <ul className="space-y-3">
                            <li><Link to="/home/catalog?category=T-Shirts" className="text-slate-500 hover:text-primary text-sm transition-colors">T-Shirts</Link></li>
                            <li><Link to="/home/catalog?category=Hoodies" className="text-slate-500 hover:text-primary text-sm transition-colors">Hoodies</Link></li>
                            <li><Link to="/home/catalog?category=Accessories" className="text-slate-500 hover:text-primary text-sm transition-colors">Accessories</Link></li>
                            <li><Link to="/home/catalog?category=Mugs" className="text-slate-500 hover:text-primary text-sm transition-colors">Home & Living</Link></li>
                            <li><Link to="/home/catalog?category=Posters" className="text-slate-500 hover:text-primary text-sm transition-colors">Wall Art</Link></li>
                        </ul>
                    </div>

                    {/* Support Column */}
                    <div>
                        <h3 className="text-slate-900 font-bold mb-6">Support</h3>
                        <ul className="space-y-3">
                            <li><Link to="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Help Center</Link></li>
                            <li><Link to="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Shipping & Delivery</Link></li>
                            <li><Link to="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Returns & Refunds</Link></li>
                            <li><Link to="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Design Guidelines</Link></li>
                            <li><Link to="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div>
                        <h3 className="text-slate-900 font-bold mb-6">Stay Updated</h3>
                        <p className="text-slate-500 text-sm mb-4">Subscribe to our newsletter for the latest products and design tips.</p>
                        <form className="flex" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-l-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                            <button type="submit" className="bg-primary text-[#11221c] px-4 py-2.5 rounded-r-lg font-bold text-sm hover:brightness-110 transition-all">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-200">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-slate-400 text-sm">© 2026 POD Print. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <Link to="#" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">Privacy Policy</Link>
                            <Link to="#" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">Terms of Service</Link>
                            <Link to="#" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">Sitemap</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomeLayout;
