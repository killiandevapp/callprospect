// src/component/CallProspects.tsx
import { useEffect, useState } from "react";
import { api } from "../api/axios";
import ModalCall from "./modalCall";
import { useCallTimer } from "../hooks/useCallTimer";

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
  { label: "RDV ✅", result: "meeting" },
  { label: "Refus ❌", result: "refused" },
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


  const [pendingCall, setPendingCall] = useState<CallToSave | null>(null);

  const [refusalReasons, setRefusalReasons] = useState<RefusalReason[]>([]);
  const [selectedRefusalReasonId, setSelectedRefusalReasonId] = useState<number | null>(null);


  const currentProspect =
    currentIndex !== null &&
      currentIndex >= 0 &&
      currentIndex < prospects.length
      ? prospects[currentIndex]
      : null;

  // Load prospects
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




  useEffect(() => {
    // Pas d’appel en attente → rien à faire
    if (!pendingCall) return;

    // On gere ici uniquement le cas refus
    if (pendingCall.result !== "refused") return;

    // Si aucun motif encore choisi → on attend
    if (!selectedRefusalReasonId) return;

    console.log("➡ Envoi en BDD de l’appel refusé", {
      pendingCall,
      selectedRefusalReasonId,
    });

    (async () => {
      try {
        await api.post("/calls", {
          ...pendingCall,
          refusalReasonId: selectedRefusalReasonId, 
        });

        // Mise à jour de la liste (comme dans callResult)
        setProspects((prev) => {
          const copy = [...prev];
          const index = prev.findIndex((p) => p.id === pendingCall.prospectId);
          if (index === -1) return copy;

          const [removed] = copy.splice(index, 1);

          if (pendingCall.result === "no_answer") {
            const mid = Math.floor(copy.length / 2);
            copy.splice(mid, 0, removed);
          }

          return copy;
        });
      } catch (err) {
        console.error("Erreur lors de l’enregistrement de l’appel refusé :", err);
      } finally {
        // reset global UI
        setMode("list");
        reset();
        setCurrentIndex(null);
        setCallStartedAt(null);
        setRefusalReasons([]);
        setSelectedRefusalReasonId(null);
        setPendingCall(null);
      }
    })();
  }, [pendingCall, selectedRefusalReasonId]);


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
    setMode("list");
    stop();
    reset();
    setCurrentIndex(null);
    setCallStartedAt(null);
    setRefusalReasons([]);
  };

  const callResult = (result: CallResult) => {
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


      (async () => {
        try {
          const res = await api.get("/campaign/refusal-reasons");
          // res.data = { campaignId, reasons: [...] }
          setRefusalReasons(res.data.reasons || []);
          setPendingCall(payload);

          console.log("Motifs de refus chargés :", res.data);
        } catch (err) {
          console.log("erreur motifs de refus :", err);
        }
      })();


      return;
    }

    if (result === "meeting") {
      console.log("RDV -> plus tard: demander une date de rendez-vous", payload);
    } else if (result === "no_answer") {
      console.log(
        "Décroche pas -> garder en BDD et remettre dans la file",
        payload
      );
    } else if (result === "callback") {
      console.log("A relancer -> marquer en BDD pour une relance", payload);
    }

    // remove or requeue
    setProspects((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(currentIndex, 1);
      if (result === "no_answer") {
        const mid = Math.floor(copy.length / 2);
        copy.splice(mid, 0, removed);
      }
      return copy;
    });

    setMode("list");
    reset();
    setCurrentIndex(null);
    setCallStartedAt(null);
    setRefusalReasons([]);
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
      <h2>Prospects à appeler</h2>

      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && prospects.length === 0 && <p>Aucun prospect.</p>}

      {!loading && !error && prospects.length > 0 && (
        <ul>
          {prospects.map((p, idx) => (
            <li key={p.id}>
              <strong>{p.name}</strong> — {p.phone}
              {p.notes && <span> — {p.notes}</span>}
              <button style={{ marginLeft: 8 }} onClick={() => startCall(idx)}>
                Appeler
              </button>
            </li>
          ))}
        </ul>
      )}

      {mode === "call" && elementTxt && (
        <ModalCall
          mode={mode}
          elementsTxt={elementTxt}
          onClose={closeModal}
          onActionClick={callResult}
          onSelectReason={setSelectedRefusalReasonId}
        />
      )}
    </div>
  );
}
