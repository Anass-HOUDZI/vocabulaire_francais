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
  const syllabes = mot.syllabation.split('.')

  return (
    <article className="fiche">
      <div className="fiche__entete">
        <h2 className="fiche__mot" lang="fr">
          {mot.mot}
        </h2>

        <span className="api" lang="fr-x-ipa" aria-label={`Prononciation : ${mot.api}`}>
          {mot.api}
        </span>

        <button
          type="button"
          className="btn btn--icone btn--discret"
          onClick={() => synthese.parler(mot.mot)}
          disabled={!synthese.disponible}
          title={
            synthese.disponible
              ? 'Écouter la prononciation'
              : "Aucune voix française n'est installée sur cet appareil"
          }
        >
          <span aria-hidden="true">{synthese.enCours ? '❚❚' : '🔊'}</span>
          <span className="visuellement-cache">Écouter « {mot.mot} »</span>
        </button>
      </div>

      <p className="syllabes" aria-label={`${syllabes.length} syllabes`}>
        {syllabes.map((s, i) => (
          <span key={i}>
            <b>{s}</b>
            {i < syllabes.length - 1 && <span aria-hidden="true"> · </span>}
          </span>
        ))}
        <span style={{ color: 'var(--texte-3)', marginLeft: '0.4rem' }}>
          {syllabes.length} syll.
        </span>
      </p>

      <p className="etiquettes">
        <span className="etiquette">{mot.categorie}</span>
        <span className={`etiquette etiquette--diff-${mot.difficulte}`}>
          {LIBELLE_DIFFICULTE[mot.difficulte]} · {mot.difficulte}/5
        </span>
        <span className="etiquette">{mot.registre}</span>
        <span className="etiquette">{mot.theme}</span>
        {carte && carte.etat === 'revision' && (
          <span className="etiquette">
            revu dans {formaterDelai(Math.max(0, carte.du - Date.now()))}
          </span>
        )}
        {carte?.suspendue && <span className="etiquette">mis de côté</span>}
      </p>

      <div className="bloc">
        <h3 className="bloc__titre">Définition</h3>
        <p className="definition">{mot.definition}</p>
      </div>

      {!compact && (
        <>
          <div className="bloc">
            <h3 className="bloc__titre">En contexte</h3>
            <p className="exemple">{mot.exemple}</p>
            <button
              type="button"
              className="btn btn--discret"
              style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}
              onClick={() => synthese.parler(mot.exemple)}
              disabled={!synthese.disponible}
            >
              <span aria-hidden="true">🔊</span> Écouter la phrase
            </button>
          </div>

          <div className="bloc">
            <h3 className="bloc__titre">Usage correct et mésusage courant</h3>
            <div className="usage">
              <p className="usage__ligne usage__ligne--oui">
                <span className="usage__marque" aria-hidden="true">
                  ✓
                </span>
                <span>
                  <span className="visuellement-cache">Usage correct : </span>
                  {mot.exemple}
                </span>
              </p>
              <p className="usage__ligne usage__ligne--non">
                <span className="usage__marque" aria-hidden="true">
                  ✕
                </span>
                <span>
                  <span className="visuellement-cache">Usage fautif : </span>
                  {mot.mesusage}
                  <br />
                  <em style={{ color: 'var(--texte-2)', fontStyle: 'normal', fontSize: '0.9em' }}>
                    {mot.correction}
                  </em>
                </span>
              </p>
            </div>
          </div>

          <div className="bloc">
            <h3 className="bloc__titre">Synonymes</h3>
            <p className="mots-lies">
              {mot.synonymes.map((s) => (
                <span className="mot-lie" key={s}>
                  {s}
                </span>
              ))}
            </p>
          </div>

          <div className="bloc">
            <h3 className="bloc__titre">Antonymes</h3>
            <p className="mots-lies">
              {mot.antonymes.map((s) => (
                <span className="mot-lie" key={s}>
                  {s}
                </span>
              ))}
            </p>
          </div>

          <div className="bloc">
            <h3 className="bloc__titre">Origine</h3>
            <p style={{ color: 'var(--texte-2)', fontSize: '0.94rem' }}>{mot.etymologie}</p>
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
            <p className="reglage__desc" style={{ marginTop: '0.35rem' }}>
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
