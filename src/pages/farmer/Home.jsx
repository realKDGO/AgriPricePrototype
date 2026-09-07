import { Link } from "react-router-dom";
import { ArrowRight, Lightbulb, Store } from "lucide-react";
import { Panel, Badge } from "../../components/common/UI";
import PriceChart from "../../components/common/PriceChart";
import { useApp } from "../../hooks/useApp";
import { latestPrices, money, compareMarkets } from "../../utils/format";
import { marketRepository } from "../../services/marketRepository";
export default function Home() {
 const { data, session } = useApp();
 const crop = data.crops.find(c => c.id === data.settings.defaultCrop) || data.crops[0];
 const prices = latestPrices(data); const price = prices.find(p => p.cropId === crop.id) || prices[0];
 const market = marketRepository.byId(data, price?.marketId);
 const history = data.history.filter(r => r.cropId === crop.id).slice(-8).map(r => ({...r,label:new Date(r.date).toLocaleDateString("en",{month:"short",day:"numeric"})}));
 const best = compareMarkets(data,crop.id,100)[0];
 return <>
  <section className="dashboard-welcome"><h2>Welcome back, {session?.name.split(" ")[0] || "Farmer"}</h2><p>Here’s what’s happening across your market information today.</p></section>
  <Panel className="featured-card"><div className="featured-crop"><Badge>FEATURED CROP UPDATE</Badge><div className="featured-ident"><img src={crop.image} alt={crop.name}/><div><h2>{crop.name}</h2><p className="muted">{market?.name}</p></div></div><small>UPDATED PRICE</small><strong>{money(price?.price)}<span>/kg</span></strong><Badge>{price?.price >= price?.previous ? `↑ ${(((price.price-price.previous)/price.previous)*100).toFixed(1)}%` : "Price updated"}</Badge></div><div className="trend-card"><h3>30-DAY TREND</h3><PriceChart data={history} compact/><Link className="button" to="/farmer/forecast">View Forecast <ArrowRight size={17}/></Link></div></Panel>
  <Panel className="market-insight"><span className="quick-icon"><Lightbulb size={22}/></span><div><h2>Market Insight</h2><p>Compare price and transportation before choosing where to sell.</p><Link className="button secondary small" to="/farmer/markets">Learn More <ArrowRight size={16}/></Link></div></Panel>
  {best && <Panel className="best-market"><div><span className="quick-icon"><Store size={22}/></span><div><small>Best Market Today</small><h2>{best.market.name}</h2></div></div><div className="market-metrics"><div><strong>{data.crops.length}</strong><span>Crops Increased</span></div><div><strong>16 km</strong><span>Distance</span></div><div><strong>{money(best.transport)}</strong><span>Transport Cost</span></div></div><Link className="button w-full" to="/farmer/markets">View Market <ArrowRight size={17}/></Link></Panel>}
 </>;
}
