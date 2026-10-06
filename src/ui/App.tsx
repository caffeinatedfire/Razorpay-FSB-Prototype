import { createContext, useContext, useEffect, useMemo, useReducer, useState, type Dispatch } from 'react';
import { clockFromSearch, formatDayShort, formatTime, type Clock } from '../clock';
import type { HomeInput } from '../decide';
import { logEvent } from '../instrumentation';
import { loadState, reducer, resetDemoData, saveState, type Action, type AppState } from '../store';
import { Activity } from './screens/Activity';
import { Chase } from './screens/Chase';
import { Home } from './screens/Home';
import { Sent } from './screens/Sent';
import { Settings } from './screens/Settings';

export interface Params {
  debug: boolean;
  demo: boolean;
}

interface Ctx {
  state: AppState;
  dispatch: Dispatch<Action>;
  clock: Clock;
  now: Date;
  params: Params;
  homeInput: HomeInput;
}

const AppContext = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp outside App');
  return ctx;
}

export type Route =
  | { name: 'home' }
  | { name: 'chase'; id: string }
  | { name: 'sent'; id: string }
  | { name: 'activity' }
  | { name: 'settings' };

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'chase' && parts[1]) return { name: 'chase', id: decodeURIComponent(parts[1]) };
  if (parts[0] === 'sent' && parts[1]) return { name: 'sent', id: decodeURIComponent(parts[1]) };
  if (parts[0] === 'activity') return { name: 'activity' };
  if (parts[0] === 'settings') return { name: 'settings' };
  return { name: 'home' };
}

export function go(path: string): void {
  window.location.hash = path;
}

function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

function initState(search: string): AppState {
  const q = new URLSearchParams(search);
  let s = q.get('demo') === '1' ? resetDemoData() : loadState();
  if (q.get('timed') === '1') s = { ...s, settings: { ...s.settings, timedRun: true } };
  return s;
}

export function App() {
  const search = window.location.search;
  const clock = useMemo(() => clockFromSearch(search), [search]);
  const params = useMemo<Params>(() => {
    const q = new URLSearchParams(search);
    return { debug: q.get('debug') === '1' && q.get('demo') !== '1', demo: q.get('demo') === '1' };
  }, [search]);
  const [state, dispatch] = useReducer(reducer, search, initState);
  const [now, setNow] = useState(() => clock.now());
  const route = useHashRoute();

  useEffect(() => saveState(state), [state]);
  useEffect(() => {
    const t = window.setInterval(() => setNow(clock.now()), 15_000);
    return () => window.clearInterval(t);
  }, [clock]);
  useEffect(() => setNow(clock.now()), [clock, route, state]);
  useEffect(() => logEvent('app_open', clock), [clock]);

  const homeInput = useMemo<HomeInput>(
    () => ({
      links: state.links, customers: state.customers, replies: state.replies,
      settings: state.settings, nextCheckAt: state.nextCheckAt, now,
    }),
    [state, now],
  );
  const ctx = useMemo<Ctx>(() => ({ state, dispatch, clock, now, params, homeInput }), [state, clock, now, params, homeInput]);

  let screen;
  switch (route.name) {
    case 'chase': screen = <Chase key={route.id} id={route.id} />; break;
    case 'sent': screen = <Sent key={route.id} id={route.id} />; break;
    case 'activity': screen = <Activity />; break;
    case 'settings': screen = <Settings />; break;
    default: screen = <Home />;
  }

  return (
    <AppContext.Provider value={ctx}>
      <div className="app">
        <div className="proto" role="note">
          Concept prototype · synthetic data · {formatDayShort(now)}, {formatTime(now)}
        </div>
        {screen}
      </div>
    </AppContext.Provider>
  );
}
