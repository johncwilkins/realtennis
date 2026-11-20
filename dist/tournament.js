import {ROSTER,getCharacter} from './roster.js';
const valid=new Set(ROSTER.map(p=>p.id));
export const TOURNAMENT_ROUNDS=[{name:'Quarterfinals',ids:['q1','q2','q3','q4']},{name:'Semifinals',ids:['s1','s2']},{name:'Final',ids:['f1']}];
const fixtures=[{id:'q1',slots:[0,1]},{id:'q2',slots:[2,3]},{id:'q3',slots:[4,5]},{id:'q4',slots:[6,7]},{id:'s1',from:['q1','q2']},{id:'s2',from:['q3','q4']},{id:'f1',from:['s1','s2']}];
export const TOURNAMENT_KEY='royal-court-tournament-v1';
export class Tournament {
 constructor({entrants,config={},courts}){if(!Array.isArray(entrants)||entrants.length!==8||new Set(entrants).size!==8||entrants.some(id=>!valid.has(id)))throw Error('Choose eight different players.');this.entrants=[...entrants];this.human=entrants[0];this.config={gamesToSet:+config.gamesToSet===6?6:3,bestOf:[1,3,5].includes(+config.bestOf)?+config.bestOf:1};this.results={};const pool=Array.from({length:10},(_,i)=>String(i+1));if(courts!==undefined){if(!Array.isArray(courts)||courts.length!==7||new Set(courts).size!==7||courts.some(id=>!pool.includes(id)))throw Error('Invalid tournament courts.');this.courts=[...courts];}else{for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}this.courts=pool.slice(0,7);}}
 courtFor(id){const index=fixtures.findIndex(f=>f.id===id);if(index<0)throw Error('Unknown bracket match.');return this.courts[index];}
 participants(id){const f=fixtures.find(f=>f.id===id);if(!f)throw Error('Unknown bracket match.');return f.slots?f.slots.map(i=>this.entrants[i]):f.from.map(id=>this.results[id]?.winnerId??null);}
 record(id,winnerId,score,simulated=false){if(this.results[id])throw Error('This bracket match is already complete.');const pair=this.participants(id);if(pair.some(p=>!p)||!pair.includes(winnerId))throw Error('Complete the previous round first.');if(simulated&&pair.includes(this.human))throw Error('Your match must be played on court.');this.results[id]={winnerId,score:String(score).slice(0,180),simulated:!!simulated};return this.results[id];}
 get champion(){return this.results.f1?.winnerId??null;}
 get eliminated(){return fixtures.some(f=>this.results[f.id]&&this.participants(f.id).includes(this.human)&&this.results[f.id].winnerId!==this.human);}
 nextHumanMatch(){return fixtures.find(f=>!this.results[f.id]&&this.participants(f.id).every(Boolean)&&this.participants(f.id).includes(this.human))??null;}
 simulateReady(random=Math.random){let count=0;for(let pass=0;pass<3;pass++)for(const f of fixtures){if(this.results[f.id])continue;const pair=this.participants(f.id);if(pair.some(p=>!p)||pair.includes(this.human))continue;const result=simulateTournamentMatch(pair,this.config,random);this.record(f.id,result.winnerId,result.score,true);count++;}return count;}
 toJSON(){return {version:1,entrants:this.entrants,config:this.config,courts:this.courts,results:this.results};}
 static fromJSON(raw){if(!raw||raw.version!==1||!raw.results||typeof raw.results!=='object')throw Error('Invalid saved tournament.');const t=new Tournament(raw);for(const f of fixtures){const r=raw.results[f.id];if(r)t.record(f.id,r.winnerId,r.score,r.simulated);}return t;}
}
export function simulateTournamentMatch(pair,config,random=Math.random){const strength=id=>{const p=getCharacter(id),r=p.ratings;return p.average*.55+r.consistency*.15+r.intelligence*.15+r.stamina*.15;},difference=strength(pair[0])-strength(pair[1]),chance=Math.max(.10,Math.min(.90,.5+difference/130)),sets=[0,0],scores=[],needed=Math.floor(config.bestOf/2)+1;
 while(Math.max(...sets)<needed){const games=[0,0];while(Math.max(...games)<config.gamesToSet)games[random()<chance?0:1]++;const winner=games[0]>games[1]?0:1;sets[winner]++;scores.push(games.join('–'));}return {winnerId:pair[sets[0]>sets[1]?0:1],score:scores.join(', ')};
}
export function loadTournament(storage){try{const raw=storage.getItem(TOURNAMENT_KEY);return raw?Tournament.fromJSON(JSON.parse(raw)):null;}catch{return null;}}
export function saveTournament(storage,tournament){try{storage.setItem(TOURNAMENT_KEY,JSON.stringify(tournament.toJSON()));return true;}catch{return false;}}
