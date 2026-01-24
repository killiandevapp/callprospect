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

type SortField = "name" | "phone" | "date" | "duration";

export default function HistoryHome() {
  const [history, setHistory] = useState<CallHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterResult, setFilterResult] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/prospects-history");
        setHistory(res.data.prospects ?? []);
      } catch {
        setError("Impossible de charger l’historique.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const displayedHistory = history
    .filter(
      (c) =>
        (!filterResult || c.result === filterResult) &&
        (!searchTerm ||
          c.prospect_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.phone.includes(searchTerm))
    )
    .sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortField) {
        case "name":
          valA = a.prospect_name ?? "";
          valB = b.prospect_name ?? "";
          break;
        case "phone":
          valA = a.phone;
          valB = b.phone;
          break;
        case "date":
          valA = new Date(a.started_at).getTime();
          valB = new Date(b.started_at).getTime();
          break;
        case "duration":
          valA = a.duration_sec ?? 0;
          valB = b.duration_sec ?? 0;
          break;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="callHistoryContainer">
      <h2>Historique des appels</h2>

      <input
        className="callHistorySearch"
        placeholder="Rechercher nom ou téléphone"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="filters">
        {[
          ["", "Tous"],
          ["meeting", "RDV"],
          ["refused", "Refus"],
          ["callback", "À rappeler"],
          ["no_answer", "Pas de réponse"],
        ].map(([value, label]) => (
          <label key={value} className="radioLabel">
            <input
              type="radio"
              name="result"
              checked={filterResult === value}
              onChange={() => setFilterResult(value)}
            />
            <span className="radioCustom" />
            {label}
          </label>
        ))}
      </div>

      {loading && <p>Chargement…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="tableWrapper">
          <table className="callHistoryTable">
            <thead>
              <tr>
                <th onClick={() => handleSort("name")}>Nom</th>
                <th onClick={() => handleSort("phone")}>Téléphone</th>
                <th onClick={() => handleSort("date")}>Date</th>
                <th onClick={() => handleSort("duration")}>Durée</th>
                <th>Résultat</th>
              </tr>
            </thead>
            <tbody>
              {displayedHistory.map((c) => (
                <tr key={c.id}>
                  <td data-label="Nom">{c.prospect_name ?? "—"}</td>
                  <td data-label="Téléphone">{c.phone}</td>
                  <td data-label="Date">
                    {new Date(c.started_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    •{" "}
                    {new Date(c.started_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td data-label="Durée">{c.duration_sec ?? 0}s</td>
                  <td data-label="Résultat" className={`result ${c.result}`}>{c.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
