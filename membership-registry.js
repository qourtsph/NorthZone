(() => {
  const PLAYER_KEY='qourts_demo_profile_v1';
  const LOCAL_SUB_KEY='northzone_membership_local_submissions_v1';
  const bridge=()=>window.NorthZonePlatformBridge||null;
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const parse=(raw,f)=>{try{return JSON.parse(raw)}catch{return f}};
  const lower=v=>String(v||'').trim().toLowerCase();
  const digits=v=>String(v||'').replace(/\D/g,'');
  const localProfile=()=>parse(localStorage.getItem(PLAYER_KEY)||'',null);
  const liveMembershipContract=()=>bridge()?.contract?.()?.memberships||null;
  const bundledMembershipContract=()=>window.NorthZoneBundledMembershipSnapshot?.memberships||null;
  const membershipContract=()=>liveMembershipContract()||bundledMembershipContract()||{plans:[],accounts:[],pending:[]};
  const source=()=>liveMembershipContract()?'admin-public-contract':(bundledMembershipContract()?'bundled-admin-snapshot':'unavailable');
  const plans=()=>clone(membershipContract().plans||[]);
  const publicPlayers=()=>bridge()?.players?.()||[];
  const publicClubs=()=>bridge()?.clubs?.()||[];
  const accountKey=a=>a?.type==='club'?`club:${a.clubId||a.id||''}`:`player:${a.playerId||a.id||a.qourtsId||a.email||''}`;

  function playerAccount(profile=localProfile()){
    if(!profile)return null;
    const players=publicPlayers();
    const p=players.find(x=>profile.qourtsId&&String(x.qourtsId)===String(profile.qourtsId))
      ||players.find(x=>profile.email&&lower(x.email)===lower(profile.email))
      ||players.find(x=>profile.mobile&&digits(x.mobile)===digits(profile.mobile));
    return {
      type:'player',id:p?.id||'',playerId:p?.id||'',qourtsId:p?.qourtsId||profile.qourtsId||'',
      name:p?.displayName||profile.name||'Player',email:profile.email||'',mobile:profile.mobile||'',
      canonical:!!p,profile:clone(profile)
    };
  }
  function clubAccount(){
    const local=window.NorthZoneClubRegistry?.currentClub?.()||null;
    const rep=window.NorthZoneClubRegistry?.currentRepresentative?.()||null;
    if(!local||!rep)return null;
    const pub=publicClubs().find(c=>String(c.id)===String(local.id)||String(c.clubId)===String(local.clubId));
    return {
      type:'club',id:pub?.id||local.id||'',clubId:pub?.id||'',clubCode:pub?.clubId||local.clubId||'',
      name:pub?.name||local.name||'Club',canonical:!!pub,club:clone(pub||local),representative:clone(rep),
      email:rep.email||'',mobile:rep.mobile||''
    };
  }
  function accounts(){return [playerAccount(),clubAccount()].filter(Boolean)}
  function planEligible(plan,accountType){
    const type=lower(plan?.type);return accountType==='club'?['club','corporate'].includes(type):['individual','family'].includes(type);
  }
  function eligiblePlans(account){return plans().filter(p=>p.status==='active'&&planEligible(p,account?.type))}
  function membershipForAccount(account){
    if(!account)return null;const rows=membershipContract().accounts||[];
    return clone(rows.find(m=>account.type==='club'?String(m.clubId)===String(account.clubId):String(m.playerId)===String(account.playerId))||null);
  }
  function localSubmissions(){const x=parse(localStorage.getItem(LOCAL_SUB_KEY)||'',[]);return Array.isArray(x)?x:[]}
  function rememberSubmission(x){const rows=localSubmissions();const i=rows.findIndex(r=>r.localReference===x.localReference);if(i>=0)rows[i]=x;else rows.unshift(x);localStorage.setItem(LOCAL_SUB_KEY,JSON.stringify(rows.slice(0,40)));return x}
  function pendingForAccount(account){
    if(!account)return null;
    const pub=(membershipContract().pending||[]).find(r=>account.type==='club'?String(r.clubId)===String(account.clubId):account.playerId&&String(r.playerId)===String(account.playerId));
    if(pub)return clone(pub);
    const inbound=(bridge()?.inbound?.()||[]).find(e=>e.type==='membership_subscription'&&e.status==='pending'&&(()=>{const p=e.payload||{};return account.type==='club'?String(p.clubId||'')===String(account.clubId||''):((account.playerId&&String(p.playerId||'')===String(account.playerId))||(account.email&&lower(p.contactEmail)===lower(account.email))||(account.mobile&&digits(p.contactMobile)===digits(account.mobile)))})());
    return inbound?{id:inbound.id,status:'submitted_to_admin',planId:inbound.payload?.planId||'',amount:Number(inbound.payload?.amount||0),createdAt:inbound.createdAt||''}:null;
  }
  function plan(id){return plans().find(p=>p.id===id)||null}
  function subscriptionStatus(account){const membership=membershipForAccount(account);return {membership,active:membership?.status==='active'?membership:null,pending:pendingForAccount(account)}}
  function cycleUsage(member){return clone(member?.benefits?.cycleUsage||[])}
  function walletTransactions(member){return clone(member?.walletTransactions||[])}
  function invoices(member){return clone(member?.invoices||[])}

  function clubRate(account,date,time,baseRate,court='all'){
    if(account?.type!=='club')return null;
    const local=window.NorthZoneClubRegistry?.currentClub?.();
    const direct=Number(local?.pricing?.courtRate);
    return Number.isFinite(direct)&&direct>=0?direct:null;
  }

  function checkoutOptions(account,ctx={}){
    const member=membershipForAccount(account),out=[];
    const gross=Math.max(0,Number(ctx.grossTotal||0)),courtTotal=Math.max(0,Number(ctx.courtTotal||0)),courtHours=Math.max(0,Number(ctx.courtHours||0)),paddles=Math.max(0,Number(ctx.paddles||0)),paddleTotal=Math.max(0,Number(ctx.paddleTotal||0)),coachTotal=Math.max(0,Number(ctx.coachTotal||0));
    if(account?.type==='club'&&ctx.date&&ctx.time&&courtHours>0){const rate=clubRate(account,ctx.date,ctx.time,Number(ctx.baseCourtRate||0),ctx.court||'all');if(Number.isFinite(rate)&&rate>=0&&rate<Number(ctx.baseCourtRate||0)){const savings=(Number(ctx.baseCourtRate)-rate)*courtHours;out.push({code:'club_rate',memberId:'',label:'Club Special Rate',detail:`₱${rate.toLocaleString()}/court-hr`,savings:Number(savings.toFixed(2)),quantity:courtHours,unit:'court_hours'})}}
    if(member?.status==='active'){
      const b=member.benefits||{};
      if(Number(b.courtDiscountPct)>0&&courtTotal>0)out.push({code:'membership_discount',memberId:member.memberId,label:`${b.courtDiscountPct}% Membership Court Discount`,detail:`${b.plan?.name||'Membership'} benefit`,savings:Number((courtTotal*Number(b.courtDiscountPct)/100).toFixed(2)),quantity:Number(b.courtDiscountPct),unit:'percent'});
      if(Number(b.freeCourtHoursRemaining)>0&&courtHours>0){const q=Math.min(Number(b.freeCourtHoursRemaining),courtHours),unit=courtHours?courtTotal/courtHours:0;out.push({code:'court_hours_credit',memberId:member.memberId,label:`Use ${q} Free Court Hour${q===1?'':'s'}`,detail:`${b.freeCourtHoursRemaining} hour${Number(b.freeCourtHoursRemaining)===1?'':'s'} remaining this cycle`,savings:Number(Math.min(courtTotal,q*unit).toFixed(2)),quantity:q,unit:'court_hours'})}
      if(Number(b.freePaddleRentalsRemaining)>0&&paddles>0&&paddleTotal>0){const q=Math.min(Number(b.freePaddleRentalsRemaining),paddles),unit=paddles?paddleTotal/paddles:0;out.push({code:'paddle_credit',memberId:member.memberId,label:`Use ${q} Free Paddle Rental${q===1?'':'s'}`,detail:`${b.freePaddleRentalsRemaining} rental${Number(b.freePaddleRentalsRemaining)===1?'':'s'} remaining`,savings:Number(Math.min(paddleTotal,q*unit).toFixed(2)),quantity:q,unit:'paddle_rental'})}
      if(Number(b.freeCoachingRemaining)>0&&coachTotal>0)out.push({code:'coaching_credit',memberId:member.memberId,label:'Use 1 Free Coaching Session',detail:`${b.freeCoachingRemaining} session${Number(b.freeCoachingRemaining)===1?'':'s'} remaining`,savings:Number(coachTotal.toFixed(2)),quantity:1,unit:'coaching_session'});
      if(Number(b.walletBalance)>0&&gross>0)out.push({code:'member_wallet',memberId:member.memberId,label:'Use Member Wallet / Credits',detail:`₱${Number(b.walletBalance).toLocaleString()} available`,savings:Number(Math.min(Number(b.walletBalance),gross).toFixed(2)),quantity:Number(Math.min(Number(b.walletBalance),gross).toFixed(2)),unit:'wallet'});
    }
    return out.filter(x=>x.savings>0).sort((a,b)=>b.savings-a.savings);
  }

  function submitSubscription({account,planId,signerName,accepted,paymentMethod,paymentReference,paymentProofName,paymentProofDataUrl}={}){
    if(!account)return {ok:false,reason:'sign_in_required'};const p=plan(planId);if(!p||!planEligible(p,account.type))return {ok:false,reason:'plan_not_eligible'};
    if(membershipForAccount(account)?.status==='active')return {ok:false,reason:'already_active'};if(pendingForAccount(account))return {ok:false,reason:'already_pending'};
    const expected=account.type==='club'?String(account.representative?.name||'').trim():String(account.name||'').trim();if(!String(signerName||'').trim()||!accepted)return {ok:false,reason:'signature_required'};
    if(expected&&lower(expected)!==lower(signerName))return {ok:false,reason:'signature_name_mismatch'};
    if(!paymentMethod)return {ok:false,reason:'payment_method_required'};if(paymentMethod!=='Pay at Venue'&&!String(paymentReference||'').trim())return {ok:false,reason:'payment_reference_required'};
    const localReference=`MSUB-${Date.now().toString(36).toUpperCase()}`;
    const payload={reference:localReference,accountType:account.type,playerId:account.playerId||'',clubId:account.clubId||'',accountName:account.name||'',contactEmail:account.email||'',contactMobile:account.mobile||'',planId:p.id,amount:Number(p.price||0),signerName:String(signerName).trim(),accepted:true,signedAt:new Date().toISOString(),paymentMethod,paymentReference:String(paymentReference||'').trim(),paymentProofName:String(paymentProofName||''),paymentProofDataUrl:String(paymentProofDataUrl||'')};
    const q=bridge()?.enqueue?.('membership_subscription',payload,{source:'NorthZone Membership Checkout',fingerprint:localReference});if(!q?.ok)return q||{ok:false,reason:'queue_failed'};
    rememberSubmission({localReference,accountKey:accountKey(account),planId:p.id,amount:Number(p.price||0),status:'submitted_to_admin',createdAt:new Date().toISOString(),inboundId:q.entry?.id||''});
    return {ok:true,reference:localReference,entry:q.entry,plan:clone(p)};
  }

  function profileModel(account){
    const member=membershipForAccount(account),pending=pendingForAccount(account),eligible=eligiblePlans(account);
    return {account:clone(account),member,pending,eligiblePlans:eligible,usage:cycleUsage(member),walletTransactions:walletTransactions(member),invoices:invoices(member)};
  }

  window.NorthZoneMembershipRegistry={plans,plan,accounts,playerAccount,clubAccount,eligiblePlans,planEligible,membershipForAccount,pendingForAccount,subscriptionStatus,checkoutOptions,clubRate,submitSubscription,profileModel,accountKey,localSubmissions,source};
})();
