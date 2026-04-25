import { useState, useMemo, useEffect } from "react";
import { fetchDashboardData } from "./dataLoader";
import CONFIG from "./config";

const PODS = ["Platform","Foundation","O2C","I2P","RTR","FP&A","THR-TA","THR-ES","Banking","Insurance"];
const RELS = ["R1","R2","R3","R4"];
const SC = {"Completed":"#10b981","On Track":"#3b82f6","At Risk":"#f59e0b","Delayed":"#ef4444","Yet to Start":"#6b7280"};

const CAP_POD = [
  {n:"FP&A",t:143,f:120,lw:5},{n:"Foundation",t:100,f:85,lw:3},{n:"Platform",t:80,f:68,lw:2},
  {n:"THR",t:60,f:52,lw:1},{n:"Banking",t:52,f:45,lw:2},{n:"Insurance",t:35,f:30,lw:0},
  {n:"O2C",t:48,f:40,lw:3},{n:"I2P",t:42,f:35,lw:1},{n:"RTR",t:38,f:32,lw:2}
];
const CAP_ROLE = [
  {n:"Engg Exec Roles",t:95,f:55,lw:0},{n:"Engineering",t:588,f:315,lw:15},
  {n:"Domain/Functional",t:137,f:68,lw:0}
];

const RISK_ITEMS = {
  Overview: [],
  Platform: [
    {pr:"P1",title:"API Gateway Latency Spikes",age:12,impact:"8 Days delay",mit:"Load balancing, connection pooling",owner:"Sarah Kim"},
    {pr:"P2",title:"Microservices Dependency Chain",age:8,impact:"5 Days delay",mit:"Decouple services, circuit breakers",owner:"Sarah Kim"}
  ],
  Foundation: [
    {pr:"P1",title:"Master Data Quality Issues",age:12,impact:"12 Days delay",mit:"Automated data quality checks",owner:"Michael Chen"},
    {pr:"P1",title:"Work Planning Module Performance",age:14,impact:"10 Days delay",mit:"Redis caching, optimize DB indexes",owner:"Michael Chen"},
    {pr:"P2",title:"Data Migration Validation Gaps",age:9,impact:"6 Days delay",mit:"Automated reconciliation scripts",owner:"Michael Chen"}
  ],
  "FP&A": [
    {pr:"P1",title:"Forecasting Integration Failure",age:18,impact:"15 Days delay",mit:"Redesign integration layer",owner:"Raj Patel"},
    {pr:"P2",title:"Budget Consolidation Performance",age:6,impact:"4 Days delay",mit:"Optimize SQL queries",owner:"Raj Patel"}
  ],
  O2C: [{pr:"P2",title:"Invoice Processing Bottleneck",age:10,impact:"7 Days delay",mit:"Parallel processing pipeline",owner:"Lisa Wang"}],
  I2P: [{pr:"P3",title:"Vendor Portal Accessibility",age:5,impact:"3 Days delay",mit:"WCAG compliance audit",owner:"Tom Harris"}],
  RTR: [{pr:"P3",title:"Journal Entry Automation Gaps",age:7,impact:"4 Days delay",mit:"Expand rule engine",owner:"Anna Lee"}],
  Banking: [{pr:"P3",title:"Regulatory Compliance Scope",age:4,impact:"5 Days delay",mit:"Scope review with compliance",owner:"David Park"}],
  Insurance: [
    {pr:"P2",title:"Claims Processing Integration",age:11,impact:"8 Days delay",mit:"API versioning",owner:"Maria Santos"},
    {pr:"P3",title:"Policy Engine Rule Conflicts",age:6,impact:"3 Days delay",mit:"Rule conflict detection",owner:"Maria Santos"}
  ]
};

const MILES = {
  Foundation: {lead:"Michael Chen",color:"#ef4444",rels:[
    {name:"MVP Release 1",feat:8,lastWeek:[
      {task:"FDD",completed:"95%",notes:"Conditional sign off by PO done"},
      {task:"Tech design of 8 features",completed:"95%",notes:"Sign off from Sid Mehta on the LLD"},
      {task:"UI/UX for 8 Features",completed:"95%",notes:"Conditional sign off by PO done"},
      {task:"UAT status",completed:"95%",notes:"E-2-E integrated testing with O2C scope"},
      {task:"APT",completed:"90%",notes:"9/10 use cases passed, 1 WIP"}
    ],nextWeek:[
      {task:"FDD",activity:"Work with business on sign off",risk:"Business Sign off",notes:"Formal pending"},
      {task:"Tech design",activity:"Sign off from Sid Mehta on LLD",risk:"Rework of dev components",notes:"-"},
      {task:"UI/UX",activity:"Business sign off meeting",risk:"Business Sign off",notes:"Conditional pending"},
      {task:"UAT",activity:"E-2-E integrated testing with O2C",risk:"Business Sign off",notes:"Conditional pending"},
      {task:"APT",activity:"APT Closure",risk:"-",notes:"9/10 use cases passed"}
    ]},
    {name:"MVP Release 2",feat:34,lastWeek:[
      {task:"FDD",completed:"92%",notes:"Conditional sign off by PO done"},
      {task:"Tech design",completed:"50%",notes:"Pending LLD for Forecasting"},
      {task:"UI/UX",completed:"95%",notes:"Conditional sign off done"},
      {task:"Build/QA (168 Stories)",completed:"Build-100% / QA-67%",notes:"77 Defects, 13 in re-test"}
    ],nextWeek:[
      {task:"FDD",activity:"Complete pending FDDs",risk:"Business Sign off",notes:"Formal pending"},
      {task:"Tech design",activity:"Complete LLD for Forecasting, Capacity",risk:"Rework",notes:"-"},
      {task:"UI/UX",activity:"Business sign off",risk:"Business Sign off",notes:"Pending"},
      {task:"Build/QA",activity:"Test remaining 33% cases",risk:"-",notes:"77 Defects"}
    ]}
  ]},
  Platform: {lead:"Sarah Kim",color:"#10b981",rels:[
    {name:"MVP Release 1",feat:11,lastWeek:[
      {task:"FDD",completed:"100%",notes:"All features delivered"},
      {task:"Tech/Data/AI Arch",completed:"100%",notes:"Approved by CTO"},
      {task:"Build",completed:"100%",notes:"Code freeze complete"},
      {task:"QA Testing",completed:"85%",notes:"42/50 test cases passed"}
    ],nextWeek:[
      {task:"QA Testing",activity:"Complete remaining 8 test cases",risk:"Timeline pressure",notes:"Target 100% by Friday"},
      {task:"UAT prep",activity:"Set up UAT environment",risk:"-",notes:"Env provisioning done"}
    ]}
  ]},
  O2C: {lead:"Lisa Wang",color:"#f59e0b",rels:[
    {name:"MVP Release 1",feat:10,lastWeek:[
      {task:"FDD",completed:"100%",notes:"All signed off"},
      {task:"Build",completed:"100%",notes:"Code complete"},
      {task:"QA Testing",completed:"75%",notes:"Environment stabilized"},
      {task:"UAT",completed:"20%",notes:"Cycle 1 complete"}
    ],nextWeek:[
      {task:"QA Testing",activity:"Complete functional testing",risk:"Test data issues",notes:"New data loaded"},
      {task:"UAT",activity:"Begin UAT cycle 2",risk:"Business availability",notes:"Key users back Monday"}
    ]}
  ]},
  "FP&A": {lead:"Raj Patel",color:"#f59e0b",rels:[
    {name:"MVP Release 1",feat:9,lastWeek:[
      {task:"BRD/FDD",completed:"85%",notes:"2 features descoped"},
      {task:"Tech design",completed:"60%",notes:"New patterns needed"},
      {task:"UI/UX",completed:"70%",notes:"Dashboard mockups in review"}
    ],nextWeek:[
      {task:"BRD/FDD",activity:"Complete forecasting FDD",risk:"Scope creep",notes:"2 descoped"},
      {task:"Tech design",activity:"Consolidation module LLD",risk:"Complexity",notes:"New patterns"},
      {task:"UI/UX",activity:"Finalize dashboard mockups",risk:"-",notes:"Review feedback due"}
    ]}
  ]}
};

export default function Dashboard() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [selR, setSelR] = useState("All");
  const [selP, setSelP] = useState("All");
  const [capTab, setCapTab] = useState("pod");
  const [riskTab, setRiskTab] = useState("Overview");
  const [mileTab, setMileTab] = useState("Foundation");
  const [mileWeek, setMileWeek] = useState("last");

  useEffect(function() {
    async function load() {
      setLoading(true);
      var data = await fetchDashboardData();
      setRawData(data);
      setLoading(false);
    }
    load();
    if (CONFIG.REFRESH_MINUTES > 0) {
      var interval = setInterval(load, CONFIG.REFRESH_MINUTES * 60000);
      return function() { clearInterval(interval); };
    }
  }, []);

  var filtered = useMemo(function() {
    var d = rawData.filter(function(x) { return x.s; });
    if (selR !== "All") d = d.filter(function(x) { return x.r === selR; });
    if (selP !== "All") d = d.filter(function(x) { return x.p === selP; });
    return d;
  }, [selR, selP, rawData]);

  var stats = useMemo(function() {
    var t = filtered.length;
    var c = filtered.filter(function(x) { return x.s === "Completed"; }).length;
    var ot = filtered.filter(function(x) { return x.s === "On Track"; }).length;
    var ar = filtered.filter(function(x) { return x.s === "At Risk"; }).length;
    var dl = filtered.filter(function(x) { return x.s === "Delayed"; }).length;
    var ys = filtered.filter(function(x) { return x.s === "Yet to Start"; }).length;
    return { t: t, c: c, ot: ot, ar: ar, dl: dl, ys: ys, pct: t ? Math.round(c / t * 100) : 0 };
  }, [filtered]);

  var podStats = useMemo(function() {
    return PODS.map(function(p) {
      var items = filtered.filter(function(x) { return x.p === p; });
      if (!items.length) return null;
      return {
        p: p, t: items.length,
        c: items.filter(function(x) { return x.s === "Completed"; }).length,
        ot: items.filter(function(x) { return x.s === "On Track"; }).length,
        ar: items.filter(function(x) { return x.s === "At Risk"; }).length,
        dl: items.filter(function(x) { return x.s === "Delayed"; }).length,
        ys: items.filter(function(x) { return x.s === "Yet to Start"; }).length
      };
    }).filter(Boolean);
  }, [filtered]);

  var weeks = useMemo(function() {
    var result = [];
    var d = new Date(2025, 10, 3);
    var end = new Date(2027, 0, 11);
    while (d < end) {
      result.push(new Date(d));
      d = new Date(d.getTime() + 7 * 86400000);
    }
    return result;
  }, []);

  var getWeekIdx = function(dateStr) {
    if (!dateStr) return -1;
    var ts = new Date(dateStr).getTime();
    for (var i = 0; i < weeks.length; i++) {
      var wStart = weeks[i].getTime();
      var wEnd = i < weeks.length - 1 ? weeks[i + 1].getTime() : wStart + 7 * 86400000;
      if (ts >= wStart && ts < wEnd) return i;
    }
    return -1;
  };

  var allRisks = Object.values(RISK_ITEMS).flat();
  var font = "'DM Sans', sans-serif";
  var cardBg = "#1e293b";
  var pageBg = "#0f172a";

  var thStyle = { padding: "8px 6px", color: "#94a3b8", fontWeight: 600, textAlign: "left", borderBottom: "1px solid #334155", fontSize: 11, fontFamily: font, whiteSpace: "nowrap" };
  var tdStyle = { padding: "6px", color: "#cbd5e1", borderBottom: "1px solid rgba(51,65,85,0.5)", fontSize: 11, fontFamily: font };

  var mainTabs = [
    { id: "overview", l: "Overview" }, { id: "gantt", l: "Gantt" },
    { id: "capacity", l: "Capacity" }, { id: "risks", l: "Risks" },
    { id: "milestones", l: "Milestones" }, { id: "table", l: "Table" }
  ];

  var donutData = [
    { v: stats.c, c: SC.Completed, l: "Completed" },
    { v: stats.ot, c: SC["On Track"], l: "On Track" },
    { v: stats.ar, c: SC["At Risk"], l: "At Risk" },
    { v: stats.dl, c: SC.Delayed, l: "Delayed" },
    { v: stats.ys, c: SC["Yet to Start"], l: "Yet to Start" }
  ];
  var donutTotal = donutData.reduce(function(a, d) { return a + d.v; }, 0);

  if (loading) {
    return (
      <div style={{ background: pageBg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "3px solid #334155", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600, fontFamily: font }}>Loading dashboard data...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: pageBg, minHeight: "100vh", color: "#e2e8f0", fontFamily: font, padding: "24px 28px" }}>

      {/* Header */}
      <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 2 }}>{CONFIG.FY_LABEL}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "#f1f5f9" }}>{CONFIG.TITLE}</h1>
        <div style={{ display: "flex", gap: 3, background: cardBg, borderRadius: 10, padding: 3 }}>
          {mainTabs.map(function(t) {
            return <button key={t.id} onClick={function() { setTab(t.id); }} style={{ padding: "7px 18px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: tab === t.id ? "#3b82f6" : "transparent", color: tab === t.id ? "#fff" : "#94a3b8", fontFamily: font }}>{t.l}</button>;
          })}
        </div>
      </div>

      {/* Filters */}
      {(tab === "overview" || tab === "gantt" || tab === "table") && (
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#64748b", marginBottom: 5, textTransform: "uppercase" }}>Release</div>
            <div style={{ display: "flex", gap: 4 }}>
              {["All"].concat(RELS).map(function(r) {
                return <button key={r} onClick={function() { setSelR(r); }} style={{ padding: "6px 16px", borderRadius: 20, border: selR === r ? "1.5px solid #3b82f6" : "1px solid #334155", background: selR === r ? "rgba(59,130,246,0.1)" : "transparent", color: selR === r ? "#3b82f6" : "#94a3b8", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>{r}</button>;
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#64748b", marginBottom: 5, textTransform: "uppercase" }}>POD</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {["All"].concat(PODS).map(function(p) {
                return <button key={p} onClick={function() { setSelP(p); }} style={{ padding: "6px 16px", borderRadius: 20, border: selP === p ? "1.5px solid #3b82f6" : "1px solid #334155", background: selP === p ? "rgba(59,130,246,0.1)" : "transparent", color: selP === p ? "#3b82f6" : "#94a3b8", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>{p}</button>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div>
          <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
            {[["Total Tasks", stats.t, null], ["Completed", stats.pct + "%", "#10b981"], ["On Track", stats.ot, "#3b82f6"], ["At Risk", stats.ar, "#f59e0b"], ["Delayed", stats.dl, "#ef4444"]].map(function(k) {
              return <div key={k[0]} style={{ background: cardBg, borderRadius: 12, padding: "18px 22px", flex: 1, minWidth: 140, borderLeft: k[2] ? "3px solid " + k[2] : "none" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>{k[0]}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: k[2] || "#e2e8f0", lineHeight: 1 }}>{k[1]}</div>
                {k[0] === "Completed" && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{stats.c} of {stats.t}</div>}
              </div>;
            })}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={{ background: cardBg, borderRadius: 12, padding: 20, minWidth: 260, flex: "0 0 300px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#cbd5e1" }}>Status Breakdown</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <svg width={160} height={160} viewBox="0 0 160 160">
                  {donutTotal > 0 && donutData.reduce(function(acc, d, i) {
                    if (d.v === 0) return acc;
                    var pct = d.v / donutTotal;
                    var a1 = acc.cum * 2 * Math.PI - Math.PI / 2;
                    acc.cum += pct;
                    var a2 = acc.cum * 2 * Math.PI - Math.PI / 2;
                    var r = 60;
                    acc.paths.push(<path key={i} d={"M" + (80 + r * Math.cos(a1)) + "," + (80 + r * Math.sin(a1)) + " A" + r + "," + r + " 0 " + (pct > 0.5 ? 1 : 0) + " 1 " + (80 + r * Math.cos(a2)) + "," + (80 + r * Math.sin(a2))} fill="none" stroke={d.c} strokeWidth={18} />);
                    return acc;
                  }, { cum: 0, paths: [] }).paths}
                  <text x={80} y={76} textAnchor="middle" fill="#e2e8f0" fontSize="24" fontWeight="800" fontFamily={font}>{stats.pct}%</text>
                  <text x={80} y={92} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily={font}>Complete</text>
                </svg>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {donutData.filter(function(d) { return d.v > 0; }).map(function(d) {
                    return <div key={d.l} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
                      <div style={{ width: 9, height: 9, borderRadius: 2, background: d.c }} />
                      <span style={{ color: "#94a3b8" }}>{d.l}</span>
                      <span style={{ color: "#e2e8f0", fontWeight: 700, marginLeft: "auto" }}>{d.v}</span>
                    </div>;
                  })}
                </div>
              </div>
            </div>
            <div style={{ background: cardBg, borderRadius: 12, padding: 20, flex: 1, minWidth: 380 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#cbd5e1" }}>Status by POD</div>
              {podStats.map(function(ps) {
                var segs = [{v:ps.c,c:SC.Completed},{v:ps.ot,c:SC["On Track"]},{v:ps.ar,c:SC["At Risk"]},{v:ps.dl,c:SC.Delayed},{v:ps.ys,c:SC["Yet to Start"]}];
                return <div key={ps.p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 80, fontSize: 11, fontWeight: 600, color: "#94a3b8", textAlign: "right", flexShrink: 0 }}>{ps.p}</div>
                  <div style={{ display: "flex", height: 18, borderRadius: 3, overflow: "hidden", flex: 1 }}>
                    {segs.map(function(s, i) { return s.v > 0 ? <div key={i} style={{ width: (s.v / ps.t * 100) + "%", background: s.c, minWidth: 3 }} /> : null; })}
                  </div>
                  <div style={{ width: 28, fontSize: 10, color: "#64748b", textAlign: "right" }}>{ps.t}</div>
                </div>;
              })}
              <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
                {Object.entries(SC).map(function(e) { return <div key={e[0]} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#64748b" }}><div style={{ width: 7, height: 7, borderRadius: 2, background: e[1] }} />{e[0]}</div>; })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GANTT */}
      {tab === "gantt" && (
        <div style={{ background: cardBg, borderRadius: 14, padding: 20, overflowX: "auto" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>Release Timeline (Weekly)</div>
          <table style={{ borderCollapse: "collapse", minWidth: weeks.length * 50 + 170, fontSize: 10 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 160, minWidth: 160, position: "sticky", left: 0, background: cardBg, zIndex: 3 }}>POD / Release</th>
                {weeks.map(function(w, i) {
                  var isFirst = i === 0 || weeks[i - 1].getMonth() !== w.getMonth();
                  return <th key={i} style={{ ...thStyle, width: 48, minWidth: 48, textAlign: "center", padding: "4px 2px", borderLeft: isFirst ? "2px solid #475569" : "none" }}>
                    {isFirst && <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 10 }}>{w.toLocaleDateString("en", { month: "short" })} {w.getFullYear()}</div>}
                    <div style={{ color: "#64748b", fontSize: 9 }}>{w.getDate()}</div>
                  </th>;
                })}
              </tr>
            </thead>
            <tbody>
              {PODS.map(function(pod) {
                var podRels = RELS.map(function(rel) {
                  var items = filtered.filter(function(x) { return x.p === pod && x.r === rel && x.s; });
                  return items.length > 0 ? { rel: rel, items: items } : null;
                }).filter(Boolean);
                if (!podRels.length) return null;
                var rows = [];
                rows.push(
                  <tr key={pod + "-hdr"}>
                    <td style={{ position: "sticky", left: 0, background: "rgba(15,23,42,0.8)", zIndex: 1, padding: "10px 10px 4px 12px", fontWeight: 800, color: "#f1f5f9", fontSize: 13, borderTop: "2px solid #475569", borderBottom: "1px solid #334155", fontFamily: font }}>{pod}</td>
                    {weeks.map(function(w, wi) {
                      var isFirst = wi === 0 || weeks[wi - 1].getMonth() !== w.getMonth();
                      return <td key={wi} style={{ borderTop: "2px solid #475569", borderBottom: "1px solid #334155", borderLeft: isFirst ? "2px solid rgba(71,85,105,0.3)" : "none", background: "rgba(15,23,42,0.4)" }} />;
                    })}
                  </tr>
                );
                podRels.forEach(function(pr) {
                  rows.push(
                    <tr key={pod + "-" + pr.rel} style={{ height: 42 }}>
                      <td style={{ ...tdStyle, position: "sticky", left: 0, background: pageBg, zIndex: 1, padding: "5px 8px 5px 24px" }}>
                        <span style={{ color: "#3b82f6", fontWeight: 700, fontSize: 12 }}>{pr.rel}</span>
                      </td>
                      {weeks.map(function(w, wi) {
                        var gates = pr.items.filter(function(it) { return (it.sd || it.pd) && getWeekIdx(it.sd || it.pd) === wi; });
                        var isFirst = wi === 0 || weeks[wi - 1].getMonth() !== w.getMonth();
                        return <td key={wi} style={{ ...tdStyle, textAlign: "center", padding: "2px 1px", verticalAlign: "middle", borderLeft: isFirst ? "2px solid rgba(71,85,105,0.15)" : "none" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            {gates.map(function(g, gi) {
                              return <div key={gi} style={{ padding: "3px 7px", borderRadius: 5, background: SC[g.s] || "#334155", color: "#fff", fontSize: 9, fontWeight: 600, whiteSpace: "nowrap" }} title={g.g + " - " + g.s}>{g.g}</div>;
                            })}
                          </div>
                        </td>;
                      })}
                    </tr>
                  );
                });
                return rows;
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CAPACITY */}
      {tab === "capacity" && (
        <div style={{ background: cardBg, borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>CAPACITY BY PODS</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: pageBg, borderRadius: 8, padding: 3, width: "fit-content" }}>
            <button onClick={function() { setCapTab("pod"); }} style={{ padding: "7px 18px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: capTab === "pod" ? "#8b5cf6" : "transparent", color: capTab === "pod" ? "#fff" : "#94a3b8", fontFamily: font }}>POD Wise Fulfillment</button>
            <button onClick={function() { setCapTab("role"); }} style={{ padding: "7px 18px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: capTab === "role" ? "#8b5cf6" : "transparent", color: capTab === "role" ? "#fff" : "#94a3b8", fontFamily: font }}>Role-Category Breakup</button>
          </div>
          {(capTab === "pod" ? CAP_POD : CAP_ROLE).map(function(item) {
            var pct = Math.round(item.f / item.t * 100);
            var gaugeColor = pct >= 85 ? "#10b981" : pct >= 65 ? "#8b5cf6" : pct >= 45 ? "#f59e0b" : "#ef4444";
            return <div key={item.n} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0" }}>{item.n}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>Total: <b style={{ color: "#e2e8f0" }}>{item.t}</b> | Filled: <b style={{ color: gaugeColor }}>{pct}%</b> | Last Wk: <b style={{ color: "#8b5cf6" }}>+{item.lw}</b></span>
              </div>
              <div style={{ display: "flex", height: 30, borderRadius: 6, overflow: "hidden", background: "#334155" }}>
                <div style={{ width: (item.f / item.t * 100) + "%", background: "linear-gradient(90deg, #7c3aed, #8b5cf6)", display: "flex", alignItems: "center", paddingLeft: 10 }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{item.f}</span>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10 }}>
                  <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: 13 }}>{item.t - item.f}</span>
                </div>
              </div>
            </div>;
          })}
        </div>
      )}

      {/* RISKS */}
      {tab === "risks" && (
        <div style={{ background: cardBg, borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>TOP PRIORITY RISKS</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 20, background: pageBg, borderRadius: 8, padding: 3, overflowX: "auto" }}>
            {Object.keys(RISK_ITEMS).map(function(t) {
              return <button key={t} onClick={function() { setRiskTab(t); }} style={{ padding: "7px 16px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", background: riskTab === t ? "#8b5cf6" : "transparent", color: riskTab === t ? "#fff" : "#94a3b8", fontFamily: font, whiteSpace: "nowrap" }}>{t}</button>;
            })}
          </div>
          {riskTab === "Overview" ? (
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              {[["P1 - CRITICAL", allRisks.filter(function(x) { return x.pr === "P1"; }).length, "#ef4444"], ["P2 - HIGH", allRisks.filter(function(x) { return x.pr === "P2"; }).length, "#f59e0b"], ["P3 - MEDIUM", allRisks.filter(function(x) { return x.pr === "P3"; }).length, "#3b82f6"], ["P4 - LOW", allRisks.filter(function(x) { return x.pr === "P4"; }).length, "#6b7280"]].map(function(k) {
                return <div key={k[0]} style={{ background: pageBg, borderRadius: 12, padding: "18px 22px", flex: 1, minWidth: 140, borderLeft: "3px solid " + k[2] }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>{k[0]}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: k[2], lineHeight: 1 }}>{k[1]}</div>
                </div>;
              })}
            </div>
          ) : (
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
              <thead><tr>{["Priority", "Title", "Aging", "Impact", "Mitigation", "Owner"].map(function(h) { return <th key={h} style={{ ...thStyle, fontSize: 11, padding: "10px 8px" }}>{h}</th>; })}</tr></thead>
              <tbody>
                {(RISK_ITEMS[riskTab] || []).map(function(risk, i) {
                  return <tr key={i} style={{ background: i % 2 === 0 ? pageBg : cardBg, borderLeft: risk.pr === "P1" ? "3px solid #ef4444" : risk.pr === "P2" ? "3px solid #f59e0b" : "3px solid #3b82f6" }}>
                    <td style={tdStyle}><span style={{ background: risk.pr === "P1" ? "#ef4444" : risk.pr === "P2" ? "#f59e0b" : "#3b82f6", color: "#fff", padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontSize: 10 }}>{risk.pr}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{risk.title}</td>
                    <td style={tdStyle}><span style={{ color: "#ef4444", fontWeight: 700 }}>In {risk.age} Days</span></td>
                    <td style={{ ...tdStyle, color: "#f59e0b", fontWeight: 600 }}>{risk.impact}</td>
                    <td style={tdStyle}>{risk.mit}</td>
                    <td style={tdStyle}>{risk.owner}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MILESTONES */}
      {tab === "milestones" && (
        <div style={{ background: cardBg, borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>MILESTONES TRACKER</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 20, background: pageBg, borderRadius: 8, padding: 3, overflowX: "auto" }}>
            {Object.keys(MILES).map(function(p) {
              return <button key={p} onClick={function() { setMileTab(p); setMileWeek("last"); }} style={{ padding: "7px 16px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", background: mileTab === p ? "#10b981" : "transparent", color: mileTab === p ? "#fff" : "#94a3b8", fontFamily: font, whiteSpace: "nowrap" }}>{p}</button>;
            })}
          </div>
          {MILES[mileTab] && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>{mileTab}</div>
                <div style={{ width: 14, height: 14, borderRadius: 7, background: MILES[mileTab].color }} />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Lead: <b style={{ color: "#e2e8f0" }}>{MILES[mileTab].lead}</b></span>
              </div>
              <div style={{ display: "flex", gap: 4, marginBottom: 24, background: pageBg, borderRadius: 8, padding: 3, width: "fit-content" }}>
                <button onClick={function() { setMileWeek("last"); }} style={{ padding: "7px 18px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: mileWeek === "last" ? "#8b5cf6" : "transparent", color: mileWeek === "last" ? "#fff" : "#94a3b8", fontFamily: font }}>Last Week Update (30th Mar - 3rd Apr)</button>
                <button onClick={function() { setMileWeek("next"); }} style={{ padding: "7px 18px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: mileWeek === "next" ? "#8b5cf6" : "transparent", color: mileWeek === "next" ? "#fff" : "#94a3b8", fontFamily: font }}>Next Week Plan (6th Apr - 10th Apr)</button>
              </div>
              {MILES[mileTab].rels.map(function(rel, ri) {
                return <div key={ri} style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #334155" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{rel.name}</div>
                    <div style={{ background: pageBg, padding: "3px 10px", borderRadius: 6, fontSize: 11, color: "#8b5cf6", fontWeight: 600 }}>{rel.feat} Features</div>
                  </div>
                  {mileWeek === "last" ? (
                    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
                      <thead><tr><th style={{ ...thStyle, width: "30%" }}>Last Week Plan</th><th style={{ ...thStyle, width: "18%", textAlign: "center" }}>Completed</th><th style={{ ...thStyle, width: "52%" }}>Notes</th></tr></thead>
                      <tbody>
                        {rel.lastWeek.map(function(item, ii) {
                          var isComp = item.completed === "100%";
                          var isYts = item.completed === "Yet to Start" || item.completed === "-";
                          var pctColor = isComp ? "#10b981" : isYts ? "#ef4444" : "#f59e0b";
                          return <tr key={ii} style={{ background: ii % 2 === 0 ? pageBg : cardBg }}>
                            <td style={{ ...tdStyle, fontWeight: 600 }}>{item.task}</td>
                            <td style={{ ...tdStyle, textAlign: "center" }}><span style={{ padding: "3px 12px", borderRadius: 6, background: pctColor + "22", color: pctColor, fontWeight: 700 }}>{item.completed}</span></td>
                            <td style={{ ...tdStyle, color: "#94a3b8" }}>{item.notes}</td>
                          </tr>;
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
                      <thead><tr><th style={{ ...thStyle, width: "18%" }}>Stage Gate</th><th style={{ ...thStyle, width: "34%", color: "#10b981" }}>Next Week Activities</th><th style={{ ...thStyle, width: "22%", color: "#f59e0b" }}>At Risk</th><th style={{ ...thStyle, width: "26%" }}>Notes</th></tr></thead>
                      <tbody>
                        {rel.nextWeek.map(function(item, ii) {
                          return <tr key={ii} style={{ background: ii % 2 === 0 ? pageBg : cardBg }}>
                            <td style={{ ...tdStyle, fontWeight: 600 }}>{item.task}</td>
                            <td style={tdStyle}>{item.activity}</td>
                            <td style={{ ...tdStyle, color: item.risk !== "-" ? "#f59e0b" : "#64748b" }}>{item.risk}</td>
                            <td style={{ ...tdStyle, color: "#94a3b8" }}>{item.notes}</td>
                          </tr>;
                        })}
                      </tbody>
                    </table>
                  )}
                </div>;
              })}
            </div>
          )}
        </div>
      )}

      {/* TABLE */}
      {tab === "table" && (
        <div style={{ background: cardBg, borderRadius: 12, padding: 16, overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 800, fontSize: 11 }}>
            <thead><tr>{["Release", "POD", "Stage Gate", "Status", "Start", "Planned End", "Actual End", "Delay"].map(function(h) { return <th key={h} style={thStyle}>{h}</th>; })}</tr></thead>
            <tbody>
              {filtered.slice(0, 100).map(function(row, i) {
                return <tr key={i} style={{ background: i % 2 === 0 ? pageBg : cardBg }}>
                  <td style={tdStyle}>{row.r}</td>
                  <td style={tdStyle}>{row.p}</td>
                  <td style={tdStyle}>{row.g}</td>
                  <td style={tdStyle}><span style={{ padding: "2px 10px", borderRadius: 10, background: (SC[row.s] || "#475569") + "22", color: SC[row.s] || "#94a3b8", fontWeight: 700, fontSize: 10 }}>{row.s}</span></td>
                  <td style={tdStyle}>{row.sd ? row.sd.substring(5) : "-"}</td>
                  <td style={tdStyle}>{row.pd ? row.pd.substring(5) : "-"}</td>
                  <td style={tdStyle}>{row.ad ? row.ad.substring(5) : "-"}</td>
                  <td style={{ ...tdStyle, fontWeight: row.dd ? 700 : 400, color: row.dd > 0 ? "#ef4444" : row.dd < 0 ? "#10b981" : "#cbd5e1" }}>{row.dd != null ? (row.dd > 0 ? "+" : "") + row.dd : "-"}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
