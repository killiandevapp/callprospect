import React from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

const lineData = [
    { date: new Date(2025, 0, 1), A: 600, B: 400, C: 100 },
    { date: new Date(2025, 1, 1), A: 620, B: 405, C: 160 },
    { date: new Date(2025, 2, 1), A: 630, B: 400, C: 170 },
    { date: new Date(2025, 3, 1), A: 650, B: 410, C: 190 },
    { date: new Date(2025, 4, 1), A: 600, B: 320, C: 200 },
    { date: new Date(2025, 5, 1), A: 650, B: 430, C: 230 },
    { date: new Date(2025, 6, 1), A: 620, B: 400, C: 200 },
    { date: new Date(2025, 7, 1), A: 750, B: 540, C: 300 },
    { date: new Date(2025, 8, 1), A: 780, B: 490, C: 390 },
    { date: new Date(2025, 9, 1), A: 750, B: 450, C: 300 },
    { date: new Date(2025, 10, 1), A: 780, B: 480, C: 340 },
    { date: new Date(2025, 11, 1), A: 820, B: 500, C: 450 },
];

const CustomTooltip = ({
    active,
    payload,
    label
}: {
    active?: boolean;
    payload?: any[];
    label?: Date;
}) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl rounded-2xl p-5 min-w-[200px] animate-in fade-in zoom-in duration-200">
                {/* Header avec gradient */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl mb-4">
                    <p className="text-sm font-semibold tracking-wide">
                        {label?.toLocaleDateString('fr-FR', {
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                </div>

                {/* Données */}
                <div className="space-y-3">
                    {payload.map((entry: any, index: number) => {
                        const colors = {
                            A: '#2563eb',
                            B: '#60a5fa',
                            C: '#1d4ed8'
                        };

                        return (
                            <div key={index} className="group flex items-center justify-between p-2 hover:bg-blue-50/50 rounded-xl transition-all duration-200 hover:scale-[1.02]">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-4 h-4 rounded-full shadow-lg ring-2 ring-white/50 group-hover:ring-blue-200/50"
                                        style={{ backgroundColor: colors[entry.name] }}
                                    />
                                    <span className="text-sm font-semibold text-gray-900 tracking-tight">
                                        {entry.name}
                                    </span>
                                </div>
                                <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    {entry.value.toLocaleString()}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};

// Cursor amélioré
const CustomCursor = ({ points }: any) => {
    return (
        <div className="absolute -translate-x-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full w-3 h-3 shadow-lg border-2 border-blue-500/50 pointer-events-none z-10 animate-pulse">
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur-sm shadow-lg" />
        </div>
    );
};

export const LineChart01 = () => {
    return (
        <div className="w-full h-[450px] p-8 bg-gradient-to-br from-white to-slate-50/50 rounded-3xl shadow-xl border border-slate-100/50">
            <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={lineData}>
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        vertical={false}
                        strokeDasharray="4 4"
                        stroke="#f8fafc"
                    />

                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        tickFormatter={(value: Date) =>
                            value.toLocaleDateString('fr-FR', { month: 'short' })
                        }
                        tick={{
                            fill: '#64748b',
                            fontSize: 13,
                            fontWeight: 600
                        }}
                    />

                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        tickFormatter={(value: number) => value.toLocaleString()}
                        tick={{
                            fill: '#64748b',
                            fontSize: 13,
                            fontWeight: 600
                        }}
                    />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{
                            strokeDasharray: '',
                            stroke: 'transparent',
                            strokeWidth: 0,
                        }}
                        wrapperStyle={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            padding: '8px 12px',
                            textAlign: "center"
                        }}
                    />

                    <Legend
                        height={50}
                        wrapperStyle={{
                            paddingTop: '16px',
                            paddingBottom: '8px'
                        }}
                    />

                    <Area
                        dataKey="A"
                        name="Appels A"
                        stroke="#2563eb"
                        strokeWidth={3}
                        fill="url(#gradient)"
                        fillOpacity={1}
                        type="monotone"
                    />

                    <Area
                        dataKey="B"
                        name="Appels B"
                        stroke="#60a5fa"
                        strokeWidth={3}
                        fill="none"
                        type="monotone"
                    />

                    <Area
                        dataKey="C"
                        name="Appels C"
                        stroke="#1d4ed8"
                        strokeWidth={3}
                        fill="none"
                        type="monotone"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LineChart01;
