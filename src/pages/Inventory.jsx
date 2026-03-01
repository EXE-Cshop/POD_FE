import React from 'react';
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
    const navigate = useNavigate();
    return (
        <div className="flex-1 overflow-auto max-w-[1200px] mx-auto py-8 px-4 text-slate-900 ">
            {/* Section Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-slate-900  text-3xl font-extrabold tracking-tight">Base Product Management</h1>
                    <p className="text-slate-500  mt-1">Configure blank merchandise and define printable zones for the customization engine.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/base-products/add')}
                    className="h-11 px-6 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add New Product
                </button>
            </div>

            {/* Tabs Navigation */}
            <div className="mb-8 border-b border-slate-200 ">
                <div className="flex gap-8">
                    <a className="flex flex-col items-center justify-center border-b-[3px] border-primary text-slate-900  pb-3 pt-4" href="#">
                        <p className="text-sm font-bold tracking-[0.015em]">All Products</p>
                    </a>
                    <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-slate-500  hover:text-slate-900  pb-3 pt-4 transition-colors" href="#">
                        <p className="text-sm font-bold tracking-[0.015em]">T-shirts</p>
                    </a>
                    <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-slate-500  hover:text-slate-900  pb-3 pt-4 transition-colors" href="#">
                        <p className="text-sm font-bold tracking-[0.015em]">Hoodies</p>
                    </a>
                    <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-slate-500  hover:text-slate-900  pb-3 pt-4 transition-colors" href="#">
                        <p className="text-sm font-bold tracking-[0.015em]">Accessories</p>
                    </a>
                    <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-slate-500  hover:text-slate-900  pb-3 pt-4 transition-colors" href="#">
                        <p className="text-sm font-bold tracking-[0.015em]">Headwear</p>
                    </a>
                </div>
            </div>

            {/* Image Grid of Base Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Product Card 1 */}
                <div className="group bg-white  rounded-xl border border-slate-200  overflow-hidden flex flex-col hover:border-primary/50 transition-all duration-300">
                    <div className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-center bg-no-repeat bg-contain p-4 group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAiirRhCaPRMgl9is6bs702iHRLYP07FzHI9uZ-V3X6zsZKF-78CZE5tLB4ybHHQomx-d3VJEoPqXRwvX9BMerc7CdL4m-cTwnRCg0NEABIeU9hIF0ISne_BEbXjO-z9DnkVXK9fi9a2Fl8JeBuyYnuszkZh9BlA2G6eT64JoA_FL40ag8XRm0VWb6t_nU0LYIN9h6GAvvgltHKfCm6AflVELWJYCKE_gN1iEng3UmK5ExfjCUQ6-nTDCpP0UOPjwGP8PNIZJU8T34")' }}></div>
                        <div className="absolute top-2 right-2 px-2 py-1 bg-background-dark/80 text-primary text-[10px] font-bold rounded uppercase tracking-wider">Active</div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-slate-900  text-lg font-bold mb-1">Premium Heavyweight Tee</h3>
                        <p className="text-slate-500  text-xs font-mono uppercase tracking-widest mb-3">SKU: TSH-HW-001</p>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-slate-500  text-sm">Colors: 12</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 "></span>
                            <span className="text-slate-500  text-sm">Sizes: S-3XL</span>
                        </div>
                        <button className="mt-auto w-full py-2.5 rounded-lg bg-slate-100  text-slate-900  text-sm font-bold hover:bg-primary hover:text-background-dark transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">design_services</span>
                            Manage Print Areas
                        </button>
                    </div>
                </div>

                {/* Product Card 2 */}
                <div className="group bg-white  rounded-xl border border-slate-200  overflow-hidden flex flex-col hover:border-primary/50 transition-all duration-300">
                    <div className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-center bg-no-repeat bg-contain p-4 group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDnPYPglnWXBBfG-u-TmmlOBhUAEYst5Nn8aaS_KSqv790Lx1LW7skY4CU_bdfze1ZeFgSVmGcVN8QLSb45SjTakDW2GtrQdKJak0qD5Gyhkun3XykAhErNNS8UOp6HSM8jM-2x_4gBAvh3bnCwKk_w7H9Ex0L8xvXTEUuk8_U1WduGKtqY4zixhl-06JL7T_CsKEwWZYiEO4h3HQKnir1EiZbiP1sdX3Shc5l5T0kRtY4RKvp-wtf-grdBn_T47IS0jnLs8zisvVE")' }}></div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-slate-900  text-lg font-bold mb-1">Unisex Organic Hoodie</h3>
                        <p className="text-slate-500  text-xs font-mono uppercase tracking-widest mb-3">SKU: HUD-ORG-022</p>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-slate-500  text-sm">Colors: 8</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 "></span>
                            <span className="text-slate-500  text-sm">Sizes: XS-2XL</span>
                        </div>
                        <button className="mt-auto w-full py-2.5 rounded-lg bg-slate-100  text-slate-900  text-sm font-bold hover:bg-primary hover:text-background-dark transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">design_services</span>
                            Manage Print Areas
                        </button>
                    </div>
                </div>
                {/* Product Card 3 */}
                <div className="group bg-white  rounded-xl border border-slate-200  overflow-hidden flex flex-col hover:border-primary/50 transition-all duration-300">
                    <div className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-center bg-no-repeat bg-contain p-4 group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBxEtV9TQCrJFK3WCiDjaHUKdt_A0liffRTcLyGyN-27uLRu6VqRuGaaJvLOo5wqt2tKVYsCugcguJRSoUyT-KnkYkKQ5k8yU_LYGg-hhcHxGLWDIZ5PbfSPkZeEs0ELs2jQQVIeDt33Xru2AolpuQ9ysj4uIC3G9PvbJ8sDR2CsL0BZxhujKV367S-FD5FQHqtK6hHWmCWrg6qnb-xJ2zRHTYOK2qoy_mJ_gfmMLWjgtbN026TYVuBwLhA0aosLSUkpxBjgOxKd1A")' }}></div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-slate-900  text-lg font-bold mb-1">Eco Canvas Tote</h3>
                        <p className="text-slate-500  text-xs font-mono uppercase tracking-widest mb-3">SKU: ACC-TOT-05</p>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-slate-500  text-sm">Colors: 3</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 "></span>
                            <span className="text-slate-500  text-sm">Sizes: OS</span>
                        </div>
                        <button className="mt-auto w-full py-2.5 rounded-lg bg-slate-100  text-slate-900  text-sm font-bold hover:bg-primary hover:text-background-dark transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">design_services</span>
                            Manage Print Areas
                        </button>
                    </div>
                </div>

                {/* Product Card 4 */}
                <div className="group bg-white  rounded-xl border border-slate-200  overflow-hidden flex flex-col hover:border-primary/50 transition-all duration-300">
                    <div className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-center bg-no-repeat bg-contain p-4 group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD-FqstBU7oqfc_wR1EM0F5LqWfFej6qkZXw5iHwZpj3gimOuFyE6TO3AMJqGs0SpIv7YWwhst5149yO_A0aD8Ldhl3eTXuxl04AsblgKa9hVBTiSNdmfgS4An0dNbF1f4TmQ0W46EHli3B0Dj-o43YF8ca_vyKW8t3g0JLTWVCGFI322P1S0T2gXPOssgHlqMAIKNcT73uUyEP6k8OemJhrFrAYGb3lB7bhRQwTdugP27k9VuGWPMcNMNdmS-hvZm6gVkp6qUYmzA")' }}></div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-slate-900  text-lg font-bold mb-1">Cuffed Winter Beanie</h3>
                        <p className="text-slate-500  text-xs font-mono uppercase tracking-widest mb-3">SKU: HAT-BEA-12</p>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-slate-500  text-sm">Colors: 15</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 "></span>
                            <span className="text-slate-500  text-sm">Sizes: OS</span>
                        </div>
                        <button className="mt-auto w-full py-2.5 rounded-lg bg-slate-100  text-slate-900  text-sm font-bold hover:bg-primary hover:text-background-dark transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">design_services</span>
                            Manage Print Areas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
