<script>
  import { countOf } from './calc.js';
  let { units, monsters = [], items, onadd } = $props();
</script>

<section class="panel" id="avail">
  <h2>Einheiten</h2>
  {#each units as u (u.id)}
    {@const n = countOf(items, u.id)}
    <div class="unit">
      <div>
        <b>{u.name}</b>
        <span class="meta">
          {u.note} · {u.pts} Pkt · max. {u.max}
          {#if u.base_size > 1}
            · Start: {u.base_size} Modelle
          {/if}
          {#if u.max_size > u.base_size}
            · bis zu {u.max_size}
          {/if}
          {#if n}
            · in Liste: {n}
          {/if}
        </span>
      </div>
      <button onclick={() => onadd(u)}>Hinzufügen</button>
    </div>
  {/each}

  {#if monsters.length > 0}
    <details class="monster-group">
      <summary>
        <b>Monster Allies</b>
        <span class="meta">({monsters.length} verfügbar)</span>
      </summary>
      <p class="meta">Wild / Bound / Allied — Preis wird nach dem Hinzufügen gewählt.</p>
      {#each monsters as u (u.id)}
        <div class="unit">
          <div>
            <b>{u.name}</b>
            <span class="meta">
              {u.note}
              {#if typeof u.points_value === 'object' && u.points_value}
                · W {u.points_value.wild ?? '—'}
                · B {u.points_value.bound ?? '—'}
                · A {u.points_value.allied ?? '—'}
              {/if}
            </span>
          </div>
          <button onclick={() => onadd(u, true)}>Hinzufügen</button>
        </div>
      {/each}
    </details>
  {/if}
</section>