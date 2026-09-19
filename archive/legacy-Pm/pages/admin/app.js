const CFG=window.PM_SUPABASE_CONFIG;
let client=null;
let allOrders=[];

const $=id=>document.getElementById(id);
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function waLink(o){
  const phone=(o.phone||'').replace(/\D/g,'');
  const text=`طلب ${o.order_id||''} — ${o.product_name||''} × ${o.quantity||1}`;
  return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : '#';
}
function statusOptions(current){
  return ['pending','confirmed','paid','shipped','delivered','cancelled'].map(s=>`<option value="${s}" ${s===current?'selected':''}>${s}</option>`).join('');
}
function render(){
  const q=$('search').value.toLowerCase(); const st=$('status').value;
  const rows=allOrders.filter(o=>{const hay=Object.values(o).join(' ').toLowerCase();return (!q||hay.includes(q))&&(!st||o.status===st)});
  $('summary').textContent=`${rows.length} طلب معروض · ${allOrders.length} إجمالي`;
  if(!rows.length){$('orders').innerHTML='<tr><td colspan="7">لا توجد نتائج.</td></tr>';return;}
  $('orders').innerHTML=rows.map(o=>`<tr>
    <td><strong>${esc(o.order_id)}</strong></td>
    <td>${esc(new Date(o.created_at).toLocaleDateString('ar-EG'))}<br><small>${esc(new Date(o.created_at).toLocaleTimeString('ar-EG'))}</small></td>
    <td>${esc(o.product_id)}<br>${esc(o.product_name)}</td>
    <td>${esc(o.quantity)}</td>
    <td>${esc(o.price_pm)} ${esc(o.currency)}</td>
    <td><select class="statusSelect" data-order="${esc(o.order_id)}">${statusOptions(o.status)}</select></td>
    <td class="actions"><a class="btn" href="${waLink(o)}" target="_blank" rel="noopener">واتساب</a><button class="btn secondary saveStatus" data-order="${esc(o.order_id)}">حفظ الحالة</button></td>
  </tr>`).join('');
}
async function load(){
  $('error').textContent='';
  const {data,error}=await client.from('orders').select('*').order('created_at',{ascending:false}).limit(500);
  if(error){$('error').textContent=`تعذر تحميل الطلبات: ${error.message}`;return;}
  allOrders=data||[];render();
}
async function saveStatus(orderId,select){
  $('error').textContent='';
  const {error}=await client.rpc('update_order_status',{p_order_id:orderId,p_status:select.value});
  if(error){$('error').textContent=`تعذر تحديث الطلب: ${error.message}`;return;}
  await load();
}
function showDashboard(user){
  $('loginGate').classList.add('hidden');$('dashboard').classList.remove('hidden');$('logout').classList.remove('hidden');
  load();
}
function showLogin(message=''){
  $('loginGate').classList.remove('hidden');$('dashboard').classList.add('hidden');$('logout').classList.add('hidden');$('loginError').textContent=message;
}
async function boot(){
  if(!CFG?.url||!CFG?.anonKey||CFG.url.includes('YOUR_PROJECT_REF')){showLogin('الإعداد غير مكتمل: انسخ config.example.js إلى config.js وأدخل Supabase URL وPublishable/anon key.');return;}
  if(!window.supabase){showLogin('تعذر تحميل مكتبة Supabase.');return;}
  client=window.supabase.createClient(CFG.url,CFG.anonKey);
  $('loginGithub').addEventListener('click',async()=>{
    $('loginError').textContent='جارٍ تحويلك إلى GitHub…';
    const {error}=await client.auth.signInWithOAuth({provider:'github',options:{redirectTo:`${location.origin}${location.pathname}`}});
    if(error)$('loginError').textContent=error.message;
  });
  $('logout').addEventListener('click',async()=>{await client.auth.signOut();showLogin();});
  $('search').addEventListener('input',render);$('status').addEventListener('change',render);$('reload').addEventListener('click',load);
  $('orders').addEventListener('click',e=>{const b=e.target.closest('.saveStatus');if(!b)return;const select=document.querySelector(`.statusSelect[data-order="${CSS.escape(b.dataset.order)}"]`);saveStatus(b.dataset.order,select);});
  const {data}=await client.auth.getSession();
  if(data.session)showDashboard(data.session.user);else showLogin();
  client.auth.onAuthStateChange((_event,session)=>session?showDashboard(session.user):showLogin());
}
boot();
