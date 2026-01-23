
import { useEffect, useState } from "react";
import { api } from "../api/axios";
import "../style/history.css";

type CallHistory = {
  id: number;
  prospect_name: string | null;
  phone: string;
  started_at: string;
  duration_sec: number | null;
  result: "refused" | "meeting" | "callback" | "no_answer";
};

export default function HistoryHome() {
  const [history, setHistory] = useState<CallHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<"" | "date" | "duration">("");
  const [filterResult, setFilterResult] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/prospects-history");

        // ✅ ICI le vrai fix
        setHistory(res.data);
      } catch (e) {
        setError("Impossible de charger l’historique.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const displayedHistory = [...history]
    .filter(call =>
      filterResult ? call.result === filterResult : true
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.started_at).getTime() -
          new Date(a.started_at).getTime()
        );
      }
      if (sortBy === "duration") {
        return (b.duration_sec ?? 0) - (a.duration_sec ?? 0);
      }
      return 0;
    });

  return (
    <div className="callHistoryContainer">
      <h2>Historique des appels</h2>

      {/* TRI */}
      <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
        <option value="">Trier par</option>
        <option value="date">Date</option>
        <option value="duration">Durée</option>
      </select>

      {/* FILTRE */}
      <div className="filters">
        {[
          ["", "Tous"],
          ["meeting", "RDV"],
          ["refused", "Refus"],
          ["callback", "À rappeler"],
          ["no_answer", "Pas de réponse"],
        ].map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name="result"
              value={value}
              checked={filterResult === value}
              onChange={() => setFilterResult(value)}
            />
            {label}
          </label>
        ))}
      </div>

      {loading && <p>Chargement…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && displayedHistory.length === 0 && (
        <p>Aucun appel trouvé.</p>
      )}

      {!loading && !error && (
        <ul className="callHistoryList">
          {displayedHistory.map(call => (
            <li key={call.id} className={`call ${call.result}`}>
              <div>
                <strong>{call.prospect_name ?? "Sans nom"}</strong>
                <span>{call.phone}</span>
              </div>

              <div>
                <span>
                  {new Date(call.started_at).toLocaleString()}
                </span>
                <span>{call.duration_sec ?? 0}s</span>
                <span>{call.result}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
