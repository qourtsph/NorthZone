(() => {
  const OWNED_KEY='northzone_coach_review_owned_sessions_v1';
  const PROFILE_KEY='qourts_demo_profile_v1';
  const SNOOZE_PREFIX='northzone_coach_review_snooze:';
  const MAX_COMMENT=500;
  const LABELS={1:'Poor',2:'Fair',3:'Good',4:'Very Good',5:'Excellent'};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parse=(raw,fallback)=>{try{return JSON.parse(raw)}catch{return fallback}};
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const owned=()=>{const rows=parse(localStorage.getItem(OWNED_KEY)||'',[]);return Array.isArray(rows)?rows:[]};
  const saveOwned=rows=>localStorage.setItem(OWNED_KEY,JSON.stringify(rows));
  function profile(){const p=parse(localStorage.getItem(PROFILE_KEY)||'',null);return p&&typeof p==='object'?p:null}
  function publicPlayer(){
    const p=profile();if(!p)return null;
    return (window.NorthZonePlatformBridge?.players?.()||[]).find(x=>(p.qourtsId&&x.qourtsId===p.qourtsId)||(p.uuid&&x.id===p.uuid))||null;
  }
  function rememberBooking(input={}){
    const reference=String(input.reference||'').trim(),coachProfileId=String(input.coachProfileId||'').trim();
    if(!reference||!coachProfileId)return {ok:false,reason:'missing_reference'};
    const rows=owned(),existing=rows.find(r=>r.reference===reference),player=publicPlayer(),p=profile();
    const next=Object.assign(existing||{},{
      reference,coachProfileId,coachName:String(input.coachName||existing?.coachName||'Coach'),
      sessionDate:String(input.sessionDate||existing?.sessionDate||''),sessionStart:String(input.sessionStart||existing?.sessionStart||''),
      durationMinutes:Number(input.durationMinutes||existing?.durationMinutes||0),playerId:String(player?.id||existing?.playerId||''),
      qourtsId:String(p?.qourtsId||existing?.qourtsId||''),rememberedAt:existing?.rememberedAt||new Date().toISOString()
    });
    if(existing)Object.assign(existing,next);else rows.unshift(next);
    saveOwned(rows);return {ok:true,record:clone(next)};
  }
  function pendingInbound(reviewKey){
    return (window.NorthZonePlatformBridge?.inbound?.()||[]).some(e=>e.type==='coach_review_submission'&&e.clientReference===reviewKey&&!['rejected'].includes(e.status));
  }
  function currentPlayerId(){return String(publicPlayer()?.id||'')}
  function eligible(){
    const eligibility=window.NorthZonePlatformBridge?.coachReviewEligibility?.()||[],rows=owned(),pid=currentPlayerId();
    return eligibility.filter(e=>{
      const key=String(e.reviewKey||e.bookingReference||'');
      const mine=rows.find(r=>r.reference===String(e.bookingReference||key));
      const identityMatch=pid&&String(e.playerId||'')===pid;
      if(!mine&&!identityMatch)return false;
      if(mine?.reviewSubmittedAt||pendingInbound(key))return false;
      if(sessionStorage.getItem(SNOOZE_PREFIX+key))return false;
      return true;
    }).sort((a,b)=>String(a.completedAt||'').localeCompare(String(b.completedAt||'')));
  }
  function markSubmitted(reference){
    const rows=owned(),r=rows.find(x=>x.reference===reference);
    if(r){r.reviewSubmittedAt=new Date().toISOString();saveOwned(rows)}
  }
  function close(){
    document.querySelector('#northzoneCoachReviewModal')?.remove();
    document.body.classList.remove('coach-review-modal-open');
  }
  function starsMarkup(selected=0){
    return [1,2,3,4,5].map(n=>`<button type="button" class="coach-review-star ${n<=selected?'selected':''}" data-coach-review-star="${n}" aria-label="${n} star${n===1?'':'s'}">★</button>`).join('');
  }
  function render(entry){
    if(document.querySelector('#northzoneCoachReviewModal'))return;
    const key=String(entry.reviewKey||entry.bookingReference||''),date=entry.sessionDate?new Date(`${entry.sessionDate}T12:00:00`).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}):'Completed session';
    const wrapper=document.createElement('div');wrapper.id='northzoneCoachReviewModal';wrapper.className='coach-review-overlay';
    wrapper.innerHTML=`<div class="coach-review-dialog" role="dialog" aria-modal="true" aria-labelledby="coachReviewTitle">
      <button type="button" class="coach-review-close" data-coach-review-later aria-label="Review later">×</button>
      <div class="coach-review-kicker">VERIFIED COACHING SESSION</div>
      <h2 id="coachReviewTitle">How was your session with ${esc(entry.coachName||'your coach')}?</h2>
      <p class="coach-review-intro">Your review helps other players choose a coach. It will appear on the coach's NorthZone profile as a verified session review.</p>
      <div class="coach-review-session"><span>${esc(date)}</span><strong>${Number(entry.durationMinutes||0)} min session</strong></div>
      <div class="coach-review-stars-input" id="coachReviewStars">${starsMarkup(0)}</div>
      <div class="coach-review-rating-label" id="coachReviewRatingLabel">Tap a star to rate your session</div>
      <label class="coach-review-comment">Share more <em>Optional</em><textarea id="coachReviewComment" maxlength="${MAX_COMMENT}" placeholder="What went well? What could have been better?"></textarea><span><b id="coachReviewCount">0</b> / ${MAX_COMMENT}</span></label>
      <div class="coach-review-note"><strong>Verified review</strong><span>Only one review is allowed for this completed coaching session.</span></div>
      <div class="coach-review-actions"><button type="button" class="coach-review-later" data-coach-review-later>Maybe Later</button><button type="button" class="coach-review-submit" id="coachReviewSubmit" disabled>Submit Review</button></div>
      <div class="coach-review-message" id="coachReviewMessage"></div>
    </div>`;
    document.body.appendChild(wrapper);document.body.classList.add('coach-review-modal-open');
    let rating=0;
    const drawStars=()=>{
      wrapper.querySelectorAll('[data-coach-review-star]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.coachReviewStar)<=rating));
      const label=wrapper.querySelector('#coachReviewRatingLabel');label.textContent=rating?`${LABELS[rating]} · ${rating} out of 5`:'Tap a star to rate your session';
      wrapper.querySelector('#coachReviewSubmit').disabled=!rating;
    };
    wrapper.querySelectorAll('[data-coach-review-star]').forEach(b=>b.onclick=()=>{rating=Number(b.dataset.coachReviewStar);drawStars()});
    const comment=wrapper.querySelector('#coachReviewComment'),count=wrapper.querySelector('#coachReviewCount');
    comment.oninput=()=>count.textContent=String(comment.value.length);
    wrapper.querySelectorAll('[data-coach-review-later]').forEach(b=>b.onclick=()=>{sessionStorage.setItem(SNOOZE_PREFIX+key,'1');close()});
    wrapper.querySelector('#coachReviewSubmit').onclick=()=>{
      if(!rating)return;
      const p=profile(),player=publicPlayer(),button=wrapper.querySelector('#coachReviewSubmit'),message=wrapper.querySelector('#coachReviewMessage');
      button.disabled=true;button.textContent='Submitting…';
      const result=window.NorthZonePlatformBridge?.enqueue?.('coach_review_submission',{
        reviewKey:key,bookingReference:String(entry.bookingReference||''),coachProfileId:String(entry.coachProfileId||''),
        playerId:String(player?.id||entry.playerId||''),rating,comment:comment.value.trim(),
        reviewer:{playerId:String(player?.id||''),qourtsId:String(p?.qourtsId||''),displayName:String(p?.name||'')}
      },{source:'NorthZone Verified Coach Review',fingerprint:key});
      if(!result?.ok){button.disabled=false;button.textContent='Submit Review';message.textContent='Unable to submit the review. Please try again.';return}
      markSubmitted(String(entry.bookingReference||key));message.classList.add('success');message.innerHTML='<strong>Thank you.</strong> Your verified review has been submitted.';
      setTimeout(close,1100);
    };
    wrapper.addEventListener('click',e=>{if(e.target===wrapper){sessionStorage.setItem(SNOOZE_PREFIX+key,'1');close()}});
    document.addEventListener('keydown',function escClose(e){if(e.key==='Escape'&&document.querySelector('#northzoneCoachReviewModal')){sessionStorage.setItem(SNOOZE_PREFIX+key,'1');close();document.removeEventListener('keydown',escClose)}});
  }
  function promptIfEligible(){
    if(document.querySelector('#northzoneCoachReviewModal'))return false;
    const next=eligible()[0];if(!next)return false;
    if(document.body.classList.contains('modal-open')){setTimeout(promptIfEligible,1200);return false}
    render(next);return true;
  }
  function schedule(){setTimeout(promptIfEligible,650)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
  window.addEventListener('storage',e=>{if(e.key===window.NorthZonePlatformBridge?.publicKey)schedule()});
  window.NorthZoneCoachReviews={rememberBooking,eligible,promptIfEligible,close,owned:()=>clone(owned())};
})();