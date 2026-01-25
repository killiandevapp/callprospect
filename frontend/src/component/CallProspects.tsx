// src/component/CallProspects.tsx
import { useEffect, useState } from "react";
import { api } from "../api/axios";
import ModalCall from "./ModalCall";
import ModalRdv from "./ModalRdv";
import { useCallTimer } from "../hooks/useCallTimer";
import "../style/prospectsList.css"

type Prospect = {
  id: number;
  name: string;
  phone: string;
  notes?: string | null;
};

type CallResult = "meeting" | "refused" | "no_answer" | "callback";

type RefusalReason = {
  id: number;
  label: string;
};

const CALL_ACTIONS: { label: string; result: CallResult }[] = [
  { label: "RDV", result: "meeting" },
  { label: "Refus", result: "refused" },
  { label: "Décroche pas", result: "no_answer" },
  { label: "À relancer", result: "callback" },
];

type Mode = "list" | "call";

type CallToSave = {
  prospectId: number;
  result: CallResult;
  durationSec: number;
};

export default function CallProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("list");

  const { seconds, running, start, stop, reset } = useCallTimer();
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);

  const [refusalReasons, setRefusalReasons] = useState<RefusalReason[]>([]);
  const [selectedRefusalReasonId, setSelectedRefusalReasonId] =
    useState<number | null>(null);

  // appels en cours de traitement
  const [refusalCall, setRefusalCall] = useState<CallToSave | null>(null);
  const [meetingCall, setMeetingCall] = useState<CallToSave | null>(null);

  const [showRdvModal, setShowRdvModal] = useState(false);

  const currentProspect =
    currentIndex !== null &&
      currentIndex >= 0 &&
      currentIndex < prospects.length
      ? prospects[currentIndex]
      : null;

  const rdvProspect =
    meetingCall != null
      ? prospects.find((p) => p.id === meetingCall.prospectId) || null
      : null;

  const resetCallState = () => {
    setMode("list");
    reset();
    setCurrentIndex(null);
    setCallStartedAt(null);
    setRefusalReasons([]);
    setSelectedRefusalReasonId(null);
    setRefusalCall(null);
    setMeetingCall(null);
    setShowRdvModal(false);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/prospects");
        setProspects(res.data.prospects || []);
      } catch (err) {
        setError("Impossible de charger les prospects.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // enregistrement d’un refus une fois le motif choisi
  useEffect(() => {
    if (!refusalCall) return;
    if (!selectedRefusalReasonId) return;

    (async () => {
      try {
        await api.post("/calls", {
          ...refusalCall,
          refusalReasonId: selectedRefusalReasonId,
        });

        setProspects((prev) => {
          const copy = [...prev];
          const index = copy.findIndex(
            (p) => p.id === refusalCall.prospectId
          );
          if (index !== -1) {
            copy.splice(index, 1);
          }
          return copy;
        });
      } catch (err) {
        console.error("Erreur enregistrement refus :", err);
      } finally {
        resetCallState();
      }
    })();
  }, [refusalCall, selectedRefusalReasonId]);

  const startCall = (index: number) => {
    if (index < 0 || index >= prospects.length) return;
    const p = prospects[index];

    setCurrentIndex(index);
    start();
    setCallStartedAt(Date.now());
    setMode("call");

    window.location.href = `tel:${p.phone}`;
  };

  const closeModal = () => {
    stop();
    resetCallState();
  };

  const sendSimpleCall = async (payload: CallToSave) => {
    try {
      await api.post("/calls", payload);
    } catch (err) {
      console.error("Erreur enregistrement appel :", err);
    }
  };

  const updateListAfterResult = (result: CallResult, index: number) => {
    setProspects((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);

      if (result === "no_answer") {
        const mid = Math.floor(copy.length / 2);
        copy.splice(mid, 0, removed);
      }

      return copy;
    });
  };

  const callResult = async (result: CallResult) => {
    if (!currentProspect || currentIndex === null) return;

    stop();

    const durationSec =
      callStartedAt !== null
        ? Math.round((Date.now() - callStartedAt) / 1000)
        : seconds;

    const payload: CallToSave = {
      prospectId: currentProspect.id,
      result,
      durationSec,
    };

    if (result === "refused") {
      try {
        const res = await api.get("/campaign/refusal-reasons");
        setRefusalReasons(res.data.reasons || []);
        setRefusalCall(payload);
      } catch (err) {
        console.error("Erreur chargement motifs refus :", err);
      }
      return;
    }

    if (result === "meeting") {
      setMeetingCall(payload);
      setMode("list");
      setShowRdvModal(true);
      return;
    }

    if (result === "no_answer") {

      try {
        await api.post("/calls", payload);
        setProspects((prev) => {
          const copy = [...prev];
          const [removed] = copy.splice(currentIndex, 1);
          const mid = Math.floor(copy.length / 2);
          copy.splice(mid, 0, removed);
          return copy;
        });
      } catch (err) {
        console.error("Erreur chargement motifs refus :", err);
      } finally {
        resetCallState();
      }
      return;


    }

    if (result === "callback") {
      try {
        await api.post("/calls", payload);
        // ici tu enlèves ou pas le prospect de la liste, selon ce que tu veux
        setProspects((prev) => {
          const copy = [...prev];
          copy.splice(currentIndex, 1);
          return copy;
        });
      } catch (err) {
        console.error("Erreur chargement motifs refus :", err);
      } finally {
        resetCallState();
      }
      return;

    }
  };

  const saveRdv = async (meetingAt: string, note: string | null) => {
    if (!meetingCall) return;

    try {
      await api.post("/calls", {
        prospectId: meetingCall.prospectId,
        result: "meeting",
        durationSec: meetingCall.durationSec,
        meetingAt,
        meetingLocation: null,
        meetingNotes: note,
      });

      setProspects((prev) => {
        const copy = [...prev];
        const index = copy.findIndex(
          (p) => p.id === meetingCall.prospectId
        );
        if (index !== -1) {
          copy.splice(index, 1);
        }
        return copy;
      });
    } catch (err) {
      console.error("Erreur enregistrement RDV :", err);
    } finally {
      resetCallState();
    }
  };

  const closeRdvModal = () => {
    setShowRdvModal(false);
    setMeetingCall(null);
  };

  const elementTxt =
    mode === "call" && currentProspect
      ? {
        title: "Appel en cours",
        name: currentProspect.name,
        phone: currentProspect.phone,
        notes: currentProspect.notes ?? null,
        seconds,
        running,
        actions: CALL_ACTIONS,
        reasons: refusalReasons,
      }
      : null;

  return (
    <div style={{ padding: 24 }}>
      <div className="prospectsContainer">
        <div className="prospectCtnTitleList">
          <h2>Prospects à appeler</h2>
          <button>Ajouter prospects</button>
        </div>


        {loading && <p className="prospectsStatus">Chargement...</p>}
        {error && <p className="prospectsError">{error}</p>}
        {!loading && !error && prospects.length === 0 && (
          <p className="prospectsStatus">Aucun prospect.</p>
        )}

        {!loading && !error && prospects.length > 0 && (
          <ul className="prospectsList">
            {prospects.map((p, idx) => (
              <li key={p.id} className="prospectItem">
                <div className="prospectInfo">
                  <span className="prospectName">{p.name}</span> —{" "}
                  <span className="prospectPhone">{p.phone}</span>
                  {p.notes && <span className="prospectNotes"> — {p.notes}</span>}
                </div>
                <button
                  className="prospectCallButton"
                  onClick={() => startCall(idx)}
                >
                  Appeler
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {mode === "call" && elementTxt && (
        <ModalCall
          mode={mode}
          elementsTxt={elementTxt}
          onClose={closeModal}
          onActionClick={callResult}
          onSelectReason={setSelectedRefusalReasonId}
        />
      )}

      {showRdvModal && meetingCall && (
        <ModalRdv
          open={showRdvModal}
          onClose={closeRdvModal}
          onSave={saveRdv}
          prospect={rdvProspect}
        />
      )}
    </div>
  );
}
