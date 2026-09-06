import { useMemo } from 'react'
import type { Carte, Mot } from '../types'
import type { Synthese } from '../hooks/useSynthese'
import { formaterDelai } from '../lib/srs'

const LIBELLE_DIFFICULTE: Record<number, string> = {
  1: 'Accessible',
  2: 'Soutenu',
  3: 'Exigeant',
  4: 'Rare',
  5: 'Érudit',
}

interface Props {
  mot: Mot
  carte?: Carte | undefined
  synthese: Synthese
  onSuspendre?: ((suspendue: boolean) => void) | undefined
  /** Masque l'exemple et le mésusage tant que la réponse n'est pas révélée. */
  compact?: boolean
}

export default function FicheMot({ mot, carte, synthese, onSuspendre, compact = false }: Props) {
  const syllabes = useMemo(() => mot.syllabation.split('.'), [mot.syllabation])

  return (
    <article className="fiche">
      <div className="fiche__entete">
        <div className="fiche__mot-ligne">
          <h2 className="fiche__mot" lang="fr">
            {mot.mot}
          </h2>

          <div className="fiche__audio-api">
            <span className="api" lang="fr-x-ipa" aria-label={`Prononciation : ${mot.api}`}>
              {mot.api}
            </span>

            <button
              type="button"
              className={`btn btn--icone fiche__btn-audio ${synthese.enCours ? 'btn--audio-actif' : ''}`}
              onClick={() => synthese.parler(mot.mot)}
              disabled={!synthese.disponible}
              aria-pressed={synthese.enCours}
              title={
                synthese.disponible
                  ? synthese.enCours
                    ? 'Lecture audio en cours'
                    : 'Écouter la prononciation'
                  : "Aucune voix française n'est installée sur cet appareil"
              }
            >
              <span aria-hidden="true" className={synthese.enCours ? 'onde-audio' : ''}>
                {synthese.enCours ? '❚❚' : '🔊'}
              </span>
              <span className="visuellement-cache">
                {synthese.enCours ? `Lecture en cours de « ${mot.mot} »` : `Écouter « ${mot.mot} »`}
              </span>
            </button>
          </div>
        </div>

        <p className="syllabes" aria-label={`${syllabes.length} syllabes`}>
          {syllabes.map((s, i) => (
            <span key={i} className="syllabe-segment">
              <b>{s}</b>
              {i < syllabes.length - 1 && <span className="syllabe-point" aria-hidden="true"> · </span>}
            </span>
          ))}
          <span className="syllabes-compteur">
            {syllabes.length} syllabes
          </span>
        </p>
      </div>

      <div className="etiquettes">
        <span className="etiquette etiquette--categorie">{mot.categorie}</span>
        <span className={`etiquette etiquette--diff-${mot.difficulte}`}>
          {LIBELLE_DIFFICULTE[mot.difficulte]} · {mot.difficulte}/5
        </span>
        <span className="etiquette etiquette--registre">{mot.registre}</span>
        <span className="etiquette etiquette--theme">{mot.theme}</span>
        {carte && carte.etat === 'revision' && (
          <span className="etiquette etiquette--delai">
            <span aria-hidden="true">⏱️</span> revu dans {formaterDelai(Math.max(0, carte.du - Date.now()))}
          </span>
        )}
        {carte?.suspendue && <span className="etiquette etiquette--suspendue">mis de côté</span>}
      </div>

      <div className="bloc bloc--definition">
        <h3 className="bloc__titre">Définition</h3>
        <p className="definition">{mot.definition}</p>
      </div>

      {!compact && (
        <>
          <div className="bloc bloc--exemple">
            <div className="bloc__entete-ligne">
              <h3 className="bloc__titre">En contexte</h3>
              <button
                type="button"
                className="btn btn--discret fiche__audio-exemple-btn"
                onClick={() => synthese.parler(mot.exemple)}
                disabled={!synthese.disponible}
              >
                <span aria-hidden="true">🔊</span> Écouter la phrase
              </button>
            </div>
            <div className="exemple-cadre">
              <p className="exemple">{mot.exemple}</p>
            </div>
          </div>

          <div className="bloc bloc--usage">
            <h3 className="bloc__titre">Usage correct & mésusage courant</h3>
            <div className="usage">
              <div className="usage__ligne usage__ligne--oui">
                <span className="usage__marque usage__marque--oui" aria-hidden="true">
                  ✓
                </span>
                <div className="usage__contenu">
                  <span className="visuellement-cache">Usage correct : </span>
                  <p className="usage__texte">{mot.exemple}</p>
                </div>
              </div>
              <div className="usage__ligne usage__ligne--non">
                <span className="usage__marque usage__marque--non" aria-hidden="true">
                  ✕
                </span>
                <div className="usage__contenu">
                  <span className="visuellement-cache">Usage fautif : </span>
                  <p className="usage__texte">{mot.mesusage}</p>
                  <p className="usage__correction">
                    {mot.correction}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="fiche__relations">
            <div className="bloc bloc--synonymes">
              <h3 className="bloc__titre">Synonymes</h3>
              <div className="mots-lies">
                {mot.synonymes.map((s) => (
                  <span className="mot-lie mot-lie--synonyme" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bloc bloc--antonymes">
              <h3 className="bloc__titre">Antonymes</h3>
              <div className="mots-lies">
                {mot.antonymes.map((s) => (
                  <span className="mot-lie mot-lie--antonyme" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bloc bloc--origine">
            <h3 className="bloc__titre">Origine & Étymologie</h3>
            <div className="origine-cadre">
              <p className="origine-texte">{mot.etymologie}</p>
            </div>
          </div>
        </>
      )}

      {onSuspendre && (
        <div className="bloc">
          <button
            type="button"
            className="btn btn--discret"
            onClick={() => onSuspendre(!carte?.suspendue)}
          >
            {carte?.suspendue ? '↩ Remettre dans les révisions' : '⊘ Retirer des révisions'}
          </button>
          {!carte?.suspendue && (
            <p className="reglage__desc">
              Retirer un mot le fait disparaître de la file, définitivement et sans le compter comme
              acquis. Pour un mot que vous connaissez déjà mais voulez garder en mémoire, préférez le
              noter « Facile » : il repartira à quatre jours d'intervalle.
            </p>
          )}
        </div>
      )}
    </article>
  )
}
