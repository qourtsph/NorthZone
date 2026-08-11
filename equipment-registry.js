(() => {
  const ADMIN_STORAGE_KEY='northzone_admin_v11';
  const platformContract=()=>window.NorthZonePlatformBridge?.contract?.()||null;

  // Static fallback mirrors the current NorthZone Admin Equipment list.
  // When Admin and Client share the same origin, the adapter reads the
  // live local Admin equipmentAssets array instead. Supabase can replace
  // this adapter later without changing the booking UI rules.
  const STATIC_EQUIPMENT_SEED=[
    {
      id:'EQ-001',
      assetTag:'NZ-EQ-001',
      type:'Ball Machine',
      brand:'Spinshot',
      model:'Player',
      serialNumber:'SS-NZ-001',
      location:'Court Storage',
      status:'Good Condition'
    },
    {
      id:'EQ-002',
      assetTag:'NZ-EQ-002',
      type:'POS Terminal',
      brand:'Generic',
      model:'Front Desk POS',
      serialNumber:'POS-NZ-001',
      location:'Front Desk',
      status:'Good Condition'
    }
  ];

  const normalize=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');

  function readAdminEquipment(){
    // Phase 5 security boundary: Client consumes only the public contract.
    return null;
  }

  function list(){
    const pc=platformContract();
    if(pc?.booking?.rentalEquipment?.length){
      return pc.booking.rentalEquipment.map((x,i)=>({id:String(x.sku||`RENT-${i+1}`),assetTag:String(x.sku||''),sku:String(x.sku||''),type:String(x.name||'Rental Equipment').toLowerCase().includes('ball machine')?'Ball Machine':String(x.name||'').toLowerCase().includes('paddle')?'Paddle':'Rental Equipment',brand:'',model:String(x.name||''),serialNumber:'',location:'Rental Inventory',status:Number(x.available||0)>0?'Good Condition':'Unavailable',available:Number(x.available||0),price:Number(x.price||0),maxPerBooking:Number(x.maxPerBooking||0)}));
    }
    const admin=readAdminEquipment();return (admin!==null?admin:STATIC_EQUIPMENT_SEED).map(x=>({...x}));
  }
  function serviceableByType(type){
    const wanted=normalize(type),rows=list().filter(x=>normalize(x.type)===wanted&&normalize(x.status)==='good condition'),expanded=[];
    rows.forEach(x=>{const qty=Math.max(1,Number(x.available||1));for(let i=0;i<qty;i++)expanded.push({...x,id:qty>1?`${x.id}-${i+1}`:x.id})});return expanded;
  }
  function source(){return platformContract()?'admin-public-contract':'bundled-equipment-snapshot'}

  window.NorthZoneEquipmentRegistry={
    list,
    serviceableByType,
    source,
    adminStorageKey:ADMIN_STORAGE_KEY
  };
})();