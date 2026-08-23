/* ==========================================================================
   AgriPrice — forecast.js
   Prototype forecast rendering. Forecasts update automatically on load and
   whenever the crop or period changes.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  AgriLayout.init('forecasting.html', 'Forecasting');

  const cropSelect = document.getElementById('forecastCrop');
  const periodButtons = document.querySelectorAll('.period-toggle button');
  const resultsWrap = document.getElementById('forecastResults');
  const urlParams = new URLSearchParams(window.location.search);
  const scrollToInsights = urlParams.get('insights') === '1';
  let selectedPeriodMonths = 1;
  let lastResult = null;

  cropSelect.innerHTML = AgriData.CROPS.slice(0, 11).map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  const preselectCropId = urlParams.get('crop');
  if(preselectCropId && AgriData.findCropById(preselectCropId)) cropSelect.value = preselectCropId;

  function renderForecast(result){
    lastResult = result;
    const combined = [...result.history, ...result.forecast];
    const canvas = document.getElementById('forecastCanvas');

    AgriCharts.lineChart(canvas, [
      { data: combined, color: AgriCharts.palette.leaf }
    ], result.labels, { historicalCount: result.historyPoints });

    document.getElementById('predictedPrice').textContent = AgriUtils.pesoRound(result.predicted);
    const trendBadge = document.getElementById('trendBadgeInline');
    trendBadge.textContent = result.trend;
    trendBadge.className = 'badge ' + (result.trend === 'Increasing' ? 'up' : result.trend === 'Decreasing' ? 'down' : 'stable');
    document.getElementById('trendValue').textContent = result.trend;
    document.getElementById('confidenceValue').textContent = result.confidence + '%';
    document.getElementById('cropLabel').textContent = result.crop.name;
    document.getElementById('forecastInsightText').textContent = AgriData.getInsightForCrop(result.crop.id);

    const tbody = document.getElementById('forecastTableBody');
    tbody.innerHTML = '';
    const today = new Date();
    result.forecast.forEach((price, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + (i + 1) * 7);
      const prevPrice = i === 0 ? result.history[result.history.length - 1] : result.forecast[i - 1];
      const change = ((price - prevPrice) / prevPrice) * 100;
      tbody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${AgriUtils.formatDate(d)}</td>
          <td>${result.labels[result.historyPoints + i]}</td>
          <td class="price-mono">${AgriUtils.pesoRound(price)}</td>
          <td><span class="badge ${change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable'}">${change > 0 ? '+' : ''}${change.toFixed(1)}%</span></td>
        </tr>`);
    });
  }

  function updateForecast(){
    if(!cropSelect.value) return;
    renderForecast(AgriData.getForecastSeries(cropSelect.value, selectedPeriodMonths));
  }

  cropSelect.addEventListener('change', updateForecast);
  periodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      periodButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPeriodMonths = Number(btn.dataset.months);
      updateForecast();
    });
  });

  updateForecast();

  if(scrollToInsights){
    setTimeout(() => document.getElementById('forecastInsightCard')?.scrollIntoView({ behavior:'smooth', block:'center' }), 150);
  }

  window.addEventListener('resize', AgriUtils.debounce(() => {
    if(lastResult) renderForecast(lastResult);
  }, 180));
});
