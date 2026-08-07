const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const RATE=400,PADDLE=100,MACHINE=300;
const photos=['court-1.webp','court-2.webp','court-3.webp','court-4.webp','court-5.webp'];
const allTimes=['7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM'];
let state={step:1,date:null,start:null,duration:1,courts:[],mode:'court',session:'Private 1-on-1',sessionPrice:900,paddles:0,machine:false,payment:'GCash'};
const toast=$('#toast');
function toastMsg(m){toast.textContent=m;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)}
function currency(n){return '₱'+n.toLocaleString()}

function dates(){let a=[],d=new Date();for(let i=0;i<7;i++){let x=new Date(d);x.setDate(d.getDate()+i);a.push(x)}return a}
function fmtDate(){return state.date?new Date(state.date+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}):''}
function endTime(){
  if(!state.start)return'';
  let idx=allTimes.indexOf(state.start)+state.duration;
  if(idx<allTimes.length)return allTimes[idx];
  return '11:00 PM';
}
function scheduleLabel(){return state.date&&state.start?`${fmtDate()} · ${state.start}–${endTime()}`:'—'}

function renderDates(){
  const w=$('#dateCarousel');w.innerHTML='';
  dates().forEach(d=>{
    const iso=d.toISOString().slice(0,10),b=document.createElement('button');
    b.className='date-choice'+(state.date===iso?' selected':'');
    b.innerHTML=`<span>${d.toLocaleDateString('en-US',{weekday:'short'})}</span><strong>${d.getDate()}</strong><span>${d.toLocaleDateString('en-US',{month:'short'})}</span>`;
    b.onclick=()=>{state.date=iso;state.start=null;state.courts=[];renderDates();renderTimes();renderCourts();updateAll()};
    w.appendChild(b)
  })
}

$$('[data-duration]').forEach(b=>b.onclick=()=>{
  state.duration=Number(b.dataset.duration);
  $$('[data-duration]').forEach(x=>x.classList.toggle('active',x===b));
  state.start=null;state.courts=[];renderTimes();renderCourts();updateAll()
});

function timeBlocked(startIdx){
  if(!state.date)return false;
  // deterministic demo booking pattern based on date
  const day=Number(state.date.slice(-2));
  for(let i=0;i<state.duration;i++){
    const idx=startIdx+i;
    if(idx>=allTimes.length)return true;
    if(((idx+day)%7===0)||((idx*2+day)%13===0)) return true;
  }
  return false
}
function renderTimes(){
  const w=$('#timeGrid');w.innerHTML='';
  allTimes.forEach((t,idx)=>{
    const b=document.createElement('button');b.textContent=t;b.className='time-choice';
    const blocked=timeBlocked(idx);
    if(blocked){b.classList.add('booked');b.disabled=true}
    if(state.start===t)b.classList.add('selected');
    b.onclick=()=>{state.start=t;state.courts=[];renderTimes();renderCourts();updateAll()};
    w.appendChild(b)
  });
  $('#availabilityLabel').textContent=state.date?fmtDate():'Select a date'
}

function courtAvailable(i){
  if(!state.date||!state.start)return false;
  const day=Number(state.date.slice(-2)),t=allTimes.indexOf(state.start);
  // Court-specific deterministic availability across requested duration
  for(let h=0;h<state.duration;h++){
    const slot=t+h;
    if(((day+i+slot)%6===0)||((day*2+i*3+slot)%11===0)) return false;
  }
  return true
}
function renderCourts(){
  const w=$('#courtOptions');if(!w)return;w.innerHTML='';
  let available=0;
  for(let i=1;i<=5;i++){
    const name=`Court ${i}`,avail=courtAvailable(i),selected=state.courts.includes(name);
    if(avail)available++;
    const b=document.createElement('button');
    b.className='court-option availability-court'+(selected?' selected':'')+(avail?'':' unavailable');
    b.disabled=!avail;
    b.innerHTML=`<div class="court-image-state"><img src="assets/${photos[i-1]}" alt="${name}"><span class="court-state-badge ${avail?'available':'unavailable'}">${avail?'Available':'Unavailable'}</span>${selected?'<i class="selected-check">✓</i>':''}</div><div><strong>${name}</strong><small>${avail?'Available for your selected time':'Already reserved for part of this schedule'}</small></div>`;
    if(avail)b.onclick=()=>{state.courts=selected?state.courts.filter(x=>x!==name):[...state.courts,name];renderCourts();updateAll()};
    w.appendChild(b)
  }
  $('#availableCourtCount').textContent=`${available} of 5 courts`;
  $('#courtSelectionCount').textContent=`${state.courts.length} court${state.courts.length===1?'':'s'}`;
  $('#availabilitySchedule').textContent=scheduleLabel();
  $('#courtAvailabilityDate').textContent=scheduleLabel();
}
$('#selectAllAvailable').onclick=()=>{state.courts=[1,2,3,4,5].filter(i=>courtAvailable(i)).map(i=>`Court ${i}`);renderCourts();updateAll()};

$$('[data-mode]').forEach(b=>b.onclick=()=>{
  state.mode=b.dataset.mode;
  $$('[data-mode]').forEach(x=>{const s=x===b;x.classList.toggle('selected',s);x.querySelector('b').textContent=s?'✓':''});
  $('#coachingOptions').classList.toggle('hidden',state.mode!=='coaching');
  $('#groupBookingNote').classList.toggle('hidden',state.mode!=='event' && state.courts.length<3);
  updateAll()
});
$$('.session-type').forEach(b=>b.onclick=()=>{
  state.session=b.dataset.session;state.sessionPrice=Number(b.dataset.price);
  $$('.session-type').forEach(x=>{let s=x===b;x.classList.toggle('selected',s);x.querySelector('b').textContent=s?'✓':''});
  updateAll()
});

$('#paddlePlus').onclick=()=>{if(state.paddles<10)state.paddles++;updateAll()};
$('#paddleMinus').onclick=()=>{if(state.paddles>0)state.paddles--;updateAll()};
$('#machineToggle').onchange=e=>{state.machine=e.target.checked;updateAll()};
$$('input[name=payment]').forEach(r=>r.onchange=e=>{state.payment=e.target.value;$$('.payment-card').forEach(c=>{const s=c.contains(e.target);c.classList.toggle('selected',s);c.querySelector('b').textContent=s?'✓':''});updateAll()});
$('#detailsForm').oninput=validate;

function baseTotal(){
  if(state.mode==='coaching') return state.sessionPrice*state.duration;
  return state.courts.length*RATE*state.duration
}
function total(){return baseTotal()+state.paddles*PADDLE+(state.machine?MACHINE*state.duration:0)}
function summaryItems(){
  let h='';
  if(state.date&&state.start)h+=`<div><span>${fmtDate()} · ${state.start}–${endTime()}</span><strong>${state.duration} hr${state.duration>1?'s':''}</strong></div>`;
  if(state.courts.length)h+=`<div><span>${state.courts.join(', ')}</span><strong>${state.courts.length} court${state.courts.length>1?'s':''}</strong></div>`;
  if(state.mode==='coaching')h+=`<div><span>${state.session} · Coach Raf</span><strong>${currency(state.sessionPrice*state.duration)}</strong></div>`;
  else if(state.courts.length)h+=`<div><span>${state.mode==='event'?'Event / group courts':'Court booking'}</span><strong>${currency(state.courts.length*RATE*state.duration)}</strong></div>`;
  if(state.paddles)h+=`<div><span>Paddle rental ×${state.paddles}</span><strong>${currency(state.paddles*PADDLE)}</strong></div>`;
  if(state.machine)h+=`<div><span>Ball machine ×${state.duration} hr</span><strong>${currency(MACHINE*state.duration)}</strong></div>`;
  return h||'<div><span>No billable selections yet</span><strong>—</strong></div>'
}
function updateSummary(){
  $('#paddleCount').textContent=state.paddles;
  if(state.step===1){$('#sumTitle').textContent='Choose your date & time';$('#sumSubtitle').textContent='Availability will appear after you select a schedule'}
  else if(state.step===2){$('#sumTitle').textContent='Choose your courts';$('#sumSubtitle').textContent=scheduleLabel()}
  else if(state.mode==='coaching'){$('#sumTitle').textContent='Coaching with Coach Raf';$('#sumSubtitle').textContent=`${state.session} · ${scheduleLabel()}`;$('#summaryImage').src='assets/coach-raf.webp';$('#summaryTag').textContent='Coach Raf'}
  else{$('#sumTitle').textContent=state.mode==='event'?'Event / Group Booking':'Court Booking';$('#sumSubtitle').textContent=`${state.courts.join(', ')} · ${scheduleLabel()}`;const first=state.courts[0];const idx=first?Number(first.split(' ')[1])-1:0;$('#summaryImage').src=`assets/${photos[idx]}`;$('#summaryTag').textContent=state.courts.length?`${state.courts.length} court${state.courts.length>1?'s':''}`:'NorthZone'}
  $('#summaryLines').innerHTML=summaryItems();$('#sumTotal').textContent=currency(total());$('#checkoutItems').innerHTML=summaryItems();$('#checkoutTotal').textContent=currency(total());
  $('#groupBookingNote').classList.toggle('hidden',state.mode!=='event' && state.courts.length<3)
}
function stepValid(){
  if(state.step===1)return!!state.date&&!!state.start;
  if(state.step===2)return state.courts.length>0;
  if(state.step===3)return!!state.mode;
  if(state.step===4)return true;
  if(state.step===5)return $('#detailsForm').checkValidity();
  if(state.step===6)return true;
  return true
}
function footerText(){
  if(state.step===1)return state.date&&state.start?scheduleLabel():'Choose a date and start time';
  if(state.step===2)return `${state.courts.length} court${state.courts.length===1?'':'s'} selected`;
  if(state.step===3)return state.mode==='coaching'?'Coaching with Coach Raf selected':state.mode==='event'?'Event / Group Booking selected':'Court Booking selected';
  if(state.step===4)return 'Equipment is optional';
  if(state.step===5)return 'Enter your booking details';
  if(state.step===6)return `Total ${currency(total())}`;
  return''
}
function validate(){$('#nextButton').disabled=!stepValid();$('#footerMessage').textContent=footerText()}
function renderProgress(){$$('.progress-item').forEach(p=>{const n=Number(p.dataset.jump);p.classList.toggle('active',n===Math.min(state.step,6));p.classList.toggle('done',n<state.step)})}
function go(n){
  state.step=n;$$('.flow-step').forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===n));
  $('#backButton').style.visibility=(n===1||n===7)?'hidden':'visible';$('#nextButton').style.display=n===7?'none':'inline-flex';$('#nextButton').textContent=n===6?(requiresApproval()?'Submit Booking Request':'Confirm Demo Payment'):'Continue';
  renderProgress();updateAll();window.scrollTo({top:0,behavior:'smooth'})
}
function requiresApproval(){return state.mode==='event'||state.courts.length>=3}
$('#nextButton').onclick=()=>{
  if(state.step===5&&!$('#detailsForm').reportValidity())return;
  if(state.step===6){renderConfirmation();go(7)}else go(state.step+1)
};
$('#backButton').onclick=()=>{if(state.step>1)go(state.step-1)};
function renderConfirmation(){
  const f=new FormData($('#detailsForm')), approval=requiresApproval();
  $('#confirmationKicker').textContent=approval?'BOOKING REQUEST SUBMITTED':'BOOKING PREVIEW COMPLETE';
  $('#confirmationTitle').textContent=approval?'NorthZone will review your request.':"You're all set.";
  $('#confirmationCopy').textContent=approval?'Large and event bookings are routed to NorthZone staff for confirmation. In production, you would receive an email once approved.':'This is a static preview. No real reservation or payment was created.';
  $('#confirmationTicket').innerHTML=`<div><span>Reference</span><strong>NZ-${Date.now().toString().slice(-7)}</strong></div><div><span>Name</span><strong>${f.get('name')||'Guest'}</strong></div><div><span>Schedule</span><strong>${scheduleLabel()}</strong></div><div><span>Courts</span><strong>${state.courts.join(', ')}</strong></div><div><span>Booking type</span><strong>${state.mode==='coaching'?`${state.session} · Coach Raf`:state.mode==='event'?'Event / Group Booking':'Court Booking'}</strong></div><div><span>Payment</span><strong>${state.payment}</strong></div><div><span>Total</span><strong>${currency(total())}</strong></div><div><span>Status</span><strong>${approval?'Pending Approval':'Demo Confirmed'}</strong></div>`
}
$('#startAgain').onclick=()=>location.reload();
function updateAll(){renderCourts();updateSummary();validate()}
renderDates();renderTimes();renderCourts();updateAll();go(1);