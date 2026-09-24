// Two icon sets (a / b) so variant V3 can swap glyphs without changing behavior.
// Icons are intentionally rendered WITHOUT aria-label / title / role — they are the
// "custom components with no semantic label" test group for the experiment.

export type IconName =
  | 'view'
  | 'edit'
  | 'delete'
  | 'plus'
  | 'products'
  | 'customers'
  | 'settings'
  | 'logout';

type PathMap = Record<IconName, string>;

// Set A: eye / pencil / trash can
const SET_A: PathMap = {
  view: 'M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z',
  edit: 'M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  delete: 'M6 7h12l-1 14H7L6 7zm3-3h6l1 2h4v2H4V6h4l1-2zm1 6v9h2v-9h-2zm4 0v9h2v-9h-2z',
  plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z',
  products: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z',
  customers: 'M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z',
  settings: 'M12 8a4 4 0 100 8 4 4 0 000-8zm8.9 4a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 00-2-1.2L16 3h-4l-.5 2.7a7 7 0 00-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 000 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 002 1.2L12 21h4l.5-2.7a7 7 0 002-1.2l2.3 1 2-3.4-2-1.5c.07-.4.1-.8.1-1.2z',
  logout: 'M10 3h8a1 1 0 011 1v16a1 1 0 01-1 1h-8v-2h7V5h-7V3zm-1 6l-4 3 4 3v-2h7v-2H9V9z',
};

// Set B: magnifier / pen-in-square / x-circle
const SET_B: PathMap = {
  view: 'M10 2a8 8 0 105.3 14l5.3 5.3 1.4-1.4-5.3-5.3A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z',
  edit: 'M4 4h9v2H6v12h12v-7h2v9H4V4zm16.7 1.3l-2-2a1 1 0 00-1.4 0l-7.8 7.8-.5 2.9 2.9-.5 7.8-7.8a1 1 0 000-1.4z',
  delete: 'M12 2a10 10 0 100 20 10 10 0 000-20zm4.2 12.8l-1.4 1.4L12 13.4l-2.8 2.8-1.4-1.4 2.8-2.8-2.8-2.8 1.4-1.4L12 10.6l2.8-2.8 1.4 1.4-2.8 2.8 2.8 2.8z',
  plus: 'M12 2a10 10 0 100 20 10 10 0 000-20zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z',
  products: 'M12 2l9 5v10l-9 5-9-5V7l9-5zm0 2.3L5.5 7.9 12 11.5l6.5-3.6L12 4.3zM5 9.6v6.2l6 3.3v-6.2L5 9.6zm14 0l-6 3.3v6.2l6-3.3V9.6z',
  customers: 'M8 11a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM8 13c-2.7 0-6 1.3-6 4v2h12v-2c0-2.7-3.3-4-6-4zm8 0c-.5 0-1 .05-1.6.15A5 5 0 0116 17v2h6v-2c0-2.7-3.3-4-6-4z',
  settings: 'M4 6h10v2H4V6zm12 0h4v2h-4V6zM4 11h4v2H4v-2zm6 0h10v2H10v-2zM4 16h13v2H4v-2zm15 0h1v2h-1v-2z',
  logout: 'M13 3a9 9 0 11-8.5 6h2.2A7 7 0 1013 5V8L8 4.5 13 1v2z',
};

export function Icon({ name, set }: { name: IconName; set: 'a' | 'b' }) {
  const d = (set === 'a' ? SET_A : SET_B)[name];
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d={d} />
    </svg>
  );
}
