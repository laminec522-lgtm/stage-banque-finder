"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EntreeTravail {
  id: string;
  date: string;
  nomDossier: string;
  numeroDossier: string;
  heures: number;
  tache: string;
}

interface PointEnSuspens {
  id: string;
  nomDossier: string;
  numeroDossier: string;
  question: string;
  dateAjout: string;
  resolu: boolean;
}

type Onglet = "journal" | "suspens";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function dateAujourdhui() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function Page() {
  const [onglet, setOnglet] = useState<Onglet>("journal");
  const [entrees, setEntrees] = useState<EntreeTravail[]>([]);
  const [points, setPoints] = useState<PointEnSuspens[]>([]);

  // Chargement localStorage
  useEffect(() => {
    const e = localStorage.getItem("entrees");
    const p = localStorage.getItem("points");
    if (e) setEntrees(JSON.parse(e));
    if (p) setPoints(JSON.parse(p));
  }, []);

  // Sauvegarde automatique
  useEffect(() => {
    localStorage.setItem("entrees", JSON.stringify(entrees));
  }, [entrees]);

  useEffect(() => {
    localStorage.setItem("points", JSON.stringify(points));
  }, [points]);

  // ── Handlers journal ──
  function ajouterEntree(e: EntreeTravail) {
    setEntrees((prev) => [e, ...prev]);
  }

  function supprimerEntree(id: string) {
    setEntrees((prev) => prev.filter((e) => e.id !== id));
    setPoints((prev) => prev.filter((p) => p.id !== id));
  }

  // ── Handlers points en suspens ──
  function ajouterPoint(p: PointEnSuspens) {
    setPoints((prev) => [p, ...prev]);
  }

  function toggleResolu(id: string) {
    setPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, resolu: !p.resolu } : p))
    );
  }

  function supprimerPoint(id: string) {
    setPoints((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Suivi des dossiers
        </h1>
        <p className="text-sm text-gray-500 mt-1">Cabinet comptable</p>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setOnglet("journal")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            onglet === "journal"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Journal de travail
        </button>
        <button
          onClick={() => setOnglet("suspens")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
            onglet === "suspens"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Points en suspens
          {points.filter((p) => !p.resolu).length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold rounded-full px-2 py-0.5">
              {points.filter((p) => !p.resolu).length}
            </span>
          )}
        </button>
      </div>

      {onglet === "journal" && (
        <OngletJournal
          entrees={entrees}
          onAjouter={ajouterEntree}
          onSupprimer={supprimerEntree}
        />
      )}
      {onglet === "suspens" && (
        <OngletSuspens
          points={points}
          entrees={entrees}
          onAjouter={ajouterPoint}
          onToggle={toggleResolu}
          onSupprimer={supprimerPoint}
        />
      )}
    </div>
  );
}

// ─── Onglet Journal ───────────────────────────────────────────────────────────

function OngletJournal({
  entrees,
  onAjouter,
  onSupprimer,
}: {
  entrees: EntreeTravail[];
  onAjouter: (e: EntreeTravail) => void;
  onSupprimer: (id: string) => void;
}) {
  const vide: Omit<EntreeTravail, "id"> = {
    date: dateAujourdhui(),
    nomDossier: "",
    numeroDossier: "",
    heures: 0,
    tache: "",
  };

  const [form, setForm] = useState(vide);
  const [erreur, setErreur] = useState("");

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.nomDossier.trim()) {
      setErreur("Le nom du dossier est requis.");
      return;
    }
    if (!form.numeroDossier.trim()) {
      setErreur("Le numéro de dossier est requis.");
      return;
    }
    if (form.heures <= 0) {
      setErreur("Les heures travaillées doivent être supérieures à 0.");
      return;
    }
    if (!form.tache.trim()) {
      setErreur("La tâche effectuée est requise.");
      return;
    }
    setErreur("");
    onAjouter({ ...form, id: genId() });
    setForm(vide);
  }

  const totalHeures = entrees.reduce((s, e) => s + e.heures, 0);

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Ajouter une entrée
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Heures travaillées
              </label>
              <input
                type="number"
                min="0"
                step="0.25"
                value={form.heures || ""}
                onChange={(e) =>
                  setForm({ ...form, heures: parseFloat(e.target.value) || 0 })
                }
                placeholder="ex : 2.5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nom du dossier
              </label>
              <input
                type="text"
                value={form.nomDossier}
                onChange={(e) =>
                  setForm({ ...form, nomDossier: e.target.value })
                }
                placeholder="ex : Dupont SARL"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Numéro de dossier
              </label>
              <input
                type="text"
                value={form.numeroDossier}
                onChange={(e) =>
                  setForm({ ...form, numeroDossier: e.target.value })
                }
                placeholder="ex : 2024-0042"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tâche effectuée
            </label>
            <textarea
              value={form.tache}
              onChange={(e) => setForm({ ...form, tache: e.target.value })}
              placeholder="Décrivez la tâche effectuée…"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          {erreur && (
            <p className="text-red-600 text-xs">{erreur}</p>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Ajouter l&apos;entrée
          </button>
        </form>
      </div>

      {/* Résumé */}
      {entrees.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 px-1">
          <span>{entrees.length} entrée{entrees.length > 1 ? "s" : ""}</span>
          <span>
            Total :{" "}
            <strong className="text-gray-700">{totalHeures.toFixed(2)} h</strong>
          </span>
        </div>
      )}

      {/* Liste */}
      {entrees.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">
          Aucune entrée pour l&apos;instant.
        </p>
      ) : (
        <div className="space-y-3">
          {entrees.map((e) => (
            <CarteEntree key={e.id} entree={e} onSupprimer={onSupprimer} />
          ))}
        </div>
      )}
    </div>
  );
}

function CarteEntree({
  entree,
  onSupprimer,
}: {
  entree: EntreeTravail;
  onSupprimer: (id: string) => void;
}) {
  const [confirmer, setConfirmer] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-semibold text-gray-800 text-sm">
              {entree.nomDossier}
            </span>
            <span className="ml-2 text-xs text-gray-400 font-mono">
              #{entree.numeroDossier}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {entree.heures} h
            </span>
            <span className="text-xs text-gray-400">{entree.date}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          {entree.tache}
        </p>
      </div>
      <div className="shrink-0 flex items-start">
        {confirmer ? (
          <div className="flex gap-1">
            <button
              onClick={() => onSupprimer(entree.id)}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
            >
              Oui
            </button>
            <button
              onClick={() => setConfirmer(false)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors"
            >
              Non
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmer(true)}
            className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
            title="Supprimer"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Onglet Points en suspens ─────────────────────────────────────────────────

function OngletSuspens({
  points,
  entrees,
  onAjouter,
  onToggle,
  onSupprimer,
}: {
  points: PointEnSuspens[];
  entrees: EntreeTravail[];
  onAjouter: (p: PointEnSuspens) => void;
  onToggle: (id: string) => void;
  onSupprimer: (id: string) => void;
}) {
  // Dossiers uniques issus du journal
  const dossiers = Array.from(
    new Map(
      entrees.map((e) => [
        e.numeroDossier,
        { nom: e.nomDossier, numero: e.numeroDossier },
      ])
    ).values()
  );

  const vide = {
    nomDossier: dossiers[0]?.nom ?? "",
    numeroDossier: dossiers[0]?.numero ?? "",
    question: "",
    manuel: false,
    nomManuel: "",
    numeroManuel: "",
  };

  const [form, setForm] = useState(vide);
  const [erreur, setErreur] = useState("");

  function handleDossierChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val === "__manuel__") {
      setForm({ ...form, nomDossier: "", numeroDossier: "", manuel: true });
    } else {
      const d = dossiers.find((d) => d.numero === val);
      setForm({
        ...form,
        nomDossier: d?.nom ?? "",
        numeroDossier: d?.numero ?? "",
        manuel: false,
      });
    }
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const nom = form.manuel ? form.nomManuel : form.nomDossier;
    const numero = form.manuel ? form.numeroManuel : form.numeroDossier;
    if (!nom.trim()) {
      setErreur("Le nom du dossier est requis.");
      return;
    }
    if (!numero.trim()) {
      setErreur("Le numéro de dossier est requis.");
      return;
    }
    if (!form.question.trim()) {
      setErreur("La question / le point en suspens est requis.");
      return;
    }
    setErreur("");
    onAjouter({
      id: genId(),
      nomDossier: nom.trim(),
      numeroDossier: numero.trim(),
      question: form.question.trim(),
      dateAjout: dateAujourdhui(),
      resolu: false,
    });
    setForm({ ...vide, nomDossier: form.nomDossier, numeroDossier: form.numeroDossier, manuel: form.manuel });
  }

  // Grouper par dossier
  const groupes = points.reduce<
    Record<string, { nom: string; numero: string; items: PointEnSuspens[] }>
  >((acc, p) => {
    const key = p.numeroDossier;
    if (!acc[key]) acc[key] = { nom: p.nomDossier, numero: p.numeroDossier, items: [] };
    acc[key].items.push(p);
    return acc;
  }, {});

  const nonResolus = points.filter((p) => !p.resolu).length;

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Ajouter un point en suspens
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Dossier concerné
              </label>
              <select
                value={form.manuel ? "__manuel__" : form.numeroDossier}
                onChange={handleDossierChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                {dossiers.map((d) => (
                  <option key={d.numero} value={d.numero}>
                    {d.nom} — #{d.numero}
                  </option>
                ))}
                <option value="__manuel__">Saisie manuelle…</option>
              </select>
            </div>
            {form.manuel && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nom du dossier
                  </label>
                  <input
                    type="text"
                    value={form.nomManuel}
                    onChange={(e) =>
                      setForm({ ...form, nomManuel: e.target.value })
                    }
                    placeholder="ex : Martin SAS"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Numéro de dossier
                  </label>
                  <input
                    type="text"
                    value={form.numeroManuel}
                    onChange={(e) =>
                      setForm({ ...form, numeroManuel: e.target.value })
                    }
                    placeholder="ex : 2024-0099"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Question / Point en suspens
            </label>
            <textarea
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Décrivez la question ou le point à clarifier…"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>
          {erreur && <p className="text-red-600 text-xs">{erreur}</p>}
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Ajouter le point
          </button>
        </form>
      </div>

      {/* Résumé */}
      {points.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 px-1">
          <span>{points.length} point{points.length > 1 ? "s" : ""} au total</span>
          <span>
            En attente :{" "}
            <strong className="text-amber-600">{nonResolus}</strong>
          </span>
        </div>
      )}

      {/* Points groupés par dossier */}
      {Object.keys(groupes).length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">
          Aucun point en suspens pour l&apos;instant.
        </p>
      ) : (
        <div className="space-y-6">
          {Object.values(groupes).map((groupe) => (
            <div key={groupe.numero}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-700 text-sm">
                  {groupe.nom}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  #{groupe.numero}
                </span>
                <span className="text-xs text-gray-400">
                  ({groupe.items.filter((i) => !i.resolu).length} en attente)
                </span>
              </div>
              <div className="space-y-2">
                {groupe.items.map((p) => (
                  <CartePoint
                    key={p.id}
                    point={p}
                    onToggle={onToggle}
                    onSupprimer={onSupprimer}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CartePoint({
  point,
  onToggle,
  onSupprimer,
}: {
  point: PointEnSuspens;
  onToggle: (id: string) => void;
  onSupprimer: (id: string) => void;
}) {
  const [confirmer, setConfirmer] = useState(false);

  return (
    <div
      className={`bg-white rounded-xl border p-4 shadow-sm flex gap-3 transition-opacity ${
        point.resolu ? "opacity-60 border-gray-100" : "border-amber-200"
      }`}
    >
      <button
        onClick={() => onToggle(point.id)}
        title={point.resolu ? "Marquer non résolu" : "Marquer résolu"}
        className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          point.resolu
            ? "bg-green-500 border-green-500 text-white"
            : "border-amber-400 hover:bg-amber-50"
        }`}
      >
        {point.resolu && (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-relaxed ${
            point.resolu ? "line-through text-gray-400" : "text-gray-700"
          }`}
        >
          {point.question}
        </p>
        <span className="text-xs text-gray-400 mt-1 block">
          Ajouté le {point.dateAjout}
          {point.resolu && " · Résolu"}
        </span>
      </div>
      <div className="shrink-0 flex items-start">
        {confirmer ? (
          <div className="flex gap-1">
            <button
              onClick={() => onSupprimer(point.id)}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
            >
              Oui
            </button>
            <button
              onClick={() => setConfirmer(false)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors"
            >
              Non
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmer(true)}
            className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
            title="Supprimer"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
