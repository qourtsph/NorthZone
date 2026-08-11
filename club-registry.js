(() => {
  const ADMIN_STORAGE_KEY='northzone_admin_v11';
  const SESSION_KEY='northzone_club_session_v1';
  const PORTAL_DATA_KEY='northzone_club_portal_data_v1';
  const APPLICATIONS_KEY='northzone_club_applications_v1';
  const platformContract=()=>window.NorthZonePlatformBridge?.contract?.()||null;

  // DEMO ONLY. This approved club exists so the static package can exercise
  // sign-in, private pricing, booking history, and payment history end-to-end.
  // Replace with Admin + Supabase records before production.
  const DEMO_CLUBS=[{
    id:'CLUB-DEMO-001',
    clubId:'NZC-DEMO-001',
    name:'Demo Pickleball Club',
    status:'approved',
    pricing:{courtRate:360,paddleRate:90,ballMachineRate:270,coachRate:null,demoOnly:true},
    privileges:{clubPricing:true,maxAdvanceDays:730,maxCourtsPerBooking:5,recurringBooking:false},
    profile:{description:'Static approved-club preview account.',memberCount:24,homeArea:'Pampanga',billingName:'Demo Pickleball Club'},
    representatives:[{
      id:'REP-DEMO-001',name:'Demo Club Manager',email:'club.demo@northzone.test',mobile:'0917 000 0000',
      role:'Club Owner',bookingPermission:true,financePermission:true,password:'NorthZoneClubDemo!'
    }]
  }];

  const PRAISE_CATEGORIES=[
    {id:'sportsmanship',label:'Sportsmanship',icon:'🤝',group:'community'},
    {id:'serve',label:'Serve',icon:'🎯',group:'skill'},
    {id:'return',label:'Return',icon:'↩',group:'skill'},
    {id:'dink',label:'Dink',icon:'🤏',group:'skill'},
    {id:'drop',label:'Drop',icon:'🎚',group:'skill'},
    {id:'drive',label:'Drive',icon:'💥',group:'skill'},
    {id:'reset',label:'Reset',icon:'🛡',group:'skill'},
    {id:'lob',label:'Lob',icon:'🌙',group:'skill'},
    {id:'atp',label:'ATP',icon:'⚡',group:'skill'},
    {id:'erne',label:'Erne',icon:'↗',group:'skill'},
    {id:'overhead',label:'Overhead',icon:'🔨',group:'skill'},
    {id:'defense',label:'Defense',icon:'🧱',group:'skill'},
    {id:'hands',label:'Hands',icon:'🙌',group:'skill'},
    {id:'speedup',label:'Speedup',icon:'🔥',group:'skill'},
    {id:'counter',label:'Counter',icon:'↔',group:'skill'},
    {id:'strategy',label:'Strategy',icon:'🧠',group:'skill'},
    {id:'court-coverage',label:'Court Coverage',icon:'👟',group:'skill'},
    {id:'partner',label:'Great Partner',icon:'🏓',group:'community'},
    {id:'opponent',label:'Great Opponent',icon:'👏',group:'community'},
    {id:'improvement',label:'Improvement',icon:'📈',group:'community'},
    {id:'communication',label:'Communication',icon:'📣',group:'community'},
    {id:'hosting',label:'Hosting',icon:'🏠',group:'community'},
    {id:'club-spirit',label:'Club Spirit',icon:'💙',group:'community'},
    {id:'helpful',label:'Helpful',icon:'🙋',group:'community'},
    {id:'other',label:'Other',icon:'✨',group:'community'}
  ];
  const PRAISE_CATEGORY_IDS=new Set(PRAISE_CATEGORIES.map(x=>x.id));

  const lower=v=>String(v||'').trim().toLowerCase();
  const clone=v=>JSON.parse(JSON.stringify(v));
  const safeParse=(raw,fallback)=>{try{return JSON.parse(raw)}catch{return fallback}};
  const read=(k,fallback)=>safeParse(localStorage.getItem(k)||'',fallback);
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const uuid=()=>crypto?.randomUUID?.()||('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)}));

  function rawAdminClubs(){
    const pc=platformContract();
    return Array.isArray(pc?.clubs)?pc.clubs:null;
  }

  function normalizedClub(c){
    return {
      id:String(c.id||c.clubId||''),
      clubId:String(c.clubId||c.code||c.id||''),
      name:String(c.name||c.clubName||'Club'),
      status:lower(c.status||c.approvalStatus||'pending'),
      pricing:{
        courtRate:numOrNull(c?.pricing?.courtRate??c?.pricingProfile?.courtRate??c?.clubCourtRate),
        paddleRate:numOrNull(c?.pricing?.paddleRate??c?.pricingProfile?.paddleRate),
        ballMachineRate:numOrNull(c?.pricing?.ballMachineRate??c?.pricingProfile?.ballMachineRate),
        coachRate:numOrNull(c?.pricing?.coachRate??c?.pricingProfile?.coachRate),
        demoOnly:Boolean(c?.pricing?.demoOnly)
      },
      pricingRule:c?.pricingRule?{...c.pricingRule}:null,
      privileges:{
        clubPricing:c?.privileges?.clubPricing!==false,
        maxAdvanceDays:Number(c?.privileges?.maxAdvanceDays||730),
        maxCourtsPerBooking:Number(c?.privileges?.maxCourtsPerBooking||5),
        recurringBooking:Boolean(c?.privileges?.recurringBooking)
      },
      profile:{
        description:String(c?.profile?.description||c.description||''),
        memberCount:Number(c?.profile?.memberCount??c.memberCount??0),
        homeArea:String(c?.profile?.homeArea||c.homeArea||''),
        billingName:String(c?.profile?.billingName||c.billingName||c.name||c.clubName||''),
        logoDataUrl:String(c?.profile?.logoDataUrl||c.logoDataUrl||'')
      },
      representatives:(Array.isArray(c.representatives)?c.representatives:Array.isArray(c.authorizedRepresentatives)?c.authorizedRepresentatives:[]).map(r=>({
        id:String(r.id||''),name:String(r.name||''),email:String(r.email||''),mobile:String(r.mobile||''),
        role:String(r.role||'Booking Manager'),bookingPermission:r.bookingPermission!==false,
        financePermission:Boolean(r.financePermission),password:String(r.password||r.demoPassword||'')
      })),
      members:(Array.isArray(c.members)?c.members:Array.isArray(c.registeredMembers)?c.registeredMembers:[]).map(m=>normalizeMember(m)),
      matchRecords:(Array.isArray(c.matchRecords)?c.matchRecords:Array.isArray(c.matches)?c.matches:[]).map(m=>normalizeMatch(m,c.id||c.clubId||''))
    };
  }

  function normalizeMember(m){
    return {
      id:String(m?.id||m?.memberId||m?.qourtsId||''),
      qourtsId:String(m?.qourtsId||m?.playerId||''),
      name:String(m?.name||m?.displayName||'Player'),
      email:String(m?.email||''),
      mobile:String(m?.mobile||''),
      status:lower(m?.status||'active'),
      joinedAt:String(m?.joinedAt||m?.registeredAt||''),
      photoDataUrl:safeImageDataUrl?String(m?.photoDataUrl||''):String(m?.photoDataUrl||'')
    };
  }

  function normalizeMatch(m,clubId){
    return {
      id:String(m?.id||m?.matchId||''),
      clubId:String(m?.clubId||clubId||''),
      date:String(m?.date||m?.playedAt||''),
      status:lower(m?.status||'verified'),
      teamA:(Array.isArray(m?.teamA)?m.teamA:Array.isArray(m?.playersA)?m.playersA:[]).map(String),
      teamB:(Array.isArray(m?.teamB)?m.teamB:Array.isArray(m?.playersB)?m.playersB:[]).map(String),
      scoreA:Number(m?.scoreA??m?.teamAScore??0),
      scoreB:Number(m?.scoreB??m?.teamBScore??0)
    };
  }
  function numOrNull(v){const n=Number(v);return Number.isFinite(n)&&n>0?n:null}

  function allRawClubs(){
    const admin=rawAdminClubs();
    return (admin!==null?admin:DEMO_CLUBS).map(normalizedClub);
  }

  function portalData(){
    const data=read(PORTAL_DATA_KEY,{profileOverrides:{},representativeOverrides:{},membersByClub:{},clubMatches:[],announcements:[],praiseRecords:[],bookings:[],payments:[]})||{};
    if(!data.profileOverrides)data.profileOverrides={};
    if(!data.representativeOverrides)data.representativeOverrides={};
    if(!data.membersByClub)data.membersByClub={};
    if(!Array.isArray(data.clubMatches))data.clubMatches=[];
    if(!Array.isArray(data.announcements))data.announcements=[];
    if(!Array.isArray(data.praiseRecords))data.praiseRecords=[];
    if(!Array.isArray(data.bookings))data.bookings=[];
    if(!Array.isArray(data.payments))data.payments=[];
    return data;
  }
  function savePortalData(d){write(PORTAL_DATA_KEY,d)}

  function publicClub(raw){
    if(!raw)return null;
    const data=portalData();
    const override=data.profileOverrides?.[raw.id]||{};
    const repOverrides=data.representativeOverrides?.[raw.id]||{};
    return {
      id:raw.id,clubId:raw.clubId,name:raw.name,status:raw.status,
      pricing:clone(raw.pricing),privileges:clone(raw.privileges),
      profile:{...clone(raw.profile),...clone(override)},
      representatives:raw.representatives.map(r=>({
        id:r.id,name:r.name,email:r.email,mobile:r.mobile,role:r.role,
        bookingPermission:r.bookingPermission,financePermission:r.financePermission,
        photoDataUrl:String(repOverrides?.[r.id]?.photoDataUrl||'')
      }))
    };
  }

  function currentSession(){return read(SESSION_KEY,null)}
  function isDemoSession(){return Boolean(currentSession()?.demoPreview)}

  function demoRawClub(){
    return normalizedClub(DEMO_CLUBS[0]);
  }

  function demoDate(offsetDays){
    const d=new Date();
    d.setHours(12,0,0,0);
    d.setDate(d.getDate()+offsetDays);
    return d.toISOString().slice(0,10);
  }

  function demoLeaderboardMembers(){
    return [
      {id:'MEM-DEMO-001',qourtsId:'QRT-DEMO-PLAYER',name:'Demo Player',email:'player@example.com',mobile:'0917 000 0000',status:'active',joinedAt:demoDate(-120)},
      {id:'MEM-DEMO-002',qourtsId:'QRT-DEMO-ALEX',name:'Alex R.',email:'',mobile:'',status:'active',joinedAt:demoDate(-110)},
      {id:'MEM-DEMO-003',qourtsId:'QRT-DEMO-BEA',name:'Bea S.',email:'',mobile:'',status:'active',joinedAt:demoDate(-100)},
      {id:'MEM-DEMO-004',qourtsId:'QRT-DEMO-CARLO',name:'Carlo M.',email:'',mobile:'',status:'active',joinedAt:demoDate(-95)},
      {id:'MEM-DEMO-005',qourtsId:'QRT-DEMO-DANI',name:'Dani L.',email:'',mobile:'',status:'active',joinedAt:demoDate(-88)},
      {id:'MEM-DEMO-006',qourtsId:'QRT-DEMO-ELI',name:'Eli T.',email:'',mobile:'',status:'active',joinedAt:demoDate(-80)},
      {id:'MEM-DEMO-007',qourtsId:'QRT-DEMO-FAYE',name:'Faye G.',email:'',mobile:'',status:'active',joinedAt:demoDate(-72)},
      {id:'MEM-DEMO-008',qourtsId:'QRT-DEMO-GIO',name:'Gio P.',email:'',mobile:'',status:'active',joinedAt:demoDate(-64)}
    ];
  }

  function demoMatch(id,offset,teamA,teamB,scoreA,scoreB){
    return {
      id:'DEMO-MATCH-'+id,
      clubId:'CLUB-DEMO-001',
      date:demoDate(offset),
      status:'verified',
      teamA,teamB,scoreA,scoreB,
      demoPreview:true
    };
  }

  function demoLeaderboardMatches(){
    const P='QRT-DEMO-PLAYER',A='QRT-DEMO-ALEX',B='QRT-DEMO-BEA',C='QRT-DEMO-CARLO',
          D='QRT-DEMO-DANI',E='QRT-DEMO-ELI',F='QRT-DEMO-FAYE',G='QRT-DEMO-GIO';
    return [
      demoMatch('001',-2,[P,A],[B,C],11,7),
      demoMatch('002',-4,[D,E],[F,G],9,11),
      demoMatch('003',-6,[P,B],[D,F],11,8),
      demoMatch('004',-8,[A,C],[E,G],10,11),
      demoMatch('005',-11,[P,C],[F,G],8,11),
      demoMatch('006',-14,[A,B],[D,E],11,6),
      demoMatch('007',-18,[P,D],[A,G],11,9),
      demoMatch('008',-23,[B,F],[C,E],7,11),
      demoMatch('009',-31,[P,E],[B,G],11,5),
      demoMatch('010',-39,[A,F],[C,D],9,11),
      demoMatch('011',-47,[P,G],[A,E],11,9),
      demoMatch('012',-58,[B,D],[C,F],11,8),
      demoMatch('013',-76,[P,F],[D,G],6,11),
      demoMatch('014',-94,[A,D],[B,E],11,7),
      demoMatch('015',-118,[P,B],[C,G],11,9),
      demoMatch('016',-150,[D,F],[A,E],11,8)
    ];
  }

  function seedDemoLeaderboardData(){
    const raw=demoRawClub();
    const data=portalData();
    const existing=data.membersByClub[raw.id];
    if(!Array.isArray(existing)||!existing.some(m=>m?.demoPreview)){
      data.membersByClub[raw.id]=demoLeaderboardMembers().map(m=>({...m,demoPreview:true}));
    }
    if(!data.clubMatches.some(m=>String(m.clubId)===String(raw.id)&&m.demoPreview)){
      data.clubMatches.push(...demoLeaderboardMatches());
    }
    savePortalData(data);
    return true;
  }

  function demoPraiseRecord(id,activityId,giver,recipient,categories,note=''){
    const match=demoLeaderboardMatches().find(m=>m.id===activityId);
    return {
      id:'PRAISE-DEMO-'+id,
      clubId:'CLUB-DEMO-001',
      activityId,
      activityType:'match',
      activityDate:match?.date||demoDate(-1),
      giverQourtsId:giver,
      recipientQourtsId:recipient,
      categories:[...new Set(categories)].filter(x=>PRAISE_CATEGORY_IDS.has(x)).slice(0,3),
      note:String(note||'').slice(0,240),
      status:'active',
      createdAt:new Date((match?new Date(match.date+'T18:00:00'):new Date()).getTime()+Number(id)*60000).toISOString(),
      removedAt:'',
      removalReason:'',
      removedBy:'',
      demoPreview:true
    };
  }

  function seedDemoPraise(){
    seedDemoLeaderboardData();
    const raw=demoRawClub(),data=portalData();
    if(data.praiseRecords.some(p=>String(p.clubId)===String(raw.id)&&p.demoPreview))return true;

    const P='QRT-DEMO-PLAYER',A='QRT-DEMO-ALEX',B='QRT-DEMO-BEA',C='QRT-DEMO-CARLO',
          D='QRT-DEMO-DANI',E='QRT-DEMO-ELI',F='QRT-DEMO-FAYE',G='QRT-DEMO-GIO';

    data.praiseRecords.push(
      demoPraiseRecord('001','DEMO-MATCH-001',B,P,['sportsmanship','dink'],'Great patience at the kitchen.'),
      demoPraiseRecord('002','DEMO-MATCH-001',A,P,['partner','communication'],'Easy partner to play with.'),
      demoPraiseRecord('003','DEMO-MATCH-003',D,P,['serve'],'Consistent serve pressure.'),
      demoPraiseRecord('004','DEMO-MATCH-003',F,P,['defense','reset'],'Kept resetting everything.'),
      demoPraiseRecord('005','DEMO-MATCH-005',G,P,['sportsmanship'],'Great game and great attitude.'),
      demoPraiseRecord('006','DEMO-MATCH-007',A,P,['strategy'],'Smart shot selection.'),
      demoPraiseRecord('007','DEMO-MATCH-009',B,P,['dink'],'Very controlled cross-court dinks.'),
      demoPraiseRecord('008','DEMO-MATCH-011',E,P,['hands'],'Fast hands at the net.'),

      demoPraiseRecord('009','DEMO-MATCH-002',D,G,['sportsmanship','opponent'],'Fun opponent and a clean match.'),
      demoPraiseRecord('010','DEMO-MATCH-002',E,F,['defense'],'Made us work for every point.'),
      demoPraiseRecord('011','DEMO-MATCH-004',C,G,['lob'],'That lob changed the whole rally.'),
      demoPraiseRecord('012','DEMO-MATCH-004',G,A,['overhead'],'Putaways were solid.'),
      demoPraiseRecord('013','DEMO-MATCH-006',D,B,['dink','strategy'],'Controlled the kitchen really well.'),
      demoPraiseRecord('014','DEMO-MATCH-006',E,A,['partner'],'Great communication as a partner.'),
      demoPraiseRecord('015','DEMO-MATCH-008',B,C,['hands'],'Excellent exchanges at the net.'),
      demoPraiseRecord('016','DEMO-MATCH-008',F,E,['reset','defense'],'Kept the point alive.'),
      demoPraiseRecord('017','DEMO-MATCH-010',C,D,['drive'],'Heavy drives all game.'),
      demoPraiseRecord('018','DEMO-MATCH-010',F,A,['sportsmanship'],'Competitive but respectful.'),
      demoPraiseRecord('019','DEMO-MATCH-012',C,B,['return'],'Returns kept landing deep.'),
      demoPraiseRecord('020','DEMO-MATCH-012',D,F,['court-coverage'],'Covered a lot of court.'),
      demoPraiseRecord('021','DEMO-MATCH-014',B,A,['serve','sportsmanship'],'Strong serving and a great match.'),
      demoPraiseRecord('022','DEMO-MATCH-014',E,D,['dink'],'Very steady in the soft game.')
    );
    savePortalData(data);
    return true;
  }

  function seedDemoAnnouncements(){
    const raw=demoRawClub();
    const data=portalData();
    if(data.announcements.some(a=>String(a.clubId)===String(raw.id)&&a.demoPreview))return true;

    const now=new Date();
    const isoDaysAgo=n=>new Date(now.getTime()-n*86400000).toISOString();

    data.announcements.push(
      {
        id:'ANN-DEMO-001',clubId:raw.id,title:'Club Open Play this Saturday',
        body:'Demo announcement: club members are invited to the Saturday Open Play session. Final court allocation will be confirmed through the club workspace.',
        category:'event',priority:'high',status:'published',pinned:true,
        audience:'registered-members',expiresAt:'',
        authorId:'REP-DEMO-001',authorName:'Demo Club Manager',
        createdAt:isoDaysAgo(2),updatedAt:isoDaysAgo(1),publishedAt:isoDaysAgo(1),
        demoPreview:true
      },
      {
        id:'ANN-DEMO-002',clubId:raw.id,title:'Court booking reminder',
        body:'Demo announcement: please submit club court requests early when reserving multiple courts so availability can be confirmed before your session.',
        category:'reminder',priority:'normal',status:'published',pinned:false,
        audience:'registered-members',expiresAt:'',
        authorId:'REP-DEMO-001',authorName:'Demo Club Manager',
        createdAt:isoDaysAgo(6),updatedAt:isoDaysAgo(6),publishedAt:isoDaysAgo(6),
        demoPreview:true
      },
      {
        id:'ANN-DEMO-003',clubId:raw.id,title:'Draft: next club activity',
        body:'Demo draft announcement. Use this to review how unpublished announcements appear to club representatives before they are shared with members.',
        category:'general',priority:'normal',status:'draft',pinned:false,
        audience:'registered-members',expiresAt:'',
        authorId:'REP-DEMO-001',authorName:'Demo Club Manager',
        createdAt:isoDaysAgo(1),updatedAt:isoDaysAgo(1),publishedAt:'',
        demoPreview:true
      }
    );
    savePortalData(data);
    return true;
  }

  function seedDemoPortalData(){
    seedDemoLeaderboardData();
    seedDemoAnnouncements();
    seedDemoPraise();
    const raw=demoRawClub();
    const data=portalData();

    const hasDemoBookings=data.bookings.some(b=>String(b.clubId)===String(raw.id)&&b.demoPreview);
    if(!hasDemoBookings){
      data.bookings.unshift(
        {
          reference:'NZ-DEMO-1002',
          status:'Pending Confirmation',
          purpose:'Club Open Play',
          expectedPlayers:16,
          representative:{name:'Demo Club Manager',email:'club.demo@northzone.test',mobile:'0917 000 0000'},
          reservations:[{
            date:demoDate(5),
            times:['7:00 PM','8:00 PM'],
            courts:['Court 1','Court 2'],
            rate:360,
            amount:1440
          }],
          addOns:{paddles:4,ballMachines:0,coach:null},
          coaching:{trainingMode:'',students:1,goals:[],otherGoal:'',notes:'',times:[],durationHours:0,court:''},
          bookingSubtotal:1440,
          addOnSubtotal:360,
          total:1800,
          payment:{method:'GCash',reference:'DEMO-GCASH-1002',status:'Pending Verification'},
          clubId:raw.id,
          clubCode:raw.clubId,
          clubName:raw.name,
          createdAt:new Date().toISOString(),
          demoPreview:true
        },
        {
          reference:'NZ-DEMO-0988',
          status:'Confirmed',
          purpose:'Tournament / Competition',
          expectedPlayers:24,
          representative:{name:'Demo Club Manager',email:'club.demo@northzone.test',mobile:'0917 000 0000'},
          reservations:[{
            date:demoDate(-14),
            times:['6:00 PM','7:00 PM','8:00 PM'],
            courts:['Court 2','Court 3','Court 4'],
            rate:360,
            amount:3240
          }],
          addOns:{paddles:0,ballMachines:0,coach:null},
          coaching:{trainingMode:'',students:1,goals:[],otherGoal:'',notes:'',times:[],durationHours:0,court:''},
          bookingSubtotal:3240,
          addOnSubtotal:0,
          total:3240,
          payment:{method:'Maya',reference:'DEMO-MAYA-0988',status:'Verified'},
          clubId:raw.id,
          clubCode:raw.clubId,
          clubName:raw.name,
          createdAt:new Date(Date.now()-15*86400000).toISOString(),
          demoPreview:true
        }
      );

      data.payments.unshift(
        {
          id:'PAY-NZ-DEMO-1002',
          bookingReference:'NZ-DEMO-1002',
          clubId:raw.id,
          date:new Date().toISOString(),
          method:'GCash',
          reference:'DEMO-GCASH-1002',
          amount:1800,
          status:'Pending Verification',
          demoPreview:true
        },
        {
          id:'PAY-NZ-DEMO-0988',
          bookingReference:'NZ-DEMO-0988',
          clubId:raw.id,
          date:new Date(Date.now()-15*86400000).toISOString(),
          method:'Maya',
          reference:'DEMO-MAYA-0988',
          amount:3240,
          status:'Verified',
          demoPreview:true
        }
      );
      savePortalData(data);
    }
  }

  function startDemoSession(){
    const raw=demoRawClub();
    const rep=raw.representatives.find(r=>r.bookingPermission)||raw.representatives[0];
    if(!raw||!rep)return {ok:false,message:'Demo club preview is unavailable.'};

    seedDemoPortalData();
    const session={
      clubId:raw.id,
      representativeId:rep.id,
      signedInAt:new Date().toISOString(),
      demoPreview:true
    };
    write(SESSION_KEY,session);
    window.dispatchEvent(new CustomEvent('northzone:account-changed'));
    return {
      ok:true,
      demoPreview:true,
      club:publicClub(raw),
      representative:publicClub(raw).representatives.find(r=>r.id===rep.id)
    };
  }

  function resetDemoPreviewData(){
    const raw=demoRawClub();
    const data=portalData();
    data.bookings=data.bookings.filter(b=>!(String(b.clubId)===String(raw.id)&&b.demoPreview));
    data.payments=data.payments.filter(p=>!(String(p.clubId)===String(raw.id)&&p.demoPreview));
    data.clubMatches=data.clubMatches.filter(m=>!(String(m.clubId)===String(raw.id)&&m.demoPreview));
    data.announcements=data.announcements.filter(a=>!(String(a.clubId)===String(raw.id)&&a.demoPreview));
    data.praiseRecords=data.praiseRecords.filter(p=>!(String(p.clubId)===String(raw.id)&&p.demoPreview));
    if(data.membersByClub)delete data.membersByClub[raw.id];
    if(data.profileOverrides)delete data.profileOverrides[raw.id];
    if(data.representativeOverrides)delete data.representativeOverrides[raw.id];
    savePortalData(data);
    seedDemoPortalData();
    return true;
  }

  function currentClub(){
    const s=currentSession(); if(!s)return null;
    if(s.demoPreview){
      const raw=demoRawClub();
      return String(raw.id)===String(s.clubId)?publicClub(raw):null;
    }
    const raw=allRawClubs().find(c=>String(c.id)===String(s.clubId));
    return raw?publicClub(raw):null;
  }
  function currentRepresentative(){
    const s=currentSession(),club=currentClub(); if(!s||!club)return null;
    return club.representatives.find(r=>String(r.id)===String(s.representativeId))||null;
  }
  function signOut(){localStorage.removeItem(SESSION_KEY);window.dispatchEvent(new CustomEvent('northzone:account-changed'))}

  function signIn(email,password){
    const e=lower(email),p=String(password||'');
    for(const raw of allRawClubs()){
      if(raw.status!=='approved')continue;
      const rep=raw.representatives.find(r=>lower(r.email)===e&&r.password===p&&r.bookingPermission);
      if(rep){
        const session={clubId:raw.id,representativeId:rep.id,signedInAt:new Date().toISOString()};
        write(SESSION_KEY,session);
        window.dispatchEvent(new CustomEvent('northzone:account-changed'));
        return {ok:true,club:publicClub(raw),representative:publicClub(raw).representatives.find(r=>r.id===rep.id)};
      }
    }
    return {ok:false,message:'Club account not found, not approved, or the sign-in details are incorrect.'};
  }

  function registerApplication(input){
    const apps=read(APPLICATIONS_KEY,[]);
    const duplicate=apps.some(a=>lower(a.clubName)===lower(input.clubName)&&['pending','approved'].includes(lower(a.status)));
    if(duplicate)return {ok:false,message:'A pending or approved application already exists for that club name.'};
    const token=uuid().replaceAll('-','').slice(0,8).toUpperCase();
    const app={
      id:'CLUB-APP-'+token,reference:'CLUB-APP-'+token,status:'pending',submittedAt:new Date().toISOString(),
      clubName:String(input.clubName||'').trim(),memberCount:Number(input.memberCount||0),homeArea:String(input.homeArea||'').trim(),
      description:String(input.description||'').trim(),representative:{
        name:String(input.representativeName||'').trim(),email:String(input.email||'').trim(),mobile:String(input.mobile||'').trim()
      }
    };
    apps.unshift(app);write(APPLICATIONS_KEY,apps);
    window.NorthZonePlatformBridge?.enqueue?.('club_application',{clubName:app.clubName,memberCount:app.memberCount,homeArea:app.homeArea,description:app.description,representativeName:app.representative.name,email:app.representative.email,mobile:app.representative.mobile,reference:app.reference},{source:'NorthZone Club Registration',fingerprint:app.reference});
    return {ok:true,application:clone(app)};
  }
  function applications(){return clone(read(APPLICATIONS_KEY,[]))}

  function updateProfile(patch){
    const club=currentClub();if(!club)return {ok:false};
    const data=portalData();
    data.profileOverrides[club.id]={
      ...(data.profileOverrides[club.id]||{}),
      description:String(patch.description??club.profile.description??'').trim(),
      memberCount:Math.max(0,Number(patch.memberCount??club.profile.memberCount??0)),
      homeArea:String(patch.homeArea??club.profile.homeArea??'').trim(),
      billingName:String(patch.billingName??club.profile.billingName??club.name).trim()
    };
    savePortalData(data);return {ok:true,club:currentClub()};
  }

  function safeImageDataUrl(value){
    const v=String(value||'');
    if(!v)return '';
    return /^data:image\/(?:png|jpeg|jpg|webp);base64,/i.test(v)?v:'';
  }

  function updatePersonalization(patch){
    const club=currentClub(),rep=currentRepresentative();
    if(!club||!rep)return {ok:false,message:'Club session is not available.'};

    const data=portalData();
    const currentProfile=data.profileOverrides[club.id]||{};
    const currentRepGroup=data.representativeOverrides[club.id]||{};
    const currentRep=currentRepGroup[rep.id]||{};

    if(Object.prototype.hasOwnProperty.call(patch,'clubLogoDataUrl')){
      data.profileOverrides[club.id]={
        ...currentProfile,
        logoDataUrl:safeImageDataUrl(patch.clubLogoDataUrl)
      };
    }

    if(Object.prototype.hasOwnProperty.call(patch,'representativePhotoDataUrl')){
      data.representativeOverrides[club.id]={
        ...currentRepGroup,
        [rep.id]:{
          ...currentRep,
          photoDataUrl:safeImageDataUrl(patch.representativePhotoDataUrl)
        }
      };
    }

    savePortalData(data);
    return {ok:true,club:currentClub(),representative:currentRepresentative()};
  }

  function recordBooking(record){
    const club=currentClub();if(!club)return false;
    const data=portalData();
    if(data.bookings.some(b=>b.reference===record.reference))return true;
    data.bookings.unshift({...clone(record),clubId:club.id,clubCode:club.clubId,clubName:club.name,createdAt:new Date().toISOString()});
    if(record.payment){
      data.payments.unshift({
        id:'PAY-'+record.reference,bookingReference:record.reference,clubId:club.id,date:new Date().toISOString(),
        method:record.payment.method,reference:record.payment.reference,amount:record.total,status:'Pending Verification'
      });
    }
    savePortalData(data);return true;
  }
  function reservations(){
    const club=currentClub(); if(!club)return [];
    return clone(portalData().bookings.filter(b=>b.clubId===club.id));
  }
  function payments(){
    const club=currentClub(); if(!club)return [];
    return clone(portalData().payments.filter(p=>p.clubId===club.id));
  }

  function normalizeAnnouncement(a,clubId){
    const categories=['general','event','schedule','reminder'];
    const priorities=['normal','high'];
    const statuses=['draft','published'];
    return {
      id:String(a?.id||uuid()),
      clubId:String(a?.clubId||clubId||''),
      title:String(a?.title||'').trim().slice(0,120),
      body:String(a?.body||'').trim().slice(0,2000),
      imageDataUrl:String(a?.imageDataUrl||''),
      imageName:String(a?.imageName||'').trim().slice(0,120),
      category:categories.includes(lower(a?.category))?lower(a.category):'general',
      priority:priorities.includes(lower(a?.priority))?lower(a.priority):'normal',
      status:statuses.includes(lower(a?.status))?lower(a.status):'draft',
      pinned:Boolean(a?.pinned),
      audience:'registered-members',
      expiresAt:String(a?.expiresAt||''),
      authorId:String(a?.authorId||''),
      authorName:String(a?.authorName||'Club Representative'),
      createdAt:String(a?.createdAt||new Date().toISOString()),
      updatedAt:String(a?.updatedAt||new Date().toISOString()),
      publishedAt:String(a?.publishedAt||''),
      demoPreview:Boolean(a?.demoPreview)
    };
  }

  function announcements(clubId,options={}){
    const club=clubById(clubId||currentClub()?.id);if(!club)return [];
    const data=portalData();
    const publicRows=(platformContract()?.community?.announcements||[]).filter(a=>String(a.clubId)===String(club.id)).map(a=>normalizeAnnouncement(a,club.id));
    const localRows=data.announcements.filter(a=>String(a.clubId)===String(club.id)).map(a=>normalizeAnnouncement(a,club.id));
    const map=new Map();[...publicRows,...localRows].forEach(a=>map.set(String(a.id),a));let rows=[...map.values()];
    if(options.status&&options.status!=='all')rows=rows.filter(a=>a.status===options.status);
    if(options.category&&options.category!=='all')rows=rows.filter(a=>a.category===options.category);
    if(options.pinned)rows=rows.filter(a=>a.pinned);
    const now=Date.now();if(options.activeOnly)rows=rows.filter(a=>!a.expiresAt||new Date(a.expiresAt+'T23:59:59').getTime()>=now);
    rows.sort((a,b)=>Number(b.pinned)-Number(a.pinned)||new Date(b.updatedAt||b.publishedAt||b.createdAt).getTime()-new Date(a.updatedAt||a.publishedAt||a.createdAt).getTime());
    return clone(rows);
  }
  function saveAnnouncement(payload){
    const club=currentClub(),rep=currentRepresentative();
    if(!club||!rep)return {ok:false,message:'Club session is not available.'};

    const title=String(payload?.title||'').trim();
    const body=String(payload?.body||'').trim();
    if(title.length<3)return {ok:false,message:'Announcement title is required.'};
    if(body.length<5)return {ok:false,message:'Announcement message is required.'};

    const data=portalData();
    const now=new Date().toISOString();
    const existingId=String(payload?.id||'');
    const index=data.announcements.findIndex(a=>String(a.id)===existingId&&String(a.clubId)===String(club.id));
    const previous=index>=0?normalizeAnnouncement(data.announcements[index],club.id):null;
    const status=lower(payload?.status)==='published'?'published':'draft';

    const next=normalizeAnnouncement({
      ...(previous||{}),
      ...payload,
      id:existingId||uuid(),
      clubId:club.id,
      audience:'registered-members',
      authorId:previous?.authorId||rep.id,
      authorName:previous?.authorName||rep.name,
      createdAt:previous?.createdAt||now,
      updatedAt:now,
      publishedAt:status==='published'?(previous?.publishedAt||now):''
    },club.id);

    if(index>=0)data.announcements[index]=next;
    else data.announcements.push(next);

    savePortalData(data);
    window.NorthZonePlatformBridge?.enqueue?.('club_announcement_submission',next,{source:'NorthZone Club Portal',fingerprint:next.id});
    return {ok:true,announcement:clone(next)};
  }

  function setAnnouncementStatus(id,status){
    const club=currentClub();
    if(!club)return {ok:false,message:'Club session is not available.'};
    const data=portalData();
    const index=data.announcements.findIndex(a=>String(a.id)===String(id)&&String(a.clubId)===String(club.id));
    if(index<0)return {ok:false,message:'Announcement was not found.'};
    const current=normalizeAnnouncement(data.announcements[index],club.id);
    const nextStatus=lower(status)==='published'?'published':'draft';
    const now=new Date().toISOString();
    data.announcements[index]={
      ...current,status:nextStatus,updatedAt:now,
      publishedAt:nextStatus==='published'?(current.publishedAt||now):''
    };
    savePortalData(data);
    return {ok:true,announcement:clone(data.announcements[index])};
  }

  function deleteAnnouncement(id){
    const club=currentClub();
    if(!club)return {ok:false,message:'Club session is not available.'};
    const data=portalData();
    const before=data.announcements.length;
    data.announcements=data.announcements.filter(a=>!(String(a.id)===String(id)&&String(a.clubId)===String(club.id)));
    if(data.announcements.length===before)return {ok:false,message:'Announcement was not found.'};
    savePortalData(data);
    return {ok:true};
  }

  function leaderboardClubs(){
    const map=new Map();
    allRawClubs().forEach(c=>map.set(String(c.id),c));
    const data=portalData();
    Object.keys(data.membersByClub||{}).forEach(id=>{
      if(!map.has(String(id))&&String(id)===String(demoRawClub().id))map.set(String(id),demoRawClub());
    });
    return [...map.values()];
  }

  function clubById(clubId){
    const id=String(clubId||'');
    return leaderboardClubs().find(c=>String(c.id)===id||String(c.clubId)===id)||null;
  }

  function clubMembers(clubId){
    const raw=clubById(clubId||currentClub()?.id);
    if(!raw)return [];
    const data=portalData();
    const rows=[...(raw.members||[]),...((data.membersByClub?.[raw.id])||[])];
    const seen=new Set(),out=[];
    for(const item of rows){
      const m=normalizeMember(item);
      const key=lower(m.qourtsId||m.email||m.mobile||m.id);
      if(!key||seen.has(key))continue;
      seen.add(key);
      out.push(m);
    }
    return clone(out.filter(m=>m.status!=='inactive'&&m.status!=='removed'));
  }

  function matchesForClub(clubId){
    const raw=clubById(clubId);
    if(!raw)return [];
    const data=portalData();
    const rows=[...(raw.matchRecords||[]),...data.clubMatches.filter(m=>String(m.clubId)===String(raw.id))];
    const seen=new Set(),out=[];
    for(const item of rows){
      const m=normalizeMatch(item,raw.id);
      const key=m.id||JSON.stringify([m.date,m.teamA,m.teamB,m.scoreA,m.scoreB]);
      if(seen.has(key))continue;
      seen.add(key);
      if(m.status==='verified'||m.status==='completed')out.push(m);
    }
    return out;
  }

  function inPeriod(dateValue,period){
    if(period==='all')return true;
    const d=new Date(String(dateValue||'')+'T12:00:00');
    if(Number.isNaN(d.getTime()))return false;
    const now=new Date();
    if(period==='month')return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth();
    if(period==='year')return d.getFullYear()===now.getFullYear();
    return true;
  }

  function clubLeaderboard(clubId,period='all',metric='wins'){
    const raw=clubById(clubId||currentClub()?.id);
    if(!raw)return {club:null,period,metric,eligibleMembers:0,verifiedMatches:0,rows:[]};
    const members=clubMembers(raw.id);
    const matchRows=matchesForClub(raw.id).filter(m=>inPeriod(m.date,period));
    const stats=new Map();

    members.forEach(m=>stats.set(lower(m.qourtsId),{
      memberId:m.id,qourtsId:m.qourtsId,name:m.name,photoDataUrl:m.photoDataUrl||'',
      wins:0,losses:0,matches:0,pe:0,pc:0,pq:0,winPct:0
    }));

    matchRows.forEach(match=>{
      const aScore=Number(match.scoreA||0),bScore=Number(match.scoreB||0);
      const aWon=aScore>bScore,bWon=bScore>aScore;
      const apply=(ids,won,pe,pc)=>{
        ids.forEach(id=>{
          const s=stats.get(lower(id)); if(!s)return;
          s.matches+=1;s.pe+=pe;s.pc+=pc;
          if(won)s.wins+=1;else s.losses+=1;
        });
      };
      apply(match.teamA,aWon,aScore,bScore);
      apply(match.teamB,bWon,bScore,aScore);
    });

    const rows=[...stats.values()].map(s=>{
      const denom=s.pe+s.pc;
      s.pq=denom?s.pe/denom:0;
      s.winPct=s.matches?s.wins/s.matches:0;
      return s;
    });

    const value=row=>{
      if(metric==='winPct')return row.winPct;
      if(metric==='matches')return row.matches;
      if(metric==='pe')return row.pe;
      if(metric==='pq')return row.pq;
      return row.wins;
    };

    rows.sort((a,b)=>
      value(b)-value(a) ||
      b.wins-a.wins ||
      b.winPct-a.winPct ||
      b.pq-a.pq ||
      b.pe-a.pe ||
      a.name.localeCompare(b.name)
    );
    rows.forEach((row,i)=>row.rank=i+1);

    return {
      club:{id:raw.id,clubId:raw.clubId,name:raw.name,logoDataUrl:publicClub(raw)?.profile?.logoDataUrl||''},
      period,metric,eligibleMembers:members.length,verifiedMatches:matchRows.length,rows:clone(rows)
    };
  }

  function identityMatchesMember(identity,member){
    if(!identity||!member)return false;
    const values=[
      identity.qourtsId,identity.email,identity.mobile,
      typeof identity==='string'?identity:''
    ].map(lower).filter(Boolean);
    return values.some(v=>[member.qourtsId,member.email,member.mobile,member.id].map(lower).includes(v));
  }

  function playerAffiliations(identity){
    const result=[];
    leaderboardClubs().forEach(raw=>{
      const member=clubMembers(raw.id).find(m=>identityMatchesMember(identity,m));
      if(!member)return;
      const club=publicClub(raw);
      result.push({
        clubId:raw.id,clubCode:raw.clubId,clubName:raw.name,
        logoDataUrl:club?.profile?.logoDataUrl||'',
        member:{id:member.id,qourtsId:member.qourtsId,name:member.name,status:member.status,joinedAt:member.joinedAt}
      });
    });
    return clone(result);
  }

  function praiseCategories(){return clone(PRAISE_CATEGORIES)}

  function normalizePraise(p){
    return {
      id:String(p?.id||uuid()),
      clubId:String(p?.clubId||''),
      activityId:String(p?.activityId||''),
      activityType:String(p?.activityType||'match'),
      activityDate:String(p?.activityDate||''),
      giverQourtsId:String(p?.giverQourtsId||''),
      recipientQourtsId:String(p?.recipientQourtsId||''),
      categories:[...new Set(Array.isArray(p?.categories)?p.categories:[])]
        .map(lower).filter(x=>PRAISE_CATEGORY_IDS.has(x)).slice(0,3),
      note:String(p?.note||'').trim().slice(0,240),
      status:lower(p?.status||'active')==='removed'?'removed':'active',
      createdAt:String(p?.createdAt||new Date().toISOString()),
      removedAt:String(p?.removedAt||''),
      removalReason:String(p?.removalReason||'').slice(0,240),
      removedBy:String(p?.removedBy||''),
      demoPreview:Boolean(p?.demoPreview)
    };
  }

  function activePraiseRecords(clubId){
    const data=portalData();
    const publicRows=(platformContract()?.community?.praise||[]).filter(p=>!clubId||String(p.clubId)===String(clubId)).map(normalizePraise);
    const localRows=data.praiseRecords.filter(p=>!clubId||String(p.clubId)===String(clubId)).map(normalizePraise);
    const map=new Map();[...publicRows,...localRows].forEach(p=>map.set(String(p.id),p));
    return [...map.values()].filter(p=>p.status==='active');
  }
  function memberByIdentity(clubId,identity){
    return clubMembers(clubId).find(m=>identityMatchesMember(identity,m))||null;
  }

  function playerVerifiedMatches(identity,limit=20){
    const affiliations=playerAffiliations(identity);
    const qids=new Set(affiliations.map(a=>lower(a.member.qourtsId)).filter(Boolean));
    if(identity?.qourtsId)qids.add(lower(identity.qourtsId));
    if(typeof identity==='string'&&lower(identity).startsWith('qrt-'))qids.add(lower(identity));

    const results=[],seen=new Set();
    affiliations.forEach(a=>{
      const members=clubMembers(a.clubId);
      const memberMap=new Map(members.map(m=>[lower(m.qourtsId),m]));
      matchesForClub(a.clubId).forEach(match=>{
        const ids=[...match.teamA,...match.teamB].map(lower);
        const playerQid=[...qids].find(q=>ids.includes(q));
        if(!playerQid)return;
        const key=String(a.clubId)+'|'+String(match.id);
        if(seen.has(key))return;
        seen.add(key);

        const onA=match.teamA.map(lower).includes(playerQid);
        const playerScore=onA?match.scoreA:match.scoreB;
        const opponentScore=onA?match.scoreB:match.scoreA;
        results.push({
          clubId:a.clubId,
          clubName:a.clubName,
          clubLogoDataUrl:a.logoDataUrl||'',
          activityId:match.id,
          activityType:'match',
          date:match.date,
          scoreA:match.scoreA,scoreB:match.scoreB,
          teamA:match.teamA.map(id=>memberMap.get(lower(id))||{qourtsId:id,name:id}),
          teamB:match.teamB.map(id=>memberMap.get(lower(id))||{qourtsId:id,name:id}),
          playerQourtsId:playerQid,
          playerSide:onA?'A':'B',
          playerScore,opponentScore,
          won:playerScore>opponentScore
        });
      });
    });
    results.sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());
    return clone(results.slice(0,Math.max(1,Number(limit)||20)));
  }

  function playerMatchSummary(identity){
    const rows=playerVerifiedMatches(identity,500);
    let wins=0,losses=0,pe=0,pc=0;
    rows.forEach(m=>{
      pe+=Number(m.playerScore||0);
      pc+=Number(m.opponentScore||0);
      if(m.won)wins+=1;else losses+=1;
    });
    return {wins,losses,matches:rows.length,pe,pc,pq:(pe+pc)?pe/(pe+pc):0,recent:rows.slice(0,8)};
  }

  function eligiblePraiseActivities(identity){
    const rows=playerVerifiedMatches(identity,12);
    const data=portalData();
    return rows.map(activity=>{
      const members=clubMembers(activity.clubId);
      const selfQid=lower(activity.playerQourtsId);
      const participants=[...activity.teamA,...activity.teamB]
        .filter(m=>lower(m.qourtsId)!==selfQid)
        .map(m=>{
          const existing=data.praiseRecords
            .map(normalizePraise)
            .find(p=>p.status==='active'&&
              String(p.clubId)===String(activity.clubId)&&
              String(p.activityId)===String(activity.activityId)&&
              lower(p.giverQourtsId)===selfQid&&
              lower(p.recipientQourtsId)===lower(m.qourtsId));
          const teammate=(activity.playerSide==='A'?activity.teamA:activity.teamB)
            .some(x=>lower(x.qourtsId)===lower(m.qourtsId));
          return {
            id:m.id||m.qourtsId,
            qourtsId:m.qourtsId,
            name:m.name,
            photoDataUrl:m.photoDataUrl||'',
            relationship:teammate?'Partner':'Opponent',
            praisedCategories:existing?.categories||[],
            praiseRemaining:Math.max(0,3-(existing?.categories?.length||0))
          };
        });
      return {...activity,participants};
    });
  }

  function submitPraise(payload){
    const club=clubById(payload?.clubId);
    if(!club)return {ok:false,message:'Club was not found.'};

    const giver=memberByIdentity(club.id,payload?.giver);
    const recipient=memberByIdentity(club.id,{qourtsId:payload?.recipientQourtsId});
    if(!giver)return {ok:false,message:'Only registered club members can give Praise.'};
    if(!recipient)return {ok:false,message:'The selected player is not an active registered member.'};
    if(lower(giver.qourtsId)===lower(recipient.qourtsId))return {ok:false,message:'You cannot Praise yourself.'};

    const match=matchesForClub(club.id).find(m=>String(m.id)===String(payload?.activityId));
    if(!match)return {ok:false,message:'Praise is available only after verified play.'};
    const participants=[...match.teamA,...match.teamB].map(lower);
    if(!participants.includes(lower(giver.qourtsId))||!participants.includes(lower(recipient.qourtsId))){
      return {ok:false,message:'Both players must have participated in this verified activity.'};
    }

    const requested=[...new Set(Array.isArray(payload?.categories)?payload.categories:[])]
      .map(lower).filter(x=>PRAISE_CATEGORY_IDS.has(x));
    if(!requested.length)return {ok:false,message:'Choose at least one Praise category.'};
    if(requested.length>3)return {ok:false,message:'Choose up to 3 Praise categories per player.'};

    const data=portalData();
    const index=data.praiseRecords.findIndex(p=>{
      const n=normalizePraise(p);
      return n.status==='active'&&
        String(n.clubId)===String(club.id)&&
        String(n.activityId)===String(match.id)&&
        lower(n.giverQourtsId)===lower(giver.qourtsId)&&
        lower(n.recipientQourtsId)===lower(recipient.qourtsId);
    });
    const previous=index>=0?normalizePraise(data.praiseRecords[index]):null;
    const newCategories=requested.filter(x=>!previous?.categories.includes(x));
    if(!newCategories.length)return {ok:false,message:'You already gave this Praise for this activity.'};

    const merged=[...(previous?.categories||[]),...newCategories];
    if(merged.length>3)return {ok:false,message:'You can give this player a maximum of 3 Praise categories for this activity.'};

    const next=normalizePraise({
      ...(previous||{}),
      id:previous?.id||uuid(),
      clubId:club.id,
      activityId:match.id,
      activityType:'match',
      activityDate:match.date,
      giverQourtsId:giver.qourtsId,
      recipientQourtsId:recipient.qourtsId,
      categories:merged,
      note:String(payload?.note||previous?.note||'').trim().slice(0,240),
      status:'active',
      createdAt:previous?.createdAt||new Date().toISOString(),
      demoPreview:Boolean(previous?.demoPreview)
    });

    if(index>=0)data.praiseRecords[index]=next;
    else data.praiseRecords.push(next);
    savePortalData(data);
    window.NorthZonePlatformBridge?.enqueue?.('praise_submission',next,{source:'My Qourts',fingerprint:next.id});

    return {
      ok:true,
      praise:clone(next),
      addedCategories:clone(newCategories),
      remaining:Math.max(0,3-next.categories.length)
    };
  }

  function playerPraiseProfile(identity,options={}){
    const affiliations=playerAffiliations(identity);
    const qid=lower(identity?.qourtsId||affiliations[0]?.member?.qourtsId||identity);
    if(!qid)return {totalPraise:0,uniquePraisers:0,categories:[],recent:[]};

    let records=activePraiseRecords();
    if(options.clubId)records=records.filter(p=>String(p.clubId)===String(options.clubId));
    records=records.filter(p=>lower(p.recipientQourtsId)===qid&&inPeriod(p.activityDate||p.createdAt,options.period||'all'));

    const categoryMap=new Map(PRAISE_CATEGORIES.map(c=>[c.id,{...c,count:0,uniquePraisers:new Set()}]));
    const uniquePraisers=new Set();
    let totalPraise=0;

    records.forEach(p=>{
      uniquePraisers.add(lower(p.giverQourtsId));
      p.categories.forEach(id=>{
        const c=categoryMap.get(id);if(!c)return;
        c.count+=1;c.uniquePraisers.add(lower(p.giverQourtsId));totalPraise+=1;
      });
    });

    const memberLookup=new Map();
    leaderboardClubs().forEach(c=>clubMembers(c.id).forEach(m=>memberLookup.set(lower(m.qourtsId),m)));
    const clubLookup=new Map(leaderboardClubs().map(c=>[String(c.id),publicClub(c)]));

    const categories=[...categoryMap.values()]
      .filter(c=>c.count>0)
      .map(c=>({...c,uniquePraisers:c.uniquePraisers.size}))
      .sort((a,b)=>b.count-a.count||b.uniquePraisers-a.uniquePraisers||a.label.localeCompare(b.label));

    const recent=records
      .sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
      .slice(0,12)
      .map(p=>({
        ...p,
        giverName:memberLookup.get(lower(p.giverQourtsId))?.name||'Player',
        clubName:clubLookup.get(String(p.clubId))?.name||'Club',
        categories:p.categories.map(id=>PRAISE_CATEGORIES.find(c=>c.id===id)).filter(Boolean)
      }));

    return {totalPraise,uniquePraisers:uniquePraisers.size,categories:clone(categories),recent:clone(recent)};
  }

  function clubPraiseBoard(clubId,period='month',category='all'){
    const raw=clubById(clubId);
    if(!raw)return {club:null,period,category,totalPraise:0,uniquePraisers:0,rows:[]};

    const members=clubMembers(raw.id);
    const memberMap=new Map(members.map(m=>[lower(m.qourtsId),m]));
    let records=activePraiseRecords(raw.id).filter(p=>inPeriod(p.activityDate||p.createdAt,period));
    if(category!=='all')records=records.filter(p=>p.categories.includes(category));

    const stats=new Map(members.map(m=>[lower(m.qourtsId),{
      qourtsId:m.qourtsId,name:m.name,photoDataUrl:m.photoDataUrl||'',
      praise:0,uniquePraisers:new Set(),categoryCounts:new Map()
    }]));
    const allPraisers=new Set();
    let totalPraise=0;

    records.forEach(p=>{
      const s=stats.get(lower(p.recipientQourtsId));if(!s)return;
      const matching=category==='all'?p.categories:p.categories.filter(x=>x===category);
      matching.forEach(id=>{
        s.praise+=1;totalPraise+=1;
        s.uniquePraisers.add(lower(p.giverQourtsId));
        s.categoryCounts.set(id,(s.categoryCounts.get(id)||0)+1);
      });
      if(matching.length)allPraisers.add(lower(p.giverQourtsId));
    });

    const rows=[...stats.values()].map(s=>{
      const top=[...s.categoryCounts.entries()]
        .sort((a,b)=>b[1]-a[1])
        .slice(0,3)
        .map(([id,count])=>({...PRAISE_CATEGORIES.find(c=>c.id===id),count}));
      return {
        qourtsId:s.qourtsId,name:s.name,photoDataUrl:s.photoDataUrl,
        praise:s.praise,uniquePraisers:s.uniquePraisers.size,knownFor:top
      };
    }).filter(r=>r.praise>0)
      .sort((a,b)=>b.praise-a.praise||b.uniquePraisers-a.uniquePraisers||a.name.localeCompare(b.name));

    rows.forEach((r,i)=>r.rank=i+1);
    return {
      club:{id:raw.id,name:raw.name,clubId:raw.clubId},
      period,category,totalPraise,uniquePraisers:allPraisers.size,rows:clone(rows)
    };
  }

  function recentClubPraise(clubId,limit=20){
    const members=clubMembers(clubId);
    const memberMap=new Map(members.map(m=>[lower(m.qourtsId),m]));
    return clone(activePraiseRecords(clubId)
      .sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
      .slice(0,Math.max(1,Number(limit)||20))
      .map(p=>({
        ...p,
        giverName:memberMap.get(lower(p.giverQourtsId))?.name||'Player',
        recipientName:memberMap.get(lower(p.recipientQourtsId))?.name||'Player',
        categories:p.categories.map(id=>PRAISE_CATEGORIES.find(c=>c.id===id)).filter(Boolean)
      })));
  }

  function removePraise(id,reason=''){
    const club=currentClub(),rep=currentRepresentative();
    if(!club||!rep)return {ok:false,message:'Club representative session is required.'};
    const data=portalData();
    const index=data.praiseRecords.findIndex(p=>String(p.id)===String(id)&&String(p.clubId)===String(club.id));
    if(index<0)return {ok:false,message:'Praise record was not found.'};
    const current=normalizePraise(data.praiseRecords[index]);
    data.praiseRecords[index]={
      ...current,status:'removed',
      removedAt:new Date().toISOString(),
      removalReason:String(reason||'Removed by club moderator').trim().slice(0,240),
      removedBy:rep.id
    };
    savePortalData(data);
    return {ok:true};
  }

  function source(){
    if(isDemoSession())return'demo-preview-club-registry';
    if(platformContract())return'admin-public-contract';
    return rawAdminClubs()!==null?'admin-public-contract':'bundled-demo-club-registry';
  }

  window.NorthZoneClubRegistry={
    signIn,signOut,currentSession,currentClub,currentRepresentative,registerApplication,applications,
    startDemoSession,isDemoSession,resetDemoPreviewData,seedDemoLeaderboardData,seedDemoAnnouncements,seedDemoPraise,
    updateProfile,updatePersonalization,recordBooking,reservations,payments,
    announcements,saveAnnouncement,setAnnouncementStatus,deleteAnnouncement,
    praiseCategories,eligiblePraiseActivities,submitPraise,playerPraiseProfile,clubPraiseBoard,recentClubPraise,removePraise,
    playerVerifiedMatches,playerMatchSummary,
    clubMembers,clubLeaderboard,playerAffiliations,source,
    keys:{ADMIN_STORAGE_KEY,SESSION_KEY,PORTAL_DATA_KEY,APPLICATIONS_KEY}
  };
})();