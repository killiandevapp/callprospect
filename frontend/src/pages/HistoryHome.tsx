// AppHome.tsx
import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../auth/AuthContext";


export default function HistoryHome() {
    const [history, setHistory] = useState<History[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);




    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await api.get("/prospects-history");
                setHistory(res.data.prospects || []);
            } catch (err) {
                setError("Impossible de charger les prospects.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div>
            {!loading && !error && history.length > 0 && (
                <ul>
                    <ul>
                        {history.map((h) => (
                            <li key={h.callId}>
                                <strong>{h.name}</strong> — {h.phone}<br />

                                Date : {new Date(h.callAt).toLocaleString()}<br />
                                Durée : {h.last_call_duration_sec ?? 0}s<br />

                                Résultat : {h.last_call_result}<br />

        
                            </li>
                        ))}
                    </ul>

                </ul>
            )}
        </div>
    );
}
