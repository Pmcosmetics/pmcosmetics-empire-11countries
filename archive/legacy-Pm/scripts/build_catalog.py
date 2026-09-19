#!/usr/bin/env python3
"""Build the PM Cosmetics HuB starter JSON feed from a CSV."""
import argparse,csv,json,urllib.parse
from pathlib import Path

FIELDS=['Product ID','name_ar','brand','category','description_ar','price_ref','price_pm','source','image_url','availability','whatsapp_cta']
ALLOWED={'Skin Care','Makeup','Hair Care','Body Care','Fragrance'}

def main():
 p=argparse.ArgumentParser();p.add_argument('csv_file');p.add_argument('--out',default='feeds/catalog-starter.json');p.add_argument('--phone',default='201055655649');p.add_argument('--markup',type=float,default=.30);a=p.parse_args()
 rows=[]
 with open(a.csv_file,encoding='utf-8-sig',newline='') as f:
  r=csv.DictReader(f)
  missing=[x for x in FIELDS if x not in r.fieldnames]
  if missing: raise SystemExit('Missing columns: '+', '.join(missing))
  for row in r:
   if row['category'] not in ALLOWED: continue
   ref=float(row['price_ref'])
   pm=round(ref*(1+a.markup),2) if not row.get('price_pm') else float(row['price_pm'])
   msg=f"مرحبًا، أريد طلب {row['name_ar']} ({row['Product ID']}) — السعر: {pm:.2f} EGP. الرجاء تأكيد التوفر والسعر النهائي."
   row['price_ref']=ref;row['price_pm']=pm;row['whatsapp_cta']='https://wa.me/'+a.phone+'?text='+urllib.parse.quote(msg)
   rows.append({k:row.get(k,'') for k in FIELDS})
 out={'brand':'PM Cosmetics HuB','currency':'EGP','markup':a.markup,'products':rows}
 Path(a.out).parent.mkdir(parents=True,exist_ok=True);Path(a.out).write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
 print(f'Wrote {len(rows)} products to {a.out}')
if __name__=='__main__': main()
