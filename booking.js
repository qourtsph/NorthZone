const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const PLATFORM=window.NorthZonePlatformBridge;
const RATE=Number(PLATFORM?.courtRate?.()??400);
const PADDLE=Number(PLATFORM?.addOn?.('paddle')?.price??100);
const MACHINE=Number(PLATFORM?.addOn?.('ball machine')?.price??300);
const SLOT_MINUTES=Math.max(15,Number(PLATFORM?.slotMinutes?.()||60));
const SLOT_HOURS=SLOT_MINUTES/60;
const photos=['court-1.webp','court-2.webp','court-3.webp','court-4.webp','court-5.webp'];
const FALLBACK_TIMES=['7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM'];
const allTimes=PLATFORM?.unionBookingSlots?.()?.length?PLATFORM.unionBookingSlots():FALLBACK_TIMES;

const now=new Date();
const TODAY=new Date(now.getFullYear(),now.getMonth(),now.getDate());
const TODAY_ISO=`${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`;
const ADVANCE_DAYS=Number(PLATFORM?.bookingConfig?.()?.advanceBookingDays||0);
const MAX_DATE=ADVANCE_DAYS>0?new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()+ADVANCE_DAYS):new Date(TODAY.getFullYear()+2,TODAY.getMonth(),TODAY.getDate());

let calendarCursor=new Date(TODAY.getFullYear(),TODAY.getMonth(),1);
let state={step:1,bookingContext:'individual',date:TODAY_ISO,times:[],courts:[],cart:[],purpose:'',trainingMode:'',coachingGoals:[],otherGoal:'',coachingNotes:'',coachingTimes:[],coachingStudents:1,coachId:'',clubExpectedPlayers:'',paddles:0,machineQty:0,wallet:'GCash',paymentReference:'',savingsCode:'none',confirmationRef:'',submissionRecorded:false,integrationQueued:false};

const toast=$('#toast');
const currency=n=>'₱'+n.toLocaleString();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const isoDate=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseISO=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d)};
const sameDate=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
const timeIndex=t=>allTimes.indexOf(t);
const timeMinutes12=t=>{const m=String(t||'').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);if(!m)return 0;let h=Number(m[1])%12;if(m[3].toUpperCase()==='PM')h+=12;return h*60+Number(m[2])};
const minutesTo12=n=>{const h24=Math.floor(n/60)%24,m=n%60,ap=h24>=12?'PM':'AM',h=h24%12||12;return `${h}:${String(m).padStart(2,'0')} ${ap}`};
const hourEnd=t=>{let i=timeIndex(t);return i>=0&&i<allTimes.length-1?allTimes[i+1]:minutesTo12(timeMinutes12(t)+SLOT_MINUTES)};

// ============================================================
// Individual / Club booking context
// ============================================================
function clubSession(){return window.NorthZoneClubRegistry?.currentSession?.()||null}
function currentClub(){return window.NorthZoneClubRegistry?.currentClub?.()||null}
function currentClubRep(){return window.NorthZoneClubRegistry?.currentRepresentative?.()||null}
function isClubBooking(){return state.bookingContext==='club'}
function clubAuthenticated(){const c=currentClub(),r=currentClubRep();return !!(c&&r&&c.status==='approved'&&r.bookingPermission)}
function validRate(v,fallback){const n=Number(v);return Number.isFinite(n)&&n>0?n:fallback}
function activeCourtRate(){return RATE}
function activePaddleRate(){return PADDLE}
function activeMachineRate(){return MACHINE}
function effectiveCoachRate(coach){return Number(coach?.rate||0)}
function clubHasPrivatePricing(){
  const p=currentClub()?.pricing||{};
  return isClubBooking()&&clubAuthenticated()&&[p.courtRate,p.paddleRate,p.ballMachineRate,p.coachRate].some(v=>Number(v)>0);
}
function resetPurposeForContext(){
  state.purpose='';state.trainingMode='';state.coachingGoals=[];state.otherGoal='';state.coachingNotes='';state.coachingTimes=[];state.coachingStudents=1;state.coachId='';state.clubExpectedPlayers='';state.savingsCode='none';
  const eg=$('#clubExpectedPlayers');if(eg)eg.value='';
  const oi=$('#otherGoalInput');if(oi)oi.value='';
  const cn=$('#coachingNotes');if(cn)cn.value='';
}
function clearBookingCartForContextChange(){
  state.cart=[];state.date=TODAY_ISO;state.times=[];state.courts=[];state.paddles=0;state.machineQty=0;state.savingsCode='none';
  renderCalendar();renderCart();renderBuilder();
}
function setBookingContext(context){
  if(!['individual','club'].includes(context)||context===state.bookingContext)return;
  if(state.cart.length&&!confirm('Changing the booking type will clear the current reservation cart. Continue?')){renderBookingContext();return}
  if(state.cart.length)clearBookingCartForContextChange();
  state.bookingContext=context;resetPurposeForContext();renderBookingContext();renderPurposeState();renderDetailsContext();updateAll();
}
function renderBookingContext(){
  $$('[data-booking-context]').forEach(b=>b.classList.toggle('active',b.dataset.bookingContext===state.bookingContext));
  const gate=$('#clubAccessGate'),verified=$('#clubVerifiedBanner'),builder=$('#reservationBuilderShell');
  const clubMode=isClubBooking(),authenticated=clubAuthenticated();
  gate?.classList.toggle('hidden',!clubMode||authenticated);
  verified?.classList.toggle('hidden',!clubMode||!authenticated);
  builder?.classList.toggle('club-locked',clubMode&&!authenticated);
  $('#bookingClubPortal')?.classList.toggle('hidden',!clubMode||!authenticated);
  $('#summaryClubAccount')?.classList.toggle('hidden',!clubMode||!authenticated);
  if(clubMode&&authenticated){
    const c=currentClub(),r=currentClubRep();
    $('#bookingClubName').textContent=c.name;
    $('#bookingClubMeta').textContent=`${c.clubId} · Booking as ${r.name}${clubHasPrivatePricing()?' · Special rate available at checkout':''}`;
    $('#summaryClubName').textContent=c.name;
    $('#summaryClubPricing').textContent=clubHasPrivatePricing()?'Special club rate can be selected at checkout':'Approved club account';
  }
  validate();
}
function prefillClubRepresentative(){
  if(!isClubBooking()||!clubAuthenticated())return;
  const r=currentClubRep();if(!r)return;
  const form=$('#detailsForm');if(!form)return;
  const name=form.elements.name,email=form.elements.email,mobile=form.elements.mobile;
  if(name&&!name.value)name.value=r.name||'';
  if(email&&!email.value)email.value=r.email||'';
  if(mobile&&!mobile.value)mobile.value=r.mobile||'';
}
// Ball Machine availability is derived from the NorthZone Equipment list.
// The current Admin registry has one serviceable Ball Machine asset.
// Adding another Good Condition Ball Machine equipment record automatically
// increases the booking quantity without any client UI code change.
const addDaysISO=(base,days)=>{const d=new Date(base.getFullYear(),base.getMonth(),base.getDate()+days);return isoDate(d)};

// Static booking reservations stand in for the production reservation table.
// Reservations are asset-specific so multiple registered machines can be
// independently booked and counted.
const DEMO_EQUIPMENT_RESERVATIONS=[
  {equipmentId:'EQ-001',date:addDaysISO(TODAY,1),times:['9:00 AM','10:00 AM']},
  {equipmentId:'EQ-001',date:addDaysISO(TODAY,3),times:['6:00 PM','7:00 PM']},
  {equipmentId:'EQ-001',date:addDaysISO(TODAY,6),times:['3:00 PM','4:00 PM']}
];

function ballMachineAssets(){
  return window.NorthZoneEquipmentRegistry?.serviceableByType('Ball Machine')||[];
}
function bookedEquipmentIdsAt(date,time){
  return new Set(
    DEMO_EQUIPMENT_RESERVATIONS
      .filter(r=>r.date===date&&(r.times||[]).includes(time))
      .map(r=>r.equipmentId)
  );
}
function availableBallMachineAssetsAt(date,time){
  const booked=bookedEquipmentIdsAt(date,time);
  return ballMachineAssets().filter(asset=>!booked.has(asset.id));
}
function machineRequestedSlots(){
  const seen=new Map();
  state.cart.forEach(r=>(r.times||[]).forEach(time=>seen.set(`${r.date}|${time}`,{date:r.date,time})));
  return [...seen.values()].sort((a,b)=>a.date.localeCompare(b.date)||timeIndex(a.time)-timeIndex(b.time));
}
function serviceClockHours(){return machineRequestedSlots().length*SLOT_HOURS}
function machineHours(){return serviceClockHours()}
function intersectAssetsForSlots(slots){
  const assets=ballMachineAssets();
  if(!slots.length)return [];
  let common=new Set(assets.map(a=>a.id));
  for(const slot of slots){
    const available=new Set(availableBallMachineAssetsAt(slot.date,slot.time).map(a=>a.id));
    common=new Set([...common].filter(id=>available.has(id)));
    if(!common.size)break;
  }
  return assets.filter(a=>common.has(a.id));
}
function requestedMachineBlockLength(date,focusTime){
  const times=[...new Set(machineRequestedSlots().filter(x=>x.date===date).map(x=>x.time))]
    .sort((a,b)=>timeIndex(a)-timeIndex(b));
  if(!times.length)return 1;
  const focus=Math.max(0,times.indexOf(focusTime));
  let start=focus,end=focus;
  while(start>0&&timeIndex(times[start])===timeIndex(times[start-1])+1)start--;
  while(end<times.length-1&&timeIndex(times[end+1])===timeIndex(times[end])+1)end++;
  return Math.max(1,end-start+1);
}
function availableAssetsForWindow(date,times){
  return intersectAssetsForSlots(times.map(time=>({date,time})));
}
function findNextMachineWindow(fromDate,fromTime,duration=1){
  const startDate=parseISO(fromDate);
  for(let dayOffset=0;dayOffset<=730;dayOffset++){
    const d=new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate()+dayOffset);
    if(d>MAX_DATE)break;
    const date=isoDate(d);
    let startIdx=0;
    if(dayOffset===0)startIdx=Math.max(0,timeIndex(fromTime)+1);
    for(let i=startIdx;i<=allTimes.length-duration;i++){
      const times=allTimes.slice(i,i+duration);
      const available=availableAssetsForWindow(date,times);
      if(available.length){
        return {
          date,
          times,
          start:times[0],
          end:hourEnd(times[times.length-1]),
          availableQty:available.length
        };
      }
    }
  }
  return null;
}
function machineAvailability(){
  const registered=ballMachineAssets();
  const requested=machineRequestedSlots();

  if(!registered.length){
    return {available:false,reason:'not_registered',totalRegistered:0,availableQty:0,availableAssets:[],next:null};
  }
  if(!requested.length){
    return {available:false,reason:'no_schedule',totalRegistered:registered.length,availableQty:0,availableAssets:[],next:null};
  }

  const availableAssets=intersectAssetsForSlots(requested);
  if(availableAssets.length){
    return {
      available:true,
      reason:'available',
      totalRegistered:registered.length,
      availableQty:availableAssets.length,
      availableAssets,
      next:null
    };
  }

  const first=requested.find(slot=>availableBallMachineAssetsAt(slot.date,slot.time).length===0)||requested[0];
  const duration=requestedMachineBlockLength(first.date,first.time);
  return {
    available:false,
    reason:'booked',
    totalRegistered:registered.length,
    availableQty:0,
    availableAssets:[],
    next:findNextMachineWindow(first.date,first.time,duration)
  };
}
function formatMachineWindow(next){
  if(!next)return 'No later availability found in the current booking window.';
  const date=parseISO(next.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  return `${date} · ${next.start}–${next.end} · ${next.availableQty} available`;
}
function machineAvailabilityLabel(info){
  if(info.totalRegistered<=1)return `${info.availableQty} available for your selected schedule`;
  return `${info.availableQty} of ${info.totalRegistered} available for your selected schedule`;
}
function machineDisabledToggle(){
  return `<label class="ios-switch machine-switch is-disabled"><input type="checkbox" disabled><span></span></label>`;
}
function bindMachineControl(info){
  const toggle=$('#machineToggleDynamic');
  if(toggle){
    toggle.onchange=e=>{
      const current=machineAvailability();
      if(current.availableQty!==1){
        state.machineQty=0;
        updateAll();
        return;
      }
      state.machineQty=e.target.checked?1:0;
      updateAll();
    };
  }

  const minus=$('#machineMinus'),plus=$('#machinePlus');
  if(minus)minus.onclick=()=>{
    if(state.machineQty>0)state.machineQty--;
    updateAll();
  };
  if(plus)plus.onclick=()=>{
    const current=machineAvailability();
    if(state.machineQty<current.availableQty)state.machineQty++;
    updateAll();
  };
}
function renderMachineAvailability(){
  const card=$('#machineAddonCard');
  const status=$('#machineAvailabilityStatus');
  const nextEl=$('#machineNextAvailability');
  const control=$('#machineControl');
  if(!card||!status||!nextEl||!control)return;

  const info=machineAvailability();
  card.classList.remove('addon-unavailable','addon-pending');
  status.classList.remove('available','booked','pending');
  nextEl.classList.add('hidden');
  nextEl.textContent='';

  if(info.reason==='not_registered'){
    state.machineQty=0;
    card.classList.add('addon-unavailable');
    status.classList.add('booked');
    status.textContent='No serviceable ball machine is currently registered.';
    control.innerHTML=machineDisabledToggle();
    return;
  }

  if(info.reason==='no_schedule'){
    state.machineQty=0;
    card.classList.add('addon-pending');
    status.classList.add('pending');
    status.textContent=`${info.totalRegistered} registered · add a court reservation to check availability.`;
    control.innerHTML=machineDisabledToggle();
    return;
  }

  if(!info.available){
    state.machineQty=0;
    card.classList.add('addon-unavailable');
    status.classList.add('booked');
    status.textContent='Ball machine is booked for this schedule.';
    nextEl.classList.remove('hidden');
    nextEl.innerHTML=`<strong>Soonest availability</strong><span>${formatMachineWindow(info.next)}</span>`;
    control.innerHTML=machineDisabledToggle();
    return;
  }

  // Never allow a previously selected quantity to exceed current availability.
  state.machineQty=Math.min(state.machineQty,info.availableQty);
  status.classList.add('available');
  status.textContent=machineAvailabilityLabel(info);

  // UI rule:
  // 1 available -> toggle
  // 2+ available -> paddle-style quantity selector
  if(info.availableQty===1){
    control.innerHTML=`<label class="ios-switch machine-switch"><input type="checkbox" id="machineToggleDynamic" ${state.machineQty===1?'checked':''}><span></span></label>`;
  }else{
    control.innerHTML=`<div class="qty-control machine-qty-control">
      <button id="machineMinus" aria-label="Remove one ball machine">−</button>
      <strong id="machineCount">${state.machineQty}</strong>
      <button id="machinePlus" aria-label="Add one ball machine" ${state.machineQty>=info.availableQty?'disabled':''}>+</button>
    </div>`;
  }
  bindMachineControl(info);
}

// ============================================================
// Booking Purpose + Coaching Goals + Coach Matching
// ============================================================
const GOAL_ALIASES={
  'Dinking':['dink','dinking'],
  'Serve':['serve','serving','service'],
  'Return of Serve':['return of serve','return','returns'],
  'Drives':['drive','drives','groundstroke','groundstrokes'],
  'Drops / Third-Shot Drops':['drop','drops','third shot drop','third-shot drop','third shot drops'],
  'Resets':['reset','resets'],
  'Lobs':['lob','lobs'],
  'Volleys / Hand Speed':['volley','volleys','hand speed','hands'],
  'Transition Zone':['transition','transition zone','midcourt','mid-court'],
  'Defense':['defense','defence','defensive'],
  'Footwork / Movement':['footwork','movement','mobility'],
  'Court Positioning':['court positioning','positioning'],
  'Doubles Strategy':['doubles strategy','strategy','doubles'],
  'Shot Selection / Decision Making':['shot selection','decision making','decision-making'],
  'Consistency':['consistency','consistent'],
  'Match / Tournament Preparation':['match preparation','tournament preparation','competition','competitive'],
  'Other':['other']
};

const normalized=s=>String(s||'').trim().toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ');
function isTraining(){return state.purpose==='Training'||state.purpose==='Club Training / Drills'}
function wantsCoach(){return isTraining()&&state.trainingMode==='Train with a Coach'}

function resetCoachBrief(){
  state.coachingGoals=[];
  state.otherGoal='';
  state.coachingNotes='';
  state.coachingTimes=[];
  state.coachingStudents=1;
  state.coachId='';
  const other=$('#otherGoalInput'),notes=$('#coachingNotes'),students=$('#coachingStudentsCount');
  if(other)other.value='';
  if(notes)notes.value='';
  if(students)students.value='1';
}

function setPurpose(purpose){
  state.purpose=purpose;
  if(purpose!=='Training'){
    state.trainingMode='';
    resetCoachBrief();
  }
  renderPurposeState();
  renderDetailsContext();
  updateAll();
}

function setTrainingMode(mode){
  if(state.trainingMode!==mode)resetCoachBrief();
  state.trainingMode=mode;
  renderPurposeState();
  updateAll();
}

function renderPurposeState(){
  const validIndividualPurposes=['Casual Play','Training','Event / Tournament'];
  if(!isClubBooking()&&state.purpose&&!validIndividualPurposes.includes(state.purpose)){
    state.purpose='';
    state.trainingMode='';
    resetCoachBrief();
  }
  $$('[data-purpose]').forEach(b=>b.classList.toggle('selected',b.dataset.purpose===state.purpose));
  $('#individualPurposeGrid')?.classList.toggle('hidden',isClubBooking());
  $('#clubPurposeGrid')?.classList.toggle('hidden',!isClubBooking());
  $('#clubBookingMeta')?.classList.toggle('hidden',!isClubBooking()||!clubAuthenticated());
  const training=$('#trainingModePanel'),brief=$('#coachingBriefPanel');
  if(training)training.classList.toggle('hidden',!isTraining());
  if(brief)brief.classList.toggle('hidden',!wantsCoach());
  $$('[data-training-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.trainingMode===state.trainingMode));

  $$('[data-goal]').forEach(b=>{
    const selected=state.coachingGoals.includes(b.dataset.goal);
    const limitReached=state.coachingGoals.length>=3&&!selected;
    b.classList.toggle('selected',selected);
    b.classList.toggle('limit-disabled',limitReached);
    b.disabled=limitReached;
  });

  const counter=$('#priorityCounter');
  if(counter)counter.innerHTML=`<strong>${state.coachingGoals.length}</strong><span>/ 3 selected</span>`;

  const otherField=$('#otherGoalField');
  if(otherField)otherField.classList.toggle('hidden',!state.coachingGoals.includes('Other'));
}

function toggleCoachingGoal(goal){
  if(state.coachingGoals.includes(goal)){
    state.coachingGoals=state.coachingGoals.filter(x=>x!==goal);
    if(goal==='Other'){
      state.otherGoal='';
      const input=$('#otherGoalInput');
      if(input)input.value='';
    }
  }else{
    if(state.coachingGoals.length>=3){
      toastMsg('Choose only your top 1–3 coaching priorities.');
      return;
    }
    state.coachingGoals.push(goal);
  }
  // Goals affect coach ranking. Clear selected coach only if the user changes
  // priorities after selection, forcing a deliberate re-selection.
  state.coachId='';
  renderPurposeState();
  renderCoachRecommendations();
  validate();
}

function coachRecords(){
  return window.NorthZoneCoachRegistry?.activeCoaches?.()||[];
}
function selectedCoach(){
  return coachRecords().find(c=>String(c.id)===String(state.coachId))||null;
}

function coachingStudentCount(){
  const n=Math.floor(Number(state.coachingStudents)||1);
  return Math.max(1,n);
}
function coachMaxStudents(coach){
  const n=Number(coach?.maxStudents);
  return Number.isInteger(n)&&n>0?n:null;
}
function coachCapacityAllows(coach){
  const max=coachMaxStudents(coach);
  return max===null||coachingStudentCount()<=max;
}
function normalizeRateMap(v){
  const out={};
  if(!v||typeof v!=='object')return out;
  Object.entries(v).forEach(([k,val])=>{
    const count=Number(k);
    const rate=Number(typeof val==='object'?(val?.rate??val?.hourlyRate):val);
    if(Number.isInteger(count)&&count>0&&Number.isFinite(rate)&&rate>=0)out[count]=rate;
  });
  return out;
}
function coachSessionRates(coach){
  return normalizeRateMap(coach?.sessionRates);
}
function exactCoachRate(coach){
  const students=coachingStudentCount(),durationMinutes=Math.round(coachingDuration()*60),date=coachingDate();
  const rows=Array.isArray(coach?.exactRates)?coach.exactRates:[];
  return rows.filter(r=>Number(r.participantCount)===students&&Number(r.durationMinutes)===durationMinutes&&(!r.effectiveFrom||date>=r.effectiveFrom)&&(!r.effectiveTo||date<=r.effectiveTo))[0]||null;
}
function coachRateConfiguredForStudents(coach){
  if(Array.isArray(coach?.exactRates)&&coach.exactRates.length)return !!exactCoachRate(coach);
  const students=coachingStudentCount(),rates=coachSessionRates(coach);
  if(students===1)return Number.isFinite(Number(rates[1]))||effectiveCoachRate(coach)>0;
  return Number.isFinite(Number(rates[students]));
}
function coachSessionHourlyRate(coach){
  const exact=exactCoachRate(coach);if(exact&&coachingDuration()>0)return Number(exact.amount)/coachingDuration();
  const students=coachingStudentCount(),rates=coachSessionRates(coach);
  if(Number.isFinite(Number(rates[students])))return Number(rates[students]);
  if(students===1)return effectiveCoachRate(coach);return null;
}
function renderCoachingParticipants(){
  const input=$('#coachingStudentsCount'),label=$('#coachingStudentsLabel');
  if(!input||!label)return;
  const count=coachingStudentCount();
  input.value=String(count);
  label.textContent=count===1?'player':'players';
}
function setCoachingStudents(value){
  const count=Math.max(1,Math.floor(Number(value)||1));
  if(count===coachingStudentCount()){
    renderCoachingParticipants();
    return;
  }
  state.coachingStudents=count;

  // Changing group size can change both eligibility and rate.
  const current=selectedCoach();
  if(current&&!coachCapacityAllows(current))state.coachId='';

  renderCoachingParticipants();
  renderCoachRecommendations();
  renderDetailsContext();
  renderSummary();
  validate();
}

function selectedGoalsForDisplay(){
  return state.coachingGoals.map(g=>g==='Other'&&state.otherGoal.trim()?`Other: ${state.otherGoal.trim()}`:g);
}

function coachingReservation(){
  return state.cart[0]||null;
}
function coachingDate(){
  return coachingReservation()?.date||state.date||'';
}
function coachingBookedTimes(){
  const times=coachingReservation()?.times||state.times||[];
  return [...new Set(times)].sort((a,b)=>timeIndex(a)-timeIndex(b));
}
function coachingDuration(){
  return state.coachingTimes.length*SLOT_HOURS;
}
function coachingTimeRange(){
  return state.coachingTimes.length?formatTimes(state.coachingTimes):'';
}
function coachingCourt(){
  const courts=coachingReservation()?.courts||state.courts||[];
  return sortedCourtNames(courts)[0]||'';
}
function timesAreConsecutive(times){
  if(times.length<=1)return true;
  const sorted=[...times].sort((a,b)=>timeIndex(a)-timeIndex(b));
  return sorted.every((t,i)=>i===0||timeIndex(t)===timeIndex(sorted[i-1])+1);
}
function coachingRequestedSlots(){
  const date=coachingDate();
  return state.coachingTimes.map(time=>({date,time}));
}
function normalizeCoachingTimes(){
  const booked=new Set(coachingBookedTimes());
  const before=state.coachingTimes.join('|');
  state.coachingTimes=state.coachingTimes
    .filter(t=>booked.has(t))
    .sort((a,b)=>timeIndex(a)-timeIndex(b));
  if(!timesAreConsecutive(state.coachingTimes))state.coachingTimes=[];
  if(before!==state.coachingTimes.join('|'))state.coachId='';
}
function toggleCoachingTime(time){
  if(!coachingBookedTimes().includes(time))return;
  let next=state.coachingTimes.includes(time)
    ?state.coachingTimes.filter(t=>t!==time)
    :[...state.coachingTimes,time];

  next.sort((a,b)=>timeIndex(a)-timeIndex(b));

  if(next.length&&!timesAreConsecutive(next)){
    toastMsg('Coaching time slots must be consecutive.');
    return;
  }

  state.coachingTimes=next;
  state.coachId='';
  renderCoachingTimeOptions();
  renderCoachRecommendations();
  renderDetailsContext();
  renderSummary();
  validate();
}
function renderCoachingTimeOptions(){
  const grid=$('#coachingTimeGrid');
  const parent=$('#coachingParentSchedule');
  const summary=$('#coachingTimeSummary');
  const summaryValue=$('#coachingTimeSummaryValue');
  const courtSummary=$('#coachingCourtSummary');
  if(!grid||!parent||!summary||!summaryValue||!courtSummary)return;

  if(!wantsCoach()){
    grid.innerHTML='';
    summary.classList.add('hidden');
    return;
  }

  normalizeCoachingTimes();
  const booked=coachingBookedTimes();
  parent.textContent=booked.length
    ?`${formatTimes(booked)} · ${booked.length*SLOT_HOURS} hour${booked.length*SLOT_HOURS===1?'':'s'} court booking`
    :'No court hours available';

  grid.innerHTML=booked.map(time=>{
    const selected=state.coachingTimes.includes(time);
    return `<button type="button" class="coaching-time-option ${selected?'selected':''}" data-coaching-time="${esc(time)}">
      <span>${esc(time)}</span>
      <strong>${esc(hourEnd(time))}</strong>
      <b>✓</b>
    </button>`;
  }).join('');

  $$('[data-coaching-time]',grid).forEach(b=>b.onclick=()=>toggleCoachingTime(b.dataset.coachingTime));

  if(state.coachingTimes.length){
    summary.classList.remove('hidden');
    summaryValue.textContent=`${coachingTimeRange()} · ${coachingDuration()} hour${coachingDuration()===1?'':'s'}`;
    const court=coachingCourt();
    courtSummary.textContent=court?`${court} will be assigned to the coaching session.`:'Coaching court will be assigned from your reservation.';
  }else{
    summary.classList.add('hidden');
    summaryValue.textContent='—';
    courtSummary.textContent='Court assigned automatically';
  }
}

function time24ToIndex(v){
  const m=String(v||'').match(/^(\d{1,2}):(\d{2})$/);if(!m)return -1;
  const target=Number(m[1])*60+Number(m[2]);
  return allTimes.findIndex(t=>timeMinutes12(t)===target);
}
function coachBlockTimes(block){
  const start=time24ToIndex(block.start);
  if(start<0)return [];
  return allTimes.slice(start,start+Math.max(1,Math.ceil(Number(block.hours||1)/SLOT_HOURS)));
}
function coachBusyAt(coach,date,time){
  return (window.NorthZoneCoachRegistry?.busyBlocks?.()||[]).some(block=>{
    const sameCoach=
      (block.coachId&&coach.id&&String(block.coachId)===String(coach.id)) ||
      (block.coachName&&normalized(block.coachName)===normalized(coach.name));
    return sameCoach&&block.date===date&&coachBlockTimes(block).includes(time);
  });
}
function coachExceptionBlocksSlot(coach,date,time){
  const exceptions=Array.isArray(coach?.exceptions)?coach.exceptions:[],start=timeMinutes12(time),end=start+SLOT_MINUTES;
  return exceptions.some(e=>{
    if(e.date!==date)return false;
    if(e.allDay||(!e.start&&!e.end))return true;
    const [sh,sm]=String(e.start||'00:00').split(':').map(Number),[eh,em]=String(e.end||'23:59').split(':').map(Number);
    const es=(sh||0)*60+(sm||0),ee=(eh||23)*60+(em||59);
    return start<ee&&end>es;
  });
}
function coachWindowCoversTimes(coach,date,times){
  const windows=Array.isArray(coach?.availability)?coach.availability:[];
  if(!windows.length)return !PLATFORM?.contract?.();
  if(!times.length)return false;
  const day=new Date(`${date}T12:00:00`).getDay(),start=timeMinutes12(times[0]),end=timeMinutes12(times[times.length-1])+SLOT_MINUTES;
  return windows.some(w=>{
    if(Number(w.dayOfWeek)!==day)return false;
    if(w.startDate&&date<w.startDate)return false;
    if(w.endDate&&date>w.endDate)return false;
    const [sh,sm]=String(w.start||'00:00').split(':').map(Number),[eh,em]=String(w.end||'00:00').split(':').map(Number);
    return start>=sh*60+sm&&end<=eh*60+em;
  });
}
function coachAvailableForTimes(coach,date,times){
  if(!coachWindowCoversTimes(coach,date,times))return false;
  return times.every(time=>!coachBusyAt(coach,date,time)&&!coachExceptionBlocksSlot(coach,date,time));
}
function coachAvailableForSchedule(coach){
  const slots=coachingRequestedSlots();if(!slots.length)return false;
  const date=slots[0].date,times=slots.map(s=>s.time);
  return coachAvailableForTimes(coach,date,times);
}
function firstCoachConflict(coach){
  return coachingRequestedSlots().find(slot=>coachBusyAt(coach,slot.date,slot.time))||null;
}
function findCoachAlternativeWithinBooking(coach){
  const booked=coachingBookedTimes(),durationSlots=state.coachingTimes.length,date=coachingDate();
  if(!durationSlots||!date)return null;
  for(let i=0;i<=booked.length-durationSlots;i++){
    const window=booked.slice(i,i+durationSlots);
    if(window.length!==durationSlots||!timesAreConsecutive(window))continue;
    if(window.join('|')===state.coachingTimes.join('|'))continue;
    if(coachAvailableForTimes(coach,date,window))return {date,times:window,start:window[0],end:hourEnd(window[window.length-1]),duration:durationSlots*SLOT_HOURS};
  }return null;
}
function formatCoachWindow(next){
  if(!next)return '';
  return `${formatTimes(next.times)} · ${next.duration} hour${next.duration===1?'':'s'}`;
}
function goalMatchesSpecialty(goal,specialty){
  const s=normalized(specialty);
  const aliases=GOAL_ALIASES[goal]||[normalized(goal)];
  return aliases.some(a=>{
    const n=normalized(a);
    return s===n||s.includes(n)||n.includes(s);
  });
}
function coachMatch(coach){
  const specialties=Array.isArray(coach.specialties)?coach.specialties:[];
  const matched=state.coachingGoals.filter(goal=>
    goal!=='Other'&&specialties.some(spec=>goalMatchesSpecialty(goal,spec))
  );
  return {
    matched,
    count:matched.length,
    total:state.coachingGoals.filter(x=>x!=='Other').length
  };
}
function rankedCoaches(){
  return coachRecords().map(coach=>{
    const match=coachMatch(coach);
    const capacityOk=coachCapacityAllows(coach);
    const rateConfigured=coachRateConfiguredForStudents(coach);
    const scheduleOk=coachAvailableForSchedule(coach);
    const available=capacityOk&&rateConfigured&&scheduleOk;
    const alternative=capacityOk&&rateConfigured&&!scheduleOk?findCoachAlternativeWithinBooking(coach):null;
    return {coach,match,available,alternative,capacityOk,rateConfigured,scheduleOk};
  }).sort((a,b)=>
    Number(b.available)-Number(a.available) ||
    Number(b.capacityOk)-Number(a.capacityOk) ||
    Number(b.rateConfigured)-Number(a.rateConfigured) ||
    b.match.count-a.match.count ||
    String(a.coach.name).localeCompare(String(b.coach.name))
  );
}
function coachAvatar(coach){
  if(normalized(coach.name)==='coach raf'){
    return `<img src="assets/coach-raf.webp" alt="${esc(coach.name)}">`;
  }
  const initials=String(coach.name||'C').split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();
  return `<span>${esc(initials)}</span>`;
}
function matchLabel(entry){
  if(!state.coachingGoals.length)return 'Add priorities to personalize recommendations';
  if(entry.match.total===0)return 'Availability-based recommendation';
  if(entry.match.count===entry.match.total&&entry.match.total>0)return `${entry.match.count} of ${entry.match.total} priorities matched`;
  if(entry.match.count>0)return `${entry.match.count} of ${entry.match.total} priorities matched`;
  return 'No listed specialty match yet';
}
function coachRatingStars(rating){
  const n=Math.max(0,Math.min(5,Number(rating||0)));
  return Array.from({length:5},(_,i)=>`<span class="${i<Math.round(n)?'filled':''}">★</span>`).join('');
}
function coachReviewDate(value){
  if(!value)return '';
  const d=new Date(value);return Number.isNaN(d.getTime())?String(value):d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}
function coachReviewsMarkup(coach){
  const reviews=Array.isArray(coach?.reviews)?coach.reviews:[];
  if(!reviews.length)return `<div class="profile-empty-line">No verified player reviews yet.</div>`;
  return reviews.slice(0,12).map(r=>`<article class="public-coach-review">
    <div class="public-coach-review-head"><div><strong>${esc(r.reviewerName||'Verified Player')}</strong><span>${esc(coachReviewDate(r.submittedAt))}${r.sessionDate?` · Session ${esc(r.sessionDate)}`:''}</span></div><div class="coach-public-stars small">${coachRatingStars(r.rating)}</div></div>
    ${r.comment?`<p>${esc(r.comment)}</p>`:'<p class="muted">No written comment.</p>'}
    <small>✓ Verified NorthZone coaching session</small>
  </article>`).join('');
}
function renderCoachRecommendations(){
  const list=$('#coachRecommendationList');
  if(!list)return;
  if(!wantsCoach()){
    list.innerHTML='';
    return;
  }

  const current=selectedCoach();
  if(current&&(!coachAvailableForSchedule(current)||!coachCapacityAllows(current)||!coachRateConfiguredForStudents(current)))state.coachId='';

  if(!state.coachingGoals.length){
    list.innerHTML=`<div class="coach-empty"><strong>Select at least one coaching priority.</strong><span>Your goals will be used to rank available coaches.</span></div>`;
    return;
  }

  if(!state.coachingTimes.length){
    state.coachId='';
    list.innerHTML=`<div class="coach-empty"><strong>Choose when you need the coach.</strong><span>Select one or more consecutive time slots from your court booking above.</span></div>`;
    return;
  }

  const ranked=rankedCoaches();
  if(!ranked.length){
    state.coachId='';
    list.innerHTML=`<div class="coach-empty"><strong>No active coaches are currently available in the public coach registry.</strong><span>You can choose Self-Guided Practice or contact NorthZone through the facility.</span></div>`;
    return;
  }

  list.innerHTML=ranked.map((entry,index)=>{
    const {coach,match,available,alternative,capacityOk,rateConfigured,scheduleOk}=entry;
    const selected=String(coach.id)===String(state.coachId);
    const specialtyTags=(coach.specialties||[]).slice(0,4).map(x=>`<span>${esc(x)}</span>`).join('');
    const levelTags=(coach.skillLevels||[]).slice(0,3).map(x=>`<span>${esc(x)}</span>`).join('');
    const certs=Array.isArray(coach.certifications)?coach.certifications:[],certPreview=certs.slice(0,2).map(c=>esc(c.name)).join(' · ');
    const reviewSummary=coach.reviewSummary||{average:0,count:0};
    const recommended=index===0&&available;
    return `<article class="coach-reco-card ${available?'available':'unavailable'} ${selected?'selected':''}">
      <div class="coach-reco-photo">${coachAvatar(coach)}</div>
      <div class="coach-reco-main">
        <div class="coach-reco-top">
          <div>
            <span class="coach-reco-badge">${recommended?'RECOMMENDED':available?'AVAILABLE':!capacityOk?'GROUP FULL':!rateConfigured?'RATE NOT SET':'UNAVAILABLE'}</span>
            <h3>${esc(coach.name)}</h3>
            <p>${esc(coach.title||'Coach')}</p>
            <div class="coach-rating-inline">${reviewSummary.count?`<div class="coach-public-stars">${coachRatingStars(reviewSummary.average)}</div><strong>${Number(reviewSummary.average).toFixed(1)}</strong><span>${reviewSummary.count} review${reviewSummary.count===1?'':'s'}</span>`:'<span>New · No reviews yet</span>'}</div>
          </div>
          <div class="coach-match-pill">${esc(matchLabel(entry))}</div>
        </div>
        ${specialtyTags?`<div class="coach-tag-row">${specialtyTags}</div>`:'<div class="coach-profile-muted">Specialties not yet listed.</div>'}
        ${levelTags?`<div class="coach-level-row">${levelTags}</div>`:''}
        ${certs.length?`<div class="coach-credential-summary"><strong>${certs.length} certification${certs.length===1?'':'s'}</strong><span>${certPreview}${certs.length>2?` · +${certs.length-2} more`:''}</span></div>`:''}
        <div class="coach-reco-meta">
          <span>${rateConfigured&&coachSessionHourlyRate(coach)!==null?`${currency(coachSessionHourlyRate(coach))}/hr · ${coachingStudentCount()} ${coachingStudentCount()===1?'player':'players'}`:'Group rate not configured'}</span>
          ${coachMaxStudents(coach)?`<span>Session capacity: up to ${coachMaxStudents(coach)}</span>`:''}
          <span class="${available?'coach-available':'coach-booked'}">${available?`Available · ${esc(coachingTimeRange())}`:!capacityOk?`Not available for ${coachingStudentCount()} players`:!rateConfigured?`NorthZone has not set this coach's ${coachingStudentCount()}-player rate`:`Unavailable · ${esc(coachingTimeRange())}`}</span>
          ${!available&&capacityOk&&rateConfigured&&alternative?`<span class="coach-alternative">Available instead: ${esc(formatCoachWindow(alternative))}</span>`:''}
        </div>
      </div>
      <div class="coach-reco-actions">
        <button type="button" class="coach-profile-button" data-view-coach="${esc(coach.id)}">View Profile</button>
        <button type="button" class="coach-select-button" data-select-coach="${esc(coach.id)}" ${available?'':'disabled'}>${selected?'✓ Selected':'Select Coach'}</button>
      </div>
    </article>`;
  }).join('');

  $$('[data-select-coach]').forEach(b=>b.onclick=()=>{
    const coach=coachRecords().find(c=>String(c.id)===String(b.dataset.selectCoach));
    if(!coach||!coachAvailableForSchedule(coach)||!coachCapacityAllows(coach)||!coachRateConfiguredForStudents(coach))return;
    state.coachId=String(coach.id);
    renderCoachRecommendations();
    renderDetailsContext();
    renderSummary();
    validate();
  });

  $$('[data-view-coach]').forEach(b=>b.onclick=()=>openCoachProfile(b.dataset.viewCoach));
}
function certificationsMarkup(coach){
  const certs=Array.isArray(coach.certifications)?coach.certifications:[];
  if(!certs.length)return `<div class="profile-empty-line">No certifications listed.</div>`;
  return certs.map(c=>{
    const isPdf=String(c.mimeType||'').toLowerCase()==='application/pdf',isImage=String(c.mimeType||'').toLowerCase().startsWith('image/');
    const attachment=c.dataUrl?`<div class="profile-cert-attachment">${isImage?`<a href="${esc(c.dataUrl)}" target="_blank" rel="noopener" class="profile-cert-thumb"><img src="${esc(c.dataUrl)}" alt="${esc(c.name)} certificate"></a>`:`<div class="profile-cert-file">${isPdf?'PDF':'FILE'}</div>`}<a href="${esc(c.dataUrl)}" target="_blank" rel="noopener">View Certificate</a></div>`:'';
    return `<div class="profile-cert">
      <div class="profile-cert-copy"><strong>${esc(c.name)}</strong><span>${esc(c.issuer||'Issuer not listed')}</span>${c.credentialId?`<small>Credential ID: ${esc(c.credentialId)}</small>`:''}${c.issueDate?`<small>Issued ${esc(c.issueDate)}</small>`:''}${c.expiryDate?`<small>Valid through ${esc(c.expiryDate)}</small>`:''}</div>
      ${attachment}
    </div>`;
  }).join('');
}
function openCoachProfile(id){
  const coach=coachRecords().find(c=>String(c.id)===String(id));
  if(!coach)return;
  const entry=rankedCoaches().find(x=>String(x.coach.id)===String(id));
  const modal=$('#coachProfileModal'),content=$('#coachProfileContent');
  if(!modal||!content)return;

  const specialties=(coach.specialties||[]).map(x=>`<span>${esc(x)}</span>`).join('');
  const levels=(coach.skillLevels||[]).map(x=>`<span>${esc(x)}</span>`).join('');
  const experience=coach.yearsExperience!==null&&coach.yearsExperience!==undefined
    ?`${coach.yearsExperience} year${Number(coach.yearsExperience)===1?'':'s'}`
    :'Not listed';
  const reviewSummary=coach.reviewSummary||{average:0,count:0};

  content.innerHTML=`<div class="coach-profile-hero">
      <div class="coach-profile-photo">${coachAvatar(coach)}</div>
      <div>
        <span>COACH PROFILE</span>
        <h2 id="coachProfileName">${esc(coach.name)}</h2>
        <p>${esc(coach.title||'Coach')}</p>
        <div class="coach-profile-rating">${reviewSummary.count?`<div class="coach-public-stars">${coachRatingStars(reviewSummary.average)}</div><strong>${Number(reviewSummary.average).toFixed(1)}</strong><span>${reviewSummary.count} verified review${reviewSummary.count===1?'':'s'}</span>`:'<span>No verified reviews yet</span>'}</div>
        <div class="coach-profile-status ${entry?.available?'available':'unavailable'}">${entry?.available?`Available · ${esc(coachingTimeRange())}`:`Unavailable · ${esc(coachingTimeRange())}${entry?.alternative?` · Alternative: ${esc(formatCoachWindow(entry.alternative))}`:''}`}</div>
      </div>
    </div>
    <div class="coach-profile-grid">
      <section>
        <span class="profile-section-label">ABOUT</span>
        <p>${coach.bio?esc(coach.bio):'Public coaching bio not yet listed.'}</p>
      </section>
      <section>
        <span class="profile-section-label">SESSION RATE</span>
        <strong class="profile-big-value">${coachRateConfiguredForStudents(coach)&&coachSessionHourlyRate(coach)!==null?`${currency(coachSessionHourlyRate(coach))}/hr`:'Rate not configured'}</strong>
        <div class="profile-rate-context">${coachingStudentCount()} ${coachingStudentCount()===1?'player':'players'} in this session · pricing set in NorthZone Admin</div>
      </section>
      <section>
        <span class="profile-section-label">SESSION CAPACITY</span>
        <strong>${coachMaxStudents(coach)?`Up to ${coachMaxStudents(coach)} players`:'Capacity not listed'}</strong>
      </section>
      <section>
        <span class="profile-section-label">SPECIALTIES</span>
        ${specialties?`<div class="profile-tags">${specialties}</div>`:'<div class="profile-empty-line">Specialties not yet listed.</div>'}
      </section>
      <section>
        <span class="profile-section-label">SKILL LEVELS COACHED</span>
        ${levels?`<div class="profile-tags">${levels}</div>`:'<div class="profile-empty-line">Skill levels not yet listed.</div>'}
      </section>
      <section>
        <span class="profile-section-label">COACHING EXPERIENCE</span>
        <strong>${esc(experience)}</strong>
      </section>
      <section>
        <span class="profile-section-label">CERTIFICATIONS</span>
        <div class="profile-cert-list">${certificationsMarkup(coach)}</div>
      </section>
      <section class="coach-profile-reviews-section">
        <span class="profile-section-label">PLAYER REVIEWS</span>
        <div class="coach-profile-review-summary">${reviewSummary.count?`<strong>${Number(reviewSummary.average).toFixed(1)} / 5</strong><div class="coach-public-stars">${coachRatingStars(reviewSummary.average)}</div><span>${reviewSummary.count} verified review${reviewSummary.count===1?'':'s'}</span>`:'<strong>New coach profile</strong><span>No verified reviews yet.</span>'}</div>
        <div class="public-coach-review-list">${coachReviewsMarkup(coach)}</div>
      </section>
    </div>
    <div class="coach-profile-privacy">Coach contact information is intentionally not displayed. Coaching sessions are booked and managed through NorthZone.</div>
    <div class="coach-profile-footer">
      <button type="button" class="coach-profile-secondary" data-close-coach-profile>Close</button>
      <button type="button" class="coach-profile-select" id="profileSelectCoach" ${entry?.available?'':'disabled'}>${String(state.coachId)===String(coach.id)?'✓ Selected':'Select Coach'}</button>
    </div>`;

  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  const select=$('#profileSelectCoach');
  if(select&&!select.disabled)select.onclick=()=>{
    if(!coachCapacityAllows(coach)||!coachAvailableForSchedule(coach)||!coachRateConfiguredForStudents(coach))return;
    state.coachId=String(coach.id);
    closeCoachProfile();
    renderCoachRecommendations();
    renderDetailsContext();
    renderSummary();
    validate();
  };
  $$('[data-close-coach-profile]',modal).forEach(b=>b.onclick=closeCoachProfile);
}
function closeCoachProfile(){
  const modal=$('#coachProfileModal');
  if(modal)modal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}
function coachSubtotal(){
  const coach=selectedCoach();
  if(!wantsCoach()||!coach||!coachingDuration()||!coachRateConfiguredForStudents(coach))return 0;
  const hourly=coachSessionHourlyRate(coach);
  return hourly===null?0:hourly*coachingDuration();
}
function renderDetailsContext(){
  const purposeText=$('#detailsPurposeText');
  if(!purposeText)return;

  const clubCard=$('#clubDetailsAccount');
  clubCard?.classList.toggle('hidden',!isClubBooking()||!clubAuthenticated());
  if(isClubBooking()&&clubAuthenticated()){
    const c=currentClub(),r=currentClubRep();
    $('#detailsClubName').textContent=`${c.name} · ${c.clubId}`;
    $('#detailsClubRepresentative').textContent=`Booking as ${r.name} · ${r.role}`;
    prefillClubRepresentative();
  }

  let label=state.purpose||'—';
  if(isTraining()&&state.trainingMode)label+=` · ${state.trainingMode}`;
  const coach=selectedCoach();
  if(wantsCoach()&&coach)label+=` · ${coach.name}`;
  purposeText.textContent=label;
}

function toastMsg(m){toast.textContent=m;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1900)}
function fmtDate(iso=state.date){return iso?parseISO(iso).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}):''}
function shortMaxDate(){return MAX_DATE.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}

function renderCalendar(){
  $('#calendarMonthLabel').textContent=calendarCursor.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  $('#calendarRangeLabel').textContent=`Available through ${shortMaxDate()}`;

  const first=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth(),1);
  const last=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,0);
  const days=$('#calendarDays'); days.innerHTML='';

  for(let i=0;i<first.getDay();i++){
    const filler=document.createElement('span'); filler.className='calendar-filler'; days.appendChild(filler);
  }

  for(let day=1;day<=last.getDate();day++){
    const d=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth(),day);
    const b=document.createElement('button');
    const disabled=d<TODAY||d>MAX_DATE;
    b.className='calendar-day';
    if(disabled)b.classList.add('disabled');
    if(sameDate(d,TODAY))b.classList.add('today');
    if(state.date===isoDate(d))b.classList.add('selected');
    b.disabled=disabled;
    b.innerHTML=`<span>${day}</span>${sameDate(d,TODAY)?'<small>Today</small>':''}`;
    if(!disabled)b.onclick=()=>selectDate(d);
    days.appendChild(b);
  }

  const prevMonth=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);
  const nextMonth=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);
  $('#calendarPrev').disabled=prevMonth<new Date(TODAY.getFullYear(),TODAY.getMonth(),1);
  $('#calendarNext').disabled=nextMonth>new Date(MAX_DATE.getFullYear(),MAX_DATE.getMonth(),1);
}
function selectDate(d){
  state.date=isoDate(d); state.times=[]; state.courts=[];
  calendarCursor=new Date(d.getFullYear(),d.getMonth(),1);
  renderCalendar(); renderBuilder(); updateAll();
}
$('#calendarPrev').onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);renderCalendar()};
$('#calendarNext').onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);renderCalendar()};
$('#calendarToday').onclick=()=>selectDate(TODAY);


function platformSlotAllowed(date,time){
  const slots=PLATFORM?.bookingSlotsForDate?.(date);
  return !Array.isArray(slots)||!slots.length?(!PLATFORM?.contract?.()):slots.includes(time);
}
function bookingSlotEligibility(date,time){
  if(!date||!time)return {ok:false,reason:'incomplete'};
  if(!platformSlotAllowed(date,time))return {ok:false,reason:'closed'};
  const minute=timeMinutes12(time);
  const target=new Date(`${date}T${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}:00`);
  const diffMinutes=(target-new Date())/60000;
  if(diffMinutes<0)return {ok:false,reason:'past'};
  const lead=Math.max(0,Number(PLATFORM?.bookingConfig?.()?.minLeadMinutes||0));
  if(lead>0&&diffMinutes<lead)return {ok:false,reason:'lead'};
  return {ok:true,reason:'available'};
}
function contractCourtId(courtIdx){return `C${Number(courtIdx)}`}
function contractBookingBlocked(date,time,courtIdx){
  const blocks=PLATFORM?.bookingBlocks?.();if(!Array.isArray(blocks))return false;
  const slotStart=timeMinutes12(time),slotEnd=slotStart+SLOT_MINUTES,courtId=contractCourtId(courtIdx);
  return blocks.some(block=>{
    if(block.date!==date||!(block.courts||[]).includes(courtId))return false;
    const [hh,mm]=String(block.start||'00:00').split(':').map(Number),bs=(hh||0)*60+(mm||0),be=bs+Number(block.durationMinutes||60);
    return slotStart<be&&slotEnd>bs;
  });
}
function demoFacilityBlocked(date,tIdx,courtIdx){
  const time=allTimes[tIdx];
  if(!bookingSlotEligibility(date,time).ok)return true;

  // Connected mode: the NorthZone Admin public contract is authoritative.
  if(PLATFORM?.contract?.())return contractBookingBlocked(date,time,courtIdx);

  // Static fallback: do not fabricate occupied courts. If there is no Admin
  // contract yet, an otherwise valid slot remains available and only the
  // user's current cart can create a local conflict.
  return false;
}

function cartConflict(courtName,time,date=state.date){
  return state.cart.some(r=>!r.autoCurrent&&r.date===date&&r.courts.includes(courtName)&&r.times.includes(time));
}
function courtAvailableForTimes(courtIdx,times){
  if(!state.date||!times.length)return false;
  const courtName=`Court ${courtIdx}`;
  return times.every(t=>!demoFacilityBlocked(state.date,timeIndex(t),courtIdx)&&!cartConflict(courtName,t));
}
function timeAvailableForCourts(t,courts){
  if(!state.date||!courts.length)return false;
  return courts.every(c=>{
    const idx=Number(c.split(' ')[1]);
    return !demoFacilityBlocked(state.date,timeIndex(t),idx)&&!cartConflict(c,t);
  });
}
function dayHasAnyAvailabilityForCourt(courtIdx){
  if(!state.date)return false;
  const courtName=`Court ${courtIdx}`;
  return allTimes.some(t=>!demoFacilityBlocked(state.date,timeIndex(t),courtIdx)&&!cartConflict(courtName,t));
}

function toggleTime(t){
  state.times=state.times.includes(t)?state.times.filter(x=>x!==t):[...state.times,t].sort((a,b)=>timeIndex(a)-timeIndex(b));
  renderBuilder(); updateAll();
}
function toggleCourt(name){
  state.courts=state.courts.includes(name)?state.courts.filter(x=>x!==name):[...state.courts,name];
  renderBuilder(); updateAll();
}

function renderTimeGrid(container,mode){
  container.innerHTML='';
  let availableCount=0;
  allTimes.forEach(t=>{
    const eligibility=state.date?bookingSlotEligibility(state.date,t):{ok:false,reason:'no_date'};
    let available=false;
    if(state.date&&eligibility.ok){
      if(mode==='byTime'){
        // Before court selection, a slot is open if at least one court can accommodate it.
        available=[1,2,3,4,5].some(i=>!demoFacilityBlocked(state.date,timeIndex(t),i)&&!cartConflict(`Court ${i}`,t));
      }else{
        available=state.courts.length?timeAvailableForCourts(t,state.courts):false;
      }
    }
    if(available)availableCount++;
    const selected=state.times.includes(t);
    const b=document.createElement('button');
    b.className='time-choice'+(selected?' selected':'')+(available?'':' booked');
    b.dataset.availability=available?'available':eligibility.reason;
    b.disabled=!available;
    const unavailableLabel=eligibility.reason==='past'?'Past':eligibility.reason==='lead'?'Lead time':eligibility.reason==='closed'?'Closed':eligibility.reason==='no_date'?'Select date':'Unavailable';
    b.innerHTML=`<span>${t}</span><small>${available?hourEnd(t):unavailableLabel}</small>`;
    if(available)b.onclick=()=>toggleTime(t);
    container.appendChild(b);
  });
  if(mode==='byCourt')$('#timeAvailabilityCount').textContent=state.courts.length?`${availableCount} open slot${availableCount===1?'':'s'}`:'Select a court first';
}
function renderCourtGrid(container,mode){
  container.innerHTML='';
  let availableCount=0;
  for(let i=1;i<=5;i++){
    const name=`Court ${i}`;
    let available=false;
    if(state.date){
      available=mode==='byTime'
        ? (state.times.length?courtAvailableForTimes(i,state.times):dayHasAnyAvailabilityForCourt(i))
        : dayHasAnyAvailabilityForCourt(i);
    }
    if(available)availableCount++;
    const selected=state.courts.includes(name);
    const b=document.createElement('button');
    b.className='court-option availability-court'+(selected?' selected':'')+(available?'':' unavailable');
    b.disabled=!available;
    const status=!state.date?'Select date':available?(selected?'Selected':'Available'):'Unavailable';
    b.innerHTML=`<div class="court-image-state"><img src="assets/${photos[i-1]}" alt="${name}"><span class="court-state-badge ${available?'available':'unavailable'}">${status}</span>${selected?'<i class="selected-check">✓</i>':''}</div><div><strong>${name}</strong><small>${available?(mode==='byTime'&&state.times.length?'Available for all selected time slots':'Available on this date'):'Unavailable for this selection'}</small></div>`;
    if(available)b.onclick=()=>toggleCourt(name);
    container.appendChild(b);
  }
  if(mode==='byTime')$('#courtAvailabilityCount').textContent=state.times.length?`${availableCount} of 5 courts available`:'Select a time first';
}
function formatTimes(times){
  if(!times.length)return'—';
  const sorted=[...times].sort((a,b)=>timeIndex(a)-timeIndex(b));
  const groups=[];let start=sorted[0],prev=sorted[0];
  for(let i=1;i<sorted.length;i++){
    if(timeIndex(sorted[i])===timeIndex(prev)+1){prev=sorted[i];continue}
    groups.push(`${start}–${hourEnd(prev)}`);start=prev=sorted[i];
  }
  groups.push(`${start}–${hourEnd(prev)}`);
  return groups.join(', ');
}

function formatSelectedDuration(times){
  if(!times.length)return'';
  const hours=times.length*SLOT_HOURS;
  return `${formatTimes(times)} · ${hours} hour${hours===1?'':'s'}`;
}

function sortedCourtNames(courts){
  return [...courts].sort((a,b)=>{
    const an=Number(String(a).match(/\d+/)?.[0]||9999);
    const bn=Number(String(b).match(/\d+/)?.[0]||9999);
    return an-bn||String(a).localeCompare(String(b));
  });
}
function formatSelectedCourts(courts){
  if(!courts.length)return'';
  const sorted=sortedCourtNames(courts);
  const count=sorted.length;
  return `${sorted.join(', ')} · ${count} court${count===1?'':'s'}`;
}
function selectedCourtsValid(){
  if(!state.date||!state.times.length||!state.courts.length)return false;
  return state.courts.every(name=>{
    const idx=Number(String(name).match(/\d+/)?.[0]);
    return Number.isFinite(idx)&&courtAvailableForTimes(idx,state.times);
  });
}

function selectionWithinBookingRules(){
  const cfg=PLATFORM?.bookingConfig?.();if(!cfg)return true;
  const durationMinutes=state.times.length*SLOT_MINUTES;
  if(Number(cfg.maxBookingMinutes||0)>0&&durationMinutes>Number(cfg.maxBookingMinutes))return false;
  if(!cfg.allowMultipleCourts&&state.courts.length>1)return false;
  if(Number(cfg.maxCourtsPerBooking||0)>0&&state.courts.length>Number(cfg.maxCourtsPerBooking))return false;
  if(state.date&&state.times.length){
    if(!state.times.every(t=>bookingSlotEligibility(state.date,t).ok))return false;
    const minute=timeMinutes12(state.times[0]),target=new Date(`${state.date}T${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}:00`),diff=(target-new Date())/60000;
    if(Number(cfg.advanceBookingDays||0)>0&&diff>Number(cfg.advanceBookingDays)*1440)return false;
  }return true;
}
function currentSelectionReady(){return !!(state.date&&state.times.length&&state.courts.length&&selectedCourtsValid()&&selectionWithinBookingRules())}

function currentSelectionReservation(){
  if(!currentSelectionReady())return null;
  const rate=activeCourtRate();
  return {
    id:'AUTO-CURRENT',
    date:state.date,
    times:[...state.times],
    courts:sortedCourtNames(state.courts),
    rate,
    pricingContext:'standard',
    amount:state.times.length*SLOT_HOURS*state.courts.length*rate,
    autoCurrent:true
  };
}

function syncCurrentReservation(){
  const current=currentSelectionReservation();

  // Step 1 is now one active reservation. There is no separate commit action.
  state.cart=current?[current]:[];
}

function renderBuilder(){
  if(state.date&&state.times.length){
    state.times=state.times.filter(t=>bookingSlotEligibility(state.date,t).ok);
  }
  $('#selectedDateChip').textContent=state.date?fmtDate():'Choose a date';
  $('#availabilityHeading').textContent='Select one or more time slots';
  $('#availabilitySubheading').textContent="Then we'll show which courts can accommodate every selected time slot.";

  renderTimeGrid($('#timeGridByTime'),'byTime');
  renderCourtGrid($('#courtGridByTime'),'byTime');

  // If a previously selected court is no longer valid for the updated time range,
  // remove it before creating the automatic reservation.
  if(state.times.length&&state.courts.length){
    state.courts=state.courts.filter(name=>{
      const idx=Number(String(name).match(/\d+/)?.[0]);
      return Number.isFinite(idx)&&courtAvailableForTimes(idx,state.times);
    });
    renderCourtGrid($('#courtGridByTime'),'byTime');
  }

  syncCurrentReservation();
}
function renderCart(){
  // v14.7.3: the separate Reservation Cart was removed.
  // Keep this compatibility function so existing add/remove/context actions
  // continue to refresh the persistent Your Booking running tab.
  renderSummary();
}
$('#summaryClearBooking').onclick=()=>{
  state.cart=[];
  state.times=[];
  state.courts=[];
  renderBuilder();
  updateAll();
};
$$('[data-booking-context]').forEach(b=>b.onclick=()=>setBookingContext(b.dataset.bookingContext));
$('#clubBookingSignInForm').onsubmit=e=>{
  e.preventDefault();
  const result=window.NorthZoneClubRegistry?.signIn?.($('#clubBookingEmail').value,$('#clubBookingPassword').value);
  if(result?.ok){
    $('#clubBookingSignInMessage').textContent='';renderBookingContext();renderPurposeState();renderBuilder();updateAll();toastMsg(`${result.club.name} verified.`);
  }else $('#clubBookingSignInMessage').textContent=result?.message||'Unable to sign in to this club account.';
};
$('#clubBookingSignOut').onclick=()=>{
  if(state.cart.length&&!confirm('Signing out will clear the current club reservation cart. Continue?'))return;
  if(state.cart.length)clearBookingCartForContextChange();
  window.NorthZoneClubRegistry?.signOut?.();resetPurposeForContext();renderBookingContext();renderPurposeState();updateAll();
};
$('#clubExpectedPlayers').oninput=e=>{state.clubExpectedPlayers=e.target.value;validate()};

$('#paddlePlus').onclick=()=>{if(state.paddles<10)state.paddles++;updateAll()};
$('#paddleMinus').onclick=()=>{if(state.paddles>0)state.paddles--;updateAll()};

$$('[data-purpose]').forEach(b=>b.onclick=()=>setPurpose(b.dataset.purpose));
$$('[data-training-mode]').forEach(b=>b.onclick=()=>setTrainingMode(b.dataset.trainingMode));
$$('[data-goal]').forEach(b=>b.onclick=()=>toggleCoachingGoal(b.dataset.goal));
$('#otherGoalInput').oninput=e=>{state.otherGoal=e.target.value;state.coachId='';renderCoachRecommendations();validate()};
$('#coachingNotes').oninput=e=>{state.coachingNotes=e.target.value;validate()};
$('#coachingStudentsMinus').onclick=()=>setCoachingStudents(coachingStudentCount()-1);
$('#coachingStudentsPlus').onclick=()=>setCoachingStudents(coachingStudentCount()+1);
$('#coachingStudentsCount').oninput=e=>{
  const raw=String(e.target.value||'').replace(/[^0-9]/g,'');
  if(raw)setCoachingStudents(raw);
};
$('#coachingStudentsCount').onblur=e=>setCoachingStudents(e.target.value);
$('#editPurposeButton').onclick=()=>go(2);

$('#detailsForm').oninput=validate;

function configureContractControlledCheckout(){
  const methods=PLATFORM?.paymentMethods?.()||null,connected=!!PLATFORM?.contract?.();
  if(connected&&methods){
    const allowed={GCash:!!methods.gcash,Maya:!!methods.maya};
    $$('[data-wallet]').forEach(btn=>{const enabled=allowed[btn.dataset.wallet]!==false;btn.classList.toggle('hidden',!enabled);btn.disabled=!enabled});
    const enabled=$$('[data-wallet]').filter(btn=>!btn.disabled);
    if(enabled.length&&!allowed[state.wallet])state.wallet=enabled[0].dataset.wallet;
  }
  const consent=$('#bookingPolicyConsent'),cfg=PLATFORM?.bookingConfig?.();if(consent&&cfg)consent.required=!!cfg.requirePolicyAcceptance;
}
configureContractControlledCheckout();

$$('[data-wallet]').forEach(b=>b.onclick=()=>{
  state.wallet=b.dataset.wallet;
  $$('[data-wallet]').forEach(x=>{const s=x===b;x.classList.toggle('selected',s);x.querySelector('b').textContent=s?'✓':''});
  $('#paymentQR').src=state.wallet==='GCash'?'assets/gcash-demo-qr.png':'assets/maya-demo-qr.png';
  $('#paymentQR').alt=`Demo ${state.wallet} QR code`;
  $('#qrWalletLabel').textContent=`${state.wallet.toUpperCase()} PAYMENT`;
  $('#walletInstructionName').textContent=state.wallet;
  updateAll();
});
$('#paymentReference').oninput=e=>{state.paymentReference=e.target.value;validate()};
$('#paymentProof').onchange=e=>{$('#paymentProofName').textContent=e.target.files?.[0]?.name||'No file selected';validate()};

const bookingSubtotal=()=>state.cart.reduce((s,r)=>s+r.amount,0);
const totalCourtHours=()=>state.cart.reduce((s,r)=>s+(r.times.length*SLOT_HOURS*r.courts.length),0);
const paddleSubtotal=()=>state.paddles*activePaddleRate();
const machineSubtotal=()=>state.machineQty*activeMachineRate()*machineHours();
const addonSubtotal=()=>paddleSubtotal()+machineSubtotal()+coachSubtotal();
const grossTotal=()=>bookingSubtotal()+addonSubtotal();
function checkoutAccount(){
  if(isClubBooking())return clubAuthenticated()?window.NorthZoneMembershipRegistry?.clubAccount?.():null;
  return window.NorthZoneMembershipRegistry?.playerAccount?.()||null;
}
function savingsContext(){
  const r=state.cart[0];
  return {grossTotal:grossTotal(),courtTotal:bookingSubtotal(),courtHours:totalCourtHours(),paddles:state.paddles,paddleTotal:paddleSubtotal(),coachTotal:coachSubtotal(),baseCourtRate:RATE,date:r?.date||state.date,time:r?.times?.[0]||state.times[0]||'',court:r?.courts?.[0]||state.courts[0]||'all'};
}
function availableSavings(){const account=checkoutAccount();return account?window.NorthZoneMembershipRegistry?.checkoutOptions?.(account,savingsContext())||[]:[]}
function selectedSavings(){return availableSavings().find(x=>x.code===state.savingsCode)||null}
function savingsAmount(){return Math.max(0,Math.min(grossTotal(),Number(selectedSavings()?.savings||0)))}
const total=()=>Math.max(0,grossTotal()-savingsAmount());
function ensureSavingsValid(){if(state.savingsCode!=='none'&&!availableSavings().some(x=>x.code===state.savingsCode))state.savingsCode='none'}
function checkoutAccountLabel(account){return account?.type==='club'?`${account.name||'Club'} · Club account`:`${account?.name||'Player'} · Player account`}
function renderCheckoutSavings(){
  const host=$('#checkoutSavingsOptions'),accountBox=$('#checkoutSavingsAccount'),message=$('#checkoutSavingsMessage');if(!host)return;
  ensureSavingsValid();const account=checkoutAccount(),options=availableSavings();
  if(accountBox)accountBox.innerHTML=account?`<div><span>CHECKOUT ACCOUNT</span><strong>${esc(checkoutAccountLabel(account))}</strong></div>${window.NorthZoneMembershipRegistry?.membershipForAccount?.(account)?'<b>Active member</b>':'<b>Standard account</b>'}`:`<div><span>CHECKOUT ACCOUNT</span><strong>Guest / no eligible account detected</strong></div><a href="portal.html">Sign in</a>`;
  const rows=[{code:'none',label:'Do not apply a benefit',detail:'Pay the standard booking amount',savings:0},...options];
  host.innerHTML=rows.map(o=>`<label class="checkout-saving-option ${state.savingsCode===o.code?'selected':''}"><input type="radio" name="checkoutSaving" value="${esc(o.code)}" ${state.savingsCode===o.code?'checked':''}><span class="checkout-saving-check">✓</span><div><strong>${esc(o.label)}</strong><small>${esc(o.detail||'')}</small></div><b>${o.savings>0?`−${currency(o.savings)}`:'Standard'}</b></label>`).join('');
  if(message)message.textContent=options.length?'Only one savings option can be applied to this booking. Selecting another automatically replaces the current choice.':account?'No membership credit or special rate applies to the current booking.':'Sign in to a Player or approved Club account to use account-based rates, credits, or wallet balance.';
  $$('input[name="checkoutSaving"]',host).forEach(input=>input.onchange=()=>{state.savingsCode=input.value;renderCheckoutSavings();renderSummary();if(state.step===4)renderReview();validate()});
}

function summaryItems(){
  let h='';

  state.cart.forEach((r,i)=>{
    const courtCount=r.courts.length;
    const hourCount=r.times.length*SLOT_HOURS;
    const courtHours=r.times.length*SLOT_HOURS*r.courts.length;
    h+=`<article class="summary-reservation-entry">
      <div class="summary-reservation-top">
        <span>RESERVATION ${i+1}</span>
        ${r.autoCurrent?'':`<button type="button" class="summary-remove-reservation" data-summary-remove="${r.id}" aria-label="Remove reservation ${i+1}">×</button>`}
      </div>
      <div class="summary-reservation-date">${fmtDate(r.date)}</div>
      <div class="summary-reservation-primary">
        <div class="summary-reservation-timecard">
          <span>TIME</span>
          <strong>${formatTimes(r.times)}</strong>
          <small>${hourCount} hour${hourCount===1?'':'s'}</small>
        </div>
        <div class="summary-reservation-kpis">
          <div><span>COURTS</span><strong>${courtCount}</strong></div>
          <div><span>COURT-HOURS</span><strong>${courtHours}</strong></div>
        </div>
      </div>
      <div class="summary-reservation-courts">
        <span>SELECTED COURTS</span>
        <strong>${courtCount} court${courtCount===1?'':'s'}</strong>
        <small>${esc(sortedCourtNames(r.courts).join(', '))}</small>
      </div>
      <div class="summary-reservation-subtotal">
        <span>Subtotal · Standard rate</span>
        <strong>${currency(r.amount)}</strong>
      </div>
    </article>`;
  });

  const extras=[];
  if(state.paddles){
    extras.push(`<div class="summary-extra-line"><span>Paddle rental × ${state.paddles}</span><strong>${currency(state.paddles*activePaddleRate())}</strong></div>`);
  }
  if(state.machineQty){
    extras.push(`<div class="summary-extra-line"><span>${state.machineQty===1?'Ball machine':`Ball machines × ${state.machineQty}`} · ${machineHours()} hr${machineHours()===1?'':'s'}</span><strong>${currency(activeMachineRate()*state.machineQty*machineHours())}</strong></div>`);
  }
  const coach=selectedCoach();
  if(wantsCoach()&&coach&&coachingDuration()){
    extras.push(`<div class="summary-extra-line"><span>${esc(coach.name)} · ${esc(coachingTimeRange())} · ${coachingDuration()} hr${coachingDuration()===1?'':'s'} · ${coachingStudentCount()} ${coachingStudentCount()===1?'player':'players'}<small>${esc(coachingCourt())} · ${selectedGoalsForDisplay().map(esc).join(' · ')}</small></span><strong>${currency(coachSubtotal())}</strong></div>`);
  }

  if(extras.length){
    h+=`<div class="summary-extra-group"><span class="summary-extra-heading">ADD-ONS / COACHING</span>${extras.join('')}</div>`;
  }

  return h||'<div class="summary-empty-state"><span>No reservations yet</span><small>Your selected bookings will appear here.</small></div>';
}
function renderSummary(){
  $('#paddleCount').textContent=state.paddles;
  $('#summaryLines').innerHTML=summaryItems();

  const bookingTotal=bookingSubtotal();
  const extrasTotal=addonSubtotal();
  $('#sumBookingSubtotal').textContent=currency(bookingTotal);
  $('#sumAddonSubtotal').textContent=currency(extrasTotal);
  $('#sumAddonRow').classList.toggle('hidden',extrasTotal<=0);
  ensureSavingsValid();
  $('#sumTotal').textContent=currency(total());
  $('#paymentAmount').textContent=currency(total());
  const covered=total()<=0&&grossTotal()>0;
  $('#coveredByBenefitsCard')?.classList.toggle('hidden',!covered);
  $('#externalPaymentSection')?.classList.toggle('hidden',covered);

  $('#summaryReservationCount').textContent=`${state.cart.length} added`;
  $('#summaryClearBooking').classList.toggle('hidden',true);

  const liveDuration=$('#summaryLiveDuration');
  const liveDurationValue=$('#summaryLiveDurationValue');
  const liveCourts=$('#summaryLiveCourts');
  const liveCourtsValue=$('#summaryLiveCourtsValue');

  // Once date + time + courts are valid, the full reservation card is the preview.
  // Only show the lightweight selection block while the reservation is incomplete.
  if(!currentSelectionReady()&&state.times.length){
    liveDuration.classList.remove('hidden');
    liveDurationValue.textContent=formatSelectedDuration(state.times);
  }else{
    liveDuration.classList.add('hidden');
    liveDurationValue.textContent='—';
  }

  if(!currentSelectionReady()&&state.courts.length){
    liveCourts.classList.remove('hidden');
    liveCourtsValue.textContent=formatSelectedCourts(state.courts);
  }else{
    liveCourts.classList.add('hidden');
    liveCourtsValue.textContent='—';
  }

  if(state.cart.length){
    $('#sumTitle').textContent=state.cart.length===1?'Your reservation':`${state.cart.length} reservations`;
    const totalCourts=state.cart.reduce((sum,r)=>sum+r.courts.length,0);
    $('#sumSubtitle').textContent=`${totalCourts} court selection${totalCourts===1?'':'s'} · ${totalCourtHours()} total court-hour${totalCourtHours()===1?'':'s'}`;
  }else{
    $('#sumTitle').textContent='Build your reservation';
    $('#sumSubtitle').textContent=state.date?`${fmtDate()} selected`:'Select a date, time, and court.';
  }

  $$('[data-summary-remove]').forEach(b=>b.onclick=()=>{
    state.cart=state.cart.filter(x=>String(x.id)!==String(b.dataset.summaryRemove));
    renderBuilder();
    updateAll();
  });
}
function renderReview(){
  const f=new FormData($('#detailsForm'));
  const coach=selectedCoach();
  const goals=selectedGoalsForDisplay();

  // Reservation cards
  $('#reviewBookingList').innerHTML=state.cart.map((r,i)=>`
    <article class="review-reservation-item">
      <div class="review-reservation-index">${i+1}</div>
      <div class="review-reservation-main">
        <span>${fmtDate(r.date)}</span>
        <strong>${formatTimes(r.times)}</strong>
        <small>${r.courts.join(', ')} · ${currency(r.rate||RATE)}/court-hr · Standard</small>
      </div>
      <strong class="review-reservation-price">${currency(r.amount)}</strong>
    </article>
  `).join('');

  // Session / purpose
  const sessionRows=[];
  if(isClubBooking()&&clubAuthenticated()){
    const c=currentClub(),r=currentClubRep();
    sessionRows.push({label:'Booking Account',value:'Club'});
    sessionRows.push({label:'Club',value:`${c.name} · ${c.clubId}`});
    sessionRows.push({label:'Booking Representative',value:`${r.name} · ${r.role}`});
    sessionRows.push({label:'Estimated Players',value:String(state.clubExpectedPlayers||'—')});
  }
  sessionRows.push({label:'Booking Purpose',value:state.purpose||'—'});

  if(isTraining()&&state.trainingMode){
    sessionRows.push({label:'Training Setup',value:state.trainingMode});
  }
  if(wantsCoach()&&coach){
    sessionRows.push({label:'Coach',value:coach.name});
    sessionRows.push({label:'Players Training',value:`${coachingStudentCount()} ${coachingStudentCount()===1?'player':'players'}`});
    sessionRows.push({label:'Coaching Time',value:`${coachingTimeRange()} · ${coachingDuration()} hour${coachingDuration()===1?'':'s'}`});
    if(coachingCourt())sessionRows.push({label:'Coaching Court',value:coachingCourt()});
    if(goals.length)sessionRows.push({label:'Top Priorities',value:goals.join(' · '),wide:true});
    if(state.coachingNotes.trim())sessionRows.push({label:'Coaching Notes',value:state.coachingNotes.trim(),wide:true});
  }
  if(f.get('otherPurpose')){
    sessionRows.push({label:'Purpose Detail',value:f.get('otherPurpose'),wide:true});
  }

  $('#reviewSession').innerHTML=sessionRows.map(r=>`
    <div class="review-detail-row ${r.wide?'wide':''}">
      <span>${esc(r.label)}</span>
      <strong>${esc(r.value)}</strong>
    </div>
  `).join('');

  // Customer
  const customerRows=[
    {label:'Full Name',value:f.get('name')||'—'},
    {label:'Mobile',value:f.get('mobile')||'—'},
    {label:'Email',value:f.get('email')||'—'}
  ];
  if(f.get('bookingName'))customerRows.push({label:'Booking Name',value:f.get('bookingName')});

  $('#reviewCustomer').innerHTML=customerRows.map(r=>`
    <div class="review-detail-row">
      <span>${esc(r.label)}</span>
      <strong>${esc(r.value)}</strong>
    </div>
  `).join('');

  // Add-ons / coaching charges
  const addons=[];
  if(state.paddles){
    addons.push({
      type:'Equipment',
      label:'Standard Paddle',
      meta:`Qty ${state.paddles} · ${currency(activePaddleRate())} each`,
      detail:'Paddle rental',
      price:currency(state.paddles*activePaddleRate())
    });
  }
  if(state.machineQty){
    addons.push({
      type:'Equipment',
      label:state.machineQty===1?'Ball Machine':'Ball Machines',
      meta:`Qty ${state.machineQty} · ${machineHours()} hr${machineHours()===1?'':'s'}`,
      detail:`${currency(activeMachineRate())}/hr per machine`,
      price:currency(activeMachineRate()*state.machineQty*machineHours())
    });
  }
  if(wantsCoach()&&coach&&coachingDuration()){
    addons.push({
      type:'Coaching',
      label:coach.name,
      meta:`${coachingTimeRange()} · ${coachingDuration()} hr${coachingDuration()===1?'':'s'} · ${coachingStudentCount()} ${coachingStudentCount()===1?'player':'players'} · ${currency(coachSessionHourlyRate(coach)??0)}/hr`,
      detail:`Coaching session${coachingCourt()?` · ${coachingCourt()}`:''}`,
      price:currency(coachSubtotal())
    });
  }

  const addonsCard=$('#reviewAddonsCard');
  if(addons.length){
    addonsCard.classList.remove('hidden');
    $('#reviewAddons').innerHTML=addons.map(a=>`
      <div class="review-addon-row ${a.type==='Coaching'?'is-coaching':'is-equipment'}">
        <div class="review-addon-leading">
          <span class="review-addon-type">${esc(a.type)}</span>
          <div class="review-addon-copy">
            <strong>${esc(a.label)}</strong>
            <span>${esc(a.meta)}</span>
            <small>${esc(a.detail)}</small>
          </div>
        </div>
        <b class="review-addon-price">${a.price}</b>
      </div>
    `).join('');
  }else{
    addonsCard.classList.add('hidden');
    $('#reviewAddons').innerHTML='';
  }

  renderCheckoutSavings();
  const saving=selectedSavings(),savingValue=savingsAmount();
  $('#reviewBookingSubtotal').textContent=currency(bookingSubtotal());
  $('#reviewAddonSubtotal').textContent=currency(addonSubtotal());
  $('#reviewSavingsRow').classList.toggle('hidden',!saving||savingValue<=0);
  $('#reviewSavingsLabel').textContent=saving?.label||'Savings / Credits';
  $('#reviewSavingsAmount').textContent=`−${currency(savingValue)}`;
  $('#reviewTotal').textContent=currency(total());
}
function coachingBriefValid(){
  if(!wantsCoach())return true;
  if(state.coachingGoals.length<1||state.coachingGoals.length>3)return false;
  if(state.coachingGoals.includes('Other')&&!state.otherGoal.trim())return false;
  if(!state.coachingTimes.length||!timesAreConsecutive(state.coachingTimes))return false;
  const coach=selectedCoach();
  return !!coach&&coachAvailableForSchedule(coach)&&coachCapacityAllows(coach)&&coachRateConfiguredForStudents(coach);
}
function stepValid(){
  if(state.step===1)return currentSelectionReady()&&state.cart.length>0&&(!isClubBooking()||clubAuthenticated());
  if(state.step===2){
    if(!state.purpose)return false;
    if(isClubBooking()&&(!clubAuthenticated()||Number(state.clubExpectedPlayers)<1))return false;
    if(isTraining()&&!state.trainingMode)return false;
    return coachingBriefValid();
  }
  if(state.step===3)return $('#detailsForm').checkValidity();
  if(state.step===4)return true;
  if(state.step===5)return total()<=0||(state.paymentReference.trim().length>=4&&$('#paymentProof').files.length>0);
  return true;
}
function footerText(){
  if(state.step===1){
    if(isClubBooking()&&!clubAuthenticated())return'Sign in to an approved Club to unlock booking';
    return currentSelectionReady()?`Reservation ready · ${currency(bookingSubtotal())}`:'Select a date, time, and court to continue';
  }
  if(state.step===2){
    if(!state.purpose)return'Select a Booking Purpose';
    if(isClubBooking()&&Number(state.clubExpectedPlayers)<1)return'Enter the estimated number of players';
    if(isTraining()&&!state.trainingMode)return'Choose Self-Guided Practice or Train with a Coach';
    if(wantsCoach()){
      if(!state.coachingGoals.length)return'Select your top 1–3 coaching priorities';
      if(state.coachingGoals.includes('Other')&&!state.otherGoal.trim())return'Describe your Other coaching priority';
      if(!state.coachingTimes.length)return'Choose when you need the coach';
      if(!state.coachId)return'Select an available coach to continue';
    }
    return addonSubtotal()>0?`Setup ready · ${currency(addonSubtotal())} add-ons / coaching`:'Setup ready · add-ons are optional';
  }
  if(state.step===3)return'Enter your contact details';
  if(state.step===4)return`Total ${currency(total())}`;
  if(state.step===5)return total()<=0?'No external payment due · submit booking request':(state.paymentReference?'Attach payment proof to submit':'Enter payment reference and proof');
  return'';
}
function validate(){$('#nextButton').disabled=!stepValid();$('#footerMessage').textContent=footerText()}
function renderProgress(){$$('.progress-item').forEach(p=>{const n=Number(p.dataset.jump);p.classList.toggle('active',n===Math.min(state.step,6));p.classList.toggle('done',n<state.step)})}
function nextButtonLabel(n){
  if(n===1)return'Continue to Booking Setup';
  if(n===2)return'Continue to Details';
  if(n===3)return'Continue to Review';
  if(n===4)return'Proceed to Payment';
  if(n===5)return'Submit Booking Request';
  return'Continue';
}
function go(n){
  state.step=n;
  $$('.flow-step').forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===n));
  $('#backButton').style.visibility=(n===1||n===6)?'hidden':'visible';
  $('#nextButton').style.display=n===6?'none':'inline-flex';
  $('#nextButton').textContent=nextButtonLabel(n);
  if(n===2){renderPurposeState();renderCoachingTimeOptions();renderCoachRecommendations()}
  if(n===1)renderBookingContext();
  if(n===3)renderDetailsContext();
  if(n===4)renderReview();
  if(n===5)renderSummary();
  renderProgress();updateAll();window.scrollTo({top:0,behavior:'smooth'});
}
$('#nextButton').onclick=()=>{
  if(state.step===2&&!stepValid()){
    if(!state.purpose){toastMsg('Select a Booking Purpose.');return}
    if(isClubBooking()&&Number(state.clubExpectedPlayers)<1){toastMsg('Enter the estimated number of players.');return}
    if(isTraining()&&!state.trainingMode){toastMsg('Choose how you would like to train.');return}
    if(wantsCoach()&&state.coachingGoals.length<1){toastMsg('Choose at least one coaching priority.');return}
    if(wantsCoach()&&state.coachingGoals.includes('Other')&&!state.otherGoal.trim()){toastMsg('Describe your Other coaching priority.');return}
    if(wantsCoach()&&!state.coachingTimes.length){toastMsg('Choose when you need the coach.');return}
    if(wantsCoach()&&!state.coachId){toastMsg('Select an available coach before continuing.');return}
  }
  if(state.step===3&&!$('#detailsForm').reportValidity())return;
  if(state.step===5){
    if(!stepValid()){toastMsg('Add payment reference number and payment screenshot.');return}
    renderConfirmation();go(6);return;
  }
  go(state.step+1);
};
$('#backButton').onclick=()=>{if(state.step>1)go(state.step-1)};
$$('[data-review-edit]').forEach(b=>b.onclick=()=>go(Number(b.dataset.reviewEdit)));

// ============================================================
// Booking / Cancellation Policy modal
// ============================================================
const POLICY_CONTENT={
  booking:{
    title:'Booking Policy',
    intro:'Key terms that apply when reserving a NorthZone court, coach, or equipment through this booking flow.',
    sections:[
      {
        heading:'Reservation',
        body:'A booking request is not final until NorthZone confirms the reservation and verifies the required payment.'
      },
      {
        heading:'Selected Schedule',
        body:'The customer is responsible for reviewing the selected date, time, court, coach, equipment, and booking details before submitting the request.'
      },
      {
        heading:'Payment',
        body:'Payment must follow the amount and instructions shown in the booking flow. Submission of payment proof does not by itself guarantee confirmation.'
      },
      {
        heading:'Court, Coach & Equipment Availability',
        body:'Court, coach, and equipment availability may change until the booking is confirmed. NorthZone will use the system record when validating availability.'
      },
      {
        heading:'Arrival & Use',
        body:'Customers should arrive with enough time to begin within their confirmed schedule. Booked time is based on the confirmed reservation window.'
      }
    ]
  },
  cancellation:{
    title:'Cancellation Policy',
    intro:'Key terms that apply when a customer needs to cancel or change a NorthZone reservation.',
    sections:[
      {
        heading:'Cancellation Requests',
        body:'Cancellation or rescheduling requests should be submitted through NorthZone using the official booking or support process rather than directly through a coach.'
      },
      {
        heading:'Confirmed Reservations',
        body:'Any refund, credit, or rescheduling eligibility depends on NorthZone’s approved cancellation rules for the confirmed booking.'
      },
      {
        heading:'Late Cancellation / No-Show',
        body:'Late cancellations and no-shows may be subject to reduced or no refund depending on the final NorthZone cancellation terms.'
      },
      {
        heading:'Coach & Equipment Add-ons',
        body:'Coach and equipment reservations are tied to the court schedule. Changes to the booking may require coach or equipment availability to be checked again.'
      },
      {
        heading:'NorthZone-Initiated Changes',
        body:'If NorthZone needs to change or cancel a confirmed reservation, the facility will coordinate the appropriate reschedule, credit, or other resolution under the final approved policy.'
      }
    ]
  }
};

function openPolicyModal(type){
  const published=PLATFORM?.publishedPolicy?.(type),data=POLICY_CONTENT[type],modal=$('#policyModal');if(!data||!modal)return;
  $('#policyModalTitle').textContent=published?.title||data.title;
  if(published?.body){
    $('#policyModalIntro').textContent=`Published by NorthZone · Version ${published.version||'—'} · Effective ${published.effectiveDate||'—'}`;
    $('#policyModalBody').innerHTML=`<section class="policy-section"><p>${esc(published.body).replace(/\n/g,'<br>')}</p></section>`;
  }else{
    $('#policyModalIntro').textContent='NorthZone has not published this policy through the connected Admin contract yet. The text below is preview-only fallback content.';
    $('#policyModalBody').innerHTML=data.sections.map(s=>`<section class="policy-section"><h3>${esc(s.heading)}</h3><p>${esc(s.body)}</p></section>`).join('');
  }
  modal.classList.remove('hidden');document.body.classList.add('modal-open');
}

function closePolicyModal(){
  const modal=$('#policyModal');
  if(modal)modal.classList.add('hidden');
  if($('#coachProfileModal')?.classList.contains('hidden')!==false){
    document.body.classList.remove('modal-open');
  }
}

$$('[data-open-policy]').forEach(b=>b.onclick=()=>openPolicyModal(b.dataset.openPolicy));
$$('[data-close-policy]').forEach(b=>b.onclick=closePolicyModal);

function renderConfirmation(){
  const f=new FormData($('#detailsForm'));
  const coach=selectedCoach();
  const goals=selectedGoalsForDisplay();
  if(!state.confirmationRef)state.confirmationRef=`NZ-${Date.now().toString().slice(-7)}`;
  const training=isTraining()&&state.trainingMode?`<div><span>Training setup</span><strong>${esc(state.trainingMode)}</strong></div>`:'';
  const goalRow=wantsCoach()?`<div><span>Coaching priorities</span><strong>${goals.map(esc).join(' · ')}</strong></div>`:'';
  const coachRow=wantsCoach()&&coach?`<div><span>Coach</span><strong>${esc(coach.name)}</strong></div><div><span>Players training</span><strong>${coachingStudentCount()}</strong></div><div><span>Coaching time</span><strong>${esc(coachingTimeRange())} · ${coachingDuration()} hour${coachingDuration()===1?'':'s'}</strong></div>${coachingCourt()?`<div><span>Coaching court</span><strong>${esc(coachingCourt())}</strong></div>`:''}`:'';
  const clubRow=isClubBooking()&&clubAuthenticated()?`<div><span>Club</span><strong>${esc(currentClub().name)} · ${esc(currentClub().clubId)}</strong></div><div><span>Expected players</span><strong>${esc(state.clubExpectedPlayers)}</strong></div>`:'';
  const saving=selectedSavings(),paymentMethod=total()<=0?'Membership Benefit / Credit':state.wallet,paymentReference=total()<=0?'No external payment required':state.paymentReference;
  $('#confirmationTicket').innerHTML=`<div><span>Reference</span><strong>${esc(state.confirmationRef)}</strong></div>${clubRow}<div><span>Booking Purpose</span><strong>${esc(state.purpose||'—')}</strong></div>${training}${goalRow}${coachRow}<div><span>Name</span><strong>${esc(f.get('name')||'Guest')}</strong></div><div><span>Email</span><strong>${esc(f.get('email')||'—')}</strong></div><div><span>Reservations</span><strong>${state.cart.length}</strong></div><div><span>Court-hours</span><strong>${totalCourtHours()}</strong></div>${saving?`<div><span>Applied Benefit</span><strong>${esc(saving.label)} · −${currency(savingsAmount())}</strong></div>`:''}<div><span>Payment method</span><strong>${esc(paymentMethod)}</strong></div><div><span>Payment reference</span><strong>${esc(paymentReference)}</strong></div><div><span>Gross total</span><strong>${currency(grossTotal())}</strong></div><div><span>Amount due</span><strong>${currency(total())}</strong></div><div><span>Status</span><strong>Pending Confirmation</strong></div>`;
  if(isClubBooking()&&clubAuthenticated()&&!state.submissionRecorded){
    window.NorthZoneClubRegistry?.recordBooking?.({
      reference:state.confirmationRef,status:'Pending Confirmation',purpose:state.purpose,expectedPlayers:Number(state.clubExpectedPlayers||0),
      representative:{name:f.get('name')||currentClubRep()?.name||'',email:f.get('email')||'',mobile:f.get('mobile')||''},
      reservations:state.cart.map(r=>({date:r.date,times:[...r.times],courts:[...r.courts],rate:r.rate,amount:r.amount})),
      addOns:{paddles:state.paddles,ballMachines:state.machineQty,coach:coach?{id:coach.id,name:coach.name,baseRate:effectiveCoachRate(coach),sessionHourlyRate:coachSessionHourlyRate(coach),students:coachingStudentCount(),times:[...state.coachingTimes],durationHours:coachingDuration(),court:coachingCourt()}:null},
      coaching:{trainingMode:state.trainingMode,students:coachingStudentCount(),goals:[...state.coachingGoals],otherGoal:state.otherGoal,notes:state.coachingNotes,times:[...state.coachingTimes],durationHours:coachingDuration(),court:coachingCourt()},
      bookingSubtotal:bookingSubtotal(),addOnSubtotal:addonSubtotal(),grossTotal:grossTotal(),savings:{code:saving?.code||'none',label:saving?.label||'',amount:savingsAmount()},total:total(),
      payment:{method:paymentMethod,reference:total()<=0?'NO-PAYMENT-DUE':state.paymentReference,status:total()<=0?'Covered by Benefit':'Pending Verification'}
    });
    state.submissionRecorded=true;
  }
  if(!state.integrationQueued){
    const customer={name:f.get('name')||'Guest',email:f.get('email')||'',mobile:f.get('mobile')||''};
    const account=checkoutAccount();
    const payload={reference:state.confirmationRef,type:wantsCoach()?'Coaching':'Court',customer,clubId:isClubBooking()&&clubAuthenticated()?currentClub()?.id||'':'',clubCode:isClubBooking()&&clubAuthenticated()?currentClub()?.clubId||'':'',purpose:state.purpose,reservations:state.cart.map(r=>({date:r.date,times:[...r.times],courts:[...r.courts]})),addOns:{paddles:state.paddles,ballMachines:state.machineQty},coaching:wantsCoach()&&coach?{coachProfileId:coach.id,coachName:coach.name,students:coachingStudentCount(),durationMinutes:Math.round(coachingDuration()*60),times:[...state.coachingTimes],court:coachingCourt(),goals:selectedGoalsForDisplay(),notes:state.coachingNotes}:null,account:{type:account?.type||'',playerId:account?.playerId||'',clubId:account?.clubId||''},savingsSelection:{code:saving?.code||'none',memberId:saving?.memberId||''},payment:{method:paymentMethod,reference:total()<=0?'NO-PAYMENT-DUE':state.paymentReference},clientDisplayedGrossTotal:grossTotal(),clientDisplayedSavings:savingsAmount(),clientDisplayedTotal:total()};
    window.NorthZonePlatformBridge?.enqueue?.('booking_request',payload,{source:'NorthZone Booking',fingerprint:state.confirmationRef});
    if(wantsCoach()&&coach&&state.cart.length===1){
      window.NorthZoneCoachReviews?.rememberBooking?.({
        reference:state.confirmationRef,coachProfileId:coach.id,coachName:coach.name,
        sessionDate:coachingDate(),sessionStart:state.coachingTimes[0]||'',durationMinutes:Math.round(coachingDuration()*60)
      });
    }
    state.integrationQueued=true;
  }

}
$('#startAgain').onclick=()=>{location.href=isClubBooking()&&clubAuthenticated()?'booking.html?context=club':'booking.html'};
function updateAll(){renderBookingContext();renderPurposeState();renderCoachingParticipants();renderCoachingTimeOptions();renderCoachRecommendations();renderDetailsContext();renderMachineAvailability();ensureSavingsValid();renderSummary();if(state.step===4)renderCheckoutSavings();validate()}

const requestedContext=new URLSearchParams(location.search).get('context');
if(requestedContext==='club')state.bookingContext='club';
renderCalendar();renderBuilder();renderCart();renderBookingContext();updateAll();go(1);