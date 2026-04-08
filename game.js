// ── AIRCRAFT & CITIES ────────────────────────────────────────────────────
var AC = {
  beech99:   {name:"Beechcraft 99",   seats:15, fee:100, type:"Commuter",  maxFreq:6, code:"B99"},
  metro:     {name:"Fairchild Metro", seats:19, fee:120, type:"Commuter",  maxFreq:6, code:"MTR"},
  shorts330: {name:"Shorts 330",      seats:30, fee:150, type:"Turboprop", maxFreq:5, code:"S33"},
  saab340:   {name:"SAAB 340",        seats:35, fee:175, type:"Turboprop", maxFreq:4, code:"340"},
  dc9:       {name:"Douglas DC-9",    seats:90, fee:350, type:"Jet",       maxFreq:3, code:"DC9"}
};
var AC_ORDER = ["beech99","metro","shorts330","saab340","dc9"];

var CITIES = [
  {id:"springfield", name:"Springfield, IL",  lf:0.76, minSat:0,  minAC:"beech99"},
  {id:"peoria",      name:"Peoria, IL",        lf:0.72, minSat:0,  minAC:"beech99"},
  {id:"decatur",     name:"Decatur, IL",       lf:0.67, minSat:0,  minAC:"beech99"},
  {id:"champaign",   name:"Champaign, IL",     lf:0.74, minSat:40, minAC:"beech99"},
  {id:"fort_wayne",  name:"Fort Wayne, IN",    lf:0.73, minSat:45, minAC:"beech99"},
  {id:"rockford",    name:"Rockford, IL",      lf:0.70, minSat:50, minAC:"beech99"},
  {id:"south_bend",  name:"South Bend, IN",    lf:0.72, minSat:50, minAC:"metro"},
  {id:"terre_haute", name:"Terre Haute, IN",   lf:0.68, minSat:45, minAC:"beech99"},
  {id:"evansville",  name:"Evansville, IN",    lf:0.75, minSat:55, minAC:"metro"},
  {id:"indianapolis",name:"Indianapolis, IN",  lf:0.82, minSat:65, minAC:"shorts330"},
  {id:"stlouis",     name:"St. Louis, MO",     lf:0.83, minSat:72, minAC:"saab340"},
  {id:"chicago",     name:"Chicago, IL",       lf:0.88, minSat:85, minAC:"dc9"}
];

var LOBBYISTS = [
  {tier:0, name:"None", cpd:0},
  {tier:1, name:"Local Political Consultant", upfront:6000,  cpd:150,  badge:"lb1", note:"Reduces noise fines 50%. Improves city council outcomes."},
  {tier:2, name:"Regional Gov. Affairs Firm", upfront:20000, cpd:400,  badge:"lb2", note:"All tier 1 benefits. FAA inspections always pass. State grant eligibility. Zoning assistance."},
  {tier:3, name:"Washington D.C. Lobbying Firm", upfront:50000, cpd:1000, badge:"lb3", note:"All tier 2 benefits. Federal grant eligibility. Full noise protection. Congressional earmark potential."}
];

// nego cooldowns (days per topic after resolution)
var NEGO_CD = {fee:45, addcity:30, freq:20, upg:25};

// ── NEGOTIATION DIALOGUES ────────────────────────────────────────────────
var NEGO_DLG = {
  fee: {
    hard: [
      {
        ha: function(ctx) {
          if (ctx.sat >= 65) return "<strong>Richard Holt</strong>, VP Regional Operations:<br><br>\"A forty-dollar increase per flight.\" He taps the proposal thoughtfully. \"That's ambitious — but you've built some goodwill here. Walk me through the justification.\"";
          return "<strong>Richard Holt</strong>, VP Regional Operations:<br><br>He sets the proposal aside without finishing it. \"Forty dollars per flight. At current service levels, that's a hard sell to my board. Give me something concrete.\"";
        },
        opts: [
          {id:"data", label:"Present Cost Analysis", text:"\"Our facility upgrades have cut your ground time and reduced turnaround costs. Security, gate capacity, ground handling — the numbers speak for themselves.\"", score:3},
          {id:"value", label:"Emphasize Partnership", text:"\"We've been growing together. Our passenger volumes and load factors show it. This rate reflects where we're headed, not where we started.\"", score:1},
          {id:"pressure", label:"Mention Competitor Interest", text:"\"We've had serious inquiries from other carriers about Millbrook slots. We'd prefer to keep this a Heartland hub, but the market is the market.\"", score:-1}
        ]
      },
      {
        ha: function(ctx) {
          if (ctx.prev === "data") return "Holt reviews the numbers carefully. \"These are solid figures. I can see the operational savings.\" He closes the folder. \"One more thing — what guarantees can you offer going forward?\"";
          if (ctx.prev === "value") return "\"Growth potential, sure. But my finance team needs specifics, not sentiment. What's concretely in the pipeline that justifies this kind of jump?\"";
          return "Holt's expression cools. \"Let's leave the posturing aside. I'm still at the table, which means I'm still interested. Give me a real business case.\"";
        },
        opts: [
          {id:"commit", label:"Commit to Improvements", text:"\"We're investing in terminal improvements this quarter. I'll put a performance review clause in writing — if our metrics slip, we revisit the rate.\"", score:2},
          {id:"phase", label:"Propose Phase-In", text:"\"How about this — we start at twenty, step up to forty in 60 days once you see the results. Shared risk.\"", score:1},
          {id:"firm", label:"Hold the Line", text:"\"The rate is fair. We both know the value is there. I'd rather not negotiate against myself.\"", score:-1}
        ]
      }
    ],
    mod: [
      {
        ha: function(ctx) {
          if (ctx.sat >= 55) return "<strong>Richard Holt</strong>, VP Regional Operations:<br><br>\"Twenty per flight. That's a measured ask.\" He nods slowly. \"We've seen improvements here. Tell me what's driving the request.\"";
          return "<strong>Richard Holt</strong>, VP Regional Operations:<br><br>\"Twenty dollars more per flight.\" He considers it. \"I can discuss it, but I need to understand what we're getting in return.\"";
        },
        opts: [
          {id:"metrics", label:"Show Performance Data", text:"\"Passenger satisfaction is up, delays are trending down. This modest increase lets us keep investing in what's working.\"", score:2},
          {id:"fair", label:"Appeal to Fairness", text:"\"It's a reasonable reflection of our improved facilities and service quality. We'd like to formalize the adjustment.\"", score:1},
          {id:"market", label:"Cite Market Rates", text:"\"Other regional airports have raised rates 30% this year. Twenty dollars is conservative by comparison.\"", score:-1}
        ]
      },
      {
        ha: function(ctx) {
          if (ctx.prev === "metrics" || ctx.prev === "fair") return "\"I appreciate the straightforward approach. This is within a range I'd consider. Just one question — how are you managing delays going forward?\"";
          return "\"Market comparisons aside, I care about Millbrook specifically. What can you tell me about your operations here?\"";
        },
        opts: [
          {id:"staffed", label:"Highlight Staffing", text:"\"We've added ground crew and upgraded equipment. Delays are under control and we're committed to keeping them there.\"", score:2},
          {id:"promise", label:"General Commitment", text:"\"We'll continue investing in operations. You'll see the results in our numbers.\"", score:1},
          {id:"blunt", label:"Push for Decision", text:"\"Our track record speaks for itself. Do we have a deal or not?\"", score:-1}
        ]
      }
    ],
    soft: [
      {
        ha: function(ctx) {
          return "<strong>Richard Holt</strong>, VP Regional Operations:<br><br>\"A ten-dollar adjustment.\" He makes a note. \"That's quite reasonable. Any particular reason for the timing?\"";
        },
        opts: [
          {id:"costs", label:"Cite Rising Costs", text:"\"Rising operational costs across the board. This small adjustment helps us maintain the service quality you expect.\"", score:2},
          {id:"inflation", label:"Keep It Simple", text:"\"Just keeping pace with inflation, honestly. Nothing dramatic.\"", score:1},
          {id:"hint", label:"Hint at More Later", text:"\"We're being conservative for now. Consider it a gesture of good faith.\"", score:0}
        ]
      },
      {
        ha: function(ctx) {
          return "Holt nods. \"I don't foresee pushback on this. Let me just confirm a couple of things before I sign off.\"";
        },
        opts: [
          {id:"cooperative", label:"Be Cooperative", text:"\"Of course. We value this relationship and want terms that work for both sides.\"", score:2},
          {id:"ready", label:"Stay Professional", text:"\"Sure, what do you need from us?\"", score:1},
          {id:"rush", label:"Push to Close", text:"\"It's a formality at this point. Let's get it signed.\"", score:0}
        ]
      }
    ]
  },
  addcity: [
    {
      ha: function(ctx) {
        if (ctx.sat >= ctx.minSat + 10) return "<strong>Sarah Chen</strong>, Network Planning:<br><br>\"" + ctx.cityName + " — we've had that on our expansion radar. The demographics look promising and our planning team likes the fit. What kind of support are you offering on the ground?\"";
        if (ctx.sat >= ctx.minSat) return "<strong>Sarah Chen</strong>, Network Planning:<br><br>\"" + ctx.cityName + " is an interesting possibility. Not a slam dunk, but the potential is there. Help me understand why Millbrook is the right base for this route.\"";
        return "<strong>Sarah Chen</strong>, Network Planning:<br><br>\"" + ctx.cityName + " from Millbrook.\" She pauses. \"I'll be honest — our network team has concerns about the viability. But I'm listening.\"";
      },
      opts: [
        {id:"support", label:"Offer Operational Support", text:"\"We'll dedicate gate priority for the new route and fund marketing support for the first 90 days. We're invested in making this work.\"", score:3},
        {id:"demand", label:"Cite Market Demand", text:"\"The demand is there. Your load factors on existing Millbrook routes prove our passengers travel. This market is ready.\"", score:1},
        {id:"need", label:"Appeal to Growth", text:"\"We need this route to grow Millbrook into a stronger hub. What will it take to make it happen?\"", score:-1}
      ]
    },
    {
      ha: function(ctx) {
        if (ctx.prev === "support") return "Chen looks impressed. \"Gate priority and marketing support — that's meaningful. Let me ask about ground handling. Are you staffed for additional turns?\"";
        if (ctx.prev === "demand") return "\"Load factors are encouraging, but a new market is always a risk for us. What's your skin in the game? What are you willing to invest?\"";
        return "\"Your growth goals are understandable, but I need to know this route covers costs from day one. Sell me on the economics.\"";
      },
      opts: [
        {id:"ready", label:"Demonstrate Readiness", text:"\"Fully staffed and equipped. We've been preparing for this expansion — ground crew, facilities, everything is ready.\"", score:2},
        {id:"commit", label:"Promise to Deliver", text:"\"We'll make sure everything is in place before the first flight. You have our commitment.\"", score:1},
        {id:"later", label:"Defer Details", text:"\"Those are operational details we can sort out after we agree. The strategic opportunity is what matters.\"", score:-1}
      ]
    }
  ],
  freq: [
    {
      ha: function(ctx) {
        if (ctx.sat >= 60) return "<strong>Richard Holt</strong>, VP Regional Operations:<br><br>\"Adding another daily flight on " + ctx.routeName + " — it's something we've discussed internally. What makes you think the market supports it?\"";
        return "<strong>Richard Holt</strong>, VP Regional Operations:<br><br>\"More flights mean more exposure and risk for us. With current operations at Millbrook, I have reservations. Walk me through it.\"";
      },
      opts: [
        {id:"capacity", label:"Show Capacity Data", text:"\"Gate utilization and staffing show we can handle the volume. More frequency means better connections and higher load factors for you.\"", score:2},
        {id:"booking", label:"Cite Booking Trends", text:"\"Passenger demand supports it. We've seen consistently full flights on this route.\"", score:1},
        {id:"compete", label:"Reference Competition", text:"\"Your competitors serve these cities with higher frequency. You're leaving revenue on the table.\"", score:-1}
      ]
    },
    {
      ha: function(ctx) {
        if (ctx.prev === "capacity") return "\"Good to hear about the infrastructure. One concern — what about your ground crew? Any risk of delays if we add this volume?\"";
        if (ctx.prev === "booking") return "\"Demand matters, but one more flight means more crew, more fuel, more complexity. What else can you bring to the table?\"";
        return "\"We know our competition. What I need from you is operational readiness, not market commentary. Can you handle the extra turn?\"";
      },
      opts: [
        {id:"staffed", label:"Confirm Staffing", text:"\"We've brought on additional ground staff specifically for this growth. Delays are under control and we have the capacity.\"", score:2},
        {id:"smooth", label:"General Assurance", text:"\"We'll ensure smooth operations. More flights benefit us both — it's in our interest to get this right.\"", score:1},
        {id:"just_do", label:"Push to Proceed", text:"\"We can handle it. Let's not overthink this — schedule the flight.\"", score:-1}
      ]
    }
  ],
  upg: [
    {
      ha: function(ctx) {
        if (ctx.sat >= 60) return "<strong>Sarah Chen</strong>, Network Planning:<br><br>\"Upgrading " + ctx.routeName + " to " + ctx.newAcName + " would be a significant step. The route might support the capacity. What's your infrastructure look like for the larger aircraft?\"";
        return "<strong>Sarah Chen</strong>, Network Planning:<br><br>\"A bigger plane means bigger commitments from both sides. Given current operations, I'm not sure Millbrook is ready for " + ctx.newAcName + " service yet. Change my mind.\"";
      },
      opts: [
        {id:"infra", label:"Highlight Infrastructure", text:"\"We've upgraded our gate area and ground facilities with larger aircraft in mind. Ramp space, equipment, crew training — we're ready.\"", score:3},
        {id:"economics", label:"Make the Business Case", text:"\"The market has grown enough to justify bigger aircraft. More seats, better unit economics for both of us.\"", score:1},
        {id:"undersized", label:"Criticize Current Setup", text:"\"The current aircraft is undersized for demand. You're turning away passengers and leaving revenue behind.\"", score:-1}
      ]
    },
    {
      ha: function(ctx) {
        if (ctx.prev === "infra") return "\"If the infrastructure is truly in place, that addresses my main concern. One last question — what about the transition logistics? Can you handle the changeover smoothly?\"";
        if (ctx.prev === "economics") return "\"The economics have to work. Our risk team will want specifics. What can you guarantee on the operations side?\"";
        return "\"That's one perspective. Let's focus on what matters — what operational improvements support running " + ctx.newAcName + " at Millbrook?\"";
      },
      opts: [
        {id:"plan", label:"Present Transition Plan", text:"\"We'll coordinate the changeover with your ops team. Phased rollout, crew briefings, minimal disruption. We've planned this out.\"", score:2},
        {id:"capable", label:"Express Confidence", text:"\"Our team is experienced and motivated. We'll make the transition seamless — you have our word.\"", score:1},
        {id:"just_switch", label:"Dismiss Concerns", text:"\"Just put the new plane on the route. We'll figure out the details as we go.\"", score:-1}
      ]
    }
  ]
};

// ── STATE ────────────────────────────────────────────────────────────────
var PREV = {cash:250000,pax:0,flights:5,delay:0,sat:60,credit:2};
var S = {
  cash:250000, day:1,
  parkCap:20, gateCap:1, staff:2, concSpend:0, parkPrice:4,
  sat:60, loan:0, loanRate:0.12, paused:true,
  pfcRate:0, haFeeAdj:0, hankNego:0,
  lobbyTier:0, lobbyistCpd:0,
  negoCDs:{fee:0, addcity:0, freq:0, upg:0},
  alertData:{},
  routes:[
    {id:"r1",airline:"Heartland Air",cityId:"springfield",freq:3,aircraft:"metro",   active:true},
    {id:"r2",airline:"Heartland Air",cityId:"peoria",     freq:2,aircraft:"beech99", active:true}
  ],
  dailyRev:0, dailyExp:0, gameOver:false,
  evDelayBonus:0, evDelayDays:0,
  surgeDays:0, surgeActive:false, strikeThreat:false,
  builds:[], alerts:[], alertCD:{}, buildAlerts:[],
  fac:{vending:false,snack:false,newsstand:false,coffee:false,giftshop:false,restaurant:false,
       security:false,bathrooms:false,newbaths:false,pa:false,baggage:false,valet:false,ticketing:false,
       transportCurbside:false,transportVans:false,transportLimo:false,transportRail:false},
  boardVisible:true,
  _faa:"", _ca:0, _sr:"", _noiseFine:0, _earmark:0
};
var MS = {type:"", alertId:"", negoStep:"", opt:"", co:"", nd:{}};
var MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── HELPERS ──────────────────────────────────────────────────────────────
function dateStr(){var d=S.day-1;return MONTHS[Math.floor(d/30)%12]+" "+((d%30)+1)+", "+(1982+Math.floor(d/360));}
function fmt(n){return "$"+Math.round(n).toLocaleString();}
function city(id){for(var i=0;i<CITIES.length;i++){if(CITIES[i].id===id)return CITIES[i];}return null;}
function acIdx(id){for(var i=0;i<AC_ORDER.length;i++){if(AC_ORDER[i]===id)return i;}return 0;}
function hasCityRoute(airline,cid){for(var i=0;i<S.routes.length;i++){if(S.routes[i].active&&S.routes[i].airline===airline&&S.routes[i].cityId===cid)return true;}return false;}
function haRoutes(){var o=[];for(var i=0;i<S.routes.length;i++){if(S.routes[i].active&&S.routes[i].airline==="Heartland Air")o.push(S.routes[i]);}return o;}
function meRoutes(){var o=[];for(var i=0;i<S.routes.length;i++){if(S.routes[i].active&&S.routes[i].airline==="Midwest Express")o.push(S.routes[i]);}return o;}
function totalFlights(){var t=0;for(var i=0;i<S.routes.length;i++){if(S.routes[i].active)t+=S.routes[i].freq;}return t;}
function newRid(){return "r"+(Date.now()%100000);}
function pad2(n){return n<10?"0"+n:String(n);}
function negoCdLeft(k){var last=S.negoCDs[k]||0;var left=NEGO_CD[k]-(S.day-last);return left>0?left:0;}

// ── METRICS ──────────────────────────────────────────────────────────────
function calcM(){
  var tf=0,rawPax=0,landRevHA=0,landRevME=0;
  for(var i=0;i<S.routes.length;i++){
    var r=S.routes[i]; if(!r.active) continue;
    var ac=AC[r.aircraft],ct=city(r.cityId),lf=ct?ct.lf:0.72;
    rawPax+=Math.round(r.freq*ac.seats*lf*(S.surgeActive?1.3:1));
    if(r.airline==="Heartland Air") landRevHA+=r.freq*(ac.fee+S.haFeeAdj);
    else landRevME+=r.freq*(r.meFee||ac.fee);
    tf+=r.freq;
  }
  var maxGate=tf*S.gateCap*60;
  var pax=Math.min(rawPax,maxGate,S.parkCap);
  var gu=rawPax/Math.max(1,maxGate),sr=S.staff/Math.max(1,tf);
  var parkRelief=1;
  if(S.fac.transportCurbside) parkRelief+=0.09;
  if(S.fac.transportVans) parkRelief+=0.13;
  if(S.fac.transportLimo) parkRelief+=0.05;
  if(S.fac.transportRail) parkRelief+=0.24;
  var effPark=Math.max(1,Math.round(S.parkCap*parkRelief));
  var pu=Math.min(rawPax/Math.max(1,effPark),1);
  var bd=Math.round((gu>0.85?(gu-0.85)*120:0)+(sr<0.5?(0.5-sr)*40:0)+S.evDelayBonus+(pu>0.9?5:0));
  var dr=0;
  if(S.fac.security) dr+=5; if(S.fac.baggage) dr+=3; if(S.fac.ticketing) dr+=4;
  if(S.fac.transportCurbside) dr+=1.2;
  if(S.fac.transportVans) dr+=1.8;
  if(S.fac.transportLimo) dr+=0.6;
  if(S.fac.transportRail) dr+=4;
  var delay=Math.min(Math.max(0,bd-dr),60);
  var staffExp=S.staff*80,opExp=200+tf*40,intExp=Math.round(S.loan*S.loanRate/365),lobbyExp=S.lobbyistCpd;
  var exp=staffExp+opExp+intExp+lobbyExp;
  var parkRev=Math.round(pax*0.55*S.parkPrice),concRev=Math.round(pax*S.concSpend);
  var valetRev=S.fac.valet?Math.round(pax*1.5):0,pfcRev=Math.round(pax*S.pfcRate);
  var transRate=(S.fac.transportCurbside?0.36:0)+(S.fac.transportVans?0.5:0)+(S.fac.transportLimo?0.32:0)+(S.fac.transportRail?0.78:0);
  var transportRev=Math.round(pax*transRate)+(S.fac.transportRail?4200:0);
  var rev=parkRev+concRev+valetRev+pfcRev+transportRev+landRevHA+landRevME;
  var satD=delay<10?0.3:delay<20?0:-(delay-15)*0.08;
  if(pu>0.95) satD-=0.2;
  if(S.fac.pa&&satD<0) satD*=0.65;
  var cr=S.loan===0?"A":(S.sat>70&&S.cash>100000)?"B":S.cash>50000?"C":"D";
  return{pax:pax,delay:delay,rev:rev,exp:exp,net:rev-exp,satD:satD,cr:cr,
    gu:Math.round(gu*100),pu:Math.round(pu*100),
    staffExp:staffExp,opExp:opExp,intExp:intExp,lobbyExp:lobbyExp,
    landRevHA:landRevHA,landRevME:landRevME,parkRev:parkRev,concRev:concRev,valetRev:valetRev,pfcRev:pfcRev,transportRev:transportRev,
    maxGate:maxGate,rawPax:rawPax,tf:tf};
}

// ── FEED (TICKER) ────────────────────────────────────────────────────────
var feedItems=[];
function addFeed(tag,cls,msg){
  feedItems.unshift({tag:tag,cls:cls,msg:msg});
  if(feedItems.length>40) feedItems.pop();
  var h="",f=feedItems.slice(0,12);
  for(var pass=0;pass<2;pass++){
    for(var i=0;i<f.length;i++){
      h+="<span class=\"ticker-item "+f[i].cls+"\"><span class=\"ticker-tag\">"+f[i].tag+"</span><span class=\"ticker-msg\">"+f[i].msg+"</span></span>";
      if(i<f.length-1) h+="<span class=\"ticker-sep\">|</span>";
    }
    if(pass===0) h+="<span class=\"ticker-sep\">|</span>";
  }
  document.getElementById("ticker-track").innerHTML=h;
}

// ── BUILDS ───────────────────────────────────────────────────────────────
function addBuild(name,days,cb,quality){S.builds.push({name:name,left:days,total:days,cb:cb,quality:quality||1,evtFired:{}});renderBuilds();}
function tickBuilds(){
  for(var i=S.builds.length-1;i>=0;i--){
    var b=S.builds[i];
    b.left--;
    if(b.left<=0){S.builds.splice(i,1);b.cb();addFeed("BUILD","tag-build","Complete: "+b.name);continue;}
    if(b.total>=20) maybeBuildEvent(b,i);
  }
  renderBuilds();
}
function maybeBuildEvent(b,idx){
  var pct=1-(b.left/b.total);
  if(b.evtActive) return;
  for(var i=0;i<BUILD_EVENTS.length;i++){
    var ev=BUILD_EVENTS[i];
    if(b.evtFired[ev.id]) continue;
    if(pct>=ev.minPct&&pct<=ev.maxPct&&Math.random()<0.12){
      b.evtFired[ev.id]=true;
      b.evtActive=true;
      var alertId="bld_"+idx+"_"+ev.id;
      S.buildAlerts=S.buildAlerts||[];
      S.buildAlerts.push({id:alertId,buildIdx:idx,evtId:ev.id,buildName:b.name});
      addAlert(alertId,ev.name,ev.desc(b),"orange");
      return;
    }
  }
}
function openBuildEvent(alertId){
  var ba=null;
  S.buildAlerts=S.buildAlerts||[];
  for(var i=0;i<S.buildAlerts.length;i++){if(S.buildAlerts[i].id===alertId){ba=S.buildAlerts[i];break;}}
  if(!ba) return;
  var ev=null;
  for(var i=0;i<BUILD_EVENTS.length;i++){if(BUILD_EVENTS[i].id===ba.evtId){ev=BUILD_EVENTS[i];break;}}
  if(!ev) return;
  var b=S.builds[ba.buildIdx];
  if(!b){dismissAlert(alertId);return;}

  MS.type="build_event"; MS.alertId=alertId; MS.opt=""; MS.nd={phase:0,ba:ba,ev:ev,buildIdx:ba.buildIdx};
  document.getElementById("modal-title").textContent=ev.name+": "+b.name;
  var body="<div class=\"ha-msg\" style=\"margin-bottom:12px\">"+ev.desc(b)+"</div>";
  body+="<div class=\"ctx-box\" style=\"margin-bottom:10px\"><div><span class=\"key\">Project: </span><span class=\"val\">"+b.name+"</span></div><div><span class=\"key\">Progress: </span><span class=\"val\">"+Math.round((1-b.left/b.total)*100)+"%</span></div><div><span class=\"key\">Days remaining: </span><span class=\"val\">"+b.left+"</span></div></div>";
  body+="<div style=\"color:var(--dim);font-size:9px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:600\">How do you respond?</div>";
  body+="<div class=\"ogrid\">";
  for(var i=0;i<ev.opts.length;i++){
    var o=ev.opts[i];
    var costTxt=o.costAdd>0?"+"+Math.round(o.costAdd*100)+"% cost":o.costAdd<0?Math.round(o.costAdd*100)+"% cost":"No extra cost";
    var timeTxt=o.daysAdd>0?"+"+Math.round(o.daysAdd*100)+"% time":"No delay";
    var qualTxt=o.qualMod>0?"<span style=\"color:var(--grn)\">+Quality</span>":o.qualMod<0?"<span style=\"color:var(--red)\">-Quality</span>":"";
    body+="<div class=\"ocard\" onclick=\"selOpt(this,'"+o.id+"')\"><div class=\"oname\">"+o.label+"</div><div class=\"odesc\">"+o.text+"</div><div style=\"font-size:9px;color:var(--dim);margin-top:4px\">"+costTxt+" · "+timeTxt+(qualTxt?" · "+qualTxt:"")+"</div></div>";
  }
  body+="</div>";
  document.getElementById("modal-body").innerHTML=body;
  document.getElementById("modal-confirm").textContent="Decide";
  document.getElementById("modal-confirm").style.display="inline-block";
  document.getElementById("modal").style.display="flex";
}
function resolveBuildEvent(){
  if(!MS.opt){alert("Select a response.");return;}
  var ba=MS.nd.ba, ev=MS.nd.ev, idx=MS.nd.buildIdx;
  var b=S.builds[idx];
  if(!b){closeModal();return;}
  var chosen=null;
  for(var i=0;i<ev.opts.length;i++){if(ev.opts[i].id===MS.opt){chosen=ev.opts[i];break;}}
  if(!chosen) return;

  var extraCost=Math.round(b.total * chosen.costAdd * 50);
  if(extraCost>0){
    if(S.cash<extraCost){addFeed("WARN","tag-warn","Not enough cash — forced to press on.");chosen={id:"forced",label:"Forced",costAdd:0,daysAdd:0.05,qualMod:-0.15}; extraCost=0;}
    else S.cash-=extraCost;
  } else if(extraCost<0){
    S.cash-=extraCost;
  }
  var extraDays=Math.round(b.total*chosen.daysAdd);
  b.left+=extraDays; b.total+=extraDays;
  b.quality=Math.max(0.3,Math.min(1.0,(b.quality||1)+chosen.qualMod));
  b.evtActive=false;

  var effParts=[];
  if(extraCost>0) effParts.push("Cost: +"+fmt(extraCost));
  if(extraCost<0) effParts.push("Saved: "+fmt(-extraCost));
  if(extraDays>0) effParts.push("Delay: +"+extraDays+"d");
  if(chosen.qualMod>0) effParts.push("Quality improved");
  if(chosen.qualMod<0) effParts.push("Quality reduced");

  document.getElementById("modal-body").innerHTML="<div class=\"nr "+(chosen.qualMod>=0?"ok":"no")+"\"><div class=\"nr-title\">"+chosen.label+"</div><div>Decision applied to "+b.name+".</div><div class=\"nr-eff\">"+(effParts.join(". ")||"No change.")+".</div></div>";
  document.getElementById("modal-confirm").textContent="Close";
  MS.nd.phase=1;
  dismissAlert(ba.id);
  S.buildAlerts=S.buildAlerts.filter(function(x){return x.id!==ba.id;});
  addFeed("BUILD","tag-build",ev.name+" on "+b.name+": "+chosen.label+".");
  updateUI(calcM());
  renderBuilds();
}
function renderBuilds(){
  var el=document.getElementById("build-list");
  var wrap=document.getElementById("hud-builds");
  var banner=document.getElementById("vp-construction");
  if(!el) return;
  if(!S.builds.length){
    el.innerHTML="";
    if(wrap) wrap.style.display="none";
    if(banner) banner.style.display="none";
    return;
  }
  if(wrap) wrap.style.display="block";
  if(banner) banner.style.display="flex";
  var h="";
  for(var i=0;i<S.builds.length;i++){
    var b=S.builds[i],pct=Math.round((1-b.left/b.total)*100);
    var qcol=b.quality>=0.9?"var(--grn)":b.quality>=0.75?"var(--yel)":"var(--red)";
    var qtxt=b.quality>=0.9?"Excellent":b.quality>=0.75?"Good":"Compromised";
    h+="<div class=\"bitem\"><div class=\"bname\">"+b.name+(b.evtActive?" <span style=\"color:var(--yel);font-size:9px\">⚠ ISSUE</span>":"")+"</div>";
    h+="<div style=\"color:#888;font-size:10px\">"+b.left+" day"+(b.left===1?"":"s")+" left · Day "+(b.total-b.left+1)+" of "+b.total;
    if(b.quality!=null&&b.quality!==1) h+=" · <span style=\"color:"+qcol+"\">Quality: "+qtxt+"</span>";
    h+="</div><div class=\"bprog\"><div class=\"bbar\" style=\"width:"+pct+"%;"+(b.evtActive?"background:var(--yel)":"")+"\"></div></div></div>";
  }
  el.innerHTML=h;
}

// ── ROUTES ───────────────────────────────────────────────────────────────
function renderRoutes(){
  var el=document.getElementById("routes-panel");
  var active=[];
  for(var i=0;i<S.routes.length;i++) if(S.routes[i].active) active.push(S.routes[i]);
  if(!active.length){el.innerHTML="<span style=\"color:#555;font-size:11px\">No active routes.</span>";return;}
  var groups={},order=[];
  for(var i=0;i<active.length;i++){
    var r=active[i];
    if(!groups[r.airline]){groups[r.airline]=[];order.push(r.airline);}
    groups[r.airline].push(r);
  }
  var h="";
  for(var ai=0;ai<order.length;ai++){
    var aname=order[ai],rs=groups[aname],rtf=0;
    for(var i=0;i<rs.length;i++) rtf+=rs[i].freq;
    h+="<div class=\"rg-al\">"+aname+" <span style=\"color:#888;font-weight:normal\">("+rtf+" flights/day)</span></div>";
    h+="<div class=\"rg-row rg-head\"><span>City</span><span>Freq</span><span>Aircraft</span><span style=\"text-align:right\">Pax/day</span></div>";
    for(var i=0;i<rs.length;i++){
      var r=rs[i],ct=city(r.cityId),ac=AC[r.aircraft];
      var ppax=Math.round(r.freq*ac.seats*(ct?ct.lf:0.72)*(S.surgeActive?1.3:1));
      h+="<div class=\"rg-row\"><span style=\"color:#ccc\">"+(ct?ct.name:r.cityId)+"</span><span style=\"text-align:center;color:#f39c12\">"+r.freq+"x</span><span style=\"color:#aaa\">"+ac.name+"</span><span style=\"text-align:right;color:#2ecc71\">~"+ppax+"</span></div>";
    }
  }
  el.innerHTML=h;
}

// ── FLIGHT BOARD ─────────────────────────────────────────────────────────
function toggleBoard(){S.boardVisible=!S.boardVisible;document.getElementById("flight-board-wrap").style.display=S.boardVisible?"block":"none";}
function renderFlightBoard(delay){
  if(!S.boardVisible) return;
  var el=document.getElementById("flight-board");
  var active=[];
  for(var i=0;i<S.routes.length;i++) if(S.routes[i].active) active.push(S.routes[i]);
  if(!active.length){el.innerHTML="<span style=\"color:#4a5a4a;font-size:10px\">No active flights.</span>";return;}
  var rows=[],pref={"Heartland Air":"HA","Midwest Express":"ME"},base={"Heartland Air":200,"Midwest Express":400};
  for(var ri=0;ri<active.length;ri++){
    var r=active[ri],ct=city(r.cityId),ac=AC[r.aircraft];
    var px=pref[r.airline]||"FX",bx=base[r.airline]||300,bh=6+(ri*2)%14;
    for(var fi=0;fi<r.freq;fi++){
      var hr=bh+fi*3; if(hr>22) hr-=16;
      var mn=((ri*17)+(fi*31))%60;
      var seed=(S.day*13+ri*29+fi*7)%100;
      var status,sclass;
      if(delay>=25){status="DELAYED +"+(Math.round(delay*0.8+seed*0.2))+"m";sclass="fb-late";}
      else if(delay>=10&&seed<40){status="DELAYED +"+(10+seed%15)+"m";sclass="fb-late";}
      else if(seed<8){status="BOARDING";sclass="fb-board";}
      else if(seed<20){status="DEPARTED";sclass="fb-dep";}
      else{status="ON TIME";sclass="fb-ok";}
      rows.push({flt:px+(bx+ri*10+fi+1),city:ct?ct.name.split(",")[0]:r.cityId,time:pad2(hr)+":"+pad2(mn),status:status,cls:sclass});
    }
  }
  rows.sort(function(a,b){return a.time>b.time?1:-1;});
  var h="<div class=\"fb-title\">Millbrook Regional -- Departures</div>";
  h+="<div class=\"fb-head\"><span>FLT</span><span>DESTINATION</span><span>SCHED</span><span>STATUS</span></div>";
  for(var i=0;i<rows.length;i++){
    var row=rows[i];
    h+="<div class=\"fb-row\"><span class=\"fb-flt\">"+row.flt+"</span><span>"+row.city+"</span><span>"+row.time+"</span><span class=\""+row.cls+"\">"+row.status+"</span></div>";
  }
  el.innerHTML=h;
}

// ── ALERTS ───────────────────────────────────────────────────────────────
function hasAlert(id){for(var i=0;i<S.alerts.length;i++){if(S.alerts[i].id===id)return true;}return false;}
function addAlert(id,title,msg,dot){if(hasAlert(id))return;S.alerts.push({id:id,title:title,msg:msg,dot:dot});renderAlerts();}
function dismissAlert(id){for(var i=0;i<S.alerts.length;i++){if(S.alerts[i].id===id){S.alerts.splice(i,1);break;}}S.alertCD[id]=S.day;renderAlerts();}
function renderAlerts(){
  var el=document.getElementById("alert-list"),floatEl=document.getElementById("alert-float");
  if(!S.alerts.length){floatEl.style.display="none";return;}
  floatEl.style.display="block";
  var h="";
  for(var i=0;i<S.alerts.length;i++){
    var a=S.alerts[i];
    h+="<div class=\"alert-item adot-"+a.dot+"\" onclick=\"openAlert('"+a.id+"')\"><div class=\"atitle\">"+a.title+"</div><div class=\"amsg\">"+a.msg+"</div></div>";
  }
  el.innerHTML=h;
}
function cdOk(id,days){return (S.day-(S.alertCD[id]||0))>days;}

function checkAlerts(m){
  if(S.day%7!==0) return;

  // ── HA-INITIATED: Contract Review ──
  if(!hasAlert("ha_fee")&&S.day>=30&&cdOk("ha_fee",90)){
    var hd={};
    if(m.delay>20||S.sat<45){
      // HA is threatening
      var har=haRoutes();
      var threatened=har.length?har[har.length-1]:null;
      var tct=threatened?city(threatened.cityId):null;
      hd={scenario:"threat",routeId:threatened?threatened.id:"",cityName:tct?tct.name:"your busiest route",curFreq:threatened?threatened.freq:0};
      S.alertData["ha_fee"]=hd;
      addAlert("ha_fee","Heartland Air: Performance Warning","Declining performance is putting service levels at risk.","red");
    } else if(S.sat>=70&&cdOk("ha_fee",120)){
      // HA wants to propose something in exchange for a fee concession
      var avail=[];
      for(var i=0;i<CITIES.length;i++){var ct=CITIES[i];if(!hasCityRoute("Heartland Air",ct.id)&&S.sat>=ct.minSat) avail.push(ct);}
      if(avail.length&&Math.random()<0.5){
        var pick=avail[Math.floor(Math.random()*Math.min(avail.length,3))];
        hd={scenario:"offer",cityId:pick.id,cityName:pick.name,aircraft:pick.minAC,acName:AC[pick.minAC].name,freq:2};
        S.alertData["ha_fee"]=hd;
        addAlert("ha_fee","Heartland Air: Expansion Offer","HA wants to discuss adding a new route in exchange for favorable fee terms.","yellow");
      }
    }
  }

  // ── HA-INITIATED: Route Proposal ──
  if(!hasAlert("ha_routes")&&S.sat>=70&&S.day>=60&&cdOk("ha_routes",90)&&Math.random()<0.15){
    var candidates=[];
    for(var i=0;i<CITIES.length;i++){var ct=CITIES[i];if(!hasCityRoute("Heartland Air",ct.id)&&S.sat>=ct.minSat) candidates.push(ct);}
    if(candidates.length){
      var pick=candidates[Math.floor(Math.random()*Math.min(candidates.length,3))];
      var pac=AC[pick.minAC];
      // HA proposes on their own terms -- slightly below what player could negotiate
      var propFee=Math.max(60,pac.fee-10);
      S.alertData["ha_routes"]={cityId:pick.id,cityName:pick.name,aircraft:pick.minAC,acName:pac.name,freq:2,proposedFee:propFee};
      addAlert("ha_routes","Heartland Air: Route Proposal","HA wants to add "+pick.name+" service on their terms. Review and respond.","yellow");
    }
  }

  if(!hasAlert("pfc")&&S.pfcRate===0&&m.tf>=6&&S.day>=45&&cdOk("pfc",999)) addAlert("pfc","Introduce Passenger Facility Charge","Your CFO recommends establishing a per-passenger facility fee.","yellow");
  if(!hasAlert("paper")&&S.day>=20&&cdOk("paper",70)&&Math.random()<0.10) addAlert("paper","Interview: Millbrook Gazette","A reporter wants to profile the airport for the Sunday edition.","blue");
  if(!hasAlert("bank")&&S.loan>0&&(m.cr==="A"||m.cr==="B")&&S.loanRate>0.09&&S.day>=60&&cdOk("bank",120)) addAlert("bank","Bank: Loan Rate Review","First National Bank will discuss better terms given your credit.","yellow");
  if(!hasAlert("hank")&&S.fac.snack&&S.hankNego<2&&S.day>=50&&cdOk("hank",90)) addAlert("hank","Renegotiate: Hot Dog Hanks","Hanks revenue share contract is up for review.","yellow");
  if(!hasAlert("me")&&!meRoutes().length&&m.pax>=150&&m.tf>=8&&S.day>=90&&cdOk("me",999)) addAlert("me","New Airline Interest!","Midwest Express is interested in adding service to Millbrook.","red");
  if(!hasAlert("council")&&S.day>=60&&cdOk("council",90)&&Math.random()<0.08) addAlert("council","City Council Meeting","The council wants to discuss airport expansion and noise concerns.","blue");
  if(!hasAlert("chamber")&&S.day>=45&&cdOk("chamber",100)&&Math.random()<0.07) addAlert("chamber","Chamber of Commerce Invite","The local chamber wants you to speak at their monthly luncheon.","blue");
  if(S.lobbyTier>=2&&!hasAlert("state_grant")&&cdOk("state_grant",120)&&S.day>=60&&Math.random()<0.10) addAlert("state_grant","State Infrastructure Grant","IDOT has identified Millbrook Regional for a potential state aviation grant.","blue");
  if(S.lobbyTier>=3&&!hasAlert("fed_grant")&&cdOk("fed_grant",180)&&S.day>=90&&Math.random()<0.08) addAlert("fed_grant","Federal Aviation Grant","Your lobbying firm has secured a hearing with the FAA for federal airport development funds.","red");
  if(S.lobbyTier>=2&&!hasAlert("zoning")&&cdOk("zoning",120)&&S.day>=45&&Math.random()<0.12) addAlert("zoning","Zoning Approval Fast-Track","Your regional firm can fast-track zoning approval for a major construction project.","yellow");
}

// ── UI TOGGLES ────────────────────────────────────────────────────────────
function togglePause(){
  S.paused=!S.paused;
  var el=document.getElementById("play-icon");
  if(S.paused){el.textContent="⏸ PAUSED";el.style.color="";}
  else{el.textContent="▶ 1x";el.style.color="";}
}
function toggleRev(){var el=document.getElementById("rev-box"),tog=document.getElementById("rev-tog");var open=el.style.display==="none";el.style.display=open?"block":"none";tog.textContent=open?"hide breakdown":"show breakdown";}
function toggleExp(){var el=document.getElementById("exp-box"),tog=document.getElementById("exp-tog");var open=el.style.display==="none";el.style.display=open?"block":"none";tog.textContent=open?"hide breakdown":"show breakdown";}
function selOpt(el,key){var cards=el.closest(".ogrid").querySelectorAll(".ocard");for(var i=0;i<cards.length;i++) cards[i].classList.remove("sel");el.classList.add("sel");MS.opt=key;}
function selCo(el,key){var cards=document.querySelectorAll(".cocard");for(var i=0;i<cards.length;i++) cards[i].classList.remove("sel");el.classList.add("sel");MS.co=key;}
function coHtml(){return "<div class=\"sec\" style=\"margin-top:12px\">Select Contractor</div><div class=\"corow\"><div class=\"cocard\" onclick=\"selCo(this,'local')\"><div class=\"coname\">Local Contractor</div><div class=\"codet\">Cheapest. 20% chance of delay extension.</div></div><div class=\"cocard\" onclick=\"selCo(this,'regional')\"><div class=\"coname\">Regional Builder</div><div class=\"codet\">+15% cost. Reliable timeline.</div></div><div class=\"cocard\" onclick=\"selCo(this,'fasttrack')\"><div class=\"coname\">Fast-Track Corp</div><div class=\"codet\">+35% cost. Cuts build time 40%.</div></div></div>";}
function resultHtml(ok,txt,eff){return "<div class=\"nr "+(ok?"ok":"no")+"\"><div class=\"nr-title\">"+(ok?"ACCEPTED":"DECLINED")+"</div><div>"+txt+"</div><div class=\"nr-eff\">"+eff+"</div></div>";}

// ── CONTRACTOR SYSTEM ────────────────────────────────────────────────────
var CONTRACTOR_POOL = [
  "Mulligan & Sons","Hartfield Construction","Apex Builders","Pine Ridge Development",
  "Davis Bros. Contracting","Summit Construction Co.","Valley Build Group","Cornerstone Contractors",
  "Redbrick Building Co.","Horizon Construction","Ironside Contractors","Mitchell & Associates",
  "Greenfield Construction","Blake Building Corp.","Crestview Contractors","Atlas Construction",
  "Sterling Build Group","Oakmont Contractors","Foxworth Construction","Cambridge Build Co."
];
function genContractors(baseCost,baseDays){
  var pool=CONTRACTOR_POOL.slice(); var names=[];
  for(var i=0;i<3;i++){var idx=Math.floor(Math.random()*pool.length);names.push(pool.splice(idx,1)[0]);}
  return [
    {id:"budget",name:names[0],
     cost:Math.round(baseCost*(0.78+Math.random()*0.07)),
     days:Math.round(baseDays*(1.20+Math.random()*0.20)),
     quality:0.70+Math.random()*0.15, reliable:0.65,
     tagline:"Low overhead, lean crew. We get it done for less.",
     risk:"Higher chance of delays and construction issues"},
    {id:"standard",name:names[1],
     cost:baseCost,
     days:baseDays,
     quality:0.85+Math.random()*0.10, reliable:0.85,
     tagline:"Solid work, fair price. No surprises.",
     risk:"Occasional minor issues"},
    {id:"premium",name:names[2],
     cost:Math.round(baseCost*(1.22+Math.random()*0.13)),
     days:Math.round(baseDays*(0.75+Math.random()*0.10)),
     quality:0.92+Math.random()*0.08, reliable:0.95,
     tagline:"Best materials, top crew. You see the difference.",
     risk:"Premium pricing"}
  ];
}

// ── PROJECT TIER & LEVER NEGOTIATION SYSTEM ──────────────────────────────
function getProjectTier(btype,bopt){
  if(btype==="concessions"&&(bopt==="vending"||bopt==="snack")) return 1;
  if(btype==="facilities"&&bopt==="pa") return 1;
  if(btype==="parking"&&(bopt==="premium"||bopt==="structure")) return 3;
  if(btype==="gate"&&(bopt==="full"||bopt==="terminal")) return 3;
  if(btype==="facilities"&&(bopt==="baggage"||bopt==="newbaths")) return 3;
  if(btype==="concessions"&&(bopt==="restaurant"||bopt==="giftshop")) return 3;
  if(btype==="transport"&&bopt==="rail") return 3;
  if(btype==="transport") return 2;
  return 2;
}

var CONTRACTOR_GREETINGS={
  budget:[
    "\"We're the most competitive bid you'll see. We keep things lean — no wasted overhead. What kind of terms are you thinking?\"",
    "\"We can bring this in under budget, guaranteed. Tell me what matters most to you and I'll make it work.\"",
    "\"Straight talk — we're hungry for the work and we'll give you a fair deal. What are you looking for?\""
  ],
  standard:[
    "\"Here's our proposal — everything's itemized and transparent. We've done jobs like this across the region. What terms work for you?\"",
    "\"Solid work, fair price, no surprises. That's our pitch. What are your priorities on this one?\"",
    "\"We've got a good track record on projects this size. Let's find terms that make sense for both of us.\""
  ],
  premium:[
    "\"We deliver the best results in the business — top materials, top crew. What are your priorities for this project?\"",
    "\"Quality is our reputation. We don't cut corners and we don't miss deadlines. What terms do you have in mind?\"",
    "\"You get what you pay for in this industry. We're the best, and the results prove it. What are you looking for?\""
  ]
};

function startBuild(btype,bopt,projName,days,cost,quality,contractorName){
  var zoningBonus=(S.alertCD["zoning_active"]&&S.alertCD["zoning_active"]===S.day)?12:0;
  days=Math.max(1,days-zoningBonus);
  var zTxt=zoningBonus?" (Zoning fast-track)":"";
  var cTxt=contractorName?" Contractor: "+contractorName+".":"";

  if(btype==="parking"){
    var pm={dirt:{cap:40,sat:0},paved:{cap:90,sat:2},premium:{cap:150,sat:5},structure:{cap:400,sat:8},valet:{cap:0,sat:6}};
    var pn={dirt:"Gravel Lot",paved:"Paved Lot",premium:"Premium Lot",structure:"Parking Structure",valet:"Valet Service"};
    var po=pm[bopt];
    (function(cap,sat,nm,isV,q){addBuild(nm,days,function(){S.parkCap+=cap;var qs=Math.round(sat*Math.max(0.5,q));S.sat=Math.min(100,S.sat+qs);if(isV)S.fac.valet=true;},q);})(po.cap,po.sat,pn[bopt],bopt==="valet",quality);
    addFeed("BUILD","tag-build",pn[bopt]+" started. "+fmt(cost)+", "+days+"d."+cTxt+zTxt);
  } else if(btype==="gate"){
    var gm={basic:{gates:1,sat:3},full:{gates:1,sat:6},terminal:{gates:2,sat:8}};
    var gn={basic:"Gate Renovation",full:"Gate Addition",terminal:"Terminal Wing"};
    var go=gm[bopt];
    (function(gates,sat,nm,q){addBuild(nm,days,function(){S.gateCap+=gates;var qs=Math.round(sat*Math.max(0.5,q));S.sat=Math.min(100,S.sat+qs);},q);})(go.gates,go.sat,gn[bopt],quality);
    addFeed("BUILD","tag-build",gn[bopt]+" started. "+fmt(cost)+", "+days+"d."+cTxt+zTxt);
  } else if(btype==="concessions"){
    var opts=getConcOpts(),ch=null;
    for(var i=0;i<opts.length;i++){if(opts[i].id===bopt){ch=opts[i];break;}}
    if(!ch) return;
    (function(sp,sat,fk,nm,q){addBuild(nm,days,function(){S.concSpend+=sp;var qs=Math.round(sat*Math.max(0.5,q));S.sat=Math.min(100,S.sat+qs);S.fac[fk]=true;},q);})(ch.spend,ch.sat,ch.fkey,ch.nm,quality);
    addFeed("BUILD","tag-build",ch.nm+" started."+(ch.free?" (rev share)":" "+fmt(cost))+", "+days+"d."+cTxt+zTxt);
  } else if(btype==="facilities"){
    var facCb={security:function(){S.fac.security=true;},bathrooms:function(q){S.fac.bathrooms=true;S.sat=Math.min(100,S.sat+Math.round(4*Math.max(0.5,q)));},newbaths:function(q){S.fac.newbaths=true;S.sat=Math.min(100,S.sat+Math.round(6*Math.max(0.5,q)));},pa:function(){S.fac.pa=true;},baggage:function(){S.fac.baggage=true;},ticketing:function(q){S.fac.ticketing=true;S.sat=Math.min(100,S.sat+Math.round(2*Math.max(0.5,q)));}};
    var facNm={security:"Security Upgrade",bathrooms:"Bathroom Renovation",newbaths:"New Bathroom Wing",pa:"PA System",baggage:"Baggage Carousel",ticketing:"Self-Check Kiosks"};
    (function(cb,nm,q){addBuild(nm,days,function(){cb(q);},q);})(facCb[bopt],facNm[bopt],quality);
    addFeed("BUILD","tag-build",facNm[bopt]+" started. "+fmt(cost)+", "+days+"d."+cTxt+zTxt);
  } else if(btype==="transport"){
    var tKey={curbside:"transportCurbside",vans:"transportVans",limo:"transportLimo",rail:"transportRail"};
    var tSat={curbside:2,vans:5,limo:3,rail:10};
    var fk=tKey[bopt]; if(!fk) return;
    (function(key,sat,q){addBuild(projName,days,function(){S.fac[key]=true;var qs=Math.round(sat*Math.max(0.5,q));S.sat=Math.min(100,S.sat+qs);},q);})(fk,tSat[bopt],quality);
    addFeed("BUILD","tag-build",projName+" started. "+fmt(cost)+", "+days+"d."+cTxt+zTxt);
  }
  if(zoningBonus) S.alertCD["zoning_active"]=0;
}

function pickRandom(arr){return arr[Math.floor(Math.random()*arr.length)];}

function evaluateProposal(levers,contractor,round){
  var spec=levers.spec!=null?levers.spec:1.0;
  var pricePain=levers.price<1.0?(1.0-levers.price)*12:-(levers.price-1.0)*6;
  var timePain=levers.timeline<1.0?(1.0-levers.timeline)*10:-(levers.timeline-1.0)*4;
  var specPain=(spec-1.0)*11;
  var qualPain=levers.qualityGuarantee?1.5:0;
  var penaltyPain=levers.delayPenalty?2.5:0;
  var milestoneBenefit=levers.milestonePayment?-1.0:0;
  var totalPain=pricePain+timePain+specPain+qualPain+penaltyPain+milestoneBenefit;
  var tolerance=contractor.id==="budget"?3.8:contractor.id==="standard"?2.7:1.65;
  tolerance-=Math.max(0,round-1)*0.28;
  var ev;
  if(totalPain<=-2.6) ev={result:"accept",pain:totalPain};
  else if(totalPain<=-1.2) ev={result:"accept_reluctant",pain:totalPain};
  else if(totalPain<=tolerance*0.42) ev={result:"accept_reluctant",pain:totalPain};
  else if(totalPain<=tolerance) ev={result:"counter",pain:totalPain,pricePain:pricePain,timePain:timePain,specPain:specPain,penaltyPain:penaltyPain};
  else if(totalPain<=tolerance*2.0) ev={result:"counter",pain:totalPain,pricePain:pricePain,timePain:timePain,specPain:specPain,penaltyPain:penaltyPain};
  else ev={result:"reject",pain:totalPain};
  if(round<=1&&totalPain>-1.25&&(ev.result==="accept"||ev.result==="accept_reluctant")){
    ev={result:"counter",pain:totalPain,pricePain:pricePain,timePain:timePain,specPain:specPain,penaltyPain:penaltyPain};
  }
  return ev;
}

function contractorCounter(levers,contractor){
  var c={price:levers.price,timeline:levers.timeline,spec:levers.spec!=null?levers.spec:1,qualityGuarantee:levers.qualityGuarantee,delayPenalty:levers.delayPenalty,milestonePayment:levers.milestonePayment};
  if(c.price<1.0) c.price=Math.min(1.05,c.price+(1.0-c.price)*0.45);
  if(c.timeline<1.0) c.timeline=Math.min(1.0,c.timeline+(1.0-c.timeline)*0.40);
  if(c.spec>1.0) c.spec=Math.max(1.0,c.spec-(c.spec-1.0)*0.42);
  if(c.spec<1.0) c.spec=Math.min(1.0,c.spec+(1.0-c.spec)*0.38);
  if(c.delayPenalty&&Math.random()<0.6) c.delayPenalty=false;
  return c;
}

function genContractorResponse(ev,levers,counter,contractor){
  if(ev.result==="accept") return pickRandom(["\"That works for us. Let's get this moving.\"","\"Deal. We can start right away.\"","\"Those terms are fair. I'll have the contract ready tomorrow.\""]);
  if(ev.result==="accept_reluctant") return pickRandom(["\"It's tight, but we'll make it work. We're committed.\"","\"Not a lot of margin there, but we can do it. You've got a deal.\"","\"We'll need to run a lean operation, but it's doable.\""]);
  if(ev.result==="reject") return pickRandom(["\"I appreciate the offer, but we can't make those numbers work. We'd be losing money.\"","\"With respect, that's below our cost. We'd have to pass.\"","\"The math doesn't work for us at those terms. You'll need to come up significantly.\""]);
  var parts=[];
  var sp=counter.spec!=null?counter.spec:1.0;
  if(levers.price<0.88&&levers.timeline<0.85) parts.push("\"Both the budget and timeline are aggressive.");
  else if(levers.price<0.90) parts.push("\"The timeline works, but "+fmt(Math.round(levers.price*contractor.cost))+" doesn't cover our costs.");
  else if(levers.timeline<0.85) parts.push("\"The money's fine, but "+Math.round(levers.timeline*contractor.days)+" days is too fast for this scope.");
  else if((levers.spec!=null?levers.spec:1)>1.06) parts.push("\"The material spec you're asking for outruns this price point.");
  else if((levers.spec!=null?levers.spec:1)<0.94) parts.push("\"Value-engineering that far changes how we sequence the job.");
  else parts.push("\"We're close, but need a small adjustment.");
  var tail=" How about "+fmt(Math.round(counter.price*contractor.cost))+" and "+Math.round(counter.timeline*contractor.days)+" days";
  if(Math.abs(sp-1)>=0.02) tail+=", <strong>"+Math.round(sp*100)+"%</strong> material spec";
  tail+="?\"";
  parts.push(tail);
  if(levers.delayPenalty&&!counter.delayPenalty) parts.push(" <br><br>\"And we'd need to drop the delay penalty clause — that adds too much risk on our end.\"");
  if(levers.qualityGuarantee) parts.push(" <br><br>\"The quality guarantee is doable, but it's factored into the price.\"");
  return parts.join("");
}

function leverSpecSummary(sp){
  sp=sp!=null?sp:1;
  var lab=sp<=0.92?"Value":sp>=1.08?"Premium":"Match bid";
  return lab+" build ("+Math.round(sp*100)+"%)";
}

function updateLever(key,val){
  var c=MS.nd.selectedContractor;
  if(key==="price"){MS.nd.levers.price=parseInt(val)/100;var v=Math.round(c.cost*MS.nd.levers.price);var el=document.getElementById("lever-price-val");if(el)el.textContent=fmt(v);}
  else if(key==="timeline"){MS.nd.levers.timeline=parseInt(val)/100;var v=Math.max(3,Math.round(c.days*MS.nd.levers.timeline));var el=document.getElementById("lever-timeline-val");if(el)el.textContent=v+"d";}
  else if(key==="spec"){MS.nd.levers.spec=parseInt(val)/100;var el=document.getElementById("lever-spec-val");if(el)el.textContent=leverSpecSummary(MS.nd.levers.spec);}
  else if(key==="qualityGuarantee"){MS.nd.levers.qualityGuarantee=val;}
  else if(key==="delayPenalty"){MS.nd.levers.delayPenalty=val;}
  else if(key==="milestonePayment"){MS.nd.levers.milestonePayment=val;}
  var se=document.getElementById("proposal-summary");
  if(se){
    var pv=Math.round(c.cost*MS.nd.levers.price),tv=Math.max(3,Math.round(c.days*MS.nd.levers.timeline)),sp=MS.nd.levers.spec!=null?MS.nd.levers.spec:1;
    se.innerHTML="Your offer: <strong>"+fmt(pv)+"</strong> / <strong>"+tv+" days</strong> / <strong>"+leverSpecSummary(sp)+"</strong>";
  }
}

function proposeTerms(){
  var c=MS.nd.selectedContractor;
  var levers=MS.nd.levers;
  var sp=levers.spec!=null?levers.spec:1;
  MS.nd.negoRound=(MS.nd.negoRound||0)+1;
  var priceVal=Math.round(c.cost*levers.price);
  var timeVal=Math.max(3,Math.round(c.days*levers.timeline));
  var extras=[];
  if(levers.qualityGuarantee) extras.push("quality guarantee");
  if(levers.delayPenalty) extras.push("delay penalties");
  if(levers.milestonePayment) extras.push("milestone payments");
  MS.nd.negoHistory.push({speaker:"you",text:"Proposed "+fmt(priceVal)+" / "+timeVal+" days / "+leverSpecSummary(sp)+(extras.length?" with "+extras.join(", "):"")+". "});

  var ev=evaluateProposal(levers,c,MS.nd.negoRound);

  if(ev.result==="accept"||ev.result==="accept_reluctant"){
    MS.nd.negoHistory.push({speaker:"ha",text:genContractorResponse(ev,levers,null,c)});
    MS.nd.accepted=true;
    MS.nd.finalCost=Math.round(priceVal*(1+(sp-1)*0.22));
    MS.nd.finalDays=timeVal;
    MS.nd.finalQuality=c.quality+(levers.qualityGuarantee?0.10:0)+(sp-1)*0.34-(levers.timeline<0.75?0.10:levers.timeline<0.85?0.05:0);
    MS.nd.finalQuality=Math.max(0.3,Math.min(1.0,MS.nd.finalQuality));
    renderBuildPhase();
  } else if(ev.result==="counter"){
    var counter=contractorCounter(levers,c);
    MS.nd.negoHistory.push({speaker:"ha",text:genContractorResponse(ev,levers,counter,c)});
    MS.nd.levers=counter;
    renderBuildPhase();
  } else {
    var maxRounds=MS.nd.tier>=3?5:3;
    if(MS.nd.negoRound>=maxRounds){
      MS.nd.negoHistory.push({speaker:"ha",text:pickRandom(["\"We've been going back and forth too long. I don't think we're going to find common ground. Best of luck.\"","\"I appreciate your time, but we need to move on. This project isn't going to work for us at those terms.\""])});
      MS.nd.walkedContractor=c;
      var idx=MS.nd.contractors.indexOf(c);if(idx>=0)MS.nd.contractors.splice(idx,1);
      MS.nd.bldPhase="walked";
    } else {
      MS.nd.negoHistory.push({speaker:"ha",text:genContractorResponse(ev,levers,null,c)});
    }
    renderBuildPhase();
  }
}

function walkAway(){
  var c=MS.nd.selectedContractor;
  MS.nd.negoHistory.push({speaker:"you",text:"\"We're going to pass on this. Thank you for your time.\""});
  MS.nd.negoHistory.push({speaker:"ha",text:pickRandom(["\"Understood. Give us a call if you change your mind.\"","\"No hard feelings. Good luck with the project.\"","\"Fair enough. We'll be here if you reconsider.\""])});
  MS.nd.walkedContractor=c;
  var idx=MS.nd.contractors.indexOf(c);if(idx>=0)MS.nd.contractors.splice(idx,1);
  MS.nd.bldPhase="walked";
  renderBuildPhase();
}

var BUILD_EVENTS = [
  {id:"soil",  name:"Foundation Issue", minPct:0.10, maxPct:0.30,
   desc:function(b){return "Workers on <strong>"+b.name+"</strong> discovered unstable soil conditions during excavation. The foreman needs direction.";},
   opts:[
     {id:"reinforce",label:"Reinforce Properly",text:"Full geotechnical fix. Adds cost and time but guarantees a solid foundation.",costAdd:0.12,daysAdd:0.08,qualMod:0.05},
     {id:"patch",label:"Quick Stabilization",text:"Temporary shoring. Saves time but may cause settling issues later.",costAdd:0.04,daysAdd:0,qualMod:-0.10},
     {id:"ignore",label:"Press On Regardless",text:"The contractor says it'll probably be fine. Probably.",costAdd:0,daysAdd:0,qualMod:-0.20}
   ]},
  {id:"supply",name:"Supply Chain Delay", minPct:0.20, maxPct:0.50,
   desc:function(b){return "Key materials for <strong>"+b.name+"</strong> are backordered. The supplier says 2-3 weeks, but your contractor has options.";},
   opts:[
     {id:"source",label:"Source Alternatives",text:"Pay a premium to find alternate suppliers. Keeps the schedule on track.",costAdd:0.10,daysAdd:0,qualMod:0},
     {id:"wait",label:"Wait It Out",text:"Pause affected work and wait for the original materials.",costAdd:0,daysAdd:0.15,qualMod:0.03},
     {id:"substitute",label:"Use Cheaper Substitutes",text:"Swap in lower-grade materials that are available now.",costAdd:-0.05,daysAdd:0,qualMod:-0.15}
   ]},
  {id:"weather",name:"Weather Damage", minPct:0.15, maxPct:0.60,
   desc:function(b){return "A severe storm hit the <strong>"+b.name+"</strong> construction site overnight. There's water damage and some materials are ruined.";},
   opts:[
     {id:"cover",label:"Full Remediation",text:"Replace damaged materials and add weather protection. Expensive but thorough.",costAdd:0.08,daysAdd:0.05,qualMod:0.02},
     {id:"dry",label:"Dry Out & Continue",text:"Let things dry, salvage what you can, and keep building.",costAdd:0.02,daysAdd:0.08,qualMod:-0.05},
     {id:"rush",label:"Build Through It",text:"Push the crew to make up lost time. Risk of hidden moisture damage.",costAdd:0,daysAdd:0,qualMod:-0.12}
   ]},
  {id:"inspect",name:"Code Inspection", minPct:0.50, maxPct:0.80,
   desc:function(b){return "A county building inspector arrived at <strong>"+b.name+"</strong> for a routine check. They've flagged a few items.";},
   opts:[
     {id:"fix",label:"Address All Findings",text:"Fix every item the inspector flagged. Adds time but ensures full compliance.",costAdd:0.05,daysAdd:0.06,qualMod:0.08},
     {id:"negotiate",label:"Negotiate the Scope",text:"Push back on minor items and only fix critical findings.",costAdd:0.02,daysAdd:0.03,qualMod:0},
     {id:"expedite",label:"Grease the Wheels",text:"A generous lunch and some creative paperwork. Fast, but risky if audited.",costAdd:0.03,daysAdd:0,qualMod:-0.08}
   ]},
  {id:"labor",name:"Worker Dispute", minPct:0.25, maxPct:0.65,
   desc:function(b){return "The crew on <strong>"+b.name+"</strong> is threatening a work stoppage over safety concerns and overtime pay.";},
   opts:[
     {id:"raise",label:"Raise Wages & Improve Safety",text:"Address their concerns head-on. More expensive but builds loyalty and morale.",costAdd:0.10,daysAdd:0,qualMod:0.06},
     {id:"talk",label:"Meet and Negotiate",text:"Sit down with the crew lead. Find a middle ground without blowing the budget.",costAdd:0.04,daysAdd:0.03,qualMod:0.02},
     {id:"replace",label:"Bring in New Workers",text:"Replace the troublemakers. Disrupts the project while new crew gets up to speed.",costAdd:0.02,daysAdd:0.12,qualMod:-0.08}
   ]}
];

function renderBuildPhase(){
  var phase=MS.nd.bldPhase;
  var b="",confTxt="Confirm";

  if(phase==="contractor"){
    b="<div class=\"ctx-box\" style=\"margin-bottom:10px\"><div><span class=\"key\">Project: </span><span class=\"val\">"+MS.nd.projName+"</span></div><div><span class=\"key\">Base estimate: </span><span class=\"val\">"+fmt(MS.nd.baseCost)+" / "+MS.nd.baseDays+" days</span></div></div>";
    b+="<div style=\"color:var(--dim);font-size:9px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:600\">Select a Contractor</div>";
    b+="<div class=\"ogrid\">";
    for(var i=0;i<MS.nd.contractors.length;i++){
      var c=MS.nd.contractors[i];
      var tierLabel=c.id==="budget"?"Budget":c.id==="standard"?"Standard":"Premium";
      var tierCol=c.id==="budget"?"var(--yel)":c.id==="standard"?"var(--accent)":"var(--grn)";
      b+="<div class=\"ocard\" onclick=\"selOpt(this,'"+i+"')\">";
      b+="<div class=\"oname\">"+c.name+"</div>";
      b+="<div style=\"font-size:9px;color:"+tierCol+";font-weight:600;margin-bottom:4px\">"+tierLabel+"</div>";
      b+="<div class=\"ocost\">"+fmt(c.cost)+"</div>";
      b+="<div class=\"otime\">"+c.days+" days</div>";
      b+="<div class=\"odesc\">"+c.tagline+"</div>";
      b+="<div style=\"font-size:9px;color:var(--dim);margin-top:4px\">⚠ "+c.risk+"</div>";
      b+="</div>";
    }
    b+="</div>";
    confTxt="Negotiate Terms";

  } else if(phase==="negotiate"){
    var c=MS.nd.selectedContractor;
    b="";

    if(MS.nd.negoHistory&&MS.nd.negoHistory.length){
      b+="<div id=\"nego-log\" style=\"margin-bottom:10px;border:1px solid var(--border);border-radius:8px;padding:10px;background:rgba(0,0,0,.12);max-height:130px;overflow-y:auto\">";
      for(var ni=0;ni<MS.nd.negoHistory.length;ni++){
        var nh=MS.nd.negoHistory[ni];
        if(nh.speaker==="you") b+="<div style=\"color:var(--accent);font-size:10px;margin-bottom:4px;padding:3px 6px;border-left:2px solid var(--accent)\"><strong>You:</strong> "+nh.text+"</div>";
        else b+="<div style=\"color:var(--dim);font-size:10px;margin-bottom:4px;padding:3px 6px\"><strong>"+c.name+":</strong> "+nh.text+"</div>";
      }
      b+="</div>";
    }

    if(MS.nd.accepted){
      var qcol=MS.nd.finalQuality>=0.9?"var(--grn)":MS.nd.finalQuality>=0.75?"var(--yel)":"var(--red)";
      b+="<div class=\"nr ok\"><div class=\"nr-title\">TERMS AGREED</div><div>"+c.name+" accepted your proposal.</div><div class=\"nr-eff\">"+fmt(MS.nd.finalCost)+" / "+MS.nd.finalDays+" days · Quality: <span style=\"color:"+qcol+"\">"+(MS.nd.finalQuality>=0.9?"Excellent":MS.nd.finalQuality>=0.75?"Good":"Fair")+"</span></div></div>";
      confTxt="Begin Construction";
    } else {
      var pricePct=Math.round(MS.nd.levers.price*100);
      var priceVal=Math.round(c.cost*MS.nd.levers.price);
      var timePct=Math.round(MS.nd.levers.timeline*100);
      var timeVal=Math.max(3,Math.round(c.days*MS.nd.levers.timeline));
      var maxRounds=MS.nd.tier>=3?5:3;
      var roundsLeft=maxRounds-(MS.nd.negoRound||0);

      b+="<div style=\"color:var(--dim);font-size:9px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:600\">Set Your Terms</div>";

      b+="<div class=\"lever-row\"><div class=\"lever-label\">Price</div><div class=\"lever-slider\"><input type=\"range\" class=\"nego-slider\" min=\"70\" max=\"110\" value=\""+pricePct+"\" oninput=\"updateLever('price',this.value)\" id=\"lever-price\"></div><div class=\"lever-val\" id=\"lever-price-val\">"+fmt(priceVal)+"</div></div>";
      b+="<div class=\"lever-row\"><div class=\"lever-label\">Timeline</div><div class=\"lever-slider\"><input type=\"range\" class=\"nego-slider\" min=\"60\" max=\"120\" value=\""+timePct+"\" oninput=\"updateLever('timeline',this.value)\" id=\"lever-timeline\"></div><div class=\"lever-val\" id=\"lever-timeline-val\">"+timeVal+"d</div></div>";
      var specPct=Math.round((MS.nd.levers.spec!=null?MS.nd.levers.spec:1)*100);
      b+="<div class=\"lever-row\"><div class=\"lever-label\">Materials</div><div class=\"lever-slider\"><input type=\"range\" class=\"nego-slider\" min=\"85\" max=\"115\" value=\""+specPct+"\" oninput=\"updateLever('spec',this.value)\" id=\"lever-spec\"></div><div class=\"lever-val\" id=\"lever-spec-val\">"+leverSpecSummary(MS.nd.levers.spec!=null?MS.nd.levers.spec:1)+"</div></div>";
      b+="<div style=\"color:var(--dim);font-size:9px;margin:-2px 0 6px;padding:0 4px;line-height:1.35\">Materials: value spec saves cost but hurts finished quality; premium spec raises their cost pressure unless you pay more.</div>";

      if(MS.nd.tier>=3){
        b+="<label class=\"lever-toggle\"><input type=\"checkbox\" onchange=\"updateLever('qualityGuarantee',this.checked)\" id=\"lever-qual\""+(MS.nd.levers.qualityGuarantee?" checked":"")+"><span>Quality Guarantee</span><span class=\"lt-note\">Ensures build quality (+~8% cost)</span></label>";
        b+="<label class=\"lever-toggle\"><input type=\"checkbox\" onchange=\"updateLever('delayPenalty',this.checked)\" id=\"lever-penalty\""+(MS.nd.levers.delayPenalty?" checked":"")+"><span>Delay Penalty Clause</span><span class=\"lt-note\">Contractor pays if late (they resist)</span></label>";
        b+="<label class=\"lever-toggle\"><input type=\"checkbox\" onchange=\"updateLever('milestonePayment',this.checked)\" id=\"lever-milestone\""+(MS.nd.levers.milestonePayment?" checked":"")+"><span>Milestone Payments</span><span class=\"lt-note\">Pay in stages (contractor prefers)</span></label>";
      }

      b+="<div id=\"proposal-summary\" style=\"color:var(--text);font-size:11px;margin:8px 0;padding:6px 10px;background:rgba(0,180,216,.06);border:1px solid rgba(0,180,216,.15);border-radius:6px\">Your offer: <strong>"+fmt(priceVal)+"</strong> / <strong>"+timeVal+" days</strong> / <strong>"+leverSpecSummary(MS.nd.levers.spec!=null?MS.nd.levers.spec:1)+"</strong></div>";

      b+="<div class=\"nego-actions\">";
      b+="<button type=\"button\" class=\"nego-btn nego-btn-primary\" onclick=\"proposeTerms()\">Propose Terms</button>";
      b+="<button type=\"button\" class=\"nego-btn nego-btn-danger\" onclick=\"walkAway()\">Walk Away</button>";
      b+="</div>";

      b+="<div style=\"color:var(--dim);font-size:9px;margin-top:6px\">Round "+(MS.nd.negoRound||0)+"/"+maxRounds+" · Their quote: "+fmt(c.cost)+" / "+c.days+"d</div>";
      confTxt="";
    }

  } else if(phase==="walked"){
    var c=MS.nd.walkedContractor;
    b="";
    if(MS.nd.negoHistory&&MS.nd.negoHistory.length){
      b+="<div style=\"margin-bottom:12px;border:1px solid var(--border);border-radius:8px;padding:10px;background:rgba(0,0,0,.12);max-height:130px;overflow-y:auto\">";
      for(var ni=0;ni<MS.nd.negoHistory.length;ni++){
        var nh=MS.nd.negoHistory[ni];
        if(nh.speaker==="you") b+="<div style=\"color:var(--accent);font-size:10px;margin-bottom:4px;padding:3px 6px;border-left:2px solid var(--accent)\"><strong>You:</strong> "+nh.text+"</div>";
        else b+="<div style=\"color:var(--dim);font-size:10px;margin-bottom:4px;padding:3px 6px\"><strong>"+c.name+":</strong> "+nh.text+"</div>";
      }
      b+="</div>";
    }
    b+="<div class=\"nr no\"><div class=\"nr-title\">CONTRACTOR WALKED</div><div><strong>"+c.name+"</strong> has withdrawn from negotiations.</div><div class=\"nr-eff\">"+c.name+" is no longer available for this project.</div></div>";
    if(MS.nd.contractors.length>0){
      b+="<div style=\"margin-top:12px\"><button onclick=\"backToContractors()\" class=\"nego-btn nego-btn-primary\">Select Another Contractor ("+MS.nd.contractors.length+" remaining)</button></div>";
    } else {
      b+="<div style=\"margin-top:12px;color:var(--red);font-size:11px\">No contractors remaining. Close and re-select the project.</div>";
    }
    confTxt="Close";
  }

  document.getElementById("modal-body").innerHTML=b;
  var cb=document.getElementById("modal-confirm");
  if(confTxt){cb.textContent=confTxt;cb.style.display="inline-block";}
  else{cb.style.display="none";}
  var logEl=document.getElementById("nego-log");
  if(logEl) logEl.scrollTop=logEl.scrollHeight;
}

function backToContractors(){
  MS.nd.bldPhase="contractor";
  MS.nd.selectedContractor=null;
  MS.nd.negoRound=0;
  MS.nd.negoHistory=[];
  MS.nd.accepted=false;
  MS.opt="";
  document.getElementById("modal-title").textContent=MS.nd.projName+" — Contractor Selection";
  renderBuildPhase();
}

function handleBuildStep(){
  var phase=MS.nd.bldPhase;

  if(phase==="walked"){closeModal();return;}

  if(phase==="contractor"){
    if(!MS.opt&&MS.opt!=="0"){alert("Select a contractor.");return;}
    var idx=parseInt(MS.opt);
    MS.nd.selectedContractor=MS.nd.contractors[idx];
    MS.nd.bldPhase="negotiate";
    MS.nd.levers={price:1.0,timeline:1.0,spec:1.0,qualityGuarantee:false,delayPenalty:false,milestonePayment:false};
    MS.nd.negoHistory=[];
    MS.nd.negoRound=0;
    MS.nd.accepted=false;
    var greetings=CONTRACTOR_GREETINGS[MS.nd.selectedContractor.id];
    MS.nd.negoHistory.push({speaker:"ha",text:greetings[Math.floor(Math.random()*greetings.length)]});
    MS.opt="";
    document.getElementById("modal-title").textContent=MS.nd.projName+" — "+MS.nd.selectedContractor.name;
    renderBuildPhase();

  } else if(phase==="negotiate"&&MS.nd.accepted){
    var cost=MS.nd.finalCost,days=MS.nd.finalDays,quality=MS.nd.finalQuality;
    if(S.cash<cost){addFeed("WARN","tag-warn","Not enough cash.");return;}
    S.cash-=cost;
    startBuild(MS.nd.bldType,MS.nd.bldOpt,MS.nd.projName,days,cost,quality,MS.nd.selectedContractor.name);
    closeModal(); updateUI(calcM());
  }
}

// ── HA NEGO (PLAYER-INITIATED) ───────────────────────────────────────────
function openHANego(){
  MS.type="ha"; MS.alertId=""; MS.negoStep="menu"; MS.opt=""; MS.nd={};
  document.getElementById("modal-title").textContent="Heartland Air Negotiations";
  renderHAStep();
  document.getElementById("modal").style.display="flex";
}
function setHAStep(step){MS.negoStep=step;MS.opt="";renderHAStep();}

function cdCard(key,label,desc,step){
  var left=negoCdLeft(key);
  if(left>0){
    return "<div class=\"ocard locked\"><div class=\"oname\" style=\"color:#555\">"+label+"</div><div class=\"odesc\" style=\"color:#444\">"+desc+"</div><div style=\"color:#555;font-size:10px;margin-top:6px\">Available in "+left+"d</div></div>";
  }
  return "<div class=\"ocard\" onclick=\"setHAStep('"+step+"')\"><div class=\"oname\">"+label+"</div><div class=\"odesc\">"+desc+"</div><div class=\"oeffect\">Available</div></div>";
}

function renderHAStep(){
  var step=MS.negoStep;
  var har=haRoutes(),rtf=0;
  for(var i=0;i<har.length;i++) rtf+=har[i].freq;
  var b="",showConf=true,confTxt="Propose";

  if(step==="menu"){
    showConf=false;
    b="<div class=\"ctx-box\">";
    b+="<div><span class=\"key\">HA Satisfaction: </span><span class=\"val\" style=\"color:"+(S.sat>65?"#2ecc71":S.sat>40?"#f39c12":"#e74c3c")+"\">"+Math.round(S.sat)+"/100</span></div>";
    b+="<div><span class=\"key\">HA daily flights: </span><span class=\"val\">"+rtf+"</span></div>";
    b+="<div><span class=\"key\">Fee adjustment: </span><span class=\"val\">"+(S.haFeeAdj>0?"+$"+S.haFeeAdj+"/flight":"None")+"</span></div>";
    b+="<div style=\"color:#888;font-size:10px;margin-top:4px\">Each topic has a cooldown after use. Heartland Air will not negotiate the same terms indefinitely.</div></div>";
    b+="<div class=\"ogrid\">";
    b+=cdCard("fee","Fee Discussion","Negotiate an additional per-flight fee on top of base aircraft rates.","fee");
    b+=cdCard("addcity","Add New Route","Propose service to a new city from Millbrook.","addcity");
    b+=cdCard("freq","Increase Frequency","Request additional daily flights on an existing route.","freq");
    b+=cdCard("upg","Upgrade Aircraft","Propose a larger aircraft on an existing route.","upg1");
    b+="</div>";

  } else if(step==="fee"){
    b="<div class=\"ctx-box\"><div><span class=\"key\">Current fee adj: </span><span class=\"val\">"+(S.haFeeAdj>0?"+$"+S.haFeeAdj+"/flight":"None")+"</span></div><div><span class=\"key\">Sat: </span><span class=\"val\">"+Math.round(S.sat)+"/100</span></div></div>";
    b+="<div class=\"ogrid\">";
    b+="<div class=\"ocard\" onclick=\"selOpt(this,'hard')\"><div class=\"oname\">Push Hard</div><div class=\"ocost\">+$40/flight</div><div class=\"odesc\">High reward. Real risk of refusal and sat damage.</div><div class=\"oeffect\">Best with sat 70+</div></div>";
    b+="<div class=\"ocard\" onclick=\"selOpt(this,'mod')\"><div class=\"oname\">Reasonable Ask</div><div class=\"ocost\">+$20/flight</div><div class=\"odesc\">Measured request. Usually succeeds without damaging the relationship.</div><div class=\"oeffect\">Best with sat 50+</div></div>";
    b+="<div class=\"ocard\" onclick=\"selOpt(this,'soft')\"><div class=\"oname\">Small Bump</div><div class=\"ocost\">+$10/flight</div><div class=\"odesc\">Conservative ask. Almost always accepted.</div><div class=\"oeffect\">Works at any sat</div></div>";
    b+="</div><button class=\"back-btn\" onclick=\"setHAStep('menu')\">Back to Menu</button>";
    confTxt="Submit Proposal";

  } else if(step==="addcity"){
    var avail=[];
    for(var i=0;i<CITIES.length;i++){var ct=CITIES[i];if(!hasCityRoute("Heartland Air",ct.id)&&S.sat>=ct.minSat-15) avail.push(ct);}
    if(!avail.length){b="<p style=\"color:#888;font-size:12px\">All reachable cities are already served. Improve satisfaction to unlock more.</p>";showConf=false;}
    else{
      b="<p style=\"color:#888;font-size:11px;margin-bottom:10px\">Propose service to a new destination.</p><div class=\"ogrid\">";
      for(var i=0;i<avail.length;i++){
        var ct=avail[i],ok=S.sat>=ct.minSat,close=S.sat>=ct.minSat-10;
        var col=ok?"#2ecc71":close?"#f39c12":"#666",lbl=ok?"Favorable":close?"Possible":"Unlikely";
        b+="<div class=\"ocard\" onclick=\"selOpt(this,'"+ct.id+"')\"><div class=\"oname\">"+ct.name+"</div><div class=\"oeffect\" style=\"color:"+col+"\">"+lbl+" (sat "+ct.minSat+" needed)</div><div style=\"font-size:10px;color:#888;margin-top:2px\">Min aircraft: "+AC[ct.minAC].name+"</div></div>";
      }
      b+="</div><button class=\"back-btn\" onclick=\"setHAStep('menu')\">Back</button>";
      confTxt="Select Aircraft";
    }

  } else if(step==="addac"){
    var cid=MS.nd.cityId,ct=city(cid);
    if(!ct){b="<p style=\"color:#888\">City not found.</p>";showConf=false;}
    else{
      var minIdx=acIdx(ct.minAC);
      b="<p style=\"color:#888;font-size:11px;margin-bottom:6px\">Select aircraft for <strong style=\"color:#f0f0f0\">"+ct.name+"</strong>.</p>";
      b+="<div class=\"ctx-box\" style=\"margin-bottom:10px\"><div><span class=\"key\">Market load factor: </span><span class=\"val\">"+Math.round(ct.lf*100)+"%</span></div></div>";
      b+="<div class=\"ogrid\">";
      for(var i=minIdx;i<AC_ORDER.length;i++){
        var aid=AC_ORDER[i]; if(aid==="dc9"&&S.gateCap<2) continue;
        var ac=AC[aid],ep=Math.round(ac.seats*ct.lf);
        b+="<div class=\"ocard\" onclick=\"selOpt(this,'"+aid+"')\"><div class=\"oname\">"+ac.name+"</div><div class=\"ocost\">"+ac.seats+" seats</div><div class=\"otime\">$"+(ac.fee+S.haFeeAdj)+"/flight</div><div class=\"odesc\">~"+ep+" pax/flight</div><span class=\"obadge bf\">"+ac.type+"</span></div>";
      }
      b+="</div><button class=\"back-btn\" onclick=\"setHAStep('addcity')\">Back</button>";
      confTxt="Propose Route";
    }

  } else if(step==="freq"){
    b="<p style=\"color:#888;font-size:11px;margin-bottom:10px\">Request an additional daily flight on an existing HA route.</p><div class=\"ogrid\">";
    for(var i=0;i<har.length;i++){
      var r=har[i],ct=city(r.cityId),ac=AC[r.aircraft],atMax=r.freq>=ac.maxFreq;
      b+="<div class=\"ocard\" onclick=\""+(atMax?"":"selOpt(this,'"+r.id+"')")+"\"><div class=\"oname\">"+(ct?ct.name:r.cityId)+"</div><div class=\"ocost\">"+(atMax?"At max frequency":"+1 daily flight")+"</div><div class=\"odesc\">"+r.freq+"x | "+ac.name+"</div>"+(atMax?"<span class=\"obadge bl\">Max reached</span>":"")+"</div>";
    }
    b+="</div><button class=\"back-btn\" onclick=\"setHAStep('menu')\">Back</button>";
    confTxt="Request Increase";

  } else if(step==="upg1"){
    b="<p style=\"color:#888;font-size:11px;margin-bottom:10px\">Select a route to upgrade its aircraft.</p><div class=\"ogrid\">";
    for(var i=0;i<har.length;i++){
      var r=har[i],ct=city(r.cityId),ac=AC[r.aircraft],canUp=acIdx(r.aircraft)<AC_ORDER.length-1;
      b+="<div class=\"ocard\" onclick=\""+(canUp?"selOpt(this,'"+r.id+"')":"")+"\"><div class=\"oname\">"+(ct?ct.name:r.cityId)+"</div><div class=\"ocost\">"+ac.name+"</div><div class=\"odesc\">"+r.freq+"x daily</div>"+(canUp?"":"<span class=\"obadge bl\">Largest aircraft</span>")+"</div>";
    }
    b+="</div><button class=\"back-btn\" onclick=\"setHAStep('menu')\">Back</button>";
    confTxt="Next";

  } else if(step==="upg2"){
    var rid=MS.nd.routeId,route=null;
    for(var i=0;i<S.routes.length;i++){if(S.routes[i].id===rid){route=S.routes[i];break;}}
    if(!route){b="<p style=\"color:#888\">Route not found.</p>";showConf=false;}
    else{
      var ct=city(route.cityId),cur=AC[route.aircraft],ci=acIdx(route.aircraft);
      b="<p style=\"color:#888;font-size:11px;margin-bottom:6px\">Choose a larger aircraft for <strong style=\"color:#f0f0f0\">"+(ct?ct.name:route.cityId)+"</strong>.</p>";
      b+="<div class=\"ctx-box\" style=\"margin-bottom:10px\"><div><span class=\"key\">Current: </span><span class=\"val\">"+cur.name+" ("+cur.seats+" seats, $"+cur.fee+"/flt)</span></div></div>";
      b+="<div class=\"ogrid\">";
      for(var i=ci+1;i<AC_ORDER.length;i++){
        var aid=AC_ORDER[i]; if(aid==="dc9"&&S.gateCap<2) continue;
        var ac=AC[aid];
        b+="<div class=\"ocard\" onclick=\"selOpt(this,'"+aid+"')\"><div class=\"oname\">"+ac.name+"</div><div class=\"ocost\">"+ac.seats+" seats (+"+(ac.seats-cur.seats)+")</div><div class=\"otime\">$"+ac.fee+"/flt (+$"+(ac.fee-cur.fee)+")</div><span class=\"obadge bf\">"+ac.type+"</span></div>";
      }
      b+="</div><button class=\"back-btn\" onclick=\"setHAStep('upg1')\">Back</button>";
      confTxt="Propose Upgrade";
    }
  } else if(step==="dlg"){
    var dlgData = MS.nd.dlgTopic==="fee" ? NEGO_DLG.fee[MS.nd.dlgKey] : NEGO_DLG[MS.nd.dlgTopic];
    var round = dlgData[MS.nd.dlgRound];
    var ctx = {sat:S.sat, prev:MS.nd.dlgPrev, cityName:MS.nd.cityName||"", acName:MS.nd.acName||"", routeName:MS.nd.routeName||"", newAcName:MS.nd.newAcName||"", minSat:MS.nd.minSat||0};
    b="";
    if(MS.nd.dlgHistory && MS.nd.dlgHistory.length){
      b+="<div style=\"opacity:0.55;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:10px\">";
      for(var di=0;di<MS.nd.dlgHistory.length;di++){
        var dh=MS.nd.dlgHistory[di];
        if(dh.speaker==="ha") b+="<div class=\"ha-msg\" style=\"margin-bottom:6px;padding:8px 10px;font-size:11px\">"+dh.html+"</div>";
        else b+="<div style=\"background:rgba(0,180,216,.08);border:1px solid rgba(0,180,216,.2);border-left:4px solid var(--accent);padding:8px 10px;margin-bottom:6px;font-size:11px;border-radius:0 8px 8px 0;color:var(--text)\"><strong>You:</strong> "+dh.html+"</div>";
      }
      b+="</div>";
    }
    b+="<div class=\"ha-msg\" style=\"margin-bottom:12px\">"+round.ha(ctx)+"</div>";
    var mood = MS.nd.dlgScore>=3?"receptive":MS.nd.dlgScore>=1?"considering":MS.nd.dlgScore>=0?"neutral":"skeptical";
    var moodCol = MS.nd.dlgScore>=3?"var(--grn)":MS.nd.dlgScore>=1?"var(--yel)":MS.nd.dlgScore>=0?"var(--dim)":"var(--red)";
    b+="<div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:8px\">";
    b+="<div style=\"color:var(--dim);font-size:9px;text-transform:uppercase;letter-spacing:1px;font-weight:600\">Your Response</div>";
    if(MS.nd.dlgRound>0) b+="<div style=\"font-size:9px;color:"+moodCol+"\">Mood: "+mood+"</div>";
    b+="</div>";
    b+="<div class=\"ogrid\">";
    for(var oi=0;oi<round.opts.length;oi++){
      var dopt=round.opts[oi],tone;
      if(dopt.score>=2) tone="Stronger pitch — bigger swing if it lands";
      else if(dopt.score===1) tone="Assertive — solid leverage";
      else if(dopt.score===0) tone="Balanced — middle ground";
      else if(dopt.score===-1) tone="Soft — limits upside if they're skeptical";
      else tone="Backing off — dampens conflict, weak leverage";
      b+="<div class=\"ocard\" onclick=\"selOpt(this,'"+dopt.id+"')\"><div class=\"oname\">"+dopt.label+"</div><div class=\"odesc\" style=\"font-style:italic;color:var(--text);opacity:0.8\">"+dopt.text+"</div><div class=\"nego-tone\">"+tone+"</div></div>";
    }
    b+="</div>";
    b+="<div style=\"color:var(--dim);font-size:10px;margin-top:8px\">Round "+(MS.nd.dlgRound+1)+" of "+dlgData.length+" · Sat: "+Math.round(S.sat)+"/100</div>";
    confTxt="Respond";

  } else if(step==="result"){
    showConf=true; confTxt="Close"; b=MS.nd.resultHtml||"";
  }

  document.getElementById("modal-body").innerHTML=b;
  var cb=document.getElementById("modal-confirm");
  cb.textContent=confTxt; cb.style.display=showConf?"inline-block":"none";
}

function handleHAStep(){
  var step=MS.negoStep;
  if(step==="menu"||step==="result"){closeModal();return;}

  // ── DIALOGUE PROCESSING ─────────────────────────────────────────────────
  if(step==="dlg"){
    if(!MS.opt){alert("Select a response.");return;}
    var dlgData = MS.nd.dlgTopic==="fee" ? NEGO_DLG.fee[MS.nd.dlgKey] : NEGO_DLG[MS.nd.dlgTopic];
    var round = dlgData[MS.nd.dlgRound];
    var chosen = null;
    for(var ci=0;ci<round.opts.length;ci++){if(round.opts[ci].id===MS.opt){chosen=round.opts[ci];break;}}
    if(!chosen) return;

    var ctx = {sat:S.sat, prev:MS.nd.dlgPrev, cityName:MS.nd.cityName||"", acName:MS.nd.acName||"", routeName:MS.nd.routeName||"", newAcName:MS.nd.newAcName||"", minSat:MS.nd.minSat||0};
    MS.nd.dlgHistory.push({speaker:"ha", html:round.ha(ctx)});
    MS.nd.dlgHistory.push({speaker:"you", html:chosen.text});
    MS.nd.dlgScore += chosen.score;
    MS.nd.dlgPrev = chosen.id;
    MS.nd.dlgRound++;
    MS.opt="";

    if(MS.nd.dlgRound < dlgData.length){
      renderHAStep();
      return;
    }

    // ── RESOLVE NEGOTIATION ────────────────────────────────────────────────
    var base = MS.nd.baseChance;
    var score = MS.nd.dlgScore;
    var satMod = (S.sat - 50) * 0.002;
    var finalChance = Math.max(0.06, Math.min(0.92, base * 0.48 + score * 0.095 + satMod));
    var ok = Math.random() < finalChance;
    var topic = MS.nd.dlgTopic;
    var txt, eff;

    if(topic === "fee"){
      var inc = MS.nd.feeInc;
      if(ok){
        S.haFeeAdj += inc;
        var sh = inc>=40 ? 4 : 0; if(sh) S.sat = Math.max(0, S.sat - sh);
        txt = "Heartland Air accepted the new rate.";
        eff = "Fee adjustment +$" + inc + ". Total: +$" + S.haFeeAdj + "/flight." + (sh ? " Sat -" + sh : "");
        addFeed("NEGO","tag-nego","HA fee adj now +$"+S.haFeeAdj+"/flight.");
      } else {
        var sh = inc>=40 ? 11 : inc>=20 ? 5 : 1; S.sat = Math.max(0, S.sat - sh);
        txt = "Heartland Air declined."; eff = "Fee unchanged. Sat -" + sh + ".";
      }
      S.negoCDs.fee = S.day;
    } else if(topic === "addcity"){
      var cid = MS.nd.cityId, ct = city(cid), ac = AC[MS.nd.acOpt];
      if(ok){
        S.routes.push({id:newRid(),airline:"Heartland Air",cityId:cid,freq:1,aircraft:MS.nd.acOpt,active:true});
        txt = "Heartland Air agreed to add " + (ct?ct.name:cid) + " service!";
        eff = "1x daily " + ac.name + ". $" + (ac.fee+S.haFeeAdj) + "/flight.";
        addFeed("AIRLINE","tag-airline","HA adds "+(ct?ct.name:cid)+" route. 1x daily, "+ac.name+".");
      } else {
        var diff = S.sat - (ct?ct.minSat:50);
        var sh = diff<0 ? 5 : 2; S.sat = Math.max(0, S.sat - sh);
        txt = "Heartland Air declined " + (ct?ct.name:cid) + " service."; eff = "Improve sat and infrastructure. Sat -" + sh + ".";
      }
      S.negoCDs.addcity = S.day;
    } else if(topic === "freq"){
      var route = null;
      for(var ri=0;ri<S.routes.length;ri++){if(S.routes[ri].id===MS.nd.freqRouteId){route=S.routes[ri];break;}}
      if(!route){closeModal();return;}
      var ct = city(route.cityId);
      if(ok){
        route.freq++;
        txt = "Heartland Air agreed to add a flight on " + (ct?ct.name:route.cityId) + ".";
        eff = "Route now " + route.freq + "x daily.";
        addFeed("AIRLINE","tag-airline","HA increases frequency on "+(ct?ct.name:route.cityId)+". Now "+route.freq+"x/day.");
      } else {
        S.sat = Math.max(0, S.sat - 3);
        txt = "Heartland Air declined the frequency increase."; eff = "Sat -3.";
      }
      S.negoCDs.freq = S.day;
    } else if(topic === "upg"){
      var route = null;
      for(var ri=0;ri<S.routes.length;ri++){if(S.routes[ri].id===MS.nd.routeId){route=S.routes[ri];break;}}
      if(!route){closeModal();return;}
      var newAC = AC[MS.nd.upgAcOpt], oldAC = AC[route.aircraft], ct = city(route.cityId);
      if(ok){
        var oldSeats = oldAC.seats; route.aircraft = MS.nd.upgAcOpt;
        if(route.freq > newAC.maxFreq) route.freq = newAC.maxFreq;
        txt = "Heartland Air agreed to upgrade " + (ct?ct.name:route.cityId) + " to " + newAC.name + ".";
        eff = "Capacity: " + oldSeats + " to " + newAC.seats + " seats. Fee +$" + (newAC.fee-oldAC.fee) + "/flight.";
        addFeed("AIRLINE","tag-airline","HA upgrades "+(ct?ct.name:route.cityId)+" to "+newAC.name+".");
      } else {
        S.sat = Math.max(0, S.sat - 4);
        txt = "Heartland Air declined the aircraft upgrade."; eff = "Sat -4.";
      }
      S.negoCDs.upg = S.day;
    }

    var logHtml = "<div style=\"margin-bottom:12px;border:1px solid var(--border);border-radius:8px;padding:10px;background:rgba(0,0,0,.15)\">";
    logHtml += "<div style=\"font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--dim);margin-bottom:8px;font-weight:600\">Conversation Log</div>";
    for(var li=0;li<MS.nd.dlgHistory.length;li++){
      var dh=MS.nd.dlgHistory[li];
      if(dh.speaker==="ha") logHtml += "<div style=\"color:var(--dim);font-size:10px;margin-bottom:4px;padding:4px 6px\">"+dh.html+"</div>";
      else logHtml += "<div style=\"color:var(--accent);font-size:10px;margin-bottom:4px;padding:4px 6px;border-left:2px solid var(--accent)\"><strong>You:</strong> "+dh.html+"</div>";
    }
    logHtml += "</div>";
    var pctTxt = "<div style=\"color:var(--dim);font-size:10px;margin-bottom:6px\">Approval chance: "+Math.round(finalChance*100)+"%</div>";
    MS.nd.resultHtml = logHtml + pctTxt + resultHtml(ok, txt, eff);
    MS.negoStep = "result";
    renderHAStep();
    updateUI(calcM());
    return;
  }

  // ── ENTER DIALOGUE FROM TOPIC STEPS ─────────────────────────────────────
  if(step==="fee"){
    if(!MS.opt){alert("Select an option.");return;}
    var incMap={hard:40,mod:20,soft:10};
    var chMap={hard:S.sat>70?0.52:0.22, mod:S.sat>50?0.62:0.38, soft:S.sat>40?0.72:0.48};
    MS.nd.dlgTopic="fee"; MS.nd.dlgKey=MS.opt;
    MS.nd.dlgRound=0; MS.nd.dlgScore=0; MS.nd.dlgPrev="";
    MS.nd.dlgHistory=[]; MS.nd.baseChance=chMap[MS.opt]; MS.nd.feeInc=incMap[MS.opt];
    MS.negoStep="dlg"; MS.opt=""; renderHAStep();

  } else if(step==="addcity"){
    if(!MS.opt){alert("Select a city.");return;}
    MS.nd.cityId=MS.opt; MS.opt=""; MS.negoStep="addac"; renderHAStep();

  } else if(step==="addac"){
    if(!MS.opt){alert("Select an aircraft type.");return;}
    var cid=MS.nd.cityId,ct=city(cid),ac=AC[MS.opt];
    if(MS.opt==="dc9"&&S.gateCap<2){MS.nd.resultHtml=resultHtml(false,"Requires 2 gates for jet service.","Build a second gate first.");MS.negoStep="result";renderHAStep();return;}
    var diff=S.sat-(ct?ct.minSat:50);
    var ch=diff>=20?0.90:diff>=10?0.75:diff>=0?0.55:0.15;
    MS.nd.dlgTopic="addcity"; MS.nd.dlgKey="";
    MS.nd.dlgRound=0; MS.nd.dlgScore=0; MS.nd.dlgPrev="";
    MS.nd.dlgHistory=[]; MS.nd.baseChance=ch;
    MS.nd.acOpt=MS.opt; MS.nd.cityName=ct?ct.name:cid; MS.nd.acName=ac.name; MS.nd.minSat=ct?ct.minSat:50;
    MS.negoStep="dlg"; MS.opt=""; renderHAStep();

  } else if(step==="freq"){
    if(!MS.opt){alert("Select a route.");return;}
    var route=null;
    for(var i=0;i<S.routes.length;i++){if(S.routes[i].id===MS.opt){route=S.routes[i];break;}}
    if(!route){closeModal();return;}
    var ac=AC[route.aircraft],ct=city(route.cityId);
    if(route.freq>=ac.maxFreq){MS.nd.resultHtml=resultHtml(false,"Already at maximum frequency.","Consider upgrading to a larger aircraft.");MS.negoStep="result";renderHAStep();return;}
    var ch=S.sat>=75?0.85:S.sat>=60?0.70:S.sat>=45?0.50:0.25;
    MS.nd.dlgTopic="freq"; MS.nd.dlgKey="";
    MS.nd.dlgRound=0; MS.nd.dlgScore=0; MS.nd.dlgPrev="";
    MS.nd.dlgHistory=[]; MS.nd.baseChance=ch;
    MS.nd.freqRouteId=route.id; MS.nd.routeName=ct?ct.name:route.cityId;
    MS.negoStep="dlg"; MS.opt=""; renderHAStep();

  } else if(step==="upg1"){
    if(!MS.opt){alert("Select a route.");return;}
    MS.nd.routeId=MS.opt; MS.opt=""; MS.negoStep="upg2"; renderHAStep();

  } else if(step==="upg2"){
    if(!MS.opt){alert("Select an aircraft type.");return;}
    var route=null;
    for(var i=0;i<S.routes.length;i++){if(S.routes[i].id===MS.nd.routeId){route=S.routes[i];break;}}
    if(!route){closeModal();return;}
    if(MS.opt==="dc9"&&S.gateCap<2){MS.nd.resultHtml=resultHtml(false,"Jet service requires 2 gates.","");MS.negoStep="result";renderHAStep();return;}
    var newAC=AC[MS.opt],oldAC=AC[route.aircraft],ct=city(route.cityId);
    var gap=acIdx(MS.opt)-acIdx(route.aircraft);
    var ch=S.sat>=70?(gap<=1?0.85:0.65):S.sat>=55?(gap<=1?0.65:0.45):0.30;
    MS.nd.dlgTopic="upg"; MS.nd.dlgKey="";
    MS.nd.dlgRound=0; MS.nd.dlgScore=0; MS.nd.dlgPrev="";
    MS.nd.dlgHistory=[]; MS.nd.baseChance=ch;
    MS.nd.upgAcOpt=MS.opt; MS.nd.routeName=ct?ct.name:route.cityId; MS.nd.newAcName=newAC.name;
    MS.negoStep="dlg"; MS.opt=""; renderHAStep();
  }
}

// ── HA-INITIATED ALERT HANDLING ──────────────────────────────────────────
function openHAAlert(id){
  MS.type="ha_alert"; MS.alertId=id; MS.opt=""; MS.nd={phase:0};
  var hd=S.alertData[id]||{};
  var title="",b="";

  if(id==="ha_fee"){
    if(hd.scenario==="threat"){
      title="Heartland Air: Performance Warning";
      var m2=calcM();
      b="<div class=\"ha-msg ha-threat\">";
      b+="<strong>From:</strong> Richard Holt, VP Regional Operations, Heartland Air<br><br>";
      b+="We have been monitoring performance at Millbrook Regional with concern. Delays are currently averaging "+m2.delay+"% and our on-time performance targets are not being met.<br><br>";
      b+="Unless we see measurable improvement within the next 30 days, we will be reducing our "+hd.cityName+" service from "+hd.curFreq+"x to "+(Math.max(1,hd.curFreq-1))+"x daily, effective immediately upon the deadline.";
      b+="</div>";
      b+="<div class=\"ogrid\">";
      b+="<div class=\"ocard\" onclick=\"selOpt(this,'commit')\"><div class=\"oname\">Commit to Improvements</div><div class=\"odesc\">Acknowledge the problem and commit to reducing delays within 30 days. Sets a performance watch clock.</div><div class=\"oeffect\">Delays issue. Sat +3 goodwill.</div></div>";
      b+="<div class=\"ocard\" onclick=\"selOpt(this,'dispute')\"><div class=\"oname\">Dispute the Numbers</div><div class=\"odesc\">Push back on their assessment. Risky -- they have the data on their side if your delays are genuinely high.</div><div class=\"oeffect\">Risky if delay above 15%</div></div>";
      b+="<div class=\"ocard\" onclick=\"selOpt(this,'concede')\"><div class=\"oname\">Accept and Apologize</div><div class=\"odesc\">Accept responsibility without specific commitments. Buys goodwill but no immediate consequences deferred.</div><div class=\"oeffect\">Sat -2 but no penalty yet</div></div>";
      b+="</div>";
    } else if(hd.scenario==="offer"){
      title="Heartland Air: Expansion Offer";
      b="<div class=\"ha-msg\">";
      b+="<strong>From:</strong> Sarah Chen, Network Planning, Heartland Air<br><br>";
      b+="Given Millbrook's strong performance, we are considering adding "+hd.cityName+" service using "+hd.acName+" aircraft, "+hd.freq+"x daily.<br><br>";
      b+="In exchange, we would ask for a fee adjustment going the other way -- a $10/flight reduction from your current rate as a gesture of partnership on this new investment.";
      b+="</div>";
      b+="<div class=\"ogrid\">";
      b+="<div class=\"ocard\" onclick=\"selOpt(this,'accept_offer')\"><div class=\"oname\">Accept Their Terms</div><div class=\"odesc\">Take the deal as offered. New route added, fee reduced $10/flight.</div><div class=\"oeffect\">+Route, -$10/flt adj, +Sat 5</div></div>";
      b+="<div class=\"ocard\" onclick=\"selOpt(this,'counter_offer')\"><div class=\"oname\">Counter: No Fee Reduction</div><div class=\"odesc\">Accept the new route but decline the fee concession. They may push back.</div><div class=\"oeffect\">60% they agree, risk of sat -5</div></div>";
      b+="<div class=\"ocard\" onclick=\"selOpt(this,'decline_offer')\"><div class=\"oname\">Decline the Arrangement</div><div class=\"odesc\">Not interested in giving up fees for a route add.</div><div class=\"oeffect\">Sat -3</div></div>";
      b+="</div>";
    }

  } else if(id==="ha_routes"){
    title="Heartland Air: Route Proposal";
    b="<div class=\"ha-msg\">";
    b+="<strong>From:</strong> Sarah Chen, Network Planning, Heartland Air<br><br>";
    b+="We have been reviewing potential growth opportunities at Millbrook and would like to propose adding "+hd.cityName+" to our network from your airport.<br><br>";
    b+="Our proposal: "+hd.freq+"x daily service using "+hd.acName+". We are prepared to pay $"+hd.proposedFee+"/flight at your current facility rates.";
    b+="</div>";
    b+="<div class=\"ctx-box\"><div><span class=\"key\">Their proposed fee: </span><span class=\"val\">$"+hd.proposedFee+"/flight</span></div><div><span class=\"key\">Your current base adj: </span><span class=\"val\">"+(S.haFeeAdj>0?"+$"+S.haFeeAdj+"/flight":"None")+"</span></div><div><span class=\"key\">Aircraft: </span><span class=\"val\">"+hd.acName+" ("+AC[hd.aircraft].seats+" seats)</span></div></div>";
    b+="<div class=\"ogrid\">";
    b+="<div class=\"ocard\" onclick=\"selOpt(this,'accept_route')\"><div class=\"oname\">Accept Their Terms</div><div class=\"ocost\">$"+hd.proposedFee+"/flt</div><div class=\"odesc\">Take the deal as offered. Route starts immediately.</div><div class=\"oeffect\">+Route, Sat +4</div></div>";
    b+="<div class=\"ocard\" onclick=\"selOpt(this,'counter_route')\"><div class=\"oname\">Counter: Full Rate</div><div class=\"ocost\">$"+(AC[hd.aircraft].fee+S.haFeeAdj)+"/flt</div><div class=\"odesc\">Push for your standard fee. They proposed below base -- reclaim it.</div><div class=\"oeffect\">70% agree if sat 65+</div></div>";
    b+="<div class=\"ocard\" onclick=\"selOpt(this,'decline_route')\"><div class=\"oname\">Decline</div><div class=\"ocost\">No deal</div><div class=\"odesc\">Turn down the proposal. May affect relationship.</div><div class=\"oeffect\">Sat -2</div></div>";
    b+="</div>";
  }

  document.getElementById("modal-title").textContent=title;
  document.getElementById("modal-body").innerHTML=b;
  document.getElementById("modal-confirm").textContent="Respond";
  document.getElementById("modal-confirm").style.display="inline-block";
  document.getElementById("modal").style.display="flex";
}

function resolveHAAlert(){
  var id=MS.alertId,opt=MS.opt,hd=S.alertData[id]||{};
  var ok=false,txt="",eff="";

  if(id==="ha_fee"){
    if(hd.scenario==="threat"){
      if(opt==="commit"){
        S.sat=Math.min(100,S.sat+3);
        S.alertCD["ha_watch"]=S.day+30;
        ok=true; txt="Heartland Air acknowledged your commitment."; eff="Sat +3. Performance will be reviewed in 30 days. Get those delays down.";
        addFeed("AIRLINE","tag-airline","HA notified of improvement commitment. 30-day performance watch begins.");
      } else if(opt==="dispute"){
        var m2=calcM();
        if(m2.delay<15){ok=true;S.sat=Math.min(100,S.sat+2);txt="Heartland Air backed down.";eff="Your numbers supported the dispute. Sat +2. Threat withdrawn.";}
        else{S.sat=Math.max(0,S.sat-8);var har=haRoutes();if(har.length){var r=har[har.length-1];if(r.freq>1) r.freq--;}ok=false;txt="Heartland Air did not accept the dispute.";eff="Their data was correct. Frequency cut on "+hd.cityName+". Sat -8.";}
      } else {
        S.sat=Math.max(0,S.sat-2);ok=true;txt="Heartland Air noted your apology.";eff="Sat -2. No immediate penalty but they are still watching.";
      }
    } else if(hd.scenario==="offer"){
      if(opt==="accept_offer"){
        S.haFeeAdj=Math.max(0,S.haFeeAdj-10);
        S.routes.push({id:newRid(),airline:"Heartland Air",cityId:hd.cityId,freq:hd.freq,aircraft:hd.aircraft,active:true});
        S.sat=Math.min(100,S.sat+5);
        ok=true; txt="Deal accepted. "+hd.cityName+" service begins."; eff="Route added "+hd.freq+"x daily. Fee adj reduced by $10/flight. Sat +5.";
        addFeed("AIRLINE","tag-airline","HA begins "+hd.cityName+" service under expansion offer.");
      } else if(opt==="counter_offer"){
        var ch=S.sat>=65?0.60:0.30;
        if(Math.random()<ch){
          S.routes.push({id:newRid(),airline:"Heartland Air",cityId:hd.cityId,freq:hd.freq,aircraft:hd.aircraft,active:true});
          S.sat=Math.min(100,S.sat+3);
          ok=true; txt="Heartland Air agreed -- no fee concession required."; eff="Route added on your terms. Sat +3.";
          addFeed("AIRLINE","tag-airline","HA adds "+hd.cityName+" with no fee concession after counter.");
        } else {
          S.sat=Math.max(0,S.sat-5); ok=false;
          txt="Heartland Air declined the counter."; eff="They wanted the fee reduction. Opportunity passed. Sat -5.";
        }
      } else {
        S.sat=Math.max(0,S.sat-3); ok=true;
        txt="You declined the arrangement."; eff="Sat -3.";
      }
    }
  } else if(id==="ha_routes"){
    if(opt==="accept_route"){
      S.routes.push({id:newRid(),airline:"Heartland Air",cityId:hd.cityId,freq:hd.freq,aircraft:hd.aircraft,active:true,customFee:hd.proposedFee});
      S.sat=Math.min(100,S.sat+4);
      ok=true; txt="Deal accepted. "+hd.cityName+" service begins."; eff=hd.freq+"x daily "+hd.acName+". $"+hd.proposedFee+"/flight. Sat +4.";
      addFeed("AIRLINE","tag-airline","HA begins "+hd.cityName+" service on their proposed terms.");
    } else if(opt==="counter_route"){
      var fullFee=AC[hd.aircraft].fee+S.haFeeAdj;
      var ch=S.sat>=65?0.70:0.40;
      if(Math.random()<ch){
        S.routes.push({id:newRid(),airline:"Heartland Air",cityId:hd.cityId,freq:hd.freq,aircraft:hd.aircraft,active:true});
        S.sat=Math.min(100,S.sat+3);
        ok=true; txt="Heartland Air agreed to the full rate."; eff=hd.freq+"x daily "+hd.acName+". $"+fullFee+"/flight. Sat +3.";
        addFeed("AIRLINE","tag-airline","HA adds "+hd.cityName+" at full rate after counter.");
      } else {
        S.sat=Math.max(0,S.sat-4); ok=false;
        txt="Heartland Air walked away from the counter."; eff="They were firm on the lower rate. Opportunity passed. Sat -4.";
      }
    } else {
      S.sat=Math.max(0,S.sat-2); ok=true;
      txt="You declined the route proposal."; eff="Sat -2.";
    }
  }

  S.negoCDs.addcity=S.day;
  document.getElementById("modal-body").innerHTML=resultHtml(ok,txt,eff);
  document.getElementById("modal-confirm").textContent="Close";
  MS.nd.phase=1;
  dismissAlert(id);
  updateUI(calcM());
}

// ── OTHER ALERT MODALS ────────────────────────────────────────────────────
function openAlert(id){
  if(id==="ha_fee"||id==="ha_routes"){openHAAlert(id);return;}
  if(id.indexOf("bld_")===0){openBuildEvent(id);return;}
  MS.type="alert"; MS.alertId=id; MS.opt=""; MS.nd={phase:0};
  var title="",b="";

  if(id==="pfc"){
    title="Introduce Passenger Facility Charge";
    var m2=calcM();
    b="<div class=\"ctx-box\"><div><span class=\"key\">Current PFC: </span><span class=\"val\">None</span></div><div><span class=\"key\">Daily pax: </span><span class=\"val\">"+m2.pax+"</span></div><div style=\"color:#888;font-size:10px;margin-top:4px\">A per-passenger fee paid by airlines to the airport on every departing passenger.</div></div>";
    b+="<div class=\"ogrid\"><div class=\"ocard\" onclick=\"selOpt(this,'p4')\"><div class=\"oname\">$4 per passenger</div><div class=\"ocost\">Aggressive</div><div class=\"odesc\">Maximum revenue. Airlines will push back hard.</div><div class=\"oeffect\">Needs sat 75+</div></div><div class=\"ocard\" onclick=\"selOpt(this,'p2')\"><div class=\"oname\">$2 per passenger</div><div class=\"ocost\">Moderate</div><div class=\"odesc\">Balanced opening rate.</div><div class=\"oeffect\">Needs sat 55+</div></div><div class=\"ocard\" onclick=\"selOpt(this,'p1')\"><div class=\"oname\">$1 per passenger</div><div class=\"ocost\">Conservative</div><div class=\"odesc\">Low rate, easy to approve. Sets the precedent.</div><div class=\"oeffect\">Needs sat 40+</div></div></div>";
  } else if(id==="paper"){
    title="Interview Request: Millbrook Gazette";
    b="<div class=\"ctx-box\" style=\"color:#ccc;font-size:11px;line-height:1.8\">Good afternoon. Carol Briggs from the Gazette. We are doing a profile on the airport for our Sunday Business section. Would you be available?</div>";
    b+="<div class=\"ogrid\"><div class=\"ocard\" onclick=\"selOpt(this,'full')\"><div class=\"oname\">Full Feature</div><div class=\"ocost\">45-minute interview</div><div class=\"odesc\">Front-page profile. Significant exposure and passenger demand boost.</div><div class=\"oeffect\">+Sat 6, +$500</div></div><div class=\"ocard\" onclick=\"selOpt(this,'brief')\"><div class=\"oname\">Brief Comment</div><div class=\"ocost\">5-minute quote</div><div class=\"odesc\">A quick comment for the article. Modest benefit.</div><div class=\"oeffect\">+Sat 3, +$200</div></div><div class=\"ocard\" onclick=\"selOpt(this,'no')\"><div class=\"oname\">Decline</div><div class=\"ocost\">No comment</div><div class=\"odesc\">Skip the interview.</div><div class=\"oeffect\">No effect</div></div></div>";
  } else if(id==="bank"){
    var m3=calcM();
    title="First National Bank: Rate Review";
    b="<div class=\"ctx-box\"><div><span class=\"key\">Current rate: </span><span class=\"val\">"+Math.round(S.loanRate*100)+"%</span></div><div><span class=\"key\">Credit: </span><span class=\"val\">"+m3.cr+"</span></div><div><span class=\"key\">Balance: </span><span class=\"val\">"+fmt(S.loan)+"</span></div></div>";
    b+="<div class=\"ogrid\">";
    if(m3.cr==="A") b+="<div class=\"ocard\" onclick=\"selOpt(this,'rb')\"><div class=\"oname\">Push for Best Rate</div><div class=\"ocost\">8.5% annual</div><div class=\"oeffect\">70% success</div></div>";
    b+="<div class=\"ocard\" onclick=\"selOpt(this,'rg')\"><div class=\"oname\">Ask for Good Rate</div><div class=\"ocost\">10% annual</div><div class=\"oeffect\">85% success</div></div>";
    b+="<div class=\"ocard\" onclick=\"selOpt(this,'rs')\"><div class=\"oname\">Safe Ask</div><div class=\"ocost\">11% annual</div><div class=\"oeffect\">95% success</div></div></div>";
  } else if(id==="hank"){
    title="Renegotiate: Hot Dog Hanks";
    var curCut=S.hankNego===0?30:S.hankNego===1?40:45;
    b="<div class=\"ctx-box\"><div><span class=\"key\">Current airport cut: </span><span class=\"val\">"+curCut+"%</span></div><div style=\"color:#888;font-size:10px;margin-top:4px\">Push too hard and Hank may walk.</div></div>";
    b+="<div class=\"ogrid\"><div class=\"ocard\" onclick=\"selOpt(this,'hh')\"><div class=\"oname\">Push Hard</div><div class=\"ocost\">45% our cut</div><div class=\"odesc\">25% chance Hank walks entirely.</div><div class=\"oeffect\">High risk</div></div><div class=\"ocard\" onclick=\"selOpt(this,'hm')\"><div class=\"oname\">Firm Ask</div><div class=\"ocost\">40% our cut</div><div class=\"odesc\">Reasonable push. Low risk.</div><div class=\"oeffect\">8% risk</div></div><div class=\"ocard\" onclick=\"selOpt(this,'hs')\"><div class=\"oname\">Small Ask</div><div class=\"ocost\">35% our cut</div><div class=\"odesc\">Easy win. No risk.</div><div class=\"oeffect\">No risk</div></div></div>";
  } else if(id==="me"){
    title="New Airline Interest: Midwest Express";
    b="<div class=\"ctx-box\" style=\"color:#ccc;font-size:11px;line-height:1.8\">Midwest Express serves 12 Midwest cities and wants to add Millbrook as a hub connection.</div>";
    b+="<div class=\"ogrid\"><div class=\"ocard\" onclick=\"selOpt(this,'mep')\"><div class=\"oname\">Premium Deal</div><div class=\"ocost\">$175/flt + $2/pax</div><div class=\"otime\">Indianapolis 3x Shorts + Evansville 1x Metro</div><div class=\"odesc\">Top dollar. Requires 2 gates and delay under 15%.</div></div><div class=\"ocard\" onclick=\"selOpt(this,'mes')\"><div class=\"oname\">Standard Deal</div><div class=\"ocost\">$120/flt + $1/pax</div><div class=\"otime\">Fort Wayne 2x Metro + South Bend 1x Beech99</div><div class=\"odesc\">Fair terms. Manageable for current infrastructure.</div><span class=\"obadge bf\">Recommended</span></div><div class=\"ocard\" onclick=\"selOpt(this,'meb')\"><div class=\"oname\">Budget Deal</div><div class=\"ocost\">$90/flt, no PFC</div><div class=\"otime\">Rockford 2x Beech99</div><div class=\"odesc\">Low revenue, minimal infrastructure demand.</div></div></div>";
  } else if(id==="council"){
    title="City Council Meeting";
    var lb=S.lobbyTier>=1?" (Lobbyist will assist)":"";
    b="<div class=\"ctx-box\" style=\"color:#ccc;font-size:11px;line-height:1.8\">Agenda: noise ordinance review, runway expansion zoning, and community liaison request."+lb+"</div>";
    b+="<div class=\"ogrid\"><div class=\"ocard\" onclick=\"selOpt(this,'ca')\"><div class=\"oname\">Attend in Person</div><div class=\"ocost\">$500 expenses</div><div class=\"odesc\">Full engagement. Builds political goodwill.</div><div class=\"oeffect\">"+(S.lobbyTier>=1?"+Sat 5, strong noise protection":"+Sat 3, reduces noise risk")+"</div></div><div class=\"ocard\" onclick=\"selOpt(this,'cr')\"><div class=\"oname\">Send a Representative</div><div class=\"ocost\">$200</div><div class=\"odesc\">Covers the bases without your direct time.</div><div class=\"oeffect\">"+(S.lobbyTier>=1?"+Sat 2":"+Sat 1")+"</div></div><div class=\"ocard\" onclick=\"selOpt(this,'cs')\"><div class=\"oname\">Skip</div><div class=\"ocost\">No cost</div><div class=\"odesc\">Risk of appearing indifferent.</div><div class=\"oeffect\">Noise fine risk up</div></div></div>";
  } else if(id==="chamber"){
    title="Chamber of Commerce Luncheon";
    b="<div class=\"ctx-box\" style=\"color:#ccc;font-size:11px;line-height:1.8\">The Millbrook Chamber wants you to speak for 20 minutes on the airport economic impact.</div>";
    b+="<div class=\"ogrid\"><div class=\"ocard\" onclick=\"selOpt(this,'cy')\"><div class=\"oname\">Accept and Speak</div><div class=\"ocost\">2 hours</div><div class=\"odesc\">Community visibility, positive coverage.</div><div class=\"oeffect\">+Sat 4, +$300</div></div><div class=\"ocard\" onclick=\"selOpt(this,'cn')\"><div class=\"oname\">Decline Politely</div><div class=\"ocost\">No cost</div><div class=\"odesc\">Send a written statement instead.</div><div class=\"oeffect\">No effect</div></div></div>";
  } else if(id==="state_grant"){
    title="State Infrastructure Grant";
    b="<div class=\"ctx-box\" style=\"color:#ccc;font-size:11px;line-height:1.8\">IDOT has identified Millbrook Regional as a candidate for the Illinois Aviation Infrastructure Fund. Your regional lobbying firm has prepared the application.</div>";
    b+="<div class=\"ogrid\"><div class=\"ocard\" onclick=\"selOpt(this,'sg_full')\"><div class=\"oname\">Full Application</div><div class=\"ocost\">$2,000 filing fee</div><div class=\"odesc\">Potential $40,000-80,000 award.</div><div class=\"oeffect\">75% success with tier 2 lobbyist</div></div><div class=\"ocard\" onclick=\"selOpt(this,'sg_skip')\"><div class=\"oname\">Skip This Cycle</div><div class=\"ocost\">No cost</div><div class=\"odesc\">Wait for next grant cycle.</div><div class=\"oeffect\">No effect</div></div></div>";
  } else if(id==="fed_grant"){
    title="Federal Aviation Grant";
    b="<div class=\"ctx-box\" style=\"color:#ccc;font-size:11px;line-height:1.8\">Your Washington firm has secured a hearing with the FAA Small Airport Development Program.</div>";
    b+="<div class=\"ogrid\"><div class=\"ocard\" onclick=\"selOpt(this,'fg_full')\"><div class=\"oname\">Full Application</div><div class=\"ocost\">$5,000 filing fee</div><div class=\"odesc\">Potential $100,000-200,000 federal award.</div><div class=\"oeffect\">65% success with tier 3 lobbyist</div></div><div class=\"ocard\" onclick=\"selOpt(this,'fg_skip')\"><div class=\"oname\">Skip</div><div class=\"ocost\">No cost</div><div class=\"odesc\">Opportunity passes.</div><div class=\"oeffect\">No effect</div></div></div>";
  } else if(id==="zoning"){
    title="Zoning Fast-Track";
    b="<div class=\"ctx-box\" style=\"color:#ccc;font-size:11px;line-height:1.8\">Your regional government affairs firm can expedite zoning approval for your next major construction project, cutting 12 days off the build time.</div>";
    b+="<div class=\"ogrid\"><div class=\"ocard\" onclick=\"selOpt(this,'zone_yes')\"><div class=\"oname\">Activate Fast-Track</div><div class=\"ocost\">$3,000 one-time</div><div class=\"odesc\">Next construction project gets -12 days build time.</div><div class=\"oeffect\">Applied to next project started</div></div><div class=\"ocard\" onclick=\"selOpt(this,'zone_no')\"><div class=\"oname\">No Thanks</div><div class=\"ocost\">No cost</div><div class=\"odesc\">Normal zoning timeline applies.</div><div class=\"oeffect\">No effect</div></div></div>";
  }

  document.getElementById("modal-title").textContent=title;
  document.getElementById("modal-body").innerHTML=b;
  document.getElementById("modal-confirm").textContent="Confirm";
  document.getElementById("modal-confirm").style.display="inline-block";
  document.getElementById("modal").style.display="flex";
}

function resolveAlert(id,opt){
  var ok=false,txt="",eff="";
  if(id==="pfc"){
    var rmap={p4:4,p2:2,p1:1},tmap={p4:75,p2:55,p1:40};
    var r=rmap[opt],thr=tmap[opt]; ok=S.sat>=thr;
    if(ok){S.pfcRate=r;txt="PFC of $"+r+"/pax established.";eff="Est. daily PFC: ~"+fmt(calcM().pax*r)+".";addFeed("NEGO","tag-nego","PFC $"+r+"/pax approved.");}
    else{var sh=opt==="p4"?10:opt==="p2"?6:3;S.sat=Math.max(0,S.sat-sh);txt="Airlines refused.";eff="No PFC established. Sat -"+sh+".";}
  } else if(id==="paper"){
    ok=true;
    if(opt==="full"){S.sat=Math.min(100,S.sat+6);S.cash+=500;txt="Full front-page feature!";eff="Sat +6. Pax demand up. +$500.";addFeed("NEWS","tag-news","GAZETTE: Millbrook Regional named top regional airport.");}
    else if(opt==="brief"){S.sat=Math.min(100,S.sat+3);S.cash+=200;txt="Short quote in the business section.";eff="Sat +3. +$200.";}
    else{txt="Declined the interview.";eff="No effect.";}
  } else if(id==="bank"){
    var tgt={rb:0.085,rg:0.10,rs:0.11}[opt],ch={rb:0.70,rg:0.85,rs:0.95}[opt];
    ok=Math.random()<ch;
    if(ok){S.loanRate=tgt;txt="Rate reduced to "+Math.round(tgt*100)+"%.";eff="Saves ~"+fmt((0.12-tgt)*S.loan/365)+"/day in interest.";addFeed("NEGO","tag-nego","Loan rate to "+Math.round(tgt*100)+"%.");}
    else{txt="Bank declined.";eff="Rate stays at "+Math.round(S.loanRate*100)+"%.";}
  } else if(id==="hank"){
    var wk={hh:0.25,hm:0.08,hs:0}[opt],nc={hh:45,hm:40,hs:35}[opt];
    if(Math.random()<wk){S.fac.snack=false;S.concSpend=Math.max(0,S.concSpend-1.2);ok=false;txt="Hot Dog Hanks walked away.";eff="Stand closed. Lost $1.20/pax revenue.";addFeed("NEGO","tag-nego","Hanks stand closed.");}
    else{var old=S.hankNego===0?30:S.hankNego===1?40:45;if(nc>old){var d=1.2*(nc-old)/30;S.concSpend+=d;S.hankNego=nc>=45?2:1;eff="Airport cut now "+nc+"%. Revenue +"+fmt(d)+"/pax.";}else{eff="Terms unchanged.";}ok=true;txt="Agreed to "+nc+"% airport cut.";}
  } else if(id==="me"){
    var deals={mep:{routes:[{cid:"indianapolis",freq:3,ac:"shorts330"},{cid:"evansville",freq:1,ac:"metro"}],fee:175,pfc:2,gates:2,maxDelay:15},mes:{routes:[{cid:"fort_wayne",freq:2,ac:"metro"},{cid:"south_bend",freq:1,ac:"beech99"}],fee:120,pfc:1,gates:1,maxDelay:999},meb:{routes:[{cid:"rockford",freq:2,ac:"beech99"}],fee:90,pfc:0,gates:1,maxDelay:999}};
    var deal=deals[opt],m4=calcM();
    if(S.gateCap<deal.gates||m4.delay>deal.maxDelay){txt="Midwest Express rejected this deal.";eff="Requirements not met. Gates: "+deal.gates+". Max delay: "+deal.maxDelay+"%.";ok=false;}
    else{var cities2=[];for(var i=0;i<deal.routes.length;i++){var dr=deal.routes[i],ct=city(dr.cid);S.routes.push({id:newRid(),airline:"Midwest Express",cityId:dr.cid,freq:dr.freq,aircraft:dr.ac,active:true,meFee:deal.fee,mePfc:deal.pfc});if(ct) cities2.push(ct.name);}ok=true;txt="Deal signed with Midwest Express!";eff="Routes: "+cities2.join(", ")+". Starting service immediately.";addFeed("AIRLINE","tag-airline","Midwest Express begins service at Millbrook! Routes: "+cities2.join(", ")+".");}
  } else if(id==="council"){
    ok=true;var sb=S.lobbyTier>=1?2:0;
    if(opt==="ca"){S.sat=Math.min(100,S.sat+3+sb);S.cash-=500;txt="Attendance well received.";eff="Sat +"+(3+sb)+". $500 expenses. Noise risk reduced.";S.alertCD["noiseprot"]=S.day+80;}
    else if(opt==="cr"){S.sat=Math.min(100,S.sat+1+sb);S.cash-=200;txt="Representative covered the meeting.";eff="Sat +"+(1+sb)+". $200 expenses.";}
    else{txt="Skipped the meeting.";eff="Council noted your absence.";}
  } else if(id==="chamber"){
    ok=true;
    if(opt==="cy"){S.sat=Math.min(100,S.sat+4);S.cash+=300;txt="Speech was well received.";eff="Sat +4. +$300.";addFeed("NEWS","tag-news","CEO speaks at Chamber luncheon. Airport praised.");}
    else{txt="Sent a written statement.";eff="No effect.";}
  } else if(id==="state_grant"){
    if(opt==="sg_full"){if(S.cash<2000){txt="Not enough cash.";eff="Need $2,000 to apply.";ok=false;}else{S.cash-=2000;var ch=S.lobbyTier>=2?0.75:0.30;ok=Math.random()<ch;if(ok){var aw=40000+Math.floor(Math.random()*40000);S.cash+=aw;txt="State grant awarded!";eff="Illinois Aviation Infrastructure Fund: +"+fmt(aw)+".";addFeed("NEWS","tag-news","STATE GRANT: Millbrook receives "+fmt(aw)+".");}else{txt="Grant not selected this cycle.";eff="$2,000 filing fee spent.";}}}
    else{txt="Passed on this grant cycle.";eff="No effect.";ok=true;}
  } else if(id==="fed_grant"){
    if(opt==="fg_full"){if(S.cash<5000){txt="Not enough cash.";eff="Need $5,000 to apply.";ok=false;}else{S.cash-=5000;var ch=S.lobbyTier>=3?0.65:0.15;ok=Math.random()<ch;if(ok){var aw=100000+Math.floor(Math.random()*100000);S.cash+=aw;txt="Federal aviation grant awarded!";eff="FAA Small Airport Development: +"+fmt(aw)+".";addFeed("NEWS","tag-news","FEDERAL GRANT: Millbrook receives "+fmt(aw)+"!");}else{txt="Federal application not selected.";eff="$5,000 filing fee spent.";}}}
    else{txt="Passed on this federal opportunity.";eff="No effect.";ok=true;}
  } else if(id==="zoning"){
    if(opt==="zone_yes"){if(S.cash<3000){txt="Not enough cash.";eff="Need $3,000.";ok=false;}else{S.cash-=3000;S.alertCD["zoning_active"]=S.day;ok=true;txt="Zoning fast-track activated.";eff="Next construction project started gets -12 days build time.";}}
    else{txt="Declined the fast-track.";eff="No effect.";ok=true;}
  }
  return{ok:ok,txt:txt,eff:eff};
}

function openBankNego(){if(S.loan<=0){addFeed("WARN","tag-warn","No outstanding loan to renegotiate.");return;}openAlert("bank");}

// ── STANDARD MODALS ───────────────────────────────────────────────────────
function getParkOpts(){
  var opts=[];
  if(S.parkCap<280) opts.push({id:"dirt",name:"Gravel Lot",cost:9000,days:18,cap:40,sat:0,desc:"Basic gravel. Cheapest option.",badge:"",bcls:"br"});
  opts.push({id:"paved",name:"Paved Lot",cost:28000,days:35,cap:90,sat:2,desc:"Asphalt with lines and lighting.",badge:"+Sat 2",bcls:"bq"});
  if(S.parkCap>=100) opts.push({id:"premium",name:"Premium Lot",cost:52000,days:55,cap:150,sat:5,desc:"Paved, lit, covered walkway.",badge:"+Sat 5",bcls:"bq"});
  if(S.day>=60&&totalFlights()>=8) opts.push({id:"structure",name:"Parking Structure",cost:180000,days:150,cap:400,sat:8,desc:"Multi-level. Massive capacity.",badge:"+Sat 8",bcls:"bq"});
  if(S.day>=90&&totalFlights()>=10&&!S.fac.valet) opts.push({id:"valet",name:"Valet Service",cost:22000,days:12,cap:0,sat:6,desc:"Passengers love it. +$1.50/pax.",badge:"+$1.50/pax",bcls:"bf"});
  return opts;
}
function getConcOpts(){
  var opts=[];
  if(!S.fac.vending) opts.push({id:"vending",name:"Vending Machines",cost:6000,free:false,days:5,spend:0.5,sat:0,fkey:"vending",nm:"Vending Machines",badge:"+$0.50/pax",bcls:"bf"});
  if(!S.fac.snack) opts.push({id:"snack",name:"Hot Dog Hanks",cost:0,free:true,days:8,spend:1.2,sat:0,fkey:"snack",nm:"Hot Dog Hanks",badge:"+$1.20/pax",bcls:"br"});
  if(!S.fac.newsstand&&S.day>=15) opts.push({id:"newsstand",name:"Newsstand",cost:10000,free:false,days:10,spend:0.8,sat:1,fkey:"newsstand",nm:"Newsstand",badge:"+$0.80/pax",bcls:"bf"});
  if(!S.fac.coffee) opts.push({id:"coffee",name:"Coffee Counter",cost:18000,free:false,days:18,spend:1.1,sat:4,fkey:"coffee",nm:"Coffee Counter",badge:"+$1.10/pax",bcls:"bq"});
  if(!S.fac.giftshop&&(S.day>=45||totalFlights()>=8)) opts.push({id:"giftshop",name:"Gift & Apparel Shop",cost:35000,free:false,days:30,spend:1.5,sat:3,fkey:"giftshop",nm:"Gift Shop",badge:"+$1.50/pax",bcls:"bq"});
  if(!S.fac.restaurant&&S.day>=90&&totalFlights()>=10) opts.push({id:"restaurant",name:"Sit-Down Restaurant",cost:85000,free:false,days:60,spend:3.0,sat:7,fkey:"restaurant",nm:"Restaurant",badge:"+$3.00/pax",bcls:"bq"});
  return opts;
}
function getTransportOpts(){
  var m=calcM(),tf=m.tf,rx=m.rawPax;
  var opts=[];
  if(!S.fac.transportCurbside&&S.day>=12){
    opts.push({id:"curbside",name:"Curbside Taxi & Shuttle Program",cost:11500,days:22,desc:"Licensed taxi stand, hotel shuttles, and marked passenger pickup. Fees + less curb chaos.",effect:"+$0.36/pax · eases parking pressure · −delay",badge:"Starter",bcls:"bf"});
  }
  if(!S.fac.transportVans&&S.fac.transportCurbside&&(rx>=78||tf>=6)){
    opts.push({id:"vans",name:"Regional Van & Charter Bus Plaza",cost:38000,days:52,desc:"Airporter vans, charter bus bays, and group travel pad. Offloads cars on busy days.",effect:"+$0.50/pax · stronger parking relief",badge:"Growing",bcls:"bq"});
  }
  if(!S.fac.transportLimo&&S.fac.transportVans&&S.sat>=50){
    opts.push({id:"limo",name:"Limo & Car Service Center",cost:29500,days:34,desc:"Dedicated limo rank, town cars, and premium pickup lounge.",effect:"+$0.32/pax · small delay help · +sat when built",badge:"Premium",bcls:"bq"});
  }
  if(!S.fac.transportRail&&rx>=200&&tf>=10){
    opts.push({id:"rail",name:"Regional Rail Intermodal Center",cost:268000,days:198,desc:"Trackside platform, shuttle bridge to terminal, Amtrak & commuter tie-in. Major hub upgrade.",effect:"+$0.78/pax + $4,200/day · large parking relief · −delay",badge:"Large airport",bcls:"br"});
  }
  return opts;
}
function getFacOpts(){
  var opts=[];
  if(!S.fac.security)  opts.push({id:"security",name:"Security Upgrade",cost:25000,days:25,desc:"Modern screening. Reduces checkpoint congestion.",effect:"-5% delay"});
  if(!S.fac.bathrooms) opts.push({id:"bathrooms",name:"Bathroom Renovation",cost:8000,days:14,desc:"Clean restrooms. Passengers always notice.",effect:"+Sat 4"});
  if(S.fac.bathrooms&&!S.fac.newbaths&&S.day>=60) opts.push({id:"newbaths",name:"New Bathroom Wing",cost:35000,days:50,desc:"More capacity for high-volume days.",effect:"+Sat 6"});
  if(!S.fac.pa) opts.push({id:"pa",name:"PA System",cost:12000,days:10,desc:"Informed passengers stay calmer. Softens sat loss from delays 35%.",effect:"Reduces delay sat damage"});
  if(!S.fac.baggage) opts.push({id:"baggage",name:"Baggage Carousel",cost:40000,days:40,desc:"Automated handling. Fewer lost bags, faster turns.",effect:"-3% delay"});
  if(!S.fac.ticketing&&S.day>=30) opts.push({id:"ticketing",name:"Self-Check Kiosks",cost:20000,days:18,desc:"Automated check-in throughout terminal.",effect:"-4% delay, +Sat 2"});
  return opts;
}

function openModal(type){
  MS.type=type; MS.opt=""; MS.co=""; MS.negoStep=""; MS.nd={};
  var titles={parking:"Add Parking Lot",gate:"Add Gate / Boarding Area",concessions:"Add Concessions",facilities:"Airport Facilities",transport:"Ground Transport & Access",staff:"Hire Ground Staff","parking-price":"Set Parking Price",lobbyist:"Political Lobbyist"};
  document.getElementById("modal-title").textContent=titles[type]||type;
  document.getElementById("modal-confirm").textContent="Confirm";
  document.getElementById("modal-confirm").style.display="inline-block";
  var b="";
  if(type==="parking"){
    var opts=getParkOpts();
    b="<p style=\"color:#888;font-size:11px;margin-bottom:10px\">Choose a lot type to get started.</p><div class=\"ogrid\">";
    for(var i=0;i<opts.length;i++){var o=opts[i];b+="<div class=\"ocard\" onclick=\"selOpt(this,'"+o.id+"')\"><div class=\"oname\">"+o.name+"</div><div class=\"ocost\">"+fmt(o.cost)+"</div><div class=\"otime\">~"+o.days+" days</div><div class=\"odesc\">"+o.desc+"</div>"+(o.badge?"<span class=\"obadge "+o.bcls+"\">"+o.badge+"</span>":"")+"</div>";}
    b+="</div>";
    document.getElementById("modal-confirm").textContent="Select Project";
  } else if(type==="gate"){
    b="<p style=\"color:#888;font-size:11px;margin-bottom:10px\">More gate capacity means more passengers per flight. Jet service requires 2+ gates.</p><div class=\"ogrid\">";
    b+="<div class=\"ocard\" onclick=\"selOpt(this,'basic')\"><div class=\"oname\">Gate Renovation</div><div class=\"ocost\">$22,000</div><div class=\"otime\">~35 days</div><div class=\"odesc\">Refurbish existing area. +1 gate.</div><span class=\"obadge bf\">Low disruption</span></div>";
    b+="<div class=\"ocard\" onclick=\"selOpt(this,'full')\"><div class=\"oname\">Full Gate Addition</div><div class=\"ocost\">$55,000</div><div class=\"otime\">~75 days</div><div class=\"odesc\">New gate with waiting area. +1 gate.</div><span class=\"obadge bq\">+Sat 6</span></div>";
    b+="<div class=\"ocard\" onclick=\"selOpt(this,'terminal')\"><div class=\"oname\">Terminal Wing</div><div class=\"ocost\">$110,000</div><div class=\"otime\">~150 days</div><div class=\"odesc\">Major expansion. Two new gate areas. +2 gates.</div><span class=\"obadge bq\">+Sat 8</span></div>";
    b+="</div>";
    document.getElementById("modal-confirm").textContent="Select Project";
  } else if(type==="concessions"){
    var opts=getConcOpts();
    if(!opts.length){b="<p style=\"color:#888;font-size:12px;line-height:1.7\">No new options available. Newsstand unlocks Day 15, Gift Shop Day 45, Restaurant Day 90 + 10 flights.</p>";document.getElementById("modal-confirm").style.display="none";}
    else{b="<p style=\"color:#888;font-size:11px;margin-bottom:10px\">Each concession adds revenue per passenger.</p><div class=\"ogrid\">";for(var i=0;i<opts.length;i++){var o=opts[i];b+="<div class=\"ocard\" onclick=\"selOpt(this,'"+o.id+"')\"><div class=\"oname\">"+o.name+"</div><div class=\"ocost\">"+(o.free?"No upfront cost":fmt(o.cost))+"</div><div class=\"otime\">~"+o.days+" days setup</div><div class=\"odesc\">"+o.desc+"</div><span class=\"obadge "+o.bcls+"\">"+o.badge+"</span></div>";}b+="</div>";document.getElementById("modal-confirm").textContent="Select Project";}
  } else if(type==="facilities"){
    var opts=getFacOpts();
    if(!opts.length){b="<p style=\"color:#888;font-size:12px;line-height:1.7\">All available facilities are built.</p>";document.getElementById("modal-confirm").style.display="none";}
    else{b="<p style=\"color:#888;font-size:11px;margin-bottom:10px\">Upgrades improve passenger experience, reduce delays, and boost satisfaction.</p><div class=\"ogrid\">";for(var i=0;i<opts.length;i++){var o=opts[i];b+="<div class=\"ocard\" onclick=\"selOpt(this,'"+o.id+"')\"><div class=\"oname\">"+o.name+"</div><div class=\"ocost\">"+fmt(o.cost)+"</div><div class=\"otime\">~"+o.days+" days</div><div class=\"odesc\">"+o.desc+"</div><div class=\"oeffect\">"+o.effect+"</div></div>";}b+="</div>";document.getElementById("modal-confirm").textContent="Select Project";}
  } else if(type==="transport"){
    var tops=getTransportOpts();
    b="<p style=\"color:#888;font-size:11px;margin-bottom:10px;line-height:1.5\">One program at a time. <strong>Curbside</strong> unlocks first. <strong>Vans & buses</strong> need volume. <strong>Limo center</strong> needs goodwill. <strong>Rail intermodal</strong> only at <strong>200+ daily passengers and 10+ flights</strong> (medium hub scale).</p>";
    if(!tops.length){b+="<p style=\"color:#888;font-size:12px;line-height:1.7\">Nothing available right now — grow traffic, improve satisfaction, or complete earlier transport tiers.</p>";document.getElementById("modal-confirm").style.display="none";}
    else{b+="<div class=\"ogrid\">";for(var ti=0;ti<tops.length;ti++){var t=tops[ti];b+="<div class=\"ocard\" onclick=\"selOpt(this,'"+t.id+"')\"><div class=\"oname\">"+t.name+"</div><div class=\"ocost\">"+fmt(t.cost)+"</div><div class=\"otime\">~"+t.days+" days</div><div class=\"odesc\">"+t.desc+"</div><div class=\"oeffect\">"+t.effect+"</div><span class=\"obadge "+t.bcls+"\">"+t.badge+"</span></div>";}b+="</div>";document.getElementById("modal-confirm").textContent="Select Project";}
  } else if(type==="staff"){
    var tf=totalFlights(),ratio=(S.staff/Math.max(1,tf)).toFixed(2),ok=S.staff/tf>=0.5;
    b="<div class=\"statbox\"><div><span class=\"key\">Current staff: </span><span class=\"val\">"+S.staff+"</span></div><div><span class=\"key\">Total flights/day: </span><span class=\"val\">"+tf+"</span></div><div><span class=\"key\">Ratio: </span><span class=\"val\" style=\"color:"+(ok?"#2ecc71":"#e74c3c")+"\">"+ratio+" - "+(ok?"Adequate":"Understaffed")+"</span></div><div><span class=\"key\">Recommended min: </span><span class=\"val\">"+Math.ceil(tf*0.5)+"</span></div></div>";
    b+="<div class=\"ogrid\"><div class=\"ocard\" onclick=\"selOpt(this,'one')\"><div class=\"oname\">Hire 1 Worker</div><div class=\"ocost\">$3,000 upfront</div><div class=\"otime\">$80/day ongoing</div><div class=\"odesc\">Small adjustment.</div></div><div class=\"ocard\" onclick=\"selOpt(this,'two')\"><div class=\"oname\">Hire 2 Workers</div><div class=\"ocost\">$6,000 upfront</div><div class=\"otime\">$160/day ongoing</div><div class=\"odesc\">Quick coverage bump.</div><span class=\"obadge bf\">Popular</span></div><div class=\"ocard\" onclick=\"selOpt(this,'crew')\"><div class=\"oname\">Full Crew (4)</div><div class=\"ocost\">$11,000 upfront</div><div class=\"otime\">$320/day ongoing</div><div class=\"odesc\">Eliminates most delay risk immediately.</div><span class=\"obadge bq\">Best delay fix</span></div></div>";
  } else if(type==="parking-price"){
    var s2=S.parkPrice===2?" sel":"",s4=S.parkPrice===4?" sel":"",s7=S.parkPrice===7?" sel":"";
    b="<p style=\"color:#888;font-size:11px;margin-bottom:10px\">Higher prices earn more per car but reduce demand when parking is tight.</p><div class=\"ogrid\"><div class=\"ocard"+s2+"\" onclick=\"selOpt(this,'low')\"><div class=\"oname\">Low - $2/day</div><div class=\"odesc\">Max drivers. Best when parking is a bottleneck.</div></div><div class=\"ocard"+s4+"\" onclick=\"selOpt(this,'normal')\"><div class=\"oname\">Normal - $4/day</div><div class=\"odesc\">Balanced pricing.</div><span class=\"obadge bf\">Default</span></div><div class=\"ocard"+s7+"\" onclick=\"selOpt(this,'high')\"><div class=\"oname\">High - $7/day</div><div class=\"odesc\">Max revenue. Risk of complaints when full.</div></div></div>";
  } else if(type==="lobbyist"){
    var cur=S.lobbyTier>0?LOBBYISTS[S.lobbyTier]:null;
    b="<div class=\"ctx-box\">";
    if(cur){b+="<div><span class=\"key\">Current: </span><span class=\"val\">"+cur.name+" <span class=\"lbadge "+cur.badge+"\">Tier "+cur.tier+"</span></span></div><div><span class=\"key\">Daily retainer: </span><span class=\"val\">"+fmt(cur.cpd)+"/day</span></div><div style=\"color:#888;font-size:10px;margin-top:4px\">"+cur.note+"</div>";}
    else{b+="<div><span class=\"key\">Current: </span><span class=\"val\">No lobbyist retained</span></div><div style=\"color:#888;font-size:10px;margin-top:4px\">A political lobbyist opens doors that money alone cannot. Unlocks grant eligibility, reduces regulatory friction, and improves standing with city and state government.</div>";}
    b+="</div><div class=\"ogrid\">";
    for(var i=1;i<=3;i++){
      var lb=LOBBYISTS[i],isCur=i===S.lobbyTier,bord=isCur?" style=\"border-color:#2ecc71\"":"";
      b+="<div class=\"ocard\" "+bord+" onclick=\""+(isCur?"":"selOpt(this,'t"+i+"')")+"\">";
      b+="<div class=\"oname\">"+lb.name+" <span class=\"lbadge "+lb.badge+"\">Tier "+i+"</span></div>";
      b+="<div class=\"ocost\">"+(isCur?"Currently retained":fmt(lb.upfront)+" upfront")+"</div>";
      b+="<div class=\"otime\">"+fmt(lb.cpd)+"/day retainer</div>";
      b+="<div class=\"odesc\">"+lb.note+"</div>";
      if(isCur) b+="<span class=\"obadge bq\">Active</span>";
      if(!isCur&&i>S.lobbyTier&&i>1) b+="<span class=\"obadge bf\">Upgrade</span>";
      b+="</div>";
    }
    b+="</div>";
    if(S.lobbyTier>0) b+="<div class=\"ogrid\" style=\"margin-top:8px\"><div class=\"ocard\" onclick=\"selOpt(this,'fire')\" style=\"border-color:#333\"><div class=\"oname\" style=\"color:#666\">Release Lobbyist</div><div class=\"odesc\" style=\"color:#555\">Terminate the current retainer. Lose all lobbying benefits.</div></div></div>";
  }
  document.getElementById("modal-body").innerHTML=b;
  document.getElementById("modal").style.display="flex";
}

function closeModal(){document.getElementById("modal").style.display="none";MS.type="";MS.opt="";MS.co="";MS.negoStep="";MS.nd={};}

function confirmModal(){
  if(MS.nd&&MS.nd.bldPhase){handleBuildStep();return;}
  if(MS.type==="ha"){handleHAStep();return;}
  if(MS.type==="build_event"){
    if(MS.nd.phase===0){resolveBuildEvent();}
    else{closeModal();}
    return;
  }
  if(MS.type==="ha_alert"){
    if(MS.nd.phase===0){
      if(!MS.opt){alert("Select an option.");return;}
      resolveHAAlert();
    } else {closeModal();}
    return;
  }
  if(MS.type==="alert"){
    if(MS.nd.phase===0){
      if(!MS.opt){alert("Select an option.");return;}
      var res=resolveAlert(MS.alertId,MS.opt);
      document.getElementById("modal-body").innerHTML=resultHtml(res.ok,res.txt,res.eff);
      document.getElementById("modal-confirm").textContent="Close";
      MS.nd.phase=1; dismissAlert(MS.alertId); updateUI(calcM());
    } else {closeModal();}
    return;
  }

  var type=MS.type,opt=MS.opt;

  if(type==="parking"||type==="gate"||type==="concessions"||type==="facilities"||type==="transport"){
    if(!opt){alert("Select an option.");return;}
    var projNames={parking:{dirt:"Gravel Lot",paved:"Paved Lot",premium:"Premium Lot",structure:"Parking Structure",valet:"Valet Service"},gate:{basic:"Gate Renovation",full:"Gate Addition",terminal:"Terminal Wing"},transport:{curbside:"Curbside Taxi & Shuttle Program",vans:"Regional Van & Charter Bus Plaza",limo:"Limo & Car Service Center",rail:"Regional Rail Intermodal Center"}};
    var baseCosts={parking:{dirt:9000,paved:28000,premium:52000,structure:180000,valet:22000},gate:{basic:22000,full:55000,terminal:110000},transport:{curbside:11500,vans:38000,limo:29500,rail:268000}};
    var baseDaysMap={parking:{dirt:18,paved:35,premium:55,structure:150,valet:12},gate:{basic:35,full:75,terminal:150},transport:{curbside:22,vans:52,limo:34,rail:198}};
    var projName,baseCost,baseDays;

    if(type==="parking"||type==="gate"||type==="transport"){
      projName=(projNames[type]||{})[opt]||opt;
      baseCost=(baseCosts[type]||{})[opt]||0;
      baseDays=(baseDaysMap[type]||{})[opt]||30;
    } else if(type==="concessions"){
      var copts=getConcOpts(),ch=null;
      for(var i=0;i<copts.length;i++){if(copts[i].id===opt){ch=copts[i];break;}}
      if(!ch){closeModal();return;}
      projName=ch.nm; baseCost=ch.free?0:ch.cost; baseDays=ch.days;
    } else if(type==="facilities"){
      var facMap={security:{cost:25000,days:25,nm:"Security Upgrade"},bathrooms:{cost:8000,days:14,nm:"Bathroom Renovation"},newbaths:{cost:35000,days:50,nm:"New Bathroom Wing"},pa:{cost:12000,days:10,nm:"PA System"},baggage:{cost:40000,days:40,nm:"Baggage Carousel"},ticketing:{cost:20000,days:18,nm:"Self-Check Kiosks"}};
      var fo=facMap[opt]; if(!fo){closeModal();return;}
      projName=fo.nm; baseCost=fo.cost; baseDays=fo.days;
    }

    var tier=getProjectTier(type,opt);

    if(tier===1){
      if(baseCost>0&&S.cash<baseCost){addFeed("WARN","tag-warn","Not enough cash.");closeModal();return;}
      if(baseCost>0) S.cash-=baseCost;
      startBuild(type,opt,projName,baseDays,baseCost,1.0,"");
      closeModal(); updateUI(calcM());
      return;
    }

    MS.nd={bldPhase:"contractor",bldType:type,bldOpt:opt,projName:projName,baseCost:baseCost,baseDays:baseDays,tier:tier};
    MS.nd.contractors=genContractors(baseCost,baseDays);
    MS.opt="";
    document.getElementById("modal-title").textContent=projName+" — Contractor Selection";
    renderBuildPhase();
    return;

  } else if(type==="staff"){
    if(!opt){alert("Select a hiring option.");return;}
    var sm={one:{cost:3000,n:1},two:{cost:6000,n:2},crew:{cost:11000,n:4}};
    var so=sm[opt];
    if(S.cash<so.cost){addFeed("WARN","tag-warn","Not enough cash.");closeModal();return;}
    S.cash-=so.cost; S.staff+=so.n;
    addFeed("WORKER","tag-worker","Hired "+so.n+" worker"+(so.n>1?"s":"")+". Total: "+S.staff+".");
  } else if(type==="parking-price"){
    if(!opt){alert("Select a price.");return;}
    S.parkPrice={low:2,normal:4,high:7}[opt];
    addFeed("NEWS","tag-news","Parking price set to $"+S.parkPrice+"/day.");
  } else if(type==="lobbyist"){
    if(!opt){alert("Select a lobbyist option.");return;}
    if(opt==="fire"){S.lobbyTier=0;S.lobbyistCpd=0;addFeed("NEWS","tag-news","Lobbyist retainer terminated.");}
    else{var tier=parseInt(opt.replace("t",""));var lb=LOBBYISTS[tier];if(tier<=S.lobbyTier){addFeed("WARN","tag-warn","Already at this tier or higher.");closeModal();return;}if(S.cash<lb.upfront){addFeed("WARN","tag-warn","Not enough cash for the upfront retainer fee.");closeModal();return;}S.cash-=lb.upfront;S.lobbyTier=tier;S.lobbyistCpd=lb.cpd;addFeed("NEWS","tag-news","Retained: "+lb.name+". Daily retainer: "+fmt(lb.cpd)+"/day.");}
  }
  closeModal(); updateUI(calcM());
}

// ── FINANCE ───────────────────────────────────────────────────────────────
function takeLoan(){if(S.loan>200000){addFeed("WARN","tag-warn","Credit limit reached.");return;}S.loan+=100000;S.cash+=100000;addFeed("NEWS","tag-news","$100,000 loan at "+Math.round(S.loanRate*100)+"% annual.");updateUI(calcM());}
function repayLoan(){if(S.loan<=0){addFeed("WARN","tag-warn","No outstanding loan.");return;}if(S.cash<10000){addFeed("WARN","tag-warn","Not enough cash.");return;}S.loan=Math.max(0,S.loan-10000);S.cash-=10000;addFeed("NEWS","tag-news","Loan payment made. Remaining: "+fmt(S.loan)+".");updateUI(calcM());}

// ── EVENTS ───────────────────────────────────────────────────────────────
var EVTS=[
  {id:"snow",  w:3,min:10,c:function(){return true;},             a:function(){S.evDelayBonus+=18;S.evDelayDays=3;},              msg:"Snowstorm hits Millbrook. Delays for 3 days.",             tag:"WEATHER",cls:"tag-warn"},
  {id:"fog",   w:4,min:5, c:function(){return true;},             a:function(){S.evDelayBonus+=10;S.evDelayDays=2;},              msg:"Dense fog grounds two flights. Delays 2 days.",           tag:"WEATHER",cls:"tag-warn"},
  {id:"runway",w:2,min:30,c:function(){return true;},             a:function(){S.cash-=8000;S.evDelayBonus+=12;S.evDelayDays=2;}, msg:"Runway crack found. Emergency repair: $8,000.",           tag:"OPS",    cls:"tag-warn"},
  {id:"equip", w:3,min:20,c:function(){return S.staff<4;},        a:function(){S.cash-=4500;},                                   msg:"Baggage belt failure. Repair: $4,500.",                   tag:"OPS",    cls:"tag-warn"},
  {id:"faa",   w:2,min:60,c:function(){return true;},
   a:function(){var ap=S.lobbyTier>=2;if(ap||S.staff>=4&&S.evDelayBonus===0){S.sat=Math.min(100,S.sat+8);S._faa="pass";}else{S.cash-=12000;S._faa="fail";}},
   mf:function(){return S._faa==="pass"?"FAA inspection passed. Sat +8.":"FAA deficiencies. Fine: $12,000.";},tag:"FAA",cls:"tag-news"},
  {id:"charter",w:5,min:15,c:function(){return S.parkCap>=40;},   a:function(){S._ca=1800+Math.floor(Math.random()*800);S.cash+=S._ca;},mf:function(){return "Charter flight booked! Bonus: "+fmt(S._ca)+".";},tag:"OPS",cls:"tag-airline"},
  {id:"surge", w:3,min:30,c:function(){return !S.surgeActive;},   a:function(){S.surgeDays=5;S.surgeActive=true;},                msg:"Travel demand spike. Pax up ~30% for 5 days.",            tag:"NEWS",   cls:"tag-news"},
  {id:"spill", w:1,min:45,c:function(){return true;},             a:function(){S.cash-=15000;S.evDelayBonus+=8;S.evDelayDays=1;},msg:"Fuel spill on ramp. EPA cleanup: $15,000.",               tag:"OPS",    cls:"tag-warn"},
  {id:"press", w:4,min:20,c:function(m){return m.delay<10&&S.sat>60;},a:function(){S.sat=Math.min(100,S.sat+5);},msg:"GAZETTE: Millbrook named friendliest regional airport.",tag:"NEWS",cls:"tag-news"},
  {id:"strike",w:2,min:50,c:function(){return S.staff>=4&&!S.strikeThreat;},a:function(){S.strikeThreat=true;},msg:"Ground crew threatening work slowdown over wages.",tag:"WORKER",cls:"tag-worker"},
  {id:"send",  w:10,min:55,c:function(){return S.strikeThreat;},
   a:function(){if(S.sat>=50&&S.evDelayBonus===0){S.strikeThreat=false;S._sr="ok";}else{var har=haRoutes();if(har.length&&har[har.length-1].freq>1)har[har.length-1].freq--;S.cash-=5000;S.strikeThreat=false;S._sr="bad";}},
   mf:function(){return S._sr==="ok"?"Worker dispute resolved.":"Slowdown: frequency cut, $5,000 penalty.";},tag:"WORKER",cls:"tag-worker"},
  {id:"vip",   w:2,min:40,c:function(){return S.concSpend>0;},    a:function(){S.sat=Math.min(100,S.sat+4);S.cash+=500;},         msg:"Senator visits. Sat +4, grant: $500.",                    tag:"NEWS",   cls:"tag-news"},
  {id:"overflow",w:5,min:10,c:function(m){return m.pu>=95;},      a:function(){S.sat=Math.max(0,S.sat-4);},                      msg:"Parking full. Access road blocked. Sat -4.",              tag:"PAX",    cls:"tag-pax"},
  {id:"luggage",w:3,min:15,c:function(){return S.staff<3;},       a:function(){S.cash-=1200;S.sat=Math.max(0,S.sat-3);},         msg:"Lost luggage claims: $1,200. Understaffed. Sat -3.",      tag:"PAX",    cls:"tag-pax"},
  {id:"habonus",w:2,min:60,c:function(m){return S.sat>=80&&m.delay<8;},
   a:function(){S.cash+=6000;var har=haRoutes();if(har.length){var b=har[0];for(var i=1;i<har.length;i++)if(har[i].freq>b.freq)b=har[i];if(b.freq<AC[b.aircraft].maxFreq)b.freq++;}},
   msg:"Heartland Air bonus: $6,000 and one extra daily flight!",tag:"AIRLINE",cls:"tag-airline"},
  {id:"rate",  w:1,min:120,c:function(){return S.loan>0;},        a:function(){S.loan=Math.round(S.loan*1.02);},                 msg:"Fed rate hike. Loan balance up 2%.",                      tag:"NEWS",   cls:"tag-news"},
  {id:"noise", w:3,min:25, c:function(){return totalFlights()>=8&&!(S.alertCD["noiseprot"]&&S.alertCD["noiseprot"]>S.day);},
   a:function(){var f=S.lobbyTier>=3?0:S.lobbyTier>=1?1000:2000;if(f>0)S.cash-=f;S._noiseFine=f;},
   mf:function(){return S._noiseFine>0?"Noise complaints. Council fine: "+fmt(S._noiseFine)+"."+(S.lobbyTier>=1?" (Reduced by lobbyist.)":""):"Noise complaint dismissed by lobbying firm.";},tag:"NEWS",cls:"tag-news"},
  {id:"quit",  w:2,min:35, c:function(){return S.staff>=4&&S.sat<45;},a:function(){S.staff=Math.max(2,S.staff-1);},              msg:"One crew member quit. Morale too low. Staff -1.",         tag:"WORKER", cls:"tag-worker"},
  {id:"holiday",w:3,min:45,c:function(){return !S.surgeActive;},  a:function(){S.surgeDays=3;S.surgeActive=true;S.cash+=1000;}, msg:"Holiday surge. Pax +30% for 3 days. Fee: +$1,000.",       tag:"NEWS",   cls:"tag-news"},
  {id:"rival", w:2,min:90, c:function(){return true;},            a:function(){S.sat=Math.max(0,S.sat-6);},                     msg:"Highway expansion rumors rattling Heartland Air. Sat -6.", tag:"NEWS",   cls:"tag-news"},
  {id:"earmark",w:1,min:150,c:function(){return S.lobbyTier>=3;},
   a:function(){var aw=50000+Math.floor(Math.random()*50000);S.cash+=aw;S._earmark=aw;},
   mf:function(){return "Congressional airport development earmark approved: +"+fmt(S._earmark||50000)+"!";},tag:"NEWS",cls:"tag-news"}
];
var CD={};
function rollEvent(m){
  var el=[];
  for(var i=0;i<EVTS.length;i++){var e=EVTS[i];if(S.day>=e.min&&e.c(m)&&(S.day-(CD[e.id]||0))>=20)el.push(e);}
  if(!el.length) return;
  var tot=0;for(var i=0;i<el.length;i++) tot+=el[i].w;
  var r=Math.random()*tot;
  for(var i=0;i<el.length;i++){r-=el[i].w;if(r<=0){CD[el[i].id]=S.day;el[i].a(m);addFeed(el[i].tag,el[i].cls,el[i].mf?el[i].mf():el[i].msg);return;}}
}

var PMSGS=["No parking - had to leave my car on the grass.","Vending machine ate my quarter.","Flight delayed 45 min, no announcement.","Parking prices keep going up.","Love small airports - in and out fast!","No coffee anywhere in this terminal."];
var WMSGS=["Ground crew: Short-handed at Gate 1 again.","Ramp: Need better winter gear.","Gate agent: Passengers keep asking about food options.","Maintenance: Heating is spotty in the west wing."];
var AMSGS=["Heartland Air: On-time performance acceptable this month.","Heartland Air: Load factors are improving steadily.","Heartland Air: Evaluating adding service on another route.","Heartland Air: Delay rates are a concern - please address."];

function maybeScheduled(m){
  if(S.day%14===0) addFeed("PAX","tag-pax",PMSGS[Math.floor(S.day/14)%PMSGS.length]);
  if(S.day%21===0) addFeed("WORKER","tag-worker",WMSGS[Math.floor(S.day/21)%WMSGS.length]);
  if(S.day%28===0) addFeed("AIRLINE","tag-airline",AMSGS[Math.floor(S.day/28)%AMSGS.length]);
  if(m.delay>30&&S.day%10===0) addFeed("WARN","tag-warn","Delay "+m.delay+"% - Heartland Air frustrated.");
  if(S.sat<35&&S.day%15===0) addFeed("WARN","tag-warn","Airline sat critical ("+Math.round(S.sat)+"). Risk losing service!");
  if(S.cash<20000&&S.day%10===0) addFeed("WARN","tag-warn","Cash low: "+fmt(S.cash)+".");
  // 30-day performance watch check
  if(S.alertCD["ha_watch"]&&S.day>=S.alertCD["ha_watch"]){
    var m2=calcM();
    if(m2.delay<15){S.sat=Math.min(100,S.sat+5);addFeed("AIRLINE","tag-airline","Heartland Air: Performance watch concluded. Improvements noted. Sat +5.");}
    else{var har=haRoutes();if(har.length&&har[har.length-1].freq>1)har[har.length-1].freq--;addFeed("WARN","tag-warn","Heartland Air performance deadline passed. Delays still high - frequency cut.");}
    S.alertCD["ha_watch"]=0;
  }
}

function tick(){
  if(S.paused||S.gameOver||document.getElementById("modal").style.display==="flex") return;
  S.day++;
  if(S.evDelayDays>0){S.evDelayDays--;if(S.evDelayDays===0)S.evDelayBonus=0;}
  if(S.surgeDays>0){S.surgeDays--;if(S.surgeDays===0)S.surgeActive=false;}
  tickBuilds();
  var m=calcM();
  S.cash+=m.net; S.dailyRev=m.rev; S.dailyExp=m.exp;
  S.sat=Math.max(0,Math.min(100,S.sat+m.satD));
  maybeScheduled(m);
  if(S.day%7===0) rollEvent(m);
  checkAlerts(m);
  checkMS(m.pax,m.tf);
  if(S.cash<-10000){triggerGO();return;}
  updateUI(m);
}

function checkMS(pax,tf){
  var el=document.getElementById("milestone-text"),sz=document.getElementById("s-size");
  if(pax>=200&&tf>=10){el.textContent="Medium airport status reached! Parking structure & regional rail intermodal (transport menu) available.";sz.textContent="Medium Regional";}
  else if(pax>=100){el.textContent="Next: 10 total flights/day for medium status.";sz.textContent="Growing Regional";}
  else{el.textContent="Next: Reach 100 daily passengers.";}
}
function setBar(id,pct,label){pct=Math.min(100,Math.max(0,pct));var f=document.getElementById(id);f.style.width=pct+"%";f.style.background=pct>90?"#e05050":pct>70?"#f0a040":"#4ae0a0";var lbl=document.getElementById(id+"-lbl");if(lbl){lbl.textContent=label;lbl.style.color=pct>90?"#e05050":pct>70?"#f0a040":"#8aa0a8";}}
function setTrend(id,cur,prev,dir){var el=document.getElementById(id);if(cur>prev){el.textContent="up";el.className="trend "+(dir==="good"?"tug":"tub");}else if(cur<prev){el.textContent="dn";el.className="trend "+(dir==="good"?"tdg":"tdb");}else{el.textContent="--";el.className="trend tfl";}}

function updateUI(m){
  var ce=document.getElementById("m-cash");
  ce.textContent=fmt(S.cash); ce.style.color=S.cash>100000?"#4ae0a0":S.cash>30000?"#f0a040":"#e05050";
  var co={A:4,B:3,C:2,D:1};
  setTrend("t-cash",  S.cash,           PREV.cash,   "good");
  setTrend("t-pax",   m.pax,            PREV.pax,    "good");
  setTrend("t-flights",m.tf,            PREV.flights,"good");
  setTrend("t-delay", m.delay,          PREV.delay,  "bad");
  setTrend("t-sat",   Math.round(S.sat),PREV.sat,    "good");
  setTrend("t-credit",co[m.cr],         PREV.credit, "good");
  PREV.cash=S.cash;PREV.pax=m.pax;PREV.flights=m.tf;PREV.delay=m.delay;PREV.sat=Math.round(S.sat);PREV.credit=co[m.cr];

  document.getElementById("m-pax").textContent=m.pax;
  document.getElementById("m-flights").textContent=m.tf;
  var de=document.getElementById("m-delay");de.textContent=m.delay+"%";de.style.color=m.delay<10?"#4ae0a0":m.delay<25?"#f0a040":"#e05050";
  var se=document.getElementById("m-sat");if(se){se.textContent=Math.round(S.sat);se.style.color=S.sat>65?"#4ae0a0":S.sat>40?"#f0a040":"#e05050";}
  var cre=document.getElementById("m-credit");cre.textContent=m.cr;cre.style.color={A:"#4ae0a0",B:"#4ae0a0",C:"#f0a040",D:"#e05050"}[m.cr]||"#e0e8f0";

  document.getElementById("d-date").textContent=dateStr();
  document.getElementById("s-park-cap").textContent=S.parkCap+" spaces";
  document.getElementById("s-park-price").textContent="$"+S.parkPrice+"/day";
  document.getElementById("s-gate-cap").textContent=S.gateCap+" gate"+(S.gateCap>1?"s":"")+" ("+(S.gateCap*60)+" pax cap/flight)";
  document.getElementById("s-staff").textContent=S.staff+" workers";
  document.getElementById("s-lfee").textContent=S.haFeeAdj>0?"+$"+S.haFeeAdj+"/flight above base":"Base aircraft rates";
  document.getElementById("s-pfc").textContent=S.pfcRate?"$"+S.pfcRate+"/pax":"Not established";
  document.getElementById("s-lrate").textContent=Math.round(S.loanRate*100)+"%";
  var lb=S.lobbyTier>0?LOBBYISTS[S.lobbyTier]:null;
  document.getElementById("s-lobby").innerHTML=lb?lb.name+" <span class=\"lbadge "+lb.badge+"\">Tier "+lb.tier+"</span>":"None";

  var clist=[];
  if(S.fac.vending) clist.push("Vending");if(S.fac.snack) clist.push("Hanks");if(S.fac.newsstand) clist.push("Newsstand");
  if(S.fac.coffee) clist.push("Coffee");if(S.fac.giftshop) clist.push("Gift Shop");if(S.fac.restaurant) clist.push("Restaurant");
  document.getElementById("s-concessions").textContent=clist.length?clist.join(", "):"None";
  var flist=[];
  if(S.fac.security) flist.push("Security");if(S.fac.bathrooms) flist.push("Bathrooms");if(S.fac.newbaths) flist.push("New Bath Wing");
  if(S.fac.pa) flist.push("PA System");if(S.fac.baggage) flist.push("Baggage Carousel");if(S.fac.ticketing) flist.push("Self-Check Kiosks");if(S.fac.valet) flist.push("Valet");
  var gtx=[];
  if(S.fac.transportCurbside) gtx.push("Curbside shuttles");if(S.fac.transportVans) gtx.push("Van/bus plaza");if(S.fac.transportLimo) gtx.push("Limo center");if(S.fac.transportRail) gtx.push("Rail intermodal");
  if(gtx.length) flist.push("Transport: "+gtx.join(", "));
  document.getElementById("s-facilities").textContent=flist.length?flist.join(", "):"None";

  document.getElementById("s-rev").textContent=fmt(S.dailyRev);
  document.getElementById("rb-ha").textContent=fmt(m.landRevHA);
  document.getElementById("rb-me").textContent=fmt(m.landRevME);
  document.getElementById("rb-me-row").style.display=m.landRevME>0?"flex":"none";
  document.getElementById("rb-park").textContent=fmt(m.parkRev);
  document.getElementById("rb-conc").textContent=fmt(m.concRev);
  document.getElementById("rb-transport").textContent=fmt(m.transportRev);
  var rtr=document.getElementById("rb-trans-row");if(rtr) rtr.style.display=m.transportRev>0?"flex":"none";
  document.getElementById("rb-pfc").textContent=fmt(m.pfcRev);
  document.getElementById("rb-valet").textContent=fmt(m.valetRev);
  document.getElementById("rb-tot").textContent=fmt(m.rev);

  document.getElementById("s-exp").textContent=fmt(S.dailyExp);
  document.getElementById("eb-staff").textContent=fmt(m.staffExp);
  document.getElementById("eb-ops").textContent=fmt(m.opExp);
  document.getElementById("eb-int").textContent=fmt(m.intExp);
  document.getElementById("eb-lob").textContent=fmt(m.lobbyExp);
  document.getElementById("eb-lob-row").style.display=m.lobbyExp>0?"flex":"none";
  document.getElementById("eb-tot").textContent=fmt(m.exp);

  var net=S.dailyRev-S.dailyExp;
  var ne=document.getElementById("s-net");ne.textContent=(net>=0?"+":"")+fmt(net);
  ne.style.color=net>=0?"#4ae0a0":"#e05050";
  ne.style.background=net>=0?"rgba(74,224,160,.15)":"rgba(224,80,80,.15)";
  document.getElementById("s-loan").textContent=fmt(S.loan);
  document.getElementById("s-days").textContent=S.day;

  setBar("bar-park",m.pu,Math.min(m.pax,S.parkCap)+" / "+S.parkCap+" spaces");
  setBar("bar-gate",m.gu,Math.min(m.rawPax,m.maxGate)+" / "+m.maxGate+" pax cap");
  setBar("bar-sat", Math.round(S.sat),Math.round(S.sat)+" / 100");

  var sat=Math.round(S.sat);
  var sc=sat>65?"#4ae0a0":sat>40?"#f0a040":"#e05050";
  var sl=sat>=80?"Excellent - airlines very happy":sat>=65?"Good - relationship stable":sat>=45?"Fair - airline watching closely":sat>=30?"Poor - service cuts likely":"Critical - service at serious risk";
  document.getElementById("sat-status").innerHTML="<span style=\"color:"+sc+"\">"+sat+"/100 - "+sl+"</span>";

  var bad=[],good=[];
  if(m.delay>=20) bad.push("High delays ("+m.delay+"%) - main sat drag");
  else if(m.delay>=10) bad.push("Moderate delays ("+m.delay+"%) - slowly hurting sat");
  if(m.pu>=95) bad.push("Parking at capacity - passengers complaining");
  if(S.staff/Math.max(1,m.tf)<0.5) bad.push("Understaffed ramp crew - causing delays");
  if(!bad.length) bad.push("Nothing critical right now");
  if(m.delay>=10) good.push("Get delays below 10% - sat auto-recovers +0.3/day");
  if(S.staff/Math.max(1,m.tf)<0.5) good.push("Hire more ground staff - directly cuts delay %");
  if(m.pu>=80) good.push("Expand parking - overflow triggers sat penalties");
  if(m.gu>=85) good.push("Add a gate - overcrowded boarding spikes delays");
  if(!S.fac.pa) good.push("Install PA system - softens sat loss from delays");
  if(!S.fac.bathrooms) good.push("Renovate bathrooms - quick sat boost");
  if(S.concSpend<1) good.push("Add concessions - better passenger experience");
  if(S.lobbyTier===0) good.push("Hire a lobbyist - unlocks grants and reduces regulatory risk");
  good.push("Use Heartland Air negotiations to add routes or upgrade aircraft");

  var bh="";for(var i=0;i<bad.length;i++) bh+="<div style=\"color:"+(bad[i].indexOf("Nothing")===-1?"#e05050":"#8aa0a8")+"\">- "+bad[i]+"</div>";
  document.getElementById("sat-bad").innerHTML=bh;
  var gh="";for(var i=0;i<good.length;i++) gh+="<div style=\"color:#4ae0a0\">+ "+good[i]+"</div>";
  document.getElementById("sat-good").innerHTML=gh;

  renderRoutes();
  renderFlightBoard(m.delay);
}

function triggerGO(){
  S.gameOver=true;
  document.getElementById("go-body").innerHTML="After <strong>"+S.day+"</strong> days, Millbrook Regional ran out of cash.<br><br>Final: "+totalFlights()+" flights/day, "+Math.round(S.sat)+" airline satisfaction.";
  document.getElementById("gameover").style.display="flex";
}

// ── VIEWPORT ENGINE ──────────────────────────────────────────────────────
var VP = {
  baseCanvas: null, baseCtx: null,
  olCanvas: null, olCtx: null,
  imgs: {}, loaded: 0, total: 4, ready: false,
  tier: 0, prevTier: -1,
  w: 0, h: 0,
  planes: [], vehicles: [], particles: [],
  frame: 0, animId: null
};

var TIER_IMG_DATA = {
  t1: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAAAAAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAG9AyADASIAAhEBAxEB/8QAHAAAAgMBAQEBAAAAAAAAAAAAAAECAwQFBgcI/8QASRAAAQMCBAMEBQcJCAICAwEAAQACAwQRBRIhMUFRgRMiYXEGFDJSkUJ0obGywdEjMzU2g5LC4fA0Q0VTYnJzghXxJERUY9IW/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/xAAiEQEBAAICAwEBAAMBAAAAAAAAAQIRAzESIUFRQgQTInH/2gAMAwEAAhEDEQA/APuE9RKyZzWuAAtwVfrc3vD90JVP9of0VSyLvW5veHwR63N74/dCoQgu9bn94fuhP1ub3h8As4N0XQaPW5veHwCXrc9vbH7oVCaC71uf3h+6Eetze8P3Qqikgu9bm94fuhHrc3vj4BUpIL/W5veHwCPW5/eHwCo4IQXetz++PgEetz++P3QqE0F4q5/fHwCPW5/eHwVICEF3rc/vD4I9bn94fAKhHBBf63P7w+CPW5/eHwCoQDogv9bn94fuhHrc/vD4BUoQWmrn98fuhHrk/vj90KnZG6C71yf3x+6E/W5/fH7oWdCC/wBbn98fuhHrk/vD90KlIIL/AFuf3x+6E/W5/eH7oWdNBeKuf3h8Aj1uf3x+6FSNQjggu9bn94fAI9bn94fuhUpINAq5veHwR61N7w+CoCYQX+tTe8PgEetTe8PgqQmEFvrUvvD4I9am94fBVJAILvWpveHwS9am94fAKqyEFwqpveHwCPWpveHwVPBJBf61N74+AR61N7w+CoRdBf63N7w+CfrU1/aHwVACYQWmqm94fBHrU3vD4KlCC4Vc3vD4BHrU3vD4KkIQXCqm94fBP1qb3h8FQiyC71qb3h8EetTe8PgqkkF/rU3vD4JetTe8PgqQUILvWpveHwR61N7w+CoTCC71qb3h+6n61N7w+CpRYILvWpveHwS9am94fBVJcEFvrU3vD90I9am17w+CqSKC71qb3h8Aj1ub3h8AqEaoL/W5veH7oS9bn94fuhVAIQW+tz+8P3Qj1uf3h+6FTzRwQW+uT+8P3Qj1yf3h+6FTZFvgguFZP7w/dCPXJ/eH7oVCEGj1uf3h+6Eetze8P3QqEvBBo9bn94fAI9cm98fuqjh4oQXisnt7Q+AR63N7w+AVCEF/rk/vD4BHrc/vD4BUXQgv9bn94fAKXrc3vD4LMpILhVze8Pgn63N7w+CoBQgv9bm94fBHrc3vD4BUpIL/AFub3h8FppJXy585va1tFz+C2UH950SDahCFoCEIQYMbe+PAsQfG4se2neWuBsQbHVXOJOGkk3Jh1J/2rPj/AOr2I/NpPslaB+jf2P8ACr8T6y1P9of0VCvqv7Q/oqCsKEIQilwR4ppIABMJeKd0DSRdLiiDgkmkgEItZOyqkEJoUQcEroKOCA4ovokmgPFNI7IQNCOCSAKB5JotogiU+CdkIFZGyaN0CHFMDRKykNkUbI4IsmECCLJoRCsmhMIBGwUhsUigQQAnbVNFLgkpKJRAknwQgSaEIoQhCAskkyWN73xteC9mjm8lJEJCEIGhJNA0k0IIppWQimgJJ+SIaEBNAr9UuaaAgVkWTTQQS4qXFKyACE0kUklIpeKIVk+KdkIFbVRupKKKLlF0ghEPgUx5JAJhAW8EWTS5oEhCOGyKBqnqgJoEFIJJhENJCEULZQf3nRY+C2UH950SI2oQhaAhCEHOx/8AV3Efm0n2StA/Rv7H+FZ8f/V7Efm0n2Sr9sM/Y/wq/wAp9Zqr+0v6KhXVX9pf0+pUrChJO2iEUJIQiAIujRI+aB8d01AJhAwhLihFBKOCEJA7oukEIhjZKyBoEXRQgWKEBAaI6IQD4ohX3UuG6jqmgafgkEXsimiyiDZO/iiBPggIFkApJICBosgIQHBFk0IEEwjqhA72SvojmkgfBF7KPVO+qB3SQhAISTAQHBMI4XNlhrMRZT085hOaRkbnXGwICLG1xawZnkNHMlcv/wAp61CHU7XMY69nOGuhIv4DTdV08r6uOGeV2eR7WusNm3F+n1+S5+HAHD4XucCCXEDhfMd+ZWbWpBRVDxi9d2MjtCPG/TiuvHioa5jahlszsvaA6DQn7l5vDqiGXGMQEcoc8v1aTfNY8vw2XRqHkz0mY2/KOvf/AGnj+KTLZY9ExzZW5o3BzeYUrLztReGmlkhkdE8DTKbX1HT6l04cRLTknbe3ymjbzC0zpvRuq4KiKqiEsL8zSrbIg4XQhCBJJ8EkAmNEkwimEJFMIgvojdF0dFAxuje6XRCoEWQhAkcE+CLIEkpJIDglzQUkAUtE0EeKCJFwgJ+CLWQG6EIugaXBF0IosiyAbp7BEHghCLoBNR2TugaaQQihbKD+86LItlD/AHnRIjYhCFoCEIQc7H/1exH5tJ9kq8/oz9j/AAqjH/1dxH5tJ9kq/wDwz9j/AAq/yn1lqv7S/p9SpV1SP/kPPkqrLCkhHBIoo2STRogSQuhPmgXNATS3QPgUkIRDSRbRMBVSsmi2iLKILaJJoDdN0UkwmAgBEIhLipWCRGiKAmkLp9UQJeKdkWugEwLIATtoiknZFkwEQgEwNEWRxQPghJNAkKVkrIDyCY0BSCYCBJJpWQCOCaOiCIATsmg90EkgAcSio28FXPVQUjWmZ4BccrRxJ5LDU4ofWW01M0HMwu7S21iBpz3XKq+0mmoy+2cVAub6HumxvyRZGrGKmWow2obrHGS1tgdTdw3KnWxCPDqkXtaF+n/UrPib4v8AxrjLdpBZoQLjvDYbALj41jAmo6qlpwHPkaW3J06n+vJYyzkakdNmJQUGF03ayNB7Jgy3vc5Ry38h1K8ocXmmgip4i5sbAW2GhIufgPoUZDJUP7SW5NrAn7kANYB3bfevNly7TaqKJ0MzpQ3K88QunDjczZqdtQC5sZPeG40tv+KwXc6+U28EmxSFxKxjnYkyepkqYqvD5hTuDrt9kacRw/BdCPRwHBvA30+8LxBifkLQS0+C6tHitRAQKi8rBbUnbyXfHli9u5h+ZlKx8bi25dqDb5RW6DFZm1c0NQ3M1gbbKLOFx9K4uFVkT6ZoifZ2pyu0O5+K0wPDq+pDreyzS2g0PBdpdlelinhnaDG9pPK+qnbReZqGMEtO5pIPaWDgf9J4/itv/lZqWFxlZ2oaCddCVdpp2OCiq6asgq4w6NwBO7TuFdbVVkgnwRZHRAJKVkraIoCLIATQJFkwhEFkAJJoBCNEWuLIENQUcE7IsilbmiyfNHBERQpEKJQRshOyLIqKadkWREbap2TskBoigIKEWQLmjonpfZFkBx2QApBCIBoEIQihbKD+86LGttB/edEiNiEIWgIQhBzcf/V3Evm0n2StH+Gfsf4VRj+vo9iPzaT7JV/+Gfsf4Vf5T6y1N/WX9FSrqn+0v6KkLCmlZNRRQkmldEBSTB1S4oGlzRdCA3CaiE1VNCEKAQlcIRDCfNLgnwRQmPFJGyIkkUXQgQT2SCYQCYCSYQNARwTQJCaPBABCLIsgEBL4IG6CSEkx5oBCd0roEhOyQQCAovkjibd7gAuTHiUtfC18TTDG4b8TqUWTboS1sMRLQc7wbFreHmuNLUT1eITxlznANZliGw3uoUDbGsBNz60/foqTVMocTxB8kgDcsViDoNDp/Wqm2pEi8f8Ak4R2ZiAhka7MbnQt6LLjGIQQPoi2QteybMW31cMp5rkYrjj317HUwOQRlvaW2JI248AsAPaOEkgJdzdueq4Z8snRatxGsmxFpiu4MzBxDTbUa6qhjHN3Nzf6VZ2py5Q0BvgqyXX1vZea5Ws2pESh1wSUZJD7TSmA/wCS5KSc07byOsOXNZm6h5XA7WUfWXMDomASPcRfT2fMnQdVnc+sqwDGBHG72Q45TJ4NP87rRTSRRHsQ11NKNCyTuk/9tj5OB813x4ftak0bKp9PNkrI3M6bf18F1JsVp30LIY6cveW96Q2+hZTmI7J7A4AXyZPpyXuPNhPksppWZe0p5RGCeJBYT/u26OsVbx/jXU9LYg6xIJBWykxOemnc6UiRpAFzvp4rluqKqmdkmYW+NtENnMnEea5zLLHtnenqG18FTLT5JA14ffK7Q7Hotla8jD6gZbjs3X08OS8aL3DrjzC2R4rUxU8kUn5VhaRlPLwXbHm32ssr01PkkgjsbPDQAQtVDiU8cJL7ysD3DvHXRx2K5NFiFNUtZr2b7AWJ+9aKOQwxvbbM0yP239o/FdZlKunoqbEKaqe6Nri2RlszHixF1ptrovLsc2WrqBHYFoZa2nArU3EKunnhZcPidmzNdvoOa2zY73FCyxYjTS6OkEbhplfotRFgqyNEcEIuUDSR1SugfwRwSvZO45oAbJg6JBNAIQldAISTugEk7oQK2iE+qECSTSQFkk0IpJpXT4IgCV0ykgExxSCYRQhHFCAW2g/vOixLbQ/3nRIjYhCFoCEIQc7Hv1exH5tJ9krR/hv7H+FZ8e/V7Efm0n2StH+G/sf4Vf5T6yVP9pf0VN1dVf2l/RULCndJJNFBOiimUgiEN1LgiyEVGyaLJ3RCSupJcVQIO6SYCgLIUuiSKBomCkgboGknsEAIFfVMaosnZEATAQmECTAQhA0kIQNCLIARQjRCLogS2Cd9N0uCAQPJOyAgLposs9XWRUTYzLmJkdka1ouSbE/cir+GpAC59ZiTYaeU047R4Y4g8LgFYMYqp5cLkcT2QLmgAHX2go1JZBQVAAsBE+xO50KiyJ07nzwR1E5zyOY1x8yFRhkobhtM1xyk5tB/uOn/AK1WP/y8UGGwvce6Im24k6fT9XivMxYzUTUrI47xjW9vaNyT0C55ckxadx+MRwettbYv9YeQGu2248OnxXnppqipqZZXvzNfbu2sG25KEcMTM14wMxuQOf3q0BrTdmxFl5suS5M+RNaXO06kq2/dy6/BVXdY3GiYlcLWFxZctsne7gNOV1PVgINiOd1U55aC5wN+SXbd3NfTfvaWCslt9EjTBJkLiLG4tc8FhfkgqO0lLJsw0Lr334cvMKmXELHJEMzjxtp0HHr8FncA0l0ziXn5N7nqV6sMPFuR2WSxy3LHB2bcG13ed+67rYqbgHsMUjA5rRq14JDf4mfSFxojLIc0YEbL2vbQ+H+r6V0WSVEbR3M7G7A7jytq3oei1uRdrI4ZmWZTua9h1bBM4EH/AGPGh6WKpqMTjaXWjkFRq1xJ1afF3yh4EdVjrayokzNy9lG7fL8vzPE9AVnhMTH/AJWMvYRYgGxHiPFXWxKd1U4MlkD2Rk3ZYZW9ArIqoi9268x94V7Y3nI5ssUsMTHFr5NO77h4jwHjos8z6fIxsETha5c5x1N9hpy5pcZUb4Z2kEggjiRrbz5K4XIvmbb61w2yEOu24PMFWNqSwm4IvuR94XDLh/E06xOUix14LRRYhUUTS0HOy97O1XOgqGvbdw7vMaj8Qr8hfqw3B243XLeWJux6GixKlqKyV93RPc1t8x0uL7FbqgFtbRvYS5t37HwXlDE6E95rmHxFldFiNVBJGWPDo2Xux2t12w5v1rceqrTCaPMSSc7LWG3eC2w1dRBo09pHfY8F53/y8FZTZHO7GXM2xdsbOHFds5wzMDnG4I4r0TKVNOpQ4lFVwRvkAhke25a46DqttgRcEEeC8thxZUYbCDocgvdXUNXLTzVIY/O0SWIOo9kLW009FwQN1igxWGSZsMjXRyOBdqNDY236reBcXaQQeIRlHihO1tEFUHVJNHBAcEk0uCAQixTRSATt4o1QgLIQiyBIRZMBArJKajZEJJOxRZFJCPNMIABNLimgSE0W02QJbKH+86LItlD/AHnREbEIQtAQhCDnY/8Aq9iPzaT7JV/+Gfsf4VRj/wCr2I/NpPslXn9Gfsf4Vf5T6y1X9pd0+pUq+q/tD+io4lYUbKKl4pWQO2iRCd9Ej1QASKLougXFCClogaEICAUgLJBMmwugEIumEEUwEJhAIsmnzQJOyfFCBI4poQCOCEkAE0JX0KBphRumEASRski9+KYQCAhMc0Ak4hjcznBrRxKzSYhC2R0UR7WVpylrfknx5LkmSSoxGrM8uaONsZEbbkAkHYcVGpGmpxhxrWUlKPbYXGRw2sQNOe6x177T0LS7NKalucuNw3uu0P8AJZK1pfikUQIYTTuJ71sozDUn7gseN4vSUE1LFHJmn7YPPvGzSOn1rNyk7WR18ZfDHhrhI4h7pIxd1r2zDXk0Lz2M4/nimipQ2RzgW3f7P8/60XEr6+pxMZXuLYr3DWnQ/wBfFUtaQRffh4Lz581+JvQayolDe1eTZoGp5K1gawFo0KqDpNTmUz3mXLnZhzC89trNq4hzha+ttFNrANSb24Klju7va/HkrWseT7QJCgCS7ThxU7d24GypGZgu6x5gq1s4dYFthZXYiDc97Tz3XJrpiZBfYAHqRddSRgzXBdca81iqaYSWcy2ZvdseXDr9a78Cxijd2cGdp77iW35Af+06drZJu/3gNQNrm9gPpRlteN4Isb7atKQ/JOB0IOngQvQ07QZl8LaXtb/0PBSjJId3zlduAd1RT4gx4DZCQeZ3/mtAaJCcpbbm3gvHnjZd1n2k+EPFy3Xa4WOWgBJLNLchp8PwWwWbpm18UFxsRe4UnJcVnpx5YXM1c3TgRt8VV3mm7TYjYrsuyuGt77XA+vms8lAHtLmaHk0fd+HwXfDlmS7c50uZhc9ne98aa+PBUsqWsl/KsLmjUgaLsQ1XqsJhnhBjOmZoGvmDoeuqqloqeRhnpJmxhu+pyjzB1b9IXVUoBQVpDqWYwy+6Br+7/wDz8FX2s1JMWvc3NvnjIIPmP/RXEqHxl1rBkgOr2m38lT2kjXFxc53Euvf6VLjL2PXuxF1QxolJc1osCCSB5jcIswtu06HiNV52nrLEG5DhxG66UVZbvEWv8pvHzGxXDLg/Es26Aja4c7G/kttLiNXR/m5C5vunYrnxVbHNJIAA+U3bqNwrwQ8XFiOBHFcpcse03Y7WHY3TmmjhqGdi8C1xqP5LoUX56qcC18bpAQQd+6OK8mWg3uFOiqZaF7nQuIzG5sbg9F3w5f1ZXr3ODsRbFqSYSbcfaCtdPNRSQFkpaHygFp46HRcKnxuKWtjdM3KeyLc7dt1vq5zM6lfG4SM7catPgV3xzlXT0DMXht+X/J6e1wW9pa4ZmkEHiF5ipcz1KZ1tch30P81pikmicDC8gnh/L+vJb2zp3yEAW3XMosX7SmidUts5w1c3ZdJr2SNJY4O8jsqyEJ8ElAJoukqAIG6EIp8EJX0RwRAgIvukge6LJhCBWSITQgjbVNJNAIQEBFCE0BAgtlD/AHnRZFrofl9EiNiEIWgIQhBzsf8A1exH5tJ9kq//AAz9j/CqMe/V7Efm0n2Sr/8ADP2P8Kv8p9Zqr+0P6KhXVX9pf0VKwo4IQhFJHNCEQrKKnZFkEUWTskQgOqOCLaIsgaRCYCYCBNumBxTA8EwLopAJhOyLWRAhACaBJo4oARQNihOySICEuKfVJAXQlZSsLIpI8U0AIgCYCNGtJJAA3JWGsxFsUUopx2j2tNyNm6Ism2x72RtzSOAHiuWK+asizRtMMRJbr7RsSOg0XOpa6P1Knqa6qzTuY1x57cBwWSmxynpcPjhfSySua97iMwA1cSPPQqNSaXUs/q8lZHTxunlkncQ1u2jRvzQyujpMTr5ppO6Ww3c48bG4uPqC5TMZbE+olbTuD3vc5rQbDvcDz2Xmqx9VXVks08hNyLA6BoHADkuefJ4jrYt6RSVeIh1M0sDYzHnI1sTsOS5D2dp3nuBJ6phpjGjQfrUr2N8pC8mWdyrNoHdaAHXQHOba7rt8d0iS525HmpGEltxe4WEF7XJCk1zHGw1I8VWXuuGkaDwTawEE/Ugudkta1iqmlzX90g3TZGQTdxsmBYjXfXROhe0tMd380XjbxzW4KtxdextbyVZY4j5JaVBqLWOudQVWxh1s5pCg14uG3d4WVos29wLng4LUtgrfStkadAeQPDyPBYJKR0bg6M6g6B1r/gV0Q0B1tW300SmGQWuH3GxC648tnay6ciRxJymMNcPaAFvo4K1j5oAHg5me8Dt4X4LU+ESt1FrbA3+g8Flko3NJDTe/A6E/cV1meOTUu2yKuZIQHjX6f5rY3JclpB8Cdlw2tjALJGva8cfuITZPMzvC7mt58OvBZy4Zek07mXMLWISEZB1BsdiCskFcyQBrtD9K1xgOaXNdmHHXZee4ZY9prSEjWOb399r8evNYJKK9zGfh+H4LovIA2BUOzcdWAW38VrHksWVwp6QEd9vk4LG2Gakk7SBxFuX4L07hp3uO6ySUbXGzBY76fh+C748sqzJxXPbMc0cLI3fKDRoT5cOitjkIYbscANyNQr5qTKcz2+Tgqw0tvYkHa4XSKk2WxBaSD4aFaYat0ZudL7lvHzGxXPe27sxAA/06IaZY+8HB7DwJ1Clxl7HoYayNzdhYfKbc/EbhTzEm4aC08QdFwGTi/dJa8dCFohqXNdcki+5bx8xsVxy4fxNO06mebEgtOhulG6eCVj2yO7jr2adys8FXmjyucco1u0kgeY3C1Fkb42uD7+LTuuc8se03p1Di7ZKOZlQ3XIbOb94XchmbLC0xy5wBt/Wq8jdhsLm/krGVUsL80LrEbcF1x5v1ZXpcPc5tDEZLluXhvvsFKmqeyqqkRSZHZwe7oPZHT6lxaLGDHDHHVsN2/Lbpr963UdVDNPVFhEl5Bbn7IXaZyq9FBi7u2EU8Y9jNnbw1tqF0o5GTNzRvDh4LyTnOZiDMmtoTfMf9Q2V88oZ2Ra4xyGVu2nM+S3KzY9OjiuVFi5ijcahpc1ouXNGvwXRp6iGqjEkLrgi9jutItQUW5oRC+pJOyLIEgbFOyAEAnwS4I4qqaXBFkKBWQE+CLaIEBZMbpiyAgEk0FBFbKH+86LJZa6H5fRIjYhCFoCEIQc7H/wBXsR+bSfZKv/wz9j/CqMf/AFexH5tJ9krR/hn7H+FX+U+slV/aHdFSuDi3pZHh3pNVUFVDeJmTK9h7wu0HY79F1qStpq+LtKWdsrRvbceY3C5taaAhJNUCSaLIBCEwiIoCaEC4IATsUaoAJoshAAaKQ1KSNkDskmjcoAJ20STQAQjzRxQCR2RcWRzQCCEkxqgSlZJBcGNLnOAA4koGFmrq+DD4RJMblzgxrRuSTYLBWYrL6xTw0mUNkeWukf4AnQdFy8Wmb2ULReRxqIrvOo9r+vBRqY/rZjVTPLhFU4u7KPsyAAdT1/BZ8QxBtND6vFbtS2xNvZ/r4pYzNCKV0Uzs8sos1oO3iuG1uYlz3Ekm5Klqm2O7dToBZBZcWtZWhthr0TIsLnfkojI+C/gsk1OHbmx5hdQsJFyoGLwU1L2OBLDLG7OASRxtqk2R+5XcfFptdYpqUOBJyttxXHLhl6TTn9pfUjzTbM5mrHHffZVSVFLE/J6zE43+S66kHuA2FvJefLGztEnTuJu691ISjcH4ID473Nvghx5NOXmoATu90ptnyfJ0Vd3Ed0Hqm0vccpjLr8kRc6SOVpBalT01RI78mfyd9yNlspqDZ8o15BdFoA0FgOQXbDi37rUimKlZGbnvP4khOWmZLuCCrgE8vLVd5jNaa05EtFUMLi052224rO5r2Dv78l3xoNlVNAydhDwFyy4fsTTiCU7ZTZKV7TcAb8Fslw+RrfydjbgVz3texxbIwtI58VxuOWN9oiWNkaGnUjYO+47hZ3RPhdmjc5p5ONifI7FX6g6GytBe5moD28dFvHlsJXNHelIkuzXWzduiuE8lM4ZJA4cCDw/rgr3RhzSGgf7H6jodws8lOQ0W4m2U7/Fd5lMo03wVzX6OAufBbGOBGm3MbLgve22Ux5JBvbT4hWxVE8Tc4uWbX/mueXDL0mturIGXsTceWyg1kZ1D/joqoK9jj3hqeH8vwWjMCzNG1rguFwyxTRdm1zDmseZ/rdZJ6BhbnjePIfgtZkFrgWHHwRo8bWO9wOCuPJcSWuNJTujBDm6bXGoKyGBzH5mOLXDkvR5A4WAPn/W6yzUI3bp5bfD8F3x5ZWpXBdmJJe2x4OaLK5rZGDNcSR8XN1y+fJanwlgOYac9ws5jLXZmktI4jQrrKq1r7EEEtI5LTFWFrtSddy3fqNiuYXOa4B1wOe6mZCxubR0d/bbt/JLJex246pj2FznCw3c3h5jcLTG4Obma4OB2IK89G8OIex5uOIK2RVZjvwPFzdPiNiuGXD+M2OwGmxBvbxTjb2LyYnZS43NlngrA5oJIIG7m8PMbhXCS5zMIIPHguP8A1jfae43wYtNHUAVEYc0MyhwOu63y1japtJ2Twcso7p4CxXEu6wLmj8VWYrvD43uZlN7A6FdceXXbUr1j3gUE23sOvy2KvpjmghcHFr8je9m8Of4rzAxR8dPJHO3MxzCCeOo+ldrDq2KWBnZPv3QLO308F6sc5TTs0GJzdmRNeWznC9rOsDbr0XUhqqeocWRytLgAS3iF5ijmY2lLpiGta91zuNz/AFcLnjHaFuISSOc8RuDWtmsbG172d+N1raWPekaFLguHBi7wYA17Z4pCb30O19DsuvDVQ1AOR9nDdrtCEZ0tUfJSI4JKg5oQhA0cEkkDRwSTugL6oCSYQS4IIQEHVAgtVD8vosq10W7+iQa0IQtAQhCDnY/+r2I/NpPslaP8M/Y/wrPj36vYj82k+yVoH6M/Y/wrX8p9fH/T11vTSu/2x/YC41LiFRSStkhlc1zdi1xBHVdn06LR6bVxLQ8ZYxY39wLzruzJ/J5gLbO4Lz3t0nT3OFenJOWPEI+0/wD2MADuo2PSy9fR19JiEXaUk7ZQPaAPeb5jcL4stNNXVFLK2SGRzXN2cCQR5FWVNPtKF4XC/Th4tHiEfaj322DvhsfoXsKLEKTEIy+lnbJbdo9pvmNwtSppqCEIG6oEwgICA0CAmhABCaAgQTTSQK6fFK3FF9UQ7i6V0I2QNA+lHBH1oBJTso2ugAmq5ZWQMzyvDW+K5LsSmqqiohj/ACUcVrk6O1F9eSLJtunxGGGZ8DTnna0OLBwB4k9FxKioM2OQieQ6wEhg1HtDYceqrpiHYtVxxt1yRnMRvvsOPmVhxF0NPibpH6j1eznk6E5ufHopbpuTTfXnPWUItaPtXA/uHjxXM9IcXp6SGKCMOfKJmODWeBvqeH9bLjYn6QTSzxdh3RETlJGpFracliiinrSXhhJ/1aD48Vxy5d+sS1jx/FaqqqoJe0LHsLsuXYXspUXpRJEGsro8zf8AMYPrCwYrT1Eb2h0TswJvcb+S58cgdpxHAreG9e2bX0akrYKyPtYJWyN8Dr1Wpov3juvmsDn08olp5XRSDi02Xo6D0pcxuTEItANJmbdQrpNvUG9tN/qSDbKmmqYKqPtIJWyMPFpWLF8UNJGYqdze3cPaOzBz8+QRUcVxmKhd6vEzt6pwuI27N8XHh5LzGIVRflOJ1Vy8gMhZoL+AH1lY8SrJaBjOxZeWe5Mr9T4n6Vxw0vqI5Zi58he0lzteIV0bd6WiayentG1o7TYeRK63avFw5t/BZ6lzTI2xByuuT8V0aCjnqYyXkshPskjU/wAly5cPKekvtnEotqMp8FIPzDa4V0uHyxvygE8jbRbqWha1odLYu3twXnx47aSVjpaR85zWLW8yurDBHEO63Xmr22A0CLaXXoxwmKyAdEtLqQGienBbaIXAQEw0uB105lO4btfxKmwWtv8ABLe9tChBAQLz+hVzwRztIe0OHNWW5lAFtdksRx6jDXAfke8ORWKz4jlLHNPivS6Hf4hZayKZ0R7AROPJ4+/guOXFPiacUB1/Zvz1VVY8NpjYjXQcyb/d96hUT1FOezkjyPPF2t/Lgs1i8F8rjYaW4nw8FvDDx9kh08jnMe17O0AsRfceRVgidqYXOBIsWu0J/FRjzSu7KMZW72G3XmVp/wDHtaAZH2vwC1bIrG1rc2WQllv9N7easbUPhfo/NbiD960Pp2kW7W44B3DqqpKUsOeJwcOANr/gVJlKNkddHLYFtitjXsc3M0E+I4LgPlY42EYY8e1bT6OCujlmiaJBct5g7eH8iueXDL7iadh92i/VU63Nj8VTFXRSgdobPHH+X4K1pzXNwRwIXnywuPaWWE61zdouRa4/rVZpKUOBLdD4DT4LXbfRQvwuR4hXHksJk5MsLm+23TnwWWSNrb6EDmOC9E61hmFzsSNyFlqqWFgzBwZfiBp8OHRenDkmTUu3CaWNcAZLAn2gFKR8sLQ4kOZtnaf6+laJqMEE7X+U3UFYJIJYjzaOI2/ELqrSysIINyCNbjQjp+C6MNVIYhMb9m4/nGDfz4FcV0b43NbMx0ROoztsCPD+S6VFXOw9pYezljfqbHfr9xClko7cdd2zAHkENFgW7DzG4+lXsDHN9rqDouPJNQzN7WnkMUvuAEH4cPMHoq21L2yZi5wdxc37xsVwy4fxLHbPdBAaXjkeCpdKxpDWvMMjtGi+6hFXXAzWdp7TR9Y3CzY2wTUDahhB7Nw1G1jp+CzhLMtVnp2IoZnRNjnkL2jXLfQnx5q9w/J2axrrfJJtcLytBi89N3cxe33XLvQY1TSRFzu64DVttV6dWLva2KY01TmpBJEWi7mPbZuvD+YXZpcRbiVDPfK2SB8bXAEkakagjbZeQq8VdO4tBs3g0feup6PPhGCTu7XLUSVDSQeQcAPvV3+nqenu4K+oiFnETN4Bx16HYrbQ4hDW08cg/Jve0OyO3F1xIZRkJLhqDctGh8woUDg/D6fYgMGo1H9eS3s1t6rKeKRC8/Q4jPFLUNJ7SJsuWznXt3RsV1ocRpppRFmySlt8jhbj/NE00pKVkW0VRFCeyaCITTQgYRxQi6KS1UW8nRZuK1UXy+iRGtCELQEIQg52PG3o9iPzaT7JV/8Ahn7H+FUY/wDq9iPzaT7JV/8Ahn7H+FX+U+vkvp5TOPphVu1Be2MtDhYO7oGh2K8uWlhs4EEcDuvuOK0VNXOkhqoGSxm2jxfh9C8TinoQ5rXPw6QSMH9xMdv9rtx1XGxuPDtmIbkcA9g2DuHkeCi0Oc7KBcnZaqqglppjDLE+CUf3cul/I7FZXNcwlrgQeRCimQWOLXAgjgRqrqesnpZWyQyOY5uxBII8iqS9zmhpcSBtfgmyPtNnNDuDSbX+5B7XCfTmRpEeIM7Ubdo2wf8AgfoXsaHEaPEY81LO2S3tN2c3zB1C+MFpaSDcEbgq+CqmppGvikc1zfZIJBHkdwrKafakLweFenMrMsWIM7Zu3aCwf+B+hexocSo8SYXUk7ZCPaZs5vmDqtSs6bLoSQCqJICVwmEQICRKWqBhCXFNA0bpJ8EDARa90aKitrI6GlkldYua0lrL6uKHbRplJOw1WJ2IROZ/8YiS4FnfJF/r8lhnq56mJxcRFGR7N/DieJ8AuZRVjhhdMGXb+Sbmcd9uHIfSVG5ivp5Se1c8mWbtZLC+o7x6NHisUUzoqmsc63ekBJHsizRsOPmVmpsQipaAuLwGGR7sxG5zH976l5yoxaWeSZrM+R78wzG5OltT9y558kxa27k2Osp6ur7JwcXNZqNjYG9zxXnaieoxGs7ZxeXZcoJ4DwCzBt5LuN3niutRVdPEMj2BjuLt7rh5+d1axbsqbCWA55jf/Tz811WNawBrRbwUWFrhmabhT4+K7Y4ydEiuWCOdpbI0ObyIXHr/AEahnbngcM44E2PQrrSzVET2eqCCScOBEUpFnjiNVXWYy91RP29PaaOwEUIB0468VubV4mpoqqhkyvYTbw1VbJWkWJXv6andjdI58NO6SIaHO3LY9fuXnqz0aErnPpjqPkk69DxVlTTiMlmp39rSSmKQa6bFdWLNLIZah2eRwzEnmuRNQVdJVAPY62x04eS67Ypy1rmQvIta+UokZsVgEzqew0Ad02UIaFsjgxkfaPOwtddimwWWZ+eocY28r94/guzTUsNK3LEwN5nieqbXTn0GDBhbJU5XEbMGoHnzXY8ikBdSA0WdrCsEAcUxtsg7WUANE73SHgmG3HLxQLW6loN9TyQdB3dFEIJZid0bpaJgDXdFKxIuPgi2uu6d0XuCiEgD4JBTDdLk6IQtzYIAyknjwtwTzACw0CifPRTW1RkiinYWyMa4eIXHq8CAYPVHAAEnI46dCu0LX2SN+Cuh5ynpp2XiERbI25Idx8RzQXnMRICHjmF6Eta72m6hVTUsc3tsB/1Ljnh5XaWOKQHeyCos7oOdg8wVumw+WO7onZm8uIWI5gMptcHc7rjZcWdIyU8cgA0dyvofisb6SRpPZkuHunQ/gf60W+zvMeCkOzAOYnXcbrePLZ2SuSxrCXNkc5rudtB5jdWRVL4tPaHnr8V0H0jJPHkHb9DusjqWSF+aI3PBptf8D/Wi7TLHJqVpp6pkgyu3+BVxfDmAEjAeRNlyHnO490NPEAW+hTLXtAz2cw7OBuPis3hxTxjoSzRRXJeHOHyW6rG6R9QS95DWD4D+aiDGNLEnkpRxOqaljHusLEiwsLeAWscJjFnom2c+0Adfjf5XmNlpdQuADsuR41u3b4bj+tFrjYynGWMAW4lSuXE8QdrLjef36Taj168Rgr6dk0R+VlB/l9RXDxCip4qjNQPeIyL5XEkA8hxXoTBnBtoT9P4rFNQixuMpG+XUfD8F0w5ZWpXBiEfaZZy+M8HNFxddARFjQTIx4Ozmm9/68U30uT2mgtPyhqCoOaG7LrLsTa7Kbg2I5FKeV74HxjTMLEjS/nzV8c8/YCGCU9lcl0WgLr8/eCsc2lkpS7KYaoPt2TQcuXnrsVNex51wkaDbVThne2N3eO1vFWSNdHI9tu7fQEaK2ndEwucWEutoF125a/FlLTSvYC45Be5JK7dNTDsLWdYEZDay5EPazzNc4dxpBtwAXtqPFqUUfZupYnaXc4i+Y8PJefmyrpjIxQYnPSaOu9q6eF4lTGGOO/YuygFrjoVxZQ17rtFvBIsuNQPNc8eXXZt6ekdK2qqntsWul0tuRYfELQ5zH4jC1u3YvNhr8pvDgvLUdVPRPflcXscb5XahdaPF6aorIBIDHIGOFzsbkcei9GPJKrvGtqqQRljw+N0jWEO1AB5Hh1XVhr4ZG989m7ch2n0rztVK8wQOac4EzNQbHfmrap7H0E4eNmOuCLcOX3hdJWdPTbi46FGq4lNPNTxN7N12ZR3TqP5LbR4rHURgyt7FxJAudDYkbqppuQmLFoLSCOBCSIaLJ2RwQLzWqj+X0Way1Ufy+isGpCEKgQhCDnY9+r2I/NpPslX/AOGfsf4VRj36v4j82k+yVoH6M/Y/wq/E+slX/aXdFSr6r+0v6KkBYVnq6Glr4TFVQMlYeDgvIYn6EPa0vw6USM37CY7eTuC9un0U1tdvi9Vh8tJMYpo3wS/5cotfyOxWVzXNcQ4EHkV9qq6KmrYTFUwMljPBwuvI4p6DkNMmGyBzRr2ExuB5O3CzqtSvBBWOEZaXMeR/odv8eP0K+rw+ajmMU8T4JODJdL+Ttisrmua4tcCDyKgSugqpqZ7XxPc1zfZIJBHkRqFWx+Um7WuB3BSflv3A4DxUV7LCfTqeLLFiDe3Ztn0a8ddnfQV7OgxOjxOPNSzteRuw6Ob5g6r4za2hHC6thqZad7XxPc1zfZIJBHkRqFqVnT7aE189wr07qISIq9vrDPe0a8ddj1sva4fi1DijL0k4c4DWM6Pb5g6rUqabUk7JgKoVtU7IRsgFF72RNL5HtY3m42VVTVNpuzblLnyEhg4aC5vyXGxS8opGzuDi6pjs3YWzcB95RqTbRiWJyilPqV2nOwdoRwLgDYclkry11LVBrjLJkdmfe4GnE/cFmx7tTRuYBZofGSAdPbG/9dFgxfFoaSifA3Nmc0hrGN/q3nusZZTFr1HYqLNhcXvs4R25EC3waPpK8lPi4joYIYQ0lsTWk8L2+lYK3GKiu7nsx+6OHnzKzaNs7V3O42Xmz5rfUS5fitrnuIEkjnWva/n9CtcW2yjQjxUR3tvpUmgm4J6LjvfbBOtfS10msLvBPLkCiWtJJLyD5psXQzzUzu4/TlwXTpsUjf3ZBldz4Li3DTa90Bxa7bqumPJYsrbjHoxR404VDZp6Wpvft6Z+Vx0I+okdV5rE6bF/RCk7TDu0rqBkYj7GRud8ZzXL8w1ItpbhovR09TLEbtcQOW4XThropdJe6eB4Fd8OaVXlMK9IKjF8KlpY8TnbA2Tu0lrTOBANrb2uT4br11BB6vRsjyOZa5yudmIueatEUQf2kbG5iLZhuQp+a3VhOAcbuaDba4T63T80yBwRSHJKxUgOaNeiiFYjyQCUxfoiyKlollv5pWtrfTgmHaWAsmwwA3fUpE31JQNOKOiBXvunoU+OyVuSBgaIOgUfJABKoPJNoO1ggN4nQfWmX6EKAuG+JSNyla+yLWKB631CQ114p3ulw3RD38+aVrDe5T01SsqoRdPwRtfkVBG9+FvJUT0UUwu4Wd7zdFpA0Nt0voU8RyH4c9hJzZm/SqewjsTmF13NCbFUT0cczdbg+81ccuL8ZscwMjLCCTYjUJGMBujw4DTXirH4fMwmzgW8wsxpnMdcOPjcrj7xqdISQMkuHEEgcb36FZnUbxfIcw906H8Ct7GuDruGltlbka+4cLA8l0x5bO1lcgNZlIcHNeP61HBRa57JGyAH8me6eXhf7l1ZqVrm6jOBsSdR5FYDBNC8mIlw2ync9Niu8zmSyyt8NZFMbEZX8v5fgtFxluGtseI4rz4Gd1nHLz02WllRJTmxdnB4g/19K55cMvQ7Wa41FgFTIx97gm/NUw1bJdGmzuX8vwutAkJbe+i4XC49p7ZzfW4AJ3I4+YWWSkY893ungRt8OHT4L1FHhLquASvmjYwtNyRq08B1XHqYhHM5jeBsHWVmeWK+44kkD2HvDS9gRqFrp6F1u1n9kHvNLrdHO+QfMdVsMcYjc+V2U29oG3x/ms0Vae0aC97iAAJBcHpxt4ajwXpwy8osc+dre2laGkNzmzXakKNLTxvnNwQLbKUrg+Z7hsXE7W+pWUY/Lkf6V1Y+tscYBsAA2+1lpMMUd3Nf6s8b5rmPrxb1uPFUXLRcbjUXCySl8jwamcl1swAaSADrYcAFm++246EFfDNH2b2tZIHfnLmxV74XgZuB48CuEGxA37V9/Bn81piq+w9h73DfK4C31rhlxfcWbHRDdBqXW5JkC2oPmVSzEmTPc6QZHuNzYaE9Nlf3i24NwfpXHVxTpNlVVU9mwynIHAlp1C6n/mIp6KWKoGUlhAvtt9C4ojI2cbfUlJAXsIPeGy648mmpk9rQ1IdDGWSB9mi3e16Hj1UKGVr4nMdo4yPOUixPePQrxtNWz0zgWFzCNLELq4bjDm3ZUMaRcm24Gq9GHJs3HqKGV8dTN2Epyta27DqOPDcLpUuKNqK31QxZZA0uJBuOi87R1cArZS1xyOY3xAOvHgtWGvc/0rJDrsMJXSXaPUWQmUlUJaqP5fRZgtNH8vorEakIQqBCEIOdj36vYj82k+yVf/hf7H+FUY/+r2I/NpPslX/4Z+x/hV/lPrPU/wBpf0VKuqf7Q7oqVhRuhFkAFFCeuqAnZBmqqGmroXRVMDJWO3DhdeQxT0GIBfhsoLd+wmNx/wBXbhe3shSyG3xerw6ejm7KeJ8EnBkg0Pk7YrI5rmHK5pB5Ffa6mjp62J0VRCyRh3DhdeSxP0HBa52GyWG/YS6t6HcLPisrwYmfkyOs5vAO1t5clBrS45Ra55my21mG1FFKYp4Xwv4Nk2Pk7YrGWuabOBB8VlSLHNcWuaQRwKthmlge18byC03aQSCPI7joo5iWhpJIGwvshrWvFg8B99naD4/iqPW4V6c1MGWOtb6yzbMSA8ddj1t5r22G4xQ4qy9LMHPAu6Jwyvb5j8F8ZcLEgixVkUk1M5j2OLSNW67eXEdFZU0+4IXzzCfTippw2OtHrMe13Gzx5O2PW3mvZ4fjNBijCaadpeBd0b+69vmD9ey1LE0jib8lTQ+z7b9XbDurjYpiVNE+OUaiOpYXyO8Dy/oqHpLjMZEPq7XyCNzrub7JJFl4aollq3NdK45Wm7RwHkFyz5PFrp2ca9IZ6r8nSHsxmHfOpNjfTkuJKZp3OfK/vE314pgBpsNzre26eV7juCvLlnazaqaHt2aLeGiuaCQTrbigh+gLQW+aMrxezLjzWERbIWEt3HMqeYZc2nwRcEG7bO4XUS4hurb+IQMuJFtD4qN4xfMB0SOZouGghMGI24HxQRIitexB80rHwtwPNXHswy1gVFoZ7O4SBMNjpopuIB3sVEdmx9idDtZWvax40sT5qykThrZYfZIIHBdKnxGKazXdxx57LimEk6b8rq+kpaioqBDFE5z99OHmeAXTHksWV3eFxqrmQTOaCWgF/sAkAv8AIcVkp3Mpc0dK5lXUDQvOsMXl75+hSlw+OpJlq3vnnO8rnEEf7beyPJenHr20vs5psWkEbghM7LMH19JYPAr4Bs15yytHg7j1VtPUQVri2mee1HtQSjLI3px6KkT1Pmn3QOZTAcXFgacxPs21UpqeaEXkjIbzGqmhXqTzQRrxSYbvDbgEm1zwWhtJUy3MTY5R/pkA+tXSs9zZO9yq43iRpIB0JBvwIU7a3UQ0IvzUg225si6FrhIWAIBufoQTw+hK+myBkghLLfRLbXdMG/mqJAABRI8NUXRsd0EdUxvc2TsgBRC+lMbGw+KYCVtd0BYBNLw4pjjZAtkAhGhS38UBa5ujUeCallvqUVFozE2FlTUUjJmm+h5hXkaWGgSBtfXVZuOxxnUFRDJmsJI+Nkide5YeBXauOOh+hUTUsUouRld7wXHLi/GfFzgW31u0jXTigtieTlcBptz6JTUU8Ly5ozt8CqjTgkEixOuvBcrLEVyxMk3s8cHXsR5H8VjfSSB3d745Ws74cei6GQtaAdirWGzC1zQ5viumPLZ2eTjucxw0ZldxsdPp1Ctjqpo263c08Xfit8tPFPe473PiOv4rE+lmgcezJIPT+RXeZTKLGhmJODAzO9rQbhutr81GWvaQQ3MTwKxuL2m76e3/AFIUDPrdsGviCfrSYT8VaZZ5A2Rzw1jDcG2l/vKqdM95ywh2ZxN3fKd+AU2RTVGshI6XNvuWlkbYgWhg138fP+rJllMTbnW31+Cvoxacj/Sq3/nXjbvFW0t+2OnBbnTMbiO6eq585uWX/wApn1LoHiLrNJQzOs5tn2AFtjYLNur7aZYmtLJnvBIY0EAG19bJiaMbQDq8qyJuVtS1wscg0P8AuChHTPndZjdOJ4BNz6gEwvfsox1J+9dClbObOs2NnIDdW01JH2zb5TIbC9rAdF3o8HfNHmZILltwANDz1XDPLy9RXEe7LrrpxCRkLTe/UK2YCN7mkEkbrOwiRgcG2FuJWZhWFwka+PvEAna6yOjlD3FhzbaBTY0nMC2/eN1ZEcr36a6LprXQVLVvgnzOzNcbCx3XdwStIx5s4Li3syCGGx+C51LQTV9V2bIy8WuXkaN14levwb0ahoXGZ93ScHO4DwHBdcJfjUdynrDO/KI3ke9a1vNarJNAAsApLsyS00fy+izLTR/L6KwakIQqBCEIOdj/AOr2I/NpPslX/wCGfsf4VRj/AOr2JfNpPslX/wCGfsf4Vf5T6z1P9od0VXFXVP8AaHdFVssKSE0IDZCNkIDdJO6SACSfFFkVRU0lPWQmKphZKw7hwuvI4p6DjK5+GS2G/YS6t6HcL2qg9zWNLnEBo1JKmiV8arcOqKGbs6iF8EnASey7ydsVlbC9zrEFvMkL6xV1FNiNKGiJksMgvmkbe48AvHz+j7vVu1o3nLnc0sk1bo47cis6a0840Nj0aNR8r8AouHaOFnNbp8o7nzV1RCYJXRyNMbwbEPOl/P8AFZphYgXueKiIva6N2V7S08iiKokiILXHum4128juOiGTPa3Lo5nuuFx/Lop5IpB3Hdm73XnTo78fiiunSY7UmphNRUZ4W6OY5ozAc2u018911W/+NxSplhhc4VDRm1jLCRzsdwOa8k+N0brPaWnhfipRVUsDgY3EZTca7Hw5dFLJex3arC54DmH5Rg+U3h5hYba3Ye94lXYdj8kLpG1LpahrtWiSUAtPg4jUHkfiulDDR4zC+QRmCdnttJAcPH/UPELhlw/iacctI3J8rpDNra3mFrqsIqadxc3NIwcW8PMLGTkYcrgT4LhZcb7ZM5ydwSk5zg2xFvJJkjw240TL3PbYtHnZAoxwueqk5jGXtqCoNNjcFWsa14IJCEKOCMaF9x4pSsDfZaSFL1ct1Go8FbZwZbVQY8weQA2ysAZoc3wWymo31r+zjjBcBdzr2DRzJXQpoYqfSgjbLMN6qRvcYf8AQ07+ZXTDC5LIyxYa2BjZq4uYx47kYF5ZPJvDzK3tikqIeycwU1J/+PGbl/8Avdu7y2WimorPe/vyzO1fI83cfM/cr3xOj9oEXXpxwmPTUmlTI2xsDWNDWjYAWAVQdWUs7pYXtmjcbmKUbeR4LQhaVW19TPIZKlzW6WbEwd1vXiVCoooKoASxgkatcNHN8itACEGaKqxPDn3B9fgAtlfpKB4O49V1qLF6PErtieWyj2oZBleOn4LDlPH4Kioo4KoAyM7zfZeDZzfIqo6NfgsOI00sLJHQmRpaXM4XU6sU+CYKyCnprtY0Rsc7UM4XJO5XMhr8TwwgOHr9OOfdlA89nKiqqqnFqts9DOyoZFcupXDJJH/1O/mEi7Rw+/qbSQQS4mxFuK0DX+appqts5c15yStOrDoQryb+QUqHcA6fFK+6eXklayKL3Rsn9CVuRQCVtfFPQ6BMDTwQQvqpja6LWRrZAt0wdEh/RRe2iIYNr3V8lJMyFs2TNE4XD2EOb8QqbgcVz8Ux6f0co3VVI4CSV4jEZ1a8njl5+K1jN3RbpvFr2uL2ukVZhWIYfieGMnnp5KaaTQzk58x5m3C9+CcjWNkc1rw9oPtAWupZq6JdxTuE231FlMNsbnZK9/JTalmDfHxSve51QUtQPBNB35nRPdIWKeqICABZRFxxTtpqU7eCa2qJ8dFVNBFO0hwIPBwV177ajmgabFZuOxxZ6OamJcxznsO9lnbNdxDfpXo+G1lmlpIpHZi0Nd7zeK45cU+M6cogmxNyVdG7I45rnwJ2VkkL4CS4BzPetdZJWidmWKQRk7kLnqz0nRT1tOwkZA5w4bFcmbEzJf8AItFtuSqqoJqZxztLm++3YrO4g73yrrjNptpjr5xLfNmFvZtoFujxJg1kiN+Y1XLbbLpt4KRdpqu+PHj2NDniSV7xs5xIV1KPyvRYGzAGx08V0aEh0t7j2VurGiOdpqRG0HbNm4aGy6brOJdax4rmwU8slW2QNtGGkZj5jb4LrEabLnlJfTTmVDXl15YmyMGxGjgre0aWBsbSweC0SObGLv0B+lZJZGvIygs1sCBqVwyx/GbFrRY5hdXnEJ4oJGxvcLty77BY3yDszmNhcKbiCHag902SYSe6SjtDIMxvfiTxRC7K1psLWVjLZB5K7DcNqMSLfV2HJxkPs/z6LXu9DIw5nOy3JLiLW1XoMI9GZ6qQyVTSyM2s2/e68vrXo8I9G6WgizvBfMdS52/8l3GgNGVoAA4ALthh+jLSUMFFE2OKNoA5BagLoATXWAQUIKBLVR/L6LMAtNH8voqNSEIVQIQhBzse/V7Efm0n2Srz+jP2P8Kox79XsR+bSfZKv/wz9j/Cr/KfVNR/aHdFVZW1H593RVLClbTRHBNK3FUJATQopJhCAiCyLKEk0UDc0r2tHC/FcnEcRlyMEN4mmRgvs5wLrdAiybbK7EGUlPK9oEkjG3yg/XyXPqJnSd6Z99NGDboPxWXEmPZh82UggtJNv6180pHMpoXySvAFtXONz5fyClrcmkaKww6nfIbgxizBrm8/wWA4vHT0zwHDN2slmsOtsx+H1rlDGyKCGCmFrMDS479OQXMLTxJAJJsNrrz5cvyJbpfUVsk0kjnMjex7gSzLy4LRE7DquAU3Ztp3fJBGl/vWItzDUByrflOmUW8lynLZWdrsQwAxRumpnl7R8jKSR4rjSwywuyyscx3+oLs01dU01g2TMwfIfrbyO4W4S0OJFrZhlktYNcd/uK7Y8krU9vMMmdG3KCHMPyHC4+CkGwy+y7sncnG7T14dfiutWYBI15NNdzbXsfqtuuPLDLTvyyscx3C66CL4Xxus9uXkeflzRpkyOa17PdcLj+XRNkz2NyggsO7HC4PRO0Mux7J3Jxu347jr8UHWo/SCelpGwNiilyEWMz3B1uWbj4Zh1XWecJxF8bTNGyplbcNPck8iDoel7ryEkb4jaRpF9jz8jxSbI9lrHRrg4A6gHmOR8QpZL2PR1WF1NK0mPLLHvdg1HmFzmyMvZ4APFWUOPTsrc9XO+WEizo3AXHi133O35hdVjsLx2WSNkUsVS0F1pGZHlt7XBFw4eRK4ZcP2J4uR2cbtWkgpdn3raEc7re/0fqYzeOWORvC/dKzS4fV04BfC8Rg6uGo+K43DKM6VgZbAOQ8uvckhRc5hs0Em/NaKbD3Pb2kjwyFu7nGwCmMtvokZXdtHaohlcx8erXA2K30PpW2U5K6JrrGxngABH+5ux6WWKtrorerUsYyONnSvGp8hwXj2zmGtqcjyHteS4Hbf6F7uLCzHVXen1URGpaa3Dqq5AsZIjceTm7hTayV0nbVEpllta+zR5DgvnVJjktJK2Rj5IJgbB8Zsf5r11F6Usms3EYbH/PgFj/2ZsellqzSyu6i41J0CI3Mmh7anlZNF77DoPMbjqlbidVlQDm20HPmpWsEkcDYoBCBfYoQGl1lqcPgqnCR7S2VvsysOVzfIrUgIMRnq6YWrIvX4QLdqwBs7R/EtFP2FZG59DMJmt9pmz2ebVe8RwRiWpf2bD7Itdz/IffsuRNiIrqh1JShkLSMz2NPecBxe7j5Krpv4JWIPNDWkgkbc1O9jpy34rNobbAajU8FC1xy8FNgN26pEa6kdUggALahS1B5jlxTaLlRzOdEx7YpC15sLtsqNooe3hM1JK2oYPaDQQ5p5Fp1CxuaWktIII56FaH0FdBTeuwNeyYMJGQ95p4A8xtzVuE4vT41g8lZicUcIhDWyVDTazti0jcEHzGyukYOFuKenFderwUvY2WgLJYrX0d3nddis9NglZUEhzDCAbFzxr8EHPGUuDQRmdsOa4OL0r8Ue6SnaZaelaQ6fQRscf9XF3AAL1eNf/wCWwKfDofSCaJhqpSyASE2dlFyXu0s3bTa5G65GM+kMdbiNPTU1GPUackxNazLd1rZgNttvNdMb4+2Mpv0nhlPJTYdDC8Bro22IHDwPitRdlPd+JXPbDKX54mOiHJzleyV4IbMwgnZw1BXO+/dbmlx3SuOCeXxRlvwUU7bpDXRKxHkmBzQ2C1MEj8U7AJXubD4oC9t0t99ByTy22OqQ4iyoaEWsEgLqBixFkrWvYoseCYGmqAFiNdD9CzyUUMhvkDTzHFX2Tba9uCzcYac2aB0YOZoczjZcuoo6OV9290ncBelIBWKfD4JiXBoa/wB4LH+vXTOnnX4TCx2YSuz827HzC1QwUjNKqlaB/mNJLevJbpaNzbXb/wBgkYsrfaK5+eWPaIHCsPe24iBBG7XFTpsLpIJQ5rXW90uuFn7ORjiYDkduW/Jd0V0OIEXbLE5sg4DUHyK7Tllix1+0DRYABZJq4HuxAPPvH2R+KxPmllcczmhvuNN/jzVQce1cCTsNFN29G0n96YF9nuIOvJVu0Lf9yHZhIA3YA3CHytAGZ3FSTTKT7FhvsLIdGS4NY0uc/RrWi5PktmHYRW4w+0MZZDe3bOBt0HEr32E+j1NhrLkZ5Tu92rj5n7gtY4Wrp5/BfROeW0te+zOEQ+8/cF7Kno4KSJrImABosLC1h4Dgr7aWtoE913xxk6QkdEwEWVCCaLIAVC4pphIqAWij+X0WdaKP5fRWDUhCFQIQhBzsf/V7Efm0n2StA/Rv7H+FZ8f/AFdxL5tJ9krQP0aP+H+FX4n1TUfn3dFUragflnKuywqJG6OqZ4o5qqXBKylZVyyxwi73AchxKCSwz4kyOd1PE0PlDM9791uttVjkrZp6qoiJyQsyZWjfUcSsQkJxrKBZraY2045gstSSdrKxz311I+Rxc8Pdw27p2HBV4lCTDES437eM5BxGYfFZ8UnbR1VFUmchrSR2Qsc12nUBefxHFKiu7geY47h2Vh1JBvqVjLORduzjWMxsp56enDZJCMpJOg8zxXm6irqK5+eZ5Omg2AHgFU4vc7vfyU8tgLOtzXlz5LkzclXdboA7XwVjW6cVY45AQRceCg14cLgkHlZc4yiXGPYkeYVZe5x0LCpOkZIbXII3BCXZsvuLpRHK472CCGEajzHBWGMhhsfiqyQ0EuAFjzWRbDiNTSnK12eMfIfqOh3XQjqsOxG7ZmBkjgAQ/j5FcjuO4geN1Ax3NtCumHLZ2srXWejrwXPpnAt1OUnguG9j4zZzbcL8CuzS19XSENY/OwfIfqOh3C6rK2gxBghnibG8/Jfax8ivRjyStSyvJMmexpa0gtO7CLtPRO0UnsnsX8nG7T13HW/mu7V+jLgx0lPKLi5yEWFlwpqaamfaaMtvseBXRVb4nxkCRpF9jwPkdihri1paCCw7tIuD0U2SvjaWtN2ndrhdp6IvDIdD2LuRuW/iPpRGylxisoac08EhjhIIyNNgL8QDcA+S6VB6TSQ07o6mJ9W+4yuztY8DjfSz/oJ8V598ckds7dDsRqD5HYqKmle3dh9DilPHVUz2sfIC6zCMwtuHM3BC5ssNZQOcJQJqfa9rt/kvNgkEOIzFvsuBLXN8nDUL0FH6S1BmhbNFFJCGiN4YLS32zamzvEaErFwncRjmooasZqV4ik/y3nToV5PFPRqqbLLI18kM79e/qDrdfSn0mGYlUSNoaphnZ3ndkCCPNhAIWaoirKVhbVRtqKfmBcD8FrHkyx7Sx4DBIG1GLtosXk9Vhe7MJstw4jgPG69difohURh1Zhk/bscNCw325jj0+C5eMw0Tg1sUbtSDlcLt8LHmudD6R4tgdaXwyO7F5Hcfq12i7b37jM1GmDFqvCp88naU8jTbtY9vIj7ivU0HpVT1DQK1gF//ALFOLj/sz8PgqKX0hwH0mj7LEoBT1O3aN0+n/wBhYq70LqKK9VhknbQkXBj1uPFvHp8FNRqV7FmSaHt4JWTQn+8jNx15HzT21XzqixSrw6d8gc6mfG25kYdHDiCOPkV6rD/SinqWtFYwMvtPALtPm3h0+CxpZXepxDVw9pBMx9vaaNx+CrzRuc4RyB+U2JHNZpMPhqGiqhLZYjoZIHaHwdb71e809BEDUHJcXbCz23D+EeJRVjI3yOIaBoLkk2AHMngsVZjNJQMd2DmTSN3meO4zyHHzK42JY66pl9VYQ1u4p4zp5uPE+a4ONM7KjbPUlzu93WDb+vNWRF7vSR8+KCXsxPHu4z3/ACn4BeufjmGTshvhzIqiRmTtm2/JtsOQubcl8toJ/WngktYS51/jovUUpfM9sbZIgWtvHfTML2N/uVsJXtP/ACGAxgXnqpTbLfKdfqUXYxgbA1zaepfqBqNxtzXGdRU0MIkmqJGt2G1z5C2qQoWBwkmkfDENo3Obnd4n3R9K57iu8PSHCYz3cNkdroSR+KzQ+lEUMs7Y8ODmF92Bzh3bjUbc1zgMOaCXysHL8rsq3/8AiWSlwqwGkC4DydVdjtD0ym0DcPhGnF5/Bc2j9LK8UsrpGxTOe4mz72GpGi5FRVUrwI6GOSRzmnvlx0A8OHmeS51JiMNK6Q9nFUggCwJLQ4bkG61EelrPSHFJMMqaSOfsRoBJHcPAPAG68xFS47RzVFHh01RXCVwkZBD3s0g4uHO4GpXcwyujrZnNbSBriRcAXDr6fFeogp8e9Hn1s9NQYQ+J8YMVRPVmLs+bXtDTcXvqCkvvQ6XoZg9bgmAvnxwsiq539rJE1+ZsVx7N9ifJV4N6b0WO4rVYcyjqqd8T8kcrgC2TccPZOmx+K+a4pi9bP6WYpLg0j5J64se6Pti6I5W2uAdAPFYMMr8T9GMemqOzjZUzxvje7KC4B3eu13ndamqx7fQvSv0OxLGWSSmvjq2Rvz08MzB3CBrrrrw06rxOC47V4a2Wix1vq1S1xEIlcBmv8kX1XV9GvSTFpXSgNFM4SkNOfuvYNrsOh8xY+K9DircH9JqZtJ6QYYxxv3amFubIedj3m9LpudVYz4fV01Zh09bPV01LFCQ1zpJNyTZthvqTYeK0kW0O40K8y70CoKCdtPSYzWVGHt/unBt2ngGye0LL0YPmsXTcO5BTDtdUrHX60cFBLfVRJt1SGo7uvijQH60DAOubbkn5JXT580BcjxStdSHimRppugiNDvcKWUWuVHptxTB5FAbHwRo7ZGvHU+CNBtv9CBW430SJ0sNBxTLrjVRAJQ2BfZKykG21Sv4IC3MKiWkY8OIJaTyVxuNtlVNIWRSFgBc1pN+ASyVHNkpZIDdx/Jjiq2vikaXa25u3W18vczvNyQDqNB5Bc7OXWLRprrbXdcrxyXbNgGS78rrEu47lQAImcONgpsBBddw33XYwv0drcTlu8GGAgWNu+7yHAeJWu7qDjxwVFRVNhgaZJCNGMF17DCPQ0PyT4gA+2ojv3QfH3j9C9JhWCUuFQZIoxc+0eLvM8V0bldMcNdiqGCOBoawbC11ZqnxQuiC3inwTARZAuqOCdvBHRAk7IAT1VEUimkiktNJ8vos3BaqT5fREaUIQqBCEIOdj/wCruJfNpPslX/4Z+x/hVGP/AKu4jb/8aT7JWj/DR/w/wq/yn1VP+ecqlbP+ecqrrChJCEBdcU53zzOOn5V7Qdza+wXZXmavFqekkna85pBK8CNu+/0KW6axW0j8uI17pMgDWxEG+wsdbrjYpjcIrCIIwfyLmdo4aakbDiuTXYpUVdRM+7RG/KAxhNha+/PdY3nMM7nX8158+X5F3o6yqM0rHSh7iD7RNyOChdp9kmx5KBYH95l7jx3VrLOYcp8CCuFtrFqTO6NSbcU2xscCLgHgRoU4wJI7D2wNidlBzGg6uIO9jwWRYQwDcKp1i6wPDYFSEYLrG11EsMbr5bIqFo33FwSOahK1rBc2A4G2isJJINhyvxCHyP7MtLMw52URSTlboczTtYqjUi1i4HiOCvD2CNrS0Aje3FDWstduo81BWIW2LgduFky17Xi4u07EKxoDNQR5KIfmDhmbvoCoIuDr6j4pF5LbWHXiphzgDcX8CjTh8FoW0uI1dEQGPzRj+7fqOnELrx4lQYi0w1UfZPdoA+1j5O26FcXVzb5dByQWMcNuGq3jyWLK013o0Rd1G5x45XDReeqaeelflnjLfHgeq71PV1lAfyL88f8AluN29OIXUbiVDiLRFWB0RIyljz3T5Fd8eSVr08ZDM+K4a7Q7tIuD5hWEwSjbsX9Sw/ePpXfrvRawMlE//o7+v65Lz1TTT0cpZUROY4G2u3xXRSfHJFbMNDs4G4PkVISksbHIwOY08BZ1uV+ShFM+K+V2h3aRcHzGyuzQS/8A6X+Fyw/ePpVRZTVM0MzJ4JCJmOsyziJBf3SNen0LtYb6QzOry3Ep3yU8mjiY29pG63C1gRzBseS85Ix7AC4d07OGoPkU2SDMTIDIDv3rHzug9WIMLxkTCldaVgvJGYy1zATYFzDt5hZJfRNjqYtZLmedS14u3y59VxoauWldFNT1MgezYatLfIjh/Vl3cJx90L5osTnmk4szRDtGm+oJFgRy0B81J66NR47EPRyWhkJ7IxXOl9WO8j0U8G9I8WwGr7Mkuhc9oDJNWm5I348F9BJpPSKilNNJKWwutIwtLXMPDMw625FcCbBm0j3OnpG1MB3sTYdOCt5P1NPEsxCqrJ8VqKxxdI50jmk6XbwVeH1YEbXxS9m/LmLXHulellwWjnLxRDRwsY5SLkcgV5ut9HpqQPbTgsIbbspfPgV1xuNjFejwDGKhlf8Ak3SU8zQCTG7Rwv8A1oUsTxWomnkYxzowX2dI495x/r+guJ6LPmZjMkM7Xts0EB3+4bLqvwqrxDGKktBjg7VtnkXzWGoaOP1Kank170yYPODisQaDYtcddSTqvS1eHNxGFrKgDK12bJz81ZQYTT4b+Rip3Nl4ueLvd/Xhouv6vFTtElW8MB2buT4eJ8AsZ5Te41jHl2eiPrUhNOBAOJGrPgr2YGIbw0VQKiRtg+RzbMb5m/0Beie2Sou2XNDBsImus9w/1H5I8BqpBrWtDGMaxjdmtFgFz8rW/GONFgOVzZH1kskwFu0cL5fBovp9akPRuC5Lp5Cb39kLtBoCZHElanpHGHo9Sj+8k+hTdgNL2fczZgNy4rq77ItwKXaTTjxYPK2J9OHxCnc3KY2x6O55iT3uqWG+jFDhURjhgD492te0Wb5LtBoteyRG+insUSRSQw3oWsilaQ5gAAAK4mI4bj/pGS3F8Wy0o9mmgYAD/uJ3XogABrqnYWSbg4UGE0uHweq00TGC3eJAc8nmSdVlkweP/wA7h9XOJXwU0hLnFwcSHMcDcHgDl+K9BLSwTkOlia4gb8VZFBFGO5G1vRWXRpgmwiBxzwfkXcuH8kop62mcIqiB0rL2a9mpXUKdrDRXZpEAgngfBIG3tKQvfZRvc6fFQWOI0HE/So5bnX4IAAF26czzRmtv8eCqmCRwTFigap2AKiI2t4hAtsEX4oHigBupDw28UWBGiQFzbkgd0W0udEr2HNANyeagLm1uCEWufFAIG6oAAOKZPh1UbCyWYWNlRPgVTJMyIAv0BIaPNQdO4SxsYBZ9+8eFgqKt8cbYyTd3aNOYoukqxz/VXk93k0efFU1dUGUz2NtctI8AqKqqdLGWtuG3HmVnlP5J3dzaWA4lZuWumbU2vMjRc7AdFZSU01Y/saaJzzxOwHmeC6+Eei9VWtY6oYYI7A5B7ZHj7v1r3dBhdJh0DI4YmtDeA2vz8T4lJhb2y4GCeh8NJaeqPayk3u4aN/2j7yvVRxsiZljaAPrU+CV11kk6QJWTATVCHmFKyVlIIF5IT2S4IFrbcIKEkDQhMbKiKFJJBFaaT5fRZ1opfl9Eg0oQhUCEIQc7H9PR7Efm0n2StH+Gj/h/hWfH/wBXsR+bSfZK0f4b+x/hV/lPqqf885VK6YflnKqyypII0TsnZFVm9rDTxXz3G8KrYK2ad8JdC9xdmYSd+a+jWUHMDhYgEcljLHyg+TBgtcHu/UokN1bmB8F9Br/RqirCXtb2Mp+UzivLYhgFZQEv7PtY/fYPrC82XHYOA1wD3tjJu3wVjHNDSXNIceIQYrSZ8xB8EZyfZ52N9Fx1pE2WALrfAIcW9mXkCxHFVOLr2DgAVW4OsRnBtvqpsSilDpLMNlpvZzy8uIcb67BYoou8DxutDpABZzTbkFApGtcy98t/FUkyEHvuAHLVTLaSSzmlzHDcHY+CsjY1rSWvHkVaMt+ZvfYpht9LAgq2QNub2IPLgs4jI1Ga/NQXdiGcb+CqIAO1ips7+gdqrmxvvZz2lQZstje+isjaCdTZTdEWuuSPipfkXs0eL8joqG5oye1qNyqxa/C45KLAwSZhIddCFY6OIm4dqORUCLSdNR5KtwNiD3hx0Q7LoRIfDW6kDbXNcBBOlxCpoxlhkJZ/lv1b+I6LsQYrh9azs6yFkbzpaUXaf+34rhODHfKsVVa17kOC6Y8liyujW+i4P5SkeAT8jh0Xn56WaldaZhaNr20XXpMQqaI2glvH/lv1b/Lou5T4lQYgwQ1jBE86Wee6fJ34rvjyytS7eJjlfETkdod2kXB8xsVYOxlG3Yu5i5afvH0r0mI+izbl9Fduns7g/wBeC85PSVFI608bmjg7gV0VCSJ8YBcBlOzgbtPVISHKWkNN+Y1HVJsr4icjiL78j5jipgwyDvDsnc2i7T03HT4IJQ1lRTHNFM+N1soc1xBAO9iNQuvhnpBJBTviqQ+seAOydJI1jhbgXWs7zNj5riPifH3nC7Ds9pu09VCwKo9rBh9HjdM+rp2uhewgSAtyuafFvHfcaHmsVRh9RACyeIVEI4gXt94XnGvIyggEDa/DyI1HRdlvpNVx0MVPE2NskdgJns7VxA4G5F/M6rPj+JqNdDhWGE9pHE7tBr3ydPJdWkqafD7iamDG/wD5EYLtP9Q3b0uFwh6aMpqeQ10QmmJvGImdmPI3LvisLcWqcSjdVgyRE3aYyQGt8gDYjXdXVvZ09+5lPWwBwLJY3DR7TcdCFgdhnq7jNEXyynQvkddwHJvJePhxs4ZAD2UsM0bQM8GrZLWHeadP63Xewn0xo69uSoBikAuSASLcyNwPiFbisyX6AkXII3B4KQXUeKWenE7nxuitcSBwt8Vy4poakOkpyXRXLWuOhJBsdFBPhbigBFuSECtxRfmpWuVG26Bi1kHiNggcynzQR21S16qSW3mhscExoPBFxYp7DTZBE6lIOI048kXJ208Uw0Af1qroAbc3d8OClYdUgbJgqLCNhujfZSBB1KW+wRC22NvBGbXXRPugapfUimPFF7nbRAbxGnnsnnAFha/NTaAAAa6fWjNcWGg8FG5Ttc2CoVuSdrIN7qQItZBHY3uolx5Ic4M3OiqbN22bLoGusSUgkZWhxYDd/ujdZnvPrYDnaZL5QdN1Ayxw1MxvbutHnuskkxlqLt2DbfSruQ3pZVVbTUxNYfYus0xc9zC4n2tylkc6eNkbDJI69g0Xv5DivV4T6IPq3NlxD2Qb9kD9o/cFiW5dM724FFhtViLjFSx3vo6R3ss8z9w1XusH9FqfDw2SW8k3vu3Hl7o+ldqkoqeiiDIWNaBtYWA8hwV5K644a7RENawBrAAOQQmAEwFpBZFkwmgiNEwjqgIHsjZCQ3QO6SPJNArITtol8UAhPggKhJcFIhJQR0Wil+WqbK+m+X0Vg0IQhUCEIQc7Hv1exH5tJ9krR/hv7L+FZ8f/AFexL5tJ9kq//DP2P8KvxPqMv51yrsrZfzhUFhUbJ2TsghUKyRCki3ggrskWggg6qdklBw8T9G6LEMzwzspj8tmnxC8fiPo3X0BLuzM0Q+UwfWF9KskW3BB18Fzy45kPjrm78CNLFVtBYbGx5BfTsS9GqDEQXGPspT8tmh6rx+IeimJUGZ8QFRFzaO98F5s+G49DhNeQ7UK5shIIay/IXWfsu8Wua4EbjZXxAAWvf61w0E/ukjKLJBpbwOqZf2hc0HYW81W0uAsJLgGwuqLC27LG1iotaCL63btyKi5j3AHNfwVbXkXaXkHyUAY3NLXBmW+6uFnN1uDzBUby7Z8zQoPLgdQAqNADbEPJ142VMjGsfoboinLQWzROHiExGx9yJL+BUFrA22wKfeD7jYLPkdG3uu0TY9wF8xNkEZWsdZw3G1lEcRc6qZeNSRpysqhYElrhYnYqiTGgvyuIaLaFWdiLHUHxCTmsy2ewhXxSMDLC11IMjWZTa48inrYtdbXRWTOjdxs66j2WbVp18EFtJiNVQm0Dz2fGN+rT+HRdqPFKGvAjq4uyeRlBebtPgHfiuG2C7MzjrytZMCNjbO46LePJY1K21/owx7g6jdlc7UN4Lzs9JPSPLZ4y0jS/Bdqnqqmk1p5HZP8ALdq34cOi60WKUVW3JWRiF7u6XO1af+3DrZejHllX1XjGyPjJLCQTuOB8+amHQy6OHZP95ou3qNx0+C9LW+i0UodLSzsjG9jt/XkvMz0dRSutMwgX9q2i6dqJIXxDMbFhOj2m7T1UGyZDcNa7mHDQpskfESWOIvobcfPmpB0Mujx2TveYLt6jh0+CqRB7WTEgNa0EizHG4+J+9YZ8Jy5msuzNqY395rgujJTyRsDiQ6M7Pabt+P4qDDkN7B1uBCDC2skpKQU0tK0lgtGXONj4ZtfpWyOGNjY6ymnjglIAALxcE8OR6K13ZSMDQ0i9g5rtQfG/BYp8NZZzWDINixwzMKsyTTvYNiLYsTDMQpi0GxD4mktzA6uLRtpxXocKpmuwtjmOtdzyCdj3ivM4Zi02G0RgbDTySgd18hcOhcLm3ndexosSopqenBqadksw7sBkAdmtcgbX8xupVkQLXMHeFxz/AJpgaaarc1rTcHis1RFHHqHhlzbvGw/kstKTroo5TZbDQPyXL8zuW3wKzljo3ZSD5Eaq7RX4J+SdgUttkEbWTFrbIPiUr31Gg52QkBtsNTyCA2473wCYAbt/7RvsqDonYcEXGyNjYKAG9kZeSj53TCBt5IvY7ItZMD4c0CAabkjVBAboR0UtvZ+Kgd91AZr6H4IsgNCLC6oLEbbJ5uGxQTobKt8gjbmcbN8UkNLR4hUyOymzdXclCpc/1aQtOUZTbn0VJma2NpcdSAbcSqHHNnjzSkXBIPIarH60B2wi+U8m6i3O6n4BtydfMqqnhkqJDBBE+SV7iAGi7j5LNyZ2gBmlcTcnRdLDcGq8WmaYI8tONDK4d0+XMr0ODehYFpq93aX/ALr5A8z8r6l7OGCOnjDI2hoAtoFZhvtHIwn0bpcMaXWzSEWc8+0evAeAXZFmjK0AAaABHxRZdZNdIOKVk7apgboIgKYQAnbdULgUuiZIso38UD6JDdA8yj4oC6EAXvZO2qBhCEr6IHw1SSJR4oGPBA80I5oGgIshAjtsr6X5fRUK+l+V0SDQhCFQIQhBzfSD9XcS+bSfZK0/4Z+x/hWbH/1dxL5tJ9krSP0aP+H+FX+U+oy/nHKKlL+dKjdZUIQhAIRwQgSVlJA8kEcpSyqaaCvKjLorLIsg42J+jtDijSZI8snvt0K8diXojX0V3U49Zj8B3gF9J5o1XPLjxyHxZ0bo3Fj2ljgdQRqFnlDgO6Glu6+wYhglDiTD28Dc3B40I6rx2K+hlXTh0lE4TM906OH4rzZ8FnSvJxSaaA+IKm8B4GePQIkjkpn5JYnMeN2uFirmuLm6ALhZpGUllvlBFy4ZdSFJzTd1wDZNmUttoCoEyZzRldqNhcbKXccdTr4KDoy4HKRpwUGjWzlQ5Cfku1UY5TfKW2JGqsMYcdLXTZGc2oIA5qCD3kH2RayAxkjdWgHwWh8enBVmNjiCSQRqOSoiDlGV13AcFBweCS1h80OvmO3QpiRzWW1P3qCF7nUfFSAB+UQeCkHsfve/IjVIxh2qCYcSLOdfyUXRPtdkmvjxQO7pqrWSAMsWZh4aFBC0jBe7T5JiVzhezSDupP7Nze6SPNQc1wYLHXjZBbBW1FIT6rIAOMZ1YenDoutT41RVTBFWxCB3M6sPXh1XFcwubcWsd1FhsLObddMeSxqV1Kz0ZjlZ2lI/K4i4A1aV5uqw+popMtRGW8ncD/XiutTV89DJamkLBv2bxdp6cOi68eK0Nf8Ak66IQvOmYm7D14dV3x5JVl28fHJJCczHkE6Hx8xxUi+GX229k73mC7ereHT4L09X6LxPbmo35Tb5WoK81WUNVRyETxFoHyraLpsVugexmewdHwe03H8uqhne1pYHHKdSL6X8k4pHxOLmOc07XHFWl8Mnts7N3vMHd6t4dPggqb2bhZznB99Ljun7x9Kb4ywOikax8Z1LDZzXf18U3wPa3PYPj99huP5dUmvMZDgNjxF/oVXb1fo3iNdX1nZySxGnjiLez7OzgQBYgjwvcG+2604/XU0FHPFfPJl1a3h5ryNHXOpKlszLsyysk7hI1ab20PskEgi+xXpJsdwrFamKmqKOWMS2a2YEOY15NspcNW+BcAEHFj9MqunrXOhYxtO439Xk9ka8HfJP0Ltv9MKSaiJbRTOqR/cuGg8cw4LJjHopKxxMUWb/AEFuV3TgVRhmAVtLKWPtFG4A945gPAAcVbIz7dajxBlXDGXOb2hAuNtfBbMtxpr4cVx60YfTQtihaTNGAC6PbzPj5KqmxGaOwd32eP4rhc5Lpdu1bXvHVO6rgrYakaO73I6FWht9jfwW5lKuxlJ2RYtHNHRF7cNFoF7jZLUcU9LX3QUCvfwRa5Ft1IC4voPNGtu7p4pv8BYN5k8lG5JSuRupAX2QIO8NExldsjhwSuOSAAIQNdt0jIGi5d0WZ8r3VIYTlaWE2HmFdESlqMjmtAzFzg3yVdX/AGd1zd2mvLVVVMrYzCBweDYeRWeomc5pz+zcWspvRtoqalzo3BuxBGYrG1wADnOJAGpKvigqcRm9XpYXSP4gaBo5k8F7PB/RFsJjkrezlLQCBbug+AO/mVmS5M7ebwfBK3E2scxroacn23N1I/0g/WveYZgdLhkdo2C59onUu8zx8tl0mMbG3KwW+9S1XXHGRC3RbRMKVtFpELFFlKyXRArICdtEtkAglK6FQEGyQB5qQRZAkc0+KFAh5JoQFQJdVJCCPHdFlLihBEBSGqAmoEUkFAVCV9N8roqdVdTaZ+iQaEIQqBCEIObj/wCruJfNpPslaR+jR/w/wrN6Qfq7iXzaT7JWkfowf8P8Kv8AKfUZfzpUFZL+cKrWVCd0kIHdLxQNUboGhCaBc0IuhAJpXTCBosnwTQQtdK3BWWS0QYK7DKPEIyypp2PB2JGoXksR9CpIbyYfJnH+W/foV7q2iRCxlx45D41VxVFJMWTQujI0s4WWQ34Nsvs9TRU9ZEY6iFkjTwcF5TEvQdhzSYfKWH/LfqOhXlz4LOh4MOtoQpNNmm5J8VrrsMq8PkMdTC9g4EjunqsW1gNLaaLjcbOxKzTqCCFIl0ZzBwLdrKvMNLt1UrixB481AzMGjcAngRoUmyE8BY8bIflyWNrDmpMa4NIGg30UEQwkHuhIh9rtjzOHDmtDXsadHX5qRmiDbZxfmOCaGZzC5t8th48FJjWhu1ned1N7HvaDHK1wPPRQZGWE9pqPAoJhoAJNy7gqRLlddwsORUpZOzb3cw5Koue5oLm77WQabQO1zOHRWBjAyxdp4rO2QMaAN7bFXRva5gI0ugr7JovaW45IY0jMSQ4DmpOa1x0ABG4PFRsAN0EQe9rsm4ADUD4qIBcdEsxYTa2u9wg0UlXUULvyDy1vFh1aen4LrNximq2iOsjEROlzqz48Oq4jXOc0AjQbJlzQBc78V0x5LGpXSqfRmOUGSlkDbi7Rwd931LztZQ1FESJojYfKG38uq7FNUTQG9LLYA+wdWnp+C6rMYpqmLsquNsUnvkZmfHcdV3x5ZV28TFK6J4dG8tceIKvzxS/nGdm73oxp1b+HwXpK30YiqGiWjIYXC+hu0+PJedq8PqaE2niLWnXNbRdIqiSFzW5hZ8fvt1HXl1UWks1abeSI5HRuDmOIdzCvzwyD8o3s3e9GNOrfwsgvp8YqoJISKmZoh0DA67C0m5BYdLeIsV6F/pXhb2uM0E9NBaz5HOEjG301Le8B4kBeRkhc1peCHs99mo68uqqDCHB7XFrhsQbFUezqMGY9jZKJ4LXNDmtJ0c07EHkuVLDJCTFLG6N3Jw38lioMar8PgdBBMWMINmlgewHnkOg8226r0kOO4ZPg5kxSVjJIwO1Ahc5h1tdpFyOtrarjlwy+4zpw23brstsOIywjvHO0cCdfitsuDwTwtqMPnbJE8Zm3ddrh4OXJnjdSyBskRY/Y3G4+9cdZYJqx3aeuhqRa/e906FaLA+zqvLZ2XvYgjaxW6mxKWOwc7tG8nHUdVvHk/Wpk7IbruPintc7lVQ1kNQbBwLhuDoVblBvY38OK7S7VAk8DdNpPHRMCyZA3K0aAIKR0Uedt1F0gZodXHYIJk34qkTiQubFqWuyknYFQikM8LZJO60jRoWVtTldP2bb3lNuQ2T1BaHNjq5XOuT2bdTx1KyyVBfUgjQZSL9VC5Er3SEklo+9W0lBVYlPalhLmNFnPOjW+Z+4LPlv1GbVL3sD2Ocd3cV3sL9G6nEyDMx8EB1t8tw/hHidfBehwT0Tgo7T1P5Sfg5w2/wBo+T5nVelaGRtysaGjkFvHD9RioMIo8PhYyKCNpbyHHn4nxK3XSTXTWkF0wkAmNEErIRdJAKN9UXUVQ7pcEI4ppQhHBHREMIsnw2SQCEJIC6AjbyTaOKBp8EJcEAhRN0a3QO6fFDeKLIAapo2SuoBXU/ylQrqfdyo0IQhUCEIQc30g/V3Evm0n2StA/Rg/4f4VRj/6u4l82k+yVob+jB/w/wAKv8p9En5wqtWSfnCoLKlZKykdkkAAiyYQgEIshAkWQmgVk0IQPgmkN00BdASTCAsEWTCOKCNhslZT4otcIM01PDURmOaNsjTuHC915bEvQmnnu+hd2LvcOrf5L2WW6jkWcsJex8fxHBqvDj+XhLADo4atK57hYWJ1X2ySJkrS2RrXNO4IuF5rE/Quiq7vpf8A40nJo7p6Ly5/4/2D5qbNFyeqtEsZjDT5CwXVxL0dr8NDjLAXMH95HqFxsjgTZunFee42dhAxlxzaEKREDhY7+CrIN7FoQxjddLFSCyOMRjvPuBsrmSNe6zBvxGyz5XHXcDkrYm3fmYcrkFp1u21tFBkrWGxAtwNtFOoa7LmByu48lT2zMpaQw33ubINBMb2+w0+SrdZ4Ase6mwsDdGNAtve6bHAk2crBUbXN9x9KmC1x1BCsMZl3IP3KRi4AgX2AKdCjZxuPgreyY8aEX5HdRyZHWJOvNQkja4g6hw2IKC009mi7QQoSsYY7FnwU2zODLO1HAlQNwSdDfgoKWNDLkE/grA4A2cN+IUHsdoWd3mguc5mVxsb7hBoinqKMl1JKWNO7CLtPT8F06bG6Soj7LEIRGds+7PjuOq4rXPDSM1/FJrjITma245aXW8eSxZXUr/Rumqfy1AWxggGzTdp8f/Vl56qw6qovz8LgODgNF06SeoopC6mkLAdSzdrun4Lt0+M09Q3s6+MRX+Vuz47j+tV6MeWVrcrw7XOY8OY4td7wNle18TxaVga734x9bdvhZepr/Rqln/KUjwxzhmBbq0rzNTQVFG4iSM5Ru5uo68l0VW+EhpkBa9g+U3UDz4jqqg58bg6N5a4bFpsUB5a4PY4tI4g2VjZIpT+VZlPvxgfS3Y9LILabFq+lhkhp6t9O1/uMa9oPPI7S/i3L1Xfp8eo58Mvir4+0aAJSyJxjOu43LetrcyvOPpnNjMjCJIxu9mtvMbjqqBmY8OY4tcNiDZNbHrH4NT1LO3w6oje0/JDw4dCPvXMmglpn5Zo3MdwzDdZ8Nxupw1rmRtiEbjmc3sxlJ4ktFvoIXcwzHGYkJoMUZRRAG7JGvOR9ydCHC7CPE2PArllxS9JpyQ919XG3DwW2lxJ7DZ7u0aOhC1yYNDUQ9vh8zXxu1FnBzT5FcuWmkpzkkYWkc1y1lgz7juxVcVQNHAn6Qre61t3OFhxK823O3Ym30q81cjWtjLu0GdpF9911wz2sydSpc91NK6FxYA0kP49FB8rIGFznd6253WWprwad7GjVwsblUOzzuufZuuty0vkbJj2DGX0AtolC/V3Zi7i+wFr3PgOJWnDcGqsSA7HuxHQvdtfkOJPgF73BvRSjwxudzS6Ti5x7x/8A5HgPisyXJP8A1wMI9E56uUz4hcNIFodj/wBiNvIar29LQwUULWRNbZu2Vtg3yHBXtaGMDWANaNgAnbRdscZE2SOCdlINVRC2iAFO2h2S1QCEXQgOCiSnwSAVAo2U+CVrhQIBFk0KhcEW1TSsgOaAE7aJ2QRsOaLBOyXRQGmqeyAmqC6VkxZNBG26Qap2TCCAGqan0CSgihOyVlQraK6n3cqrK6D5SC5CEKgQhCDm4/8Aq7iXzaT7JWlv6NH/ABfwrN6Qfq5iXzaT7JWlv6NH/D/Cr/KfRJ+dcoqUn5wqKypITSQCNbpHZMIBCajayBpIuhAwhK6YGqBoCEIBA6IQgYQkhAwpKKd0EhsiyQUuCCFkiFNRQVuaHCxFwuDifonh2IBzmM7CY/Lj2PmNl6GyMqzcZex8pxH0SxLD3Pd2RngHy4tfiNwuH2ZbcZbFfcsq5GJejeH4kHOfF2cp/vI9D/NefP8Ax/wfJmuc3ZoTuL/JB8CvR4r6F4hSEyUp9YjGvdHe+H4LzEsTopS2SMtcDqCLLz3DLHs0ud3oyCdCs3q4c8ZTsrGvLbg7FDXHNcW81j6LTTuDLahQZaMhriSPpVme7crik2AuOZhLvBUW7ts3jzS7NwdcDKePipBtxvY8iouPAPLfJUP8pe+/mqZmyEgtcLjhzWhpPE5vHmqn2BNioJ05uwhw1TdJckMvcbgjRVh7gAQRooetGOXXq1IJ5ZnAnsxY7EKtzmtdYtIWqJ+Ydy1txqozMdm1YHac1BnLo5G2cDrxCI2NYLWf5qeRuUhrS0jfVVXdE0h17c00GQ1pIIspXZzNuasY5sjbXzHxUC1gabG1lBZTVEtE7NTzFgJuWWuw+Y/Cy60eN00oDKyER30Lx3mfiP61XGY1gb3s2YbEcVLPG46EdV0x5LGpXSrvRmkq4zPSSBhOoLNWnovM1OGVVET2kd2D5bdR/JdOKaeieX0sxjF9WtN2nzauzT41Ryx5a2IRPA9satP3hejDklWWV4tr3xuzxuLXDZzTZWdrHJ+eZlcflxix6t2PSy9XXejtLVxmakeGF2oLSC0/cvLVuHVdA49tES0fLaLj+S6S7XSL6d2QvYRLGN3M4eY3HVUi7SHNJB4EGycb3hwdG4hw2INlp0cPyzRm95gt8RsfoVQYbiBwurNRFDHd+kgtZr/EtBAv4ix8V6Sh9IKfEZzTVlI2JkjrMkD88XgHE2LD4nTxXm5oiWAtBe0alwG3mOCz2IN2kg8wUsHsqzAbOcaV9i02MbnXA46FcKqb2MrKeZrmTOcLNI8d1hoq2SgrBUxDK/5WX2X6W7zLgO89D4rsQYmMYxSniqYo4IjYGZsl2sO+zrEXPPTxK5/65vcSxSKSSQ5Yo3ySEGzWi5XscG9E3SZZaoNcPdv3R5+8fAaL0OE+j9NQx57Zs4BtfNfzdx8houwLAAAWA0AC6Y4faimmpYqRgbGLkC17fQOSvSANynbVdEA8EwEwNFLRAgAn5BHBRv4oFsldBPil1QO6L6JcUwqHbRLgmdlHmgEgbI5pIBNK2qdkAmNkkIJDojgkEXQGl+aL6bKOqNSgY3UkrIugLKWtkrIQMFPook+KL+KCQKEgpBArc0junxRwQHNWwfKVVlbDxQWoQhUCEIQc30g/VzEvm0n2StLf0YP+H+FZvSD9XMS+bSfZK0t/Rg/4f4Vf5T6JPzhUVKT2yorKhCaOCCBTTKXNAAoCaECsiyaSBaqQR1QgEG6EIENE7JpIAJoQgEJX1TQO6YJ8Uhsmge4QgbJ2sECtzTsmnyQRskQp2RbRBVay52IYNQ4oy1TA0u4PaLOHVdTKgNUslHzfF/QWqgzS4e7t2jXIdH/gV5d9PNTyujniex40Ic2xC+35dVkrcLo8SjyVUDHjgSNR5FcM+CXpXxcxuJuG6jwQy7Cbgjj3V7fFfQaWMOfh8udv+W82PQ8V42po6ikqDDUwyMdycLFeXLjyxQw8ObdpHw1UZMrhbM7NwFt1FsWlgDccbqxswzESMsNrnmsiHaAAXKMhfdwcNVOWNjm3J8jbdQbTtLhrbxU2Kiwsv9IU8oLACPgrXxC3dFx4KguAA118EgsZI1g3NxyCuBJs7Nqsuhuhrni7dR4Kquz6kj6FCWQvaTlJPwUmuY0Xc0ZuGqbp4yw3Bb9KlRQwBri5tx4KRLpHC+tuPFSIaLXBtzUHFrXXBI+5QSfI6O1mkjj4JtexwOawKO0zDUC3goZWnYka8VrQsdGyx7w8VURZujrhSaS3QWTjDbnMTqeeySBUtXUUby6mlLAd2jVp82ruU2MQVAEdaxsZPyhq0/eFxZGd1xvsOW6gwAsFr5rDurvhuNS6b3YZTVMIkp3NbIQblvsk3/r8VyJqWeEuzt0abEtGy1U75YhmjOS+4GoK0xV+d0jZGXL37gXDdAF2mUo4wlcwhzHZXA6FpsVCy6tdgdfHSGrfQTtgzd6RgzOaLbuYNh46LkOY+OMPblki/wAxhu3ry6rSwZeaiGua4OBseBBsVbFMWSNe1xa4bEcFdJI2YZsjGu4lugPTYdEV0sG9KsTwZwbFMXQcYnjMz4cOluq9/g/pzhmJNayqcKSfbvG8ZP8Au4dbeZXyjK50ZfkOUGxPAKIGU3BII4hWVNbfoEAGzhqDqCNipWXxjBfSnEcFcGwy5ob6xOF2Hpw6W6r6FhHpvheI5WTu9UlOnfddhP8Au4dbLUrOnpwE9kgQQCDcEXB5p8FURKjbRTI0UUEE0IugSYS4pjzVAlbzUkWQR1QBopbBIbIFZFk0cEEbbospIQRsmApWRtwQRA1RZPRNAkW1T3SQNCQTCBJphCACaEIEhNAQCsh3coKcW5QWoQhUCEIQc30g/VzEvm0n2StLP0a3/h/hWb0g/V3Evm0n2StLP0Y3/h/hV/lPpyfnCoDcqcn5wqN1lQjhZCEC8UJXTugEISHkgaSNkXQIHRSUL2CLoJXsmo3ugXQTSQNkIAJ3SCEB1TCj0TBPJBJMWOijvwTGiCYsjZRB80+CCV/FMKOyYQTQkNk0CsnZOyEEbJKSSCJCzVVBTV0RiqYGStPBwWu2uyLWSyUeHxL0GDc0mHS2P+VIb/A/ivI11DU0VQIaqB0Z/wBQ0PkeK+ykLPU0tPVxOiniZIw/Jc264Z8EvQ+NPygaac+SQaGt1JPkveYp6DxShz8Pk7M/5T9W9DuF5Cuw+rw1+SrpizgCRofI7Ly58WWKsDXOZd4BJ20PDyVZY95Li2zefNXBzcpuLX5KHeuG3NiuSKg3KOY4qWYgb5vMKxwa0beajGAXG23iqK928B5p9nYZrgjwKte1hHdsHcrqp/asAFhqgh2zngsF78inkGYOcLKyINAygZfJWOEbohnuLcUk9LGc5eF08zsuwNlNrWEW38uKyy1IsREBcceC6Ycdy6ReJASNBe3BErB2WYcws8AHrBGa7slyT5rXKPyQ72twuvhMfREA13ZOu4bKTSxrLF1tNuadrxubGbudoABdxPgvQYF6GT1hbJXBzY98l9T5nh5BXGWrHFwyjqMRcIoI7gWBds1vmfu3XvcD9FKegAmnHaTHXMRt5Dh57ru0OGUuHRtZBE1uUWFhYDyHBara3XbHCRCYGxgBgygclwcX9DsLxR7p42mirHf39PYZj/qbs76/FehATAXQfHMZ9FMQwfNLUU4mpx/9qlaS0f72bt89lwnMIZ2jSHR++w3b/Lqv0BbxXmsX9C8LxOR08LXUNWde2pwAHf7m7H6Cs+LUr5EyR0bw9hLSOIKbnlxJcBc66Cy72M+iuJ4OXST0/a0w19ZpWlzbc3M3b57Lz7muDA8EPjPy2m4/l1WdKsdG4MzgZme83UDz5dVW02NxcHmFC2uitj7Mm0jnMHvBt7Hx8EV2sF9KcTwZzWwTl0I3hfqw9OHS3VfRcI9NsMxJgbO8Ukx0s83YT4O4dbL5C9gjNs7HAjQtNwf68VAPcw3a4g8wVZU0/Qt7i4OhF780tV8Wwf0sxPB7MgnzQ/5TxmZ8OHSy+h4P6b4Xigaydwo5zpZ7u4T4O4eRstSs6ekKjdPcXBuLXHio89FUNAR0R0VEtEKKkgSAUksyCV9EX5KIKL6oHwTCQ81LggPFF0kIC/NF0kA9UDuhAKEAEwkEx5oHwQjglfVA+KEh1TUDCBokE0DVkXFV8FZHuVRYhCFQIQhBzcf/AFdxL5tJ9krSz9Gt/wCH+FZvSD9XMS+bSfZK0x/o1v8Awj7Kv8p9N/tlRUn+2VHmsqEIQgRCSklZAgmmBpZO2qCPBK2qlZRtqUEbINlOyVuCBBMBFk7IABJS2SCACLXRZOyCICkBojRMIBA0RryTAQKykEAWTQKyYTQAgYKkop8UEghATQJCaECsiyYQgidlGymlZBGyqngiqIjFNG2Rjt2uFwVciyX2PH4n6DU02aSgf2D/AHHatP4LyFdg9bhhLaqnc1vB41aeq+v2UJYo5WFkjGvaRYhwuFwz4JkPh8oO97FMZnNB3Pgvo2Leg1DWBz6RxppD8kasJ8uC8XiPo/iOFP8Ay8Lsg2kZq09eHVebLiyxGARFzTmFlUWZXHcoexzgDmPkUhDJfVxAXISylgLiSAOIUg0Xa/w4p9kM7CQSRsbqxsTXNab2Wt+hB7O0OwsNiNCFwjcRuBOUXC7pY5vmFxOxnqagxhj3vcQGsYLk6cB969XB1S+2ijc31khoJ7m/VdyiwmrxdwhpWdzMM0rvZH4nwC7Xo56COLGVVfpmH5obAeJ+UfoXvKOgp8Pg7KnjDRzXS4buyeo4+DeitHhbc7gXzWsXu9r+Q8Au8xoa0NaAGjYDgpBvFMBbk0IgJ2UgEwFRGydlKydggjbRRIU0EIK7LzeL+hOGYm988DTQ1h1M1OAA4/6m7H6CvT2RZB8Zxn0VxPB80lRT9pAP/tUrS5v/AGZu36lwXMIZnBa+M7Pabj+XVfoOy8xjPoRheJvdUU96CsdvLAO64/6mbH6Cp4tS/r4+fFWRmEtyyBzT77dfiPwXcxf0VxLCA+Sqps0Df/tUoLmf9m7t+pcJ0RDM4IdGdnsNwsaWI303SDyx1wSPFALmEOBsRqCpve2Sx7NrX8S3QHp+CG3Zwf0rxPBsrYZs9ON4JBmZ0HDpbyX0LBvTbDMUAZOfU5ybWkddhPg7h5Gy+RhhLS8A5RYE20CbSWG7XEHZWXRp+gcpslay+N4P6W4ng7g2KXPAN4ZO8zoPk9LeS+g4N6bYZigayZ3qc54SEFhPg77jZblZsektol8VNJVEPil8VOyAEEOKdlKyCEEQpXQL32QR4IFfzS+KaaCPxUgEAJ2QRTTsiyARdCAgLpJoUBbzU2tuCm1l91MCwsEFKamW3J5qNiEgFZHuVAbKxnFUTQhCoEIQg5uP/q7iXzaT7JWln6Nb/wAI+pZ8f/V3Evm0n2StDP0a3/hH2Vr+U+pP9sqHgrHjvFRI1WFKyPJOyECARZPyRzQIJhK3ggbIApfFNCBbosmkgLIQi2qAtomNEDUJ2QIBFk0IDgiyEIDgmEgmNtkDQEgmEAmEI4oHwQEkwEExsmohO6BoSQEDQhCBITSQCSaECSUrIsgjbRRcwOaWuaCDuCp2RwQeYxX0OoK/NJT/APxZt7sHdJ8R+C8Livo/imFucZY88X+YzVv8l9alZMXDs3ADjdUvp6lwIL4yDzauOfDL0PjcObexJ8SmZSxgFl9HrPQymqQ6RknZzk3u0WaT4hYsL9A2Qz9tXTdo4G4YzYLjOC9DzGFYDiGLSNyMfHCdTI4bjw/Fe7wX0Wo8Gis0GWQm5e/UnzPFZq3B8cNRMaGqbDA491gfrYc1qwKlxmKd5xKoe6Jo7rdCCvRhxzGK7hGiVlO2myLeC2iICSll3RYIEmAnbwRqgSEIVAmhHFQJIBMICoW6jZTshQQIXl8Y9BsMxJz56W+H1btTLA0ZXf7mbHpYr1RStcIPi2Mei+JYPmdWU2aAf/bpQXR/9m7t+pcR0Ja3OMr2cHsNwv0HbQrzGMeg2GYi989JfD6t274B3HH/AFM2PSyzcWpXySOR8TszHFp8FB7jI8uIAJ90WC72L+jOJYNmdW035Af/AGqYF8f/AGG7fqXEkheG5wWujOz2G7Ss6UGnlZEJMoMZ+U03A8Dy6qsOcw5hoVNrnsBs4i4sbcQhobns92VvEgXsg7eDemOJYRljjlzwD+5f3mdBu3oei+g4R6cYVibWsnk9TmNhaQ9wnwd+Nl8jfFkI7zXNOxab3+/4qAzNddpsfBWU0/Qtv/aLL41gvpdiWDWjZLngH91J3mdBu3oei+g4P6aYXiYayZ/qk50yyO7hPg77jYrcrOnpErKVuPAoKqIHQphNAQIhHAppIAaIQjdAITRZAk+CdtEcECsmhO10ACQrAbi6rA1UhoCFAE8AlqhSAKBDZWM2UFNnFWCSEIVAhCEHN9IP1cxL5tJ9krSz9Gt/4R9lZvSH9W8T+ayfZK0x/o1v/CPqWv5T6tduVFScdSo3WFJI7p3USdNkBfRF9EXsi6ABQi+iLoGEk0kC4p8EBF0AgBMaoG2yAAsmEXTQJCfRK/ggCki6LoBARdAQMJhAtyTBHJAITulfcIHxQEJ3QSBSRdCoYQi6LqaDSRdF0DQldF9EAhF0XTQaErougChK6d0CQjMjN4IBCAfBF0AlwTuldAcErKV0rqhJ2RfwRdQJJSulfwQJFtE7+CL+CAQlfwRdA0k7oQJNF0XQJI7JkpXUCQnfwSuqFa915fF/QfDMQc6ekvh9Ud3wN7jv9zNj0sV6m/gi6g+L4z6NYjg+Z1bTfkBtV0wLov8As3dv1LhPjc1mcFr4ztIw3b8V+hTsV5TGPQnC650lRSB1BVEFxfAO47/czY9LLNxa2+RC4VrOyLS2TM13B41HUfgtHYNkfMywa+IE5miwdY8uCzFtgsrESACRcG3Hmm3MzVpIKGt1vdaSGSwySZAyRlr5dnXPLh0+CDrYL6W4lg9o2S54P8qQZmdBu3p8F9Cwj0yw3FAGSuFJOdMsjgWOPg77jYr5CBdTZdpu0kFWZaNPvtkcF8mwH0oxHDnGFjxJC1ubs5LltvAcOlh4L6hh9X69h8FV2eTtWB2W97dVuXbNmmlKyd0KoQQi/gmNkAAgIBTugEIuhABSASB0TQFkWTQCgLJ7IBTTQW6k1K+ibTqUgkhCFQIQhBzfSH9W8T+ayfZK0s/Rrf8AhH1LPjozej2IjnTSfZK1MH/wWj/9Y+pX4n1//9k=",
  t2: "data:image/jpeg;base64,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",
  t3: "data:image/jpeg;base64,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",
  t4: "data:image/jpeg;base64,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",
};

var TIER_IMGS = [
  {key:"t1", src:TIER_IMG_DATA.t1},
  {key:"t2", src:TIER_IMG_DATA.t2},
  {key:"t3", src:TIER_IMG_DATA.t3},
  {key:"t4", src:TIER_IMG_DATA.t4}
];

var TIER_LABELS = [
  "TIER 1 — SMALL REGIONAL",
  "TIER 2 — GROWING REGIONAL",
  "TIER 3 — MEDIUM REGIONAL",
  "TIER 4 — MAJOR REGIONAL"
];

function vpInit(){
  VP.baseCanvas = document.getElementById("vp-base");
  VP.olCanvas = document.getElementById("vp-overlay");
  VP.baseCtx = VP.baseCanvas.getContext("2d");
  VP.olCtx = VP.olCanvas.getContext("2d");
  vpResize();
  window.addEventListener("resize", vpResize);
  // load images
  for(var i=0; i<TIER_IMGS.length; i++){
    (function(ti){
      var img = new Image();
      img.onload = function(){
        VP.imgs[ti.key] = img;
        VP.loaded++;
        if(VP.loaded >= VP.total){
          VP.ready = true;
          document.getElementById("vp-loading").style.display = "none";
          vpDrawBase();
          vpStartAnim();
        }
      };
      img.onerror = function(){
        VP.loaded++;
        if(VP.loaded >= VP.total){
          VP.ready = true;
          document.getElementById("vp-loading").textContent = "Airport images not found — place image files alongside HTML";
        }
      };
      img.src = ti.src;
    })(TIER_IMGS[i]);
  }
}

function vpResize(){
  var cont = document.getElementById("viewport");
  var w = cont.clientWidth, h = cont.clientHeight;
  var dpr = window.devicePixelRatio || 1;
  VP.w = w; VP.h = h;
  [VP.baseCanvas, VP.olCanvas].forEach(function(c){
    c.width = w * dpr; c.height = h * dpr;
    c.style.width = w + "px"; c.style.height = h + "px";
    c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
  });
  if(VP.ready) vpDrawBase();
}

function vpGetTier(){
  var tf = totalFlights();
  var pax = 0;
  for(var i=0;i<S.routes.length;i++){
    if(S.routes[i].active){
      var a=AC[S.routes[i].aircraft];
      var c=city(S.routes[i].cityId);
      if(a&&c) pax += Math.round(a.seats * S.routes[i].freq * c.lf);
    }
  }
  // Tier 4: jets in fleet or 15+ flights
  for(var j=0;j<S.routes.length;j++){
    if(S.routes[j].active && S.routes[j].aircraft==="dc9") return 3;
  }
  // Tier 3: medium status (pax>=200, flights>=10) or 3+ gates
  if((pax>=200 && tf>=10) || S.gateCap>=3) return 2;
  // Tier 2: has parking upgrades or more than 2 routes
  if(S.parkCap>20 || S.routes.filter(function(r){return r.active;}).length > 2) return 1;
  return 0;
}

function vpDrawBase(){
  if(!VP.ready) return;
  var tier = vpGetTier();
  VP.tier = tier;
  var keys = ["t1","t2","t3","t4"];
  var img = VP.imgs[keys[tier]];
  if(!img) return;
  var ctx = VP.baseCtx;
  ctx.clearRect(0,0,VP.w,VP.h);
  // cover-fit the image
  var iw=img.width, ih=img.height;
  var scale = Math.max(VP.w/iw, VP.h/ih);
  var sw = iw*scale, sh = ih*scale;
  var ox = (VP.w - sw)/2, oy = (VP.h - sh)/2;
  ctx.drawImage(img, ox, oy, sw, sh);
  // subtle vignette
  var grd = ctx.createRadialGradient(VP.w/2,VP.h/2,VP.w*0.3, VP.w/2,VP.h/2,VP.w*0.7);
  grd.addColorStop(0,"rgba(0,0,0,0)");
  grd.addColorStop(1,"rgba(0,0,0,0.25)");
  ctx.fillStyle = grd;
  ctx.fillRect(0,0,VP.w,VP.h);
  // tier label
  document.getElementById("vp-tier").textContent = TIER_LABELS[tier];
}

// ── ANIMATED OVERLAY ─────────────────────────────────────────────────────
function vpSpawnPlane(){
  var tier = VP.tier;
  // plane size based on aircraft types in fleet
  var hasJet = false, hasTurbo = false;
  for(var i=0;i<S.routes.length;i++){
    if(!S.routes[i].active) continue;
    var ac = S.routes[i].aircraft;
    if(ac==="dc9") hasJet=true;
    if(ac==="shorts330"||ac==="saab340") hasTurbo=true;
  }
  var size = hasJet ? 2 : (hasTurbo ? 1 : 0);
  var colors = ["#e8e8e8","#d0d8e0","#c8d0d8","#f0f0f0"];
  var stripColors = ["#1565c0","#c62828","#2e7d32","#ff6f00"];
  var dir = Math.random() > 0.5 ? 1 : -1; // 1=left-to-right takeoff, -1=right-to-left landing
  var startY = VP.h * (0.3 + Math.random()*0.25);
  var p = {
    x: dir===1 ? -60 : VP.w+60,
    y: startY,
    dir: dir,
    speed: 0.8 + Math.random()*0.6,
    size: size,
    color: colors[Math.floor(Math.random()*colors.length)],
    stripe: stripColors[Math.floor(Math.random()*stripColors.length)],
    alt: 0, // altitude phase: 0=ground, increases as plane takes off
    phase: dir===1 ? "takeoff" : "landing",
    opacity: 1,
    trail: []
  };
  VP.planes.push(p);
}

function vpSpawnVehicle(){
  var types = ["fuel","baggage","pushback","fire"];
  var type = types[Math.floor(Math.random()*types.length)];
  var colors = {fuel:"#ffb300",baggage:"#546e7a",pushback:"#5d4037",fire:"#c62828"};
  var v = {
    x: VP.w * (0.2 + Math.random()*0.5),
    y: VP.h * (0.45 + Math.random()*0.25),
    tx: VP.w * (0.2 + Math.random()*0.5),
    ty: VP.h * (0.45 + Math.random()*0.25),
    speed: 0.3 + Math.random()*0.3,
    type: type,
    color: colors[type],
    size: 3 + Math.random()*2,
    life: 200 + Math.floor(Math.random()*300)
  };
  VP.vehicles.push(v);
}

function vpSpawnConstructionParticle(){
  if(S.builds.length === 0) return;
  for(var i=0;i<3;i++){
    VP.particles.push({
      x: VP.w * (0.25 + Math.random()*0.3),
      y: VP.h * (0.35 + Math.random()*0.2),
      vx: (Math.random()-0.5)*1.5,
      vy: -Math.random()*2 - 0.5,
      life: 40 + Math.floor(Math.random()*40),
      maxLife: 80,
      color: Math.random()>0.5 ? "#f39c12" : "#ffcc02",
      size: 1.5 + Math.random()*2
    });
  }
}

function vpDrawPlane(ctx, p){
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.translate(p.x, p.y - p.alt);
  var sc = p.dir === -1 ? -1 : 1;
  ctx.scale(sc, 1);
  var s = [12,18,26][p.size] || 14;
  // fuselage
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, s, s*0.22, 0, 0, Math.PI*2);
  ctx.fill();
  // stripe
  ctx.fillStyle = p.stripe;
  ctx.fillRect(-s*0.7, -s*0.05, s*1.4, s*0.1);
  // wings
  ctx.fillStyle = "#b0b8c0";
  ctx.beginPath();
  ctx.moveTo(-s*0.15, 0);
  ctx.lineTo(s*0.05, -s*0.65);
  ctx.lineTo(s*0.25, -s*0.55);
  ctx.lineTo(s*0.15, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-s*0.15, 0);
  ctx.lineTo(s*0.05, s*0.65);
  ctx.lineTo(s*0.25, s*0.55);
  ctx.lineTo(s*0.15, 0);
  ctx.fill();
  // tail
  ctx.fillStyle = p.stripe;
  ctx.beginPath();
  ctx.moveTo(-s*0.85, 0);
  ctx.lineTo(-s*0.65, -s*0.35);
  ctx.lineTo(-s*0.55, -s*0.25);
  ctx.lineTo(-s*0.7, 0);
  ctx.fill();
  // cockpit
  ctx.fillStyle = "#90caf9";
  ctx.beginPath();
  ctx.ellipse(s*0.75, 0, s*0.18, s*0.12, 0, 0, Math.PI*2);
  ctx.fill();
  // shadow on ground
  if(p.alt > 5){
    ctx.globalAlpha = Math.max(0, 0.15 - p.alt*0.001);
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(0, p.alt, s*0.8, s*0.15, 0, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function vpDrawVehicle(ctx, v){
  ctx.save();
  ctx.fillStyle = v.color;
  ctx.fillRect(v.x - v.size, v.y - v.size*0.6, v.size*2, v.size*1.2);
  // windshield
  ctx.fillStyle = "#90caf9";
  ctx.fillRect(v.x + v.size*0.5, v.y - v.size*0.35, v.size*0.4, v.size*0.7);
  // wheels
  ctx.fillStyle = "#333";
  ctx.fillRect(v.x - v.size*0.7, v.y + v.size*0.5, v.size*0.4, v.size*0.25);
  ctx.fillRect(v.x + v.size*0.3, v.y + v.size*0.5, v.size*0.4, v.size*0.25);
  ctx.restore();
}

function vpUpdateAnim(){
  VP.frame++;
  var ctx = VP.olCtx;
  ctx.clearRect(0,0,VP.w,VP.h);
  // check tier change
  var newTier = vpGetTier();
  if(newTier !== VP.tier){
    VP.tier = newTier;
    vpDrawBase();
  }
  // spawn planes based on flight frequency
  var tf = totalFlights();
  if(VP.frame % Math.max(80, 300 - tf*15) === 0 && VP.planes.length < Math.min(tf, 5)){
    vpSpawnPlane();
  }
  // spawn vehicles
  if(VP.frame % 200 === 0 && VP.vehicles.length < 4 + VP.tier*2){
    vpSpawnVehicle();
  }
  // construction particles
  if(VP.frame % 8 === 0) vpSpawnConstructionParticle();
  // update & draw planes
  for(var i=VP.planes.length-1; i>=0; i--){
    var p = VP.planes[i];
    p.x += p.speed * p.dir * 1.5;
    if(p.phase==="takeoff"){
      if(Math.abs(p.x - VP.w/2) > VP.w*0.15) p.alt += 0.8 + p.speed*0.3;
      if(p.alt > 10) p.y -= 0.3;
    } else {
      if(p.alt > 0) p.alt = Math.max(0, p.alt - 0.6);
      if(p.alt <= 0 && Math.abs(p.x) > VP.w*0.3) p.speed *= 0.995;
    }
    if(p.x < -80 || p.x > VP.w+80 || p.y < -50) { VP.planes.splice(i,1); continue; }
    vpDrawPlane(ctx, p);
  }
  // update & draw vehicles
  for(var j=VP.vehicles.length-1; j>=0; j--){
    var v = VP.vehicles[j];
    var dx = v.tx - v.x, dy = v.ty - v.y;
    var dist = Math.sqrt(dx*dx + dy*dy);
    if(dist > 2){
      v.x += (dx/dist) * v.speed;
      v.y += (dy/dist) * v.speed;
    } else {
      v.tx = VP.w * (0.2 + Math.random()*0.5);
      v.ty = VP.h * (0.45 + Math.random()*0.25);
    }
    v.life--;
    if(v.life <= 0){ VP.vehicles.splice(j,1); continue; }
    vpDrawVehicle(ctx, v);
  }
  // particles (construction sparks)
  for(var k=VP.particles.length-1; k>=0; k--){
    var pt = VP.particles[k];
    pt.x += pt.vx; pt.y += pt.vy;
    pt.vy += 0.04; // gravity
    pt.life--;
    if(pt.life <= 0){ VP.particles.splice(k,1); continue; }
    ctx.save();
    ctx.globalAlpha = pt.life / pt.maxLife;
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
  // runway lights blink
  if(VP.tier >= 1){
    var blink = Math.sin(VP.frame * 0.08) > 0;
    if(blink){
      ctx.fillStyle = "#2ecc71";
      for(var li=0; li<6; li++){
        var lx = VP.w*0.65 + li*VP.w*0.04;
        var ly = VP.h*0.18 + li*VP.h*0.02;
        ctx.beginPath();
        ctx.arc(lx, ly, 1.5, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }
  // windsock animation
  var wsX = VP.w * 0.82, wsY = VP.h * 0.12;
  ctx.save();
  ctx.strokeStyle = "#c62828";
  ctx.lineWidth = 2;
  var wsAngle = Math.sin(VP.frame * 0.03) * 0.3 + 0.5;
  ctx.beginPath();
  ctx.moveTo(wsX, wsY);
  ctx.lineTo(wsX + Math.cos(wsAngle)*15, wsY + Math.sin(wsAngle)*8);
  ctx.stroke();
  ctx.restore();

  VP.animId = requestAnimationFrame(vpUpdateAnim);
}

function vpStartAnim(){
  if(VP.animId) cancelAnimationFrame(VP.animId);
  vpUpdateAnim();
}

addFeed("NEWS","tag-news","Welcome to Millbrook Regional Airport, January 1982. Good luck, CEO.");
addFeed("AIRLINE","tag-airline","Heartland Air: Springfield and Peoria routes active. Looking forward to growth.");
addFeed("PAX","tag-pax","Parking is tight but the flights are running on time.");
updateUI(calcM());
renderBuilds();
vpInit();
setInterval(tick,1000);
