/* ==========================================================================
 AgriPrice — data.js
 Realistic dummy datasets for Rizal Province crops & markets.
 ========================================================================== */

const AgriData = (() => {

 const CROPS = [
 { id:'rice', name:'Rice', unit:'kg', icon:'fa-wheat-awn', image:'images/rice.jpg' },
 { id:'tomato', name:'Tomato', unit:'kg', icon:'fa-apple-whole', image:'images/tomato.jpg' },
 { id:'eggplant', name:'Eggplant', unit:'kg', icon:'fa-carrot', image:'images/eggplant.jpg' },
 { id:'onion', name:'Onion', unit:'kg', icon:'fa-seedling', image:'images/Onion.jpg' },
 { id:'corn', name:'Corn', unit:'kg', icon:'fa-wheat-awn', image:'images/Corn.jpg' },
 { id:'cabbage', name:'Cabbage', unit:'kg', icon:'fa-leaf', image:'images/Cabbage.jpg' },
 { id:'garlic', name:'Garlic', unit:'kg', icon:'fa-seedling', image:'images/Garlic.jpg' },
 { id:'banana', name:'Banana', unit:'kg', icon:'fa-apple-whole', image:'images/Banana.jpg' }
 ];

 const MARKETS = [
 { id:'antipolo', name:'Antipolo Public Market', distanceKm:12, transportCost:180 },
 { id:'cainta', name:'Cainta Public Market', distanceKm:9, transportCost:150 },
 { id:'binangonan', name:'Binangonan Public Market', distanceKm:18, transportCost:240 },
 { id:'taytay', name:'Taytay Public Market', distanceKm:14, transportCost:200 },
 { id:'angono', name:'Angono Public Market', distanceKm:16, transportCost:220 },
 { id:'rodriguez', name:'Rodriguez (Montalban) Market', distanceKm:22, transportCost:280 },
 { id:'teresa', name:'Teresa Public Market', distanceKm:20, transportCost:260 }
 ];

 // Shared price dataset. Every page uses this same crop/market source
 // so Market Recommendation and Profit Estimation never disagree.
 const BASE_CROP_PRICES = {
 rice:45, tomato:65, eggplant:58, onion:90,
 corn:37, cabbage:52, garlic:130, banana:48
 };
 const MARKET_PRICE_ADJUSTMENTS = {
 antipolo:0, cainta:2, binangonan:-2, taytay:3,
 angono:-1, rodriguez:1, teresa:4
 };
 const MARKET_SHORT_NAMES = {
 antipolo:'Antipolo', cainta:'Cainta', binangonan:'Binangonan', taytay:'Taytay',
 angono:'Angono', rodriguez:'Rodriguez', teresa:'Teresa'
 };

 const CROP_PRICES = CROPS.flatMap((crop, cropIndex) =>
 MARKETS.map((market, marketIndex) => {
 const price = BASE_CROP_PRICES[crop.id] + MARKET_PRICE_ADJUSTMENTS[market.id];
 const rawChange = ((cropIndex * 3 + marketIndex * 2) % 13) - 6;
 const change = Math.round(rawChange * 0.7 * 10) / 10;
 const trend = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable';
 return {
 crop: crop.name,
 cropId: crop.id,
 market: MARKET_SHORT_NAMES[market.id],
 marketId: market.id,
 price,
 change,
 trend
 };
 })
 );

 // Generate ~60 rows of historical price data across the last 60 days
 function generateHistorical(){
 const rows = [];
 const today = new Date();
 for(let i = 0; i < 60; i++){
 const d = new Date(today);
 d.setDate(d.getDate() - i);
 const crop = CROPS[i % CROPS.length];
 const market = MARKETS[(i + 2) % MARKETS.length];
 const base = BASE_CROP_PRICES[crop.id] || 50;
 const price = Math.round((base + (Math.sin(i / 3) * 6) + (Math.random() * 6 - 3)) * 100) / 100;
 rows.push({
 date: d.toISOString().slice(0,10),
 crop: crop.name,
 market: market.name,
 price: Math.max(price, 10)
 });
 }
 return rows;
 }
 const HISTORICAL_PRICES = generateHistorical();

 // Recent updates for dashboard feed
 const RECENT_UPDATES = [
 { text:'Onion prices rose 6.8% in Taytay Public Market', time:'2 hours ago', tone:'up' },
 { text:'Tomato prices dropped 4.1% in Cainta Public Market', time:'5 hours ago', tone:'down' },
 { text:'New forecast available for Rice — 3 Month outlook', time:'Yesterday', tone:'info' },
 { text:'Garlic prices climbed 3.2% across Rizal markets', time:'2 days ago', tone:'up' },
 { text:'Eggplant prices stable in Binangonan Public Market', time:'3 days ago', tone:'stable' }
 ];

 const NOTIFICATIONS = [
 { id:'n1', title:'New crop price update', description:'Rice prices climbed in Antipolo Public Market this morning.', time:'10 min ago', date:'Today, 8:45 AM', unread:true, icon:'fa-circle-dollar-to-slot', tone:'up' },
 { id:'n2', title:'Forecast completed', description:'Your 1 Month outlook for Tomato is ready and synced to the dashboard.', time:'1 hour ago', date:'Today, 7:20 AM', unread:true, icon:'fa-chart-line', tone:'info' },
 { id:'n3', title:'Market recommendation updated', description:'Cainta is now the strongest market for your shortlisted crops.', time:'3 hours ago', date:'Today, 4:35 AM', unread:false, icon:'fa-compass', tone:'up' },
 { id:'n4', title:'Historical price records added', description:'New weekly records for Garlic and Onion were added to the archive.', time:'Yesterday', date:'Yesterday, 6:10 PM', unread:false, icon:'fa-clock-rotate-left', tone:'stable' },
 { id:'n5', title:'System announcement', description:'The latest dashboard refresh includes improved forecast visuals and notification routing.', time:'Yesterday', date:'Yesterday, 11:30 AM', unread:false, icon:'fa-bell', tone:'info' }
 ];

 // Dummy market insight explanations, keyed by crop id — used on the
 // Home page Insight Card to explain the Featured Crop's price movement.
 const INSIGHTS = {
 rice: 'Rice prices are trending up as regional millers report tighter palay stocks ahead of the lean season. Demand from local wet markets has also picked up this week.',
 tomato: 'Tomato supply from nearby farms has increased following favorable weather, easing prices at major Rizal markets. Traders expect prices to stabilize over the next few weeks.',
 eggplant: 'Eggplant prices are holding steady as supply and demand remain balanced across Rizal Province markets this season.',
 onion: 'Onion prices continue to climb due to limited fresh harvest volume and steady household demand heading into the holidays. Traders are sourcing more from Nueva Ecija to offset the shortage.',
 corn: 'Corn prices dipped slightly this week as harvest season brought in higher supply volumes across Angono and nearby towns.',
 cabbage: 'Cabbage prices are rising modestly on the back of cooler weather boosting demand for leafy vegetables in local markets.',
 garlic: 'Garlic prices remain elevated due to continued reliance on imported stock and limited local harvest volume this quarter.',
 banana: 'Banana prices are stable this week, supported by consistent supply from Rizal\'s banana-growing municipalities.'
 };

 // Analytics summary (dummy)
 const ANALYTICS = {
 highest: { crop:'Garlic', market:'Teresa', price:130 },
 lowest: { crop:'Corn', market:'Angono', price:37 },
 average: 68.4,
 mostSold: 'Rice',
 monthlyTrend: [58,61,60,63,65,64,66,68,67,70,69,71]
 };

 // ---------- Lookup helpers ----------
 // CROP_PRICES stores short market names (e.g. "Antipolo"); MARKETS stores
 // full names + ids (e.g. "antipolo" / "Antipolo Public Market").
 function findMarketByShortName(shortName){
 return MARKETS.find(m => m.id === shortName.toLowerCase() || m.name.startsWith(shortName)) || null;
 }
 function findMarketById(id){
 return MARKETS.find(m => m.id === id) || null;
 }
 function findCropById(id){
 return CROPS.find(c => c.id === id) || null;
 }
 function findCropByName(name){
 return CROPS.find(c => c.name.toLowerCase() === String(name).toLowerCase()) || null;
 }
 function getCropImage(cropOrName){
 const crop = typeof cropOrName === 'string' ? findCropByName(cropOrName) || findCropById(cropOrName) : cropOrName;
 return crop?.image || 'images/logo.png';
 }

 function getCropMarketPrice(cropId, marketId){
 const row = CROP_PRICES.find(r => r.cropId === cropId && r.marketId === marketId);
 return row ? row.price : 0;
 }

 function getTransportCost(marketId, qty = 100){
 const market = findMarketById(marketId);
 if(!market) return 0;
 const quantity = Math.max(Number(qty) || 0, 1);
 // transportCost is the sample cost for 100 kg; scale moderately for larger loads
 const loadFactor = 0.65 + (quantity / 100) * 0.35;
 return Math.round(market.transportCost * loadFactor * 100) / 100;
 }

 function getMarketOptions(cropId, qty){
 const quantity = Math.max(Number(qty) || 1, 1);
 return MARKETS.map(market => {
 const price = getCropMarketPrice(cropId, market.id);
 const transport = getTransportCost(market.id, quantity);
 const gross = price * quantity;
 const netBeforeOtherExpenses = gross - transport;
 const margin = gross > 0 ? (netBeforeOtherExpenses / gross) * 100 : 0;
 const score = netBeforeOtherExpenses - (market.distanceKm * 2);
 return { market, price, transport, gross, profit:netBeforeOtherExpenses, margin, score };
 }).sort((a,b) => b.score - a.score);
 }

 // ---------- Featured Crop: highest price increase right now ----------
 function getFeaturedCropUpdate(){
 const top = [...CROP_PRICES].filter(r => r.trend === 'up').sort((a,b) => b.change - a.change)[0];
 if(!top) return null;
 const oldPrice = top.price / (1 + top.change / 100);
 const crop = findCropByName(top.crop);
 const market = findMarketByShortName(top.market);
 return {
 crop, cropName: top.crop, market: market ? market.name : top.market,
 oldPrice, newPrice: top.price, pctChange: top.change
 };
 }

 // ---------- Best Market Today: most crops with rising prices ----------
 function getBestMarketToday(){
 const counts = {};
 CROP_PRICES.forEach(r => {
 if(r.trend !== 'up') return;
 counts[r.market] = counts[r.market] || { shortName:r.market, crops:[], count:0 };
 counts[r.market].crops.push(r.crop);
 counts[r.market].count++;
 });
 const ranked = Object.values(counts).sort((a,b) => b.count - a.count);
 if(!ranked.length) return null;
 const best = ranked[0];
 const market = findMarketByShortName(best.shortName);
 return {
 market, marketName: market ? market.name : best.shortName,
 marketId: market ? market.id : null,
 cropsIncreased: best.count, crops: best.crops,
 distanceKm: market ? market.distanceKm : 0,
 transportCost: market ? market.transportCost : 0
 };
 }

 // ---------- Crops with rising prices in a given market (for market-recommendation deep link) ----------
 function getRisingCropsForMarket(marketId){
 const market = findMarketById(marketId);
 if(!market) return [];
 return CROP_PRICES.filter(r => r.trend === 'up' && findMarketByShortName(r.market)?.id === marketId);
 }

 // ---------- Forecast series for shared dashboard + forecasting charts ----------
 function getForecastSeries(cropId, months = 1){
 const crop = findCropById(cropId);
 const base = BASE_CROP_PRICES[cropId] || 50;
 const historyPoints = 8;
 const futurePoints = months * 4;
 const biasPool = ['up', 'down', 'stable'];
 const hash = Array.from(cropId || '').reduce((sum, ch, index) => sum + ch.charCodeAt(0) * (index + 1), 0);
 const bias = biasPool[(hash + months) % biasPool.length];
 const biasStep = bias === 'up' ? 0.7 + months * 0.08 : bias === 'down' ? -(0.6 + months * 0.08) : 0.08;

 const history = [];
 let price = base - (biasStep > 0 ? biasStep * 2 : Math.abs(biasStep) * 1.8);
 for(let i = 0; i < historyPoints; i++){
 price += (i % 2 === 0 ? 0.9 : -0.7) + ((hash + i) % 3 - 1) * 0.35;
 history.push(Math.max(price, 8));
 }

 const forecast = [];
 let fPrice = history[history.length - 1];
 for(let i = 0; i < futurePoints; i++){
 fPrice += biasStep + ((i % 3) - 1) * 0.35;
 forecast.push(Math.max(fPrice, 8));
 }

 const predicted = forecast[forecast.length - 1];
 const pctChange = ((predicted - base) / base) * 100;
 const trend = pctChange > 2 ? 'Increasing' : pctChange < -2 ? 'Decreasing' : 'Stable';
 const confidence = 80 + months * 2 + (hash % 5) * 2;
 const labels = [];
 for(let i = historyPoints; i > 0; i--) labels.push(`W-${i}`);
 for(let i = 1; i <= futurePoints; i++) labels.push(`W+${i}`);

 return { crop, base, history, forecast, predicted, pctChange, trend, confidence, labels, historyPoints };
 }

 // ---------- Insight text for a given crop id ----------
 function getInsightForCrop(cropId){
 return INSIGHTS[cropId] || 'Prices are being monitored closely across Rizal Province markets this week.';
 }

 function getNotifications(){
 return NOTIFICATIONS;
 }

 return {
 CROPS, MARKETS, CROP_PRICES, HISTORICAL_PRICES, RECENT_UPDATES, NOTIFICATIONS, ANALYTICS, INSIGHTS,
 findMarketByShortName, findMarketById, findCropById, findCropByName, getCropImage,
 getCropMarketPrice, getTransportCost, getMarketOptions,
 getFeaturedCropUpdate, getBestMarketToday, getRisingCropsForMarket, getInsightForCrop,
 getForecastSeries, getNotifications
 };
})();
