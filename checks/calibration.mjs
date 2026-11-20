import assert from 'node:assert/strict';
import {getCharacter} from '../dist/roster.js';
import {athleteProfile,humanPower,skillShot,expendEnergy} from '../dist/athlete.js';
import {PowerCalibration,mappedPower,readCalibration,saveCalibration} from '../dist/calibration.js';
import {WheelStroke,contactShot} from '../dist/controls.js';
const cal=new PowerCalibration(1800);cal.start();
for(const rate of [900,950,1000,1000,1000,1000,1050,1100,1200]){assert.equal(cal.record(rate),false);}
assert.equal(cal.baseline,1800,'partial calibration must not replace prior settings');assert.equal(cal.record(25000),true);assert.equal(cal.baseline,1000,'outlier must not determine normal strength');assert.equal(cal.power(1000),.5);assert.equal(cal.record(1000),false);
cal.start();cal.record(500);cal.cancel();assert.equal(cal.baseline,1000);assert.equal(cal.samples.length,0);assert.equal(cal.active,false);
let prev=-1;for(let rate=0;rate<20000;rate+=20){const p=mappedPower(rate,1000);assert.ok(p>=prev&&p>=0&&p<=1);prev=p;}
assert.ok(mappedPower(2000,1000)<.8,'twice normal must not instantly saturate');assert.equal(mappedPower(NaN,1000),0);
const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};assert.equal(readCalibration(storage),null);assert.equal(saveCalibration(storage,1000),true);assert.equal(readCalibration(storage),1000);assert.equal(saveCalibration(storage,Infinity),false);storage.getItem=()=>'{bad';assert.equal(readCalibration(storage),null);assert.equal(saveCalibration({setItem(){throw Error('blocked')}},1000),false);
const stroke=new WheelStroke();stroke.input(150,0);stroke.input(-100,100);const first=stroke.rawRate;assert.equal(first,1000);stroke.input(-100,200);assert.equal(stroke.rawRate,1000);stroke.consume(200);assert.equal(stroke.rawRate,1000,'contact preserves measurement until recorded');stroke.reset();assert.equal(stroke.rawRate,0);
// Sensitivity changes stroke travel but must not distort measured physical scroll speed.
stroke.input(300,0,2);stroke.input(-200,100,2);assert.equal(stroke.rawRate,1000);
const ball={x:.5,y:1,z:7},player={x:0,z:7};const normal=contactShot(ball,player,1,mappedPower(1000,1000)),hard=contactShot(ball,player,1,1);assert.ok(normal.speed<18&&normal.speed>15);assert.ok(hard.speed<23);assert.ok(hard.speed>normal.speed);assert.ok(hard.speed<36*.7);
console.log('Passed: ten-contact median, outlier resistance, cancel/recalibrate, smooth capped power, saved reload/corrupt/blocked storage, raw wheel measurement independent of sensitivity, softer normal and maximum drives.');
// Exercise the real game's contact handler: only human contacts advance/save the drill.
const {readFileSync}=await import('node:fs');const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const contactHandler=source.slice(source.indexOf('function hit('),source.indexOf('const ray='));
const calls=[],writes=[];const liveCal=new PowerCalibration();liveCal.start();const ctx={court:{racketContact(){calls.push(['RACKET CONTACT']);}},tutorial:{active:false},sideOf:i=>i===0?1:-1,contactShot,calibration:liveCal,ball:{x:.5,y:1,z:7},players:[{g:{position:{x:0,z:7}},hand:1},{g:{position:{x:0,z:-7}}}],stroke,shotChoice:{consume:()=> 'drive'},updateShotChoice(){},updateCalibration(){},updateUI(){},rememberSettings(){},practice:true,practiceHits:0,practiceBest:0,practiceReturns:0,practiceMode:'straight',rally:0,beep(){},savedCalibration:null,saveCalibration:(_storage,baseline)=>{writes.push(baseline);return true;},localStorage:{},call:(...args)=>calls.push(args),$:selector=>ctx.nodes[selector]??(ctx.nodes[selector]={textContent:'',value:''}),nodes:{},practiceShot:()=>({vx:0,vy:3,vz:10,cut:.25}),humanSide:()=>1};
ctx.crowdedReturn=(await import('../dist/athlete.js')).crowdedReturn;ctx.humanPower=humanPower;ctx.skillShot=skillShot;ctx.expendEnergy=expendEnergy;ctx.profileFor=i=>athleteProfile(ctx.players[i].character,ctx.players[i].energy);ctx.players.forEach(p=>{p.character=getCharacter('whitney');p.energy=100;});
const liveHit=Function('ctx','with(ctx){'+contactHandler+';return hit;}')(ctx);
for(let n=0;n<10;n++){ctx.ball={x:.5,y:1,z:7};stroke.rawRate=1000;liveHit(0,100+n);assert.equal(writes.length,n===9?1:0);}
assert.equal(liveCal.active,false);assert.equal(liveCal.baseline,1000);assert.equal(ctx.savedCalibration,1000);assert.equal(ctx.nodes['#sessionMode'].value,'straight');assert.ok(calls.some(c=>c[0]==='CALIBRATION COMPLETE'));assert.equal(calls.filter(c=>c[0]==='RACKET CONTACT').length,10);
liveCal.start();liveHit(1,200);assert.equal(liveCal.samples.length,0);console.log('Passed: game contact handler records ten human strikes, saves once at completion, returns to straight practice and excludes AI strikes.');

