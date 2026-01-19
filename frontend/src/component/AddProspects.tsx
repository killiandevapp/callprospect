import { useState, ChangeEvent } from "react";
import { api } from "../api/axios";

// Mode d’ajout des prospects : soit en important un fichier, soit à la main
type Mode = "manual" | "file";

// Modèle d’un prospect ajouté manuellement (non encore persisté)
type ManualProspect = {
    id: number;
    name: string;
    phone: string;
    notes: string;
};

export default function AddProspects() {
    // Libellés des résultats d’appel utilisés plus tard dans l’app
    const [callResults] = useState<string[]>([
        "RDV",
        "Refus",
        "Décroche pas",
        "À relancer",
    ]);

    // État de chargement et d’erreur pour le bouton “Suivant”
    const [loadingNext, setLoadingNext] = useState(false);
    const [errorNext, setErrorNext] = useState<string | null>(null);

    // Saisie en cours pour un nouveau motif de refus
    const [refusalInput, setRefusalInput] = useState<string>("");

    // Liste des motifs de refus configurés pour la campagne
    const [refusalReasons, setRefusalReasons] = useState<string[]>([
        "Pas les fonds",
        "Pas le temps",
        "Déjà équipé",
        "Trop chère",
        "Pas intéressé",
    ]);

    // Champ pour garder une trace de la source des prospects (Maps, PJ, etc.)
    const [source, setSource] = useState<string>("");

    // Mode d’ajout des prospects : fichier CSV ou saisie manuelle
    const [mode, setMode] = useState<Mode>("file");

    // Fichier CSV sélectionné et compteur de lignes détectées
    const [file, setFile] = useState<File | null>(null);
    const [csvCount, setCsvCount] = useState<number | null>(null);

    // Champs pour la création d’un prospect manuel
    const [manualName, setManualName] = useState<string>("");
    const [manualPhone, setManualPhone] = useState<string>("");
    const [manualNotes, setManualNotes] = useState<string>("");
    const [manualProspects, setManualProspects] = useState<ManualProspect[]>([]);

    // Gestion du champ texte pour l’ajout d’un nouveau motif de refus
    const refusalChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRefusalInput(e.target.value);
    };

    // Gestion du champ indiquant la source des prospects
    const sourceChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSource(e.target.value);
    };

    // Ajout d’un nouveau motif de refus dans la liste
    const addRefusal = () => {
        const v = refusalInput.trim();
        if (!v || refusalReasons.includes(v)) return;
        setRefusalReasons([...refusalReasons, v]);
        setRefusalInput("");
    };

    // Suppression d’un motif de refus existant
    const removeRefusal = (label: string) => {
        setRefusalReasons(refusalReasons.filter((r) => r !== label));
    };

    // Changement de mode (manuel vs fichier)
    const modeGetContact = (newMode: Mode) => {
        setMode(newMode);
    };

    // Gestion du fichier CSV choisi par l’utilisateur
    const fileChange = (e: ChangeEvent<HTMLInputElement>) => {
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

            // On découpe sur les sauts de ligne, on nettoie, et on compte les lignes non vides
            const lines = text
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter((l) => l.length > 0);

            setCsvCount(lines.length);
        };
        reader.readAsText(f);
    };

    // Ajout d’un prospect dans la liste manuelle
    const manualAddFile = () => {
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

        // Reset des champs de saisie
        setManualName("");
        setManualPhone("");
        setManualNotes("");
    };

    // Envoi de la configuration de campagne (motifs, source, prospects) au back
    const handleNext = async () => {
        const cleanedRefusals = refusalReasons
            .map((r) => r.trim())
            .filter((r) => r.length > 0);

        if (cleanedRefusals.length === 0) {
            alert("Ajoute au moins un motif de refus.");
            return;
        }

        setLoadingNext(true);
        setErrorNext(null);

        try {
            await api.post("/campaign/setup", {
                source: source.trim() || null,
                refusalReasons: cleanedRefusals,
                manualProspects, // Pour l’instant on envoie seulement les prospects saisis à la main, on verras plus tard pour gérer le CSV
            });

            alert("Campagne configurée et prospects enregistrés.");
        } catch (err) {
            console.error(err);
            setErrorNext("Erreur lors de l'enregistrement.");
        } finally {
            setLoadingNext(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <h1>Vous revoilà !</h1>
            <p>Configurez votre campagne avant de commencer à appeler.</p>

            {/*Rappel des statuts d’appel utilisés */}
            <section style={{ marginTop: 24 }}>
                <h2>Définir le résultat d&apos;un appel</h2>
                <p>Les statuts utilisés pendant la prospection :</p>
                <ul>
                    {callResults.map((r) => (
                        <li key={r}>{r}</li>
                    ))}
                </ul>
            </section>

            {/* Configuration des motifs de refus */}
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

            {/* Source des prospects (ex : Maps, PagesJaunes, fichier interne…) */}
            <section style={{ marginTop: 24 }}>
                <h2>Source des prospects</h2>
                <input
                    placeholder="Ex : Client Maps, PagesJaunes..."
                    value={source}
                    onChange={sourceChange}
                />
            </section>

            {/*  Ajout des prospects : par fichier CSV ou manuellement */}
            <section style={{ marginTop: 24 }}>
                <h2>Ajout des prospects</h2>

                <div>
                    <label>
                        <input
                            type="radio"
                            name="mode"
                            checked={mode === "manual"}
                            onChange={() => modeGetContact("manual")}
                        />{" "}
                        Manuellement
                    </label>

                    <label style={{ marginLeft: 12 }}>
                        <input
                            type="radio"
                            name="mode"
                            checked={mode === "file"}
                            onChange={() => modeGetContact("file")}
                        />{" "}
                        Télécharger fichier
                    </label>
                </div>

                {/* Mode fichier : on affiche l’input et un résumé du CSV */}
                {mode === "file" && (
                    <div style={{ marginTop: 12 }}>
                        <input type="file" accept=".csv" onChange={fileChange} />
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

                {/* Mode manuel : formulaires pour saisir les prospects un par un */}
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
                        <button style={{ marginTop: 8 }} onClick={manualAddFile}>
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

            {/* Bouton suivant : envoi de la configuration au back */}
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
