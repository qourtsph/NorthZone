(() => {
  const PUBLIC_KEY='northzone_platform_public_v1';
  const INBOUND_KEY='northzone_platform_inbound_v1';
  const CONTRACT_VERSION=1;
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const safeParse=(raw,fallback)=>{try{return JSON.parse(raw)}catch{return fallback}};
  const uuid=()=>globalThis.crypto?.randomUUID?.()||('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)}));
  function contract(){const c=safeParse(localStorage.getItem(PUBLIC_KEY)||'',null);return c&&c.schema==='northzone.platform.public'&&Number(c.contractVersion)===CONTRACT_VERSION?c:null}
  function source(){return contract()?'admin-public-contract':'bundled-static-fallback'}
  function booking(){return contract()?.booking||null}
  function bookingConfig(){return booking()?.configuration||null}
  function operatingHours(){return clone(booking()?.operatingHours||[])}
  function paymentMethods(){return clone(booking()?.paymentMethods||window.NorthZoneBundledMembershipSnapshot?.paymentMethods||{})}
  function courtRate(){const n=Number(booking()?.courtRate);return Number.isFinite(n)&&n>=0?n:null}
  function courts(){return clone(booking()?.courts||[])}
  function rentalEquipment(){return clone(booking()?.rentalEquipment||[])}
  function bookingBlocks(){return clone(booking()?.blocks||[])}
  function clockMinutes(v){const m=String(v||'').match(/^(\d{1,2}):(\d{2})$/);return m?Number(m[1])*60+Number(m[2]):0}
  function minutesClock(n){return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`}
  function format12(v){const [hh,mm]=String(v||'').split(':').map(Number);if(!Number.isFinite(hh))return String(v||'');const ap=hh>=12?'PM':'AM',h=hh%12||12;return `${h}:${String(mm||0).padStart(2,'0')} ${ap}`}
  function hoursForDate(date){if(!date)return null;const d=new Date(`${date}T12:00:00`);if(Number.isNaN(d.getTime()))return null;return operatingHours().find(r=>Number(r.day)===d.getDay())||null}
  function bookingSlotsForDate(date){const row=hoursForDate(date),cfg=bookingConfig();if(!row||row.enabled===false)return [];const step=Math.max(15,Number(cfg?.slotMinutes||60)),start=clockMinutes(row.open),end=clockMinutes(row.close),out=[];for(let m=start;m+step<=end;m+=step)out.push(format12(minutesClock(m)));return out}
  function unionBookingSlots(){const cfg=bookingConfig(),step=Math.max(15,Number(cfg?.slotMinutes||60)),rows=operatingHours().filter(r=>r.enabled!==false);if(!rows.length)return [];const start=Math.min(...rows.map(r=>clockMinutes(r.open))),end=Math.max(...rows.map(r=>clockMinutes(r.close))),out=[];for(let m=start;m+step<=end;m+=step)out.push(format12(minutesClock(m)));return out}
  function slotMinutes(){return Math.max(15,Number(bookingConfig()?.slotMinutes||60))}
  function publishedPolicy(type){return clone(booking()?.policies?.[type]||null)}
  function clubs(){return clone(contract()?.clubs||[])}
  function coaches(){return clone(contract()?.coaches||[])}
  function players(){return clone(contract()?.players||[])}
  function coachReviewEligibility(){return clone(contract()?.coachReviews?.eligibility||[])}
  function community(){return clone(contract()?.community||{posts:[],announcements:[],praise:[]})}
  function addOn(skuOrName){const needle=String(skuOrName||'').toLowerCase();return rentalEquipment().find(x=>String(x.sku||'').toLowerCase()===needle||String(x.name||'').toLowerCase().includes(needle))||null}
  function enqueue(type,payload={},meta={}){
    if(!type)return {ok:false,reason:'type_required'};
    const rows=safeParse(localStorage.getItem(INBOUND_KEY)||'',[]),list=Array.isArray(rows)?rows:[];
    const fingerprint=String(meta.fingerprint||payload.reference||payload.id||'');
    if(fingerprint){const existing=list.find(x=>x.type===type&&x.clientReference===fingerprint&&x.status==='pending');if(existing)return {ok:true,entry:clone(existing),duplicate:true}}
    const entry={id:'INB-'+uuid().replaceAll('-','').slice(0,12).toUpperCase(),contractVersion:CONTRACT_VERSION,type,status:'pending',source:meta.source||'NorthZone Client Site',clientReference:fingerprint,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),payload:clone(payload)};
    list.unshift(entry);localStorage.setItem(INBOUND_KEY,JSON.stringify(list));try{window.dispatchEvent(new CustomEvent('northzone:integration-inbound',{detail:{id:entry.id,type}}))}catch{}return {ok:true,entry:clone(entry),duplicate:false}
  }
  function inbound(){const x=safeParse(localStorage.getItem(INBOUND_KEY)||'',[]);return clone(Array.isArray(x)?x:[])}
  window.NorthZonePlatformBridge={publicKey:PUBLIC_KEY,inboundKey:INBOUND_KEY,contractVersion:CONTRACT_VERSION,contract,source,booking,bookingConfig,operatingHours,hoursForDate,bookingSlotsForDate,unionBookingSlots,slotMinutes,paymentMethods,courtRate,courts,rentalEquipment,bookingBlocks,publishedPolicy,clubs,coaches,players,coachReviewEligibility,community,addOn,enqueue,inbound};
})();