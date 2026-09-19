#!/usr/bin/env bash
set -euo pipefail

FILE="feeds/catalog-starter.json"

if [ ! -f "$FILE" ]; then
  echo "ERROR: $FILE not found"
  exit 1
fi

echo "========================================"
echo " PM Cosmetics HuB — Catalog Validation"
echo " File: $FILE"
echo "========================================"

fail=0
count=0
TMPHEAD="/tmp/validate_catalog_head.$$"
trap 'rm -f "$TMPHEAD"' EXIT

command -v jq >/dev/null 2>&1 || { echo "ERROR: jq مطلوب. ثبته ثم أعد التشغيل."; exit 2; }
command -v curl >/dev/null 2>&1 || { echo "ERROR: curl مطلوب. ثبته ثم أعد التشغيل."; exit 2; }

if ! jq empty "$FILE" >/dev/null 2>&1; then
  echo "FAIL: Invalid JSON"
  exit 1
fi
echo "OK: JSON is valid"

while IFS= read -r p; do
  count=$((count + 1))

  id=$(echo "$p" | jq -r '.product_id // empty')
  name=$(echo "$p" | jq -r '.name_ar // empty')
  img=$(echo "$p" | jq -r '.image_url // empty')
  wa=$(echo "$p" | jq -r '.whatsapp_cta // empty')
  price=$(echo "$p" | jq -r '.price_pm // empty')
  avail=$(echo "$p" | jq -r '.availability // empty')
  catg=$(echo "$p" | jq -r '.category // empty')

  echo
  echo "----------------------------------------"
  echo "${id:-<no-id>} — ${name:-<no-name>}"

  for field in product_id name_ar brand category description_ar price_ref price_pm source image_url availability whatsapp_cta; do
    if [ "$(echo "$p" | jq "has(\"$field\")")" != "true" ]; then
      echo "FAIL: missing field '$field'"
      fail=$((fail+1))
    else
      val=$(echo "$p" | jq -r ".\"$field\" // \"\"")
      if [ -z "$val" ]; then
        echo "FAIL: empty value for '$field'"
        fail=$((fail+1))
      fi
    fi
  done

  case "$catg" in
    "Skin Care"|"Makeup"|"Hair Care"|"Body Care"|"Fragrance") echo "OK: category=$catg" ;;
    *) echo "FAIL: invalid category='$catg'"; fail=$((fail+1)) ;;
  esac

  case "$avail" in
    InStock|OutOfStock|Preorder|Limited) echo "OK: availability=$avail" ;;
    *) echo "FAIL: invalid availability='$avail'"; fail=$((fail+1)) ;;
  esac

  if echo "$price" | grep -Eq '^[0-9]+([.][0-9]+)?$'; then
    echo "OK: price_pm=$price"
  else
    echo "FAIL: price_pm not numeric -> '$price'"
    fail=$((fail+1))
  fi

  if [ -z "$img" ]; then
    echo "FAIL: image_url missing"
    fail=$((fail+1))
  elif [[ ! "$img" =~ ^https:// ]]; then
    echo "FAIL: image_url is not HTTPS -> $img"
    fail=$((fail+1))
  else
    echo "Checking image: $img"
    : > "$TMPHEAD"
    if curl -sS -I --max-time 15 --location --retry 2 "$img" -o "$TMPHEAD" 2>/dev/null; then
      :
    else
      curl -sS -D "$TMPHEAD" --max-time 20 --location --retry 2 -o /dev/null "$img" 2>/dev/null || true
    fi

    status=$(awk '/^HTTP\// {code=$2} END {print code}' "$TMPHEAD" || true)
    content_type=$(awk -F': ' 'tolower($1)=="content-type" {print $2}' "$TMPHEAD" | tr -d '\r' | tail -n1 || true)

    if [ -z "$status" ]; then
      echo "FAIL: Unable to get HTTP status for image"
      fail=$((fail+1))
    elif [ "$status" = "200" ] || [ "$status" = "204" ]; then
      echo "OK: HTTP $status"
    else
      echo "FAIL: HTTP status=$status"
      fail=$((fail+1))
    fi

    if echo "$content_type" | grep -qiE '^image/'; then
      echo "OK: Content-Type=$content_type"
    else
      echo "FAIL: Content-Type not image/* -> $content_type"
      fail=$((fail+1))
    fi
  fi

  if echo "$wa" | grep -Eq '^https://wa\.me/[0-9]{6,15}(\?text=.*)?$'; then
    echo "OK: WhatsApp CTA"
  else
    echo "FAIL: invalid WhatsApp CTA -> $wa"
    fail=$((fail+1))
  fi
done < <(jq -c '.products[]' "$FILE")

echo
echo "========================================"
echo " QA SUMMARY"
echo "========================================"
echo "Products checked: $count"
echo "Failures:         $fail"

if [ "$count" -eq 0 ]; then
  echo "REJECT: No products found"
  exit 1
fi

if [ "$fail" -eq 0 ]; then
  echo
  echo "RESULT: PASS — يمكنك دمج PR#15"
  exit 0
else
  echo
  echo "RESULT: FAIL — راجع الأخطاء أعلاه وقم بالإصلاح ثم أعد الفحص"
  exit 2
fi
