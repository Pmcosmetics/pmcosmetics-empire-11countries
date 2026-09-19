# Channel Adapter Contract

Every channel adapter exposes a stable, idempotent boundary between Commerce Hub and a sales channel.

Required operations:
- `pushProduct(product)`
- `pushInventory(inventory)`
- `pushPrice(price)`
- `deleteProduct(externalProductId)`
- `handleOrderWebhook(request)`

## Requirements
- Return normalized success/error results.
- Preserve an idempotency key for retried writes.
- Treat HTTP 429 as retryable and honor a channel-provided delay when available.
- Never require production credentials in unit or contract tests.
