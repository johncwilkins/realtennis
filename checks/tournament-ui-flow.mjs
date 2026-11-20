import assert from 'node:assert/strict';
import {setupTournamentUI} from '../dist/tournament-ui.js';
import {ROSTER} from '../dist/roster.js';
import {Match} from '../dist/rules.js';
class Node {
 constructor(tag='div'){this.tag=tag;this.children=[];this.textContent='';this.value='';this.hidden=false;this.disabled=false;this.classList={add(){},remove(){}};}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=[...nodes];}
 setAttribute(key,value){this[key]=value;}
}
const nodes=new Map(),$=selector=>{if(!nodes.has(selector))nodes.set(selector,new Node());return nodes.get(selector);};
globalThis.document={querySelector:$,createElement:tag=>new Node(tag)};
const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};let launched;
const ui=setupTournamentUI({storage,getHuman:()=>ROSTER[0].id,getConfig:()=>({gamesToSet:3,bestOf:1}),onOpen(){},onPlay:fixture=>{launched=fixture;}});
ui.open();let fields=$('#tournamentEntrants').children,select=fields[0].children[0];assert.equal(select.disabled,false);const oldHuman=select.value,newHuman=fields[1].children[0].value;
select.value=newHuman;select.onchange();fields=$('#tournamentEntrants').children;assert.equal(fields[0].children[0].value,newHuman);assert.equal(fields[1].children[0].value,oldHuman,'selecting an opponent as human swaps slots without duplicates');
$('#tournamentShuffle').onclick();assert.equal($('#tournamentEntrants').children[0].children[0].value,newHuman,'shuffle keeps your selected player');$('#tournamentCreate').onclick();assert.equal(ui.model.human,newHuman);assert.equal(Object.keys(ui.model.results).length,0);
$('#tournamentPlay').onclick();assert.equal(launched.human,newHuman);assert.equal(launched.id,'q1');assert.equal(launched.court,ui.model.courtFor('q1'));assert.equal(launched.resume,false);ui.open();$('#tournamentPlay').onclick();assert.equal(launched.resume,true);
const win=new Match({gamesToSet:3,bestOf:1});while(win.winner===null)win.finishPoint(0);ui.complete('q1',win);ui.open();assert.equal(Object.keys(ui.model.results).length,4);assert.equal(ui.model.results.s2,undefined);assert.equal(ui.model.champion,null);assert.equal($('#tournamentAdvance').hidden,true);assert.equal(ui.model.nextHumanMatch().id,'s1');
const loss=new Match({gamesToSet:3,bestOf:1});while(loss.winner===null)loss.finishPoint(1);ui.complete('s1',loss);ui.open();assert.equal(Object.keys(ui.model.results).length,6);assert.equal(ui.model.champion,null);assert.equal($('#tournamentAdvance').hidden,false);assert.equal($('#tournamentPlay').hidden,true);$('#tournamentAdvance').onclick();assert.ok(ui.model.champion);assert.equal($('#tournamentAdvance').hidden,true);
ui.open();assert.equal(Object.keys(ui.model.results).length,7);delete globalThis.document;
console.log('Passed: actual tournament UI handlers select/swap Player 1, retain player on shuffle, launch/resume assigned fixtures, reveal each round after play and advance remaining rounds after elimination.');
