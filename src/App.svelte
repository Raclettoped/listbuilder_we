<script>
  import { armies } from './data/armies/index.ts';
  import { loadAll, saveAll } from './lib/storage.js';
  import { itemCost } from './lib/calc.js';
  import UnitPicker from './lib/UnitPicker.svelte';
  import ArmyList from './lib/ArmyList.svelte';
  // ... your existing imports
  console.log("Loaded Armies:", Object.keys(armies));

  const fresh = () => ({ id: null, name: 'Meine Liste', army: Object.keys(armies)[0], limit: 1000, items: [] });

  let list = $state(fresh());
  let saved = $state(loadAll());
  let storageOk = $state(true);
  let printStats = $state(true);

  let army = $derived(armies[list.army]);
  let limit = $derived(list.limit ?? 0);
  let total = $derived(
    list.items.reduce((s, it) => s + itemCost(army.units.find((u) => u.id === it.unitId), it), 0)
  );
  let warnings = $derived(
  army.units
    .filter((u) => list.items.filter((i) => i.unitId === u.id).length > u.max)
    .map((u) => `${u.name}: ${list.items.filter((i) => i.unitId === u.id).length}× in der Liste, erlaubt sind ${u.max}.`)
);

    
    function add(unit) {
    list.items.push({ 
      uid: crypto.randomUUID(), 
      unitId: unit.id, 
      qty: unit.base_size, // Startet mit der Grundgröße (z.B. 5)
      opts: [] 
    });
  }

  function changeQty(item, delta) {
    item.qty = Math.max(1, item.qty + delta);
  }
  function toggleOpt(item, optId, checked) {
    item.opts = checked ? [...item.opts, optId] : item.opts.filter((x) => x !== optId);
  }
  function removeItem(item) {
    list.items = list.items.filter((x) => x.uid !== item.uid);
  }
  function changeArmy(e) {
    list.army = e.currentTarget.value;
    list.items = [];
  }

  function save() {
    if (!list.id) list.id = 'l' + Date.now();
    if (!list.name.trim()) list.name = 'Unbenannte Liste';
    const all = { ...$state.snapshot(saved), [list.id]: $state.snapshot(list) };
    storageOk = saveAll(all);
    saved = all;
  }
  function open(l) {
    list = JSON.parse(JSON.stringify(l));
  }
  function deleteSaved(id) {
    const all = $state.snapshot(saved);
    delete all[id];
    storageOk = saveAll(all);
    saved = all;
    if (list.id === id) list.id = null;
  }
  function newList() {
    list = fresh();
  }
</script>

<header>
  <h1>Erehwon Listbuilder</h1>
  <p class="notice noprint">Listbuilder for Warlords of Erehwon</p>
  <p class="only-print meta">{army.name} · {limit} Punkte Limit</p>
</header>

<div class="bar noprint">
  <label>Listenname<input bind:value={list.name} maxlength="60" /></label>
  <label>Armee
    <select value={list.army} onchange={changeArmy}>
      {#each Object.entries(armies) as [id, a]}<option value={id}>{a.name}</option>{/each}
    </select>
  </label>
  <label>Punktelimit
    <input type="number" min="0" step="50" bind:value={list.limit} style="width:100px" />
  </label>
  <label class="printopt">
  <input type="checkbox" bind:checked={printStats} />
  Stats drucken
</label>
  <button class="primary" onclick={save}>Liste speichern</button>
  <button onclick={newList}>Neue Liste</button>
  <button onclick={() => window.print()}>Drucken</button>
</div>

<div class="wrap">
  <UnitPicker units={army.units} items={list.items} onadd={add} />
  <div>
    <ArmyList
      title={list.name}
      units={army.units}
      items={list.items}
      {total}
      {limit}
      {warnings}
      {printStats}
      onqty={changeQty}
      ontoggle={toggleOpt}
      onremove={removeItem}
    />

    <section class="panel saved noprint" id="saved" style="margin-top:20px">
      <h2>Gespeicherte Listen</h2>
      {#if Object.keys(saved).length === 0}
        <p class="empty">Noch nichts gespeichert.</p>
      {:else}
        <ul>
          {#each Object.entries(saved) as [id, l] (id)}
            <li>
              <span>{l.name} <span class="meta">({l.items.length} Einträge)</span></span>
              <span>
                <button onclick={() => open(l)}>Öffnen</button>
                <button onclick={() => deleteSaved(id)}>Löschen</button>
              </span>
            </li>
          {/each}
        </ul>
      {/if}
      {#if !storageOk}
        <p class="meta">Der Browser-Speicher ist nicht verfügbar. Listen gehen beim Schließen verloren.</p>
      {/if}
    </section>
  </div>
</div>
