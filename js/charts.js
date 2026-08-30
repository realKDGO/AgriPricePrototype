/* ==========================================================================
 AgriPrice — charts.js
 Lightweight HTML5 Canvas chart renderers (no external chart libraries).
 ========================================================================== */

const AgriCharts = (() => {

 function setupCanvas(canvas){
 const dpr = window.devicePixelRatio || 1;
 const rect = canvas.getBoundingClientRect();
 canvas.width = rect.width * dpr;
 canvas.height = rect.height * dpr;
 const ctx = canvas.getContext('2d');
 ctx.scale(dpr, dpr);
 return { ctx, w: rect.width, h: rect.height };
 }

 const palette = {
 grid: '#E6EBE6',
 axis: '#8B968F',
 leaf: '#2D7D52',
 sprout: '#8FD4AC',
 amber: '#DA9A34',
 soil: '#7A4B27',
 ink: '#1B2420'
 };

 /**
 * Draws a smooth line chart. series = [{ label, color, data:[{x,y}] }]
 * options: { historicalCount } — draws a dashed vertical divider marking
 * where historical data ends and forecast begins.
 */
 function lineChart(canvas, series, labels, options = {}){
 const { ctx, w, h } = setupCanvas(canvas);
 ctx.clearRect(0, 0, w, h);

 const padding = { top: 18, right: 18, bottom: 30, left: 46 };
 const chartW = w - padding.left - padding.right;
 const chartH = h - padding.top - padding.bottom;

 const allValues = series.flatMap(s => s.data);
 const maxV = Math.max(...allValues) * 1.12;
 const minV = Math.min(...allValues) * 0.9;

 const xStep = chartW / (labels.length - 1 || 1);
 const yScale = v => padding.top + chartH - ((v - minV) / (maxV - minV || 1)) * chartH;
 const xScale = i => padding.left + i * xStep;

 // Gridlines + y labels
 ctx.strokeStyle = palette.grid;
 ctx.fillStyle = palette.axis;
 ctx.font = '11px Inter, sans-serif';
 ctx.lineWidth = 1;
 const gridLines = 4;
 for(let i = 0; i <= gridLines; i++){
 const v = minV + ((maxV - minV) / gridLines) * i;
 const y = yScale(v);
 ctx.beginPath();
 ctx.moveTo(padding.left, y);
 ctx.lineTo(w - padding.right, y);
 ctx.stroke();
 ctx.fillText('₱' + Math.round(v), 4, y + 4);
 }

 // X labels (sparse)
 const labelEvery = Math.ceil(labels.length / 6);
 labels.forEach((lab, i) => {
 if(i % labelEvery !== 0 && i !== labels.length - 1) return;
 ctx.fillStyle = palette.axis;
 ctx.textAlign = 'center';
 ctx.fillText(lab, xScale(i), h - 8);
 });
 ctx.textAlign = 'left';

 // Historical/forecast divider
 if(options.historicalCount){
 const dividerX = xScale(options.historicalCount - 1);
 ctx.save();
 ctx.setLineDash([4, 4]);
 ctx.strokeStyle = palette.amber;
 ctx.beginPath();
 ctx.moveTo(dividerX, padding.top);
 ctx.lineTo(dividerX, padding.top + chartH);
 ctx.stroke();
 ctx.restore();
 }

 // Series lines
 series.forEach(s => {
 ctx.beginPath();
 s.data.forEach((v, i) => {
 const x = xScale(i);
 const y = yScale(v);
 if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
 });
 ctx.strokeStyle = s.color;
 ctx.lineWidth = 2.5;
 if(s.dashed){ ctx.setLineDash([6,5]); } else { ctx.setLineDash([]); }
 ctx.stroke();
 ctx.setLineDash([]);

 // Area fill for the primary (first, solid) series
 if(!s.dashed){
 const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
 grad.addColorStop(0, s.color + '33');
 grad.addColorStop(1, s.color + '00');
 ctx.lineTo(xScale(s.data.length - 1), padding.top + chartH);
 ctx.lineTo(xScale(0), padding.top + chartH);
 ctx.closePath();
 ctx.fillStyle = grad;
 ctx.fill();
 }

 // Points
 s.data.forEach((v, i) => {
 ctx.beginPath();
 ctx.arc(xScale(i), yScale(v), 3, 0, Math.PI * 2);
 ctx.fillStyle = s.color;
 ctx.fill();
 ctx.strokeStyle = '#fff';
 ctx.lineWidth = 1.4;
 ctx.stroke();
 });
 });
 }

 /**
 * Simple vertical bar chart. data = [{ label, value }]
 */
 function barChart(canvas, data, color = palette.leaf){
 const { ctx, w, h } = setupCanvas(canvas);
 ctx.clearRect(0, 0, w, h);

 const padding = { top: 18, right: 14, bottom: 30, left: 40 };
 const chartW = w - padding.left - padding.right;
 const chartH = h - padding.top - padding.bottom;
 const maxV = Math.max(...data.map(d => d.value)) * 1.15;

 const barSlot = chartW / data.length;
 const barWidth = Math.min(barSlot * 0.5, 34);

 ctx.strokeStyle = palette.grid;
 ctx.fillStyle = palette.axis;
 ctx.font = '11px Inter, sans-serif';
 const gridLines = 4;
 for(let i = 0; i <= gridLines; i++){
 const v = (maxV / gridLines) * i;
 const y = padding.top + chartH - (v / maxV) * chartH;
 ctx.beginPath();
 ctx.moveTo(padding.left, y);
 ctx.lineTo(w - padding.right, y);
 ctx.stroke();
 ctx.fillText('₱' + Math.round(v), 2, y + 4);
 }

 data.forEach((d, i) => {
 const barH = (d.value / maxV) * chartH;
 const x = padding.left + i * barSlot + (barSlot - barWidth) / 2;
 const y = padding.top + chartH - barH;

 const grad = ctx.createLinearGradient(0, y, 0, padding.top + chartH);
 grad.addColorStop(0, color);
 grad.addColorStop(1, color + 'AA');
 ctx.fillStyle = grad;

 const r = 6;
 ctx.beginPath();
 ctx.moveTo(x, y + r);
 ctx.arcTo(x, y, x + r, y, r);
 ctx.lineTo(x + barWidth - r, y);
 ctx.arcTo(x + barWidth, y, x + barWidth, y + r, r);
 ctx.lineTo(x + barWidth, padding.top + chartH);
 ctx.lineTo(x, padding.top + chartH);
 ctx.closePath();
 ctx.fill();

 ctx.fillStyle = palette.axis;
 ctx.textAlign = 'center';
 ctx.fillText(d.label, x + barWidth / 2, h - 8);
 });
 ctx.textAlign = 'left';
 }

 /**
 * Minimal sparkline — no axes, no gridlines, just a smooth filled trend
 * line. Used for compact widgets like the Home page Featured Crop card.
 */
 function sparkline(canvas, data, color = palette.leaf){
 const { ctx, w, h } = setupCanvas(canvas);
 ctx.clearRect(0, 0, w, h);

 const padding = { top: 10, right: 6, bottom: 10, left: 6 };
 const chartW = w - padding.left - padding.right;
 const chartH = h - padding.top - padding.bottom;

 const maxV = Math.max(...data) * 1.08;
 const minV = Math.min(...data) * 0.92;
 const xStep = chartW / (data.length - 1 || 1);
 const yScale = v => padding.top + chartH - ((v - minV) / (maxV - minV || 1)) * chartH;
 const xScale = i => padding.left + i * xStep;

 // Filled area under the line
 ctx.beginPath();
 data.forEach((v, i) => {
 const x = xScale(i), y = yScale(v);
 if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
 });
 ctx.lineTo(xScale(data.length - 1), padding.top + chartH);
 ctx.lineTo(xScale(0), padding.top + chartH);
 ctx.closePath();
 const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
 grad.addColorStop(0, color + '40');
 grad.addColorStop(1, color + '00');
 ctx.fillStyle = grad;
 ctx.fill();

 // Trend line
 ctx.beginPath();
 data.forEach((v, i) => {
 const x = xScale(i), y = yScale(v);
 if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
 });
 ctx.strokeStyle = color;
 ctx.lineWidth = 2.5;
 ctx.lineJoin = 'round';
 ctx.lineCap = 'round';
 ctx.stroke();

 // End point marker
 const lastX = xScale(data.length - 1), lastY = yScale(data[data.length - 1]);
 ctx.beginPath();
 ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
 ctx.fillStyle = color;
 ctx.fill();
 ctx.strokeStyle = '#fff';
 ctx.lineWidth = 2;
 ctx.stroke();
 }

 return { lineChart, barChart, sparkline, palette };
})();
