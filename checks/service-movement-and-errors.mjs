import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/three.module.js';
import {movePlayer} from '../dist/controls.js';
import {pointerReach} from '../dist/mouse-setup.js';
import {skillShot} from '../dist/athlete.js';
import {COURT_SCHEMES} from '../dist/court-schemes.js';
const source=fs.readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const camera=new THREE.PerspectiveCamera(44,1.5,.1,200);camera.position.set(0,13.5,30);camera.lookAt(0,0,0);camera.updateMatrixWorld();
const ctx={THREE,camera,ray:new THREE.Raycaster(),pointer:new THREE.Vector2(),plane:new THREE.Plane(new THREE.Vector3(0,1,0),0),intersection:new THREE.Vector3(),paused:false,pauseModal:false,mode:'serveWalk',match:{servicePlayer:1},humanSide:()=>1,playDepth:()=>13,wallX:()=>5,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),innerWidth:1200,innerHeight:800,mouseSettings:{reach:1},pointerReach,players:[{target:new THREE.Vector3(),g:{position:new THREE.Vector3()},energy:100,character:{}}],handPredictionTimer:1};
const pointerCode=source.slice(source.indexOf('let latestPointer='),source.indexOf('function wheelInput('));
const input=Function('ctx','with(ctx){'+pointerCode+';return {moveToPointer,applyPointerTarget};}')(ctx);
for(const mode of ['serveWalk','serveToss']){ctx.mode=mode;ctx.players[0].target.set(0,0,0);input.moveToPointer({clientX:780,clientY:500,pointerType:'mouse'});assert.ok(ctx.players[0].target.x>.5,`receiver can reposition in ${mode}`);const p={x:0,z:3,vx:0,vz:0};movePlayer(p,ctx.players[0].target,.06);assert.ok(p.x>0,'target produces actual footwork');}
ctx.match.servicePlayer=0;ctx.players[0].target.set(0,0,7);input.moveToPointer({clientX:420,clientY:500,pointerType:'mouse'});assert.equal(ctx.players[0].target.x,0,'own toss stays at the service spot');
Object.assign(ctx,{applyPointerTarget:input.applyPointerTarget,serveAction:{server:0,launched:false,delivery:{x:0,y:2,z:7}},court:{},practice:true,faults:0,rally:5,stroke:{reset(){}},aiReaction:0,profileFor:()=>({reaction:.2}),ball:null,trail:{visible:false},beep(){},trailPoints:[]});
const releaseCode=source.slice(source.indexOf('function releaseService('),source.indexOf('function tickService('));
Function('ctx','with(ctx){'+releaseCode+';releaseService();}')(ctx);
assert.equal(ctx.mode,'rally');assert.ok(ctx.players[0].target.x<-.5,'release applies saved pointer without any new mouse event');
ctx.mode='pickup';const prior=ctx.players[0].target.clone();input.moveToPointer({clientX:900,clientY:450,pointerType:'mouse'});assert.ok(ctx.players[0].target.equals(prior),'pickup remains undisturbed');
let seed=173;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
function sample(consistency,rally,opponent=true,fatigue=0){let count=0;for(let i=0;i<20000;i++){const from={x:0,y:1.2,z:7},v=skillShot({vx:0,vy:5,vz:-15},from,{accuracy:80,consistency,fatigue},rally,random,{opponent});if(v.unforcedError){count++;const t=7/Math.abs(v.vz);assert.ok(from.y+v.vy*t-4.905*t*t<.8,'error trajectory falls below net');}}return count/20000;}
const strong=sample(100,6),medium=sample(50,6),weak=sample(1,6),long=sample(50,20),human=sample(50,6,false);
assert.ok(strong>.015&&strong<.035);assert.ok(medium>.06&&medium<.09);assert.ok(weak>.15&&weak<.18);assert.ok(long>medium+.012);assert.ok(medium>human*1.6);assert.equal(sample(1,1),0,'opening exchange retains a grace period');assert.ok(sample(50,6,true,1)>medium);
for(const court of Object.values(COURT_SCHEMES))assert.ok(!/^Court \d/.test(court.name));
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(!/Court \d+ ·/.test(html));
assert.ok(fs.readFileSync(new URL('../dist/character-play.js',import.meta.url),'utf8').includes('{opponent:true,pressure}'));
console.log('Passed: movement during both CPU service phases; saved cursor applied on own release; skill-scaled CPU net errors and long-rally pressure; names-only courts.',{strong,medium,weak,long,human});
