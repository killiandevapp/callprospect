
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
        <div style={{ padding: 150 }}>
            <h2 className="text-4xl mb-12">Analyse par créneau horaire</h2>

            {/* cartes du haut */}
            <div className="grid grid-cols-[55%_40%] gap-[5%]">
                <div className="justify-between" style={{ display: "flex", marginTop: 24, flexWrap: "wrap" }}>
                    <Card title="Refus" value={`${data.refusedPct}%`} />
                    <Card title="Discussion" value={`${data.discussionPct}%`} />
                    <Card title="Appel" value={`${data.callsPerHour} /h`} />
                </div>



                <div
                    className="p-4 rounded-xl bg-[#BDD2FF] shadow-[0_10px_30px_rgba(15,23,42,0.08)] min-w-[35%] min-h-[100px] flex flex-col gap-1 relative h-[100px] mt-[24px]">
                    <div className="text-2xl text-black">Évolution apelle</div>
                    <div className="text-xl font-semibold text-green-600 flex items-center gap-[5px]">
                        +{diffCalls} appels
                        <span className="text-sm">{diffPct}%</span>
                    </div>
                    <img
                        className="w-[60px] absolute right-[50px] bottom-[20px]"
                        src={imgStats}
                        alt=""
                    />

                </div>




            </div>

            <div className="grid grid-cols-[55%_40%]" style={{ display: "grid", gap: "5%", marginTop: 32, flexWrap: "wrap", gridTemplateColumns: "55% 40%" }}>
                {/* appels / jour */}
                <div className="bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] p-12" style={{ flex: 1, minWidth: 320, boxShadow: "rgba(15, 23, 42, 0.08) 0px 10px 30px", padding: 20, borderRadius: 30 }}>
                    <h3>Nombre d’appels</h3>
                    <p style={{ fontSize: 32, fontWeight: 600 }}>{data.totalCalls}</p>

                    <LineChart01 />
                </div>

                {/* créneaux + refus */}
                <div style={{ flex: 1, minWidth: 320 }}>
                    <h3>Analyse par créneau</h3>
                    {data.timeSlots.map((slot) => (
                        <ProgressLine
                            key={slot.label}
                            label={slot.label}
                            percent={slot.percent}
                        />
                    ))}

                    <h3 style={{ marginTop: 24 }}>Statistiques sur les motifs des refus</h3>
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
    );
}

function Card({ title, value }: { title: string; value: string }) {
    return (
        <div
            style={{
                padding: 16,
                borderRadius: 16,
                background: "#fff",
                boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                minWidth: 160,
                minHeight: 100,
            }}
        >
            <div style={{ fontSize: 13, color: "#6b7280" }}>{title.toUpperCase()}</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: "#16a34a" }}>{value}</div>
        </div>
    );
}

function ProgressLine({ label, percent }: { label: string; percent: number }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, marginBottom: 4 }}>
                {percent}% <span style={{ color: "#6b7280" }}> {label}</span>
            </div>
            <div
                style={{
                    height: 6,
                    borderRadius: 999,
                    background: "#e5e7eb",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${percent}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: "#4f46e5",
                    }}
                />
            </div>
        </div>
    );
}
