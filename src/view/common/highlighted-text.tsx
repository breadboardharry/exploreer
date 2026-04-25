interface HighlightedTextProps {
  text: string;
  highlight: string;
  className?: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  highlight,
  className = "",
}) => {
  // Si la recherche est vide, on affiche le texte normalement
  if (!highlight.trim()) {
    return (
      <span className={className} title={text}>
        {text}
      </span>
    );
  }

  // 1. On "échappe" les caractères spéciaux de la recherche (ex: les points ou parenthèses)
  // pour éviter de faire planter l'expression régulière.
  const escapeRegExp = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // 2. On crée une regex insensible à la casse ("gi" = global & case-insensitive)
  const regex = new RegExp(`(${escapeRegExp(highlight)})`, "gi");

  // 3. On découpe le texte. Ex: "Capture.png" avec "captu" devient ["", "Captu", "re.png"]
  const parts = text.split(regex);

  return (
    <span className={className} title={text}>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          // Le morceau correspond à la recherche : on le surligne (fond bleu clair, texte bleu foncé)
          <span
            key={index}
            className="bg-blue-200 text-blue-900 rounded-sm px-px"
          >
            {part}
          </span>
        ) : (
          // Le morceau ne correspond pas : on l'affiche normalement
          <span key={index}>{part}</span>
        ),
      )}
    </span>
  );
};
