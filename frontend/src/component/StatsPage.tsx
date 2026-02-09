
import { useEffect } from "react";
import { api } from "../api/axios";

import "../style/statsPage.css"


import { LineChart01 } from "./CallsAreaChart";
import imgStats from '../assets/imgStats.png'


import { useStatsOverview } from "../hooks/useStatsOverview";

export default function StatsPage() {
    const { data, loading, error } = useStatsOverview();
    console.log(data);


    if (loading) return <p>Chargement...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!data) return <p>Aucune donnée pour l’instant.</p>;
    const days = data.callsPerDay;

    // sécurité
    let diffCalls = 0;
    let diffPct = 0;

    if (days.length >= 2) {
        const prev = days[days.length - 2].count;
        const last = days[days.length - 1].count;

        diffCalls = last - prev;
        diffPct = prev > 0 ? Math.round((diffCalls / prev) * 100) : 0;
    }



    return (
        <div className="px-4 sm:px-8 lg:px-16 py-8 space-y-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
                Analyse par créneau horaire
            </h2>

            {/* Cartes du haut */}
            <div className="grid grid-cols-1 lg:grid-cols-[55%_40%] gap-6 lg:gap-[5%]">
                <div className="flex flex-wrap gap-4">
                    <Card title="Refus" value={`${data.refusedPct}%`} />
                    <Card title="Discussion" value={`${data.discussionPct}%`} />
                    <Card title="Appels / h" value={`${data.callsPerHour}`} />
                </div>

                <div className="relative p-5 rounded-xl bg-blue-100 shadow-lg h-[120px] flex flex-col justify-center">
                    <div className="text-lg font-medium text-slate-900">
                        Évolution des appels
                    </div>
                    <div className="text-xl font-semibold text-green-600 flex items-center gap-2">
                        +{diffCalls} appels
                        <span className="text-sm text-green-700">{diffPct}%</span>
                    </div>

                    <img
                        src={imgStats}
                        alt=""
                        className="absolute right-6 bottom-4 w-14 opacity-90 hidden sm:block"
                    />
                </div>
            </div>

            {/* Graphiques + stats */}
            <div className="grid grid-cols-1 lg:grid-cols-[55%_40%] gap-8 lg:gap-[5%]">
                {/* appels / jour */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                    <h3 className="text-lg font-medium text-slate-800">
                        Nombre d’appels
                    </h3>
                    <p className="text-3xl font-semibold mt-1">
                        {data.totalCalls}
                    </p>

                    <div className="mt-4">
                        <LineChart01 />
                    </div>
                </div>

                {/* créneaux + refus */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium mb-3">
                            Analyse par créneau
                        </h3>
                        {data.timeSlots.map((slot) => (
                            <ProgressLine
                                key={slot.label}
                                label={slot.label}
                                percent={slot.percent}
                            />
                        ))}
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-3">
                            Motifs de refus
                        </h3>
                        {data.refusalReasons.map((r) => (
                            <ProgressLine
                                key={r.label}
                                label={r.label}
                                percent={r.percent}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


function Card({ title, value }: { title: string; value: string }) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-4 min-w-[140px] flex-1 sm:flex-none">
            <div className="text-xs font-medium text-slate-500 uppercase">
                {title}
            </div>
            <div className="text-2xl font-semibold text-green-600 mt-1">
                {value}
            </div>
        </div>
    );
}



function ProgressLine({ label, percent }: { label: string; percent: number }) {
    return (
        <div className="space-y-1">
            <div className="text-sm">
                <span className="font-medium">{percent}%</span>{" "}
                <span className="text-slate-500">{label}</span>
            </div>

            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
