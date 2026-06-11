// ══════════════════════════════════════════════
// RASIGA — Application Engine (NO ES MODULES)
// Uses global `supabase` from UMD script in HTML
// ══════════════════════════════════════════════

(function() {
  'use strict';

  // ── 22 Seed Songs (always available, zero dependencies) ──
  var SEEDS = [
    {id:'s01',title:'Lag Ja Gale',film:'Woh Kaun Thi',language:'Hindi',industry:'Bollywood',year:1964,composer:'Madan Mohan',singer:'Lata Mangeshkar',lyricist:'Raja Mehdi Ali Khan',raga:null,genre:['Romantic','Classic'],mood:['Nostalgic','Soulful'],avg_rating:4.9,total_ratings:62450},
    {id:'s02',title:'Chaiyya Chaiyya',film:'Dil Se',language:'Hindi',industry:'Bollywood',year:1998,composer:'A.R. Rahman',singer:'Sukhwinder Singh',lyricist:'Gulzar',raga:null,genre:['Sufi','Fusion'],mood:['Energetic','Spiritual'],avg_rating:4.8,total_ratings:78320},
    {id:'s03',title:'Enna Solla Pogirai',film:'Kandukondain Kandukondain',language:'Tamil',industry:'Kollywood',year:2000,composer:'A.R. Rahman',singer:'Unnikrishnan',lyricist:'Vairamuthu',raga:'Kalyani',genre:['Romantic','Classical Fusion'],mood:['Melancholic','Soulful'],avg_rating:4.9,total_ratings:42100},
    {id:'s04',title:'Kaadhal Rojave',film:'Roja',language:'Tamil',industry:'Kollywood',year:1992,composer:'A.R. Rahman',singer:'Minmini',lyricist:'Vairamuthu',raga:'Kharaharapriya',genre:['Romantic','Folk Fusion'],mood:['Longing','Nostalgic'],avg_rating:4.8,total_ratings:51200},
    {id:'s05',title:'Tum Hi Ho',film:'Aashiqui 2',language:'Hindi',industry:'Bollywood',year:2013,composer:'Mithoon',singer:'Arijit Singh',lyricist:'Mithoon',raga:null,genre:['Romantic','Sad'],mood:['Melancholic','Heartbroken'],avg_rating:4.6,total_ratings:45231},
    {id:'s06',title:'Malare',film:'Premam',language:'Malayalam',industry:'Mollywood',year:2015,composer:'Rajesh Murugesan',singer:'Vijay Yesudas',lyricist:'Shaan Rahman',raga:null,genre:['Romantic','Indie'],mood:['Nostalgic','Bittersweet'],avg_rating:4.8,total_ratings:34560},
    {id:'s07',title:'Munbe Vaa',film:'Sillunu Oru Kaadhal',language:'Tamil',industry:'Kollywood',year:2006,composer:'A.R. Rahman',singer:'Hariharan, Shreya Ghoshal',lyricist:'Vairamuthu',raga:null,genre:['Romantic','Classical'],mood:['Soulful','Peaceful'],avg_rating:4.8,total_ratings:44560},
    {id:'s08',title:'Kal Ho Naa Ho',film:'Kal Ho Na Ho',language:'Hindi',industry:'Bollywood',year:2003,composer:'Shankar-Ehsaan-Loy',singer:'Sonu Nigam',lyricist:'Javed Akhtar',raga:null,genre:['Emotional','Romantic'],mood:['Bittersweet','Motivational'],avg_rating:4.7,total_ratings:55890},
    {id:'s09',title:'Nenjukkul Peidhidum',film:'Vaaranam Aayiram',language:'Tamil',industry:'Kollywood',year:2008,composer:'Harris Jayaraj',singer:'Karthik',lyricist:'Na. Muthukumar',raga:null,genre:['Romantic','Soft Rock'],mood:['Joyful','Energetic'],avg_rating:4.7,total_ratings:39870},
    {id:'s10',title:'Ekla Cholo Re',film:'Kahaani',language:'Bengali',industry:'Bengali Cinema',year:2012,composer:'Usha Uthup',singer:'Amitabh Bachchan',lyricist:'Rabindranath Tagore',raga:null,genre:['Folk','Patriotic'],mood:['Motivational','Spiritual'],avg_rating:4.9,total_ratings:29870},
    {id:'s11',title:'Bombe Heluthaite',film:'Mungaru Male',language:'Kannada',industry:'Sandalwood',year:2006,composer:'V. Harikrishna',singer:'Rajesh Krishnan',lyricist:'R.N. Jayagopal',raga:null,genre:['Romantic','Pop'],mood:['Joyful','Romantic'],avg_rating:4.6,total_ratings:21450},
    {id:'s12',title:'Nuvvu Nenu',film:'Okkadu',language:'Telugu',industry:'Tollywood',year:2003,composer:'Mani Sharma',singer:'Udit Narayan, Madhushree',lyricist:'Sirivennela Seetharama Sastry',raga:null,genre:['Romantic','Classical'],mood:['Joyful','Romantic'],avg_rating:4.6,total_ratings:28900},
    {id:'s13',title:'Tere Bina',film:'Guru',language:'Hindi',industry:'Bollywood',year:2007,composer:'A.R. Rahman',singer:'A.R. Rahman, Chinmayi',lyricist:'Gulzar',raga:null,genre:['Romantic','Fusion'],mood:['Longing','Soulful'],avg_rating:4.5,total_ratings:38760},
    {id:'s14',title:'Thumbi Vaa',film:'Ennu Ninte Moideen',language:'Malayalam',industry:'Mollywood',year:2015,composer:'M. Jayachandran',singer:'P. Unnikrishnan',lyricist:'P. Bhaskaran',raga:null,genre:['Romantic','Classical'],mood:['Soulful','Nostalgic'],avg_rating:4.7,total_ratings:18760},
    {id:'s15',title:'Phir Le Aya Dil',film:'Barfi!',language:'Hindi',industry:'Bollywood',year:2012,composer:'Pritam',singer:'Rekha Bhardwaj',lyricist:'Swanand Kirkire',raga:null,genre:['Romantic','Folk'],mood:['Nostalgic','Soulful'],avg_rating:4.7,total_ratings:28760},
    {id:'s16',title:'Vinnaithaandi Varuvaayaa',film:'Vinnaithaandi Varuvaayaa',language:'Tamil',industry:'Kollywood',year:2010,composer:'A.R. Rahman',singer:'Benny Dayal, Shreya Ghoshal',lyricist:'Thamarai',raga:null,genre:['Romantic','Pop'],mood:['Joyful','Dreamy'],avg_rating:4.7,total_ratings:36450},
    {id:'s17',title:'Ye Maya Chesave',film:'Ye Maya Chesave',language:'Telugu',industry:'Tollywood',year:2010,composer:'A.R. Rahman',singer:'Benny Dayal',lyricist:'Chandrabose',raga:null,genre:['Romantic','Fusion'],mood:['Dreamy','Romantic'],avg_rating:4.5,total_ratings:25670},
    {id:'s18',title:'Kannaana Kanney',film:'Viswasam',language:'Tamil',industry:'Kollywood',year:2019,composer:'D. Imman',singer:'Sid Sriram',lyricist:'Yugabharathi',raga:null,genre:['Devotional','Emotional'],mood:['Spiritual','Soulful'],avg_rating:4.6,total_ratings:19450},
    {id:'s19',title:'Kesariya',film:'Brahmastra',language:'Hindi',industry:'Bollywood',year:2022,composer:'Pritam',singer:'Arijit Singh',lyricist:'Amitabh Bhattacharya',raga:null,genre:['Romantic','Pop'],mood:['Dreamy','Romantic'],avg_rating:4.4,total_ratings:67800},
    {id:'s20',title:'Zinda',film:'Bhaag Milkha Bhaag',language:'Hindi',industry:'Bollywood',year:2013,composer:'Shankar-Ehsaan-Loy',singer:'Siddharth Mahadevan',lyricist:'Prasoon Joshi',raga:null,genre:['Motivational','Rock'],mood:['Motivational','Energetic'],avg_rating:4.6,total_ratings:31200},
    {id:'s21',title:'Rowdy Baby',film:'Maari 2',language:'Tamil',industry:'Kollywood',year:2018,composer:'Yuvan Shankar Raja',singer:'Dhanush, Dhee',lyricist:'Yugabharathi',raga:null,genre:['Dance','Pop'],mood:['Energetic','Joyful'],avg_rating:4.5,total_ratings:89500},
    {id:'s22',title:'Channa Mereya',film:'Ae Dil Hai Mushkil',language:'Hindi',industry:'Bollywood',year:2016,composer:'Pritam',singer:'Arijit Singh',lyricist:'Amitabh Bhattacharya',raga:null,genre:['Romantic','Sad'],mood:['Heartbroken','Soulful'],avg_rating:4.7,total_ratings:71200}
  ];

  var REVIEWS = [
    {name:'Rahul V.',clr:'#FF8E44',text:'This song takes me back to my childhood. Lata ji\'s voice floats over the orchestra like moonlight. Absolutely timeless.',quote:'"Lag jaa gale ke phir ye haseen raat ho na ho..."',rating:5,song:'Lag Ja Gale',likes:124,time:'2 days ago'},
    {name:'Priya K.',clr:'#FF2D7B',text:'Rahman at his absolute peak. The train-top energy, the Sufi lyrics, Sukhwinder\'s raw power — nothing comes close.',quote:'"Jinke sar ho ishq ki chaaon..."',rating:5,song:'Chaiyya Chaiyya',likes:89,time:'3 days ago'},
    {name:'Arjun S.',clr:'#00C8A9',text:'Good composition and Arijit delivers, but honestly it\'s overrated compared to classic heartbreak songs.',quote:null,rating:3.5,song:'Tum Hi Ho',likes:12,time:'1 week ago'},
    {name:'Meera T.',clr:'#9B59B6',text:'A masterpiece. Hariharan and Shreya\'s chemistry is magical. I listen to this every morning.',quote:'"Munbe vaa en anbae vaa..."',rating:5,song:'Munbe Vaa',likes:256,time:'4 days ago'},
    {name:'Vivek N.',clr:'#E74C3C',text:'Energetic and fun — absolute banger. But lacks the depth of Yuvan\'s earlier work.',quote:null,rating:4,song:'Rowdy Baby',likes:45,time:'5 days ago'},
    {name:'Sneha R.',clr:'#FFC040',text:'Heartbreakingly beautiful. Arijit pours every ounce of pain into this. The lyrics are pure poetry.',quote:'"Aashiqi ka gam aata hai..."',rating:4.5,song:'Channa Mereya',likes:310,time:'1 day ago'}
  ];

  // ── Color palettes per language ──
  var PAL = {
    Hindi:[['#FF6B35','#F7C59F'],['#E63946','#F4A261'],['#D4A574','#8B5E3C'],['#FF8E44','#FF2D7B'],['#C77DFF','#7B2FF7']],
    Tamil:[['#2D6A4F','#52B788'],['#1B4332','#40916C'],['#006D77','#83C5BE'],['#0A9396','#94D2BD'],['#2B9348','#80B918']],
    Telugu:[['#7B2CBF','#C77DFF'],['#5A189A','#9D4EDD'],['#E0AAFF','#7B2CBF'],['#6930C3','#80FFDB']],
    Malayalam:[['#023E8A','#0077B6'],['#0096C7','#48CAE4'],['#00B4D8','#90E0EF'],['#03045E','#0077B6']],
    Kannada:[['#BC4749','#F2E8CF'],['#A7C957','#6A994E'],['#386641','#A7C957']],
    Bengali:[['#D4A373','#FAEDCD'],['#CDB4DB','#FFC8DD'],['#BDE0FE','#A2D2FF']]
  };
  function grad(s){var p=PAL[s.language]||PAL.Hindi;var h=0;for(var i=0;i<s.title.length;i++)h+=s.title.charCodeAt(i);var c=p[h%p.length];return'linear-gradient(135deg,'+c[0]+','+c[1]+')';}
  function mono(t){var w=t.split(' ');return w.length>=2?(w[0][0]+w[1][0]).toUpperCase():t.substring(0,2).toUpperCase();}

  // ── State ──
  var allSongs = SEEDS.slice();
  var filtered = SEEDS.slice();
  var user = null;
  var activeSong = null;
  var loggedSet = {};
  var db = null;

  // ── Try Supabase (optional — site works without it) ──
  try {
    if (window.supabase && window.supabase.createClient) {
      db = window.supabase.createClient(
        'https://jtqrwtynipzjybjvprdt.supabase.co',
        'sb_publishable_mc_C6JdZP5unk7o2fcPOvQ_c3hgzJr4'
      );
      console.log('Supabase client created');
    }
  } catch(e) { console.warn('Supabase init failed:', e); }

  // ══════════════════════════════════════════
  // MUSIC NOTES CANVAS
  // ══════════════════════════════════════════
  function startCanvas() {
    var c = document.getElementById('music-canvas');
    if (!c) return;
    var ctx = c.getContext('2d');
    var W, H;
    var notes = ['\u2669','\u266A','\u266B','\u266C','\uD834\uDD1E'];
    var particles = [];

    function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    for (var i = 0; i < 30; i++) {
      particles.push({
        x: Math.random()*W, y: Math.random()*H,
        sz: 14+Math.random()*20, spd: 0.12+Math.random()*0.3,
        drift: (Math.random()-0.5)*0.25, op: 0.03+Math.random()*0.07,
        note: notes[Math.floor(Math.random()*notes.length)],
        rot: Math.random()*6.28, rs: (Math.random()-0.5)*0.004,
        hue: [340,25,170,45,270][Math.floor(Math.random()*5)]
      });
    }

    function draw() {
      ctx.clearRect(0,0,W,H);
      for (var i=0;i<particles.length;i++) {
        var p=particles[i];
        p.y-=p.spd; p.x+=p.drift+Math.sin(p.y*0.004)*0.25; p.rot+=p.rs;
        if(p.y<-50){p.y=H+50;p.x=Math.random()*W;}
        if(p.x<-50)p.x=W+50; if(p.x>W+50)p.x=-50;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
        ctx.font=p.sz+'px serif';
        ctx.fillStyle='hsla('+p.hue+',70%,65%,'+p.op+')';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(p.note,0,0); ctx.restore();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════
  function renderAll() {
    renderScroll('trending-list', filtered.slice().sort(function(a,b){return b.total_ratings-a.total_ratings;}).slice(0,10));
    renderRanked('toprated-list', filtered.slice().sort(function(a,b){return b.avg_rating-a.avg_rating||b.total_ratings-a.total_ratings;}).slice(0,9));
    renderScroll('releases-list', filtered.slice().sort(function(a,b){return b.year-a.year;}).slice(0,10));
  }

  function renderScroll(id, songs) {
    var el = document.getElementById(id); if(!el) return;
    if(!songs.length){el.innerHTML='<div class="empty">No songs match your filters</div>';return;}
    el.innerHTML='';
    for(var i=0;i<songs.length;i++){
      (function(s){
        var d=document.createElement('div');d.className='scard';
        d.innerHTML='<span class="scard-lang">'+s.language+'</span><div class="scard-art" style="background:'+grad(s)+'">'+mono(s.title)+'</div><div class="scard-name" title="'+s.title+'">'+s.title+'</div><div class="scard-meta">'+(s.film||'Indie')+' · '+s.year+'</div><div class="scard-rating">★ '+s.avg_rating+'</div>';
        d.onclick=function(){openSong(s);};
        el.appendChild(d);
      })(songs[i]);
    }
  }

  function renderRanked(id, songs) {
    var el = document.getElementById(id); if(!el) return;
    if(!songs.length){el.innerHTML='<div class="empty">No songs match your filters</div>';return;}
    el.innerHTML='';
    for(var i=0;i<songs.length;i++){
      (function(s,idx){
        var rc=idx===0?'g':idx===1?'s':idx===2?'b':'';
        var d=document.createElement('div');d.className='rcard';
        var tags=(s.genre||[]).slice(0,2).map(function(g){return'<span class="rtag">'+g+'</span>';}).join('');
        d.innerHTML='<div class="rcard-rank '+rc+'">'+(idx+1)+'</div><div class="rcard-art" style="background:'+grad(s)+'">'+mono(s.title)+'</div><div class="rcard-info"><div class="rcard-name" title="'+s.title+'">'+s.title+'</div><div class="rcard-sub">'+s.singer+' · '+s.composer+'</div><div class="rcard-tags"><span class="rtag">'+s.language+'</span>'+tags+'</div></div><div class="rcard-score">'+s.avg_rating+'</div>';
        d.onclick=function(){openSong(s);};
        el.appendChild(d);
      })(songs[i],i);
    }
  }

  function renderReviews() {
    var el=document.getElementById('reviews-list');if(!el)return;
    var html='';
    for(var i=0;i<REVIEWS.length;i++){
      var r=REVIEWS[i];
      html+='<div class="rev"><div class="rev-top"><div class="rev-av" style="background:'+r.clr+'">'+r.name[0]+'</div><div><div class="rev-who">'+r.name+'</div><div class="rev-song">Reviewed <b>'+r.song+'</b> <span style="color:var(--gold)">★ '+r.rating+'</span> · '+r.time+'</div></div></div><p class="rev-body">'+r.text+'</p>'+(r.quote?'<div class="rev-quote">'+r.quote+'</div>':'')+'<div class="rev-foot"><button class="rev-btn" data-ri="'+i+'">♥ <span>'+r.likes+'</span></button><button class="rev-btn">Reply</button></div></div>';
    }
    el.innerHTML=html;
  }

  // ══════════════════════════════════════════
  // FILTERS
  // ══════════════════════════════════════════
  function applyFilters() {
    var q=(document.getElementById('search-input').value||'').toLowerCase().trim();
    var langEl=document.querySelector('#lang-pills .on');
    var moodEl=document.querySelector('#mood-pills .on');
    var lang=langEl?langEl.getAttribute('data-v'):'All';
    var mood=moodEl?moodEl.getAttribute('data-v'):'All';
    filtered=[];
    for(var i=0;i<allSongs.length;i++){
      var s=allSongs[i];
      var ms=!q||s.title.toLowerCase().indexOf(q)!==-1||(s.film||'').toLowerCase().indexOf(q)!==-1||(s.singer||'').toLowerCase().indexOf(q)!==-1||(s.composer||'').toLowerCase().indexOf(q)!==-1;
      var ml=lang==='All'||s.language===lang;
      var mm=mood==='All'||(s.mood&&s.mood.indexOf(mood)!==-1);
      if(ms&&ml&&mm)filtered.push(s);
    }
    renderAll();
  }

  // ══════════════════════════════════════════
  // EVENTS
  // ══════════════════════════════════════════
  function wire() {
    document.getElementById('search-input').addEventListener('input',applyFilters);

    document.getElementById('lang-pills').addEventListener('click',function(e){
      var p=e.target.closest?e.target.closest('.pill'):e.target;
      if(!p||!p.classList.contains('pill'))return;
      var cur=document.querySelector('#lang-pills .on');if(cur)cur.classList.remove('on');
      p.classList.add('on');applyFilters();
    });
    document.getElementById('mood-pills').addEventListener('click',function(e){
      var p=e.target.closest?e.target.closest('.pill'):e.target;
      if(!p||!p.classList.contains('pill'))return;
      var cur=document.querySelector('#mood-pills .on');if(cur)cur.classList.remove('on');
      p.classList.add('on');applyFilters();
    });

    document.getElementById('auth-btns').addEventListener('click',function(e){
      var b=e.target.closest?e.target.closest('button'):e.target;
      if(!b)return;
      if(b.id==='login-btn')openAuth('login');
      if(b.id==='signup-btn')openAuth('signup');
      if(b.getAttribute('data-act')==='logout'){doLogout();}
    });

    document.getElementById('cta-btn').addEventListener('click',function(){
      var t=document.getElementById('discover');if(t)t.scrollIntoView({behavior:'smooth'});
    });

    var closers=document.querySelectorAll('.modal-x');
    for(var i=0;i<closers.length;i++) closers[i].addEventListener('click',closeModals);

    var bgs=document.querySelectorAll('.modal-bg');
    for(var i=0;i<bgs.length;i++){
      (function(bg){bg.addEventListener('click',function(e){if(e.target===bg)closeModals();});})(bgs[i]);
    }

    document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModals();});

    document.querySelector('.auth-tabs').addEventListener('click',function(e){
      var t=e.target.closest?e.target.closest('.atab'):e.target;
      if(!t||!t.classList.contains('atab'))return;
      var tabs=document.querySelectorAll('.atab');for(var i=0;i<tabs.length;i++)tabs[i].classList.remove('on');
      t.classList.add('on');renderAuthForm(t.getAttribute('data-t'));
    });

    document.getElementById('reviews-list').addEventListener('click',function(e){
      var b=e.target.closest?e.target.closest('.rev-btn[data-ri]'):null;
      if(!b)return;
      var sp=b.querySelector('span');if(!sp)return;
      var liked=b.classList.toggle('liked');
      sp.textContent=parseInt(sp.textContent)+(liked?1:-1);
    });

    var navLinks=document.querySelectorAll('.nav-links a, .footer-cols a[href^="#"]');
    for(var i=0;i<navLinks.length;i++){
      (function(a){a.addEventListener('click',function(e){
        var h=a.getAttribute('href');if(!h||h.charAt(0)!=='#')return;
        e.preventDefault();var t=document.querySelector(h);if(t)t.scrollIntoView({behavior:'smooth'});
      });})(navLinks[i]);
    }
  }

  function closeModals(){
    var m=document.querySelectorAll('.modal-bg');for(var i=0;i<m.length;i++)m[i].classList.remove('on');
  }

  // ══════════════════════════════════════════
  // AUTH
  // ══════════════════════════════════════════
  function renderAuthBtns() {
    var el=document.getElementById('auth-btns');if(!el)return;
    if(user){
      var init=(user.email||'U')[0].toUpperCase();
      el.innerHTML='<div class="avatar-chip" title="'+user.email+'">'+init+'</div><button class="btn btn-ghost" data-act="logout">Log out</button>';
    } else {
      el.innerHTML='<button class="btn btn-ghost" id="login-btn">Log in</button><button class="btn btn-grd" id="signup-btn">Sign up</button>';
    }
  }

  function openAuth(tab){
    document.getElementById('auth-modal').classList.add('on');
    var tabs=document.querySelectorAll('.atab');for(var i=0;i<tabs.length;i++)tabs[i].classList.toggle('on',tabs[i].getAttribute('data-t')===tab);
    renderAuthForm(tab);
  }

  function renderAuthForm(type){
    var el=document.getElementById('auth-form');if(!el)return;
    var isL=type==='login';
    el.innerHTML=(isL?'':'<div class="fg"><label>Full Name</label><input type="text" id="af-name" placeholder="Your name"></div>')+
      '<div class="fg"><label>Email</label><input type="email" id="af-email" placeholder="you@example.com"></div>'+
      '<div class="fg"><label>Password</label><input type="password" id="af-pwd" placeholder="'+(isL?'••••••••':'Create a password')+'"></div>'+
      '<div class="auth-btns"><button class="btn btn-grd btn-lg" style="width:100%;justify-content:center" id="af-submit">'+(isL?'Log In':'Create Account')+'</button><div class="auth-or">or</div><button class="btn-google" id="af-google"><svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Continue with Google</button></div>';
    document.getElementById('af-submit').addEventListener('click',function(){doEmailAuth(type);});
    document.getElementById('af-google').addEventListener('click',doGoogleAuth);
    var inputs=el.querySelectorAll('input');for(var i=0;i<inputs.length;i++)inputs[i].addEventListener('keydown',function(e){if(e.key==='Enter')doEmailAuth(type);});
  }

  function doEmailAuth(action){
    var email=document.getElementById('af-email').value;
    var pwd=document.getElementById('af-pwd').value;
    if(!email||!pwd){toast('Please fill all fields');return;}
    if(!db){toast('Demo mode — connect Supabase to enable auth');closeModals();return;}
    var nameEl=document.getElementById('af-name');
    if(action==='signup'){
      db.auth.signUp({email:email,password:pwd,options:{data:{display_name:nameEl?nameEl.value:''}}}).then(function(r){
        if(r.error){toast(r.error.message);}else{toast('Account created!');closeModals();}
      });
    } else {
      db.auth.signInWithPassword({email:email,password:pwd}).then(function(r){
        if(r.error){toast(r.error.message);}else{toast('Logged in!');closeModals();}
      });
    }
  }

  function doGoogleAuth(){
    if(!db){toast('Demo mode');return;}
    db.auth.signInWithOAuth({provider:'google'});
  }

  function doLogout(){
    if(db)db.auth.signOut();
    user=null;renderAuthBtns();toast('Logged out');
  }

  // ══════════════════════════════════════════
  // SONG MODAL
  // ══════════════════════════════════════════
  function openSong(song){
    activeSong=song;
    document.getElementById('song-modal').classList.add('on');
    var hero=document.getElementById('sm-hero');
    hero.style.background=grad(song);
    hero.innerHTML='<div class="sm-art" style="background:'+grad(song)+'">'+mono(song.title)+'</div>';
    var isL=!!loggedSet[song.id];
    var body=document.getElementById('sm-body');
    body.innerHTML='<div class="sm-head"><div class="sm-title">'+song.title+'</div><div class="sm-sub">'+(song.film||'Independent')+' · '+song.year+' · '+(song.industry||'')+'</div></div>'+
      '<div class="sm-rating-band"><div class="sm-rating-left"><div class="sm-big">'+song.avg_rating+'</div><div><div class="sm-stars-display">★★★★★</div><div class="sm-votes">'+(song.total_ratings||0).toLocaleString()+' ratings</div></div></div><div class="sm-istars" id="istars"><span data-v="1">★</span><span data-v="2">★</span><span data-v="3">★</span><span data-v="4">★</span><span data-v="5">★</span></div></div>'+
      '<div class="sm-grid"><div class="sm-gi"><span class="sm-gl">Singer</span><span class="sm-gv">'+(song.singer||'-')+'</span></div><div class="sm-gi"><span class="sm-gl">Composer</span><span class="sm-gv">'+(song.composer||'-')+'</span></div><div class="sm-gi"><span class="sm-gl">Lyricist</span><span class="sm-gv">'+(song.lyricist||'-')+'</span></div><div class="sm-gi"><span class="sm-gl">Language</span><span class="sm-gv">'+song.language+'</span></div><div class="sm-gi"><span class="sm-gl">Genres</span><span class="sm-gv">'+((song.genre||[]).join(', ')||'-')+'</span></div><div class="sm-gi"><span class="sm-gl">Moods</span><span class="sm-gv">'+((song.mood||[]).join(', ')||'-')+'</span></div>'+(song.raga?'<div class="sm-gi"><span class="sm-gl">Raga</span><span class="sm-gv">'+song.raga+'</span></div>':'')+'</div>'+
      '<div class="sm-stream"><div class="sm-sp">Spotify</div><div class="sm-sp">YouTube</div><div class="sm-sp">JioSaavn</div><div class="sm-sp">Apple Music</div></div>'+
      '<div class="sm-actions"><button class="sm-abtn'+(isL?' logged':'')+'" id="sm-log">'+(isL?'✓ Logged':'+ Log It')+'</button><button class="sm-abtn" id="sm-list">Add to List</button><button class="sm-abtn" id="sm-share">Share</button></div>';

    // Stars
    var stars=body.querySelectorAll('#istars span');
    var istarsEl=body.querySelector('#istars');
    for(var i=0;i<stars.length;i++){
      (function(sp){
        sp.addEventListener('mouseenter',function(){var v=parseInt(sp.getAttribute('data-v'));for(var j=0;j<stars.length;j++)stars[j].classList.toggle('lit',parseInt(stars[j].getAttribute('data-v'))<=v);});
        sp.addEventListener('click',function(){doRate(parseInt(sp.getAttribute('data-v')));});
      })(stars[i]);
    }
    if(istarsEl)istarsEl.addEventListener('mouseleave',function(){for(var j=0;j<stars.length;j++)stars[j].classList.remove('lit');});

    document.getElementById('sm-log').addEventListener('click',doLog);
    document.getElementById('sm-share').addEventListener('click',function(){
      var txt='♪ '+song.title+' from '+(song.film||'Indie')+' ('+song.year+') — '+song.avg_rating+'★ on Rasiga';
      if(navigator.share)navigator.share({title:'Rasiga',text:txt});else if(navigator.clipboard){navigator.clipboard.writeText(txt);toast('Copied to clipboard!');}
    });
    document.getElementById('sm-list').addEventListener('click',function(){toast('Lists feature coming soon!');});
  }

  function doRate(score){
    if(!user){if(db)openAuth('login');toast('Log in to rate songs');return;}
    if(!db||!activeSong)return;
    db.from('ratings').upsert({user_id:user.id,song_id:activeSong.id,score:score},{onConflict:'user_id,song_id'}).then(function(r){
      if(r.error)toast(r.error.message);else toast('Rated '+score+'★');
    });
  }

  function doLog(){
    if(!activeSong)return;
    var btn=document.getElementById('sm-log');
    if(loggedSet[activeSong.id]){delete loggedSet[activeSong.id];btn.textContent='+ Log It';btn.classList.remove('logged');toast('Removed from diary');return;}
    loggedSet[activeSong.id]=true;btn.textContent='✓ Logged';btn.classList.add('logged');toast('Logged to diary!');
  }

  // ── Toast ──
  function toast(msg){
    var t=document.createElement('div');t.className='toast';t.textContent=msg;
    document.getElementById('toasts').appendChild(t);setTimeout(function(){t.remove();},3200);
  }

  // ══════════════════════════════════════════
  // BOOT — runs immediately, no async needed
  // ══════════════════════════════════════════
  startCanvas();
  renderAll();      // ← 22 songs render INSTANTLY
  renderReviews();
  wire();

  // Try upgrading with Supabase data (optional, in background)
  if (db) {
    db.from('songs').select('*').order('avg_rating',{ascending:false}).limit(50).then(function(result) {
      if (!result.error && result.data && result.data.length > 0) {
        allSongs = result.data;
        filtered = allSongs.slice();
        renderAll();
        console.log('Upgraded with ' + result.data.length + ' songs from Supabase');
      }
    }).catch(function(e) { console.warn('Supabase fetch skipped:', e); });

    db.auth.onAuthStateChange(function(event, session) {
      user = session ? session.user : null;
      renderAuthBtns();
    });
  }

  console.log('Rasiga loaded — ' + allSongs.length + ' songs ready');

})();
