import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        if (username === 'admin' && password === 'admin') {
            localStorage.setItem('isAdminAuthenticated', 'true');
            navigate('/admin/users');
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="bg-background-light  min-h-screen flex flex-col font-display text-slate-900 ">
            {/* Top Navigation Bar */}
            <header className="w-full border-b border-solid border-slate-200  bg-white  px-6 md:px-10 py-3">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-900 ">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-background-dark" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">POD Print</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link className="text-slate-600  text-sm font-medium hover:text-primary transition-colors" to="#">Home</Link>
                        <Link className="text-slate-600  text-sm font-medium hover:text-primary transition-colors" to="#">Products</Link>
                        <Link className="text-slate-600  text-sm font-medium hover:text-primary transition-colors" to="#">Pricing</Link>
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                {/* Login Card Container */}
                <div className="w-full max-w-[480px] bg-white    rounded-xl shadow-xl shadow-slate-200/50  p-8 md:p-10">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-slate-900  tracking-tight text-3xl font-bold leading-tight text-center pb-2">Welcome Back</h1>
                        <p className="text-slate-500  text-base font-normal leading-normal text-center">Login to your POD Dashboard</p>
                    </div>
                    {/* Login Form */}
                    <form className="space-y-5" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        {/* Username Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900  text-sm font-semibold leading-normal">Username</label>
                            <input
                                className="flex w-full rounded-lg text-slate-900  border border-slate-200  bg-slate-50  focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary h-12 placeholder:text-slate-400 p-4 text-base font-normal leading-normal transition-all"
                                placeholder="Admin Username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        {/* Password Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900  text-sm font-semibold leading-normal">Password</label>
                            <div className="relative flex items-center">
                                <input
                                    className="flex w-full rounded-lg text-slate-900  border border-slate-200  bg-slate-50  focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary h-12 placeholder:text-slate-400 p-4 pr-12 text-base font-normal leading-normal transition-all"
                                    placeholder="Enter your password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button className="absolute right-4 text-slate-400 hover:text-slate-600  flex items-center justify-center" type="button">
                                    <span className="material-symbols-outlined">visibility</span>
                                </button>
                            </div>
                        </div>
                        {/* Utility Row */}
                        <div className="flex items-center justify-between py-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input className="rounded text-primary focus:ring-primary h-4 w-4 bg-slate-50  border-slate-200  transition-colors" type="checkbox" />
                                <span className="text-sm text-slate-600  font-medium group-hover:text-slate-900  transition-colors">Remember me</span>
                            </label>
                            <Link className="text-sm font-semibold text-primary hover:underline" to="#">Forgot password?</Link>
                        </div>
                        {/* Primary Button */}
                        <button className="w-full bg-primary hover:bg-primary/90 text-background-dark text-base font-bold h-12 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2" type="submit">
                            <span>Sign In</span>
                            <span className="material-symbols-outlined text-[20px]">login</span>
                        </button>
                    </form>
                    {/* Social/Divider (Optional Visual) */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100 "></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white  px-2 text-slate-400">Or continue with</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 h-11 rounded-lg border border-slate-200  hover:bg-slate-50  transition-colors">
                            <img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY6J44kI-TDWytBq0gtoFzJI0vlpkezryq3JF62KhC68CQtCQCEu1R60Prxq7gAUM4h_hcsm7noWlkRct5GW7NtvuQi6kGdslWSeCek521cayErD0yTuYS7oQEWO8vPYk8GPUx4lEIoZibwwXnOo0FvoCXKbjS4wxgvpA0wxhmuYtt6-NJ1FDO5pAgMGXAIZ6M48V8cXBcAXxUEuOJgUOb7H8oPDwzSv0Or0Id5BZ0mkLk4ea6RwAaSlhI33E33K0J8LMxz6il6qg" />
                            <span className="text-sm font-medium text-slate-700 ">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 h-11 rounded-lg border border-slate-200  hover:bg-slate-50  transition-colors">
                            <span className="material-symbols-outlined text-slate-700 ">work</span>
                            <span className="text-sm font-medium text-slate-700 ">SSO</span>
                        </button>
                    </div>
                    {/* Register Footer */}
                    <p className="mt-8 text-center text-sm text-slate-600 ">
                        Don't have an account?
                        <Link className="font-bold text-primary hover:underline ml-1" to="#">Register here</Link>
                    </p>
                </div>
                {/* Support Info */}
                <div className="mt-8 text-center max-w-[480px]">
                    <p className="text-xs text-slate-400  leading-relaxed">
                        By signing in, you agree to our <Link className="underline" to="#">Terms of Service</Link> and <Link className="underline" to="#">Privacy Policy</Link>.
                    </p>
                </div>
            </main>
            {/* Footer Decoration */}
            <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>
    );
};

export default Login;
