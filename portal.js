(() => {
  const PLAYER_KEY='qourts_demo_profile_v1';
  const $=s=>document.querySelector(s);

  function playerProfile(){
    try{return JSON.parse(localStorage.getItem(PLAYER_KEY)||'null')}catch{return null}
  }

  function renderPlayer(){
    const profile=playerProfile();
    const status=$('#playerPortalStatus');
    const action=$('#playerPortalAction');
    if(profile){
      status.classList.add('ready');
      status.querySelector('span').textContent=`Player profile found · ${profile.name||profile.qourtsId||'My Qourts'}`;
      action.innerHTML='Continue to My Qourts <b>→</b>';
    }
  }

  function renderClub(){
    if(!window.NorthZoneClubRegistry)return;
    const club=NorthZoneClubRegistry.currentClub();
    const rep=NorthZoneClubRegistry.currentRepresentative();
    if(!club||!rep)return;

    const status=$('#clubPortalStatus');
    const action=$('#clubPortalAction');
    status.classList.add('ready');
    status.querySelector('span').textContent=`Signed in · ${club.name}`;
    action.textContent='Continue to Club Portal';
    const demoAction=$('#clubDemoPortalAction');
    if(demoAction){
      demoAction.href='club-portal.html';
      demoAction.innerHTML='Continue to Club Portal <b>→</b>';
    }
  }

  renderPlayer();
  renderClub();
})();
