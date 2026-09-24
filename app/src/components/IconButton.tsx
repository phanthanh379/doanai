import { Icon, type IconName } from '../icons';

// Deliberately non-semantic: a <div> with an SVG glyph only — no aria-label, no
// title, no button role, no distinguishing class per action. Locator-based tests
// must rely on structure (nth-child); VLM-based tests rely on the visual glyph.
export function IconButton({
  icon,
  set,
  onClick,
}: {
  icon: IconName;
  set: 'a' | 'b';
  onClick: () => void;
}) {
  return (
    <div className="icon-btn" onClick={onClick}>
      <Icon name={icon} set={set} />
    </div>
  );
}
