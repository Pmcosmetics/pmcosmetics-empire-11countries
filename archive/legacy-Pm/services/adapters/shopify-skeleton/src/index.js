import { assertAdapter } from '../../../../adapters/contract/interfaces.js';

const adapter = assertAdapter({
  async pushProduct(product, context = {}) {
    return { ok: true, operation: 'pushProduct', product, idempotencyKey: context.idempotencyKey ?? null, mock: true };
  },
  async pushInventory(inventory) { return { ok: true, operation: 'pushInventory', inventory, mock: true }; },
  async pushPrice(price) { return { ok: true, operation: 'pushPrice', price, mock: true }; },
  async deleteProduct(externalProductId) { return { ok: true, operation: 'deleteProduct', externalProductId, mock: true }; },
  async handleOrderWebhook(request) { return { ok: true, operation: 'handleOrderWebhook', request, mock: true }; }
});

export default adapter;
