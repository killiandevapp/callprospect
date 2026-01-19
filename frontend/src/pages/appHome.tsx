// AppHome.tsx
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

  const showCreate = hasCampaign === false; // user n’a jamais de campagne
  const showMain = hasCampaign === true;    // au moins une campagne existe

  return (
    <div>
      {showCreate && <CreateCampaign />}
      {showMain && <MainApp user={user} logout={logout} />}
      {hasCampaign === null && <div>Chargement...</div>}
    </div>
  );
}
