import type { ReactNode } from 'react';

export function Header({ title, extra, back }: { title?: string; extra?: ReactNode; back?: () => void }) {
  return (
    <header className="app-header">
      {back ? (
        <button type="button" className="back" onClick={back}>
          ‹ Back
        </button>
      ) : null}
      {title ? <h1>{title}</h1> : null}
      {extra}
    </header>
  );
}

export function BottomNav({ current }: { current: 'home' | 'activity' | 'settings' }) {
  const item = (key: typeof current, href: string, label: string) => (
    <a href={href} aria-current={current === key ? 'page' : undefined}>
      {label}
    </a>
  );
  return (
    <nav className="tabs" aria-label="Main">
      {item('home', '#/', 'Home')}
      {item('activity', '#/activity', 'Activity')}
      {item('settings', '#/settings', 'Settings')}
    </nav>
  );
}

export function Segmented<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: Array<{ value: T; label: string; lang?: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          lang={o.lang}
          aria-pressed={o.value === value}
          onClick={() => o.value !== value && onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Sim() {
  return <span className="sim">SIMULATED</span>;
}
