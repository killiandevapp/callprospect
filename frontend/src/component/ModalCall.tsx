import React from "react";
import { formatSecondsToMMSS } from "../utils/utils";

// Types métier pour les résultats d’appel (doivent rester syncro avec le back)
type CallResult = "meeting" | "refused" | "no_answer" | "callback";

// Motif de refus récupéré depuis l’API de campagne
type RefusalReason = {
    id: number;
    label: string;
};

// Texte / data affichés dans la modale
type ElementsTxt = {
    title: string;
    name?: string;
    phone?: string;
    notes?: string | null;
    seconds?: number;
    running?: boolean;
    actions?: { label: string; result: CallResult }[];
    reasons?: RefusalReason[]; // Liste des motifs de refus possibles
};

// Props de la modale d’appel
type ModalProps = {
    mode: "list" | "call";
    elementsTxt: ElementsTxt;
    onClose: () => void;
    onActionClick?: (result: CallResult) => void;
    onSelectReason?: (id: number) => void; // callback vers le parent quand on choisi un motif
};

// Modale générique pour gérer un appel (infos + boutons + motifs de refus)
export default function ModalCall({
    mode,
    elementsTxt,
    onClose,
    onActionClick,
    onSelectReason,
}: ModalProps) {
    const { title, name, phone, notes, seconds, running, actions } = elementsTxt;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    background: "#fff",
                    minWidth: 320,
                    maxWidth: 480,
                    padding: 24,
                    borderRadius: 12,
                    boxShadow: "0 12px 40px rgba(15,23,42,0.25)",
                }}
            >
                {/* Header de la modale : titre + bouton de fermeture */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 12,
                    }}
                >
                    <h3 style={{ margin: 0 }}>{title}</h3>
                    <button onClick={onClose}>×</button>
                </div>

                {/* Contenu spécifique au mode "call" */}
                {mode === "call" && (
                    <>
                        {/* Infos basiques sur le prospect */}
                        {name && phone && (
                            <p>
                                <strong>{name}</strong> — {phone}
                            </p>
                        )}

                        {/* Notes éventuelles liées au prospect */}
                        {notes && <p>Notes : {notes}</p>}

                        {/* Timer d’appel formaté mm:ss */}
                        {typeof seconds === "number" && (
                            <p style={{ marginTop: 12 }}>
                                Temps : {formatSecondsToMMSS(seconds)}{" "}
                                {running ? "" : "(en pause)"}
                            </p>
                        )}

                        {/* Boutons d’actions (RDV, refus, etc.) */}
                        {actions && (
                            <div style={{ marginTop: 16 }}>
                                {actions.map((action, index) => (
                                    <button
                                        key={action.result}
                                        onClick={() => onActionClick?.(action.result)}
                                        style={index > 0 ? { marginLeft: 8 } : undefined}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Bloc pour choisir un motif de refus quand l’API en renvoie */}
                {elementsTxt.reasons && elementsTxt.reasons.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                        <p style={{ marginBottom: 8 }}>Motif du refus :</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {elementsTxt.reasons.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => {
                                        // On remonte seulement l’ID, la logique sera géré au parent
                                        if (onSelectReason) {
                                            onSelectReason(r.id);
                                        }
                                    }}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 999,
                                        border: "1px solid #e5e7eb",
                                        background: "#f9fafb",
                                        fontSize: 13,
                                        cursor: "pointer",
                                    }}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
