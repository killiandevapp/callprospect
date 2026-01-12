import { useEffect, useState } from "react";
import { api } from "../api/axios";

type Prospect = {
  id: number;
  name: string;
  phone: string;
  notes?: string | null;
};

type CallResult = "meeting" | "refused" | "no_answer" | "callback";

export default function CallProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // appel en cours
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);

  type Mode = "list" | "call";
  const [mode, setMode] = useState<Mode>("list");

  const currentProspect =
    currentIndex !== null && currentIndex >= 0 && currentIndex < prospects.length
      ? prospects[currentIndex]
      : null;

  // Charger les prospects depuis l'API
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/prospects");
        setProspects(res.data.prospects || []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les prospects.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  //  Gestion du chrono
  useEffect(() => {
    if (!timerRunning) return;

    const id = window.setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [timerRunning]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 3️⃣ Lancer l'appel : tel: + démarrer le chrono
  const startCall = (index: number) => {
    if (index < 0 || index >= prospects.length) return;

    const p = prospects[index];

    setCurrentIndex(index);
    setTimer(0);
    setTimerRunning(true);
    setCallStartedAt(Date.now());
    setMode("call");

    // Lance l'appli téléphone (mobile) ou propose un softphone (desktop)
    window.location.href = `tel:${p.phone}`;
  };


// Terminer l'appel avec un résultat
const callResult = (result: CallResult) => {
  if (!currentProspect || currentIndex === null) return;

  setTimerRunning(false);

  const durationSec =
    callStartedAt !== null
      ? Math.round((Date.now() - callStartedAt) / 1000)
      : timer;

  // payload commun pour la BDD
  const payload = {
    prospectId: currentProspect.id,
    result,      // "meeting" | "refused" | "no_answer" | "callback"
    durationSec, // à envoyer en BDD
    // plus tard : refusalReasonId, meetingDate, note...
  };

  //  Ici on met la logique différente selon le résultat
  if (result === "refused") {
    // TODO: afficher l’écran avec la liste des motifs de refus
    // (Pas le temps, Déjà équipé, Trop cher...)
    console.log("Refus -> plus tard: demander un motif de refus", payload);
  } else if (result === "meeting") {
    // TODO: afficher un petit formulaire pour choisir la date/heure de RDV
    console.log("RDV -> plus tard: demander une date de rendez-vous", payload);
  } else if (result === "no_answer") {
    // TODO: on garde une trace en BDD mais on remet le prospect dans la liste
    console.log("Décroche pas -> garder en BDD et remettre dans la file", payload);
  } else if (result === "callback") {
    // TODO: marquer "à relancer" en BDD (prochaine relance, etc.)
    console.log("À relancer -> marquer en BDD pour une relance", payload);
  }

  // Gestion de la liste de prospects côté front
  setProspects((prev) => {
    const copy = [...prev];
    const [removed] = copy.splice(currentIndex, 1);

    if (result === "no_answer") {
      // Si la personne ne répond pas → on le remet au milieu de la liste
      const middleIndex = Math.floor(copy.length / 2);
      copy.splice(middleIndex, 0, removed);
    }
    // Pour RDV / Refus / À relancer → on ne le remet pas dans la liste
    return copy;
  });

  // reset de l'état UI (on reviendra plus tard pour les écrans RDV/refus)
  setMode("list");
  setCurrentIndex(null);
  setTimer(0);
  setCallStartedAt(null);
};



  // RENDER

  if (mode === "call" && currentProspect) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Appel en cours</h2>
        <p>
          <strong>{currentProspect.name}</strong> — {currentProspect.phone}
        </p>
        {currentProspect.notes && <p>Notes : {currentProspect.notes}</p>}

        <p>Temps : {formatTime(timer)}</p>

        <div style={{ marginTop: 16 }}>
          <button onClick={() => callResult("meeting")}>RDV ✅</button>
          <button onClick={() => callResult("refused")} style={{ marginLeft: 8 }}>
            Refus ❌
          </button>
          <button onClick={() => callResult("no_answer")} style={{ marginLeft: 8 }}>
            Décroche pas
          </button>
          <button onClick={() => callResult("callback")} style={{ marginLeft: 8 }}>
            À relancer
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => {
              // annuler et revenir à la liste
              setMode("list");
              setTimerRunning(false);
              setCurrentIndex(null);
              setTimer(0);
              setCallStartedAt(null);
            }}
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  // mode "liste"
  return (
    <div style={{ padding: 24 }}>
      <h2>Prospects à appeler</h2>

      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && prospects.length === 0 && (
        <p>Aucun prospect pour cette campagne.</p>
      )}

      {!loading && !error && prospects.length > 0 && (
        <>
          <p>
            {prospects.length} prospect
            {prospects.length > 1 ? "s" : ""} à traiter.
          </p>
          <ul>
            {prospects.map((p, idx) => (
              <li key={p.id} style={{ marginBottom: 8 }}>
                <strong>{p.name}</strong> — {p.phone}
                {p.notes && <span> — {p.notes}</span>}
                <button style={{ marginLeft: 12 }} onClick={() => startCall(idx)}>
                  Appeler
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
