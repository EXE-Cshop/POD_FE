import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { authService, cartService } from '../services/api';
import { guestCartStorage } from '../utils/guestCartStorage';

const UserLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: setAuthData } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const formData = new FormData(e.target);
        const email = formData.get('username');
        const password = formData.get('password');
        try {
            const res = await authService.login({ email, password });
            const { user } = res.data?.data || res.data || {};
            if (user) {
                // Merge Guest Cart Items
                const guestItems = guestCartStorage.getCartItems();
                if (guestItems.length > 0) {
                    try {
                        for (const item of guestItems) {
                            await cartService.addItem(item.productVariantId, item.quantity, {
                                frontPrintUrl: item.frontPrintUrl,
                                backPrintUrl: item.backPrintUrl,
                                customName: item.productName
                            });
                        }
                        guestCartStorage.clearCart();
                    } catch (mergeErr) {
                        console.error('Failed to merge guest cart:', mergeErr);
                    }
                }

                setAuthData(user);
                const isAdmin = user.roles?.includes('SUPER_ADMIN') || user.role === 'SUPER_ADMIN';
                const from = location.state?.from || (isAdmin ? '/admin/dashboard' : '/home');
                navigate(from, { replace: true });
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
                <p className="mt-2 text-sm text-slate-500">
                    Or{' '}
                    <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                        create a new account
                    </Link>
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>
                )}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium leading-6 text-slate-900">
                        Username or Email
                    </label>
                    <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                        </div>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 transition-all font-medium"
                            placeholder="admin"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                            Password
                        </label>
                        <div className="text-sm">
                            <a href="#" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                Forgot password?
                            </a>
                        </div>
                    </div>
                    <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
                    />
                    <label htmlFor="remember-me" className="ml-3 block text-sm leading-6 text-slate-600">
                        Remember me
                    </label>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full justify-center items-center gap-2 rounded-xl bg-primary px-3 py-3.5 text-sm font-bold leading-6 text-[#11221c] shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-8">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm font-medium leading-6">
                        <span className="bg-white px-6 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all">
                        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                            <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                            <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                            <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                        </svg>
                        <span className="text-sm font-semibold leading-6">Google</span>
                    </button>

                    <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all">
                        <svg className="h-5 w-5 fill-[#24292F]" aria-hidden="true" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 512">
                            <path d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9 11.2 2.1 15.3-5 15.3-11.1 0-5.5-.2-19.9-.3-39.1-62.3 13.9-75.5-30.8-75.5-30.8-10.2-26.5-24.9-33.6-24.9-33.6-20.3-14.3 1.5-14 1.5-14 22.5 1.6 34.3 23.7 34.3 23.7 20 35.1 52.4 25 65.2 19.1 2-14.8 7.8-25 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8 0 0 18.8-6.2 61.6 23.5 17.9-5.1 37-7.6 56.1-7.7 19 .1 38.2 2.6 56.1 7.7 42.8-29.7 61.5-23.5 61.5-23.5 12.2 31.6 4.6 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 6.1 4 13.3 15.4 11C415.9 449.1 480 363.1 480 261.7 480 134.9 379.7 32 256 32z" />
                        </svg>
                        <span className="text-sm font-semibold leading-6">GitHub</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
