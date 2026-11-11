import { Furnace } from '../systems/crafting.js';
import { CursorStack, CraftingGrid } from '../player/containers.js';
import { BrewingStand } from '../systems/brewing.js';

const label = stack => stack ? `${stack.id === 'potion' ? stack.meta?.potion?.replaceAll('_',' ') : stack.id.replaceAll('_', ' ')}${stack.count > 1 ? ` ×${stack.count}` : ''}` : '';
export function createInventoryUI(inventory, containers = null) {
  const overlay = document.createElement('div'); overlay.className = 'container-overlay hidden';
  overlay.innerHTML = '<div class="container-panel"><h2>Inventory</h2><div class="craft"><div class="craft-grid"></div><b>→</b><button class="result slot" aria-label="Crafting output"></button></div><div class="inventory-grid"></div><div class="panel-actions"><button data-panel="inventory">Inventory</button><button data-panel="furnace">Furnace</button><button data-panel="brewing">Brewing Stand</button></div><div class="machine"></div></div><div class="cursor-stack" aria-hidden="true"></div>';
  document.body.append(overlay);
  const grid = overlay.querySelector('.inventory-grid'), craftElement = overlay.querySelector('.craft-grid'), result = overlay.querySelector('.result'), machine = overlay.querySelector('.machine'), cursorElement = overlay.querySelector('.cursor-stack');
  const cursor = new CursorStack(), crafting = new CraftingGrid(2), furnace = new Furnace(), brewing = new BrewingStand();
  let panel = 'inventory', activeContainer = null;
  const slotButton = (container, index, destination = null) => {
    const button = document.createElement('button'); button.className = 'slot'; button.textContent = label(container.slots[index]); button.title = container.slots[index]?.id ?? 'Empty slot';
    button.addEventListener('click', event => { cursor.click(container, index, event.shiftKey ? 'shift' : event.button === 2 ? 'right' : 'left', destination); render(); });
    button.addEventListener('contextmenu', event => { event.preventDefault(); cursor.click(container, index, 'right'); render(); });
    return button;
  };
  const furnaceAdapter = () => ({ get slots() { return [furnace.input, furnace.fuel, furnace.output]; } });
  const syncFurnace = slots => { [furnace.input, furnace.fuel, furnace.output] = slots; };
  const furnaceButton = index => {
    const button = document.createElement('button'); button.className = 'slot'; const stack = [furnace.input, furnace.fuel, furnace.output][index]; button.textContent = label(stack);
    const operate = operation => { const slots = [furnace.input, furnace.fuel, furnace.output]; const adapter = { slots }; if (operation === 'shift') { if (stack) { const remaining = inventory.add(stack.id, stack.count); slots[index] = remaining ? { ...stack, count: remaining } : null; } } else cursor.click(adapter, index, operation); syncFurnace(slots); render(); };
    button.addEventListener('click', event => operate(event.shiftKey ? 'shift' : 'left'));
    button.addEventListener('contextmenu', event => { event.preventDefault(); operate('right'); });
    return button;
  };
  const brewingButton = index => { const button = document.createElement('button'); button.className = 'slot'; const stack = [...brewing.inputs, brewing.ingredient, brewing.fuel][index]; button.textContent = label(stack); button.title = ['Left bottle','Middle bottle','Right bottle','Ingredient','Fuel'][index]; const operate = operation => { const slots = [...brewing.inputs, brewing.ingredient, brewing.fuel]; if (operation === 'shift' && stack) { const remaining = inventory.add(stack.id, stack.count, stack.meta); slots[index] = remaining ? { ...stack, count: remaining } : null; } else cursor.click({ slots }, index, operation); [brewing.inputs[0], brewing.inputs[1], brewing.inputs[2], brewing.ingredient, brewing.fuel] = slots; render(); }; button.addEventListener('click', event => operate(event.shiftKey ? 'shift' : 'left')); button.addEventListener('contextmenu', event => { event.preventDefault(); operate('right'); }); return button; };
  function render() {
    grid.replaceChildren(); for (let index = 0; index < 36; index += 1) grid.append(slotButton(inventory, index, activeContainer ?? crafting));
    craftElement.replaceChildren(); for (let index = 0; index < 4; index += 1) craftElement.append(slotButton(crafting, index));
    const output = crafting.output; result.textContent = output ? label(output) : ''; result.disabled = !output;
    cursorElement.textContent = label(cursor.held);
    overlay.querySelector('h2').textContent = panel === 'chest' ? 'Chest' : panel === 'furnace' ? 'Furnace' : panel === 'brewing' ? 'Brewing Stand' : 'Inventory';
    machine.replaceChildren();
    if (panel === 'chest' && activeContainer) { const chest = document.createElement('div'); chest.className = 'chest-grid'; for (let index = 0; index < activeContainer.size; index += 1) chest.append(slotButton(activeContainer, index, inventory)); machine.append(chest); }
    if (panel === 'furnace') { const row = document.createElement('div'); row.className = 'furnace-row'; row.append(furnaceButton(0), furnaceButton(1), furnaceButton(2)); const status = document.createElement('p'); status.textContent = `Burn ${furnace.burn} · Progress ${furnace.progress}/200`; machine.append(row, status); }
    if (panel === 'brewing') { const row = document.createElement('div'); row.className = 'brewing-row'; for(let index=0;index<5;index+=1)row.append(brewingButton(index)); const status = document.createElement('p'); status.textContent = `Fuel ${brewing.fuelUses}/20 · Progress ${brewing.progress}/400`; machine.append(row, status); }
  }
  result.addEventListener('click', () => { crafting.takeOutput(cursor); render(); });
  overlay.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => { activeContainer = null; panel = button.dataset.panel; render(); }));
  overlay.addEventListener('mousemove', event => { cursorElement.style.left = `${event.clientX + 12}px`; cursorElement.style.top = `${event.clientY + 12}px`; });
  const open = () => { overlay.classList.remove('hidden'); document.exitPointerLock(); render(); };
  const close = () => { crafting.returnItems(inventory); if (cursor.held) { inventory.add(cursor.held.id, cursor.held.count, cursor.held.meta); cursor.held = null; } overlay.classList.add('hidden'); activeContainer = null; panel = 'inventory'; };
  render();
  return { furnace, brewing, overlay, cursor, containers, toggle() { if (overlay.classList.contains('hidden')) open(); else close(); }, close, openChest(position) { if (!containers) return false; activeContainer = containers.at(position); panel = 'chest'; open(); return true; }, openFurnace() { activeContainer = null; panel = 'furnace'; open(); }, openBrewing() { activeContainer = null; panel = 'brewing'; open(); }, render };
}
