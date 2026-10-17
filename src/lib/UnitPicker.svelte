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
        <span class="meta">
  {u.note} · {u.pts} Pkt · max. {u.max} 
  {#if u.base_size > 1}
    · Start: {u.base_size} Modelle
  {/if}
  {#if u.max_size > u.base_size}
    · bis zu {u.max_size}
  {/if}
</span>
      </div>
      <button onclick={() => onadd(u)}>Hinzufügen</button>
    </div>
  {/each}
</section>
