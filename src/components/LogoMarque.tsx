/**
 * LogoMarque — Logotype SVG de Lexique.
 *
 * Livre ouvert ornementé + point garance. Utilisé dans l'en-tête
 * et dans le pied de page à taille réduite.
 */

interface Props {
  taille?: number
  className?: string
}

export default function LogoMarque({ taille = 32, className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={taille}
      height={taille}
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      {/* Fond carré arrondi */}
      <rect width="64" height="64" rx="12" fill="var(--accent, #8B1E24)" />

      {/* Reflet doux sur le fond */}
      <rect width="64" height="30" rx="12" fill="white" fillOpacity="0.04" />

      {/* Dorure – Tranche (reliure) centrale */}
      <rect x="30.5" y="14" width="3" height="36" rx="1.5" fill="#C8A96E" />

      {/* Page gauche */}
      <path
        d="M32 16 Q24 17.5 14 22 L14 50 Q23 47 32 46.5 Z"
        fill="#F9F6F0"
      />

      {/* Lignes typographiques page gauche */}
      <line x1="17" y1="29" x2="30" y2="27.5" stroke="#C8A96E" strokeWidth="0.8" opacity="0.6" />
      <line x1="16.5" y1="33" x2="30" y2="31.5" stroke="#C8A96E" strokeWidth="0.8" opacity="0.6" />
      <line x1="16" y1="37" x2="30" y2="35.5" stroke="#C8A96E" strokeWidth="0.8" opacity="0.6" />
      <line x1="15.5" y1="41" x2="30" y2="39.5" stroke="#C8A96E" strokeWidth="0.5" opacity="0.4" />

      {/* Page droite */}
      <path
        d="M32 16 Q40 17.5 50 22 L50 50 Q41 47 32 46.5 Z"
        fill="#EDE8DE"
      />

      {/* Lignes typographiques page droite */}
      <line x1="34" y1="27.5" x2="47" y2="29" stroke="#C8A96E" strokeWidth="0.8" opacity="0.6" />
      <line x1="34" y1="31.5" x2="47.5" y2="33" stroke="#C8A96E" strokeWidth="0.8" opacity="0.6" />
      <line x1="34" y1="35.5" x2="48" y2="37" stroke="#C8A96E" strokeWidth="0.8" opacity="0.6" />
      <line x1="34" y1="39.5" x2="48.5" y2="41" stroke="#C8A96E" strokeWidth="0.5" opacity="0.4" />

      {/* Éventail supérieur gauche */}
      <path d="M32 16 Q24 13.5 14.5 16.5" stroke="#F9F6F0" strokeWidth="1.2" opacity="0.55" fill="none" />
      <path d="M32 16 Q24 11 15 14" stroke="#F9F6F0" strokeWidth="0.8" opacity="0.3" fill="none" />

      {/* Éventail supérieur droit */}
      <path d="M32 16 Q40 13.5 49.5 16.5" stroke="#EDE8DE" strokeWidth="1.2" opacity="0.55" fill="none" />
      <path d="M32 16 Q40 11 49 14" stroke="#EDE8DE" strokeWidth="0.8" opacity="0.3" fill="none" />

      {/* Petit ornement doré en haut de la reliure */}
      <circle cx="32" cy="14" r="2" fill="#C8A96E" />
    </svg>
  )
}
