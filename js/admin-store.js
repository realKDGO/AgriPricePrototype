
const AgriAdminStore = (() => {
 const KEYS = {
 CROPS:'agri_admin_crops',
 MARKETS:'agri_admin_markets',
 PRICES:'agri_admin_prices',
 USERS:'agri_admin_users',
 ACTIVITY:'agri_admin_activity',
 PROFILE:'agri_admin_profile',
 MAO_PROFILE:'agri_mao_profile',
 MAO_ACCOUNTS:'agri_mao_accounts',
 STORE_VERSION:'agri_management_store_version'
 };

 const read = (key, fallback) => {
 try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
 catch(e){ return fallback; }
 };
 const write = (key, value) => {
 try { localStorage.setItem(key, JSON.stringify(value)); return true; }
 catch(e){ return false; }
 };

 function seed(){
 if(!localStorage.getItem(KEYS.CROPS)){
 write(KEYS.CROPS, AgriData.CROPS.map((c,i)=>({
 ...c, category: ['Grain','Vegetable','Vegetable','Vegetable','Grain','Vegetable','Spice','Fruit'][i],
 description:`${c.name} market commodity monitored in Rizal Province.`,
 status:'Active', dateAdded:`2026-0${(i%7)+1}-${String((i*3)%25+1).padStart(2,'0')}`
 })));
 }
 if(!localStorage.getItem(KEYS.MARKETS)){
 const municipalities=['Antipolo City','Cainta','Binangonan','Taytay','Angono','Rodriguez','Teresa'];
 write(KEYS.MARKETS, AgriData.MARKETS.map((m,i)=>({
 id:m.id, name:m.name, municipality:municipalities[i], location:`${municipalities[i]}, Rizal`,
 status:'Active'
 })));
 }
 if(!localStorage.getItem(KEYS.PRICES)){
 const rows = AgriData.CROP_PRICES.slice(0,20).map((r,i)=>({
 id:`p${i+1}`, cropId:r.cropId, crop:r.crop, marketId:r.marketId,
 market:AgriData.findMarketById(r.marketId)?.name || r.market,
 price:r.price, date:`2026-08-${String(24-(i%6)).padStart(2,'0')}`,
 status:i===7?'Corrected':'Current'
 }));
 write(KEYS.PRICES, rows);
 }
 if(!localStorage.getItem(KEYS.USERS)){
 write(KEYS.USERS, [
 {id:'u1',name:'Juan Dela Cruz',email:'juan.delacruz@example.com',municipality:'Teresa',role:'FARMER',status:'Active',registered:'2026-07-14'},
 {id:'u2',name:'King Obrero',email:'king.obrero@example.com',municipality:'Tanay',role:'FARMER',status:'Active',registered:'2026-07-19'},
 {id:'u3',name:'Aljay Reyes',email:'aljay.reyes@example.com',municipality:'Antipolo City',role:'FARMER',status:'Active',registered:'2026-07-25'},
 {id:'u4',name:'Carlo Mendoza',email:'carlo.m@example.com',municipality:'Rodriguez',role:'FARMER',status:'Inactive',registered:'2026-08-02'},
 {id:'u5',name:'Ana Villanueva',email:'ana.v@example.com',municipality:'Taytay',role:'FARMER',status:'Active',registered:'2026-08-08'},
 {id:'u6',name:'Admin User',email:'admin@agriprice.ph',municipality:'Rizal Province',role:'ADMIN',status:'Active',registered:'2026-06-20'}
 ]);
 }
 if(!localStorage.getItem(KEYS.ACTIVITY)){
 write(KEYS.ACTIVITY, [
 {icon:'fa-tags',title:'Rice price updated',detail:'Teresa Public Market • ₱49/kg',time:'10 min ago'},
 {icon:'fa-seedling',title:'Crop record edited',detail:'Tomato category information',time:'42 min ago'},
 {icon:'fa-store',title:'Market activated',detail:'Taytay Public Market',time:'2 hrs ago'},
 {icon:'fa-user-check',title:'Farmer account activated',detail:'Ana Villanueva',time:'Yesterday'}
 ]);
 }
 if(!localStorage.getItem(KEYS.PROFILE)){
 write(KEYS.PROFILE,{firstName:'Admin',lastName:'User',email:'admin@agriprice.ph'});
 }
 if(!localStorage.getItem(KEYS.MAO_PROFILE)){
 write(KEYS.MAO_PROFILE,{
 firstName:'King',lastName:'Obrero',email:'king.obrero@mao-rizal.ph',
 position:'Agricultural Technologist',office:'Municipal Agriculture Office - Teresa',
 municipality:'Teresa'
 });
 }
 if(!localStorage.getItem(KEYS.MAO_ACCOUNTS)){
 write(KEYS.MAO_ACCOUNTS,[
 {id:'mao1',name:'King Obrero',email:'king.obrero@mao-rizal.ph',office:'MAO - Teresa',position:'Agricultural Technologist',status:'Active',registered:'2026-08-12'},
 {id:'mao2',name:'Aljay Tibay',email:'aljay.tibay@mao-rizal.ph',office:'MAO - Tanay',position:'Agriculture Officer',status:'Active',registered:'2026-08-15'},
 {id:'mao3',name:'Cherry Magno',email:'cherry.magno@mao-rizal.ph',office:'MAO - Rodriguez',position:'Agricultural Technologist',status:'Inactive',registered:'2026-08-18'}
 ]);
 }

 // One-time migration for the three-role . Existing browser data
 // is preserved, but price records gain validation-friendly statuses.
 if(read(KEYS.STORE_VERSION,0) < 3){
 let prices=read(KEYS.PRICES,[]);
 prices=prices.map((p,i)=>({
 ...p,
 status: p.status==='Returned for Correction' ? p.status :
 p.status==='Pending' ? p.status :
 p.status==='Approved' ? p.status :
 (i%9===2 ? 'Pending' : i%13===5 ? 'Returned for Correction' : 'Approved'),
 submittedBy:p.submittedBy || (i%4===0?'MAO - Teresa':'System Sample')
 }));
 if(!prices.some(p=>p.status==='Pending')){
 prices.unshift({
 id:'validation-sample-1',cropId:'rice',crop:'Rice',marketId:'teresa',
 market:'Teresa Public Market',price:50,date:'2026-08-29',
 status:'Pending',submittedBy:'MAO - Teresa'
 });
 }
 write(KEYS.PRICES,prices);
 write(KEYS.STORE_VERSION,3);
 }
 }

 function log(title, detail, icon='fa-circle-info'){
 const list=read(KEYS.ACTIVITY,[]);
 list.unshift({icon,title,detail,time:'Just now'});
 write(KEYS.ACTIVITY,list.slice(0,12));
 }

 seed();
 return {
 KEYS, read, write, log,
 getCrops:()=>read(KEYS.CROPS,[]), saveCrops:v=>write(KEYS.CROPS,v),
 getMarkets:()=>read(KEYS.MARKETS,[]), saveMarkets:v=>write(KEYS.MARKETS,v),
 getPrices:()=>read(KEYS.PRICES,[]), savePrices:v=>write(KEYS.PRICES,v),
 getUsers:()=>read(KEYS.USERS,[]), saveUsers:v=>write(KEYS.USERS,v),
 getActivity:()=>read(KEYS.ACTIVITY,[]),
 getProfile:()=>read(KEYS.PROFILE,{}), saveProfile:v=>write(KEYS.PROFILE,v),
 getMaoProfile:()=>read(KEYS.MAO_PROFILE,{}), saveMaoProfile:v=>write(KEYS.MAO_PROFILE,v),
 getMaoAccounts:()=>read(KEYS.MAO_ACCOUNTS,[]), saveMaoAccounts:v=>write(KEYS.MAO_ACCOUNTS,v)
 };
})();
