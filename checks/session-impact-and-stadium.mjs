import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/three.module.js';
import {ImpactReveal} from '../dist/impact-reveal.js';
import {buildCourt} from '../dist/court.js';
import {cleanSettings} from '../dist/preferences.js';
import {COURT as C,sideRoofHeight,endRoofHeight,wallX,wallNormal,reflect,galleryCollision,GALLERIES,roofBounce} from '../dist/court-geometry.js';
import {floorBounce} from '../dist/rally.js';
const timers=new ImpactReveal();timers.hit(1,'roof');assert.equal(timers.strength(1,'roof'),1);timers.tick(.3);assert.ok(Math.abs(timers.strength(1,'roof')-.5)<1e-8);timers.hit(1,'roof');assert.equal(timers.strength(1,'roof'),1);timers.tick(0);assert.equal(timers.strength(1,'roof'),1);assert.equal(timers.strength(-1,'roof'),0);timers.tick(.51);assert.equal(timers.strength(1,'roof'),0);
// Exercise actual court materials, end switching, theme changes and timer reset.
const gradient={addColorStop(){}},ctx=new Proxy({measureText:()=>({width:30}),createRadialGradient:()=>gradient,createLinearGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:()=>{}});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};
const court=buildCourt(new THREE.Scene(),{capabilities:{getMaxAnisotropy:()=>1}});
for(const side of [-1,1]){
 court.setScheme('8');court.setView('play');court.setEndView(side);
 assert.ok(court.endGuides.find(e=>e.side===side).group.visible);assert.ok(!court.wallEnds.find(e=>e.side===side).group.visible);
 for(const role of ['wall','roof','upper']){court.flashImpact(role,side,{y:role==='upper'?4:1});court.updateImpacts(0);const meshes=court.endGuides.find(e=>e.side===side).group.children.filter(o=>o.isMesh&&o.userData.impactSurface===role);assert.ok(meshes.length);for(const m of meshes){assert.equal(m.material.opacity,.25);assert.equal(m.material.depthWrite,false);}court.updateImpacts(.6);for(const m of meshes)assert.equal(m.material.opacity,m.userData.restOpacity);}
 court.flashImpact('roof',-side);court.updateImpacts(0);for(const o of court.endGuides.find(e=>e.side===-side).group.children.filter(o=>o.userData.impactSurface==='roof'))assert.equal(o.material.opacity,o.userData.restOpacity);
 court.flashImpact('wall',side,{y:1});court.clearImpacts();for(const o of court.endGuides.find(e=>e.side===side).group.children.filter(o=>o.userData.impactSurface==='wall'))assert.equal(o.material.opacity,o.userData.restOpacity);
}
assert.equal(cleanSettings({court:'8',mode:'footwork'}).court,'8');
const code=fs.readFileSync(new URL('../dist/game.js',import.meta.url),'utf8'),body=code.slice(code.indexOf('function physics('),code.indexOf('function forecast(')),impacts=[];
const physics=Function('C','sideRoofHeight','endRoofHeight','wallX','wallNormal','reflect','galleryCollision','roofBounce','floorBounce','galleries','beep','fault','point','fall','court',body+';return physics;')(C,sideRoofHeight,endRoofHeight,wallX,wallNormal,reflect,galleryCollision,roofBounce,floorBounce,GALLERIES,()=>{},()=>{},()=>{},()=>{},{collectBall(){},flashImpact:(...args)=>impacts.push(args)});
for(const side of [-1,1]){const wall=()=>({x:-3.8,y:1.8,z:side*((side<0?C.endRoofInner:C.halfLength)-.11),vx:3,vy:0,vz:side*20,bounces:0,crossed:true});physics(wall(),.004,false);assert.equal(impacts.length,0);physics(wall(),.004,true);assert.equal(impacts.pop()[1],side);
 const z=side*(side>0?C.halfLength+.8:C.endRoofInner+.8),roof=()=>({x:0,y:endRoofHeight(z)+.11,z,vx:0,vy:-10,vz:0,bounces:0,crossed:true});physics(roof(),.004,false);assert.equal(impacts.length,0);physics(roof(),.004,true);assert.deepEqual(impacts.pop().slice(0,2),['roof',side]);}
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(html.includes('aria-label="Play mode" hidden'));assert.ok(html.includes('id="sessionStart"'));assert.ok(!html.slice(html.indexOf('id="sessionChooser"')).includes('value="calibrate"'));assert.ok(code.includes("$('#sessionMode').onchange({target:{value}})"));
console.log('Passed: live-only wall/roof impact callbacks, 25% material reveal at both ends, fade/refresh/reset, camera-side visibility, Court 8 preferences and unified session dispatch.');
