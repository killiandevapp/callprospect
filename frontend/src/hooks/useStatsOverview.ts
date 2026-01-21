import { useEffect, useState } from "react";
import { fetchStatsOverview, type StatsOverview } from "../api/stats";

export function useStatsOverview() {
  const [data, setData] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const stats = await fetchStatsOverview();
        if (!mounted) return;
        setData(stats);
      } catch (e) {
        if (!mounted) return;
        setError("Impossible de charger les statistiques.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
