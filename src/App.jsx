import { useState, useEffect, useCallback, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const API_V = "v19.0";
const BASE = `https://graph.facebook.com/${API_V}`;
const INS_F = "spend,impressions,clicks,ctr,cpc,cpm,reach,frequency,actions,action_values";

const T = {
  bg:"#06070A", s1:"#0C0D12", s2:"#111318", border:"#1C1E26", b2:"#252830",
  accent:"#C8FF57", accentD:"#C8FF5712", accentM:"#C8FF5732",
  text:"#ECEEF5", sub:"#8B8FA8", muted:"#484C60",
  red:"#FF5757", green:"#57FF8A", blue:"#5799FF", orange:"#FF9A3C",
};

const RAW_DAILY = [
  {spend:2340,roas:3.2,ctr:2.8,clicks:5120},{spend:1890,roas:3.8,ctr:3.1,clicks:4310},
  {spend:2180,roas:3.4,ctr:3.4,clicks:5480},{spend:2420,roas:2.9,ctr:2.6,clicks:4890},
  {spend:1720,roas:4.1,ctr:3.8,clicks:4230},{spend:2090,roas:3.6,ctr:2.9,clicks:4960},
  {spend:2590,roas:3.3,ctr:3.2,clicks:5810},{spend:2210,roas:3.7,ctr:3.6,clicks:5190},
  {spend:1950,roas:4.0,ctr:2.7,clicks:4510},{spend:2380,roas:3.1,ctr:3.3,clicks:5340},
  {spend:2100,roas:3.5,ctr:2.9,clicks:4780},{spend:1830,roas:3.9,ctr:3.5,clicks:4390},
  {spend:2290,roas:3.2,ctr:2.8,clicks:5070},{spend:2440,roas:3.6,ctr:3.1,clicks:5560},
  {spend:1980,roas:4.2,ctr:3.7,clicks:4820},{spend:2160,roas:3.4,ctr:3.0,clicks:5020},
  {spend:2510,roas:3.0,ctr:2.5,clicks:5390},{spend:1870,roas:3.8,ctr:3.4,clicks:4410},
  {spend:2320,roas:3.5,ctr:3.2,clicks:5270},{spend:2080,roas:4.0,ctr:3.8,clicks:5060},
  {spend:1760,roas:3.7,ctr:3.1,clicks:4090},{spend:2390,roas:3.2,ctr:2.7,clicks:5440},
  {spend:2230,roas:3.6,ctr:3.5,clicks:5180},{spend:1920,roas:4.1,ctr:3.9,clicks:4670},
  {spend:2460,roas:3.3,ctr:3.0,clicks:5530},{spend:2070,roas:3.8,ctr:3.3,clicks:4880},
  {spend:1840,roas:3.5,ctr:2.8,clicks:4350},{spend:2350,roas:3.1,ctr:3.2,clicks:5390},
  {spend:2190,roas:3.9,ctr:3.6,clicks:5120},{spend:2520,roas:3.4,ctr:2.9,clicks:5710},
];

function getDailyDemo(range) {
  const counts = {today:1,yesterday:1,last_7d:7,last_14d:14,last_30d:30,this_month:new Date().getDate(),last_month:30};
  const n = Math.min(counts[range]||7, 30);
  return RAW_DAILY.slice(-n).map((d,i)=>{
    const dt=new Date(); dt.setDate(dt.getDate()-(n-1-i));
    return {...d, date:dt.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})};
  });
}

const D_OV = {
  spend:"14832.50",impressions:"1284930",clicks:"38274",
  ctr:"2.98",cpc:"0.39",cpm:"11.54",reach:"897210",frequency:"1.43",
  actions:[{action_type:"purchase",value:"312"},{action_type:"lead",value:"840"}],
  action_values:[{action_type:"purchase",value:"52190.00"}],
};
const D_OV_PREV = {
  spend:"12940.00",impressions:"1108000",clicks:"33100",
  ctr:"2.71",cpc:"0.42",cpm:"12.04",reach:"782000",frequency:"1.38",
  actions:[{action_type:"purchase",value:"261"},{action_type:"lead",value:"720"}],
  action_values:[{action_type:"purchase",value:"43830.00"}],
};
const D_CAMPS = [
  {id:"c1",name:"DOF | Ótica Premium | Conversão | Quente",status:"ACTIVE",effective_status:"ACTIVE",objective:"OUTCOME_SALES",insights:{spend:"3820.00",impressions:"312400",clicks:"9840",ctr:"3.15",cpc:"0.39",cpm:"12.23",reach:"218000",frequency:"2.1",actions:[{action_type:"purchase",value:"98"}],action_values:[{action_type:"purchase",value:"14700.00"}]}},
  {id:"c2",name:"DL Consórcios | Prospecção | Leads Qualificados",status:"ACTIVE",effective_status:"ACTIVE",objective:"OUTCOME_LEADS",insights:{spend:"2940.00",impressions:"198700",clicks:"7210",ctr:"3.63",cpc:"0.41",cpm:"14.79",reach:"162000",frequency:"1.6",actions:[{action_type:"lead",value:"420"}],action_values:[{action_type:"purchase",value:"0"}]}},
  {id:"c3",name:"DOF | Remarketing 30d | Catálogo Dinâmico",status:"ACTIVE",effective_status:"ACTIVE",objective:"OUTCOME_SALES",insights:{spend:"1650.00",impressions:"84200",clicks:"4320",ctr:"5.13",cpc:"0.38",cpm:"19.60",reach:"54200",frequency:"4.4",actions:[{action_type:"purchase",value:"74"}],action_values:[{action_type:"purchase",value:"13320.00"}]}},
  {id:"c4",name:"DL Consórcios | Imóveis | Lookalike 3%",status:"ACTIVE",effective_status:"ACTIVE",objective:"OUTCOME_LEADS",insights:{spend:"2180.00",impressions:"224000",clicks:"5940",ctr:"2.65",cpc:"0.37",cpm:"9.73",reach:"192000",frequency:"1.8",actions:[{action_type:"lead",value:"310"}],action_values:[{action_type:"purchase",value:"0"}]}},
  {id:"c5",name:"DOF | Topo de Funil | Interesses Amplos",status:"PAUSED",effective_status:"PAUSED",objective:"OUTCOME_AWARENESS",insights:{spend:"980.00",impressions:"198400",clicks:"1680",ctr:"0.85",cpc:"0.58",cpm:"4.94",reach:"162000",frequency:"2.3",actions:[{action_type:"purchase",value:"0"}],action_values:[{action_type:"purchase",value:"0"}]}},
  {id:"c6",name:"DL Consórcios | Veículos | Público Amplo",status:"ACTIVE",effective_status:"ACTIVE",objective:"OUTCOME_LEADS",insights:{spend:"1840.00",impressions:"142000",clicks:"4210",ctr:"2.96",cpc:"0.44",cpm:"12.96",reach:"98000",frequency:"2.0",actions:[{action_type:"lead",value:"110"}],action_values:[{action_type:"purchase",value:"0"}]}},
  {id:"c7",name:"DOF | Black Friday | Engajamento",status:"PAUSED",effective_status:"PAUSED",objective:"OUTCOME_ENGAGEMENT",insights:{spend:"620.00",impressions:"84230",clicks:"1940",ctr:"2.30",cpc:"0.32",cpm:"7.36",reach:"71000",frequency:"3.9",actions:[{action_type:"purchase",value:"0"}],action_values:[{action_type:"purchase",value:"0"}]}},
  {id:"c8",name:"Teste A/B | Vídeo vs Carrossel",status:"ARCHIVED",effective_status:"ARCHIVED",objective:"OUTCOME_SALES",insights:null},
];
const D_ADSETS = [
  {id:"as1",campaign:"DOF | Ótica Premium | Conversão | Quente",cid:"c1",name:"Engajamentos 180d — Interesses Óculos",status:"ACTIVE",effective_status:"ACTIVE",insights:{spend:"1820.00",impressions:"142000",clicks:"4890",ctr:"3.44",cpc:"0.37",cpm:"12.82",reach:"98000",frequency:"2.1",actions:[{action_type:"purchase",value:"48"}],action_values:[{action_type:"purchase",value:"7200.00"}]}},
  {id:"as2",campaign:"DOF | Ótica Premium | Conversão | Quente",cid:"c1",name:"Compradores 60d — Lookalike 2%",status:"ACTIVE",effective_status:"ACTIVE",insights:{spend:"2000.00",impressions:"170400",clicks:"4950",ctr:"2.90",cpc:"0.40",cpm:"11.74",reach:"120000",frequency:"1.8",actions:[{action_type:"purchase",value:"50"}],action_values:[{action_type:"purchase",value:"7500.00"}]}},
  {id:"as3",campaign:"DL Consórcios | Prospecção | Leads Qualificados",cid:"c2",name:"Lookalike 3% — Clientes Ativos",status:"ACTIVE",effective_status:"ACTIVE",insights:{spend:"1240.00",impressions:"88000",clicks:"3200",ctr:"3.64",cpc:"0.39",cpm:"14.09",reach:"72000",frequency:"1.4",actions:[{action_type:"lead",value:"198"}],action_values:[{action_type:"purchase",value:"0"}]}},
  {id:"as4",campaign:"DL Consórcios | Prospecção | Leads Qualificados",cid:"c2",name:"Interesses Financeiros — Amplo",status:"ACTIVE",effective_status:"CAMPAIGN_PAUSED",insights:{spend:"1700.00",impressions:"110700",clicks:"4010",ctr:"3.62",cpc:"0.42",cpm:"15.36",reach:"90000",frequency:"3.8",actions:[{action_type:"lead",value:"222"}],action_values:[{action_type:"purchase",value:"0"}]}},
  {id:"as5",campaign:"DOF | Remarketing 30d | Catálogo Dinâmico",cid:"c3",name:"Visitantes Site — Sem Compra",status:"ACTIVE",effective_status:"ACTIVE",insights:{spend:"920.00",impressions:"48000",clicks:"2610",ctr:"5.44",cpc:"0.35",cpm:"19.17",reach:"28000",frequency:"4.9",actions:[{action_type:"purchase",value:"42"}],action_values:[{action_type:"purchase",value:"6300.00"}]}},
  {id:"as6",campaign:"DL Consórcios | Imóveis | Lookalike 3%",cid:"c4",name:"Lookalike 3% — Leads Imóvel",status:"ACTIVE",effective_status:"ACTIVE",insights:{spend:"1480.00",impressions:"148000",clicks:"3720",ctr:"2.51",cpc:"0.40",cpm:"10.00",reach:"110000",frequency:"1.6",actions:[{action_type:"lead",value:"198"}],action_values:[{action_type:"purchase",value:"0"}]}},
  {id:"as7",campaign:"DOF | Topo de Funil | Interesses Amplos",cid:"c5",name:"Interesses — Moda e Beleza",status:"PAUSED",effective_status:"CAMPAIGN_PAUSED",insights:{spend:"480.00",impressions:"102000",clicks:"700",ctr:"0.69",cpc:"0.69",cpm:"4.71",reach:"84000",frequency:"2.1",actions:[{action_type:"purchase",value:"0"}],action_values:[{action_type:"purchase",value:"0"}]}},
  {id:"as8",campaign:"DL Consórcios | Veículos | Público Amplo",cid:"c6",name:"Público Amplo 25–45 — Sudeste",status:"ACTIVE",effective_status:"ACTIVE",insights:{spend:"1840.00",impressions:"142000",clicks:"4210",ctr:"2.96",cpc:"0.44",cpm:"12.96",reach:"98000",frequency:"2.3",actions:[{action_type:"lead",value:"110"}],action_values:[{action_type:"purchase",value:"0"}]}},
];
const GRAD = [["#1A0533","#7C3AED"],["#03141F","#0EA5E9"],["#1A2700","#65A30D"],["#1F0A00","#EA580C"],["#170024","#DB2777"],["#001A1A","#0D9488"]];
const D_CREATIVES = [
  {id:"cr1",cid:"c1",campaign:"DOF | Ótica Premium | Conversão | Quente",name:"Titanium Stories — Vídeo 15s",format:"Vídeo",thumb:null,grad:GRAD[0],title:"Óculos de titânio a partir de R$ 299",insights:{spend:"1420.00",impressions:"98400",clicks:"3210",ctr:"3.26",cpc:"0.44",frequency:"1.9",actions:[{action_type:"purchase",value:"38"}],action_values:[{action_type:"purchase",value:"5700.00"}]}},
  {id:"cr2",cid:"c1",campaign:"DOF | Ótica Premium | Conversão | Quente",name:"30% OFF — Feed Carrossel",format:"Carrossel",thumb:null,grad:GRAD[1],title:"30% OFF em toda a coleção",insights:{spend:"980.00",impressions:"72000",clicks:"2840",ctr:"3.94",cpc:"0.35",frequency:"2.3",actions:[{action_type:"purchase",value:"28"}],action_values:[{action_type:"purchase",value:"4200.00"}]}},
  {id:"cr3",cid:"c3",campaign:"DOF | Remarketing 30d | Catálogo Dinâmico",name:"Catálogo Dinâmico — Remarketing",format:"Imagem",thumb:null,grad:GRAD[2],title:"Você viu esse produto",insights:{spend:"650.00",impressions:"31200",clicks:"1920",ctr:"6.15",cpc:"0.34",frequency:"4.8",actions:[{action_type:"purchase",value:"42"}],action_values:[{action_type:"purchase",value:"6300.00"}]}},
  {id:"cr4",cid:"c2",campaign:"DL Consórcios | Prospecção | Leads Qualificados",name:"Conquiste seu Imóvel — Vídeo 15s",format:"Vídeo",thumb:null,grad:GRAD[3],title:"Conquiste seu imóvel sem juros",insights:{spend:"1100.00",impressions:"82000",clicks:"2980",ctr:"3.63",cpc:"0.37",frequency:"1.4",actions:[{action_type:"lead",value:"184"}],action_values:[{action_type:"purchase",value:"0"}]}},
  {id:"cr5",cid:"c2",campaign:"DL Consórcios | Prospecção | Leads Qualificados",name:"Depoimento Cliente — Stories",format:"Vídeo",thumb:null,grad:GRAD[4],title:"Realizei meu sonho com a DL",insights:{spend:"840.00",impressions:"61400",clicks:"2190",ctr:"3.57",cpc:"0.38",frequency:"1.8",actions:[{action_type:"lead",value:"140"}],action_values:[{action_type:"purchase",value:"0"}]}},
  {id:"cr6",cid:"c4",campaign:"DL Consórcios | Imóveis | Lookalike 3%",name:"Simulação Rápida — Feed Imagem",format:"Imagem",thumb:null,grad:GRAD[5],title:"Simule em 2 minutos",insights:{spend:"920.00",impressions:"94000",clicks:"2410",ctr:"2.56",cpc:"0.38",frequency:"1.6",actions:[{action_type:"lead",value:"148"}],action_values:[{action_type:"purchase",value:"0"}]}},
];

function getDP(range) {
  const t=new Date(), fmt=d=>d.toISOString().split("T")[0], sub=n=>{const d=new Date(t);d.setDate(d.getDate()-n);return d;};
  switch(range){
    case"today":return{since:fmt(t),until:fmt(t)};
    case"yesterday":{const d=sub(1);return{since:fmt(d),until:fmt(d)};}
    case"last_7d":return{since:fmt(sub(7)),until:fmt(t)};
    case"last_14d":return{since:fmt(sub(14)),until:fmt(t)};
    case"last_30d":return{since:fmt(sub(30)),until:fmt(t)};
    case"this_month":{const s=new Date(t.getFullYear(),t.getMonth(),1);return{since:fmt(s),until:fmt(t)};}
    case"last_month":{const s=new Date(t.getFullYear(),t.getMonth()-1,1),e=new Date(t.getFullYear(),t.getMonth(),0);return{since:fmt(s),until:fmt(e)};}
    default:return{since:fmt(t),until:fmt(t)};
  }
}
function getPrevDP(range) {
  const t=new Date(), fmt=d=>d.toISOString().split("T")[0], sub=n=>{const d=new Date(t);d.setDate(d.getDate()-n);return d;};
  switch(range){
    case"today":return{since:fmt(sub(1)),until:fmt(sub(1))};
    case"yesterday":return{since:fmt(sub(2)),until:fmt(sub(2))};
    case"last_7d":return{since:fmt(sub(14)),until:fmt(sub(8))};
    case"last_14d":return{since:fmt(sub(28)),until:fmt(sub(15))};
    case"last_30d":return{since:fmt(sub(60)),until:fmt(sub(31))};
    case"this_month":{const s=new Date(t.getFullYear(),t.getMonth()-1,1),e=new Date(t.getFullYear(),t.getMonth(),0);return{since:fmt(s),until:fmt(e)};}
    case"last_month":{const s=new Date(t.getFullYear(),t.getMonth()-2,1),e=new Date(t.getFullYear(),t.getMonth()-1,0);return{since:fmt(s),until:fmt(e)};}
    default:return{since:fmt(sub(1)),until:fmt(sub(1))};
  }
}

const brl=v=>(parseFloat(v)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const num=v=>(parseInt(v)||0).toLocaleString("pt-BR");
const pct=v=>`${(parseFloat(v)||0).toFixed(2)}%`;
const gA=(arr,t)=>{if(!arr)return 0;const a=arr.find(x=>x.action_type===t);return a?parseFloat(a.value):0;};
const delta=(cur,prev)=>prev>0?((cur-prev)/prev)*100:null;

// FIX: effective_status mapping
function statusLabel(es) {
  const map = {
    ACTIVE:"ACTIVE", PAUSED:"PAUSED", DELETED:"DELETED", ARCHIVED:"ARCHIVED",
    CAMPAIGN_PAUSED:"CAMP. PAUSADA", ADSET_PAUSED:"CONJUNTO PAUSADO",
    IN_PROCESS:"EM PROCESSO", WITH_ISSUES:"COM PROBLEMAS",
  };
  return map[es] || es;
}
function statusColor(es) {
  if(es==="ACTIVE") return "green";
  if(es==="PAUSED"||es==="CAMPAIGN_PAUSED"||es==="ADSET_PAUSED") return "yellow";
  if(es==="DELETED"||es==="ARCHIVED") return "gray";
  if(es==="WITH_ISSUES"||es==="IN_PROCESS") return "blue";
  return "gray";
}

async function fetchM(path,params,token){
  const url=new URL(`${BASE}/${path}`);
  url.searchParams.set("access_token",token);
  Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  const r=await fetch(url.toString());
  const d=await r.json();
  if(d.error)throw new Error(d.error.message);
  return d;
}
async function fetchPages(path,params,token){
  let res=[],cur=null;
  do{
    const p={...params,limit:100};
    if(cur)p.after=cur;
    const d=await fetchM(path,p,token);
    res=res.concat(d.data||[]);
    cur=d.paging?.cursors?.after;
    if(!d.paging?.next)cur=null;
  }while(cur);
  return res;
}

function getAlerts(camp, avgCpc) {
  const ins=camp.insights; if(!ins)return [];
  const alerts=[];
  const ctr=parseFloat(ins.ctr)||0, spend=parseFloat(ins.spend)||0;
  const freq=parseFloat(ins.frequency)||0, cpc=parseFloat(ins.cpc)||0;
  const purch=gA(ins.actions,"purchase");
  if(ctr>0&&ctr<1)alerts.push({c:"warn",l:"CTR baixo"});
  if(spend>300&&purch===0&&camp.objective==="OUTCOME_SALES")alerts.push({c:"alert",l:"Sem conversões"});
  if(freq>=4)alerts.push({c:"freq",l:`Freq ${freq.toFixed(1)}x`});
  else if(freq>=3)alerts.push({c:"freq",l:`Freq ${freq.toFixed(1)}x`});
  if(avgCpc>0&&cpc>avgCpc*1.8)alerts.push({c:"cpc",l:"CPC alto"});
  return alerts;
}
function AlertChip({a}){
  const m={warn:[T.orange+"18",T.orange],alert:[T.red+"18",T.red],freq:[T.blue+"18",T.blue],cpc:[T.orange+"18",T.orange]};
  const [bg,tc]=m[a.c]||[T.muted+"18",T.muted];
  return <span style={{display:"inline-block",padding:"1px 6px",borderRadius:3,fontSize:9,fontWeight:700,background:bg,color:tc,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.05em",textTransform:"uppercase"}}>{a.l}</span>;
}

const Ic={
  spend:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9.5 9.5c0-1.1.9-1.5 2.5-1.5s2.5.4 2.5 1.5-1 1.5-2.5 2-2.5.9-2.5 2 .9 1.5 2.5 1.5 2.5-.4 2.5-1.5"/></svg>,
  eye:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  click:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 9l3-6 2.5 5.5L20 10l-4.5 4 1.5 6.5L12 18l-5 2.5 1-6L3 10z"/></svg>,
  trend:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  users:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  cart:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  roas:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  refresh:()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  settings:()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  back:()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  plus:()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  chevron:()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  trash:()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  warn:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:${T.bg};}
::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${T.b2};border-radius:4px;}
input,select,button,textarea{font-family:inherit;}select option{background:${T.s2};}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
.ch:hover{border-color:${T.b2}!important;transform:translateY(-1px);}
.rh:hover{background:${T.s2}!important;}
.tab{cursor:pointer;padding:7px 14px;border-radius:8px;font-size:13px;font-weight:500;transition:all 0.15s;color:${T.sub};border:1px solid transparent;}
.tab:hover{color:${T.text};}
.tab.on{color:${T.text};background:${T.s2};border-color:${T.border};}
.btn-ghost{background:transparent;border:1px solid ${T.border};color:${T.sub};padding:5px 11px;border-radius:7px;cursor:pointer;font-size:11px;display:flex;align-items:center;gap:5px;transition:all 0.15s;font-family:'JetBrains Mono',monospace;}
.btn-ghost:hover{border-color:${T.b2};color:${T.text};}
.pill{padding:4px 10px;border-radius:6px;border:1px solid ${T.border};background:transparent;color:${T.sub};cursor:pointer;font-size:11px;font-family:'JetBrains Mono',monospace;transition:all 0.15s;letter-spacing:0.03em;}
.pill:hover{color:${T.text};}
.pill.on{border-color:${T.b2};background:${T.s2};color:${T.text};}
.dd-item{padding:8px 12px;border-radius:6px;cursor:pointer;font-size:12px;transition:background 0.1s;display:flex;align-items:center;justify-content:space-between;}
.dd-item:hover{background:${T.s2};}
`;

function Badge({children,color="gray"}){
  const m={green:[T.green+"14",T.green,T.green+"28"],red:[T.red+"14",T.red,T.red+"28"],yellow:["#FFCC2214","#FFCC22","#FFCC2228"],blue:[T.blue+"14",T.blue,T.blue+"28"],gray:[T.muted+"20",T.sub,T.muted+"30"]};
  const [bg,tc,bc]=m[color]||m.gray;
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:600,letterSpacing:"0.07em",background:bg,color:tc,border:`1px solid ${bc}`,textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace"}}>{children}</span>;
}

function Stat({label,value,dlt,icon:I,hi,neutral,invert}){
  const pos = invert ? dlt<0 : dlt>0;
  const dc = neutral?T.sub : pos?T.green:T.red;
  return(
    <div className="ch" style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 18px",transition:"all 0.2s",cursor:"default"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{color:hi?T.accent:T.muted}}><I/></span>
          <span style={{fontSize:10,color:T.sub,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace"}}>{label}</span>
        </div>
        {dlt!=null&&<span style={{fontSize:10,color:dc,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>{dlt>0?"+":""}{dlt.toFixed(1)}%</span>}
      </div>
      <div style={{fontSize:22,fontWeight:700,color:hi?T.accent:T.text,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-0.02em"}}>{value}</div>
    </div>
  );
}

function Spinner(){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"80px",gap:12,flexDirection:"column"}}>
      <div style={{width:26,height:26,border:`1.5px solid ${T.border}`,borderTop:`1.5px solid ${T.accent}`,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
      <span style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.06em"}}>Carregando dados...</span>
    </div>
  );
}

const METRICS=[
  {k:"spend",l:"Gasto",c:T.accent,fmt:brl,axis:"left"},
  {k:"roas",l:"ROAS",c:T.green,fmt:v=>`${Number(v).toFixed(2)}x`,axis:"right"},
  {k:"ctr",l:"CTR",c:T.blue,fmt:v=>`${Number(v).toFixed(2)}%`,axis:"right"},
  {k:"clicks",l:"Cliques",c:T.sub,fmt:num,axis:"left"},
];

function ChartTip({active,payload,label}){
  if(!active||!payload?.length)return null;
  return(
    <div style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px",minWidth:160}}>
      <p style={{fontSize:10,color:T.sub,marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>{label}</p>
      {payload.map(p=>{
        const m=METRICS.find(x=>x.k===p.dataKey);
        return <p key={p.dataKey} style={{fontSize:12,color:p.stroke,fontFamily:"'JetBrains Mono',monospace",marginBottom:2}}>{m?.l}: {m?.fmt(p.value)}</p>;
      })}
    </div>
  );
}

function TimeChart({data}){
  const [active,setActive]=useState(["spend","roas"]);
  const toggle=k=>setActive(p=>p.includes(k)?p.filter(x=>x!==k):[...p,k]);
  const leftM=active.filter(k=>METRICS.find(m=>m.k===k)?.axis==="left");
  const rightM=active.filter(k=>METRICS.find(m=>m.k===k)?.axis==="right");
  return(
    <div style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,padding:"18px 20px 10px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <span style={{fontSize:13,fontWeight:600,color:T.text}}>Performance diária</span>
        <div style={{display:"flex",gap:5}}>
          {METRICS.map(m=>(
            <button key={m.k} className={`pill${active.includes(m.k)?" on":""}`} onClick={()=>toggle(m.k)} style={{borderColor:active.includes(m.k)?m.c+"60":"",color:active.includes(m.k)?m.c:""}}>
              {m.l}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={data} margin={{left:-10,right:-10,top:4,bottom:0}}>
          <CartesianGrid stroke={T.border} strokeDasharray="4 4" vertical={false}/>
          <XAxis dataKey="date" tick={{fontSize:9,fill:T.muted,fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
          {leftM.length>0&&<YAxis yAxisId="left" orientation="left" tick={{fontSize:9,fill:T.muted,fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v} width={38}/>}
          {rightM.length>0&&<YAxis yAxisId="right" orientation="right" tick={{fontSize:9,fill:T.muted,fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}`} width={32}/>}
          <Tooltip content={<ChartTip/>} cursor={{stroke:T.border}}/>
          {active.map(k=>{
            const m=METRICS.find(x=>x.k===k);
            return <Line key={k} yAxisId={m.axis} type="monotone" dataKey={k} stroke={m.c} strokeWidth={1.8} dot={false} activeDot={{r:3,fill:m.c}}/>;
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CreativeCard({cr,rank,maxVal,sortM}){
  const ins=cr.insights;
  const s=parseFloat(ins?.spend)||0, rv=gA(ins?.action_values,"purchase");
  const roas=s>0?rv/s:0, leads=gA(ins?.actions,"lead"), purch=gA(ins?.actions,"purchase");
  const curVal=sortM==="roas"?roas:sortM==="ctr"?parseFloat(ins?.ctr)||0:parseFloat(ins?.spend)||0;
  const pct100=maxVal>0?Math.round((curVal/maxVal)*100):0;
  const rank_colors=[T.accent,T.text,T.sub];
  const [c1,c2]=cr.grad||["#111","#333"];
  const FreqWarn=parseFloat(ins?.frequency)>=3.5;
  const FmtI=cr.format==="Vídeo"
    ?<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
    :cr.format==="Carrossel"
    ?<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    :<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
  return(
    <div className="ch" style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",transition:"all 0.2s",display:"flex",flexDirection:"column"}}>
      <div style={{position:"relative",height:170,background:`linear-gradient(135deg,${c1},${c2})`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
        {cr.thumb
          ?<img src={cr.thumb} alt="" style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}} onError={e=>{e.target.style.display="none";}}/>
          :<><div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.35)"}}>{FmtI}</div>
          <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>{(cr.format||"IMAGEM").toUpperCase()}</span></>
        }
        {rank<=3&&<div style={{position:"absolute",top:8,left:8,width:22,height:22,borderRadius:6,background:rank===1?T.accent:rank===2?T.b2:T.s2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:rank===1?T.bg:rank_colors[rank-1],fontFamily:"'JetBrains Mono',monospace"}}>{rank}</div>}
        {FreqWarn&&<div style={{position:"absolute",top:8,right:8,background:T.blue+"22",border:`1px solid ${T.blue}44`,borderRadius:5,padding:"2px 6px",fontSize:9,fontWeight:700,color:T.blue,fontFamily:"'JetBrains Mono',monospace"}}>FREQ {parseFloat(ins?.frequency).toFixed(1)}x</div>}
        {roas>0&&<div style={{position:"absolute",bottom:8,right:8,background:"#00000088",border:`1px solid ${roas>=2?T.green+"44":T.border}`,borderRadius:5,padding:"2px 6px",fontSize:10,fontWeight:600,color:roas>=2?T.green:T.sub,fontFamily:"'JetBrains Mono',monospace"}}>{roas.toFixed(2)}x</div>}
      </div>
      <div style={{height:2,background:T.border}}>
        <div style={{height:"100%",width:`${pct100}%`,background:rank===1?T.accent:T.b2,transition:"width 0.6s ease"}}/>
      </div>
      <div style={{padding:"13px 14px 15px",display:"flex",flexDirection:"column",gap:10,flex:1}}>
        <div>
          <p style={{fontSize:12,fontWeight:600,color:T.text,lineHeight:1.4,marginBottom:3}}>{cr.name}</p>
          <p style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cr.campaign}</p>
        </div>
        {cr.title&&<div style={{borderLeft:`2px solid ${T.b2}`,paddingLeft:10}}><p style={{fontSize:11,color:T.sub,lineHeight:1.5,fontStyle:"italic"}}>"{cr.title}"</p></div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
          {[{l:"Gasto",v:brl(ins?.spend)},{l:"Cliques",v:num(ins?.clicks)},{l:"CTR",v:pct(ins?.ctr)},{l:rv>0?"Receita":"Leads",v:rv>0?brl(rv):num(leads||purch)}].map(({l,v})=>(
            <div key={l} style={{background:T.s2,borderRadius:6,padding:"7px 9px"}}>
              <p style={{fontSize:9,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{l}</p>
              <p style={{fontSize:12,fontWeight:600,color:T.text,fontFamily:"'JetBrains Mono',monospace"}}>{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccountSwitcher({accounts,activeId,onSwitch,onAdd,onRemove}){
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  const active=accounts.find(a=>a.id===activeId);
  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);
  return(
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(p=>!p)} style={{display:"flex",alignItems:"center",gap:6,background:T.s1,border:`1px solid ${T.border}`,color:T.text,padding:"5px 10px",borderRadius:7,cursor:"pointer",fontSize:12,fontFamily:"'JetBrains Mono',monospace",transition:"all 0.15s"}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:"pulse 2s infinite"}}/>
        <span style={{maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{active?.name||"Conta"}</span>
        <span style={{color:T.muted,transition:"transform 0.2s",transform:open?"rotate(180deg)":"rotate(0)"}}><Ic.chevron/></span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,background:T.s1,border:`1px solid ${T.border}`,borderRadius:10,padding:6,minWidth:220,zIndex:300,boxShadow:`0 8px 32px #00000066`}}>
          {accounts.length===0&&<p style={{fontSize:11,color:T.muted,padding:"8px 12px",fontFamily:"'JetBrains Mono',monospace"}}>Nenhuma conta salva</p>}
          {accounts.map(a=>(
            <div key={a.id} className="dd-item" onClick={()=>{onSwitch(a.id);setOpen(false);}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:a.id===activeId?T.accent:T.muted}}/>
                <span style={{color:a.id===activeId?T.accent:T.text,fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>{a.name}</span>
              </div>
              <button onClick={e=>{e.stopPropagation();onRemove(a.id);}} style={{background:"transparent",border:"none",color:T.muted,cursor:"pointer",padding:2,display:"flex"}}><Ic.trash/></button>
            </div>
          ))}
          <div style={{height:1,background:T.border,margin:"5px 0"}}/>
          <div className="dd-item" onClick={()=>{onAdd();setOpen(false);}}>
            <div style={{display:"flex",alignItems:"center",gap:7,color:T.sub}}>
              <Ic.plus/><span style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>Adicionar conta</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Login({onDemo,onConnect}){
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Syne',sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{CSS}</style>
      <div style={{position:"fixed",inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:"48px 48px",opacity:.4,pointerEvents:"none"}}/>
      <div style={{position:"fixed",top:"-15%",left:"50%",transform:"translateX(-50%)",width:500,height:350,background:`radial-gradient(ellipse,${T.accentD},transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{position:"relative",width:"100%",maxWidth:370,animation:"fadeUp 0.45s ease"}}>
        <div style={{marginBottom:40,textAlign:"center"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:9,marginBottom:12}}>
            <div style={{width:30,height:30,borderRadius:8,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.bg} strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <span style={{fontSize:19,fontWeight:800,color:T.text,letterSpacing:"-0.04em"}}>MetricsDesk</span>
          </div>
          <p style={{fontSize:12,color:T.sub}}>Dashboard de tráfego pago</p>
        </div>
        <div style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:16,padding:28,display:"flex",flexDirection:"column",gap:11}}>
          <div style={{textAlign:"center",marginBottom:6}}>
            <p style={{fontSize:14,fontWeight:600,color:T.text}}>Acessar painel</p>
            <p style={{fontSize:12,color:T.sub,marginTop:5,lineHeight:1.65}}>Conecte sua conta Meta Ads ou explore com dados de demonstração</p>
          </div>
          <button onClick={onDemo} style={{width:"100%",padding:"12px",borderRadius:10,border:`1px solid ${T.accentM}`,background:T.accentD,color:T.accent,cursor:"pointer",fontSize:13,fontWeight:700,transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=T.accent+"20";e.currentTarget.style.borderColor=T.accent;}}
            onMouseLeave={e=>{e.currentTarget.style.background=T.accentD;e.currentTarget.style.borderColor=T.accentM;}}
          >Entrar com dados de demo</button>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,height:1,background:T.border}}/><span style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>ou</span><div style={{flex:1,height:1,background:T.border}}/>
          </div>
          <button onClick={onConnect} style={{width:"100%",padding:"12px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.text,cursor:"pointer",fontSize:13,fontWeight:600,transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.b2;e.currentTarget.style.background=T.s2;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background="transparent";}}
          >Conectar Meta Ads Manager</button>
          <p style={{fontSize:10,color:T.muted,textAlign:"center",lineHeight:1.8,fontFamily:"'JetBrains Mono',monospace"}}>Credenciais salvas apenas na sessão atual.</p>
        </div>
        <p style={{textAlign:"center",marginTop:16,fontSize:9,color:T.muted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>META GRAPH API {API_V}</p>
      </div>
    </div>
  );
}

function Config({onSave,onClose}){
  const [name,setName]=useState("");
  const [tok,setTok]=useState("");
  const [acc,setAcc]=useState("");
  const inp={width:"100%",padding:"10px 12px",borderRadius:8,background:T.bg,border:`1px solid ${T.border}`,color:T.text,fontSize:12,fontFamily:"'JetBrains Mono',monospace",outline:"none"};
  const lbl={display:"block",fontSize:10,color:T.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.09em",fontFamily:"'JetBrains Mono',monospace"};
  const save=()=>{if(!name||!tok||!acc)return;onSave({id:Date.now().toString(),name,token:tok,accountId:acc.replace("act_","")});};
  return(
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:16,padding:28,width:440,maxWidth:"90vw"}}>
        <p style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:5}}>Adicionar conta</p>
        <p style={{fontSize:12,color:T.sub,marginBottom:20,lineHeight:1.7}}>Insira as credenciais do Meta Graph API. Você pode adicionar múltiplas contas.</p>
        <div style={{display:"flex",flexDirection:"column",gap:13,marginBottom:18}}>
          <div><label style={lbl}>Nome da conta</label><input style={inp} placeholder="Ex: Ótica DOF, DL Consórcios..." value={name} onChange={e=>setName(e.target.value)}/></div>
          <div><label style={lbl}>Access Token</label><input style={inp} type="password" placeholder="EAAxxxxxxxxxxxxxxx..." value={tok} onChange={e=>setTok(e.target.value)}/></div>
          <div><label style={lbl}>ID da Conta de Anúncios</label><input style={inp} placeholder="act_1234567890 ou só o número" value={acc} onChange={e=>setAcc(e.target.value)}/></div>
        </div>
        <div style={{background:T.accentD,border:`1px solid ${T.accentM}`,borderRadius:8,padding:"11px 13px",marginBottom:18,fontSize:11,color:T.accent,lineHeight:1.8,fontFamily:"'JetBrains Mono',monospace"}}>
          business.facebook.com → Configurações → Usuários do Sistema<br/>Escopos: <strong>ads_read · read_insights · ads_management</strong>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"11px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.sub,cursor:"pointer",fontSize:13}}>Cancelar</button>
          <button onClick={save} style={{flex:2,padding:"11px",borderRadius:8,border:"none",background:T.accent,color:T.bg,cursor:"pointer",fontSize:13,fontWeight:700}}>Salvar conta</button>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [screen,setScreen]=useState("login");
  const [isDemo,setIsDemo]=useState(false);
  const [accounts,setAccounts]=useState([]);
  const [activeId,setActiveId]=useState(null);
  const [showCfg,setShowCfg]=useState(false);
  const [tab,setTab]=useState("overview");
  const [dateRange,setDR]=useState("last_7d");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [ov,setOv]=useState(null);
  const [ovPrev,setOvPrev]=useState(null);
  const [daily,setDaily]=useState([]);
  const [camps,setCamps]=useState([]);
  const [adsets,setAdsets]=useState([]);
  const [creatives,setCreatives]=useState([]);
  const [campSearch,setCSearch]=useState("");
  const [campStatus,setCStat]=useState("all");
  const [sortKey,setSK]=useState("spend");
  const [sortDir,setSD]=useState("desc");
  const [crSort,setCrSort]=useState("spend");
  const [crSearch,setCrSearch]=useState("");
  const [crFmt,setCrFmt]=useState("all");
  const [asSearch,setAsSearch]=useState("");

  const activeAcc=accounts.find(a=>a.id===activeId);
  const loadDemo=()=>{setIsDemo(true);setOv(D_OV);setOvPrev(D_OV_PREV);setDaily(getDailyDemo("last_7d"));setCamps(D_CAMPS);setAdsets(D_ADSETS);setCreatives(D_CREATIVES);setScreen("dashboard");};

  const fetchData=useCallback(async()=>{
    if(isDemo){setOv(D_OV);setOvPrev(D_OV_PREV);setDaily(getDailyDemo(dateRange));setCamps(D_CAMPS);setAdsets(D_ADSETS);setCreatives(D_CREATIVES);return;}
    if(!activeAcc)return;
    const {token,accountId}=activeAcc;
    setLoading(true);setError(null);
    try{
      const dp=getDP(dateRange),pdp=getPrevDP(dateRange);
      const tr=JSON.stringify({since:dp.since,until:dp.until}),ptr=JSON.stringify({since:pdp.since,until:pdp.until});

      const [ovR,ovPR]=await Promise.all([
        fetchM(`act_${accountId}/insights`,{fields:INS_F,time_range:tr,level:"account"},token),
        fetchM(`act_${accountId}/insights`,{fields:INS_F,time_range:ptr,level:"account"},token),
      ]);
      setOv(ovR.data?.[0]||null);
      setOvPrev(ovPR.data?.[0]||null);

      const dR=await fetchM(`act_${accountId}/insights`,{fields:"spend,impressions,clicks,ctr,actions,action_values",time_range:tr,level:"account",time_increment:1},token);
      setDaily((dR.data||[]).map(d=>({
        date:d.date_start?.slice(5).replace("-","/"),
        spend:parseFloat(d.spend)||0,
        roas:(()=>{const rv=gA(d.action_values,"purchase"),s=parseFloat(d.spend)||1;return +(rv/s).toFixed(2);})(),
        ctr:parseFloat(d.ctr)||0,
        clicks:parseInt(d.clicks)||0,
      })));

      // Campaigns
      const cs=await fetchPages(`act_${accountId}/campaigns`,{fields:"id,name,status,effective_status,objective"},token);
      const ci=await Promise.all(cs.map(async c=>{
        try{
          const r=await fetchM(`${c.id}/insights`,{fields:INS_F+",frequency",time_range:tr},token);
          return{...c,effective_status:c.effective_status||c.status,insights:r.data?.[0]||null};
        }catch{
          return{...c,effective_status:c.effective_status||c.status,insights:null};
        }
      }));
      setCamps(ci);

      // FIX: AdSets — use effective_status
      const as=await fetchPages(`act_${accountId}/adsets`,{
        fields:"id,name,status,effective_status,campaign_id,campaign{name}",
      },token);
      const asi=await Promise.all(as.map(async a=>{
        try{
          const r=await fetchM(`${a.id}/insights`,{fields:INS_F+",frequency",time_range:tr},token);
          return{
            ...a,
            campaign:a.campaign?.name||"",
            cid:a.campaign_id,
            effective_status:a.effective_status||a.status,
            insights:r.data?.[0]||null,
          };
        }catch{
          return{...a,campaign:"",cid:a.campaign_id,effective_status:a.effective_status||a.status,insights:null};
        }
      }));
      setAdsets(asi);

      // FIX: Creatives — expanded fields for thumbnail and format detection
      const CREATIVE_FIELDS = [
        "id","thumbnail_url","image_url","title","body",
        "call_to_action_type","video_id",
        "object_story_spec{link_data{picture,child_attachments,name,description},video_data{image_url,title}}",
      ].join(",");

      const ads=await fetchPages(`act_${accountId}/ads`,{
        fields:`id,name,status,effective_status,campaign_id,creative{${CREATIVE_FIELDS}}`,
        effective_status:'["ACTIVE","PAUSED","ARCHIVED"]',
      },token);

      const adsI=await Promise.all(ads.slice(0,60).map(async ad=>{
        try{
          const r=await fetchM(`${ad.id}/insights`,{fields:INS_F+",frequency",time_range:tr},token);
          const cr=ad.creative;
          const camp=ci.find(c=>c.id===ad.campaign_id);

          // FIX: Detect format correctly
          const isVideo=!!(cr?.video_id||cr?.object_story_spec?.video_data);
          const isCarousel=!!(cr?.object_story_spec?.link_data?.child_attachments?.length);
          const format=isVideo?"Vídeo":isCarousel?"Carrossel":"Imagem";

          // FIX: Try all possible thumbnail locations
          const thumb=
            cr?.thumbnail_url||
            cr?.image_url||
            cr?.object_story_spec?.link_data?.picture||
            cr?.object_story_spec?.video_data?.image_url||
            null;

          const title=
            cr?.title||
            cr?.object_story_spec?.link_data?.name||
            cr?.object_story_spec?.video_data?.title||
            ad.name||"";

          return{
            id:ad.id,
            name:ad.name,
            cid:ad.campaign_id,
            campaign:camp?.name||"",
            status:ad.effective_status||ad.status,
            format,
            thumb,
            title,
            body:cr?.body||cr?.object_story_spec?.link_data?.description||"",
            grad:GRAD[Math.floor(Math.random()*GRAD.length)],
            insights:r.data?.[0]||null,
          };
        }catch{return null;}
      }));
      setCreatives(adsI.filter(Boolean));

    }catch(e){setError(e.message);}finally{setLoading(false);}
  },[isDemo,activeAcc,dateRange]);

  useEffect(()=>{if(screen==="dashboard")fetchData();},[fetchData,screen]);

  const addAccount=acc=>{setAccounts(p=>[...p,acc]);setActiveId(acc.id);setIsDemo(false);setShowCfg(false);setScreen("dashboard");};
  const switchAccount=id=>{setActiveId(id);setIsDemo(false);};
  const removeAccount=id=>{setAccounts(p=>p.filter(a=>a.id!==id));if(activeId===id){const remaining=accounts.filter(a=>a.id!==id);setActiveId(remaining[0]?.id||null);}};

  const mk=(cur,prev)=>delta(parseFloat(cur)||0,parseFloat(prev)||0);
  const spend=parseFloat(ov?.spend)||0,pSpend=parseFloat(ovPrev?.spend)||0;
  const imp=parseInt(ov?.impressions)||0,pImp=parseInt(ovPrev?.impressions)||0;
  const clk=parseInt(ov?.clicks)||0,pClk=parseInt(ovPrev?.clicks)||0;
  const ctr=parseFloat(ov?.ctr)||0,pCtr=parseFloat(ovPrev?.ctr)||0;
  const cpc=parseFloat(ov?.cpc)||0,pCpc=parseFloat(ovPrev?.cpc)||0;
  const cpm=parseFloat(ov?.cpm)||0;
  const reach=parseInt(ov?.reach)||0;
  const purch=gA(ov?.actions,"purchase"),pPurch=gA(ovPrev?.actions,"purchase");
  const rev=gA(ov?.action_values,"purchase"),pRev=gA(ovPrev?.action_values,"purchase");
  const roas=spend>0?rev/spend:0,pRoas=pSpend>0?pRev/pSpend:0;
  const avgCpc=cpc;

  const sortedCamps=[...camps]
    .filter(c=>campStatus==="all"||(c.effective_status||c.status)===campStatus)
    .filter(c=>!campSearch||c.name.toLowerCase().includes(campSearch.toLowerCase()))
    .sort((a,b)=>{
      const v=x=>{if(!x.insights)return 0;switch(sortKey){case"spend":return parseFloat(x.insights.spend)||0;case"impressions":return parseInt(x.insights.impressions)||0;case"clicks":return parseInt(x.insights.clicks)||0;case"ctr":return parseFloat(x.insights.ctr)||0;case"cpc":return parseFloat(x.insights.cpc)||0;case"roas":{const r=gA(x.insights.action_values,"purchase"),s=parseFloat(x.insights.spend)||1;return r/s;}default:return 0;}};
      return sortDir==="desc"?v(b)-v(a):v(a)-v(b);
    });

  const getCreativeVal=cr=>{if(!cr.insights)return 0;switch(crSort){case"roas":{const r=gA(cr.insights.action_values,"purchase"),s=parseFloat(cr.insights.spend)||1;return r/s;}case"ctr":return parseFloat(cr.insights.ctr)||0;default:return parseFloat(cr.insights.spend)||0;}};
  const filteredCr=[...creatives].filter(c=>crFmt==="all"||c.format===crFmt).filter(c=>!crSearch||c.name.toLowerCase().includes(crSearch.toLowerCase())||c.campaign.toLowerCase().includes(crSearch.toLowerCase())).sort((a,b)=>getCreativeVal(b)-getCreativeVal(a));
  const maxCreativeVal=filteredCr.length>0?getCreativeVal(filteredCr[0]):1;

  const srt=k=>{if(sortKey===k)setSD(d=>d==="desc"?"asc":"desc");else{setSK(k);setSD("desc");}};
  const arr=k=>sortKey===k?(sortDir==="desc"?"↓":"↑"):"↕";
  const thS=(k,l,click=true)=><th className={click?"sort-btn":""} onClick={click?()=>srt(k):undefined} style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:sortKey===k?T.accent:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap",fontWeight:500,cursor:click?"pointer":"default"}}>{l}{click?` ${arr(k)}`:""}</th>;
  const tdS={padding:"12px 16px",fontSize:12,color:T.text,borderTop:`1px solid ${T.border}`,fontFamily:"'JetBrains Mono',monospace"};

  if(screen==="login") return <Login onDemo={loadDemo} onConnect={()=>{setScreen("dashboard");setShowCfg(true);}}/>;

  const TABS=["overview","campaigns","adsets","creatives"];
  const TLABELS=["Visão Geral","Campanhas","Conjuntos","Criativos"];

  return(
    <div style={{background:T.bg,minHeight:"100vh",fontFamily:"'Syne',sans-serif",color:T.text}}>
      <style>{CSS}</style>
      {showCfg&&<Config onSave={addAccount} onClose={()=>setShowCfg(false)}/>}

      <header style={{position:"sticky",top:0,zIndex:100,height:52,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",borderBottom:`1px solid ${T.border}`,background:`${T.bg}f0`,backdropFilter:"blur(12px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:24,height:24,borderRadius:6,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.bg} strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
            <span style={{fontWeight:800,fontSize:14,letterSpacing:"-0.03em"}}>MetricsDesk</span>
          </div>
          {isDemo&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"2px 8px",borderRadius:20,background:T.blue+"14",border:`1px solid ${T.blue}28`}}><div style={{width:5,height:5,borderRadius:"50%",background:T.blue,animation:"pulse 2s infinite"}}/><span style={{fontSize:9,color:T.blue,fontWeight:700,letterSpacing:"0.1em",fontFamily:"'JetBrains Mono',monospace"}}>DEMO</span></div>}
          {!isDemo&&accounts.length>0&&<AccountSwitcher accounts={accounts} activeId={activeId} onSwitch={switchAccount} onAdd={()=>setShowCfg(true)} onRemove={removeAccount}/>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <select value={dateRange} onChange={e=>setDR(e.target.value)} style={{background:T.s1,border:`1px solid ${T.border}`,color:T.text,padding:"5px 10px",borderRadius:7,fontSize:11,cursor:"pointer",outline:"none",fontFamily:"'JetBrains Mono',monospace"}}>
            {[{l:"Hoje",v:"today"},{l:"Ontem",v:"yesterday"},{l:"7 dias",v:"last_7d"},{l:"14 dias",v:"last_14d"},{l:"30 dias",v:"last_30d"},{l:"Este mês",v:"this_month"},{l:"Mês passado",v:"last_month"}].map(r=><option key={r.v} value={r.v}>{r.l}</option>)}
          </select>
          <button onClick={fetchData} disabled={loading} className="btn-ghost"><span style={{display:"inline-block",animation:loading?"spin 0.7s linear infinite":"none"}}><Ic.refresh/></span>Atualizar</button>
          {isDemo
            ?<button onClick={()=>setScreen("login")} className="btn-ghost"><Ic.back/> Sair</button>
            :<button onClick={()=>setShowCfg(true)} className="btn-ghost" style={{color:T.accent,borderColor:T.accentM,background:T.accentD}}><Ic.plus/> Conta</button>
          }
        </div>
      </header>

      <div style={{padding:"12px 24px 0",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:3}}>
        {TABS.map((t,i)=><div key={t} className={`tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{TLABELS[i]}</div>)}
        <div style={{marginLeft:"auto",fontSize:9,color:T.muted,fontFamily:"'JetBrains Mono',monospace",paddingBottom:12,letterSpacing:"0.06em"}}>
          {[{l:"Hoje",v:"today"},{l:"Ontem",v:"yesterday"},{l:"7 dias",v:"last_7d"},{l:"14 dias",v:"last_14d"},{l:"30 dias",v:"last_30d"},{l:"Este mês",v:"this_month"},{l:"Mês passado",v:"last_month"}].find(r=>r.v===dateRange)?.l?.toUpperCase()}
        </div>
      </div>

      <main style={{padding:"22px 24px 48px",animation:"fadeUp 0.3s ease"}}>
        {loading?<Spinner/>:error?(
          <div style={{background:T.red+"12",border:`1px solid ${T.red}28`,borderRadius:10,padding:20,color:T.red,fontSize:13}}>
            <strong>Erro:</strong> {error}<p style={{marginTop:6,fontSize:11,color:T.sub}}>Verifique o token e o ID da conta.</p>
          </div>
        ):tab==="overview"?(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:9,marginBottom:20}}>
              <Stat icon={Ic.spend} label="Investimento" value={brl(spend)} dlt={mk(spend,pSpend)} neutral hi/>
              <Stat icon={Ic.eye} label="Impressões" value={num(imp)} dlt={mk(imp,pImp)}/>
              <Stat icon={Ic.click} label="Cliques" value={num(clk)} dlt={mk(clk,pClk)}/>
              <Stat icon={Ic.trend} label="CTR" value={pct(ctr)} dlt={mk(ctr,pCtr)}/>
              <Stat icon={Ic.spend} label="CPC" value={brl(cpc)} dlt={mk(cpc,pCpc)} invert/>
              <Stat icon={Ic.spend} label="CPM" value={brl(cpm)}/>
              <Stat icon={Ic.users} label="Alcance" value={num(reach)}/>
              <Stat icon={Ic.cart} label="Compras" value={num(purch)} dlt={mk(purch,pPurch)}/>
              <Stat icon={Ic.spend} label="Receita" value={brl(rev)} dlt={mk(rev,pRev)} hi/>
              <Stat icon={Ic.roas} label="ROAS" value={`${roas.toFixed(2)}x`} dlt={mk(roas,pRoas)} hi/>
            </div>
            {daily.length>0&&<div style={{marginBottom:20}}><TimeChart data={daily}/></div>}
            {camps.some(c=>getAlerts(c,avgCpc).length>0)&&(
              <div style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 18px",marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}><Ic.warn/><span style={{fontSize:13,fontWeight:600,color:T.text}}>Alertas de campanha</span></div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {camps.filter(c=>getAlerts(c,avgCpc).length>0).map(c=>(
                    <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                      <span style={{fontSize:12,color:T.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:340}}>{c.name}</span>
                      <div style={{display:"flex",gap:4,flexShrink:0}}>{getAlerts(c,avgCpc).map((a,i)=><AlertChip key={i} a={a}/>)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
              <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:13,fontWeight:600}}>Top campanhas</span>
                <button onClick={()=>setTab("campaigns")} style={{background:"transparent",border:"none",color:T.sub,cursor:"pointer",fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>Ver todas →</button>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:T.bg+"88"}}>{thS("name","Campanha",false)}{thS("spend","Gasto")}{thS("ctr","CTR")}{thS("roas","ROAS")}<th style={{padding:"10px 16px",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em",textAlign:"left"}}>Alertas</th></tr></thead>
                  <tbody>
                    {[...camps].filter(c=>c.insights).sort((a,b)=>(parseFloat(b.insights?.spend)||0)-(parseFloat(a.insights?.spend)||0)).slice(0,5).map(c=>{
                      const s=parseFloat(c.insights?.spend)||0,rv=gA(c.insights?.action_values,"purchase"),cr=s>0?rv/s:0;
                      const al=getAlerts(c,avgCpc);
                      return(<tr key={c.id} className="rh" style={{transition:"background 0.15s"}}>
                        <td style={{...tdS,maxWidth:260}}><p style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Syne',sans-serif",fontSize:13}}>{c.name}</p></td>
                        <td style={{...tdS,color:T.accent}}>{brl(c.insights?.spend)}</td>
                        <td style={tdS}>{pct(c.insights?.ctr)}</td>
                        <td style={{...tdS,color:cr>=2?T.green:cr>=1?T.text:cr>0?T.red:T.muted,fontWeight:cr>0?600:400}}>{cr>0?`${cr.toFixed(2)}x`:"—"}</td>
                        <td style={tdS}><div style={{display:"flex",gap:3}}>{al.map((a,i)=><AlertChip key={i} a={a}/>)}</div></td>
                      </tr>);
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ):tab==="campaigns"?(
          <div style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
            <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:13,fontWeight:600}}>Campanhas <span style={{color:T.sub,fontWeight:400,fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>({sortedCamps.length})</span></span>
              <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
                <input value={campSearch} onChange={e=>setCSearch(e.target.value)} placeholder="Buscar..." style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:"6px 10px",borderRadius:7,fontSize:12,outline:"none",width:155,fontFamily:"'JetBrains Mono',monospace"}}/>
                <div style={{display:"flex",gap:4}}>
                  {["all","ACTIVE","PAUSED","ARCHIVED"].map(s=><button key={s} className={`pill${campStatus===s?" on":""}`} onClick={()=>setCStat(s)}>{s==="all"?"Todas":s==="ACTIVE"?"Ativas":s==="PAUSED"?"Pausadas":"Arquivadas"}</button>)}
                </div>
              </div>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:T.bg+"88"}}>{thS("name","Campanha",false)}{thS("status","Status",false)}{thS("spend","Gasto")}{thS("impressions","Impr.")}{thS("clicks","Cliques")}{thS("ctr","CTR")}{thS("cpc","CPC")}{thS("roas","ROAS")}<th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap",fontWeight:500}}>Alertas</th></tr></thead>
                <tbody>
                  {sortedCamps.length===0?<tr><td colSpan={9} style={{...tdS,textAlign:"center",padding:"48px",color:T.muted}}>Nenhuma campanha encontrada</td></tr>
                    :sortedCamps.map(c=>{
                      const ins=c.insights,s=parseFloat(ins?.spend)||0,rv=gA(ins?.action_values,"purchase"),cr=s>0?rv/s:0;
                      const al=getAlerts(c,avgCpc);
                      const es=c.effective_status||c.status;
                      return(<tr key={c.id} className="rh" style={{transition:"background 0.15s"}}>
                        <td style={{...tdS,maxWidth:260}}><p style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:500}}>{c.name}</p><p style={{fontSize:10,color:T.muted,marginTop:2}}>{c.objective||"—"}</p></td>
                        <td style={tdS}><Badge color={statusColor(es)}>{statusLabel(es)}</Badge></td>
                        <td style={{...tdS,color:T.accent,fontWeight:600}}>{ins?brl(ins.spend):"—"}</td>
                        <td style={tdS}>{ins?num(ins.impressions):"—"}</td>
                        <td style={tdS}>{ins?num(ins.clicks):"—"}</td>
                        <td style={{...tdS,color:parseFloat(ins?.ctr)<1&&parseFloat(ins?.ctr)>0?T.orange:T.text}}>{ins?pct(ins.ctr):"—"}</td>
                        <td style={tdS}>{ins?brl(ins.cpc):"—"}</td>
                        <td style={{...tdS,color:cr>=2?T.green:cr>=1?T.text:cr>0?T.red:T.muted,fontWeight:cr>0?600:400}}>{ins?`${cr.toFixed(2)}x`:"—"}</td>
                        <td style={tdS}><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{al.map((a,i)=><AlertChip key={i} a={a}/>)}</div></td>
                      </tr>);
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        ):tab==="adsets"?(
          <div style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
            <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:13,fontWeight:600}}>Conjuntos de anúncios <span style={{color:T.sub,fontWeight:400,fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>({adsets.filter(a=>!asSearch||a.name.toLowerCase().includes(asSearch.toLowerCase())).length})</span></span>
              <input value={asSearch} onChange={e=>setAsSearch(e.target.value)} placeholder="Buscar conjunto..." style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:"6px 10px",borderRadius:7,fontSize:12,outline:"none",width:190,fontFamily:"'JetBrains Mono',monospace"}}/>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:T.bg+"88"}}>
                  <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em",minWidth:220}}>Conjunto</th>
                  <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em"}}>Status Real</th>
                  <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em"}}>Gasto</th>
                  <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em"}}>Cliques</th>
                  <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em"}}>CTR</th>
                  <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em"}}>CPC</th>
                  <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em"}}>Freq.</th>
                  <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em"}}>ROAS</th>
                  <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em"}}>Alertas</th>
                </tr></thead>
                <tbody>
                  {adsets.filter(a=>!asSearch||a.name.toLowerCase().includes(asSearch.toLowerCase())).map(a=>{
                    const ins=a.insights,s=parseFloat(ins?.spend)||0,rv=gA(ins?.action_values,"purchase"),cr=s>0?rv/s:0;
                    const freq=parseFloat(ins?.frequency)||0;
                    const es=a.effective_status||a.status;
                    const als=[];
                    if(parseFloat(ins?.ctr)>0&&parseFloat(ins?.ctr)<1)als.push({c:"warn",l:"CTR baixo"});
                    if(freq>=4)als.push({c:"freq",l:`Freq ${freq.toFixed(1)}x`});
                    else if(freq>=3)als.push({c:"freq",l:`Freq ${freq.toFixed(1)}x`});
                    return(<tr key={a.id} className="rh" style={{transition:"background 0.15s"}}>
                      <td style={{...tdS,maxWidth:260}}>
                        <p style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:500}}>{a.name}</p>
                        <p style={{fontSize:10,color:T.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.campaign}</p>
                      </td>
                      {/* FIX: Use effective_status for accurate status */}
                      <td style={tdS}><Badge color={statusColor(es)}>{statusLabel(es)}</Badge></td>
                      <td style={{...tdS,color:T.accent,fontWeight:600}}>{ins?brl(ins.spend):"—"}</td>
                      <td style={tdS}>{ins?num(ins.clicks):"—"}</td>
                      <td style={{...tdS,color:parseFloat(ins?.ctr)<1&&parseFloat(ins?.ctr)>0?T.orange:T.text}}>{ins?pct(ins.ctr):"—"}</td>
                      <td style={tdS}>{ins?brl(ins.cpc):"—"}</td>
                      <td style={{...tdS,color:freq>=4?T.red:freq>=3?T.orange:T.text,fontWeight:freq>=3?600:400}}>{ins?`${freq.toFixed(1)}x`:"—"}</td>
                      <td style={{...tdS,color:cr>=2?T.green:cr>=1?T.text:cr>0?T.red:T.muted,fontWeight:cr>0?600:400}}>{ins&&cr>0?`${cr.toFixed(2)}x`:"—"}</td>
                      <td style={tdS}><div style={{display:"flex",gap:3}}>{als.map((al,i)=><AlertChip key={i} a={al}/>)}</div></td>
                    </tr>);
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ):(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <span style={{fontSize:13,fontWeight:600}}>Criativos <span style={{color:T.sub,fontWeight:400,fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>({filteredCr.length})</span></span>
              <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>Rank por</span>
                  {["spend","roas","ctr"].map(s=><button key={s} className={`pill${crSort===s?" on":""}`} onClick={()=>setCrSort(s)}>{s==="spend"?"Gasto":s==="roas"?"ROAS":"CTR"}</button>)}
                </div>
                <div style={{width:1,height:18,background:T.border}}/>
                {["all","Imagem","Vídeo","Carrossel"].map(f=><button key={f} className={`pill${crFmt===f?" on":""}`} onClick={()=>setCrFmt(f)}>{f==="all"?"Todos":f}</button>)}
                <input value={crSearch} onChange={e=>setCrSearch(e.target.value)} placeholder="Buscar..." style={{background:T.s1,border:`1px solid ${T.border}`,color:T.text,padding:"6px 10px",borderRadius:7,fontSize:12,outline:"none",width:150,fontFamily:"'JetBrains Mono',monospace"}}/>
              </div>
            </div>
            {filteredCr.length===0
              ?<div style={{textAlign:"center",padding:"60px",color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>Nenhum criativo encontrado</div>
              :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:12}}>
                {filteredCr.map((cr,i)=><CreativeCard key={cr.id} cr={cr} rank={i+1} maxVal={maxCreativeVal} sortM={crSort}/>)}
              </div>
            }
          </>
        )}
        <div style={{marginTop:24,textAlign:"center",fontSize:9,color:T.muted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.06em"}}>
          {isDemo?"MODO DEMO — DADOS SIMULADOS":`META GRAPH API ${API_V} · ${new Date().toLocaleTimeString("pt-BR")}`}
        </div>
      </main>
    </div>
  );
}
