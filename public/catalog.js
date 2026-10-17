(function(){
"use strict";
const CSV_URL="/api/catalog/master.csv";
const $=id=>document.getElementById(id);
const esc=value=>String(value===undefined||value===null?"":value).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]);});
function parseCSV(text){
 const rows=[];let row=[],field="",quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else quoted=false;}else field+=c;}
  else{if(c==='"')quoted=true;else if(c===","){row.push(field);field="";}
   else if(c==="\n"){row.push(field.replace(/\r$/,""));field="";if(row.some(v=>v!==""))rows.push(row);row=[];}
   else field+=c;}
 }
 if(field!==""||row.length){row.push(field.replace(/\r$/,""));if(row.some(v=>v!==""))rows.push(row);}
 if(!rows.length)return[];
 const headers=rows.shift();
 return rows.map(values=>{const obj={};headers.forEach((key,i)=>obj[key]=values[i]||"");return obj;});
}
function decodeEntities(value){
 const map={amp:"&",lt:"<",gt:">",quot:'"',"#39":"'"};
 return String(value===undefined||value===null?"":value).replace(/&(amp|lt|gt|quot|#39);/g,function(m,e){return map[e];});
}
function isBeauty(p){
 const cat=String(p.category||"").toLowerCase();
 const name=String(p.product||"").toLowerCase();
 const beautyCategory=/(العناية بالبشرة|العناية بالشعر|العناية بالجسم|العطور|المكياج|منتجات تجميل وعناية|skin care|skincare|hair care|haircare|body care|perfume|fragrance|makeup|make-up|cosmetic|beauty care)/i.test(cat);
 const nonBeauty=/(blood glucose|accu.?chek|glucosamine|chondroitin|aptamil|infant|bebelac|nido|nestogen|similac|pediasure|pediamil|\bnan\b|resource junior|\bformula\b|diaper|wipes|bottle|sponge|\bdha\b|\bs\s*-?\s*26\b|milk powder|glucomannan|\bhero\b|\bbaby (digest|stage|formula|milk)|breast milk|wax strips|paracetamol|panadol|stopadol|strepsils|redoxon|centrum|omega|garcinia|raspberry ketone|green coffee|coenzyme|q10|chromium|multivitamin|perfectil|sofilife|effervescent|\d+\s*(capsules?|tablets?|tabs?|caps?)\b|\d+\s*loz|test strip|lancet|nebulizer|blood pressure|pressure monitor|glucometer|amipride|amiprostone|medicine|medical device|diet supplement|dietary supplement|vitamin|supplement|acai berry diet|collagen tablets|hair skin.{0,10}nails|syrup|inhaler|mg [0-9]{1,3} tab)/i.test(name);
 return beautyCategory&&!nonBeauty;
}
function normalizeProductIdentity(value){
 return String(value||"").normalize("NFKC").toLocaleLowerCase("en")
  .replace(/[\u064B-\u065F\u0670\u0640]/g,"")
  .replace(/[^\p{L}\p{N}]+/gu," ").replace(/\s+/g," ").trim();
}
function deduplicateProducts(rows){
 const groups=new Map();
 rows.forEach((product,index)=>{
  const name=normalizeProductIdentity(product.product);
  const brand=normalizeProductIdentity(product.brand);
  const sku=normalizeProductIdentity(product.sku);
  const key=name?("product:"+brand+"|"+name):sku?("sku:"+sku):("row:"+index);
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(product);
 });
 const quality=p=>(String(p.image||"").trim()?4:0)+(priceValue(p)!==null?4:0)+
  (String(p.description||"").trim()?1:0)+(String(p.sku||"").trim()?1:0);
 return Array.from(groups.values()).map(items=>{
  const best=items.reduce((current,candidate)=>quality(candidate)>quality(current)?candidate:current);
  const result={...best};
  const validPrices=Array.from(new Set(items.map(priceValue).filter(price=>price!==null)));
  // Conflicting duplicate prices are not guessed: suppress the displayed price until reviewed.
  if(validPrices.length>1)result.price_egp="";
  return result;
 });
}
function priceValue(p){const raw=String(p.price_egp||"").trim();const n=Number(raw);return raw!==""&&Number.isFinite(n)&&n>0?n:null;}
function money(n){return new Intl.NumberFormat("ar-EG",{maximumFractionDigits:2}).format(n)+" ج.م";}
function shortDesc(s){const value=String(s||"").replace(/\s+/g," ").trim();if(!value)return "الوصف التفصيلي يحتاج إلى مراجعة قبل النشر التجاري.";return value.length>145?value.slice(0,142).trim()+"…":value;}
function inquiryLink(p){
 const msg="مرحبًا PM Cosmetics Hub، أريد الاستفسار عن هذا الصنف فقط قبل تأكيد الطلب:\n"+(p.product||"منتج")+"\n"+(p.brand||"")+"\nSKU: "+(p.sku||"غير متوفر")+"\nبرجاء تأكيد السعر الحالي والتوافر الفعلي.";
 return "https://wa.me/201055655649?text="+encodeURIComponent(msg);
}
let all=[],filtered=[],page=1;const PAGE_SIZE=24;
function loadMarkets(){
 const names={EG:{ar:"مصر",flag:"🇪🇬",region:"شمال أفريقيا"},SA:{ar:"السعودية",flag:"🇸🇦",region:"الخليج العربي"},AE:{ar:"الإمارات",flag:"🇦🇪",region:"الخليج العربي"},KW:{ar:"الكويت",flag:"🇰🇼",region:"الخليج العربي"},QA:{ar:"قطر",flag:"🇶🇦",region:"الخليج العربي"},BH:{ar:"البحرين",flag:"🇧🇭",region:"الخليج العربي"},OM:{ar:"عُمان",flag:"🇴🇲",region:"الخليج العربي"},JO:{ar:"الأردن",flag:"🇯🇴",region:"بلاد الشام"},PS:{ar:"فلسطين",flag:"🇵🇸",region:"بلاد الشام"},LB:{ar:"لبنان",flag:"🇱🇧",region:"بلاد الشام"},IR:{ar:"إيران",flag:"🇮🇷",region:"غرب آسيا"}};
 fetch("/api/markets").then(r=>{if(!r.ok)throw new Error("markets");return r.json()}).then(data=>{
  const items=Array.isArray(data.markets)?data.markets:[];
  const target=$("catalogCountryGrid");if(!target)return;
  target.innerHTML=items.map(m=>{const meta=names[m.id]||{ar:m.name,flag:"🌍",region:m.region||"سوق مستهدف"};const currency=String(m.currency||"").toUpperCase();const message="مرحبًا PM Cosmetics Hub، أستفسر عن الطلب في سوق "+meta.ar+" ("+currency+"). برجاء تأكيد السعر المحلي للمنتج، والتوافر، والشحن، ووسيلة الدفع قبل الطلب.";const href="https://wa.me/201055655649?text="+encodeURIComponent(message);return '<article class="country-card"><div class="country-head"><span class="country-flag">'+meta.flag+'</span><div><div class="country-name">'+esc(meta.ar)+'</div><div class="country-region">'+esc(meta.region)+'</div></div></div><div class="country-currency">'+esc(currency)+' · '+esc(m.currencySymbol||"")+'</div><div class="country-note">سوق مستهدف • السعر والتوصيل يحتاجان إلى تأكيد</div><a class="country-button" href="'+href+'" target="_blank" rel="noopener">اسأل عن هذا السوق ↗</a></article>'}).join("")||'<div class="empty">لا توجد بيانات أسواق متاحة.</div>';
 }).catch(()=>{const target=$("catalogCountryGrid");if(target)target.innerHTML='<div class="empty">تعذر تحميل الأسواق حاليًا. تواصل معنا لتأكيد الشحن والسعر المحلي.</div>';});
}
function fillCategories(items){
 const select=$("category");const names=Array.from(new Set(items.map(p=>String(p.category||"").trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b,"ar"));
 names.forEach(name=>{const option=document.createElement("option");option.value=name;option.textContent=name;select.appendChild(option);});
}
function render(){
 const query=$("search").value.trim().toLocaleLowerCase();const category=$("category").value;const sort=$("sort").value;
 filtered=all.filter(p=>{
  const matchCategory=!category||String(p.category||"").trim()===category;
  const text=[p.product,p.brand,p.category,p.description,p.sku].join(" ").toLocaleLowerCase();
  return matchCategory&&(!query||text.includes(query));
 });
 filtered.sort((a,b)=>{
  if(sort==="price-low")return (priceValue(a)??Infinity)-(priceValue(b)??Infinity);
  if(sort==="price-high")return (priceValue(b)??-1)-(priceValue(a)??-1);
  return String(a.product||"").localeCompare(String(b.product||""),"en",{sensitivity:"base"});
 });
 const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));page=Math.min(page,pages);
 const start=(page-1)*PAGE_SIZE;const rows=filtered.slice(start,start+PAGE_SIZE);
 $("visibleCount").textContent=new Intl.NumberFormat("en-US").format(all.length);
 $("resultText").innerHTML="النتائج: <strong>"+new Intl.NumberFormat("en-US").format(filtered.length)+"</strong> صنف";
 $("pageInfo").textContent="صفحة "+page+" من "+pages;
 $("prev").disabled=page<=1;$("next").disabled=page>=pages;
 if(!rows.length){$("grid").innerHTML='<div class="empty">لا توجد نتائج مطابقة. غيّر كلمة البحث أو الفئة.</div>';return;}
 $("grid").innerHTML=rows.map(p=>{
  const name=String(p.product||"اسم الصنف غير مكتمل").trim();const image=String(p.image||"").trim();const price=priceValue(p);
  const img=image?'<img loading="lazy" src="'+esc(image)+'" alt="'+esc(name)+'" referrerpolicy="no-referrer" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">':"";
  const noimg='<div class="noimg"'+(image?' style="display:none"':"")+'><img src="/pmcosmetics-logo.svg" alt=""><span>الصورة غير متوفرة في الملف</span></div>';
  const priceText=price===null?"السعر يحتاج إلى مراجعة":money(price);
  const description=shortDesc(p.description);
  return '<article class="product"><div class="photo">'+img+noimg+'<span class="category-tag">'+esc(p.category||"فئة غير محددة")+'</span></div><div class="pbody"><div class="brandtag">'+esc(p.brand||"PM COSMETICS HUB")+'</div><div class="name">'+esc(name)+'</div><div class="desc">'+esc(description)+'</div><div class="priceRow"><div><div class="priceLabel">السعر المسجل في الملف</div><div class="price">'+esc(priceText)+'</div></div></div><div class="sku">SKU: '+esc(p.sku||"غير محدد")+'</div><div class="pbuttons"><a class="btn main" href="'+esc(inquiryLink(p))+'" target="_blank" rel="noopener">استفسار عن السعر والتوافر ↗</a></div></div></article>';
 }).join("");
}
$("search").addEventListener("input",function(){page=1;render();});
$("category").addEventListener("change",function(){page=1;render();});
$("sort").addEventListener("change",function(){page=1;render();});
$("prev").addEventListener("click",function(){if(page>1){page--;render();$("products").scrollIntoView({behavior:"smooth"});}});
$("next").addEventListener("click",function(){if(page<Math.ceil(filtered.length/PAGE_SIZE)){page++;render();$("products").scrollIntoView({behavior:"smooth"});}});
fetch(CSV_URL,{headers:{"Accept":"text/csv"}}).then(function(response){if(!response.ok)throw new Error("تعذر تحميل الملف");return response.text();}).then(function(text){
 const rows=parseCSV(text);$("totalCount").textContent=new Intl.NumberFormat("en-US").format(rows.length);
 rows.forEach(function(r){Object.keys(r).forEach(function(k){r[k]=decodeEntities(r[k]);});});
 all=deduplicateProducts(rows.filter(isBeauty));
 fillCategories(all);
 const params=new URLSearchParams(window.location.search);
 if(params.get("q"))$("search").value=params.get("q");
 if(params.get("category")&&Array.from($("category").options).some(o=>o.value===params.get("category")))$("category").value=params.get("category");
 render();
 loadMarkets();
}).catch(function(){
 $("grid").innerHTML='<div class="empty">تعذر تحميل ملف المنتجات الآن. يمكنك استخدام كتالوج واتساب أو التواصل مباشرة.</div>';
 $("resultText").textContent="تعذر تحميل بيانات الأصناف";$("totalCount").textContent="—";$("visibleCount").textContent="—";
});
})();
