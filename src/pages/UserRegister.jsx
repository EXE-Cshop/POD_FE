import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { authService, cartService } from '../services/api';
import { guestCartStorage } from '../utils/guestCartStorage';

const UserRegister = () => {
    const navigate = useNavigate();
    const { login: setAuthData } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (pass) => {
        const criteria = [
            { label: 'Tối thiểu 8 ký tự', met: pass.length >= 8 },
            { label: 'Chữ hoa & chữ thường', met: /[a-z]/.test(pass) && /[A-Z]/.test(pass) },
            { label: 'Số & ký tự đặc biệt', met: /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass) },
        ];
        return criteria;
    };

    const passwordCriteria = validatePassword(password);
    const isPasswordStrong = passwordCriteria.every(c => c.met);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPasswordError('');

        if (!isPasswordStrong) {
            setError('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các tiêu chí.');
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError('Mật khẩu xác nhận không khớp.');
            return;
        }

        const formData = new FormData(e.target);
        const fullName = formData.get('name');
        const email = formData.get('email');

        setIsLoading(true);
        try {
            const res = await authService.register({ email, password, fullName });
            const { user } = res.data?.data || res.data || {};
            if (user) {
                // Merge Guest Cart Items
                try {
                    const guestItems = guestCartStorage.getCartItems();
                    if (guestItems.length > 0) {
                        for (const item of guestItems) {
                            await cartService.addItem(item.productVariantId, item.quantity, {
                                frontPrintUrl: item.frontPrintUrl,
                                backPrintUrl: item.backPrintUrl,
                                customName: item.productName
                            });
                        }
                        guestCartStorage.clearCart();
                    }
                } catch (mergeErr) {
                    console.error('Failed to merge guest cart during registration:', mergeErr);
                }

                setAuthData(user);
                const isAdmin = user.roles?.includes('SUPER_ADMIN') || user.role === 'SUPER_ADMIN';
                const target = isAdmin ? '/admin/dashboard' : '/home';
                navigate(target, { replace: true });
            } else {
                navigate('/login', { replace: true });
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create an account</h2>
                <p className="mt-2 text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                        Sign in instead
                    </Link>
                </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>
                )}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                        Full Name
                    </label>
                    <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                        </div>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 transition-all font-medium"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                        Email address
                    </label>
                    <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 transition-all font-medium"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                        Password
                    </label>
                    <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>
                    {/* Password Strength Indicator */}
                    {password && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            {passwordCriteria.map((c, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className={`h-1 rounded-full transition-colors ${c.met ? 'bg-primary' : 'bg-slate-200'}`}></div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${c.met ? 'text-primary' : 'text-slate-400'}`}>
                                        {c.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-slate-900">
                        Confirm Password
                    </label>
                    <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">lock_reset</span>
                        </div>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 transition-all font-medium ${passwordError ? 'ring-red-500' : ''}`}
                            placeholder="••••••••"
                        />
                    </div>
                    {passwordError && <p className="mt-1 text-xs text-red-500 font-medium">{passwordError}</p>}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full justify-center items-center gap-2 rounded-xl bg-primary px-3 py-3.5 text-sm font-bold leading-6 text-[#11221c] shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </div>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
                By signing up, you agree to our{' '}
                <a href="#" className="font-semibold text-slate-900 hover:text-primary transition-colors">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="font-semibold text-slate-900 hover:text-primary transition-colors">Privacy Policy</a>.
            </p>
        </div>
    );
};

export default UserRegister;
