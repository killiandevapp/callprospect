import { useState, FormEvent } from "react";
import { api } from "../api/axios";

export default function CreateCampaign() {
  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formCompaign = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError("Le nom est obligatoire");
      return;
    }

    try {
      setLoading(true);
      await api.post("/campaign", {
        name: name.trim(),
        source: source.trim() || undefined,
      });

      setSuccess(true);
      setName("");
      setSource("");

      // simple : on recharge la page pour que AppHome re-vérifie les campagnes
      window.location.reload();
    } catch (err) {
      setError("Erreur lors de la création de la campagne");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Créer une campagne</h2>

      <form onSubmit={formCompaign}>
        <div style={{ marginBottom: 12 }}>
          <label>
            Nom de la campagne<br />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Serruriers Gap"
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            Source (optionnel)<br />
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Google Maps, PagesJaunes..."
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer la campagne"}
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
      {success && (
        <p style={{ color: "green", marginTop: 8 }}>
          Campagne créée avec succès.
        </p>
      )}
    </div>
  );
}
