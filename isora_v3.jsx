import { useState, useCallback, useMemo, useRef } from "react";
import Papa from "papaparse";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, Legend } from "recharts";

/* ═══ COUNTRY GUIDE — 186 jurisdictions (all ISORA + 6 manually resolved) ═══ */
const GD=[
  {I:"Anguilla",E:"Anguilla",R:"Latin America & Caribbean",G:"High income"},
  {I:"Cook Islands",E:"Cook Islands",R:"East Asia & Pacific",G:"Upper middle income"},
  {I:"Montserrat",E:"Montserrat",R:"Latin America & Caribbean",G:"High income"},
  {I:"Niue",E:"Niue",R:"East Asia & Pacific",G:"Upper middle income"},
  {I:"Republika Srpska",E:"Republika Srpska",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Virgin Islands, British",E:"British Virgin Islands",R:"Latin America & Caribbean",G:"High income"},
  {I:"Afghanistan, Islamic Republic of",E:"Afghanistan",R:"South Asia",G:"Low income"},
  {I:"Albania",E:"Albania",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Algeria",E:"Algeria",R:"Middle East & North Africa",G:"Upper middle income"},
  {I:"Angola",E:"Angola",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Antigua and Barbuda",E:"Antigua and Barbuda",R:"Latin America & Caribbean",G:"High income"},
  {I:"Argentina",E:"Argentina",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Armenia, Republic of",E:"Armenia",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Aruba",E:"Aruba",R:"Latin America & Caribbean",G:"High income"},
  {I:"Australia",E:"Australia",R:"East Asia & Pacific",G:"High income"},
  {I:"Austria",E:"Austria",R:"Europe & Central Asia",G:"High income"},
  {I:"Azerbaijan, Republic of",E:"Azerbaijan",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Bangladesh",E:"Bangladesh",R:"South Asia",G:"Lower middle income"},
  {I:"Barbados",E:"Barbados",R:"Latin America & Caribbean",G:"High income"},
  {I:"Belarus",E:"Belarus",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Belgium",E:"Belgium",R:"Europe & Central Asia",G:"High income"},
  {I:"Belize",E:"Belize",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Benin",E:"Benin",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Bermuda",E:"Bermuda",R:"North America",G:"High income"},
  {I:"Bhutan",E:"Bhutan",R:"South Asia",G:"Lower middle income"},
  {I:"Bolivia",E:"Bolivia",R:"Latin America & Caribbean",G:"Lower middle income"},
  {I:"Bosnia and Herzegovina",E:"Bosnia and Herzegovina",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Botswana",E:"Botswana",R:"Sub-Saharan Africa",G:"Upper middle income"},
  {I:"Brazil",E:"Brazil",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Brunei Darussalam",E:"Brunei Darussalam",R:"East Asia & Pacific",G:"High income"},
  {I:"Bulgaria",E:"Bulgaria",R:"Europe & Central Asia",G:"High income"},
  {I:"Burkina Faso",E:"Burkina Faso",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Burundi",E:"Burundi",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Cabo Verde",E:"Cabo Verde",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Cambodia",E:"Cambodia",R:"East Asia & Pacific",G:"Lower middle income"},
  {I:"Cameroon",E:"Cameroon",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Canada",E:"Canada",R:"North America",G:"High income"},
  {I:"Central African Republic",E:"Central African Republic",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Chad",E:"Chad",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Chile",E:"Chile",R:"Latin America & Caribbean",G:"High income"},
  {I:"China, P.R.: Mainland",E:"China",R:"East Asia & Pacific",G:"Upper middle income"},
  {I:"China, P.R.: Hong Kong",E:"Hong Kong SAR",R:"East Asia & Pacific",G:"High income"},
  {I:"Colombia",E:"Colombia",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Comoros",E:"Comoros",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Congo, Democratic Republic of",E:"DR Congo",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Congo, Republic of",E:"Congo Republic",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Costa Rica",E:"Costa Rica",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Côte d'Ivoire",E:"Côte d'Ivoire",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Croatia",E:"Croatia",R:"Europe & Central Asia",G:"High income"},
  {I:"Cuba",E:"Cuba",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Cyprus",E:"Cyprus",R:"Europe & Central Asia",G:"High income"},
  {I:"Czech Republic",E:"Czechia",R:"Europe & Central Asia",G:"High income"},
  {I:"Denmark",E:"Denmark",R:"Europe & Central Asia",G:"High income"},
  {I:"Dominica",E:"Dominica",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Dominican Republic",E:"Dominican Republic",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Ecuador",E:"Ecuador",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Egypt, Arab Rep.",E:"Egypt",R:"Middle East & North Africa",G:"Lower middle income"},
  {I:"El Salvador",E:"El Salvador",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Equatorial Guinea",E:"Equatorial Guinea",R:"Sub-Saharan Africa",G:"Upper middle income"},
  {I:"Estonia",E:"Estonia",R:"Europe & Central Asia",G:"High income"},
  {I:"Eswatini",E:"Eswatini",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Ethiopia",E:"Ethiopia",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Fiji",E:"Fiji",R:"East Asia & Pacific",G:"Upper middle income"},
  {I:"Finland",E:"Finland",R:"Europe & Central Asia",G:"High income"},
  {I:"France",E:"France",R:"Europe & Central Asia",G:"High income"},
  {I:"Gabon",E:"Gabon",R:"Sub-Saharan Africa",G:"Upper middle income"},
  {I:"Gambia, The",E:"Gambia",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Georgia",E:"Georgia",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Germany",E:"Germany",R:"Europe & Central Asia",G:"High income"},
  {I:"Ghana",E:"Ghana",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Greece",E:"Greece",R:"Europe & Central Asia",G:"High income"},
  {I:"Grenada",E:"Grenada",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Guatemala",E:"Guatemala",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Guinea",E:"Guinea",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Guinea Bissau",E:"Guinea-Bissau",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Guyana",E:"Guyana",R:"Latin America & Caribbean",G:"High income"},
  {I:"Honduras",E:"Honduras",R:"Latin America & Caribbean",G:"Lower middle income"},
  {I:"Hungary",E:"Hungary",R:"Europe & Central Asia",G:"High income"},
  {I:"Iceland",E:"Iceland",R:"Europe & Central Asia",G:"High income"},
  {I:"India",E:"India",R:"South Asia",G:"Lower middle income"},
  {I:"Indonesia",E:"Indonesia",R:"East Asia & Pacific",G:"Upper middle income"},
  {I:"Iraq",E:"Iraq",R:"Middle East & North Africa",G:"Upper middle income"},
  {I:"Ireland",E:"Ireland",R:"Europe & Central Asia",G:"High income"},
  {I:"Israel",E:"Israel",R:"Middle East & North Africa",G:"High income"},
  {I:"Italy",E:"Italy",R:"Europe & Central Asia",G:"High income"},
  {I:"Jamaica",E:"Jamaica",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Japan",E:"Japan",R:"East Asia & Pacific",G:"High income"},
  {I:"Jordan",E:"Jordan",R:"Middle East & North Africa",G:"Lower middle income"},
  {I:"Kazakhstan",E:"Kazakhstan",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Kenya",E:"Kenya",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Kiribati",E:"Kiribati",R:"East Asia & Pacific",G:"Lower middle income"},
  {I:"Korea, Republic of",E:"South Korea",R:"East Asia & Pacific",G:"High income"},
  {I:"Kosovo, Republic of",E:"Kosovo",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Kyrgyz Republic",E:"Kyrgyz Republic",R:"Europe & Central Asia",G:"Lower middle income"},
  {I:"Lao People's Democratic Republic",E:"Lao PDR",R:"East Asia & Pacific",G:"Lower middle income"},
  {I:"Latvia",E:"Latvia",R:"Europe & Central Asia",G:"High income"},
  {I:"Lebanon",E:"Lebanon",R:"Middle East & North Africa",G:"Lower middle income"},
  {I:"Lesotho",E:"Lesotho",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Liberia",E:"Liberia",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Libya",E:"Libya",R:"Middle East & North Africa",G:"Upper middle income"},
  {I:"Lithuania",E:"Lithuania",R:"Europe & Central Asia",G:"High income"},
  {I:"Luxembourg",E:"Luxembourg",R:"Europe & Central Asia",G:"High income"},
  {I:"Madagascar",E:"Madagascar",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Malawi",E:"Malawi",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Malaysia",E:"Malaysia",R:"East Asia & Pacific",G:"Upper middle income"},
  {I:"Maldives",E:"Maldives",R:"South Asia",G:"Upper middle income"},
  {I:"Mali",E:"Mali",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Malta",E:"Malta",R:"Middle East & North Africa",G:"High income"},
  {I:"Marshall Islands, Republic of",E:"Marshall Islands",R:"East Asia & Pacific",G:"Upper middle income"},
  {I:"Mauritania",E:"Mauritania",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Mauritius",E:"Mauritius",R:"Sub-Saharan Africa",G:"Upper middle income"},
  {I:"Mexico",E:"Mexico",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Micronesia, Federated States of",E:"Micronesia",R:"East Asia & Pacific",G:"Lower middle income"},
  {I:"Moldova",E:"Moldova",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Mongolia",E:"Mongolia",R:"East Asia & Pacific",G:"Upper middle income"},
  {I:"Montenegro",E:"Montenegro",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Morocco",E:"Morocco",R:"Middle East & North Africa",G:"Lower middle income"},
  {I:"Mozambique",E:"Mozambique",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Myanmar",E:"Myanmar",R:"East Asia & Pacific",G:"Lower middle income"},
  {I:"Namibia",E:"Namibia",R:"Sub-Saharan Africa",G:"Upper middle income"},
  {I:"Nauru",E:"Nauru",R:"East Asia & Pacific",G:"High income"},
  {I:"Nepal",E:"Nepal",R:"South Asia",G:"Lower middle income"},
  {I:"Netherlands",E:"Netherlands",R:"Europe & Central Asia",G:"High income"},
  {I:"New Zealand",E:"New Zealand",R:"East Asia & Pacific",G:"High income"},
  {I:"Nicaragua",E:"Nicaragua",R:"Latin America & Caribbean",G:"Lower middle income"},
  {I:"Niger",E:"Niger",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Nigeria",E:"Nigeria",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Norway",E:"Norway",R:"Europe & Central Asia",G:"High income"},
  {I:"Pakistan",E:"Pakistan",R:"South Asia",G:"Lower middle income"},
  {I:"Palau",E:"Palau",R:"East Asia & Pacific",G:"High income"},
  {I:"Panama",E:"Panama",R:"Latin America & Caribbean",G:"High income"},
  {I:"Papua New Guinea",E:"Papua New Guinea",R:"East Asia & Pacific",G:"Lower middle income"},
  {I:"Paraguay",E:"Paraguay",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Peru",E:"Peru",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Philippines",E:"Philippines",R:"East Asia & Pacific",G:"Lower middle income"},
  {I:"Poland",E:"Poland",R:"Europe & Central Asia",G:"High income"},
  {I:"Portugal",E:"Portugal",R:"Europe & Central Asia",G:"High income"},
  {I:"Republic of North Macedonia",E:"N. Macedonia",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Romania",E:"Romania",R:"Europe & Central Asia",G:"High income"},
  {I:"Russian Federation",E:"Russia",R:"Europe & Central Asia",G:"High income"},
  {I:"Rwanda",E:"Rwanda",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Samoa",E:"Samoa",R:"East Asia & Pacific",G:"Lower middle income"},
  {I:"São Tomé and Príncipe",E:"São Tomé & Príncipe",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Saudi Arabia",E:"Saudi Arabia",R:"Middle East & North Africa",G:"High income"},
  {I:"Senegal",E:"Senegal",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Serbia, Republic of",E:"Serbia",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Seychelles",E:"Seychelles",R:"Sub-Saharan Africa",G:"High income"},
  {I:"Sierra Leone",E:"Sierra Leone",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Singapore",E:"Singapore",R:"East Asia & Pacific",G:"High income"},
  {I:"Slovak Republic",E:"Slovakia",R:"Europe & Central Asia",G:"High income"},
  {I:"Slovenia",E:"Slovenia",R:"Europe & Central Asia",G:"High income"},
  {I:"Solomon Islands",E:"Solomon Islands",R:"East Asia & Pacific",G:"Lower middle income"},
  {I:"South Africa",E:"South Africa",R:"Sub-Saharan Africa",G:"Upper middle income"},
  {I:"Spain",E:"Spain",R:"Europe & Central Asia",G:"High income"},
  {I:"Sri Lanka",E:"Sri Lanka",R:"South Asia",G:"Lower middle income"},
  {I:"St. Kitts and Nevis",E:"St. Kitts & Nevis",R:"Latin America & Caribbean",G:"High income"},
  {I:"St. Lucia",E:"St. Lucia",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"St. Vincent and the Grenadines",E:"St. Vincent",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Sudan",E:"Sudan",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Suriname",E:"Suriname",R:"Latin America & Caribbean",G:"Upper middle income"},
  {I:"Sweden",E:"Sweden",R:"Europe & Central Asia",G:"High income"},
  {I:"Switzerland",E:"Switzerland",R:"Europe & Central Asia",G:"High income"},
  {I:"Taiwan",E:"Taiwan",R:"East Asia & Pacific",G:"High income"},
  {I:"Tajikistan",E:"Tajikistan",R:"Europe & Central Asia",G:"Lower middle income"},
  {I:"Tanzania",E:"Tanzania",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Thailand",E:"Thailand",R:"East Asia & Pacific",G:"Upper middle income"},
  {I:"Timor-Leste, Dem. Rep. of",E:"Timor-Leste",R:"East Asia & Pacific",G:"Lower middle income"},
  {I:"Togo",E:"Togo",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Tonga",E:"Tonga",R:"East Asia & Pacific",G:"Upper middle income"},
  {I:"Trinidad and Tobago",E:"Trinidad & Tobago",R:"Latin America & Caribbean",G:"High income"},
  {I:"Tunisia",E:"Tunisia",R:"Middle East & North Africa",G:"Lower middle income"},
  {I:"Türkiye, Rep of",E:"Türkiye",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"Turks and Caicos Islands",E:"Turks & Caicos",R:"Latin America & Caribbean",G:"High income"},
  {I:"Tuvalu",E:"Tuvalu",R:"East Asia & Pacific",G:"Upper middle income"},
  {I:"Uganda",E:"Uganda",R:"Sub-Saharan Africa",G:"Low income"},
  {I:"Ukraine",E:"Ukraine",R:"Europe & Central Asia",G:"Upper middle income"},
  {I:"United Kingdom",E:"United Kingdom",R:"Europe & Central Asia",G:"High income"},
  {I:"United States",E:"United States",R:"North America",G:"High income"},
  {I:"Uruguay",E:"Uruguay",R:"Latin America & Caribbean",G:"High income"},
  {I:"Uzbekistan",E:"Uzbekistan",R:"Europe & Central Asia",G:"Lower middle income"},
  {I:"Vanuatu",E:"Vanuatu",R:"East Asia & Pacific",G:"Lower middle income"},
  {I:"Vietnam",E:"Vietnam",R:"East Asia & Pacific",G:"Lower middle income"},
  {I:"Zambia",E:"Zambia",R:"Sub-Saharan Africa",G:"Lower middle income"},
  {I:"Zimbabwe",E:"Zimbabwe",R:"Sub-Saharan Africa",G:"Lower middle income"},
];
const GUIDE = new Map(GD.map(r=>[r.I,{region:r.R,income:r.G,economy:r.E}]));

/* ═══ THEME RULES ═══ */
const TR=[
  [/^(total net revenue|net revenue collected|composition of value added tax|cit to total|pit to total|vat to total|ssc to total|excises.*to total|non tax revenue|other taxes to total|tax collected|revenue collected|total government revenue|revenue types.*tax administration|recurrent cost of collection)/i,"1. Revenue & Tax Collections"],
  [/^(number of taxpayers by tax type|on cit register|on pit register|on vat register|on paye register|on excise register|active taxpayers on pit register|on-time filing rate)/i,"2. Taxpayer Registration"],
  [/^(number of returns received|total number of returns|on-time return filing|percent.*returns|e-filing mandatory|paper returns|electronic.*cit|electronic.*pit|electronic.*vat|electronic.*paye|electronic -|of prefilled returns|administration pre-fills)/i,"3. Returns & E-Filing"],
  [/^(closing stock of arrears|on-time payments|percentage of payments received|percentage electronic payments|e-payment mandatory|cit arrears|pit arrears|vat arrears|paye arrears|total year-end arrears|value of all vat|treatment of vat)/i,"4. Payments & Arrears"],
  [/^(audit hit rate|details on all audits|value of additional assessments|audits undertaken|enforcement \(audit\)|no\. of audits|cit assessements|pit assessements|paye assessements|vat assessements|additional assessments raised|specific selection|use of random audits|administration conducts random audits|administration has standards for auditor|no\. of tax crime|no\. of internal cases|indicators used to measure.*enforcement|role of the administration in tax crime|total value of additional assessments raised through lto)/i,"5. Audit & Enforcement"],
  [/^(academic qualifications|age distribution.*staff|length of service.*staff|staff strength levels|total tax administration fte|ftes by function|ftes involved|no\. of ftes in lto|percent staff|gender distribution.*staff|attrition rate|hiring rate|labor force per fte|population per fte|no\. of staff -|ftes on audit.*lto)/i,"6. Staff & Workforce"],
  [/^(implementation and use of innovative|information and communications technology expenditure|total ict expenditure|ict expenditure for tax|ict operating cost|administration has systems for importing|administration receives data from devices|administration undertakes fully automated|administration uses electronic compliance|electronic fiscal|all or certain taxpayers.*electronic invoice|certain taxpayers.*electronic fiscal|mandatory to use an electronic invoice|provision of e-services|online services provided)/i,"7. ICT & Technology"],
  [/^(no\. of incoming service contacts|features of the service approach|administration keeps track|administration uses service channel|individual taxpayers - taxpayer satisfaction|business taxpayers - taxpayer satisfaction|tax intermediaries - satisfaction|educational or business support|availability of registration channels for taxpayers|private rulings|public rulings|formal set of service delivery|formal taxpayer service and assistance|administration evaluates taxpayer compliance burden|taxpayer education or awareness|administration has undertaken analysis of taxpayer satisfaction)/i,"8. Taxpayer Services"],
  [/^(formal compliance risk management|compiance risk|key compliance risks|reports of outcomes.*compliance|formal framework for compliance|general approach to compliance|cooperative compliance approach|interventions undertaken|administration measures the effectiveness|tax gap|challenges related to international tax|administration assesses capability needs|formal approach.*identifying.*prioritizing|formal approach for identifying|compliance risk management)/i,"9. Compliance Management"],
  [/^(authority of the administration|institutional framework|large taxpayer office.*exists|significant structural reforms|broad nature of structural reforms|main drivers of structural reforms|joint with customs|other roles -|type of simplified|simplified income tax regime|administration has authority to|tax administration functions carried out by lto|hnwi.*program|hnwi.*unit|functions carried out by hnwi|corporate taxpayers managed|corporate taxpayers per fte|no\. of taxpayers included under the lto|percentage of net revenue administered under|number of ftes in the hnwi|number of hnwis managed|main criteria for determining a large|main criteria for determining a hnwi)/i,"10. Governance & Structure"],
  [/^(mechanisms available for taxpayers to challenge|tax arrears collection powers|application of administrative sanctions|administrative sanctions for taxpayer|tax cases under|voluntary disclosures|taxpayer has the right|taxpayers must first pursue|process allows for systemic|process is independent|ratio of cases|number of cases resolved|external review mechanisms for dealing|internal review mechanisms for dealing|document exists.*taxpayer rights|document type|availability of specific powers)/i,"11. Legal & Dispute"],
  [/^(gender distribution|gender of individual|gender-disaggregated|administration captures information on.*gender|formal diversity policy|of total recruitments.*female|percent executives who are female|percent staff who are female|taxpayer education.*gender|administration has undertaken analysis of taxpayer satisfaction with services by gender|changes made based on analysis of gender)/i,"12. Gender & Diversity"],
  [/^(hr strategy|training strategy|performance management|staffing plan|recruitment plan|remuneration|pay scale|specific leadership|policies for flexible|staff can work|executives can work|formal mentoring|formal program.*new staff|formal internal assurance|integrity strategy|time reporting system|knowledge transfer|staff surveyed periodically|staff surveys|public service.*code of conduct|administration has its own code of conduct|tax administration publishes|use of an external auditor|annual report.*produced|annual business.*plan|strategic plan.*produced)/i,"13. HR & Organization"],
  [/^(gross domestic product|total population|labor force$|participation rate|total operating expenditures|total salary expenditures|operating expenditure$|capital expenditure|salary cost as percent|salary expenditure.*derived|information and communications technology expenditure.*derived)/i,"14. Macro & Finance"],
];
const assignTheme=i=>{const l=i.toLowerCase();for(const[r,t]of TR)if(r.test(l))return t;return"15. Other Indicators"};

/* ═══ COLORS ═══ */
const RC={"East Asia & Pacific":"#2E75B6","Europe & Central Asia":"#5B9BD5","Latin America & Caribbean":"#ED7D31","Middle East & North Africa":"#FFC000","North America":"#70AD47","South Asia":"#C00000","Sub-Saharan Africa":"#7030A0"};
const IC={"High income":"#2E75B6","Upper middle income":"#70AD47","Lower middle income":"#ED7D31","Low income":"#C00000"};
const YC={"2018":"#2E75B6","2019":"#ED7D31","2020":"#70AD47","2021":"#FFC000","2022":"#7030A0","2023":"#C00000"};
const YEARS=["2018","2019","2020","2021","2022","2023"];

/* ═══ UTILS ═══ */
const SUPP=new Set(["D","d","N/A","NA","n/a","Not Applicable","Not applicable","Not Available"]);
const nv=v=>{if(v==null||v==="")return null;const s=String(v).trim();if(SUPP.has(s))return null;const n=parseFloat(s.replace(/,/g,""));if(!isNaN(n))return n;if(/^yes$/i.test(s))return"Yes";if(/^no$/i.test(s))return"No";return s};
const isN=v=>typeof v==="number";
const med=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2};
const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
const fmt=n=>{if(n==null)return"—";const a=Math.abs(n);return a>=1e9?(n/1e9).toFixed(2)+"B":a>=1e6?(n/1e6).toFixed(2)+"M":a>=1e3?(n/1e3).toFixed(1)+"K":Number.isInteger(n)?n.toLocaleString():n.toFixed(2)};
const pct=n=>n==null?null:+n.toFixed(1);
const detectType=jm=>{let nu=0,ye=0,no=0,ot=0;jm.forEach(v=>YEARS.forEach(y=>{const val=v[y];if(val==null)return;isN(val)?nu++:val==="Yes"?ye++:val==="No"?no++:ot++;}));const t=nu+ye+no+ot;if(!t)return"empty";if(nu/t>0.4)return"numeric";if((ye+no)/t>0.4)return"yesno";return"categorical"};

/* ═══ TOOLTIP ═══ */
const TT=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return(<div style={{background:"#fff",border:"1px solid #ddd",borderRadius:6,padding:"10px 14px",boxShadow:"0 4px 16px rgba(0,0,0,.13)",fontSize:12,fontFamily:"'Outfit',sans-serif",maxWidth:260}}>
    <div style={{fontWeight:700,marginBottom:6,color:"#1a1a2e",borderBottom:"1px solid #eee",paddingBottom:4}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",gap:20,marginTop:3}}>
      <span style={{color:"#666",display:"flex",alignItems:"center",gap:5}}><span style={{display:"inline-block",width:10,height:10,borderRadius:2,background:p.fill||p.color}}/>{p.name}</span>
      <span style={{fontWeight:700,color:"#1a1a2e"}}>{typeof p.value==="number"?fmt(p.value):p.value}</span>
    </div>)}
  </div>);
};

/* ═══ CSS ═══ */
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#EFF3F8;--sb:#fff;--card:#fff;--bd:#D8E2F0;--pri:#2E5FA3;--prilt:#EBF2FF;--acc:#ED7D31;--grn:#2E7D32;--red:#C62828;--ylw:#F57F17;--txt:#1C2640;--mut:#607090;--fn:'Outfit',sans-serif}
body{background:var(--bg)}
.app{font-family:var(--fn);min-height:100vh;color:var(--txt);background:var(--bg)}
/* HEADER */
.hdr{background:var(--pri);height:52px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 10px rgba(0,0,0,.25)}
.brand{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:700;color:#fff;letter-spacing:.3px}
.brand span{color:#FFC000}
.hdr-r{display:flex;align-items:center;gap:10px}
.hdr-info{font-size:11px;color:rgba(255,255,255,.65)}
.hbtn{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:5px;padding:5px 12px;font-size:11px;font-weight:600;font-family:var(--fn);cursor:pointer;transition:.15s}
.hbtn:hover{background:rgba(255,255,255,.28)}
/* LAYOUT */
.lay{display:flex;height:calc(100vh - 52px);overflow:hidden}
.sb{width:276px;min-width:276px;background:var(--sb);border-right:1px solid var(--bd);overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:12px}
.sb::-webkit-scrollbar{width:4px}.sb::-webkit-scrollbar-thumb{background:#ccc;border-radius:4px}
.main{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:12px}
.main::-webkit-scrollbar{width:5px}.main::-webkit-scrollbar-thumb{background:#ccc;border-radius:4px}
/* SIDEBAR */
.stitle{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--mut);margin-bottom:5px}
.ssec{display:flex;flex-direction:column;gap:7px}
.div{height:1px;background:var(--bd)}
/* CONTROLS */
.sel{width:100%;background:var(--bg);border:1px solid var(--bd);color:var(--txt);border-radius:5px;padding:6px 28px 6px 9px;font-size:12px;font-family:var(--fn);outline:none;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23607090'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 9px center}
.sel:focus{border-color:var(--pri);box-shadow:0 0 0 2px var(--prilt)}
.ind-chip{background:var(--prilt);border:1px solid #AECBFF;color:var(--pri);border-radius:5px;padding:6px 9px;font-size:11px;font-weight:500;line-height:1.45;cursor:pointer;word-break:break-word}
.ind-chip:hover{background:#D8EAFF}
.sw{position:relative}
.si{width:100%;border:1px solid var(--bd);border-radius:5px;padding:6px 9px 6px 28px;font-size:12px;font-family:var(--fn);color:var(--txt);background:#fff;outline:none}
.si:focus{border-color:var(--pri)}
.sico{position:absolute;left:8px;top:50%;transform:translateY(-50%);color:var(--mut);pointer-events:none;font-size:13px}
.drop{position:absolute;top:calc(100%+3px);left:0;right:0;background:#fff;border:1px solid var(--bd);border-radius:6px;max-height:260px;overflow-y:auto;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,.14)}
.drop::-webkit-scrollbar{width:4px}.drop::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px}
.dgl{padding:4px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--mut);background:#F5F8FF;border-bottom:1px solid var(--bd)}
.di{padding:6px 10px;font-size:11px;cursor:pointer;line-height:1.4;color:var(--txt)}
.di:hover,.di.a{background:var(--prilt);color:var(--pri)}
.di.a{font-weight:600}
/* TOGGLES */
.tr{display:flex;gap:4px}
.tg{flex:1;background:var(--bg);border:1px solid var(--bd);color:var(--mut);border-radius:4px;padding:5px 3px;font-size:10.5px;font-weight:500;cursor:pointer;font-family:var(--fn);transition:.15s;text-align:center}
.tg:hover{border-color:var(--pri);color:var(--pri)}
.tg.on{background:var(--pri);border-color:var(--pri);color:#fff;font-weight:600}
/* YEAR PILLS */
.yrow{display:flex;flex-wrap:wrap;gap:4px}
.yp{background:var(--bg);border:1px solid var(--bd);color:var(--mut);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer;font-family:var(--fn);transition:.15s}
.yp:hover{border-color:var(--pri);color:var(--pri)}
.yp.on{background:var(--pri);border-color:var(--pri);color:#fff;font-weight:600}
/* CHIPS */
.chs{display:flex;flex-wrap:wrap;gap:3px}
.ch{border-radius:4px;padding:3px 7px;font-size:10px;font-weight:600;cursor:pointer;border:1.5px solid transparent;transition:.15s;opacity:.45}
.ch.on{opacity:1}
/* SLIDER */
.slr{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.slv{font-size:12px;font-weight:700;color:var(--pri)}
input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:var(--bd);outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;background:var(--pri);border-radius:50%;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.2)}
/* STATS */
.stats{display:flex;gap:10px;flex-wrap:wrap}
.stat{background:#fff;border:1px solid var(--bd);border-radius:8px;padding:10px 14px;flex:1;min-width:88px;border-left:3px solid var(--pri)}
.sv{font-family:'Barlow Condensed',sans-serif;font-size:21px;font-weight:700;color:var(--pri);letter-spacing:.3px}
.sl{font-size:9.5px;color:var(--mut);margin-top:1px;text-transform:uppercase;letter-spacing:.5px}
/* INSIGHT */
.ins{background:linear-gradient(135deg,#EDF4FF,#EDFBF4);border:1px solid #BFDAFF;border-radius:7px;padding:10px 14px;font-size:12px;color:#1A3A6E;line-height:1.65}
.ins strong{font-weight:700}
/* CHART CARD */
.cc{background:#fff;border:1px solid var(--bd);border-radius:9px;padding:16px 18px;box-shadow:0 1px 5px rgba(0,0,0,.05)}
.cchdr{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}
.cct{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;line-height:1.3;flex:1;min-width:0;letter-spacing:.2px}
.ccs{font-size:11px;color:var(--mut);margin-top:3px;line-height:1.4}
.ccact{display:flex;gap:7px;align-items:flex-start;flex-shrink:0}
.dqb{border-radius:4px;padding:3px 8px;font-size:10px;font-weight:600}
.dqg{background:#e8f5e9;color:#1b5e20;border:1px solid #a5d6a7}
.dqy{background:#fff8e1;color:#f57f17;border:1px solid #ffe082}
.dqr{background:#ffebee;color:#b71c1c;border:1px solid #ef9a9a}
.dlbtn{background:var(--pri);border:none;color:#fff;border-radius:5px;padding:6px 13px;font-size:11px;font-weight:600;font-family:var(--fn);cursor:pointer;display:flex;align-items:center;gap:5px;white-space:nowrap;transition:.15s}
.dlbtn:hover{background:#1e4a8a}
/* LEGEND */
.leg{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.li{display:flex;align-items:center;gap:4px;font-size:10.5px;color:var(--mut)}
.ld{width:11px;height:11px;border-radius:2px;flex-shrink:0}
/* TABLE */
.tw{overflow-x:auto;margin-top:12px;border:1px solid var(--bd);border-radius:6px;max-height:220px;overflow-y:auto}
.tw::-webkit-scrollbar{width:4px;height:4px}.tw::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px}
table{width:100%;border-collapse:collapse;font-size:11.5px}
th{background:#F5F8FF;color:var(--mut);padding:7px 11px;text-align:left;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.4px;position:sticky;top:0;border-bottom:1px solid var(--bd)}
td{padding:5px 11px;border-bottom:1px solid #F3F5FA;color:var(--txt)}
tr:hover td{background:#F5F9FF}
.tbtn{background:none;border:1px solid var(--bd);color:var(--mut);padding:4px 10px;font-size:11px;border-radius:4px;cursor:pointer;font-family:var(--fn);margin-top:8px}
.tbtn:hover{border-color:var(--pri);color:var(--pri)}
/* EMPTY */
.emp{display:flex;flex-direction:column;align-items:center;justify-content:center;height:280px;gap:8px}
.eico{font-size:36px;opacity:.2}
.etxt{color:var(--mut);font-size:13px;text-align:center;line-height:1.5}
/* UPLOAD */
.upw{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:calc(100vh - 52px);gap:20px;padding:40px}
.upbox{border:2px dashed var(--bd);border-radius:14px;padding:42px 52px;text-align:center;cursor:pointer;transition:.2s;max-width:500px;width:100%;background:#fff}
.upbox:hover,.upbox.drag{border-color:var(--pri);background:var(--prilt)}
.upico{font-size:44px;margin-bottom:14px}
.upt{font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:700;margin-bottom:6px}
.ups{font-size:12.5px;color:var(--mut);line-height:1.6}
.uph{font-size:11px;color:var(--mut);font-style:italic}
.pgw{width:100%;max-width:480px}
.pgt{background:var(--bd);height:6px;border-radius:3px;overflow:hidden}
.pgf{height:100%;background:linear-gradient(90deg,var(--pri),var(--acc));border-radius:3px;transition:width .3s}
.pgtxt{font-size:11px;color:var(--mut);margin-top:5px;text-align:center}
/* TYPE BADGE */
.tb{display:inline-block;border-radius:3px;padding:2px 6px;font-size:9.5px;font-weight:700;letter-spacing:.4px;margin-left:6px;vertical-align:middle}
.tb-yn{background:#FFF3CD;color:#856404;border:1px solid #FFDF7E}
.tb-nu{background:#D1E7FF;color:#084298;border:1px solid #9EC5FE}
.tb-ca{background:#D1ECF1;color:#0C5460;border:1px solid #9EEAF9}
`;

/* ═══ MAIN APP ═══ */
export default function App(){
  const[rawData,setRawData]=useState(null);
  const[indicators,setIndicators]=useState([]);
  const[loading,setLoading]=useState(false);
  const[progress,setProgress]=useState(0);
  const[pMsg,setPMsg]=useState("");
  const[isDrag,setIsDrag]=useState(false);
  const fref=useRef();
  const cref=useRef();

  const[selTheme,setSelTheme]=useState("");
  const[selInd,setSelInd]=useState("");
  const[indSearch,setIndSearch]=useState("");
  const[dropOpen,setDropOpen]=useState(false);
  const[selYear,setSelYear]=useState("2022"); // kept for download filename reference
  const[selYears,setSelYears]=useState(["2022"]);
  const[groupBy,setGroupBy]=useState("region");
  const[cmode,setCmode]=useState("ranking");
  const[topN,setTopN]=useState(25);
  const[sortDir,setSortDir]=useState("desc");
  const[showLbls,setShowLbls]=useState(true);
  const[showTbl,setShowTbl]=useState(false);
  const[actReg,setActReg]=useState(new Set(Object.keys(RC)));
  const[actInc,setActInc]=useState(new Set(Object.keys(IC)));

  /* PARSE */
  const parseCSV=useCallback(file=>{
    setLoading(true);setProgress(0);setPMsg("Reading file…");
    const tmp=new Map();let rows=0;
    Papa.parse(file,{header:true,skipEmptyLines:true,
      chunk(res){
        rows+=res.data.length;
        setProgress(Math.min(88,Math.round(rows/1100)));
        setPMsg(`Parsed ${rows.toLocaleString()} rows…`);
        res.data.forEach(row=>{
          const ind=row.INDICATOR,jur=row.JURISDICTION;
          if(!ind||!jur)return;
          if(!tmp.has(ind))tmp.set(ind,{jm:new Map(),scale:row.SCALE||"Units"});
          const e=tmp.get(ind);
          const vals={};
          YEARS.forEach(y=>{vals[y]=nv(row[y]);});
          e.jm.set(jur,vals);
          if(row.SCALE)e.scale=row.SCALE;
        });
      },
      complete(){
        setProgress(93);setPMsg("Detecting types…");
        const fm=new Map();
        tmp.forEach((e,ind)=>{fm.set(ind,{jm:e.jm,scale:e.scale,type:detectType(e.jm)});});
        const si=[...fm.keys()].sort();
        setIndicators(si);setRawData(fm);
        const fi=si[0]||"";setSelInd(fi);setSelTheme(fi?assignTheme(fi):"");
        setLoading(false);setProgress(100);
      },
      error(e){setLoading(false);alert("Parse error: "+e.message);}
    });
  },[]);

  const handleFile=useCallback(f=>{
    if(f&&(f.name.endsWith(".csv")||f.type==="text/csv"))parseCSV(f);
    else alert("Please upload a CSV file.");
  },[parseCSV]);

  /* DOWNLOAD */
  const dlPng=useCallback(()=>{
    const svg=cref.current?.querySelector("svg");
    if(!svg){alert("No chart to download.");return;}
    const rc=svg.getBoundingClientRect();
    const w=Math.round(rc.width)||800,h=Math.round(rc.height)||420;
    const HD=70,FT=30,SC=2;
    const cv=document.createElement("canvas");
    cv.width=(w+48)*SC;cv.height=(h+HD+FT)*SC;
    const ctx=cv.getContext("2d");ctx.scale(SC,SC);
    ctx.fillStyle="#fff";ctx.fillRect(0,0,w+48,h+HD+FT);
    // header
    ctx.fillStyle="#2E5FA3";ctx.fillRect(0,0,w+48,HD);
    ctx.fillStyle="#FFC000";ctx.fillRect(0,0,5,HD);
    ctx.fillStyle="#fff";ctx.font="bold 14px sans-serif";
    ctx.fillText((selInd||"ISORA Chart").slice(0,90),16,24);
    ctx.fillStyle="rgba(255,255,255,.65)";ctx.font="11px sans-serif";
    ctx.fillText(`Years: ${selYears.join(", ")} · By: ${groupBy} · ISORA Analytics`,16,44);
    ctx.fillStyle="#FFC000";ctx.font="bold 11px sans-serif";
    ctx.textAlign="right";ctx.fillText("ISORA · IMF/ADB/CIAT/IOTA/OECD",w+36,62);ctx.textAlign="left";
    // chart area bg
    ctx.fillStyle="#F8FAFF";ctx.fillRect(20,HD,w+8,h);
    // svg
    const s2=new XMLSerializer().serializeToString(svg);
    const blob=new Blob(['<?xml version="1.0" encoding="UTF-8"?>',s2],{type:"image/svg+xml"});
    const url=URL.createObjectURL(blob);
    const img=new Image();
    img.onload=()=>{
      ctx.drawImage(img,20,HD,w,h);
      ctx.fillStyle="#B0BAD0";ctx.font="9px sans-serif";
      ctx.fillText("Source: International Survey on Revenue Administration (ISORA) — isoradata.org",20,h+HD+20);
      URL.revokeObjectURL(url);
      const a=document.createElement("a");
      a.download=`ISORA_${(selInd||"chart").replace(/[^a-z0-9]/gi,"_").slice(0,40)}_${selYears.join("-")}.png`;
      a.href=cv.toDataURL("image/png");a.click();
    };
    img.onerror=()=>{URL.revokeObjectURL(url);alert("PNG export failed — use Chrome/Edge.");};
    img.src=url;
  },[selInd,selYears,cmode,groupBy]);

  /* THEMES + INDICATORS */
  const themes=useMemo(()=>{
    const m=new Map();
    indicators.forEach(i=>{const t=assignTheme(i);if(!m.has(t))m.set(t,[]);m.get(t).push(i);});
    return m;
  },[indicators]);
  const themeList=useMemo(()=>[...themes.keys()].sort(),[themes]);
  const filtInds=useMemo(()=>{
    const base=selTheme?(themes.get(selTheme)||[]):indicators;
    const q=indSearch.trim().toLowerCase();
    return q?base.filter(i=>i.toLowerCase().includes(q)):base;
  },[selTheme,themes,indicators,indSearch]);

  /* CHART DATA */
  const CD=useMemo(()=>{
    if(!rawData||!selInd)return null;
    const e=rawData.get(selInd);if(!e)return null;
    const{jm,type,scale}=e;
    // enrich
    const en=[];
    jm.forEach((vals,jur)=>{
      const g=GUIDE.get(jur);
      if(!g)return; // safely skip if truly unresolved
      if(!actReg.has(g.region)||!actInc.has(g.income))return;
      en.push({jur,eco:g.economy,region:g.region,income:g.income,...vals});
    });

    const pal=groupBy==="income"?IC:RC;
    const grps=groupBy==="income"?[...actInc]:[...actReg];

    /* YES/NO */
    if(type==="yesno"){
      const activeYrs=YEARS.filter(y=>selYears.includes(y));
      const refY=activeYrs[activeYrs.length-1]||"2022"; // newest selected year for sorting

      if(cmode==="ranking"||cmode==="group"){
        // For group mode: each group gets a row, each selected year is a bar
        const data=grps.map(g=>{
          const items=en.filter(x=>(groupBy==="income"?x.income:x.region)===g);
          const pt={name:g,fill:pal[g]||"#999"};
          let totalRef=0;
          activeYrs.forEach(y=>{
            const wd=items.filter(x=>x[y]==="Yes"||x[y]==="No");
            const yc=items.filter(x=>x[y]==="Yes").length;
            pt[y]=wd.length?pct(100*yc/wd.length):null;
            if(y===refY)totalRef=wd.length;
          });
          pt._refY=pt[refY];pt._total=totalRef;
          return pt;
        }).filter(d=>activeYrs.some(y=>d[y]!=null))
          .sort((a,b)=>sortDir==="desc"?(b._refY||0)-(a._refY||0):(a._refY||0)-(b._refY||0));

        if(cmode==="ranking"){
          // Country-level: each country is a row
          let cdata=en.map(x=>{
            const pt={name:x.eco.length>26?x.eco.slice(0,24)+"…":x.eco,full:x.eco,region:x.region,income:x.income,fill:(groupBy==="income"?IC[x.income]:RC[x.region])||"#999"};
            activeYrs.forEach(y=>{
              const v=x[y];pt[y]=(v==="Yes"?100:v==="No"?0:null);
            });
            pt._refY=pt[refY];
            return pt;
          }).filter(d=>activeYrs.some(y=>d[y]!=null));
          cdata.sort((a,b)=>sortDir==="desc"?(b._refY||0)-(a._refY||0):(a._refY||0)-(b._refY||0));
          cdata=cdata.slice(0,topN);
          return{type:"yesno",mode:"ranking",data:cdata,activeYrs,refY,scale:"% Yes",stats:{n:en.filter(x=>x[refY]==="Yes"||x[refY]==="No").length}};
        }
        return{type:"yesno",mode:"group",data,activeYrs,refY,scale:"% Yes",stats:{n:data.reduce((s,d)=>s+(d._total||0),0)}};
      }

      if(cmode==="trend"){
        // Y-axis = year, X-axis = % yes, grouped by group — horizontal
        const data=activeYrs.map(y=>{
          const pt={year:y};
          grps.forEach(g=>{
            const items=en.filter(x=>(groupBy==="income"?x.income:x.region)===g);
            const wd=items.filter(x=>x[y]==="Yes"||x[y]==="No");
            pt[g]=wd.length?pct(100*items.filter(x=>x[y]==="Yes").length/wd.length):null;
          });
          return pt;
        });
        return{type:"yesno",mode:"trend",data,keys:grps.map(g=>({key:g,color:pal[g]||"#999"})),activeYrs,scale:"% Yes"};
      }
    }

    /* NUMERIC */
    if(type==="numeric"){
      const activeYrs=YEARS.filter(y=>selYears.includes(y));
      const refY=activeYrs[activeYrs.length-1]||"2022";

      if(cmode==="ranking"){
        let items=en.map(x=>{
          const pt={name:x.eco.length>26?x.eco.slice(0,24)+"…":x.eco,full:x.eco,region:x.region,income:x.income,fill:(groupBy==="income"?IC[x.income]:RC[x.region])||"#999"};
          activeYrs.forEach(y=>{pt[y]=isN(x[y])?x[y]:null;});
          pt._refY=pt[refY];
          return pt;
        }).filter(x=>activeYrs.some(y=>x[y]!=null));
        // IQR outlier flag on ref year
        const sv=items.map(x=>x._refY).filter(isN).sort((a,b)=>a-b);
        const q1=sv[Math.floor(sv.length*.25)],q3=sv[Math.floor(sv.length*.75)];
        const fence=q3+3*(q3-q1);
        items=items.map(x=>({...x,out:isN(x._refY)&&x._refY>fence}));
        items.sort((a,b)=>sortDir==="desc"?(b._refY||0)-(a._refY||0):(a._refY||0)-(b._refY||0));
        items=items.slice(0,topN);
        const refVals=items.map(x=>x._refY).filter(isN);
        return{type:"numeric",mode:"ranking",data:items,activeYrs,refY,scale,stats:{n:en.filter(x=>isN(x[refY])).length,max:refVals.length?Math.max(...refVals):null,min:refVals.length?Math.min(...refVals):null,avg:pct(avg(refVals)),med:pct(med(refVals))}};
      }

      if(cmode==="group"){
        const data=grps.map(g=>{
          const pt={name:g,fill:pal[g]||"#999"};
          activeYrs.forEach(y=>{
            const vs=en.filter(x=>(groupBy==="income"?x.income:x.region)===g).map(x=>x[y]).filter(isN);
            pt[y]=vs.length?pct(avg(vs)):null;
          });
          pt._refY=pt[refY];
          pt._n=en.filter(x=>(groupBy==="income"?x.income:x.region)===g&&isN(x[refY])).length;
          return pt;
        }).filter(d=>d._n>0||activeYrs.some(y=>d[y]!=null))
          .sort((a,b)=>sortDir==="desc"?(b._refY||0)-(a._refY||0):(a._refY||0)-(b._refY||0));
        return{type:"numeric",mode:"group",data,activeYrs,refY,scale,stats:{n:en.filter(x=>isN(x[refY])).length}};
      }

      if(cmode==="trend"){
        // Y-axis = year, X-axis = value, grouped by group — horizontal
        const data=activeYrs.map(y=>{
          const pt={year:y};
          grps.forEach(g=>{const vs=en.filter(x=>(groupBy==="income"?x.income:x.region)===g).map(x=>x[y]).filter(isN);pt[g]=vs.length?pct(avg(vs)):null;});
          return pt;
        });
        return{type:"numeric",mode:"trend",data,keys:grps.map(g=>({key:g,color:pal[g]||"#999"})),activeYrs,scale};
      }
    }
    return{type:"empty",data:[]};
  },[rawData,selInd,cmode,selYears,groupBy,actReg,actInc,topN,sortDir]);

  /* DATA QUALITY */
  const dq=useMemo(()=>{
    if(!rawData||!selInd)return null;
    const e=rawData.get(selInd);if(!e)return null;
    let tot=0,has=0;
    e.jm.forEach(v=>YEARS.forEach(y=>{tot++;if(v[y]!=null)has++;}));
    return{pct:tot?Math.round(100*has/tot):0,countries:e.jm.size,type:e.type};
  },[rawData,selInd]);

  /* INSIGHT */
  const insight=useMemo(()=>{
    if(!CD||CD.type==="empty")return null;
    const{type,mode,data,stats,refY,activeYrs}=CD;
    const yrsLabel=activeYrs?.length>1?activeYrs.join(", "):refY||selYears[0]||"";
    if(type==="numeric"&&mode==="ranking"&&stats&&data.length)
      return`<strong>${stats.n}</strong> countries have data for <strong>${refY}</strong>. Highest: <strong>${data[0].full}</strong> (${fmt(data[0]._refY)}). Median: <strong>${fmt(stats.med)}</strong>, Mean: <strong>${fmt(stats.avg)}</strong>. Showing years: <strong>${yrsLabel}</strong>.`;
    if(type==="yesno"&&(mode==="group"||mode==="ranking")&&data.length)
      return`<strong>${refY}</strong>: <strong>${data[0].name}</strong> leads at <strong>${data[0]._refY}%</strong> adoption; <strong>${data[data.length-1].name}</strong> lowest at <strong>${data[data.length-1]._refY}%</strong>. Years shown: <strong>${yrsLabel}</strong>.`;
    return null;
  },[CD,selYears]);

  /* RENDER CHART — all horizontal bars, multi-year */
  const renderChart=()=>{
    if(!CD||!CD.data||!CD.data.length)
      return<div className="emp"><div className="eico">📊</div><div className="etxt">No data for this selection.<br/>Try different years, mode, or adjust filters.</div></div>;
    const{type,mode,data,keys,scale,activeYrs=[]}=CD;
    const sn=rawData?.get(selInd)?.scale==="Thousands"?" (thousands)":"";
    const isYN=type==="yesno";
    const nY=activeYrs.length||1;

    // ── RANKING / GROUP: horizontal grouped bars, one bar per selected year ──
    if(mode==="ranking"||mode==="group"){
      const rowH=Math.max(12,Math.min(22,420/(data.length*nY)));
      const chartH=Math.max(320,data.length*(nY*rowH+nY*2+10)+60);
      const yWidth=mode==="group"?160:138;
      return(
        <ResponsiveContainer width="100%" height={chartH}>
          <BarChart data={data} layout="vertical" margin={{left:6,right:64,top:4,bottom:4}} barGap={1} barCategoryGap="18%">
            <CartesianGrid horizontal={false} stroke="#EBF0F8" strokeDasharray="2 3"/>
            <XAxis type="number" tick={{fill:"#8896AD",fontSize:11,fontFamily:"Outfit"}} tickFormatter={isYN?v=>v+"%":fmt} axisLine={{stroke:"#DDE3ED"}} tickLine={false} domain={isYN?[0,100]:["auto","auto"]}/>
            <YAxis type="category" dataKey="name" width={yWidth} tick={{fill:"#3A4565",fontSize:11,fontFamily:"Outfit"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>} cursor={{fill:"#F0F5FF"}}/>
            {nY>1&&<Legend wrapperStyle={{fontSize:10.5,fontFamily:"Outfit",paddingTop:4}}/>}
            {activeYrs.map(y=>(
              <Bar key={y} dataKey={y} name={y} fill={YC[y]||"#999"} radius={[0,3,3,0]} barSize={rowH}>
                {showLbls&&<LabelList dataKey={y} position="right" formatter={isYN?v=>(v!=null?v+"%":""):fmt} style={{fontSize:9.5,fill:"#506080",fontFamily:"Outfit",fontWeight:600}}/>}
                {/* color by group/region only when single year */}
                {nY===1&&data.map((d,i)=><Cell key={i} fill={d.fill||YC[y]||"#999"}/>)}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // ── TREND: horizontal grouped bars — Y=year, X=value, bars=groups ──
    if(mode==="trend"){
      const rowH=Math.max(12,Math.min(22,400/((keys?.length||1)*data.length)));
      const chartH=Math.max(280,data.length*((keys?.length||1)*rowH+(keys?.length||1)*2+12)+60);
      return(
        <ResponsiveContainer width="100%" height={chartH}>
          <BarChart data={data} layout="vertical" margin={{left:6,right:64,top:4,bottom:4}} barGap={1} barCategoryGap="20%">
            <CartesianGrid horizontal={false} stroke="#EBF0F8" strokeDasharray="2 3"/>
            <XAxis type="number" tick={{fill:"#8896AD",fontSize:11,fontFamily:"Outfit"}} tickFormatter={isYN?v=>v+"%":fmt} axisLine={{stroke:"#DDE3ED"}} tickLine={false} domain={isYN?[0,100]:["auto","auto"]}/>
            <YAxis type="category" dataKey="year" width={52} tick={{fill:"#3A4565",fontSize:12,fontFamily:"Outfit",fontWeight:700}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>} cursor={{fill:"#F0F5FF"}}/>
            <Legend wrapperStyle={{fontSize:10.5,fontFamily:"Outfit",paddingTop:4}}/>
            {(keys||[]).map(({key,color})=>(
              <Bar key={key} dataKey={key} name={key} fill={color} radius={[0,3,3,0]} barSize={rowH}>
                {showLbls&&<LabelList dataKey={key} position="right" formatter={isYN?v=>(v!=null?v+"%":""):fmt} style={{fontSize:9.5,fill:"#506080",fontFamily:"Outfit",fontWeight:600}}/>}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  /* UPLOAD SCREEN */
  if(!rawData)return(
    <div className="app">
      <style>{CSS}</style>
      <div className="hdr"><div className="brand">ISORA <span>Analytics</span></div><div className="hdr-r"><span className="hdr-info">Revenue Administration Intelligence</span></div></div>
      <div className="upw">
        <div className={`upbox ${isDrag?"drag":""}`} onClick={()=>fref.current.click()} onDragOver={e=>{e.preventDefault();setIsDrag(true)}} onDragLeave={()=>setIsDrag(false)} onDrop={e=>{e.preventDefault();setIsDrag(false);handleFile(e.dataTransfer.files[0])}}>
          <div className="upico">📊</div>
          <div className="upt">Upload ISORA Dataset</div>
          <div className="ups">Drop your ISORA CSV here or click to browse.<br/>Handles large files (170MB+) efficiently via streaming.<br/>Required columns: <strong>JURISDICTION · INDICATOR · SCALE · 2018–2023</strong></div>
          <input ref={fref} type="file" accept=".csv" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
        </div>
        {loading&&<div className="pgw"><div className="pgt"><div className="pgf" style={{width:progress+"%"}}/></div><div className="pgtxt">{pMsg}</div></div>}
        {!loading&&<div className="uph">ADB · CIAT · IMF · IOTA · OECD — International Survey on Revenue Administration</div>}
      </div>
    </div>
  );

  /* DASHBOARD */
  const entry=rawData.get(selInd);
  const itype=entry?.type;
  const typeBadge=itype==="yesno"?<span className="tb tb-yn">Yes/No</span>:itype==="numeric"?<span className="tb tb-nu">Numeric</span>:itype==="categorical"?<span className="tb tb-ca">Categorical</span>:null;
  const dqCls=dq?(dq.pct>50?"dqg":dq.pct>25?"dqy":"dqr"):"";
  const scl=entry?.scale==="Thousands"?" · thousands":"";

  return(
    <div className="app" onClick={()=>dropOpen&&setDropOpen(false)}>
      <style>{CSS}</style>
      <div className="hdr">
        <div className="brand">ISORA <span>Analytics</span></div>
        <div className="hdr-r">
          <span className="hdr-info">{indicators.length} indicators · {rawData.size} series · 186 jurisdictions</span>
          <button className="hbtn" onClick={()=>{setRawData(null);setIndicators([]);}}>↺ New File</button>
        </div>
      </div>

      <div className="lay">
        {/* SIDEBAR */}
        <div className="sb">
          <div className="ssec">
            <div className="stitle">Theme</div>
            <select className="sel" value={selTheme} onChange={e=>{setSelTheme(e.target.value);setIndSearch("");}}>
              <option value="">— All Themes ({indicators.length}) —</option>
              {themeList.map(t=><option key={t} value={t}>{t} ({themes.get(t)?.length||0})</option>)}
            </select>
          </div>

          <div className="ssec">
            <div className="stitle">Indicator</div>
            {selInd&&!dropOpen&&<div className="ind-chip" onClick={()=>setDropOpen(true)}>{selInd}</div>}
            <div className="sw">
              {(!selInd||dropOpen)&&<><span className="sico">⌕</span><input className="si" placeholder="Search…" value={indSearch} onChange={e=>{setIndSearch(e.target.value);setDropOpen(true)}} onFocus={()=>setDropOpen(true)}/></>}
              {dropOpen&&<div className="drop">
                {filtInds.slice(0,100).map(ind=><div key={ind} className={`di ${ind===selInd?"a":""}`} onClick={()=>{setSelInd(ind);setDropOpen(false);setIndSearch("");setSelTheme(assignTheme(ind));}}>{ind}</div>)}
                {filtInds.length>100&&<div className="dgl">+ {filtInds.length-100} more — refine search</div>}
                {!filtInds.length&&<div style={{padding:"12px",color:"var(--mut)",fontSize:12}}>No matches</div>}
              </div>}
            </div>
          </div>

          <div className="div"/>

          <div className="ssec">
            <div className="stitle">Chart Mode</div>
            <div className="tr">
              {[["ranking","≡ By Country"],["group","▦ By Group"],["trend","↗ Trend"]].map(([id,l])=>(
                <button key={id} className={`tg ${cmode===id?"on":""}`} onClick={()=>setCmode(id)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="ssec">
            <div className="stitle">Years <span style={{color:"var(--pri)",fontWeight:700,fontSize:9}}>(select multiple)</span></div>
            <div className="yrow">
              {YEARS.map(y=>(
                <button key={y} className={`yp ${selYears.includes(y)?"on":""}`}
                  onClick={()=>{
                    setSelYears(p=>p.includes(y)?p.filter(x=>x!==y).length?p.filter(x=>x!==y):[y]:[...p,y]);
                    setSelYear(y); // track last clicked for filename
                  }}>{y}</button>
              ))}
            </div>
          </div>

          <div className="div"/>

          <div className="ssec">
            <div className="stitle">Group / Color By</div>
            <div className="tr">
              {[["region","Region"],["income","Income"]].map(([id,l])=>(
                <button key={id} className={`tg ${groupBy===id?"on":""}`} onClick={()=>setGroupBy(id)}>{l}</button>
              ))}
            </div>
          </div>

          {(cmode==="ranking"||cmode==="group")&&<div className="ssec">
            <div className="tr">
              <button className={`tg ${sortDir==="desc"?"on":""}`} onClick={()=>setSortDir("desc")}>↓ Highest</button>
              <button className={`tg ${sortDir==="asc"?"on":""}`} onClick={()=>setSortDir("asc")}>↑ Lowest</button>
            </div>
            {cmode==="ranking"&&<><div className="slr"><span style={{fontSize:11,color:"var(--mut)"}}>Show Top</span><span className="slv">{topN}</span></div><input type="range" min={5} max={50} step={5} value={topN} onChange={e=>setTopN(+e.target.value)}/></>}
          </div>}

          <div className="ssec">
            <button className={`tg ${showLbls?"on":""}`} style={{width:"100%"}} onClick={()=>setShowLbls(!showLbls)}>{showLbls?"✓ Labels On":"○ Labels Off"}</button>
          </div>

          <div className="div"/>

          <div className="ssec">
            <div className="stitle">Regions</div>
            <div className="chs">
              {Object.entries(RC).map(([r,c])=>(
                <button key={r} className={`ch ${actReg.has(r)?"on":""}`}
                  style={{background:c+"20",color:c,borderColor:actReg.has(r)?c+"90":"transparent"}}
                  onClick={()=>setActReg(p=>{const s=new Set(p);s.has(r)?s.delete(r):s.add(r);return s.size?s:p;})}>
                  {r.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="ssec">
            <div className="stitle">Income Group</div>
            <div className="chs">
              {Object.entries(IC).map(([g,c])=>(
                <button key={g} className={`ch ${actInc.has(g)?"on":""}`}
                  style={{background:c+"20",color:c,borderColor:actInc.has(g)?c+"90":"transparent"}}
                  onClick={()=>setActInc(p=>{const s=new Set(p);s.has(g)?s.delete(g):s.add(g);return s.size?s:p;})}>
                  {g==="High income"?"High":g==="Upper middle income"?"Upper Mid":g==="Lower middle income"?"Lower Mid":"Low"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          {CD?.stats&&Object.keys(CD.stats).length>0&&<div className="stats">
            {CD.stats.n!=null&&<div className="stat"><div className="sv">{CD.stats.n}</div><div className="sl">Countries w/ Data</div></div>}
            {CD.stats.max!=null&&<div className="stat" style={{borderLeftColor:"var(--grn)"}}><div className="sv" style={{color:"var(--grn)"}}>{fmt(CD.stats.max)}</div><div className="sl">Max{scl}</div></div>}
            {CD.stats.min!=null&&<div className="stat" style={{borderLeftColor:"var(--red)"}}><div className="sv" style={{color:"var(--red)"}}>{fmt(CD.stats.min)}</div><div className="sl">Min{scl}</div></div>}
            {CD.stats.med!=null&&<div className="stat" style={{borderLeftColor:"var(--ylw)"}}><div className="sv" style={{color:"var(--ylw)"}}>{fmt(CD.stats.med)}</div><div className="sl">Median{scl}</div></div>}
            {CD.stats.avg!=null&&<div className="stat" style={{borderLeftColor:"#999"}}><div className="sv" style={{color:"#666"}}>{fmt(CD.stats.avg)}</div><div className="sl">Mean{scl}</div></div>}
          </div>}

          {insight&&<div className="ins" dangerouslySetInnerHTML={{__html:insight}}/>}

          <div className="cc">
            <div className="cchdr">
              <div style={{flex:1,minWidth:0}}>
                <div className="cct">{selInd||"Select an indicator"}{typeBadge}</div>
                <div className="ccs">
                  {cmode==="ranking"&&`Country ranking · sorted ${sortDir}${scl}`}
                  {cmode==="group"&&`Group ${itype==="yesno"?"% adoption":"average"}${scl} · sorted ${sortDir}`}
                  {cmode==="trend"&&`Trend by year${scl}`}
                  {` · Years: ${selYears.join(", ")} · ${groupBy==="region"?"By Region":"By Income"}`}
                </div>
              </div>
              <div className="ccact">
                {dq&&<span className={`dqb ${dqCls}`}>Fill: {dq.pct}%</span>}
                <button className="dlbtn" onClick={dlPng}>↓ PNG</button>
              </div>
            </div>

            <div ref={cref}>{renderChart()}</div>

            {CD?.data?.length>0&&<div className="leg">
              {(cmode==="trend")?
                Object.entries(groupBy==="income"?IC:RC)
                  .filter(([k])=>(groupBy==="income"?actInc:actReg).has(k))
                  .map(([k,c])=><div key={k} className="li"><div className="ld" style={{background:c}}/>{k}</div>)
              : selYears.length>1 ?
                selYears.map(y=><div key={y} className="li"><div className="ld" style={{background:YC[y]||"#999"}}/>{y}</div>)
              :
                Object.entries(groupBy==="income"?IC:RC)
                  .filter(([k])=>(groupBy==="income"?actInc:actReg).has(k))
                  .map(([k,c])=><div key={k} className="li"><div className="ld" style={{background:c}}/>{k}</div>)
              }
            </div>}

            {cmode==="ranking"&&CD?.data?.length>0&&<>
              <button className="tbtn" onClick={()=>setShowTbl(!showTbl)}>{showTbl?"▲ Hide Table":"▼ Show Data Table"}</button>
              {showTbl&&<div className="tw"><table>
                <thead><tr>
                  <th>#</th><th>Country</th><th>Region</th><th>Income</th>
                  {(CD.activeYrs||selYears).map(y=><th key={y} style={{textAlign:"right"}}>{y}{scl}</th>)}
                </tr></thead>
                <tbody>{CD.data.map((r,i)=><tr key={i}>
                  <td style={{color:"var(--mut)",fontWeight:600}}>{i+1}</td>
                  <td style={{fontWeight:600}}>{r.full||r.name}</td>
                  <td><span style={{color:RC[r.region]||"#999",fontWeight:600,fontSize:10.5}}>{r.region}</span></td>
                  <td><span style={{color:IC[r.income]||"#999",fontWeight:600,fontSize:10.5}}>{r.income}</span></td>
                  {(CD.activeYrs||selYears).map(y=><td key={y} style={{textAlign:"right",fontFamily:"monospace",fontWeight:700}}>{typeof r[y]==="number"?r[y]?.toLocaleString():r[y]!=null?r[y]:"—"}</td>)}
                </tr>)}</tbody>
              </table></div>}
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}
