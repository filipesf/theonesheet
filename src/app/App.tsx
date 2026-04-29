import { useMemo } from 'react';
import { normaliseCharacter } from '../domain/normalise';
import { createEmptyCharacter } from '../domain/schema';

export default function App() {
  const character = useMemo(() => normaliseCharacter(createEmptyCharacter()), []);

  return (
    <main className="app-shell">
      <header>
        <h1>The One Sheet</h1>
        <p>v0 foundation is ready.</p>
      </header>
      <section className="stat-grid" aria-label="Derived stats preview">
        <div>
          <strong>TN STR</strong>
          <span>{character.attributes.tn_strength}</span>
        </div>
        <div>
          <strong>TN HRT</strong>
          <span>{character.attributes.tn_heart}</span>
        </div>
        <div>
          <strong>TN WTS</strong>
          <span>{character.attributes.tn_wits}</span>
        </div>
        <div>
          <strong>Max Endurance</strong>
          <span>{character.max_endurance}</span>
        </div>
        <div>
          <strong>Max Hope</strong>
          <span>{character.max_hope}</span>
        </div>
        <div>
          <strong>Base Parry</strong>
          <span>{character.base_parry}</span>
        </div>
        <div>
          <strong>Effective Parry</strong>
          <span>{character.effective_parry}</span>
        </div>
        <div>
          <strong>Load</strong>
          <span>{character.load}</span>
        </div>
      </section>
    </main>
  );
}
