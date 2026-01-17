import React from "react";
import { formatSecondsToMMSS } from "../utils/utils";

type CallResult = "meeting" | "refused" | "no_answer" | "callback";

type RefusalReason = {
    id: number;
    label: string;
};



type ElementsTxt = {
    title: string;
    name?: string;
    phone?: string;
    notes?: string | null;
    seconds?: number;
    running?: boolean;
    actions?: { label: string; result: CallResult }[];
    reasons?: RefusalReason[]; // (si ce n’est pas encore là, ajoute-le)
};



type ModalProps = {
    mode: "list" | "call";
    elementsTxt: ElementsTxt;
    onClose: () => void;
    onActionClick?: (result: CallResult) => void;
    onSelectReason?: (id: number) => void;   // 🔹 nouveau
};


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

                {mode === "call" && (
                    <>
                        {name && phone && (
                            <p>
                                <strong>{name}</strong> — {phone}
                            </p>
                        )}

                        {notes && <p>Notes : {notes}</p>}

                        {typeof seconds === "number" && (
                            <p style={{ marginTop: 12 }}>
                                Temps : {formatSecondsToMMSS(seconds)}{" "}
                                {running ? "" : "(en pause)"}
                            </p>
                        )}

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

                {elementsTxt.reasons && elementsTxt.reasons.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                        <p style={{ marginBottom: 8 }}>Motif du refus :</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {elementsTxt.reasons.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => {
                                        if (onSelectReason) {
                                            onSelectReason(r.id);          // 🔹 on remonte l’ID au parent
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
