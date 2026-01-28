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

export const LineChart01 = () => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/calls-by-date", {
                    params: {
                        from: "2026-01-17", // date de début de la semaine
                        to: "2026-01-23"    // date de fin de la semaine
                    }
                });

                // Filtrer uniquement les jours ouvrés lun → ven
                const today = new Date();
                const dayOfWeek = today.getDay();

                const filtered = res.data
                    .map((row: any) => ({
                        ...row,
                        date: new Date(row.date), // <-- conversion ici
                    }))
                    .filter((row: any) => {
                        const diff = row.date.getTime() - today.getTime();
                        // ici tu peux filtrer selon ton besoin
                        return true;
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
            }
        })();
    }, []);

    return (
        <div className="w-full h-[450px] p-8 bg-gradient-to-br from-white to-slate-50/50 rounded-3xl shadow-xl border border-slate-100/50">
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
                        wrapperStyle={{backgroundColor:"white", padding: "15px", display:"flex", flexDirection: "column", alignItems: "center"
                        }}
                        cursor={{
                            fill: "rgb(255, 255, 255)", // fond bleu très léger
                        }}
                    />


                    <Legend height={50} wrapperStyle={{ paddingTop: "16px", paddingBottom: "8px"}} />

                    <Area
                        dataKey="A"
                        name="Appels A"
                        color="red"
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
        </div>
    );
};

export default LineChart01;
