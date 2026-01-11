import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import CreateCampaign from "../component/CreateCampaign";
import MainApp from "../component/MainApp";

export default function AppHome() {
  const { user, logout } = useAuth();
  const [hasCampaign, setHasCampaign] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/campaign");
        const campaigns = res.data.campaigns || [];
        setHasCampaign(campaigns.length > 0);
      } catch (e) {
        setHasCampaign(false);
      }
    })();
  }, []);

  // === logique ici ===
  const showCreate = hasCampaign === false;
  const showMain = hasCampaign === true;

  // === UN seul return ===
  return (
    <div>
      {showCreate && <CreateCampaign />}
      {showMain && <MainApp user={user} logout={logout} />}
      {hasCampaign === null && <div>Chargement...</div>}
    </div>
  );
}
