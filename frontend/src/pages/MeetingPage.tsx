import { useEffect, useState } from "react";
import { api } from "../api/axios";
import "../style/meeting.css"


type Meeting = {
  id: number;
  meeting_at: string;
  status: string;
  location: string | null;
  notes: string | null;
  prospect_name: string | null;
  prospect_phone: string | null;
  campaign_name: string | null;
};

export default function MeetingPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

useEffect(() => {
  (async () => {
    try {
      const res = await api.get("/meeting");
      // sécurisation : res.data doit être un tableau
      setMeetings(Array.isArray(res.data) ? res.data : res.data.meetings || []);
    } catch (e) {
      setError("Impossible de récupérer les rendez-vous");
    } finally {
      setLoading(false);
    }
  })();
}, []);

  console.log(meetings);
  
  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <p>Chargement des rendez-vous...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (meetings.length === 0) return <p>Aucun rendez-vous prévu.</p>;

  return (
    <div className="meetingListContainer">
      <h2>Rendez-vous à venir</h2>
      <ul className="meetingList">
        {meetings && meetings.map((m) => (
          <li key={m.id} className="meetingItem">
            <div
              className="meetingHeader"
              onClick={() => toggleExpand(m.id)}
            >
              <span className="prospectName">{m.prospect_name}</span>
              <span className="meetingDate">
                {new Date(m.meeting_at).toLocaleString()}
              </span>
            </div>

            {expandedId === m.id && (
              <div className="meetingDetails">
                <p><b>Statut :</b> {m.status}</p>
                {m.location && <p><b>Lieu :</b> {m.location}</p>}
                {m.notes && <p><b>Notes :</b> {m.notes}</p>}
                {m.campaign_name && <p><b>Campagne :</b> {m.campaign_name}</p>}
                {m.prospect_phone && <p><b>Téléphone :</b> {m.prospect_phone}</p>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
