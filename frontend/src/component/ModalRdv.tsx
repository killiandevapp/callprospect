// src/component/ModalRdv.tsx
import React, { useState } from "react";

type ProspectLite = {
  id: number;
  name: string;
  phone: string;
  notes?: string | null;
};

type ModalRdvProps = {
  open: boolean;
  prospect: ProspectLite | null;
  onClose: () => void;
  onSave: (meetingAt: string, note: string | null) => void;
};

export default function ModalRdv({
  open,
  prospect,
  onClose,
  onSave,
}: ModalRdvProps) {
  const [meetingAt, setMeetingAt] = useState("");
  const [note, setNote] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (!meetingAt) return;
    onSave(meetingAt, note.trim() || null);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
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
          <h3 style={{ margin: 0 }}>Planifier le rendez-vous</h3>
          <button onClick={onClose}>×</button>
        </div>

        {prospect && (
          <p style={{ marginBottom: 12 }}>
            <strong>{prospect.name}</strong> — {prospect.phone}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 14 }}>
            Date et heure :
            <input
              type="datetime-local"
              value={meetingAt}
              onChange={(e) => setMeetingAt(e.target.value)}
              style={{ display: "block", marginTop: 4, width: "100%" }}
            />
          </label>

          <label style={{ fontSize: 14 }}>
            Note (optionel) :
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ display: "block", marginTop: 4, width: "100%" }}
            />
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            style={{ marginTop: 8 }}
          >
            Enregistrer le RDV
          </button>
        </div>
      </div>
    </div>
  );
}
