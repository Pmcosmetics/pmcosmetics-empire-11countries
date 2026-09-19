export function assertAdapter(adapter) {
  const required = ['pushProduct', 'pushInventory', 'pushPrice', 'deleteProduct', 'handleOrderWebhook'];
  for (const method of required) {
    if (typeof adapter?.[method] !== 'function') throw new Error(`adapter_missing_${method}`);
  }
  return adapter;
}
