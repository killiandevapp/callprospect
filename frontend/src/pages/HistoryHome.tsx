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
  <div className="px-4 sm:px-8 lg:px-16 py-8 space-y-6">
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
      Historique des appels
    </h2>

    {/* 🔍 Recherche */}
    <input
      className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Rechercher nom ou téléphone"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />

    {/* 🎯 Filtres */}
    <div className="flex flex-wrap gap-3">
      {[
        ["", "Tous"],
        ["meeting", "RDV"],
        ["refused", "Refus"],
        ["callback", "À rappeler"],
        ["no_answer", "Pas de réponse"],
      ].map(([value, label]) => (
        <button
          key={value}
          onClick={() => setFilterResult(value)}
          className={`px-4 py-2 text-sm rounded-full border transition
            ${
              filterResult === value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:bg-slate-100 border-slate-200"
            }`}
        >
          {label}
        </button>
      ))}
    </div>

    {loading && <p className="text-slate-500">Chargement…</p>}
    {error && <p className="text-red-500">{error}</p>}

    {!loading && !error && (
      <>
        {/* 📱 Mobile : cards */}
        <div className="space-y-4 lg:hidden">
          {displayedHistory.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow p-4 space-y-2"
            >
              <div className="font-medium">
                {c.prospect_name ?? "—"}
              </div>

              <div className="text-sm text-slate-600">
                📞 {c.phone}
              </div>

              <div className="text-sm text-slate-600">
                🕒{" "}
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
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm">
                  Durée : {c.duration_sec ?? 0}s
                </span>
                <ResultBadge result={c.result} />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop : table */}
        <div className="hidden lg:block overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("name")}>Nom</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("phone")}>Téléphone</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("date")}>Date</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("duration")}>Durée</th>
                <th className="px-4 py-3 text-left">Résultat</th>
              </tr>
            </thead>
            <tbody>
              {displayedHistory.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">{c.prospect_name ?? "—"}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3">
                    {new Date(c.started_at).toLocaleDateString("fr-FR")} •{" "}
                    {new Date(c.started_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">{c.duration_sec ?? 0}s</td>
                  <td className="px-4 py-3">
                    <ResultBadge result={c.result} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}
  </div>
);


}


function ResultBadge({ result }: { result: string }) {
  const map: Record<string, string> = {
    meeting: "bg-green-100 text-green-700",
    refused: "bg-red-100 text-red-700",
    callback: "bg-yellow-100 text-yellow-700",
    no_answer: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full ${
        map[result] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {result}
    </span>
  );
}
