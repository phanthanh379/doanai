import { useEffect, useRef } from 'react';
import { CATEGORIES, type Category, type Product } from '../data';

// Canvas widget: horizontal bar chart of product count per category.
// Clicking a bar row toggles the category filter. There is no DOM per bar —
// locator-based tests can only click coordinates; VLM-based tests read pixels.

const ROW_H = 34;
const WIDTH = 340;
const HEIGHT = ROW_H * CATEGORIES.length + 10;
const LABEL_W = 92;

const COLORS: Record<Category, string> = {
  Beverage: '#2f80ed',
  Snack: '#f2994a',
  Household: '#27ae60',
  Stationery: '#9b51e0',
};

export function CategoryChart({
  products,
  selected,
  onSelect,
}: {
  products: Product[];
  selected: Category | '';
  onSelect: (c: Category | '') => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const style = getComputedStyle(document.documentElement);
    const textColor = style.getPropertyValue('--text').trim() || '#1a1a2e';

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    const counts = CATEGORIES.map((c) => products.filter((p) => p.category === c).length);
    const max = Math.max(1, ...counts);

    CATEGORIES.forEach((cat, i) => {
      const y = 5 + i * ROW_H;
      ctx.font = '12px system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;
      ctx.fillText(cat, 6, y + ROW_H / 2 - 2);

      const barW = Math.round(((WIDTH - LABEL_W - 40) * counts[i]) / max);
      ctx.fillStyle = COLORS[cat];
      ctx.globalAlpha = selected && selected !== cat ? 0.3 : 1;
      ctx.fillRect(LABEL_W, y + 4, Math.max(barW, 4), ROW_H - 12);
      ctx.globalAlpha = 1;
      ctx.fillStyle = textColor;
      ctx.fillText(String(counts[i]), LABEL_W + Math.max(barW, 4) + 8, y + ROW_H / 2 - 2);

      if (selected === cat) {
        ctx.strokeStyle = COLORS[cat];
        ctx.strokeRect(1.5, y + 0.5, WIDTH - 3, ROW_H - 5);
      }
    });
  }, [products, selected]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top - 5;
    const idx = Math.floor(y / ROW_H);
    if (idx >= 0 && idx < CATEGORIES.length) {
      const cat = CATEGORIES[idx];
      onSelect(selected === cat ? '' : cat);
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-title">Products by category</div>
      <canvas ref={ref} width={WIDTH} height={HEIGHT} onClick={handleClick} />
    </div>
  );
}
