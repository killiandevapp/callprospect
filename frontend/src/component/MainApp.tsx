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

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/prospects"); // à adapter plus tard (par campagne)
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

      {!loading && hasProspects === false && <AddProspects />}

      {!loading && hasProspects === true && <CallProspects />}
    </div>
  );
}
