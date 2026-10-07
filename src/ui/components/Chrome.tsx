import type { ReactNode } from 'react';

export function Header({
  title, extra, back, className,
}: { title?: string; extra?: ReactNode; back?: () => void; className?: string }) {
  return (
    <header className={className ? `app-header ${className}` : 'app-header'}>
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
      <Icon name={key} />
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

/** Generic line icons for the bottom navigation (no product marks). */
function Icon({ name }: { name: 'home' | 'activity' | 'settings' }) {
  const paths: Record<typeof name, ReactNode> = {
    home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />,
    activity: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
