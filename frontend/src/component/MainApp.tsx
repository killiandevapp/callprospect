// MainApp.tsx
import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import AddProspects from "./AddProspects";
import CallProspects from "./CallProspects";

type MainAppProps = {
  user?: { email?: string };
  logout?: () => void;
};

export default function MainApp({ user, logout }: MainAppProps) {
  const [hasProspects, setHasProspects] = useState<boolean | null>(null);
  const [showAddProspects, setShowAddProspects] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/prospects");
        const list = res.data.prospects || [];
        setHasProspects(list.length > 0);
      } catch (err) {
        console.error(err);
        setHasProspects(false);
      }
    })();
  }, []);

  const loading = hasProspects === null;

  return (
    <div style={{ padding: 24 }}>
      <p>Hello Main</p>
      {user && <p>User: {user.email}</p>}
      {logout && <button onClick={logout}>Déconnexion</button>}

      {loading && <p>Chargement...</p>}

      {/* Il reste des prospects à appeler */}
      {!loading && hasProspects === true && !showAddProspects && (
        <CallProspects />
      )}

      {/* Aucun prospect + écran "liste terminée" */}
      {!loading && hasProspects === false && !showAddProspects && (
        <div style={{ marginTop: 24 }}>
          <p>Vous avez terminé votre liste de prospects pour cette campagne 🎉</p>
          <p>Tu peux ajouter de nouveaux prospects pour continuer à appeler.</p>
          <button
            type="button"
            onClick={() => setShowAddProspects(true)}
            style={{ marginTop: 8 }}
          >
            Ajouter des prospects
          </button>
        </div>
      )}

      {/* Formulaire pour ajouter des prospects à la campagne existante */}
      {!loading && showAddProspects && <AddProspects />}
    </div>
  );
}
