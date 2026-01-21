
import { useEffect } from "react";
import { api } from "../api/axios";

import { LineChart01 } from "./CallsAreaChart";


import { useStatsOverview } from "../hooks/useStatsOverview";

export default function StatsPage() {
    const { data, loading, error } = useStatsOverview();

    if (loading) return <p>Chargement...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!data) return <p>Aucune donnée pour l’instant.</p>;

    return (
        <div style={{ padding: 32 }}>
            <h2>Analyse par créneau horaire</h2>

            {/* cartes du haut */}
            <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
                <Card title="Refus" value={`${data.refusedPct}%`} />
                <Card title="Discussion" value={`${data.discussionPct}%`} />
                <Card title="Appel" value={`${data.callsPerHour} /h`} />
            </div>

            <div style={{ display: "flex", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
                {/* appels / jour */}
                <div style={{ flex: 1, minWidth: 320 }}>
                    <h3>Nombre d’appels</h3>
                    <p style={{ fontSize: 32, fontWeight: 600 }}>{data.totalCalls}</p>
                    <small>Cette semaine</small>

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

                    <h3 style={{ marginTop: 24 }}>Statistiques sur les refus</h3>
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
