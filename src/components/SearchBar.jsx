import React from 'react';

const SearchBar = ({ value, onChange, placeholder = "Search for trending styles..." }) => {
    return (
        <div className="relative w-full max-w-xl font-display">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 select-none pointer-events-none">
                search
            </span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-gray-200 focus:border-primary/50 text-gray-900 placeholder-gray-400 text-sm rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            )}
        </div>
    );
};

export default SearchBar;
