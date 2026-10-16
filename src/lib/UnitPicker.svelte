<script>
  import { countOf } from './calc.js';
  let { units, items, onadd } = $props();
</script>

<section class="panel" id="avail">
  <h2>Einheiten</h2>
  {#each units as u (u.id)}
    {@const n = countOf(items, u.id)}
    <div class="unit">
      <div>
        <b>{u.name}</b>
        <span class="meta">{u.note} · {u.pts} Pkt · max. {u.max}{n ? ` · in Liste: ${n}` : ''}</span>
      </div>
      <button onclick={() => onadd(u)}>Hinzufügen</button>
    </div>
  {/each}
</section>
