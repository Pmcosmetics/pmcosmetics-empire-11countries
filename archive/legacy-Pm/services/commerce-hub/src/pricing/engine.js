export function calculatePrice({ basePrice, minPrice = null, maxPrice = null, adjustment = 0 }) {
  const price = Number(basePrice) + Number(adjustment);
  if (!Number.isFinite(price) || price < 0) throw new Error('invalid_price');

  const min = minPrice === null ? null : Number(minPrice);
  const max = maxPrice === null ? null : Number(maxPrice);
  if ((min !== null && (!Number.isFinite(min) || min < 0)) ||
      (max !== null && (!Number.isFinite(max) || max < 0)) ||
      (min !== null && max !== null && min > max)) {
    throw new Error('invalid_price_bounds');
  }

  if (min !== null && price < min) return Number(min.toFixed(2));
  if (max !== null && price > max) return Number(max.toFixed(2));
  return Number(price.toFixed(2));
}
