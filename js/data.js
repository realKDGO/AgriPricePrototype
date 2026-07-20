/* ==========================================================================
   AgriPrice — data.js
   Realistic dummy datasets for Rizal Province crops & markets.
   ========================================================================== */

const AgriData = (() => {

  const CROPS = [
    { id:'rice',     name:'Rice',      unit:'kg', icon:'fa-wheat-awn', image:'images/rice.jpg' },
    { id:'tomato',   name:'Tomato',    unit:'kg', icon:'fa-apple-whole', image:'images/tomato.jpg' },
    { id:'eggplant', name:'Eggplant',  unit:'kg', icon:'fa-carrot', image:'images/eggplant.jpg' },
    { id:'onion',    name:'Onion',     unit:'kg', icon:'fa-seedling', image:'images/Onion.jpg' },
    { id:'corn',     name:'Corn',      unit:'kg', icon:'fa-wheat-awn', image:'images/Corn.jpg' },
    { id:'cabbage',  name:'Cabbage',   unit:'kg', icon:'fa-leaf', image:'images/Cabbage.jpg' },
    { id:'garlic',   name:'Garlic',    unit:'kg', icon:'fa-seedling', image:'images/Garlic.jpg' },
    { id:'banana',   name:'Banana',    unit:'kg', icon:'fa-apple-whole', image:'images/Banana.jpg' }
  ];

  const MARKETS = [
    { id:'antipolo',    name:'Antipolo Public Market',          distanceKm:12, transportCost:180 },
    { id:'cainta',      name:'Cainta Public Market',             distanceKm:9,  transportCost:150 },
    { id:'binangonan',  name:'Binangonan Public Market',         distanceKm:18, transportCost:240 },
    { id:'taytay',      name:'Taytay Public Market',             distanceKm:14, transportCost:200 },
    { id:'angono',      name:'Angono Public Market',             distanceKm:16, transportCost:220 },
    { id:'rodriguez',   name:'Rodriguez (Montalban) Market',     distanceKm:22, transportCost:280 },
    { id:'teresa',      name:'Teresa Public Market',             distanceKm:20, transportCost:260 }
  ];

  // Current crop prices (base dataset used throughout the app)
  const CROP_PRICES = [
    { crop:'Rice',     market:'Antipolo',   price:45, change:2.3,  trend:'up' },
    { crop:'Tomato',   market:'Cainta',     price:65, change:-4.1, trend:'down' },
    { crop:'Eggplant', market:'Binangonan', price:58, change:0.0,  trend:'stable' },
    { crop:'Onion',    market:'Taytay',     price:90, change:6.8,  trend:'up' },
    { crop:'Corn',     market:'Angono',     price:37, change:-1.2, trend:'down' },
    { crop:'Cabbage',  market:'Rodriguez',  price:52, change:1.5,  trend:'up' },
    { crop:'Garlic',   market:'Teresa',     price:130,change:3.2,  trend:'up' },
    { crop:'Banana',   market:'Antipolo',   price:48, change:0.0,  trend:'stable' },
    { crop:'Rice',     market:'Taytay',     price:47, change:1.1,  trend:'up' },
    { crop:'Tomato',   market:'Angono',     price:60, change:-2.0, trend:'down' },
    { crop:'Onion',    market:'Binangonan', price:87, change:5.0,  trend:'up' },
    { crop:'Corn',     market:'Cainta',     price:39, change:2.6,  trend:'up' },
    { crop:'Eggplant', market:'Teresa',     price:55, change:-0.9, trend:'down' },
    { crop:'Garlic',   market:'Rodriguez',  price:126,change:-1.6, trend:'down' },
    { crop:'Cabbage',  market:'Antipolo',   price:54, change:0.0,  trend:'stable' }
  ];

  // Generate ~60 rows of historical price data across the last 60 days
  function generateHistorical(){
    const rows = [];
    const today = new Date();
    for(let i = 0; i < 60; i++){
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const crop = CROPS[i % CROPS.length];
      const market = MARKETS[(i + 2) % MARKETS.length];
      const base = { rice:44, tomato:62, eggplant:56, onion:85, corn:36, cabbage:50, garlic:125, banana:46 }[crop.id] || 50;
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

  // Dummy market insight explanations, keyed by crop id — used on the
  // Home page Insight Card to explain the Featured Crop's price movement.
  const INSIGHTS = {
    rice:      'Rice prices are trending up as regional millers report tighter palay stocks ahead of the lean season. Demand from local wet markets has also picked up this week.',
    tomato:    'Tomato supply from nearby farms has increased following favorable weather, easing prices at major Rizal markets. Traders expect prices to stabilize over the next few weeks.',
    eggplant:  'Eggplant prices are holding steady as supply and demand remain balanced across Rizal Province markets this season.',
    onion:     'Onion prices continue to climb due to limited fresh harvest volume and steady household demand heading into the holidays. Traders are sourcing more from Nueva Ecija to offset the shortage.',
    corn:      'Corn prices dipped slightly this week as harvest season brought in higher supply volumes across Angono and nearby towns.',
    cabbage:   'Cabbage prices are rising modestly on the back of cooler weather boosting demand for leafy vegetables in local markets.',
    garlic:    'Garlic prices remain elevated due to continued reliance on imported stock and limited local harvest volume this quarter.',
    banana:    'Banana prices are stable this week, supported by consistent supply from Rizal\'s banana-growing municipalities.'
  };

  // Analytics summary (dummy)
  const ANALYTICS = {
    highest: { crop:'Garlic', market:'Teresa', price:130 },
    lowest:  { crop:'Corn', market:'Angono', price:37 },
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

  // ---------- Insight text for a given crop id ----------
  function getInsightForCrop(cropId){
    return INSIGHTS[cropId] || 'Prices are being monitored closely across Rizal Province markets this week.';
  }

  return {
    CROPS, MARKETS, CROP_PRICES, HISTORICAL_PRICES, RECENT_UPDATES, ANALYTICS, INSIGHTS,
    findMarketByShortName, findMarketById, findCropById, findCropByName, getCropImage,
    getFeaturedCropUpdate, getBestMarketToday, getRisingCropsForMarket, getInsightForCrop
  };
})();
