(() => {
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const REG=()=>window.NorthZoneMembershipRegistry;
  const BRIDGE=()=>window.NorthZonePlatformBridge;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>'₱'+Number(n||0).toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:2});
  const cycle=v=>String(v||'monthly').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
  let selectedPlan=null,selectedAccount=null,paymentMethod='GCash',proof={name:'',dataUrl:''};

  const menu=$('#cxMenu'),mobile=$('#cxMobileNav');menu?.addEventListener('click',()=>mobile.classList.toggle('show'));

  function accountForPlan(plan){
    const type=String(plan?.type||'').toLowerCase();return ['club','corporate'].includes(type)?REG()?.clubAccount?.():REG()?.playerAccount?.();
  }
  function expectedSigner(account){return account?.type==='club'?(account.representative?.name||''):(account?.name||'')}
  function planBenefits(p){
    const benefits=[];
    if(Number(p.courtDiscountPct)>0)benefits.push(`${p.courtDiscountPct}% court discount`);
    if(Number(p.freeCourtHours)>0)benefits.push(`${p.freeCourtHours} free court hour${Number(p.freeCourtHours)===1?'':'s'} / cycle`);
    if(Number(p.freePaddleRentals)>0)benefits.push(`${p.freePaddleRentals} free paddle rental${Number(p.freePaddleRentals)===1?'':'s'} / cycle`);
    if(Number(p.freeCoachingSessions)>0)benefits.push(`${p.freeCoachingSessions} free coaching session${Number(p.freeCoachingSessions)===1?'':'s'} / cycle`);
    if(Number(p.advanceBookingDays)>0)benefits.push(`${p.advanceBookingDays}-day advance booking`);
    if(p.priorityWaitlist)benefits.push('Priority waitlist');
    if(p.memberOnlyEvents)benefits.push('Member-only events');
    if(Number(p.walletBonusPct)>0)benefits.push(`${p.walletBonusPct}% wallet top-up bonus`);
    return benefits;
  }
  function renderAccountCard(){
    const accounts=REG()?.accounts?.()||[],card=$('#membershipAccountCard');
    if(!accounts.length){card.innerHTML='<small>ACCOUNT STATUS</small><strong>Sign in to subscribe</strong><span>Player or approved Club account required</span><a href="portal.html">Open My Portal →</a>';return}
    const labels=accounts.map(a=>`${a.type==='club'?'Club':'Player'} · ${a.name}${a.canonical?'':' · local profile'}`);
    card.innerHTML=`<small>AVAILABLE ACCOUNT${accounts.length===1?'':'S'}</small><strong>${esc(accounts.length===1?labels[0]:'Player + Club')}</strong><span>${esc(labels.join(' · '))}</span><a href="portal.html">Manage accounts →</a>`;
  }
  function renderMembershipBanners(){
    const active=$('#membershipActiveBanner'),pending=$('#membershipPendingBanner');active.classList.add('hidden');pending.classList.add('hidden');
    const accounts=REG()?.accounts?.()||[];
    const activeRows=accounts.map(a=>({a,m:REG().membershipForAccount(a)})).filter(x=>x.m);
    const pendingRows=accounts.map(a=>({a,p:REG().pendingForAccount(a)})).filter(x=>x.p&&!REG().membershipForAccount(x.a));
    if(activeRows.length){active.classList.remove('hidden');active.innerHTML=activeRows.map(({a,m})=>`<div><span>ACTIVE ${a.type.toUpperCase()} MEMBERSHIP</span><strong>${esc(m.benefits?.plan?.name||m.planId)}</strong><small>${esc(a.name)} · ${money(m.benefits?.walletBalance||0)} wallet · ${m.benefits?.freeCourtHoursRemaining||0} court-hour credits remaining</small></div><a href="${a.type==='club'?'club-portal.html#membership':'my-qourts.html#membership'}">View Membership</a>`).join('')}
    if(pendingRows.length){pending.classList.remove('hidden');pending.innerHTML=pendingRows.map(({a,p})=>`<div><span>PAYMENT VERIFICATION PENDING</span><strong>${esc(REG().plan(p.planId)?.name||p.planId||'Membership')}</strong><small>${esc(a.name)} · submitted ${p.createdAt?new Date(p.createdAt).toLocaleString():'recently'}</small></div>`).join('')}
  }
  function renderPlans(){
    const plans=REG()?.plans?.()||[],grid=$('#membershipPlanGrid'),source=$('#membershipPlanSource'),dataSource=REG()?.source?.()||'unavailable';
    if(!plans.length){source.textContent=dataSource==='unavailable'?'Membership plan data is unavailable.':'0 active plans published by NorthZone Admin.';grid.innerHTML='<div class="membership-empty"><strong>No active plans.</strong><span>NorthZone has not published an active membership plan.</span></div>';return}
    source.textContent=dataSource==='admin-public-contract'?`${plans.length} active plan${plans.length===1?'':'s'} published by NorthZone Admin.`:`${plans.length} active plan${plans.length===1?'':'s'} available. Pricing and benefits come from the NorthZone Admin configuration included with this release.`;
    grid.innerHTML=plans.map(p=>{const account=accountForPlan(p),status=account?REG().subscriptionStatus(account):{active:null,pending:null},benefits=planBenefits(p),isCurrent=status.active?.planId===p.id;
      let actionLabel='Subscribe',actionClass='membership-plan-subscribe',disabled='';
      if(!account){actionLabel=String(p.type).toLowerCase()==='club'||String(p.type).toLowerCase()==='corporate'?'Sign in as Club':'Sign in as Player';actionClass='membership-plan-signin'}
      else if(status.active){actionLabel=isCurrent?'Current Plan':'Membership Active';disabled='disabled';actionClass='membership-plan-current'}
      else if(status.pending){actionLabel='Verification Pending';disabled='disabled';actionClass='membership-plan-pending'}
      return `<article class="membership-plan-v2 ${isCurrent?'current':''}"><div class="membership-plan-type">${esc(p.type)}</div><h3>${esc(p.name)}</h3><div class="membership-plan-price"><strong>${money(p.price)}</strong><span>/ ${esc(cycle(p.billingCycle).toLowerCase())}</span></div><p>${esc(p.notes||'NorthZone membership plan.')}</p><div class="membership-plan-benefits">${benefits.map(x=>`<div><b>✓</b><span>${esc(x)}</span></div>`).join('')||'<div><span>Plan benefits are configured in NorthZone Admin.</span></div>'}</div><div class="membership-plan-account">${account?`For <strong>${esc(account.name)}</strong> · ${account.type==='club'?'Club':'Player'}`:`${String(p.type).toLowerCase()==='club'||String(p.type).toLowerCase()==='corporate'?'Approved Club':'Player'} account required`}</div><button class="${actionClass}" data-membership-plan="${esc(p.id)}" ${disabled}>${esc(actionLabel)}</button></article>`}).join('')||'<div class="membership-empty"><strong>No active plans.</strong><span>NorthZone has not published an active membership plan.</span></div>';
    $$('[data-membership-plan]').forEach(btn=>btn.onclick=()=>{const p=REG().plan(btn.dataset.membershipPlan),account=accountForPlan(p);if(!account){location.href='portal.html';return}openCheckout(p,account)});
  }
  function renderAll(){renderAccountCard();renderMembershipBanners();renderPlans()}

  function goStep(n){$$('[data-ms-step]').forEach(x=>x.classList.toggle('active',Number(x.dataset.msStep)===n));$$('[data-ms-step-indicator]').forEach(x=>x.classList.toggle('active',Number(x.dataset.msStepIndicator)<=n))}
  function openCheckout(plan,account){
    const status=REG().subscriptionStatus(account);if(status.active||status.pending)return;
    selectedPlan=plan;selectedAccount=account;paymentMethod='';proof={name:'',dataUrl:''};
    $('#membershipCheckoutTitle').textContent=plan.name;$('#membershipCheckoutSubtitle').textContent=`${account.type==='club'?'Club':'Player'} subscription · ${account.name}`;
    $('#membershipCheckoutAccount').innerHTML=`<span>SUBSCRIBING ACCOUNT</span><strong>${esc(account.name)}</strong><small>${account.type==='club'?`Approved Club · Representative: ${esc(account.representative?.name||'—')}`:`Player · ${esc(account.qourtsId||account.email||'Local profile')}`}</small>`;
    $('#membershipCheckoutPlan').innerHTML=`<div><span>${esc(plan.type)}</span><h3>${esc(plan.name)}</h3><p>${esc(plan.notes||'')}</p></div><strong>${money(plan.price)}<small>/ ${esc(cycle(plan.billingCycle).toLowerCase())}</small></strong><div class="membership-checkout-benefits">${planBenefits(plan).map(x=>`<span>✓ ${esc(x)}</span>`).join('')}</div>`;
    const signer=expectedSigner(account);$('#membershipSignerName').value='';$('#membershipSignerHint').textContent=signer?`Sign exactly as: ${signer}`:'Type the authorized account holder name.';$('#membershipAgreementAccepted').checked=false;
    $('#membershipPaymentAmount').textContent=money(plan.price);$('#membershipPaymentCycle').textContent=`${cycle(plan.billingCycle)} membership`;
    $('#membershipPaymentReference').value='';$('#membershipPaymentProof').value='';$('#membershipPaymentProofName').textContent='No file selected · max 1 MB';$('#membershipCheckoutMessage').textContent='';renderPaymentMethods();goStep(1);$('#membershipCheckout').classList.remove('hidden');document.body.classList.add('membership-checkout-open');
  }
  function closeCheckout(){if($('#membershipCheckout [data-ms-step="4"]').classList.contains('active'))renderAll();$('#membershipCheckout').classList.add('hidden');document.body.classList.remove('membership-checkout-open')}
  function renderPaymentMethods(){
    const methods=BRIDGE()?.paymentMethods?.()||{},available=[];if(methods.gcash)available.push('GCash');if(methods.maya)available.push('Maya');if(methods.payAtVenue)available.push('Pay at Venue');
    paymentMethod=available[0]||'';$('#membershipPaymentMethods').innerHTML=available.map(m=>`<button type="button" class="membership-payment-method ${m===paymentMethod?'selected':''}" data-membership-payment="${esc(m)}"><strong>${esc(m)}</strong><span>${m==='Pay at Venue'?'Pay and verify at NorthZone':'Submit payment reference for verification'}</span><b>${m===paymentMethod?'✓':''}</b></button>`).join('')||'<div class="membership-empty"><strong>No payment methods enabled.</strong></div>';
    $$('[data-membership-payment]').forEach(b=>b.onclick=()=>{paymentMethod=b.dataset.membershipPayment;renderPaymentMethods();syncPaymentMethod()});syncPaymentMethod();
  }
  function syncPaymentMethod(){
    const atVenue=paymentMethod==='Pay at Venue',qr=$('#membershipPaymentQrWrap'),ref=$('#membershipPaymentReferenceField');qr.classList.toggle('hidden',atVenue);ref.classList.toggle('hidden',atVenue);if(!atVenue){$('#membershipPaymentQr').src=paymentMethod==='Maya'?'assets/maya-demo-qr.png':'assets/gcash-demo-qr.png';$('#membershipPaymentQr').alt=`Demo ${paymentMethod} QR`}
  }
  async function readProof(file){if(!file)return {name:'',dataUrl:''};if(file.size>1024*1024)throw new Error('proof_too_large');if(!String(file.type||'').startsWith('image/'))throw new Error('proof_type');return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve({name:file.name,dataUrl:String(r.result||'')});r.onerror=reject;r.readAsDataURL(file)})}
  function validateAgreement(){const expected=expectedSigner(selectedAccount),name=$('#membershipSignerName').value.trim(),accepted=$('#membershipAgreementAccepted').checked;if(!name||!accepted)return {ok:false,message:'Type your name and accept the membership acknowledgement.'};if(expected&&name.toLowerCase()!==expected.trim().toLowerCase())return {ok:false,message:`Please sign exactly as ${expected}.`};return {ok:true}}

  $('#membershipCheckoutClose').onclick=closeCheckout;$$('[data-ms-cancel]').forEach(b=>b.onclick=closeCheckout);$$('[data-ms-back]').forEach(b=>b.onclick=()=>goStep(Number(b.dataset.msBack)));
  $$('[data-ms-next]').forEach(b=>b.onclick=()=>{const next=Number(b.dataset.msNext);if(next===3){const v=validateAgreement();if(!v.ok){alert(v.message);return}}goStep(next)});
  $('#membershipPaymentProof').onchange=async e=>{try{proof=await readProof(e.target.files?.[0]);$('#membershipPaymentProofName').textContent=proof.name||'No file selected · max 1 MB'}catch(err){proof={name:'',dataUrl:''};e.target.value='';$('#membershipPaymentProofName').textContent=err.message==='proof_too_large'?'File is larger than 1 MB.':'Use an image file.'}};
  $('#membershipSubmit').onclick=()=>{
    const agreement=validateAgreement();if(!agreement.ok){$('#membershipCheckoutMessage').textContent=agreement.message;return}if(!paymentMethod){$('#membershipCheckoutMessage').textContent='No payment method is available.';return}const ref=$('#membershipPaymentReference').value.trim();if(paymentMethod!=='Pay at Venue'&&!ref){$('#membershipCheckoutMessage').textContent='Enter the payment reference number.';return}
    const result=REG().submitSubscription({account:selectedAccount,planId:selectedPlan.id,signerName:$('#membershipSignerName').value.trim(),accepted:true,paymentMethod,paymentReference:ref,paymentProofName:proof.name,paymentProofDataUrl:proof.dataUrl});
    if(!result.ok){const messages={already_active:'This account already has an active membership.',already_pending:'A membership payment is already awaiting verification.',signature_name_mismatch:'The signature name does not match the signed-in account.',sign_in_required:'Sign in before subscribing.'};$('#membershipCheckoutMessage').textContent=messages[result.reason]||'Unable to submit membership. Please review the information and try again.';return}
    $('#membershipSubmittedTicket').innerHTML=`<div><span>Reference</span><strong>${esc(result.reference)}</strong></div><div><span>Account</span><strong>${esc(selectedAccount.name)}</strong></div><div><span>Plan</span><strong>${esc(selectedPlan.name)}</strong></div><div><span>Payment</span><strong>${esc(paymentMethod)}</strong></div><div><span>Amount</span><strong>${money(selectedPlan.price)}</strong></div><div><span>Status</span><strong>Pending Payment Verification</strong></div>`;goStep(4);renderMembershipBanners();renderPlans();
  };
  $('#membershipSubmittedDone').onclick=closeCheckout;
  $('#membershipCheckout').addEventListener('click',e=>{if(e.target===$('#membershipCheckout'))closeCheckout()});

  window.addEventListener('storage',e=>{if(e.key===BRIDGE()?.publicKey||e.key===BRIDGE()?.inboundKey)renderAll()});
  renderAll();
})();
