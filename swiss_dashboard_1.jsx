import { useState, useMemo } from "react";

const STOCKS_10 = [
  { name: "Cie Financiere Richemont", ticker: "CFR SW", price: 157.60, dividend: 1.92, weight: 10, buyRec: 61.3 },
  { name: "Zurich Insurance Group", ticker: "ZURN SW", price: 566.20, dividend: 5.22, weight: 10, buyRec: 16.7 },
  { name: "Holcim AG", ticker: "HOLN SW", price: 71.50, dividend: 2.50, weight: 10, buyRec: 59.3 },
  { name: "Nestlé SA", ticker: "NESN SW", price: 79.22, dividend: 3.91, weight: 10, buyRec: 50.0 },
  { name: "Novartis AG", ticker: "NOVN SW", price: 102.20, dividend: 3.30, weight: 10, buyRec: 29.6 },
  { name: "Roche Holding AG", ticker: "ROG SW", price: 276.20, dividend: 3.59, weight: 10, buyRec: 57.7 },
  { name: "Swiss Life Holding", ticker: "SLHN SW", price: 869.20, dividend: 4.27, weight: 10, buyRec: 15.8 },
  { name: "Swiss Re AG", ticker: "SREN SW", price: 149.50, dividend: 4.29, weight: 10, buyRec: 43.5 },
  { name: "UBS Group AG", ticker: "UBSG SW", price: 30.76, dividend: 2.61, weight: 10, buyRec: 56.0 },
  { name: "Partners Group Holding", ticker: "PGHN SW", price: 966.80, dividend: 4.66, weight: 10, buyRec: 50.0 },
];

const SCENARIOS = {
  bull: {
    label: "Alcista", emoji: "🚀",
    color: "#00d97e",
    stockReturn: 18,
    fxAppreciation: 8,
    description: "Mercado suizo fuerte, CHF se aprecia, tasas SNB estables"
  },
  neutral: {
    label: "Neutral", emoji: "⚖️",
    color: "#f0c040",
    stockReturn: 9,
    fxAppreciation: 0,
    description: "Rendimiento histórico promedio, CHF plano"
  },
  bear: {
    label: "Bajista", emoji: "🐻",
    color: "#ff4d6d",
    stockReturn: -8,
    fxAppreciation: -5,
    description: "Corrección de mercado, CHF se deprecia levemente"
  },
};

const fmt = (n, dec = 2) => n?.toLocaleString("es-CL", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtPct = (n) => `${n >= 0 ? "+" : ""}${fmt(n)}%`;
const fmtChf = (n) => `CHF ${fmt(Math.round(n), 0)}`;

export default function Dashboard() {
  const [mode, setMode] = useState("mandate"); // mandate | stocks
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanRate, setLoanRate] = useState(1.0);
  const [managementFee, setManagementFee] = useState(0.8);
  const [years, setYears] = useState(3);
  const [stockReturn, setStockReturn] = useState(9);
  const [fxChange, setFxChange] = useState(0);
  const [scenario, setScenario] = useState(null);
  const [stocks, setStocks] = useState(STOCKS_10.map(s => ({ ...s })));
  const [activeTab, setActiveTab] = useState("sim"); // sim | stocks | details

  const dividendYield = mode === "mandate" ? 2.5 : 3.63;
  const effectiveFee = mode === "mandate" ? managementFee : 0;

  const applyScenario = (key) => {
    const s = SCENARIOS[key];
    setStockReturn(s.stockReturn);
    setFxChange(s.fxAppreciation);
    setScenario(key);
  };

  const updateStock = (i, field, val) => {
    const updated = [...stocks];
    updated[i] = { ...updated[i], [field]: parseFloat(val) || 0 };
    setStocks(updated);
  };

  const portfolioDividend = useMemo(() => {
    return stocks.reduce((acc, s) => acc + (s.dividend * s.weight / 100), 0);
  }, [stocks]);

  const effectiveDividend = mode === "mandate" ? dividendYield : portfolioDividend;

  const results = useMemo(() => {
    const yearly = [];
    let capital = loanAmount;
    let cumulative = 0;

    for (let y = 1; y <= years; y++) {
      const stockGain = capital * (stockReturn / 100);
      const divIncome = capital * (effectiveDividend / 100);
      const loanCost = loanAmount * (loanRate / 100);
      const feeCost = mode === "mandate" ? capital * (effectiveFee / 100) : 0;
      const fxEffect = capital * (fxChange / 100);
      const netYear = stockGain + divIncome - loanCost - feeCost + fxEffect;
      cumulative += netYear;
      capital = loanAmount + cumulative;
      yearly.push({
        year: y,
        stockGain, divIncome, loanCost, feeCost, fxEffect,
        netYear, cumulative, capital,
        netPct: (netYear / loanAmount) * 100,
        cumPct: (cumulative / loanAmount) * 100,
      });
    }
    return yearly;
  }, [loanAmount, loanRate, effectiveDividend, effectiveFee, stockReturn, fxChange, years, mode]);

  const last = results[results.length - 1];
  const totalNetPct = last?.cumPct || 0;
  const isPositive = totalNetPct >= 0;

  const sliderStyle = {
    width: "100%", accentColor: "#c8a84b", height: 4,
  };

  return (
    <div style={{
      fontFamily: "'Georgia', serif",
      background: "linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #0d1520 100%)",
      minHeight: "100vh", color: "#e8e0d0", padding: "0 0 40px 0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #0f1923 0%, #1a2535 100%)",
        borderBottom: "1px solid #c8a84b33",
        padding: "24px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#c8a84b", textTransform: "uppercase", marginBottom: 4 }}>
            Santander Private Banking · Simulador
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: "normal", color: "#f0ead8", letterSpacing: 1 }}>
            Acciones Suizas con Apalancamiento
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["mandate", "stocks"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "8px 18px", borderRadius: 2, cursor: "pointer", fontSize: 12, letterSpacing: 1,
              border: mode === m ? "1px solid #c8a84b" : "1px solid #ffffff22",
              background: mode === m ? "#c8a84b22" : "transparent",
              color: mode === m ? "#c8a84b" : "#888", transition: "all 0.2s",
            }}>
              {m === "mandate" ? "MANDATO DPM" : "10 ACCIONES"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>

        {/* Scenario Buttons */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#888", marginBottom: 10, textTransform: "uppercase" }}>
            Escenarios predeterminados
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {Object.entries(SCENARIOS).map(([key, s]) => (
              <button key={key} onClick={() => applyScenario(key)} style={{
                flex: 1, padding: "14px 16px", borderRadius: 4, cursor: "pointer",
                border: scenario === key ? `1px solid ${s.color}` : "1px solid #ffffff15",
                background: scenario === key ? `${s.color}18` : "#ffffff08",
                color: scenario === key ? s.color : "#aaa",
                transition: "all 0.2s", textAlign: "left",
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 10, opacity: 0.7, lineHeight: 1.4 }}>{s.description}</div>
              </button>
            ))}
            {scenario && (
              <button onClick={() => setScenario(null)} style={{
                padding: "14px 16px", borderRadius: 4, cursor: "pointer",
                border: "1px solid #ffffff15", background: "#ffffff08", color: "#666", fontSize: 11,
              }}>✕ Limpiar</button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24 }}>

          {/* Left Panel - Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Loan Parameters */}
            <div style={{ background: "#ffffff08", border: "1px solid #ffffff12", borderRadius: 6, padding: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#c8a84b", marginBottom: 16, textTransform: "uppercase" }}>
                Parámetros del Préstamo
              </div>

              <Slider label="Monto del préstamo (CHF)" value={loanAmount}
                min={100000} max={5000000} step={50000}
                display={`CHF ${(loanAmount / 1000).toFixed(0)}k`}
                onChange={v => setLoanAmount(v)} />

              <Slider label="Tasa del préstamo" value={loanRate}
                min={0} max={3} step={0.1}
                display={`${loanRate.toFixed(1)}%`}
                onChange={v => setLoanRate(v)} />

              {mode === "mandate" && (
                <Slider label="Fee de gestión (DPM)" value={managementFee}
                  min={0.3} max={1.5} step={0.05}
                  display={`${managementFee.toFixed(2)}%`}
                  onChange={v => setManagementFee(v)} />
              )}

              <Slider label="Horizonte (años)" value={years}
                min={1} max={10} step={1}
                display={`${years} año${years > 1 ? "s" : ""}`}
                onChange={v => setYears(v)} />
            </div>

            {/* Market Parameters */}
            <div style={{ background: "#ffffff08", border: "1px solid #ffffff12", borderRadius: 6, padding: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#c8a84b", marginBottom: 16, textTransform: "uppercase" }}>
                Parámetros de Mercado
              </div>

              <Slider label="Retorno anual acciones (CHF)" value={stockReturn}
                min={-20} max={30} step={0.5}
                display={fmtPct(stockReturn)}
                color={stockReturn >= 0 ? "#00d97e" : "#ff4d6d"}
                onChange={v => { setStockReturn(v); setScenario(null); }} />

              <Slider label="Variación CHF vs CLP" value={fxChange}
                min={-15} max={20} step={0.5}
                display={fmtPct(fxChange)}
                color={fxChange >= 0 ? "#00d97e" : "#ff4d6d"}
                onChange={v => { setFxChange(v); setScenario(null); }} />

              <div style={{ marginTop: 12, padding: "10px 12px", background: "#ffffff06", borderRadius: 4, fontSize: 11, color: "#888", lineHeight: 1.5 }}>
                Dividendo estimado: <span style={{ color: "#c8a84b" }}>{effectiveDividend.toFixed(2)}%</span>
                {mode === "stocks" && <span> (promedio cartera)</span>}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div style={{ background: "#ffffff08", border: "1px solid #ffffff12", borderRadius: 6, padding: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#c8a84b", marginBottom: 14, textTransform: "uppercase" }}>
                Costos Anuales (año 1)
              </div>
              <CostRow label="Interés préstamo" value={loanAmount * loanRate / 100} negative />
              {mode === "mandate" && <CostRow label="Fee gestión DPM" value={loanAmount * effectiveFee / 100} negative />}
              <CostRow label="Ingreso dividendos" value={loanAmount * effectiveDividend / 100} />
              <div style={{ borderTop: "1px solid #ffffff15", marginTop: 8, paddingTop: 8 }}>
                <CostRow label="Margen neto (sin plusvalía)"
                  value={loanAmount * (effectiveDividend - loanRate - (mode === "mandate" ? effectiveFee : 0)) / 100}
                  highlight />
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Ganancia total estimada", value: fmtChf(last?.cumulative || 0), sub: fmtPct(totalNetPct), positive: isPositive },
                { label: "Retorno año 1", value: fmtPct(results[0]?.netPct || 0), sub: fmtChf(results[0]?.netYear || 0), positive: (results[0]?.netPct || 0) >= 0 },
                { label: "Efecto FX acumulado", value: fmtChf((last?.fxEffect || 0) * years), sub: `${fmtPct(fxChange)} anual`, positive: fxChange >= 0 },
                { label: "Costo total préstamo", value: fmtChf(loanAmount * loanRate / 100 * years), sub: `${years} años a ${loanRate}%`, positive: false, neutral: true },
              ].map((k, i) => (
                <div key={i} style={{
                  background: "#ffffff08", border: `1px solid ${k.neutral ? "#ffffff15" : k.positive ? "#00d97e22" : "#ff4d6d22"}`,
                  borderRadius: 6, padding: 16,
                }}>
                  <div style={{ fontSize: 10, color: "#888", marginBottom: 8, lineHeight: 1.3 }}>{k.label}</div>
                  <div style={{
                    fontSize: 20, fontWeight: "bold",
                    color: k.neutral ? "#e8e0d0" : k.positive ? "#00d97e" : "#ff4d6d"
                  }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #ffffff15" }}>
              {[["sim", "Proyección anual"], ["stocks", mode === "mandate" ? "Posiciones DPM" : "10 Acciones"], ["details", "Desglose detallado"]].map(([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key)} style={{
                  padding: "10px 20px", background: "transparent", border: "none",
                  borderBottom: activeTab === key ? "2px solid #c8a84b" : "2px solid transparent",
                  color: activeTab === key ? "#c8a84b" : "#666", cursor: "pointer", fontSize: 12, letterSpacing: 1,
                }}>
                  {label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab: Proyección */}
            {activeTab === "sim" && (
              <div style={{ background: "#ffffff08", border: "1px solid #ffffff12", borderRadius: 6, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#ffffff08" }}>
                      {["Año", "Plusvalía acciones", "Dividendos", "Costo préstamo", mode === "mandate" ? "Fee gestión" : "—", "Efecto FX", "Resultado neto", "Acumulado", "Retorno %"].map((h, i) => (
                        <th key={i} style={{ padding: "10px 12px", textAlign: i === 0 ? "center" : "right", color: "#888", fontWeight: "normal", fontSize: 10, letterSpacing: 1 }}>
                          {h.toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #ffffff08", background: i % 2 === 0 ? "transparent" : "#ffffff04" }}>
                        <td style={{ padding: "10px 12px", textAlign: "center", color: "#c8a84b" }}>{r.year}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#00d97e" }}>{fmtChf(r.stockGain)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#7dd3fc" }}>{fmtChf(r.divIncome)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#ff4d6d" }}>-{fmtChf(r.loanCost)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#ff4d6d" }}>{mode === "mandate" ? `-${fmtChf(r.feeCost)}` : "—"}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: r.fxEffect >= 0 ? "#00d97e" : "#ff4d6d" }}>
                          {r.fxEffect >= 0 ? "+" : ""}{fmtChf(r.fxEffect)}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "bold", color: r.netYear >= 0 ? "#00d97e" : "#ff4d6d" }}>
                          {fmtChf(r.netYear)}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: r.cumulative >= 0 ? "#e8e0d0" : "#ff4d6d" }}>
                          {fmtChf(r.cumulative)}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: r.cumPct >= 0 ? "#c8a84b" : "#ff4d6d", fontWeight: "bold" }}>
                          {fmtPct(r.cumPct)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: Stocks */}
            {activeTab === "stocks" && mode === "stocks" && (
              <div style={{ background: "#ffffff08", border: "1px solid #ffffff12", borderRadius: 6, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: "#ffffff08" }}>
                      {["Empresa", "Precio CHF", "Dividendo %", "Peso %", "% Buy", "Aporte dividendo"].map((h, i) => (
                        <th key={i} style={{ padding: "10px 12px", textAlign: i === 0 ? "left" : "right", color: "#888", fontWeight: "normal", fontSize: 10 }}>
                          {h.toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((s, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #ffffff08" }}>
                        <td style={{ padding: "8px 12px" }}>
                          <div style={{ color: "#e8e0d0" }}>{s.name}</div>
                          <div style={{ color: "#555", fontSize: 10 }}>{s.ticker}</div>
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>
                          <input type="number" value={s.price} onChange={e => updateStock(i, "price", e.target.value)}
                            style={{ width: 70, background: "#ffffff10", border: "1px solid #ffffff20", borderRadius: 3, color: "#e8e0d0", padding: "3px 6px", textAlign: "right", fontSize: 11 }} />
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>
                          <input type="number" value={s.dividend} onChange={e => updateStock(i, "dividend", e.target.value)}
                            style={{ width: 55, background: "#ffffff10", border: "1px solid #ffffff20", borderRadius: 3, color: "#7dd3fc", padding: "3px 6px", textAlign: "right", fontSize: 11 }} />
                          <span style={{ color: "#555", marginLeft: 2 }}>%</span>
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>
                          <input type="number" value={s.weight} onChange={e => updateStock(i, "weight", e.target.value)}
                            style={{ width: 45, background: "#ffffff10", border: "1px solid #ffffff20", borderRadius: 3, color: "#c8a84b", padding: "3px 6px", textAlign: "right", fontSize: 11 }} />
                          <span style={{ color: "#555", marginLeft: 2 }}>%</span>
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>
                          <span style={{ color: s.buyRec >= 50 ? "#00d97e" : "#888" }}>{s.buyRec}%</span>
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: "#7dd3fc" }}>
                          {fmtChf(loanAmount * s.dividend / 100 * s.weight / 100)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: "2px solid #c8a84b33", background: "#ffffff06" }}>
                      <td colSpan={2} style={{ padding: "10px 12px", color: "#c8a84b", fontSize: 11 }}>TOTAL PORTAFOLIO</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", color: "#7dd3fc", fontWeight: "bold" }}>
                        {fmt(portfolioDividend)}%
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", color: "#c8a84b" }}>
                        {fmt(stocks.reduce((a, s) => a + s.weight, 0))}%
                      </td>
                      <td />
                      <td style={{ padding: "10px 12px", textAlign: "right", color: "#7dd3fc", fontWeight: "bold" }}>
                        {fmtChf(loanAmount * portfolioDividend / 100)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "stocks" && mode === "mandate" && (
              <div style={{ background: "#ffffff08", border: "1px solid #ffffff12", borderRadius: 6, padding: 24 }}>
                <div style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>Posiciones principales del Mandato DPM (datos a Oct 2025)</div>
                {[
                  ["Belimo", "3.24%", "Industrial"], ["Sandoz", "3.10%", "Salud"], ["Swiss Life", "3.10%", "Financiero"],
                  ["ABB", "3.06%", "Industrial"], ["VAT Group", "2.93%", "Industrial"], ["Roche", "4.87%", "Salud"],
                  ["Novartis", "4.21%", "Salud"], ["UBS", "4.01%", "Financiero"], ["Nestlé", "3.89%", "Consumo"],
                  ["Zurich Insurance", "3.62%", "Financiero"],
                ].map(([name, weight, sector], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #ffffff08" }}>
                    <div>
                      <span style={{ color: "#e8e0d0" }}>{name}</span>
                      <span style={{ color: "#555", fontSize: 10, marginLeft: 8 }}>{sector}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 80, height: 4, background: "#ffffff10", borderRadius: 2 }}>
                        <div style={{ width: `${parseFloat(weight) * 20}%`, height: "100%", background: "#c8a84b", borderRadius: 2 }} />
                      </div>
                      <span style={{ color: "#c8a84b", fontSize: 12, width: 40, textAlign: "right" }}>{weight}</span>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: "10px 12px", background: "#c8a84b11", borderRadius: 4, fontSize: 11, color: "#c8a84b" }}>
                  36 posiciones totales · Beta 0.92 · P/E 18.4 · Dividendo 2.5%
                </div>
              </div>
            )}

            {/* Tab: Desglose */}
            {activeTab === "details" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {results.slice(0, Math.min(years, 6)).map((r, i) => (
                  <div key={i} style={{ background: "#ffffff08", border: "1px solid #ffffff12", borderRadius: 6, padding: 16 }}>
                    <div style={{ fontSize: 10, color: "#888", letterSpacing: 2, marginBottom: 12 }}>AÑO {r.year}</div>
                    {[
                      ["Plusvalía acciones", r.stockGain, true],
                      ["Ingresos dividendos", r.divIncome, true],
                      ["Efecto CHF/CLP", r.fxEffect, r.fxEffect >= 0],
                      ["Interés préstamo", -r.loanCost, false],
                      ...(mode === "mandate" ? [["Fee gestión DPM", -r.feeCost, false]] : []),
                    ].map(([label, val, pos], j) => (
                      <div key={j} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "#888" }}>{label}</span>
                        <span style={{ fontSize: 11, color: pos ? "#00d97e" : "#ff4d6d" }}>
                          {val >= 0 ? "+" : ""}{fmtChf(val)}
                        </span>
                      </div>
                    ))}
                    <div style={{ borderTop: "1px solid #ffffff15", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "#e8e0d0" }}>Resultado neto</span>
                      <span style={{ fontSize: 14, fontWeight: "bold", color: r.netYear >= 0 ? "#00d97e" : "#ff4d6d" }}>
                        {fmtChf(r.netYear)}
                      </span>
                    </div>
                    <div style={{ textAlign: "right", fontSize: 10, color: "#666", marginTop: 4 }}>
                      Acumulado: {fmtChf(r.cumulative)} ({fmtPct(r.cumPct)})
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, display, color = "#c8a84b", onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#888" }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: "bold" }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: color, height: 4, cursor: "pointer" }} />
    </div>
  );
}

function CostRow({ label, value, negative, highlight }) {
  const color = highlight ? (value >= 0 ? "#00d97e" : "#ff4d6d") : negative ? "#ff4d6d" : "#7dd3fc";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: "#888" }}>{label}</span>
      <span style={{ fontSize: 12, color, fontWeight: highlight ? "bold" : "normal" }}>
        {negative && value > 0 ? "-" : value >= 0 ? "+" : ""} CHF {Math.abs(Math.round(value)).toLocaleString()}
      </span>
    </div>
  );
}
