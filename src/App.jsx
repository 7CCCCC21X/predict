import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";

const ConfigCtx = createContext();
const PROXY_BASE = "/proxy";

async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(`${PROXY_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...opts.headers }, ...opts,
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch (e) { console.error(`API ${path}:`, e); return null; }
}

const MOCK_MARKETS = [
  { id:"mkt_001",title:"Will BTC exceed $150K by end of 2026?",volume:892450,createdAt:"2026-03-15T10:00:00Z",cutoffAt:"2026-12-31T23:59:00Z",outcomes:[{name:"Yes",price:0.62},{name:"No",price:0.38}],stats:{trades:3842}},
  { id:"mkt_002",title:"Will ETH flip BTC market cap in 2026?",volume:534200,createdAt:"2026-02-20T08:00:00Z",cutoffAt:"2026-12-31T23:59:00Z",outcomes:[{name:"Yes",price:0.08},{name:"No",price:0.92}],stats:{trades:1920}},
  { id:"mkt_003",title:"US Fed rate cut before July 2026?",volume:1245800,createdAt:"2026-01-10T12:00:00Z",cutoffAt:"2026-07-01T00:00:00Z",outcomes:[{name:"Yes",price:0.71},{name:"No",price:0.29}],stats:{trades:6103}},
  { id:"mkt_004",title:"Apple announces AR glasses at WWDC 2026?",volume:328900,createdAt:"2026-03-28T09:00:00Z",cutoffAt:"2026-06-15T00:00:00Z",outcomes:[{name:"Yes",price:0.45},{name:"No",price:0.55}],stats:{trades:1455}},
  { id:"mkt_005",title:"Will SOL surpass $500 in Q2 2026?",volume:667300,createdAt:"2026-03-01T14:00:00Z",cutoffAt:"2026-06-30T23:59:00Z",outcomes:[{name:"Yes",price:0.22},{name:"No",price:0.78}],stats:{trades:2780}},
  { id:"mkt_006",title:"Tesla delivers Robotaxi by Sept 2026?",volume:445600,createdAt:"2026-02-14T11:00:00Z",cutoffAt:"2026-09-30T23:59:00Z",outcomes:[{name:"Yes",price:0.33},{name:"No",price:0.67}],stats:{trades:2105}},
  { id:"mkt_007",title:"Champions League 2026: Real Madrid wins?",volume:789100,createdAt:"2026-01-20T16:00:00Z",cutoffAt:"2026-05-30T22:00:00Z",outcomes:[{name:"Real Madrid",price:0.28},{name:"Man City",price:0.22},{name:"Bayern",price:0.18},{name:"Other",price:0.32}],stats:{trades:4210}},
  { id:"mkt_008",title:"Will Base TVL exceed $20B by June 2026?",volume:256700,createdAt:"2026-04-01T07:00:00Z",cutoffAt:"2026-06-30T23:59:00Z",outcomes:[{name:"Yes",price:0.55},{name:"No",price:0.45}],stats:{trades:988}},
  { id:"mkt_009",title:"OpenAI IPO in 2026?",volume:1023400,createdAt:"2026-01-05T10:00:00Z",cutoffAt:"2026-12-31T23:59:00Z",outcomes:[{name:"Yes",price:0.41},{name:"No",price:0.59}],stats:{trades:5320}},
  { id:"mkt_010",title:"Ethereum Pectra upgrade live by May 2026?",volume:178500,createdAt:"2026-03-20T13:00:00Z",cutoffAt:"2026-05-31T23:59:00Z",outcomes:[{name:"Yes",price:0.82},{name:"No",price:0.18}],stats:{trades:760}},
  { id:"mkt_011",title:"S&P 500 closes above 6500 end of April?",volume:567800,createdAt:"2026-04-02T09:00:00Z",cutoffAt:"2026-04-30T20:00:00Z",outcomes:[{name:"Yes",price:0.58},{name:"No",price:0.42}],stats:{trades:3100}},
  { id:"mkt_012",title:"Will DOGE reach $1 in 2026?",volume:345200,createdAt:"2026-02-28T15:00:00Z",cutoffAt:"2026-12-31T23:59:00Z",outcomes:[{name:"Yes",price:0.05},{name:"No",price:0.95}],stats:{trades:1670}},
];

const MOCK_MATCHES = [
  {id:"m1",marketTitle:"US Fed rate cut before July 2026?",side:"buy",amount:5200,price:0.71,timestamp:"2026-04-09T14:32:10Z",taker:"0x1a2b3c4d5e6f7890abcdef1234567890abcdef12"},
  {id:"m2",marketTitle:"Will BTC exceed $150K by end of 2026?",side:"sell",amount:3100,price:0.62,timestamp:"2026-04-09T14:28:45Z",taker:"0xabcdef1234567890abcdef1234567890abcdef12"},
  {id:"m3",marketTitle:"OpenAI IPO in 2026?",side:"buy",amount:8700,price:0.41,timestamp:"2026-04-09T14:25:03Z",taker:"0x9876543210fedcba9876543210fedcba98765432"},
  {id:"m4",marketTitle:"Champions League 2026: Real Madrid wins?",side:"buy",amount:1250,price:0.28,timestamp:"2026-04-09T14:20:18Z",taker:"0xdeadbeef12345678deadbeef12345678deadbeef"},
  {id:"m5",marketTitle:"Will SOL surpass $500 in Q2 2026?",side:"buy",amount:4400,price:0.22,timestamp:"2026-04-09T14:18:55Z",taker:"0x1111222233334444555566667777888899990000"},
  {id:"m6",marketTitle:"US Fed rate cut before July 2026?",side:"buy",amount:12600,price:0.715,timestamp:"2026-04-09T14:15:30Z",taker:"0xaaaa1111bbbb2222cccc3333dddd4444eeee5555"},
  {id:"m7",marketTitle:"S&P 500 closes above 6500 end of April?",side:"sell",amount:2800,price:0.58,timestamp:"2026-04-09T14:12:20Z",taker:"0x5555aaaa6666bbbb7777cccc8888dddd9999eeee"},
  {id:"m8",marketTitle:"Will BTC exceed $150K by end of 2026?",side:"buy",amount:15300,price:0.625,timestamp:"2026-04-09T14:10:08Z",taker:"0xfedcba0987654321fedcba0987654321fedcba09"},
  {id:"m9",marketTitle:"Tesla delivers Robotaxi by Sept 2026?",side:"sell",amount:950,price:0.33,timestamp:"2026-04-09T14:05:44Z",taker:"0x12340bcd56780fgh12340bcd56780fgh12345678"},
  {id:"m10",marketTitle:"Will ETH flip BTC market cap in 2026?",side:"buy",amount:6200,price:0.08,timestamp:"2026-04-09T14:01:12Z",taker:"0xabababababababababababababababababababab12"},
  {id:"m11",marketTitle:"OpenAI IPO in 2026?",side:"sell",amount:3300,price:0.405,timestamp:"2026-04-09T13:58:30Z",taker:"0xcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd12"},
  {id:"m12",marketTitle:"Apple announces AR glasses at WWDC 2026?",side:"buy",amount:7800,price:0.45,timestamp:"2026-04-09T13:55:00Z",taker:"0xefefefefefefefefefefefefefefefefefefefef12"},
];

const MOCK_POSITIONS = [
  {marketTitle:"Will BTC exceed $150K by end of 2026?",outcome:"Yes",shares:840,avgPrice:0.58,currentPrice:0.62,pnl:33.6},
  {marketTitle:"US Fed rate cut before July 2026?",outcome:"Yes",shares:1500,avgPrice:0.65,currentPrice:0.71,pnl:90.0},
  {marketTitle:"Will SOL surpass $500 in Q2 2026?",outcome:"No",shares:600,avgPrice:0.72,currentPrice:0.78,pnl:36.0},
  {marketTitle:"OpenAI IPO in 2026?",outcome:"Yes",shares:2200,avgPrice:0.44,currentPrice:0.41,pnl:-66.0},
];

const T={bg:"#07080c",surface:"#0f1017",surfaceAlt:"#151620",border:"#1c1e2e",borderHover:"#282b42",text:"#dfe1ec",textDim:"#6770a0",textMuted:"#3d4268",accent:"#00e5a0",accentDim:"rgba(0,229,160,0.1)",red:"#ff4d6a",redDim:"rgba(255,77,106,0.1)",yellow:"#ffc247",blue:"#4d8eff"};
const mono=`'JetBrains Mono','SF Mono',monospace`;
const sans=`'DM Sans',system-ui,sans-serif`;

const Pill=({active,children,onClick})=><button onClick={onClick} style={{padding:"5px 13px",borderRadius:6,border:`1px solid ${active?T.accent:T.border}`,background:active?T.accentDim:"transparent",color:active?T.accent:T.textDim,fontSize:11,fontFamily:mono,cursor:"pointer",whiteSpace:"nowrap"}}>{children}</button>;
const StatBox=({label,value,color})=><div style={{padding:"12px 16px",background:T.surfaceAlt,borderRadius:8,border:`1px solid ${T.border}`,minWidth:100}}><div style={{fontSize:10,color:T.textDim,fontFamily:mono,marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>{label}</div><div style={{fontSize:18,color:color||T.text,fontFamily:mono,fontWeight:700}}>{value??"—"}</div></div>;
const Badge=({children,color})=><span style={{display:"inline-block",padding:"2px 8px",borderRadius:4,fontSize:10,fontFamily:mono,fontWeight:600,color:color||T.accent,background:color?`${color}18`:T.accentDim,textTransform:"uppercase",letterSpacing:.5}}>{children}</span>;
const Spinner=()=><div style={{display:"flex",justifyContent:"center",padding:40}}><div style={{width:24,height:24,border:`2px solid ${T.border}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin .8s linear infinite"}}/></div>;
const Hint=({children})=><div style={{marginTop:16,padding:12,background:`${T.blue}08`,border:`1px solid ${T.blue}20`,borderRadius:8,fontSize:10,fontFamily:mono,color:T.blue}}>{children}</div>;

function MarketMonitor(){
  const {live}=useContext(ConfigCtx);
  const [markets,setMarkets]=useState(MOCK_MARKETS);
  const [loading,setLoading]=useState(false);
  const [sortBy,setSortBy]=useState("volume");
  const [search,setSearch]=useState("");
  const [autoRefresh,setAutoRefresh]=useState(true);
  const [error,setError]=useState(null);

  const fetchLive=useCallback(async()=>{
    setLoading(true);setError(null);
    const data=await apiFetch("/v1/markets?limit=50&status=active");
    if(data){const list=data.data||(Array.isArray(data)?data:[]);if(list.length>0)setMarkets(list);else setError("API returned empty");}
    else setError("API request failed");
    setLoading(false);
  },[]);

  useEffect(()=>{if(live)fetchLive();else setMarkets(MOCK_MARKETS);},[live]);
  useEffect(()=>{if(!live||!autoRefresh)return;const id=setInterval(fetchLive,30000);return()=>clearInterval(id);},[live,autoRefresh,fetchLive]);

  const sorted=useMemo(()=>{
    let l=[...markets];
    if(search){const q=search.toLowerCase();l=l.filter(m=>(m.title||m.question||"").toLowerCase().includes(q));}
    if(sortBy==="volume")l.sort((a,b)=>(b.volume||0)-(a.volume||0));
    if(sortBy==="newest")l.sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
    return l;
  },[markets,sortBy,search]);

  return <div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:16}}>
      <input placeholder="搜索市场..." value={search} onChange={e=>setSearch(e.target.value)} style={{padding:"8px 14px",background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontFamily:mono,fontSize:12,outline:"none",flex:1,minWidth:160}}/>
      <Pill active={sortBy==="volume"} onClick={()=>setSortBy("volume")}>交易量↓</Pill>
      <Pill active={sortBy==="newest"} onClick={()=>setSortBy("newest")}>最新</Pill>
      <Pill active={autoRefresh} onClick={()=>setAutoRefresh(!autoRefresh)}>自动刷新 {autoRefresh?"ON":"OFF"}</Pill>
      {live&&<button onClick={fetchLive} style={{padding:"6px 14px",background:T.accentDim,border:`1px solid ${T.accent}33`,borderRadius:6,color:T.accent,fontFamily:mono,fontSize:11,cursor:"pointer"}}>刷新</button>}
    </div>
    <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
      <StatBox label="总市场" value={markets.length} color={T.accent}/><StatBox label="筛选" value={sorted.length}/>
    </div>
    {error&&<div style={{padding:12,marginBottom:12,background:T.redDim,border:`1px solid ${T.red}33`,borderRadius:8,fontSize:11,fontFamily:mono,color:T.red}}>{error}</div>}
    {loading?<Spinner/>:<div style={{display:"flex",flexDirection:"column",gap:6}}>
      {sorted.map(m=>{const outcomes=m.outcomes||m.options||[];
        return <div key={m.id||m.marketId} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:8}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,color:T.text,fontFamily:sans,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.title||m.question||m.id}</div>
            <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
              {outcomes.slice(0,4).map((o,i)=>{const lbl=typeof o==="string"?o:o.name||o.title||`#${i+1}`;const pr=typeof o==="object"?o.price:null;
                return <span key={i} style={{fontSize:10,fontFamily:mono,padding:"2px 7px",borderRadius:4,background:i===0?T.accentDim:i===1?T.redDim:`${T.blue}15`,color:i===0?T.accent:i===1?T.red:T.blue}}>{lbl}{pr!=null?` ${(pr*100).toFixed(1)}¢`:""}</span>;})}
            </div>
          </div>
          <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
            <div style={{fontSize:14,fontFamily:mono,fontWeight:700,color:T.accent}}>${((m.volume||0)/1000).toFixed(0)}K</div>
            <div style={{fontSize:9,color:T.textMuted,fontFamily:mono}}>VOL</div>
          </div>
        </div>;})}
    </div>}
    {!live&&<Hint>MOCK 模式 — 部署后切 LIVE 调用 GET /v1/markets</Hint>}
  </div>;
}

function VolumeRanking(){
  const {live}=useContext(ConfigCtx);
  const [w,setW]=useState("1h");
  const [markets,setMarkets]=useState(MOCK_MARKETS);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    if(!live){setMarkets(MOCK_MARKETS);return;}
    (async()=>{setLoading(true);const data=await apiFetch("/v1/markets?limit=100&status=active");const list=data?.data||(Array.isArray(data)?data:[]);if(list.length>0)setMarkets(list);setLoading(false);})();
  },[live]);

  const sorted=useMemo(()=>[...markets].sort((a,b)=>(b.volume||0)-(a.volume||0)),[markets]);

  return <div>
    <div style={{display:"flex",gap:8,marginBottom:16}}>{["15m","1h","4h","12h"].map(t=><Pill key={t} active={w===t} onClick={()=>setW(t)}>{t}</Pill>)}</div>
    {loading?<Spinner/>:<div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontFamily:mono,fontSize:12}}>
        <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
          {["#","市场","交易量","成交数"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",color:T.textDim,fontWeight:500,fontSize:10,textTransform:"uppercase",letterSpacing:1}}>{h}</th>)}
        </tr></thead>
        <tbody>{sorted.map((m,i)=><tr key={m.id||i} style={{borderBottom:`1px solid ${T.border}08`}}>
          <td style={{padding:"10px 12px",color:i<3?T.accent:T.textDim,fontWeight:700,width:36}}>{i+1}</td>
          <td style={{padding:"10px 12px",color:T.text,maxWidth:280,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title||m.question||m.id}</td>
          <td style={{padding:"10px 12px",color:T.accent,fontWeight:600}}>${(m.volume||0).toLocaleString()}</td>
          <td style={{padding:"10px 12px"}}><Badge>{m.stats?.trades||"—"} trades</Badge></td>
        </tr>)}</tbody>
      </table>
    </div>}
  </div>;
}

function OrderFlow(){
  const {live}=useContext(ConfigCtx);
  const [matches,setMatches]=useState(MOCK_MATCHES);
  const [loading,setLoading]=useState(false);
  const [min,setMin]=useState(100);

  useEffect(()=>{
    if(!live){setMatches(MOCK_MATCHES);return;}
    (async()=>{setLoading(true);const data=await apiFetch("/v1/orders/matches?limit=100");const list=data?.data||(Array.isArray(data)?data:[]);if(list.length>0)setMatches(list);setLoading(false);})();
  },[live]);

  const filtered=useMemo(()=>matches.filter(m=>(m.amount||m.filledAmount||0)>=min),[matches,min]);
  const bigCount=matches.filter(m=>(m.amount||m.filledAmount||0)>=5000).length;

  return <div>
    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
      <span style={{fontSize:11,color:T.textDim,fontFamily:mono}}>最低金额 $</span>
      <input type="number" value={min} onChange={e=>setMin(Number(e.target.value))} style={{width:80,padding:"6px 10px",background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontFamily:mono,fontSize:12}}/>
      <Badge color={T.yellow}>{bigCount} 大单 (&gt;$5K)</Badge><Badge>{matches.length} 总成交</Badge>
    </div>
    {loading?<Spinner/>:<div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontFamily:mono,fontSize:11}}>
        <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
          {["时间","市场","方向","金额","价格","交易者"].map(h=><th key={h} style={{padding:"9px 12px",textAlign:"left",color:T.textDim,fontWeight:500,fontSize:10,textTransform:"uppercase",letterSpacing:1}}>{h}</th>)}
        </tr></thead>
        <tbody>{filtered.map((m,i)=>{const buy=(m.side||"").toLowerCase().includes("buy");const amt=m.amount||m.filledAmount||0;const ts=m.timestamp||m.createdAt;const addr=m.taker||m.maker||"";
          return <tr key={m.id||i} style={{borderBottom:`1px solid ${T.border}08`}}>
            <td style={{padding:"8px 12px",color:T.textMuted,fontSize:10}}>{ts?new Date(ts).toLocaleTimeString():"—"}</td>
            <td style={{padding:"8px 12px",color:T.text,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.marketTitle||m.marketId||"—"}</td>
            <td style={{padding:"8px 12px"}}><span style={{color:buy?T.accent:T.red,fontWeight:600}}>{buy?"BUY":"SELL"}</span></td>
            <td style={{padding:"8px 12px",color:amt>=5000?T.yellow:T.text,fontWeight:600}}>${amt.toLocaleString()}</td>
            <td style={{padding:"8px 12px",color:T.yellow}}>{m.price!=null?`${(m.price*100).toFixed(1)}¢`:"—"}</td>
            <td style={{padding:"8px 12px",color:T.textDim,fontSize:10}}>{addr?`${addr.slice(0,6)}…${addr.slice(-4)}`:"—"}</td>
          </tr>;})}</tbody>
      </table>
    </div>}
  </div>;
}

function WalletLookup(){
  const {live}=useContext(ConfigCtx);
  const [addr,setAddr]=useState("");
  const [pos,setPos]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);

  const lookup=async()=>{
    if(!addr)return;setLoading(true);setError(null);
    if(!live){setTimeout(()=>{setPos(MOCK_POSITIONS);setLoading(false);},400);return;}
    const data=await apiFetch(`/positions/${addr}`);
    if(data){setPos(data.data||(Array.isArray(data)?data:[]));}else{setError("查询失败");setPos([]);}
    setLoading(false);
  };

  const totalPnl=pos?pos.reduce((s,p)=>s+(p.pnl||0),0):0;

  return <div>
    <div style={{display:"flex",gap:10,marginBottom:20}}>
      <input placeholder="输入钱包地址 0x…" value={addr} onChange={e=>setAddr(e.target.value)} onKeyDown={e=>e.key==="Enter"&&lookup()}
        style={{flex:1,padding:"10px 14px",background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontFamily:mono,fontSize:12,outline:"none"}}/>
      <button onClick={lookup} style={{padding:"10px 22px",background:T.accent,border:"none",borderRadius:6,color:T.bg,fontFamily:mono,fontSize:12,fontWeight:700,cursor:"pointer"}}>查询</button>
    </div>
    {error&&<div style={{padding:12,marginBottom:12,background:T.redDim,border:`1px solid ${T.red}33`,borderRadius:8,fontSize:11,fontFamily:mono,color:T.red}}>{error}</div>}
    {loading&&<Spinner/>}
    {pos&&!loading&&<>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <StatBox label="持仓数" value={pos.length} color={T.accent}/>
        <StatBox label="总 PnL" value={`${totalPnl>=0?"+":""}$${totalPnl.toFixed(2)}`} color={totalPnl>=0?T.accent:T.red}/>
      </div>
      {pos.length===0?<div style={{textAlign:"center",padding:30,color:T.textDim,fontFamily:mono}}>该地址暂无持仓</div>
      :<div style={{display:"flex",flexDirection:"column",gap:6}}>
        {pos.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:8}}>
          <div><div style={{fontSize:13,fontFamily:sans,color:T.text,fontWeight:500}}>{p.marketTitle||`#${i+1}`}</div>
            <div style={{fontSize:10,color:T.textDim,fontFamily:mono,marginTop:3}}>{p.outcome||"—"} · {p.shares||"—"} shares</div></div>
          <div style={{fontSize:15,fontFamily:mono,fontWeight:700,color:(p.pnl||0)>=0?T.accent:T.red}}>{(p.pnl||0)>=0?"+":""}${(p.pnl||0).toFixed(2)}</div>
        </div>)}
      </div>}
    </>}
  </div>;
}

function FeeCalculator(){
  const [price,setPrice]=useState(50);const [amount,setAmount]=useState(100);const [k,setK]=useState(0.08);const [discount,setDiscount]=useState(0.9);
  const p=price/100,feeRate=k*p*(1-p)*discount,fee=amount*feeRate,maxRate=k*0.25*discount;
  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
      {[{l:"目标价格 (¢)",v:price,s:setPrice,min:1,max:99},{l:"交易金额 ($)",v:amount,s:setAmount,min:1,max:100000},{l:"费率系数 k",v:k,s:setK,min:0.01,max:0.2,step:0.01},{l:"折扣率",v:discount,s:setDiscount,min:0.5,max:1,step:0.05}].map(({l,v,s,...r})=>
        <div key={l}><label style={{fontSize:10,color:T.textDim,fontFamily:mono,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{l}</label>
          <input type="number" value={v} onChange={e=>s(Number(e.target.value))} {...r} style={{width:"100%",padding:"9px 12px",background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontFamily:mono,fontSize:13,boxSizing:"border-box"}}/></div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
      <StatBox label="手续费" value={`$${fee.toFixed(4)}`} color={T.yellow}/><StatBox label="费率" value={`${(feeRate*100).toFixed(4)}%`} color={T.accent}/><StatBox label="最大费率" value={`${(maxRate*100).toFixed(2)}%`}/>
    </div>
    <div style={{padding:16,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10}}>
      <div style={{fontSize:10,color:T.textDim,fontFamily:mono,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>费率曲线 · fee = k × p × (1-p) × discount</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:1,height:100}}>
        {Array.from({length:99},(_,i)=>{const cp=(i+1)/100,rate=k*cp*(1-cp)*discount,h=(rate/maxRate)*100,active=i+1===Math.round(price);
          return<div key={i} style={{flex:1,height:`${h}%`,background:active?T.accent:`${T.accent}30`,borderRadius:"2px 2px 0 0",minWidth:1}}/>;
        })}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
        <span style={{fontSize:9,color:T.textMuted,fontFamily:mono}}>1¢</span>
        <span style={{fontSize:10,color:T.accent,fontFamily:mono}}>{price}¢ → {(feeRate*100).toFixed(3)}%</span>
        <span style={{fontSize:9,color:T.textMuted,fontFamily:mono}}>99¢</span>
      </div>
    </div>
  </div>;
}

function WSMonitor(){
  const {live}=useContext(ConfigCtx);
  const [mktId,setMktId]=useState("mkt_003");
  const [connected,setConnected]=useState(false);
  const [logs,setLogs]=useState([]);
  const wsRef=useRef(null);const intRef=useRef(null);const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[logs]);
  const addLog=useCallback((type,msg)=>{setLogs(p=>[...p.slice(-150),{type,msg,time:new Date().toLocaleTimeString()}]);},[]);

  const connect=()=>{
    if(!mktId)return;
    if(live){
      try{
        const ws=new WebSocket("wss://ws.predict.fun/ws");wsRef.current=ws;
        ws.onopen=()=>{setConnected(true);addLog("system","已连接");ws.send(JSON.stringify({method:"subscribe",requestId:`sub_${Date.now()}`,params:{topics:[`predictOrderbook/${mktId}`]}}));addLog("out",`订阅 predictOrderbook/${mktId}`);};
        ws.onmessage=(e)=>{try{const msg=JSON.parse(e.data);if(msg.method==="heartbeat"){ws.send(JSON.stringify({method:"heartbeat",data:msg.data}));return;}addLog("in",JSON.stringify(msg).slice(0,400));}catch{addLog("in",e.data?.slice?.(0,400)||"binary");}};
        ws.onclose=()=>{setConnected(false);addLog("system","已关闭");};ws.onerror=()=>addLog("error","连接错误");
      }catch(e){addLog("error",e.message);}
    }else{
      setConnected(true);addLog("system","[MOCK] 模拟连接");
      addLog("in",`{"status":"subscribed","topic":"predictOrderbook/${mktId}"}`);
      intRef.current=setInterval(()=>{const side=Math.random()>.5?"bid":"ask",pr=(Math.random()*.4+.5).toFixed(3),sz=Math.floor(Math.random()*5000+100);
        addLog("in",JSON.stringify({topic:`predictOrderbook/${mktId}`,data:{side,price:pr,size:sz,ts:Date.now()}}));},2500);
    }
  };
  const disconnect=()=>{wsRef.current?.close();wsRef.current=null;clearInterval(intRef.current);setConnected(false);addLog("system","已断开");};
  useEffect(()=>()=>{wsRef.current?.close();clearInterval(intRef.current);},[]);

  const lc={system:T.blue,in:T.accent,out:T.yellow,error:T.red};
  return <div>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
      <input placeholder="Market ID" value={mktId} onChange={e=>setMktId(e.target.value)} style={{flex:1,minWidth:160,padding:"8px 12px",background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontFamily:mono,fontSize:12}}/>
      {!connected?<button onClick={connect} style={{padding:"8px 18px",background:T.accentDim,border:`1px solid ${T.accent}44`,borderRadius:6,color:T.accent,fontFamily:mono,fontSize:11,cursor:"pointer"}}>连接</button>
        :<button onClick={disconnect} style={{padding:"8px 18px",background:T.redDim,border:`1px solid ${T.red}44`,borderRadius:6,color:T.red,fontFamily:mono,fontSize:11,cursor:"pointer"}}>断开</button>}
      <button onClick={()=>setLogs([])} style={{padding:"8px 12px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:6,color:T.textDim,fontFamily:mono,fontSize:11,cursor:"pointer"}}>清空</button>
      <Badge color={connected?T.accent:T.red}>{connected?"LIVE":"OFFLINE"}</Badge>
    </div>
    <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:12,height:340,overflowY:"auto",fontFamily:mono,fontSize:10,lineHeight:1.7}}>
      {logs.length===0&&<div style={{color:T.textMuted,textAlign:"center",padding:40}}>点击连接开始</div>}
      {logs.map((l,i)=><div key={i}><span style={{color:T.textMuted}}>{l.time}</span>{" "}<span style={{color:lc[l.type]||T.textDim}}>[{l.type}]</span>{" "}<span style={{color:T.text,wordBreak:"break-all"}}>{l.msg}</span></div>)}
      <div ref={endRef}/>
    </div>
  </div>;
}

function SettlementCalendar(){
  const {live}=useContext(ConfigCtx);
  const [markets,setMarkets]=useState(MOCK_MARKETS);
  const [filter,setFilter]=useState("all");

  useEffect(()=>{
    if(!live){setMarkets(MOCK_MARKETS);return;}
    (async()=>{const data=await apiFetch("/v1/markets?limit=200");const list=data?.data||(Array.isArray(data)?data:[]);if(list.length>0)setMarkets(list);})();
  },[live]);

  const now=new Date();
  const eow=new Date(now);eow.setDate(now.getDate()+(7-now.getDay()));
  const eom=new Date(now.getFullYear(),now.getMonth()+1,0);
  const filtered=useMemo(()=>markets.filter(m=>m.cutoffAt||m.endDate).filter(m=>{const d=new Date(m.cutoffAt||m.endDate);if(d<now)return false;if(filter==="week")return d<=eow;if(filter==="month")return d<=eom;return true;}).sort((a,b)=>new Date(a.cutoffAt||a.endDate)-new Date(b.cutoffAt||b.endDate)),[markets,filter]);
  const todayN=markets.filter(m=>new Date(m.cutoffAt||m.endDate||0).toDateString()===now.toDateString()).length;

  return <div>
    <div style={{display:"flex",gap:8,marginBottom:16}}><Pill active={filter==="all"} onClick={()=>setFilter("all")}>全部</Pill><Pill active={filter==="week"} onClick={()=>setFilter("week")}>本周</Pill><Pill active={filter==="month"} onClick={()=>setFilter("month")}>本月</Pill></div>
    <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}><StatBox label="即将结算" value={filtered.length} color={T.yellow}/><StatBox label="今日结算" value={todayN} color={todayN>0?T.red:T.textDim}/></div>
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {filtered.map((m,i)=>{const d=new Date(m.cutoffAt||m.endDate);const isToday=d.toDateString()===now.toDateString();const isSoon=(d-now)<7*864e5;
        return<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",background:isToday?T.redDim:T.surfaceAlt,border:`1px solid ${isToday?`${T.red}33`:T.border}`,borderRadius:8}}>
          <span style={{fontSize:12,fontFamily:sans,color:T.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title||m.question||m.id}</span>
          <span style={{fontSize:11,fontFamily:mono,color:isToday?T.red:isSoon?T.yellow:T.textDim,fontWeight:600,flexShrink:0,marginLeft:12}}>{d.toLocaleDateString()}</span>
        </div>;})}
    </div>
  </div>;
}

const TABS=[
  {id:"monitor",label:"市场监控",icon:"◉"},{id:"volume",label:"交易量排名",icon:"▲"},
  {id:"flow",label:"订单流",icon:"⇄"},{id:"wallet",label:"钱包查询",icon:"◎"},
  {id:"fee",label:"手续费",icon:"✦"},{id:"ws",label:"WebSocket",icon:"⚡"},
  {id:"calendar",label:"结算日历",icon:"▦"},
];

export default function App(){
  const [tab,setTab]=useState("monitor");
  const [live,setLive]=useState(false);

  return <ConfigCtx.Provider value={{live}}>
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:sans}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:${T.bg}}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
        @keyframes spin{to{transform:rotate(360deg)}}
        input:focus{border-color:${T.accent}!important;outline:none}
      `}</style>

      <header style={{padding:"12px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:`${T.surface}ee`,backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${T.accent},${T.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:T.bg}}>P</div>
          <span style={{fontFamily:mono,fontSize:15,fontWeight:700,letterSpacing:-.5}}>Predict<span style={{color:T.accent}}>.dash</span></span>
        </div>
        <button onClick={()=>setLive(!live)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:6,border:`1px solid ${live?T.accent:T.yellow}44`,background:live?T.accentDim:`${T.yellow}12`,fontFamily:mono,fontSize:11,color:live?T.accent:T.yellow,cursor:"pointer"}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:live?T.accent:T.yellow,display:"inline-block"}}/>{live?"LIVE":"MOCK"}
        </button>
      </header>

      <div style={{display:"flex",minHeight:"calc(100vh - 53px)"}}>
        <nav style={{width:190,padding:"14px 8px",borderRight:`1px solid ${T.border}`,background:T.surface,flexShrink:0}}>
          {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 12px",border:"none",borderRadius:7,background:tab===t.id?T.accentDim:"transparent",color:tab===t.id?T.accent:T.textDim,fontFamily:sans,fontSize:12,fontWeight:tab===t.id?600:400,cursor:"pointer",marginBottom:2,textAlign:"left"}}>
            <span style={{fontSize:13,width:18,textAlign:"center"}}>{t.icon}</span>{t.label}
          </button>)}
          <div style={{marginTop:20,padding:"12px",background:T.surfaceAlt,borderRadius:8,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:9,color:T.textDim,fontFamily:mono,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>API</div>
            <div style={{fontSize:10,color:T.textMuted,fontFamily:mono,lineHeight:1.8}}>监控→/v1/markets<br/>排名→/markets/stats<br/>订单→/orders/matches<br/>钱包→/positions/addr<br/>WS→wss://ws…/ws</div>
          </div>
        </nav>

        <main style={{flex:1,padding:22,overflowY:"auto",maxWidth:900}}>
          <h2 style={{fontFamily:mono,fontSize:16,fontWeight:700,marginBottom:18,display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:T.accent}}>{TABS.find(t=>t.id===tab)?.icon}</span>{TABS.find(t=>t.id===tab)?.label}
          </h2>
          {tab==="monitor"&&<MarketMonitor/>}
          {tab==="volume"&&<VolumeRanking/>}
          {tab==="flow"&&<OrderFlow/>}
          {tab==="wallet"&&<WalletLookup/>}
          {tab==="fee"&&<FeeCalculator/>}
          {tab==="ws"&&<WSMonitor/>}
          {tab==="calendar"&&<SettlementCalendar/>}
        </main>
      </div>
    </div>
  </ConfigCtx.Provider>;
}
