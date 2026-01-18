// src/component/CallProspects.tsx
import { useEffect, useState } from "react";
import { api } from "../api/axios";
import ModalCall from "./modalCall";
import { useCallTimer } from "../hooks/useCallTimer";

// Représentation d’un prospect dans la campagne
type Prospect = {
  id: number;
  name: string;
  phone: string;
  notes?: string | null;
};

// Résultat possible d’un appel
type CallResult = "meeting" | "refused" | "no_answer" | "callback";

// Motif de refus (lié à la campagne)
type RefusalReason = {
  id: number;
  label: string;
};

// Boutons / actions proposés dans la modale d’appel
const CALL_ACTIONS: { label: string; result: CallResult }[] = [
  { label: "RDV ✅", result: "meeting" },
  { label: "Refus ❌", result: "refused" },
  { label: "Décroche pas", result: "no_answer" },
  { label: "À relancer", result: "callback" },
];

type Mode = "list" | "call";

// Payload envoyé à l’API pour sauvegarder un appel
type CallToSave = {
  prospectId: number;
  result: CallResult;
  durationSec: number;
};

export default function CallProspects() {
  // Liste des prospects à appeler
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Index du prospect actuellement en cours d’appel dans le tableau
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  // Mode d’affichage : liste simple ou écran d’appel
  const [mode, setMode] = useState<Mode>("list");

  // Hook dédié au timer d’appel (compteur de secondes)
  const { seconds, running, start, stop, reset } = useCallTimer();

  // Timestamp au démarrage de l’appel (pour calculer la durée précise)
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);

  // Appel refusé en attente de sélection d’un motif
  const [pendingCall, setPendingCall] = useState<CallToSave | null>(null);

  // Motifs de refus disponibles pour la campagne
  const [refusalReasons, setRefusalReasons] = useState<RefusalReason[]>([]);
  // Motif sélectionné par l’utilisateur dans la modale
  const [selectedRefusalReasonId, setSelectedRefusalReasonId] = useState<number | null>(null);

  // Prospect courant dérivé de currentIndex
  const currentProspect =
    currentIndex !== null &&
    currentIndex >= 0 &&
    currentIndex < prospects.length
      ? prospects[currentIndex]
      : null;

  // Chargement initial des prospects à partir de l’API
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/prospects");
        // Si l’API renvoie rien, on fallback sur un tableau vide
        setProspects(res.data.prospects || []);
      } catch (err) {
        setError("Impossible de charger les prospects.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Effet qui gère l’enregistrement des appels refusés,
  // une fois que le motif de refus est choisi
  useEffect(() => {
    if (!pendingCall) return;
    // On gère ici uniquement le cas refus, les autres sont traités dans callResult
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

          // On enleve le prospect actuel de la liste
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
        // Reset global de l’UI après traitement
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

  // Démarrage d’un appel sur un prospect donné
  const startCall = (index: number) => {
    // Sécurité si l’index est hors limites
    if (index < 0 || index >= prospects.length) return;

    const p = prospects[index];

    // On met à jour l’index courant, lance le timer, et passe en mode call
    setCurrentIndex(index);
    start();
    setCallStartedAt(Date.now());
    setMode("call");

    // Déclenche l’appel natif du téléphone
    window.location.href = `tel:${p.phone}`;
  };

  // Fermeture de la modale d’appel (sans sauvegarde spécifique)
  const closeModal = () => {
    setMode("list");
    stop();
    reset();
    setCurrentIndex(null);
    setCallStartedAt(null);
    setRefusalReasons([]);
  };

  // Gestion du clic sur un résultat d’appel (RDV, refus, pas de réponse, à relancer)
  const callResult = (result: CallResult) => {
    if (!currentProspect || currentIndex === null) return;

    stop();

    // Calcul de la durée de l’appel, soit avec callStartedAt, soit via le hook
    const durationSec =
      callStartedAt !== null
        ? Math.round((Date.now() - callStartedAt) / 1000)
        : seconds;

    const payload: CallToSave = {
      prospectId: currentProspect.id,
      result,
      durationSec,
    };

    // Cas particulier : refus → on doit d’abord récupérer les motifs
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

      // On sort, l’enregistrement final se fera dans le useEffect
      return;
    }

    // Les autres cas sont pour l’instant juste logués en console
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

    // Mise à jour de la liste (enlever ou réinsérer le prospect)
    setProspects((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(currentIndex, 1);

      // Si pas de réponse, on le remet au milieu de la file
      if (result === "no_answer") {
        const mid = Math.floor(copy.length / 2);
        copy.splice(mid, 0, removed);
      }

      return copy;
    });

    // Reset de l’UI après traitement
    setMode("list");
    reset();
    setCurrentIndex(null);
    setCallStartedAt(null);
    setRefusalReasons([]);
  };

  // Données passées à la modale d’appel
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

      {/* État de chargement global */}
      {loading && <p>Chargement...</p>}
      {/* Affichage d’erreur si l’appel API a échoué */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Cas où il n’y a tout simplement aucun prospect à traiter */}
      {!loading && !error && prospects.length === 0 && <p>Aucun prospect.</p>}

      {/* Liste des prospects avec bouton pour démarrer un appel */}
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

      {/* Modale d’appel, affichée uniquement en mode "call" */}
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
