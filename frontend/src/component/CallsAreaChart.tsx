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
    YAxis,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl rounded-2xl p-5 min-w-[200px] animate-in fade-in zoom-in duration-200">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl mb-4">
                    <p className="text-sm font-semibold tracking-wide">
                        {new Date(label).toLocaleDateString("fr-FR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}
                    </p>
                </div>
                <div className="space-y-3">
                    {payload.map((entry: any, index: number) => {
                        const colors: any = { A: "#2563eb", B: "#60a5fa", C: "#1d4ed8" };
                        return (
                            <div
                                key={index}
                                className="group flex items-center justify-between p-2 hover:bg-blue-50/50 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                            >
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

export const LineChart01 = () => {
    const [data, setData] = useState<any[]>([]);
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=dimanche, 1=lundi, ..., 6=samedi

    // Calcul du lundi
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    // Générer les dates de la semaine jusqu'à aujourd'hui
    const weekDays: Date[] = [];
    for (let i = 0; i < 6; i++) { // lun → sam
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        if (d <= today && d.getDay() !== 0) { // ignore dimanche et futur
            weekDays.push(d);
        }
    }

    // Filtrer les données pour ne garder que cette semaine
    const filteredData = data?.filter((row: any) => {
        const rowDate = new Date(row.date);
        return weekDays.some(d => d.toDateString() === rowDate.toDateString());
    });




    useEffect(() => {
        (async () => {
            try {
                const today = new Date();
                const from = new Date();
                from.setDate(today.getDate() - 6); // 7 derniers jours

                const res = await api.get("/calls-by-date", {
                    params: {
                        from: from.toISOString().split("T")[0],
                        to: today.toISOString().split("T")[0],
                        groupBy: "day",
                    },
                });

                // Transformer les données en Date pour Recharts
                setData(
                    res.data.map((row: any) => ({
                        date: new Date(row.date),
                        A: row.total_calls,
                        B: row.discussions,
                        C: row.refusals,
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
                <AreaChart data={filteredData}>
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
                        ticks={weekDays} // tick forcé
                        tickFormatter={(value: any) => {
                            const date = value instanceof Date ? value : new Date(value);
                            if (isNaN(date.getTime())) return "";
                            return date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
                        }}
                        tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }}
                    />



                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        tickFormatter={(value: number) => value.toLocaleString()}
                        tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Legend
                        height={50}
                        wrapperStyle={{ paddingTop: "16px", paddingBottom: "8px" }}
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
