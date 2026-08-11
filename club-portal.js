const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const currency=n=>'₱'+Number(n||0).toLocaleString();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=iso=>{try{return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}catch{return iso||'—'}};
const initials=name=>String(name||'Club').split(/\s+/).filter(Boolean).map(x=>x[0]).slice(0,2).join('').toUpperCase()||'CL';
let pendingClubLogo;
let pendingRepresentativePhoto;
let clubLeaderboardPeriod='month';
let clubLeaderboardMetric='wins';
let clubPraisePeriod='month';
let clubPraiseCategory='all';
let clubAnnouncementFilter='all';
let clubFeedFilter='all';
let pendingAnnouncementPhoto;
let pendingAnnouncementPhotoName='';

function setImagePreview(imgEl,fallbackEl,dataUrl,fallbackText){
  if(dataUrl){
    imgEl.src=dataUrl;
    imgEl.classList.remove('hidden');
    fallbackEl.classList.add('hidden');
  }else{
    imgEl.removeAttribute('src');
    imgEl.classList.add('hidden');
    fallbackEl.textContent=fallbackText;
    fallbackEl.classList.remove('hidden');
  }
}

function processProfileImage(file,maxDimension=720){
  return new Promise((resolve,reject)=>{
    if(!file)return reject(new Error('Choose an image first.'));
    if(!['image/png','image/jpeg','image/webp'].includes(file.type))return reject(new Error('Use a PNG, JPG, or WebP image.'));
    if(file.size>8*1024*1024)return reject(new Error('Image is too large. Use a file under 8 MB.'));

    const reader=new FileReader();
    reader.onerror=()=>reject(new Error('Unable to read this image.'));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error('This image could not be opened.'));
      img.onload=()=>{
        const scale=Math.min(1,maxDimension/Math.max(img.naturalWidth,img.naturalHeight));
        const width=Math.max(1,Math.round(img.naturalWidth*scale));
        const height=Math.max(1,Math.round(img.naturalHeight*scale));
        const canvas=document.createElement('canvas');
        canvas.width=width;canvas.height=height;
        const ctx=canvas.getContext('2d');
        ctx.imageSmoothingEnabled=true;
        ctx.imageSmoothingQuality='high';
        ctx.drawImage(img,0,0,width,height);
        let dataUrl=canvas.toDataURL('image/webp',.86);
        if(!dataUrl.startsWith('data:image/webp'))dataUrl=canvas.toDataURL('image/png');
        if(dataUrl.length>900000)return reject(new Error('Image is still too large after resizing. Try a simpler or smaller image.'));
        resolve(dataUrl);
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function showSignedIn(){const c=NorthZoneClubRegistry.currentClub(),r=NorthZoneClubRegistry.currentRepresentative();if(!c||!r)return false;const demo=Boolean(NorthZoneClubRegistry.isDemoSession?.());$('#clubPortalSignIn').classList.add('hidden');$('#clubWorkspace').classList.remove('hidden');$('#portalClubName').textContent=c.name;$('#portalClubMeta').textContent=`${c.clubId} · ${demo?'Previewing as':'Signed in as'} ${r.name} · ${r.role}`;$('#clubDemoPreviewBadge')?.classList.toggle('hidden',!demo);$('#portalResetDemo')?.classList.toggle('hidden',!demo);renderAll();const requested=(location.hash||'').replace('#','');openTab(requested||'overview',false);return true}
function showSignedOut(){$('#clubWorkspace').classList.add('hidden');$('#clubPortalSignIn').classList.remove('hidden')}
$('#clubPortalSignInForm').onsubmit=e=>{e.preventDefault();const res=NorthZoneClubRegistry.signIn($('#portalEmail').value,$('#portalPassword').value);if(res.ok){$('#portalSignInMessage').textContent='';showSignedIn()}else $('#portalSignInMessage').textContent=res.message};
$('#portalDemoAccess').onclick=()=>{const res=NorthZoneClubRegistry.startDemoSession?.();if(res?.ok){$('#portalSignInMessage').textContent='';showSignedIn()}else $('#portalSignInMessage').textContent=res?.message||'Unable to start demo preview.'};
$('#portalResetDemo').onclick=()=>{pendingClubLogo=undefined;pendingRepresentativePhoto=undefined;NorthZoneClubRegistry.resetDemoPreviewData?.();renderAll()};

$('#portalSignOut').onclick=()=>{NorthZoneClubRegistry.signOut();showSignedOut()};
$$('[data-club-tab]').forEach(b=>b.onclick=()=>openTab(b.dataset.clubTab));$$('[data-go-club-tab]').forEach(a=>a.onclick=e=>{e.preventDefault();openTab(a.dataset.goClubTab)});
function openTab(tab,updateHash=true){
  const available=$$('[data-club-tab]').map(b=>b.dataset.clubTab);
  if(!available.includes(tab))tab='overview';
  $$('[data-club-tab]').forEach(b=>b.classList.toggle('active',b.dataset.clubTab===tab));
  $$('[data-club-panel]').forEach(p=>p.classList.toggle('active',p.dataset.clubPanel===tab));
  if(updateHash)history.replaceState(null,'',`#${tab}`);
}
function pricingRow(label,value,configured){return `<div class="club-privilege-row"><span>${esc(label)}</span><strong>${configured?currency(value):'Standard rate'}</strong></div>`}
function leaderboardMetricValue(row,metric){
  if(metric==='winPct')return `${(row.winPct*100).toFixed(row.matches?0:0)}%`;
  if(metric==='matches')return row.matches;
  if(metric==='pe')return row.pe;
  if(metric==='pq')return row.pq.toFixed(3);
  return row.wins;
}

function playerMiniAvatar(row){
  return `<div class="club-lb-avatar">${row.photoDataUrl?`<img src="${esc(row.photoDataUrl)}" alt="">`:esc(initials(row.name))}</div>`;
}

function renderClubLeaderboard(){
  const c=NorthZoneClubRegistry.currentClub(); if(!c)return;
  const data=NorthZoneClubRegistry.clubLeaderboard(c.id,clubLeaderboardPeriod,clubLeaderboardMetric);
  $('#clubLeaderboardMemberCount').textContent=data.eligibleMembers;
  $('#clubLeaderboardMatchCount').textContent=`${data.verifiedMatches} verified match${data.verifiedMatches===1?'':'es'}`;

  const podium=data.rows.slice(0,3);
  $('#clubLeaderboardPodium').innerHTML=podium.length?podium.map((row,index)=>`
    <article class="club-lb-podium-card rank-${index+1}">
      <span class="club-lb-rank">${row.rank}</span>
      ${playerMiniAvatar(row)}
      <strong>${esc(row.name)}</strong>
      <small>${row.wins}–${row.losses} · ${row.matches} matches</small>
      <b>${esc(leaderboardMetricValue(row,clubLeaderboardMetric))}<em>${clubLeaderboardMetric==='wins'?' Wins':clubLeaderboardMetric==='winPct'?' Win %':clubLeaderboardMetric==='matches'?' Matches':clubLeaderboardMetric==='pe'?' PE':' PQ'}</em></b>
    </article>`).join(''):'';

  $('#clubLeaderboardTable').innerHTML=data.rows.length?`
    <div class="club-lb-table-head"><span>#</span><span>Player</span><span>W–L</span><span>Win %</span><span>Matches</span><span>PE</span><span>PC</span><span>PQ</span></div>
    ${data.rows.map(row=>`<article class="club-lb-row">
      <span class="club-lb-rank-cell">${row.rank}</span>
      <div class="club-lb-player">${playerMiniAvatar(row)}<strong>${esc(row.name)}</strong></div>
      <span>${row.wins}–${row.losses}</span>
      <span>${(row.winPct*100).toFixed(0)}%</span>
      <span>${row.matches}</span>
      <span>${row.pe}</span>
      <span>${row.pc}</span>
      <span>${row.pq.toFixed(3)}</span>
    </article>`).join('')}
  `:empty('No registered members yet.','Register club members to make them eligible for the leaderboard.');

  const preview=NorthZoneClubRegistry.clubLeaderboard(c.id,'month','wins').rows.slice(0,3);
  $('#clubLeaderboardPreview').innerHTML=preview.length?preview.map(row=>`
    <div class="club-lb-preview-row"><span>${row.rank}</span>${playerMiniAvatar(row)}<strong>${esc(row.name)}</strong><small>${row.wins} wins · ${row.matches} matches</small></div>
  `).join(''):empty('No leaderboard activity yet.','Verified club matches will populate this leaderboard.');
}

function praiseAvatar(row){
  return `<div class="club-praise-avatar">${row.photoDataUrl?`<img src="${esc(row.photoDataUrl)}" alt="">`:esc(initials(row.name))}</div>`;
}
function praiseChip(c){
  return `<span class="club-praise-chip"><b>${esc(c.icon||'✨')}</b>${esc(c.label)}${c.count?` <em>${c.count}</em>`:''}</span>`;
}
function renderClubPraise(){
  const c=NorthZoneClubRegistry.currentClub();if(!c)return;
  const categories=NorthZoneClubRegistry.praiseCategories?.()||[];

  const select=$('#clubPraiseCategory');
  if(select&&select.options.length<=1){
    select.insertAdjacentHTML('beforeend',categories.map(x=>`<option value="${esc(x.id)}">${esc(x.label)}</option>`).join(''));
  }

  const data=NorthZoneClubRegistry.clubPraiseBoard(c.id,clubPraisePeriod,clubPraiseCategory);
  $('#clubPraiseTotal').textContent=data.totalPraise;
  $('#clubPraiseUnique').textContent=`${data.uniquePraisers} unique player${data.uniquePraisers===1?'':'s'} giving Praise`;

  const podium=data.rows.slice(0,3);
  $('#clubPraisePodium').innerHTML=podium.length?podium.map((row,index)=>`
    <article class="club-praise-podium-card rank-${index+1}">
      <span class="club-praise-rank">${row.rank}</span>
      ${praiseAvatar(row)}
      <strong>${esc(row.name)}</strong>
      <small>${row.uniquePraisers} unique praiser${row.uniquePraisers===1?'':'s'}</small>
      <b>${row.praise}<em>Praise</em></b>
      <div>${row.knownFor.slice(0,2).map(praiseChip).join('')}</div>
    </article>`).join(''):'';

  $('#clubPraiseTable').innerHTML=data.rows.length?`
    <div class="club-praise-table-head"><span>#</span><span>Player</span><span>Praise</span><span>Unique</span><span>Known For</span></div>
    ${data.rows.map(row=>`<article class="club-praise-row">
      <span class="club-praise-rank-cell">${row.rank}</span>
      <div class="club-praise-player">${praiseAvatar(row)}<strong>${esc(row.name)}</strong></div>
      <strong>${row.praise}</strong>
      <span>${row.uniquePraisers}</span>
      <div class="club-praise-known">${row.knownFor.map(praiseChip).join('')||'<span>—</span>'}</div>
    </article>`).join('')}
  `:empty('No Praise yet.','Praise earned from verified play will appear here.');

  const preview=NorthZoneClubRegistry.clubPraiseBoard(c.id,'month','all').rows.slice(0,3);
  $('#clubPraisePreview').innerHTML=preview.length?preview.map(row=>`
    <div class="club-praise-preview-row"><span>${row.rank}</span>${praiseAvatar(row)}<strong>${esc(row.name)}</strong><small>${row.praise} Praise · ${row.uniquePraisers} players</small></div>
  `).join(''):empty('No Praise this month.','Verified peer recognition will appear here.');

  const recent=NorthZoneClubRegistry.recentClubPraise(c.id,12);
  $('#clubRecentPraise').innerHTML=recent.length?recent.map(p=>`
    <article class="club-recent-praise-row">
      <div>
        <span>${esc(fmt(p.activityDate||p.createdAt))}</span>
        <strong>${esc(p.giverName)} praised ${esc(p.recipientName)}</strong>
        <div>${p.categories.map(praiseChip).join('')}</div>
        ${p.note?`<p>“${esc(p.note)}”</p>`:''}
      </div>
      <button data-remove-praise="${esc(p.id)}">Remove</button>
    </article>`).join(''):empty('No recent Praise.','Praise activity will appear here for moderation.');

  $$('[data-remove-praise]').forEach(btn=>btn.onclick=()=>{
    const reason=prompt('Reason for removing this Praise?','Community rule / inappropriate content');
    if(reason===null)return;
    const res=NorthZoneClubRegistry.removePraise(btn.dataset.removePraise,reason);
    if(!res.ok){alert(res.message);return}
    renderClubPraise();
  });
}

function announcementCategoryLabel(value){
  return ({general:'General',event:'Event',schedule:'Schedule',reminder:'Reminder'})[value]||'General';
}
function announcementDate(value){
  if(!value)return '—';
  try{return new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}catch{return value}
}
function setAnnouncementPhotoPreview(dataUrl,name=''){
  const wrap=$('#clubAnnouncementPhotoPreviewWrap');
  const img=$('#clubAnnouncementPhotoPreview');
  const meta=$('#clubAnnouncementPhotoMeta');
  const removeBtn=$('#clubAnnouncementPhotoRemove');
  if(dataUrl){
    img.src=dataUrl;
    wrap.classList.remove('hidden');
    removeBtn.classList.remove('hidden');
    meta.textContent=name||'Ready to include in this announcement.';
  }else{
    img.removeAttribute('src');
    wrap.classList.add('hidden');
    removeBtn.classList.add('hidden');
    meta.textContent='Ready to include in this announcement.';
  }
}
function resetAnnouncementForm(){
  pendingAnnouncementPhoto=undefined;
  pendingAnnouncementPhotoName='';
  $('#clubAnnouncementId').value='';
  $('#clubAnnouncementTitle').value='';
  $('#clubAnnouncementBody').value='';
  $('#clubAnnouncementCategory').value='general';
  $('#clubAnnouncementPriority').value='normal';
  $('#clubAnnouncementStatus').value='draft';
  $('#clubAnnouncementExpires').value='';
  $('#clubAnnouncementPinned').checked=false;
  $('#clubAnnouncementPhoto').value='';
  setAnnouncementPhotoPreview('','');
  $('#clubAnnouncementFormTitle').textContent='New Announcement';
  $('#clubAnnouncementCancel').classList.add('hidden');
  $('#clubAnnouncementFormMessage').textContent='';
}
function editAnnouncement(id){
  const c=NorthZoneClubRegistry.currentClub();if(!c)return;
  const row=NorthZoneClubRegistry.announcements(c.id).find(a=>a.id===id);if(!row)return;
  $('#clubAnnouncementId').value=row.id;
  $('#clubAnnouncementTitle').value=row.title;
  $('#clubAnnouncementBody').value=row.body;
  $('#clubAnnouncementCategory').value=row.category;
  $('#clubAnnouncementPriority').value=row.priority;
  $('#clubAnnouncementStatus').value=row.status;
  $('#clubAnnouncementExpires').value=row.expiresAt||'';
  $('#clubAnnouncementPinned').checked=Boolean(row.pinned);
  pendingAnnouncementPhoto=undefined;
  pendingAnnouncementPhotoName='';
  $('#clubAnnouncementPhoto').value='';
  setAnnouncementPhotoPreview(row.imageDataUrl||'',row.imageName||'Attached photo');
  $('#clubAnnouncementFormTitle').textContent='Edit Announcement';
  $('#clubAnnouncementCancel').classList.remove('hidden');
  $('#clubAnnouncementFormMessage').textContent='Editing existing announcement.';
  $('[data-club-tab="announcements"]')?.click();
  $('#clubAnnouncementTitle').focus();
}
function announcementCard(a){
  return `<article class="club-announcement-item ${a.priority==='high'?'high-priority':''} ${a.status==='draft'?'is-draft':''}">
    <div class="club-announcement-item-head">
      <div class="club-announcement-badges">
        ${a.pinned?'<span class="pinned">PINNED</span>':''}
        <span class="category">${esc(announcementCategoryLabel(a.category))}</span>
        <span class="status ${a.status}">${a.status==='published'?'Published':'Draft'}</span>
        ${a.priority==='high'?'<span class="priority">High Priority</span>':''}
      </div>
      <span class="club-announcement-date">${esc(announcementDate(a.updatedAt))}</span>
    </div>
    <h3>${esc(a.title)}</h3>
    ${a.imageDataUrl?`<div class="club-announcement-photo-card"><img src="${esc(a.imageDataUrl)}" alt="${esc(a.imageName||a.title)}"></div>`:''}
    <p>${esc(a.body)}</p>
    <div class="club-announcement-meta">
      <span>By ${esc(a.authorName||'Club Representative')}</span>
      ${a.expiresAt?`<span>Expires ${esc(announcementDate(a.expiresAt))}</span>`:''}
      <span>Registered members</span>
    </div>
    <div class="club-announcement-item-actions">
      <button data-ann-edit="${esc(a.id)}">Edit</button>
      <button data-ann-status="${esc(a.id)}" data-next-status="${a.status==='published'?'draft':'published'}">${a.status==='published'?'Unpublish':'Publish'}</button>
      <button class="danger" data-ann-delete="${esc(a.id)}">Delete</button>
    </div>
  </article>`;
}
function renderAnnouncements(){
  const c=NorthZoneClubRegistry.currentClub();if(!c)return;
  const all=NorthZoneClubRegistry.announcements(c.id);
  let rows=all;
  if(clubAnnouncementFilter==='published')rows=all.filter(a=>a.status==='published');
  else if(clubAnnouncementFilter==='draft')rows=all.filter(a=>a.status==='draft');
  else if(clubAnnouncementFilter==='pinned')rows=all.filter(a=>a.pinned);

  $('#clubAnnouncementCount').textContent=all.length;
  $('#clubAnnouncementList').innerHTML=rows.length?rows.map(announcementCard).join(''):empty('No announcements here.','Create an announcement or change the current filter.');

  const published=all.filter(a=>a.status==='published'&&(!a.expiresAt||new Date(a.expiresAt+'T23:59:59').getTime()>=Date.now()));
  const preview=published[0];
  $('#clubAnnouncementPreview').innerHTML=preview?`
    <div class="club-announcement-overview ${preview.imageDataUrl?'with-photo':''}">
      ${preview.imageDataUrl?`<div class="club-announcement-overview-photo"><img src="${esc(preview.imageDataUrl)}" alt=""></div>`:''}
      <div><span>${preview.pinned?'PINNED · ':''}${esc(announcementCategoryLabel(preview.category))}</span><strong>${esc(preview.title)}</strong><p>${esc(preview.body)}</p></div>
      <small>${esc(announcementDate(preview.updatedAt))}</small>
    </div>`:empty('No published announcements.','Publish a club announcement to show the latest update here.');

  $$('[data-ann-edit]').forEach(btn=>btn.onclick=()=>editAnnouncement(btn.dataset.annEdit));
  $$('[data-ann-status]').forEach(btn=>btn.onclick=()=>{
    const res=NorthZoneClubRegistry.setAnnouncementStatus(btn.dataset.annStatus,btn.dataset.nextStatus);
    if(!res.ok)$('#clubAnnouncementFormMessage').textContent=res.message;
    renderAnnouncements();
  });
  $$('[data-ann-delete]').forEach(btn=>btn.onclick=()=>{
    if(!confirm('Delete this announcement? This cannot be undone in this demo workspace.'))return;
    const editing=$('#clubAnnouncementId').value===btn.dataset.annDelete;
    const res=NorthZoneClubRegistry.deleteAnnouncement(btn.dataset.annDelete);
    if(res.ok&&editing)resetAnnouncementForm();
    renderAnnouncements();
  });
}

function clubFeedAnnouncementCard(a,c){
  return `<article class="portal-feed-item announcement">
    <div class="portal-feed-source">
      <div class="portal-feed-source-avatar">${c.profile?.logoDataUrl?`<img src="${esc(c.profile.logoDataUrl)}" alt="">`:esc(initials(c.name))}</div>
      <div><strong>${esc(c.name)}</strong><span>Announcement · ${esc(announcementDate(a.updatedAt||a.publishedAt||a.createdAt))}</span></div>
      ${a.pinned?'<b class="portal-feed-badge pinned">PINNED</b>':''}
    </div>
    ${a.imageDataUrl?`<div class="portal-feed-photo"><img src="${esc(a.imageDataUrl)}" alt="${esc(a.imageName||a.title)}"></div>`:''}
    <div class="portal-feed-body">
      <div class="portal-feed-tags"><span>${esc(announcementCategoryLabel(a.category))}</span>${a.priority==='high'?'<span class="high">HIGH PRIORITY</span>':''}</div>
      <h3>${esc(a.title)}</h3>
      <p>${esc(a.body)}</p>
    </div>
    <div class="portal-feed-footer"><span>Posted by ${esc(a.authorName||'Club Representative')}</span><button data-go-club-tab="announcements">View Announcements</button></div>
  </article>`;
}
function clubFeedPraiseCard(p,c){
  return `<article class="portal-feed-item praise">
    <div class="portal-feed-source">
      <div class="portal-feed-source-avatar praise">★</div>
      <div><strong>${esc(p.giverName)} praised ${esc(p.recipientName)}</strong><span>${esc(c.name)} · ${esc(fmt(p.activityDate||p.createdAt))}</span></div>
      <b class="portal-feed-badge praise">PRAISE</b>
    </div>
    <div class="portal-feed-body">
      <div class="portal-feed-praise-chips">${p.categories.map(praiseChip).join('')}</div>
      ${p.note?`<p class="portal-feed-quote">“${esc(p.note)}”</p>`:''}
    </div>
    <div class="portal-feed-footer"><span>From verified play</span><button data-go-club-tab="praise">View Praise</button></div>
  </article>`;
}
function clubFeedPostCard(post,c){
  return `<article class="portal-feed-item community-post">
    <div class="portal-feed-source"><div class="portal-feed-source-avatar">${esc(initials(post.authorName||'Player'))}</div><div><strong>${esc(post.authorName||'Player')}</strong><span>${esc(c.name)} · ${esc(fmt(post.publishedAt||post.createdAt))}</span></div>${post.pinned?'<b class="portal-feed-badge pinned">PINNED</b>':'<b class="portal-feed-badge">POST</b>'}</div>
    ${post.imageDataUrl?`<div class="portal-feed-photo"><img src="${esc(post.imageDataUrl)}" alt="${esc(post.imageName||'Community post')}"></div>`:''}
    <div class="portal-feed-body"><div class="portal-feed-tags"><span>${esc(String(post.postType||'general').replaceAll('_',' '))}</span></div><p>${esc(post.body||'')}</p></div>
    <div class="portal-feed-footer"><span>${post.commentsEnabled===false?'Comments disabled':'Published community post'}</span></div>
  </article>`;
}

function renderClubCommunityFeed(){
  const c=NorthZoneClubRegistry.currentClub();if(!c)return;
  const announcements=NorthZoneClubRegistry.announcements(c.id,{status:'published',activeOnly:true})
    .map(a=>({type:'announcements',sortDate:a.updatedAt||a.publishedAt||a.createdAt,html:clubFeedAnnouncementCard(a,c)}));
  const praise=NorthZoneClubRegistry.recentClubPraise(c.id,30)
    .map(p=>({type:'praise',sortDate:p.createdAt||p.activityDate,html:clubFeedPraiseCard(p,c)}));
  const posts=(window.NorthZonePlatformBridge?.community?.()?.posts||[])
    .filter(p=>String(p.clubId)===String(c.id))
    .map(p=>({type:'posts',sortDate:p.publishedAt||p.createdAt,html:clubFeedPostCard(p,c)}));

  let items=[...posts,...announcements,...praise].sort((a,b)=>new Date(b.sortDate).getTime()-new Date(a.sortDate).getTime());
  const total=items.length;
  if(clubFeedFilter!=='all')items=items.filter(x=>x.type===clubFeedFilter);
  $('#clubFeedCount').textContent=total;
  $('#clubCommunityFeed').innerHTML=items.length
    ?items.map(x=>x.html).join('')
    :empty('Nothing in this feed yet.','Published posts, announcements, and community Praise will appear here.');

  $$('[data-go-club-tab]', $('#clubCommunityFeed')).forEach(btn=>btn.onclick=e=>{
    e.preventDefault();openTab(btn.dataset.goClubTab);
  });
}
function renderAll(){const c=NorthZoneClubRegistry.currentClub(),r=NorthZoneClubRegistry.currentRepresentative(),bookings=NorthZoneClubRegistry.reservations(),payments=NorthZoneClubRegistry.payments();if(!c)return;
 const registeredMembers=NorthZoneClubRegistry.clubMembers(c.id);
 $('#clubMetricBookings').textContent=bookings.length;$('#clubMetricPayments').textContent=payments.length;$('#clubMetricMembers').textContent=registeredMembers.length||'—';$('#clubMetricStatus').textContent=c.status==='approved'?'Approved':c.status;
 const p=c.pricing||{};$('#clubPricingPrivileges').innerHTML=`${p.demoOnly?'<div class="club-demo-pricing">Demo sample pricing — replace before production.</div>':''}${pricingRow('Court rate',p.courtRate,Number(p.courtRate)>0)}${pricingRow('Paddle rental',p.paddleRate,Number(p.paddleRate)>0)}${pricingRow('Ball machine',p.ballMachineRate,Number(p.ballMachineRate)>0)}${pricingRow('Coaching',p.coachRate,Number(p.coachRate)>0)}<div class="club-privilege-row"><span>Advance booking</span><strong>${c.privileges.maxAdvanceDays||'—'} days</strong></div><div class="club-privilege-row"><span>Max courts / booking</span><strong>${c.privileges.maxCourtsPerBooking||'—'}</strong></div>`;
 $('#clubOverviewBooking').innerHTML=bookings.length?bookingCard(bookings[0],true):empty('No club booking requests yet.','Book courts to start your club reservation history.');
 $('#clubReservationList').innerHTML=bookings.length?bookings.map(b=>bookingCard(b,false)).join(''):empty('No reservations yet.','Completed and pending club booking requests will appear here.');
 $('#clubPaymentList').innerHTML=payments.length?payments.map(p=>`<article class="club-history-row"><div><span>${fmt(p.date)}</span><strong>${esc(p.bookingReference)}</strong><small>${esc(p.method)} · Ref ${esc(p.reference||'—')}</small></div><div class="club-history-side"><strong>${currency(p.amount)}</strong><span class="club-status-pill pending">${esc(p.status)}</span></div></article>`).join(''):empty('No payment records yet.','Payments submitted through club reservations will appear here.');
 $('#profileClubName').textContent=c.name;$('#profileClubId').textContent=c.clubId;$('#profileClubStatus').textContent=c.status==='approved'?'Approved':c.status;$('#profileDescription').value=c.profile.description||'';$('#profileMemberCount').value=c.profile.memberCount||'';$('#profileHomeArea').value=c.profile.homeArea||'';$('#profileBillingName').value=c.profile.billingName||c.name;

 const clubLogo=pendingClubLogo===undefined?(c.profile.logoDataUrl||''):pendingClubLogo;
 const repPhoto=pendingRepresentativePhoto===undefined?(r.photoDataUrl||''):pendingRepresentativePhoto;
 const clubInitials=initials(c.name),repInitials=initials(r.name);
 setImagePreview($('#portalClubLogoImage'),$('#portalClubLogoFallback'),c.profile.logoDataUrl||'',clubInitials);
 setImagePreview($('#clubLogoPreviewImage'),$('#clubLogoPreviewFallback'),clubLogo,clubInitials);
 setImagePreview($('#representativePhotoPreviewImage'),$('#representativePhotoPreviewFallback'),repPhoto,repInitials);
 $('#profileRepresentativeName').textContent=`${r.name} · ${r.role}`;

 $('#clubRepresentativeList').innerHTML=c.representatives.map(x=>`<article class="club-rep-row"><div class="club-rep-avatar">${x.photoDataUrl?`<img src="${esc(x.photoDataUrl)}" alt="">`:esc(initials(x.name))}</div><div><strong>${esc(x.name)}</strong><span>${esc(x.role)}</span><small>${x.bookingPermission?'Can book club reservations':'No booking permission'}${x.financePermission?' · Can view payments':''}</small></div>${x.id===r.id?'<b>CURRENT</b>':''}</article>`).join('');
 renderClubLeaderboard();
 renderClubPraise();
 renderAnnouncements();
 renderClubCommunityFeed();
 NorthZoneMembershipProfile?.renderClub?.($('#clubMembershipWorkspace'));
}
function bookingCard(b,compact){const first=b.reservations?.[0];return `<article class="club-history-row booking"><div><span>${first?fmt(first.date):fmt(b.createdAt)}</span><strong>${esc(b.reference)}</strong><small>${esc(b.purpose||'Club Booking')}${first?` · ${first.courts?.join(', ')||''}`:''}${b.expectedPlayers?` · ${b.expectedPlayers} players`:''}</small></div><div class="club-history-side"><strong>${currency(b.total)}</strong><span class="club-status-pill pending">${esc(b.status||'Pending')}</span></div></article>`}
function empty(title,body){return `<div class="club-empty"><strong>${esc(title)}</strong><span>${esc(body)}</span></div>`}
$('#clubAnnouncementPhoto').onchange=async e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  $('#clubAnnouncementFormMessage').textContent='Preparing attached photo…';
  try{
    pendingAnnouncementPhoto=await processProfileImage(file,1400);
    pendingAnnouncementPhotoName=file.name||'Attached photo';
    setAnnouncementPhotoPreview(pendingAnnouncementPhoto,pendingAnnouncementPhotoName);
    $('#clubAnnouncementFormMessage').textContent='Photo attached. Save the announcement when ready.';
  }catch(err){
    pendingAnnouncementPhoto=undefined;
    pendingAnnouncementPhotoName='';
    e.target.value='';
    setAnnouncementPhotoPreview('','');
    $('#clubAnnouncementFormMessage').textContent=err.message;
  }
};
$('#clubAnnouncementPhotoRemove').onclick=()=>{
  pendingAnnouncementPhoto='';
  pendingAnnouncementPhotoName='';
  $('#clubAnnouncementPhoto').value='';
  setAnnouncementPhotoPreview('','');
  $('#clubAnnouncementFormMessage').textContent='Attached photo will be removed when you save.';
};
$$('#clubFeedFilters [data-club-feed-filter]').forEach(btn=>btn.onclick=()=>{
  clubFeedFilter=btn.dataset.clubFeedFilter;
  $$('#clubFeedFilters [data-club-feed-filter]').forEach(x=>x.classList.toggle('active',x===btn));
  renderClubCommunityFeed();
});
$$('#clubAnnouncementFilters [data-announcement-filter]').forEach(btn=>btn.onclick=()=>{
  clubAnnouncementFilter=btn.dataset.announcementFilter;
  $$('#clubAnnouncementFilters [data-announcement-filter]').forEach(x=>x.classList.toggle('active',x===btn));
  renderAnnouncements();
});
$('#clubAnnouncementCancel').onclick=resetAnnouncementForm;
$('#clubAnnouncementForm').onsubmit=e=>{
  e.preventDefault();
  const payload={
    id:$('#clubAnnouncementId').value,
    title:$('#clubAnnouncementTitle').value,
    body:$('#clubAnnouncementBody').value,
    category:$('#clubAnnouncementCategory').value,
    priority:$('#clubAnnouncementPriority').value,
    status:$('#clubAnnouncementStatus').value,
    expiresAt:$('#clubAnnouncementExpires').value,
    pinned:$('#clubAnnouncementPinned').checked
  };
  if(pendingAnnouncementPhoto!==undefined){
    payload.imageDataUrl=pendingAnnouncementPhoto;
    payload.imageName=pendingAnnouncementPhotoName;
  }
  const res=NorthZoneClubRegistry.saveAnnouncement(payload);
  $('#clubAnnouncementFormMessage').textContent=res.ok?(res.announcement.status==='published'?'Announcement published.':'Draft saved.'):res.message;
  if(res.ok){
    resetAnnouncementForm();
    renderAnnouncements();
  }
};

$$('#clubPraisePeriods [data-praise-period]').forEach(btn=>btn.onclick=()=>{
  clubPraisePeriod=btn.dataset.praisePeriod;
  $$('#clubPraisePeriods [data-praise-period]').forEach(x=>x.classList.toggle('active',x===btn));
  renderClubPraise();
});
$('#clubPraiseCategory').onchange=e=>{
  clubPraiseCategory=e.target.value;
  renderClubPraise();
};

$$('#clubLeaderboardPeriods [data-period]').forEach(btn=>btn.onclick=()=>{
  clubLeaderboardPeriod=btn.dataset.period;
  $$('#clubLeaderboardPeriods [data-period]').forEach(x=>x.classList.toggle('active',x===btn));
  renderClubLeaderboard();
});
$('#clubLeaderboardMetric').onchange=e=>{
  clubLeaderboardMetric=e.target.value;
  renderClubLeaderboard();
};

$('#clubLogoUpload').onchange=async e=>{
  const file=e.target.files?.[0]; if(!file)return;
  $('#personalizationSaveMessage').textContent='Preparing club logo…';
  try{
    pendingClubLogo=await processProfileImage(file,720);
    const c=NorthZoneClubRegistry.currentClub();
    setImagePreview($('#clubLogoPreviewImage'),$('#clubLogoPreviewFallback'),pendingClubLogo,initials(c?.name));
    $('#personalizationSaveMessage').textContent='Club logo ready to save.';
  }catch(err){
    e.target.value='';
    $('#personalizationSaveMessage').textContent=err.message;
  }
};

$('#representativePhotoUpload').onchange=async e=>{
  const file=e.target.files?.[0]; if(!file)return;
  $('#personalizationSaveMessage').textContent='Preparing profile picture…';
  try{
    pendingRepresentativePhoto=await processProfileImage(file,640);
    const r=NorthZoneClubRegistry.currentRepresentative();
    setImagePreview($('#representativePhotoPreviewImage'),$('#representativePhotoPreviewFallback'),pendingRepresentativePhoto,initials(r?.name));
    $('#personalizationSaveMessage').textContent='Profile picture ready to save.';
  }catch(err){
    e.target.value='';
    $('#personalizationSaveMessage').textContent=err.message;
  }
};

$('#clubLogoRemove').onclick=()=>{
  pendingClubLogo='';
  const c=NorthZoneClubRegistry.currentClub();
  setImagePreview($('#clubLogoPreviewImage'),$('#clubLogoPreviewFallback'),'',
    initials(c?.name));
  $('#clubLogoUpload').value='';
  $('#personalizationSaveMessage').textContent='Club logo will be removed when you save.';
};

$('#representativePhotoRemove').onclick=()=>{
  pendingRepresentativePhoto='';
  const r=NorthZoneClubRegistry.currentRepresentative();
  setImagePreview($('#representativePhotoPreviewImage'),$('#representativePhotoPreviewFallback'),'',
    initials(r?.name));
  $('#representativePhotoUpload').value='';
  $('#personalizationSaveMessage').textContent='Profile picture will be removed when you save.';
};

$('#saveClubPersonalization').onclick=()=>{
  const patch={};
  if(pendingClubLogo!==undefined)patch.clubLogoDataUrl=pendingClubLogo;
  if(pendingRepresentativePhoto!==undefined)patch.representativePhotoDataUrl=pendingRepresentativePhoto;
  if(!Object.keys(patch).length){
    $('#personalizationSaveMessage').textContent='Choose or remove an image first.';
    return;
  }
  const res=NorthZoneClubRegistry.updatePersonalization(patch);
  $('#personalizationSaveMessage').textContent=res.ok?'Personalization saved.':'Unable to save personalization.';
  if(res.ok){
    pendingClubLogo=undefined;
    pendingRepresentativePhoto=undefined;
    $('#clubLogoUpload').value='';
    $('#representativePhotoUpload').value='';
    renderAll();
  }
};

$('#clubProfileForm').onsubmit=e=>{e.preventDefault();const res=NorthZoneClubRegistry.updateProfile({description:$('#profileDescription').value,memberCount:$('#profileMemberCount').value,homeArea:$('#profileHomeArea').value,billingName:$('#profileBillingName').value});$('#profileSaveMessage').textContent=res.ok?'Profile saved.':'Unable to save profile.';if(res.ok)renderAll()};
const portalParams=new URLSearchParams(location.search);
if(portalParams.get('demo')==='1'&&!NorthZoneClubRegistry.currentSession()){
  NorthZoneClubRegistry.startDemoSession?.();
}
if(!showSignedIn())showSignedOut();