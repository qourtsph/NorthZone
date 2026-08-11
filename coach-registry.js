(() => {
  const ADMIN_STORAGE_KEY='northzone_admin_v11';
  const platformContract=()=>window.NorthZonePlatformBridge?.contract?.()||null;

  // Fallback is intentionally public-safe and contains no direct contact info.
  // The current NorthZone client build knows Coach Raf exists, but does not
  // invent certifications, specialties, or experience that have not been
  // supplied as verified public profile data.
  const FALLBACK={
    settings:{coachRate:900},
    employees:[
      {
        id:'EMP-001',
        employeeNo:'NZ-001',
        name:'Coach Raf',
        position:'Head Coach',
        department:'Coaching',
        status:'active',
        coach:true,
        coachRate:800,
        publicCoachProfile:{
          bio:'',
          specialties:[],
          skillLevels:[],
          yearsExperience:null,
          maxStudents:4,
          demoTemporaryRates:true,
          demoRateNote:'Temporary demo coaching rates. Replace before production.',
          sessionRates:{1:900,2:1200,3:1500,4:1800},
          exactRates:[{id:'DEMO-RAF-1P-30M',participantCount:1,durationMinutes:30,amount:500,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-1P-60M',participantCount:1,durationMinutes:60,amount:900,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-1P-90M',participantCount:1,durationMinutes:90,amount:1300,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-1P-120M',participantCount:1,durationMinutes:120,amount:1700,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-1P-150M',participantCount:1,durationMinutes:150,amount:2100,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-1P-180M',participantCount:1,durationMinutes:180,amount:2500,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-2P-30M',participantCount:2,durationMinutes:30,amount:650,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-2P-60M',participantCount:2,durationMinutes:60,amount:1200,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-2P-90M',participantCount:2,durationMinutes:90,amount:1750,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-2P-120M',participantCount:2,durationMinutes:120,amount:2300,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-2P-150M',participantCount:2,durationMinutes:150,amount:2850,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-2P-180M',participantCount:2,durationMinutes:180,amount:3400,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-3P-30M',participantCount:3,durationMinutes:30,amount:800,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-3P-60M',participantCount:3,durationMinutes:60,amount:1500,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-3P-90M',participantCount:3,durationMinutes:90,amount:2200,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-3P-120M',participantCount:3,durationMinutes:120,amount:2900,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-3P-150M',participantCount:3,durationMinutes:150,amount:3600,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-3P-180M',participantCount:3,durationMinutes:180,amount:4300,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-4P-30M',participantCount:4,durationMinutes:30,amount:950,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-4P-60M',participantCount:4,durationMinutes:60,amount:1800,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-4P-90M',participantCount:4,durationMinutes:90,amount:2650,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-4P-120M',participantCount:4,durationMinutes:120,amount:3500,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-4P-150M',participantCount:4,durationMinutes:150,amount:4350,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'},{id:'DEMO-RAF-4P-180M',participantCount:4,durationMinutes:180,amount:5200,currency:'PHP',effectiveFrom:'',effectiveTo:'',source:'demo_temporary'}],
          availability:[{id:'DEMO-RAF-AVL-0',dayOfWeek:0,start:'07:00',end:'23:00',status:'active',source:'demo_temporary'},{id:'DEMO-RAF-AVL-1',dayOfWeek:1,start:'07:00',end:'23:00',status:'active',source:'demo_temporary'},{id:'DEMO-RAF-AVL-2',dayOfWeek:2,start:'07:00',end:'23:00',status:'active',source:'demo_temporary'},{id:'DEMO-RAF-AVL-3',dayOfWeek:3,start:'07:00',end:'23:00',status:'active',source:'demo_temporary'},{id:'DEMO-RAF-AVL-4',dayOfWeek:4,start:'07:00',end:'23:00',status:'active',source:'demo_temporary'},{id:'DEMO-RAF-AVL-5',dayOfWeek:5,start:'07:00',end:'23:00',status:'active',source:'demo_temporary'},{id:'DEMO-RAF-AVL-6',dayOfWeek:6,start:'07:00',end:'23:00',status:'active',source:'demo_temporary'}]
        }
      }
    ],
    employeeCertifications:[],
    bookings:[],
    coaching:[]
  };

  const cleanList=v=>{
    if(Array.isArray(v))return v.map(x=>String(x).trim()).filter(Boolean);
    if(typeof v==='string')return v.split(/[,;|]/).map(x=>x.trim()).filter(Boolean);
    return [];
  };

  function readAdminState(){
    // Phase 5 security boundary: Client never parses private NorthZone Admin state.
    return null;
  }

  function state(){
    return FALLBACK;
  }

  function coachServiceRate(s,e){
    const catalog=(Array.isArray(s.servicesCatalog)?s.servicesCatalog:[])
      .find(x=>String(x?.category||'').toLowerCase()==='coaching'&&String(x?.status||'active').toLowerCase()==='active');
    return Number(
      e?.bookingRate ??
      e?.publicCoachProfile?.rate ??
      s?.settings?.coachRate ??
      catalog?.price ??
      0
    );
  }

  function certificationsFor(s,employeeId){
    return (Array.isArray(s.employeeCertifications)?s.employeeCertifications:[])
      .filter(c=>
        String(c?.employeeId)===String(employeeId) &&
        String(c?.status||'active').toLowerCase()==='active'
      )
      .map(c=>({
        name:String(c?.name||'Certification'),
        issuer:String(c?.issuer||''),
        credentialId:String(c?.credentialId||''),
        issueDate:String(c?.issueDate||''),
        expiryDate:String(c?.expiryDate||''),
        attachmentName:String(c?.attachmentName||''),
        mimeType:String(c?.mimeType||''),
        size:Number(c?.size||0),
        dataUrl:String(c?.dataUrl||'')
      }));
  }

  function positiveInt(v){
    const n=Number(v);
    return Number.isInteger(n)&&n>0?n:null;
  }

  function nonNegativeNumber(v){
    const n=Number(v);
    return Number.isFinite(n)&&n>=0?n:null;
  }

  function normalizeGroupRates(v){
    if(!v)return {};
    const result={};
    if(Array.isArray(v)){
      v.forEach(row=>{
        const count=positiveInt(row?.students??row?.players??row?.count);
        const rate=nonNegativeNumber(row?.rate??row?.hourlyRate);
        if(count&&rate!==null)result[count]=rate;
      });
      return result;
    }
    if(typeof v==='object'){
      Object.entries(v).forEach(([k,val])=>{
        const count=positiveInt(k);
        const rate=nonNegativeNumber(
          typeof val==='object' ? (val?.rate??val?.hourlyRate) : val
        );
        if(count&&rate!==null)result[count]=rate;
      });
    }
    return result;
  }

  // IMPORTANT: only return public-safe fields.
  function activeCoaches(){
    const pc=platformContract();
    if(pc?.coaches?.length){
      return pc.coaches.filter(c=>c.status==='active'&&c.bookable!==false).map(c=>{
        const exactRates=Array.isArray(c.rates)?c.rates.map(r=>({...r})):[];
        const sessionRates={};exactRates.filter(r=>Number(r.durationMinutes)===60).forEach(r=>{sessionRates[Number(r.participantCount)]=Number(r.amount)});
        return {id:String(c.id||''),employeeNo:'',name:String(c.publicName||'Coach'),title:String(c.headline||'Coach'),bio:String(c.bio||''),photoDataUrl:String(c.photoDataUrl||''),specialties:cleanList(c.specialties),skillLevels:cleanList(c.skillLevels),coachingGoals:cleanList(c.coachingGoals),yearsExperience:null,maxStudents:positiveInt(c.maxStudents),sessionRates,exactRates,rate:Number(sessionRates[1]||0),certifications:Array.isArray(c.certifications)?c.certifications.map(v=>({...v})):[],availability:Array.isArray(c.availability)?c.availability.map(v=>({...v})):[],exceptions:Array.isArray(c.exceptions)?c.exceptions.map(v=>({...v})):[ ],availabilitySource:String(c.availabilitySource||'coach_profile'),reviewSummary:{average:Number(c.reviewSummary?.average||0),count:Number(c.reviewSummary?.count||0),distribution:{...(c.reviewSummary?.distribution||{})}},reviews:Array.isArray(c.reviews)?c.reviews.map(v=>({...v})):[]};
      });
    }
    const s=state();
    return (Array.isArray(s.employees)?s.employees:[]).filter(e=>e?.coach===true&&String(e?.status||'').toLowerCase()==='active').map(e=>{
      const p=e.publicCoachProfile||e.coachPublicProfile||{};
      return {id:String(e.id||''),employeeNo:String(e.employeeNo||''),name:String(e.name||'Coach'),title:String(p.title||e.position||'Coach'),bio:String(p.bio||e.coachBio||''),specialties:cleanList(p.specialties||e.coachSpecialties||e.specialties),skillLevels:cleanList(p.skillLevels||e.coachSkillLevels||e.skillLevels),yearsExperience:Number.isFinite(Number(p.yearsExperience??e.coachingYearsExperience))?Number(p.yearsExperience??e.coachingYearsExperience):null,maxStudents:positiveInt(p.maxStudents??p.maxPlayers??e.coachMaxStudents??e.coachMaxPlayers),sessionRates:normalizeGroupRates(p.sessionRates??p.groupRates??p.studentRates??e.coachSessionRates??e.coachGroupRates),exactRates:Array.isArray(p.exactRates)?p.exactRates.map(r=>({...r})):[],rate:coachServiceRate(s,e),certifications:certificationsFor(s,e.id),availability:Array.isArray(p.availability)?p.availability.map(v=>({...v})):[],exceptions:Array.isArray(p.exceptions)?p.exceptions.map(v=>({...v})):[],demoTemporaryRates:!!p.demoTemporaryRates,demoRateNote:String(p.demoRateNote||''),reviewSummary:{average:0,count:0,distribution:{}},reviews:[]};
    });
  }
  function busyBlocks(){
    const pc=platformContract();
    if(pc?.booking?.blocks){
      return pc.booking.blocks.filter(b=>String(b.type||'').toLowerCase()==='coaching'&&b.coachProfileId).map(b=>({id:String(b.id||''),coachId:String(b.coachProfileId||''),coachName:'',date:String(b.date||''),start:String(b.start||''),hours:Number(b.durationMinutes||60)/60}));
    }
    const s=state(),rows=[];
    (Array.isArray(s.bookings)?s.bookings:[]).filter(b=>String(b?.type||'').toLowerCase()==='coaching'&&!['cancelled','void','refunded'].includes(String(b?.status||'').toLowerCase())).forEach(b=>rows.push({id:String(b.id||''),coachId:String(b.coachId||''),coachName:String(b.coach||''),date:String(b.date||''),start:String(b.start||''),hours:Number(b.hours||1)}));
    (Array.isArray(s.coaching)?s.coaching:[]).filter(b=>!['cancelled','void'].includes(String(b?.status||'').toLowerCase())).forEach(b=>rows.push({id:String(b.id||''),coachId:String(b.coachId||''),coachName:String(b.coach||''),date:String(b.date||''),start:String(b.start||''),hours:Number(b.hours||1)}));
    const seen=new Set();return rows.filter(x=>{const key=[x.coachId,x.coachName,x.date,x.start,x.hours].join('|').toLowerCase();if(seen.has(key))return false;seen.add(key);return true});
  }
  function source(){
    return platformContract()?'admin-public-contract':'bundled-public-coach-snapshot';
  }

  window.NorthZoneCoachRegistry={
    activeCoaches,
    busyBlocks,
    source,
    adminStorageKey:ADMIN_STORAGE_KEY
  };
})();