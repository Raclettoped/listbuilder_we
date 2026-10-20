<script>
  import { itemCost } from './calc.js';
let { title, units, monsters = [], items, total, limit, warnings, printStats = false, onqty, ontoggle, onremove } = $props();

  const unitOf = (it) =>
  units.find((u) => u.id === it.unitId) ||
  monsters.find((u) => u.id === it.unitId);
  let over = $derived(total - limit);
</script>

<section class="panel">
  <h2>{title || 'Deine Liste'}</h2>

  {#if items.length === 0}
    <p class="empty">Noch keine Einheiten. Füge links eine Einheit hinzu.</p>
  {/if}

  {#each items as it (it.uid)}
    {@const u = unitOf(it)}
    {@const chosen = u.opts.filter((o) => it.opts.includes(o.id)).map((o) => o.name).join(', ')}
    <div class="item">
      <div class="row">
        <div>
          <b>{u.name}</b><span class="qtyprint"> × {it.qty}</span>
          {#if u.is_monster && u.points_value && typeof u.points_value === 'object'}
  <span class="only-print"> ({it.monster_mode ?? 'allied'})</span>
  <div class="monster-mode noprint">
    <label>
      Modus:
      <select bind:value={it.monster_mode}>
        {#if u.points_value.wild !== undefined}
          <option value="wild">Wild ({u.points_value.wild})</option>
        {/if}
        {#if u.points_value.bound !== undefined}
          <option value="bound">Bound ({u.points_value.bound})</option>
        {/if}
        {#if u.points_value.allied !== undefined}
          <option value="allied">Allied ({u.points_value.allied})</option>
        {/if}
      </select>
    </label>
  </div>
{/if}
          {#if chosen}<div class="meta only-print">{chosen}</div>{/if}
        </div>
        <div class="qty noprint">
          <button aria-label="Weniger" onclick={() => onqty(it, -1)}>−</button>
          <span>{it.qty}</span>
          <button aria-label="Mehr" onclick={() => onqty(it, 1)}>+</button>
        </div>
        <span class="pts">{itemCost(u, it)} Pkt</span>
        <button class="remove" aria-label="{u.name} entfernen" onclick={() => onremove(it)}>Entfernen</button>
      </div>
    {#if printStats && u.profiles?.length}
  <table class="stats only-print">
    <thead>
      <tr>
        <th class="pname">Profil</th>
        <th>Ag</th><th>Acc</th><th>Str</th><th>Res</th><th>Init</th><th>Co</th>
        <th class="pspecial">Special</th>
      </tr>
    </thead>
    <tbody>
      {#each u.profiles as p}
        <tr>
          <td class="pname">{p.name}</td>
          <td>{p.ag}</td>
          <td>{p.acc}</td>
          <td>{p.str}</td>
          <td>{p.res}</td>
          <td>{p.init}</td>
          <td>{p.co}</td>
          <td class="pspecial">{p.special ?? '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if chosen}
  <div class="stats-upgrades only-print">
    <b>Aufwertungen:</b> {chosen}
  </div>
{/if}
{/if}
      {#if u.opts.length}
        <div class="opts noprint">
          {#each u.opts as o (o.id)}
            <label>
              <input type="checkbox" checked={it.opts.includes(o.id)}
                onchange={(e) => ontoggle(it, o.id, e.currentTarget.checked)} />
              {o.name} (+{o.pts})
            </label>
          {/each}
        </div>
      {/if}
    </div>
  {/each}

  {#each warnings as w}<p class="warn">{w}</p>{/each}
  {#if over > 0}<p class="warn">{over} Punkte über dem Limit.</p>{/if}

  <div class="total" class:over={over > 0}>
    <span>Gesamt</span>
    <span class="pts">{total} / {limit}</span>
  </div>
</section>
