/* ==========================================================================
   AgriPrice — dashboard.js
   Populates the Dashboard (Home) page: Featured Crop Update, Market
   Insight, Best Market Today, summary cards, prices & activity feed.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  AgriLayout.init('dashboard.html', 'Dashboard');

  const session = AgriStore.getSession();
  const welcomeEl = document.getElementById('welcomeName');
  if(welcomeEl && session) welcomeEl.textContent = session.firstName;

  // ---------- Featured Crop Update Card ----------
  const featured = AgriData.getFeaturedCropUpdate();
  if(featured){
    const cropImage = AgriData.getCropImage(featured.crop?.id || featured.cropName);
    document.getElementById('fcCropIcon').innerHTML = `<img src="${cropImage}" alt="${featured.cropName} crop image" onerror="this.onerror=null;this.src='images/logo.png';">`;
    document.getElementById('fcCropName').textContent = featured.cropName;
    document.getElementById('fcMarketName').textContent = featured.market;
    document.getElementById('fcNewPrice').textContent = AgriUtils.pesoRound(featured.newPrice) + '/kg';
    document.getElementById('fcPctChange').textContent = `+${featured.pctChange.toFixed(1)}%`;

    const forecastSeries = AgriData.getForecastSeries(featured.crop?.id || 'rice', 1);
    const points = [...forecastSeries.history, ...forecastSeries.forecast];
    AgriCharts.sparkline(document.getElementById('fcSparkline'), points, AgriCharts.palette.leaf);

    // Deep link to Forecasting with this crop pre-selected & auto-generated
    const forecastHref = featured.crop ? `forecasting.html?crop=${featured.crop.id}` : 'forecasting.html';
    document.getElementById('fcViewForecastBtn').href = forecastHref;

    // Insight Card — tied to the same featured crop
    document.getElementById('insightText').textContent = AgriData.getInsightForCrop(featured.crop?.id);
    document.getElementById('insightLearnMoreBtn').href = featured.crop
      ? `forecasting.html?crop=${featured.crop.id}&insights=1`
      : 'forecasting.html';
  }

  // ---------- Best Market Today Card ----------
  const bestMarket = AgriData.getBestMarketToday();
  if(bestMarket){
    document.getElementById('mtMarketName').textContent = bestMarket.marketName;
    document.getElementById('mtCropsIncreased').textContent = `${bestMarket.cropsIncreased} Crop${bestMarket.cropsIncreased === 1 ? '' : 's'}`;
    document.getElementById('mtDistance').textContent = `${bestMarket.distanceKm} km`;
    document.getElementById('mtTransport').textContent = AgriUtils.pesoRound(bestMarket.transportCost);
    document.getElementById('mtViewMarketBtn').href = bestMarket.marketId
      ? `market-recommendation.html?market=${bestMarket.marketId}`
      : 'market-recommendation.html';
  }
});
