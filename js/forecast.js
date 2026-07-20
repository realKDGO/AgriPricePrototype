/* ==========================================================================
   AgriPrice — forecast.js
   Simulated (dummy) forecasting engine — no real ML, just believable trends.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  AgriLayout.init('forecasting.html', 'Forecasting');

  const cropSelect = document.getElementById('forecastCrop');
  const periodButtons = document.querySelectorAll('.period-toggle button');
  const generateBtn = document.getElementById('generateForecastBtn');
  const resultsWrap = document.getElementById('forecastResults');
  const emptyState = document.getElementById('forecastEmpty');

  // Populate crop dropdown
  if(cropSelect){
    cropSelect.innerHTML = AgriData.CROPS.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }

  // Deep-link support: forecasting.html?crop=tomato&insights=1
  const urlParams = new URLSearchParams(window.location.search);
  const preselectCropId = urlParams.get('crop');
  const scrollToInsights = urlParams.get('insights') === '1';
  if(preselectCropId && AgriData.findCropById(preselectCropId)){
    cropSelect.value = preselectCropId;
  }

  let selectedPeriodMonths = 1;
  periodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      periodButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPeriodMonths = Number(btn.dataset.months);
      generateBtn?.click();
    });
  });

  const basePrices = { rice:45, tomato:65, eggplant:58, onion:90, corn:37, cabbage:52, garlic:130, banana:48 };

  function generateForecast(cropId, months){
    const crop = AgriData.CROPS.find(c => c.id === cropId);
    const base = basePrices[cropId] || 50;
    const historyPoints = 8;
    const futurePoints = months * 4; // ~weekly resolution

    // Slight upward/downward bias chosen per-run for realism
    const biasPool = ['up', 'down', 'stable'];
    const bias = biasPool[AgriUtils.randomInt(0, 2)];
    const biasStep = bias === 'up' ? AgriUtils.randomBetween(0.4, 1.1)
                    : bias === 'down' ? -AgriUtils.randomBetween(0.4, 1.1)
                    : AgriUtils.randomBetween(-0.15, 0.15);

    const history = [];
    let price = base - biasStep * historyPoints * 0.4;
    for(let i = 0; i < historyPoints; i++){
      price += AgriUtils.randomBetween(-1.2, 1.2);
      history.push(Math.max(price, 8));
    }

    const forecast = [];
    let fPrice = history[history.length - 1];
    for(let i = 0; i < futurePoints; i++){
      fPrice += biasStep + AgriUtils.randomBetween(-0.9, 0.9);
      forecast.push(Math.max(fPrice, 8));
    }

    const predicted = forecast[forecast.length - 1];
    const pctChange = ((predicted - base) / base) * 100;
    const trend = pctChange > 2 ? 'Increasing' : pctChange < -2 ? 'Decreasing' : 'Stable';
    const confidence = Math.round(AgriUtils.randomBetween(78, 96));

    const labels = [];
    for(let i = historyPoints; i > 0; i--) labels.push(`W-${i}`);
    for(let i = 1; i <= futurePoints; i++) labels.push(`W+${i}`);

    return { crop, base, history, forecast, predicted, pctChange, trend, confidence, labels, historyPoints };
  }

  function renderForecast(result){
    // Chart: historical + forecast drawn as one continuous line, with a
    // dashed amber divider marking where the actual forecast begins.
    const combined = [...result.history, ...result.forecast];
    const canvas = document.getElementById('forecastCanvas');

    AgriCharts.lineChart(canvas, [
      { data: combined, color: AgriCharts.palette.leaf }
    ], result.labels, { historicalCount: result.historyPoints });

    document.getElementById('predictedPrice').textContent = AgriUtils.pesoRound(result.predicted);
    const trendBadge = document.getElementById('trendBadge');
    trendBadge.textContent = result.trend;
    trendBadge.className = 'badge ' + (result.trend === 'Increasing' ? 'up' : result.trend === 'Decreasing' ? 'down' : 'stable');
    document.getElementById('confidenceValue').textContent = result.confidence + '%';
    document.getElementById('cropLabel').textContent = `${result.crop.name}`;
    document.getElementById('forecastInsightText').textContent = AgriData.getInsightForCrop(result.crop.id);

    // Forecast table (weekly rows)
    const tbody = document.getElementById('forecastTableBody');
    tbody.innerHTML = '';
    const today = new Date();
    result.forecast.forEach((price, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + (i + 1) * 7);
      const prevPrice = i === 0 ? result.history[result.history.length - 1] : result.forecast[i - 1];
      const change = ((price - prevPrice) / prevPrice) * 100;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${AgriUtils.formatDate(d)}</td>
        <td>${result.labels[result.historyPoints + i]}</td>
        <td class="price-mono">${AgriUtils.pesoRound(price)}</td>
        <td><span class="badge ${change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable'}">${change > 0 ? '+' : ''}${change.toFixed(1)}%</span></td>
      `;
      tbody.appendChild(tr);
    });

    resultsWrap.style.display = 'block';
    emptyState.style.display = 'none';
    requestAnimationFrame(() => {
      resultsWrap.style.opacity = '1';
      resultsWrap.style.transform = 'translateY(0)';
    });
  }

  generateBtn?.addEventListener('click', () => {
    if(!cropSelect.value) return;
    generateBtn.disabled = true;
    const originalHtml = generateBtn.innerHTML;
    generateBtn.innerHTML = '<span class="spinner"></span> Generating…';

    setTimeout(() => {
      const result = generateForecast(cropSelect.value, selectedPeriodMonths);
      renderForecast(result);
      generateBtn.disabled = false;
      generateBtn.innerHTML = originalHtml;
      AgriUtils.toast(`Forecast generated for ${result.crop.name}.`, 'success', 'Forecast ready');

      if(scrollToInsights){
        setTimeout(() => {
          document.getElementById('forecastInsightCard')?.scrollIntoView({ behavior:'smooth', block:'center' });
        }, 150);
      }
    }, 900);
  });

  // Default load: 1 month is selected by default and the forecast renders immediately.
  setTimeout(() => {
    if(cropSelect?.value){
      generateBtn?.click();
    }
  }, 150);

  window.addEventListener('resize', AgriUtils.debounce(() => {
    if(resultsWrap.style.display === 'block') generateBtn.click();
  }, 400));
});
