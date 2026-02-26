import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UserRegister = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            navigate('/home/profile'); // Auto-login after registration
        }, 1000);
    };

    return (
        <div className="animate-fade-in-up">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create an account</h2>
                <p className="mt-2 text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/home/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                        Sign in instead
                    </Link>
                </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
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
                            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>
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
                            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>
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
