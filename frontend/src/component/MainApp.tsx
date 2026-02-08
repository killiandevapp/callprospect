// MainApp.tsx
import React, { use, useEffect, useState } from "react";
import { api } from "../api/axios";
import AddProspects from "./AddProspects";
import CallProspects from "./CallProspects";
import '../style/mainApp.css'

type MainAppProps = {
  user?: { email?: string };
  logout?: () => void;
};

export default function MainApp({ user, logout }: MainAppProps) {
  const [hasProspects, setHasProspects] = useState<boolean | null>(null);
  const [showAddProspects, setShowAddProspects] = useState(false);
  const [triggerAddCall, setTriggerAddCall] = useState(false);
 useEffect(()=> {
   console.log(triggerAddCall);
   triggerAddCall === true ? setShowAddProspects(true) : null;
    
 }, [triggerAddCall])

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
      {loading && <p>Chargement...</p>}

      {/* Il reste des prospects à appeler */}
      {!loading && hasProspects === true && !showAddProspects && (
        <CallProspects  triggerAddCall={triggerAddCall} onToggleCall={setTriggerAddCall}/>
      )}

      {/* Aucun prospect + écran "liste terminée" */}
      {!loading && hasProspects === false && !showAddProspects && (
        <div className="sctEndProspects">
          <p className="sctEndProspects__title">
            Vous avez terminé votre liste de prospects pour cette campagne 🎉
          </p>

          <p className="sctEndProspects__text">
            Tu peux ajouter de nouveaux prospects pour continuer à appeler.
          </p>

          <button
            type="button"
            className="sctEndProspects__btn"
            onClick={() => setShowAddProspects(true)}
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
