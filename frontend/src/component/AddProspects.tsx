import { useState, ChangeEvent } from "react";
import { api } from "../api/axios";
type Mode = "manual" | "file";

type ManualProspect = {
    id: number;
    name: string;
    phone: string;
    notes: string;
};

export default function AddProspects() {
    const [callResults] = useState<string[]>([
        "RDV",
        "Refus",
        "Décroche pas",
        "À relancer",
    ]);
    const [loadingNext, setLoadingNext] = useState(false);
    const [errorNext, setErrorNext] = useState<string | null>(null);


    const [refusalInput, setRefusalInput] = useState<string>("");
    const [refusalReasons, setRefusalReasons] = useState<string[]>([
        "Pas les fonds",
        "Pas le temps",
        "Déjà équipé",
        "Trop chère",
        "Pas intéressé",
    ]);

    const [source, setSource] = useState<string>("");

    const [mode, setMode] = useState<Mode>("file");

    const [file, setFile] = useState<File | null>(null);
    const [csvCount, setCsvCount] = useState<number | null>(null);

    const [manualName, setManualName] = useState<string>("");
    const [manualPhone, setManualPhone] = useState<string>("");
    const [manualNotes, setManualNotes] = useState<string>("");
    const [manualProspects, setManualProspects] = useState<ManualProspect[]>([]);

    const refusalChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRefusalInput(e.target.value);
    };

    const sourceChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSource(e.target.value);
    };

    const addRefusal = () => {
        const v = refusalInput.trim();
        if (!v || refusalReasons.includes(v)) return;
        setRefusalReasons([...refusalReasons, v]);
        setRefusalInput("");
    };

    const removeRefusal = (label: string) => {
        setRefusalReasons(refusalReasons.filter((r) => r !== label));
    };

    const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        setFile(f);
        setCsvCount(null);

        if (!f) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) {
                setCsvCount(0);
                return;
            }

            const lines = text
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter((l) => l.length > 0);

            setCsvCount(lines.length);
        };
        reader.readAsText(f);
    };

    const handleManualAdd = () => {
        const name = manualName.trim();
        const phone = manualPhone.trim();

        if (!name || !phone) return;

        setManualProspects((prev) => [
            ...prev,
            {
                id: Date.now(),
                name,
                phone,
                notes: manualNotes.trim(),
            },
        ]);

        setManualName("");
        setManualPhone("");
        setManualNotes("");
    };

    const handleNext = async () => {
        const cleanedRefusals = refusalReasons
            .map((r) => r.trim())
            .filter((r) => r.length > 0);

        if (cleanedRefusals.length === 0) {
            alert("Ajoute au moins un motif de refus.");
            return;
        }

        try {
            await api.post("/campaign/setup", {
                source: source.trim() || null,
                refusalReasons: cleanedRefusals,
                manualProspects, // ⬅️ très important : on envoie les prospects manuels
            });

            alert("Campagne configurée et prospects enregistrés.");
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'enregistrement.");
        }
    };



    return (
        <div style={{ padding: 24 }}>
            <h1>Vous revoilà !</h1>
            <p>Configurez votre campagne avant de commencer à appeler.</p>

            {/* 1️⃣ Résultat d'un appel */}
            <section style={{ marginTop: 24 }}>
                <h2>Définir le résultat d&apos;un appel</h2>
                <p>Les statuts utilisés pendant la prospection :</p>
                <ul>
                    {callResults.map((r) => (
                        <li key={r}>{r}</li>
                    ))}
                </ul>
            </section>

            {/* 2️⃣ Motifs de refus */}
            <section style={{ marginTop: 24 }}>
                <h2>Définir les motifs de refus</h2>
                <p>
                    Quand tu choisiras &quot;Refus&quot; pendant un appel, tu devras
                    choisir un motif parmi cette liste.
                </p>

                <input
                    placeholder="Ex : Client énervé"
                    value={refusalInput}
                    onChange={refusalChange}
                />
                <button onClick={addRefusal} style={{ marginLeft: 8 }}>
                    Ajouter
                </button>

                <ul style={{ marginTop: 12 }}>
                    {refusalReasons.map((r) => (
                        <li key={r}>
                            {r}{" "}
                            <button type="button" onClick={() => removeRefusal(r)}>
                                x
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            {/* 3️⃣ Source + ajout des prospects */}
            <section style={{ marginTop: 24 }}>
                <h2>Source des prospects</h2>
                <input
                    placeholder="Ex : Client Maps, PagesJaunes..."
                    value={source}
                    onChange={sourceChange}
                />
            </section>

            <section style={{ marginTop: 24 }}>
                <h2>Ajout des prospects</h2>

                <div>
                    <label>
                        <input
                            type="radio"
                            name="mode"
                            checked={mode === "manual"}
                            onChange={() => handleModeChange("manual")}
                        />{" "}
                        Manuellement
                    </label>

                    <label style={{ marginLeft: 12 }}>
                        <input
                            type="radio"
                            name="mode"
                            checked={mode === "file"}
                            onChange={() => handleModeChange("file")}
                        />{" "}
                        Télécharger fichier
                    </label>
                </div>

                {mode === "file" && (
                    <div style={{ marginTop: 12 }}>
                        <input type="file" accept=".csv" onChange={handleFileChange} />
                        {file && (
                            <div style={{ marginTop: 8 }}>
                                <p>
                                    <b>{file.name}</b>
                                </p>
                                <p style={{ color: "#555" }}>
                                    {csvCount !== null
                                        ? `${csvCount} lignes détectées`
                                        : "Lecture du fichier..."}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {mode === "manual" && (
                    <div style={{ marginTop: 12 }}>
                        <div>
                            <input
                                placeholder="Nom / entreprise"
                                value={manualName}
                                onChange={(e) => setManualName(e.target.value)}
                            />
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <input
                                placeholder="Téléphone"
                                value={manualPhone}
                                onChange={(e) => setManualPhone(e.target.value)}
                            />
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <input
                                placeholder="Notes (optionnel)"
                                value={manualNotes}
                                onChange={(e) => setManualNotes(e.target.value)}
                            />
                        </div>
                        <button style={{ marginTop: 8 }} onClick={handleManualAdd}>
                            Ajouter le prospect
                        </button>

                        {manualProspects.length > 0 && (
                            <ul style={{ marginTop: 12 }}>
                                {manualProspects.map((p) => (
                                    <li key={p.id}>
                                        {p.name} - {p.phone}
                                        {p.notes && ` (${p.notes})`}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </section>

            {/* 4️⃣ Bouton suivant */}
            <div style={{ marginTop: 32 }}>
                <button onClick={handleNext} disabled={loadingNext}>
                    {loadingNext ? "Enregistrement..." : "Suivant"}
                </button>
                {errorNext && (
                    <p style={{ color: "red", marginTop: 8 }}>{errorNext}</p>
                )}
            </div>

        </div>
    );
}
