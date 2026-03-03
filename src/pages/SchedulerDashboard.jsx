import React, { useState, useEffect } from 'react';

const SchedulerDashboard = () => {
    const [tasks, setTasks] = useState([
        { name: 'process-pending-orders-task', status: 'Running', frequency: 'Every 5m', lastRun: '2 mins ago', nextRun: '3 mins left', success: 124, failed: 0 },
        { name: 'render-print-files-task', status: 'Idle', frequency: 'Every 1m', lastRun: '15s ago', nextRun: '45s left', success: 582, failed: 2 }
    ]);

    const [logs, setLogs] = useState([
        { time: '2023-10-24 10:45:01', task: 'process-pending-orders-task', level: 'INFO', message: '=== DB-SCHEDULER: Starting scheduled task ===' },
        { time: '2023-10-24 10:45:05', task: 'process-pending-orders-task', level: 'INFO', message: 'Found 3 PENDING orders to process' },
        { time: '2023-10-24 10:45:12', task: 'process-pending-orders-task', level: 'INFO', message: 'Successfully processed order ID: 9842 -> Status changed to PAID' },
        { time: '2023-10-24 10:45:15', task: 'process-pending-orders-task', level: 'INFO', message: '=== DB-SCHEDULER: Completed successfully ===' },
    ]);

    return (
        <div className="flex-1 overflow-auto bg-background-light p-8">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 mb-2">Background Scheduler</h1>
                <p className="text-slate-500 font-medium">Monitoring background tasks and automated processes.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Task List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary">schedule</span>
                        Active Tasks
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tasks.map((task, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                {task.status === 'Running' && (
                                    <div className="absolute top-0 right-0 p-3">
                                        <span className="flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{task.name}</h3>
                                <p className="text-2xl font-black text-slate-900 mb-6">{task.status}</p>

                                <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase text-slate-400">
                                    <div>
                                        <p className="mb-1">Frequency</p>
                                        <p className="text-slate-900 font-black">{task.frequency}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1">Last Run</p>
                                        <p className="text-slate-900 font-black">{task.lastRun}</p>
                                    </div>
                                    <div className="mt-2">
                                        <p className="mb-1">Success</p>
                                        <p className="text-emerald-500 font-black">{task.success}</p>
                                    </div>
                                    <div className="mt-2">
                                        <p className="mb-1">Failed</p>
                                        <p className="text-red-500 font-black">{task.failed}</p>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">Run Now</button>
                                    <button className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">Config</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-12 mb-4">
                        <span className="material-symbols-outlined text-primary">terminal</span>
                        Live Execution Logs
                    </h2>

                    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl font-mono text-sm overflow-hidden min-h-[400px]">
                        <div className="flex justify-between items-center mb-6 text-slate-500 border-b border-slate-800 pb-4">
                            <span className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Connected to Scheduler Stream
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest">v1.2.0-beta</span>
                        </div>
                        <div className="space-y-2">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-4">
                                    <span className="text-slate-600 flex-shrink-0">[{log.time}]</span>
                                    <span className={`${log.level === 'INFO' ? 'text-blue-400' : 'text-red-400'} font-bold flex-shrink-0`}>{log.level}</span>
                                    <span className="text-slate-300">{log.message}</span>
                                </div>
                            ))}
                            <div className="animate-pulse flex items-center gap-2 text-primary mt-4">
                                <span className="material-symbols-outlined text-[14px]">keyboard_arrow_right</span>
                                <span className="text-xs font-black uppercase tracking-widest">Listening...</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Scheduler Stats */}
                <div className="space-y-8">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">analytics</span>
                            Metrics
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                                    <span>Memory Usage</span>
                                    <span>240MB / 1GB</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: '24%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                                    <span>Thread Pool</span>
                                    <span>8 / 20 Threads</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: '40%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                                    <span>Queue Size</span>
                                    <span>12 Pending</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{ width: '15%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-primary/20 rounded-2xl p-6 text-white overflow-hidden relative group">
                        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-white/5 group-hover:rotate-12 transition-transform duration-700">settings_suggest</span>
                        <h3 className="text-lg font-black mb-2 relative z-10">System Status</h3>
                        <div className="px-3 py-1 bg-emerald-500 text-background-dark text-[10px] font-black rounded-full uppercase inline-block mb-4 relative z-10">HEALTHY</div>
                        <p className="text-sm text-slate-400 mb-6 relative z-10">All background workers are performing within optimal latency parameters.</p>
                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-black transition-all relative z-10 uppercase tracking-widest">Full Health Report</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchedulerDashboard;
