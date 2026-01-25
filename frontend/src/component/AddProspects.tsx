import { useState, ChangeEvent } from "react";
import { api } from "../api/axios";
import '../style/addprospects.css'

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
  <div className="campaign-setup-container">
    <h1 className="campaign-setup-title">Vous revoilà !</h1>
    <p className="campaign-setup-subtitle">
      Configurez votre campagne avant de commencer à appeler.
    </p>

    {/* Rappel des statuts d’appel utilisés */}
    <section className="campaign-section">
      <h2 className="campaign-section-title">Définir le résultat d'un appel</h2>
      <p className="campaign-section-text">
        Les statuts utilisés pendant la prospection :
      </p>
      <ul className="campaign-list">
        {callResults.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </section>

    {/* Configuration des motifs de refus */}
    <section className="campaign-section">
      <h2 className="campaign-section-title">Définir les motifs de refus</h2>
      <p className="campaign-section-text">
        Quand tu choisiras "Refus" pendant un appel, tu devras choisir un motif parmi cette liste.
      </p>

      <div className="campaign-input-group">
        <input
          className="campaign-input"
          placeholder="Ex : Client énervé"
          value={refusalInput}
          onChange={refusalChange}
        />
        <button className="campaign-btn" onClick={addRefusal}>
          Ajouter
        </button>
      </div>

      <ul className="campaign-list campaign-list-small">
        {refusalReasons.map((r) => (
          <li key={r} className="campaign-list-item">
            {r}{" "}
            <button className="campaign-btn-small" type="button" onClick={() => removeRefusal(r)}>
              x
            </button>
          </li>
        ))}
      </ul>
    </section>

    {/* Source des prospects */}
    <section className="campaign-section">
      <h2 className="campaign-section-title">Source des prospects</h2>
      <input
        className="campaign-input"
        placeholder="Ex : Client Maps, PagesJaunes..."
        value={source}
        onChange={sourceChange}
      />
    </section>

    {/* Ajout des prospects */}
    <section className="campaign-section">
      <h2 className="campaign-section-title">Ajout des prospects</h2>

      <div className="campaign-radio-group">
        <label>
          <input
            type="radio"
            name="mode"
            checked={mode === "manual"}
            onChange={() => modeGetContact("manual")}
          />{" "}
          Manuellement
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            checked={mode === "file"}
            onChange={() => modeGetContact("file")}
          />{" "}
          Télécharger fichier
        </label>
      </div>

      {mode === "file" && (
        <div className="campaign-file-group">
          <input type="file" accept=".csv" onChange={fileChange} />
          {file && (
            <div className="campaign-file-info">
              <p><b>{file.name}</b></p>
              <p className="campaign-file-subtext">
                {csvCount !== null ? `${csvCount} lignes détectées` : "Lecture du fichier..."}
              </p>
            </div>
          )}
        </div>
      )}

      {mode === "manual" && (
        <div className="campaign-manual-group">
          <input
            className="campaign-input"
            placeholder="Nom / entreprise"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
          />
          <input
            className="campaign-input"
            placeholder="Téléphone"
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
          />
          <input
            className="campaign-input"
            placeholder="Notes (optionnel)"
            value={manualNotes}
            onChange={(e) => setManualNotes(e.target.value)}
          />
          <button className="campaign-btn" onClick={manualAddFile}>
            Ajouter le prospect
          </button>

          {manualProspects.length > 0 && (
            <ul className="campaign-list campaign-list-small">
              {manualProspects.map((p) => (
                <li key={p.id} className="campaign-list-item">
                  {p.name} - {p.phone}
                  {p.notes && ` (${p.notes})`}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>

    {/* Bouton suivant */}
    <div className="campaign-next-group">
      <button className="campaign-btn campaign-btn-next" onClick={handleNext} disabled={loadingNext}>
        {loadingNext ? "Enregistrement..." : "Suivant"}
      </button>
      {errorNext && <p className="campaign-error">{errorNext}</p>}
    </div>
  </div>
);

}
