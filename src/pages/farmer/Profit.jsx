import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Calculator, RotateCcw } from "lucide-react";
import { PageHead, Panel, Select, Field } from "../../components/common/UI";
import { useApp } from "../../hooks/useApp";
import { compareMarkets, calculateReturn, money } from "../../utils/format";
import { marketRepository } from "../../services/marketRepository";

export default function Profit() {
  const { data } = useApp();
  const markets = marketRepository.active(data);
  const [params] = useSearchParams();
  const initialCrop = data.crops.some((crop) => crop.id === params.get("crop")) ? params.get("crop") : data.settings.defaultCrop;
  const initialMarket = markets.some((market) => market.id === params.get("market")) ? params.get("market") : "teresa";
  const [crop, setCrop] = useState(initialCrop);
  const [market, setMarket] = useState(initialMarket);
  const [quantity, setQuantity] = useState(params.get("quantity") || "100");
  const [expenses, setExpenses] = useState(params.get("expenses") || "0");
  const quote = (cropId, marketId) => compareMarkets(data, cropId, 100).find((record) => record.marketId === marketId);
  const [price, setPrice] = useState(String(quote(initialCrop, initialMarket)?.price || 0));
  const choose = (cropId, marketId) => { setCrop(cropId); setMarket(marketId); setPrice(String(quote(cropId, marketId)?.price || 0)); };
  const result = calculateReturn(quantity, price, 0, expenses);
  const valid = Number(quantity) > 0 && Number(price) >= 0 && Number(expenses) >= 0;

  return <><PageHead title="Profit Estimation" description="Review the sale details, add your remaining expenses, and see your estimated earnings automatically."/><div className="calculator-grid"><Panel><h2>Sale &amp; Expense Details</h2><div className="form-grid mt-6"><Select label="Crop" value={crop} onChange={(value) => choose(value, market)} options={data.crops}/><Field label="Quantity (kg)"><input type="number" min="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)}/></Field><Field label="Selling Price / kg"><input type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)}/></Field><Field label="Other Expenses (₱)"><input type="number" min="0" value={expenses} onChange={(event) => setExpenses(event.target.value)}/></Field><Select label="Market" value={market} onChange={(value) => choose(crop, value)} options={markets}/></div><p className="muted mt-4">Selling price uses the shared market-price dataset. Enter transportation, packaging, labor, and any other costs under Other Expenses.</p><button className="button secondary mt-6" onClick={() => { setQuantity("100"); setExpenses("0"); choose("rice", "antipolo"); }}><RotateCcw size={16}/>Reset</button></Panel><Panel className="calculator-result"><span className="quick-icon"><Calculator size={22}/></span><h2>Estimated Net Earnings</h2><p className="muted mt-2">Results update automatically whenever you change an input.</p>{valid ? <><dl className="result-lines"><div><dt>Gross Sales</dt><dd>{money(result.revenue)}</dd></div><div><dt>Total Expenses</dt><dd>{money(result.expenses)}</dd></div></dl><div className="net-result"><small>Estimated Net Earnings</small><strong className={result.net < 0 ? "negative" : ""}>{money(result.net)}</strong></div><div className="profit-margin"><span>Profit Margin</span><strong>{result.revenue ? ((result.net / result.revenue) * 100).toFixed(1) : "0.0"}%</strong></div></> : <p>Enter valid values to calculate your estimated earnings.</p>}</Panel></div></>;
}
