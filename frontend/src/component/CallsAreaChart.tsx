import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl rounded-2xl p-5 min-w-[200px]">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl mb-4">
                    <p className="text-sm font-semibold tracking-wide">
                        {label?.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
                    </p>
                </div>
                <div className="space-y-3">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2">
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span>{entry.name}</span>
                            </div>
                            <span>{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

interface ChartData {
    date: Date;
    A: number;
    B: number;
    C: number;
}

export const LineChart01 = () => {
    const [data, setData] = useState<ChartData[]>([]);
    const [fromDate, setFromDate] = useState("2026-01-17");
    const [toDate, setToDate] = useState("2026-01-31");
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/calls-by-date", {
                params: {
                    from: fromDate,
                    to: toDate
                }
            });

            const filtered = res.data
                .map((row: any) => ({
                    ...row,
                    date: new Date(row.date),
                }))
                .filter((row: any) => {
                    // Optionnel : filtrer seulement les jours ouvrés (lundi-vendredi)
                    const dayOfWeek = row.date.getDay();
                    return dayOfWeek !== 0 && dayOfWeek !== 7; // pas WE
                });

            setData(
                filtered.map((row: any) => ({
                    date: row.date,
                    A: row.total_calls,
                    B: row.discussions,
                    C: row.refusals
                }))
            );
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fromDate, toDate]);

    const presets = [
        { label: "Cette semaine", from: "2026-01-20", to: "2026-01-26" },
        { label: "Semaine dernière", from: "2026-01-13", to: "2026-01-19" },
        { label: "Mois complet", from: "2026-01-01", to: "2026-02-01" }
    ];

    const setPreset = (preset: { from: string; to: string }) => {
        setFromDate(preset.from);
        setToDate(preset.to);
    };

    return (
        <div className="w-full space-y-6">
            {/* 🎯 SELECTEUR DE DATES */}
            <div className="">


                {/* Presets rapides */}
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100">
                    {presets.map((preset, index) => (
                        <button
                            key={index}
                            onClick={() => setPreset(preset)}
                            className="px-4 py-2 text-xs bg-slate-100 hover:bg-blue-500 hover:text-white rounded-lg transition-all font-medium"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 📊 GRAPHIQUE */}
            <div className="">
                {loading ? (
                    <div className="flex items-center justify-center h-[380px] text-slate-500">
                        Chargement des données...
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex items-center justify-center h-[380px] text-slate-500">
                        Aucune donnée pour cette période
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={380}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                                    <stop offset="50%" stopColor="#2563eb" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#f8fafc" />

                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={12}
                                tickFormatter={(value: any) =>
                                    value.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })
                                }
                                tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={12}
                                tickFormatter={(value: number) => value.toLocaleString()}
                                tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }}
                            />

                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{
                                    fill: "rgb(255, 255, 255)",
                                }}
                            />

                            <Legend height={50} wrapperStyle={{ paddingTop: "16px", paddingBottom: "8px" }} />

                            <Area
                                dataKey="A"
                                name="Appels A"
                                stroke="#2563eb"
                                strokeWidth={3}
                                fill="url(#gradient)"
                                fillOpacity={1}
                                type="monotone"
                            />
                            <Area dataKey="B" name="Appels B" stroke="#60a5fa" strokeWidth={3} fill="none" type="monotone" />
                            <Area dataKey="C" name="Appels C" stroke="#1d4ed8" strokeWidth={3} fill="none" type="monotone" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default LineChart01;
