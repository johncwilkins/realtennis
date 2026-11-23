import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/three.module.js';
import {buildCourt} from '../dist/court.js';
import {HERITAGE_IDS} from '../dist/heritage-courts.js';
import {HERITAGE_SCHEMES} from '../dist/heritage-schemes.js';
import {COURT as C,wallX} from '../dist/court-geometry.js';
import {readCourtScheme,paintedFloorColor} from '../dist/court-schemes.js';
import {cleanSettings} from '../dist/preferences.js';
import {Tournament,saveTournament,loadTournament} from '../dist/tournament.js';
import {ROSTER} from '../dist/roster.js';
// Construct the real court with Canvas API stubs; scene geometry, texture state and
// visibility run unchanged. A stub canvas is not a visual rendering check.
const gradient={addColorStop(){}},ctx=new Proxy({measureText:()=>({width:30}),createRadialGradient:()=>gradient,createLinearGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:()=>{}});globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};
const scene=new THREE.Scene();scene.fog=new THREE.Fog('#123456',32,70);const court=buildCourt(scene,{capabilities:{getMaxAnisotropy:()=>1}}),initial=scene.children.length;
for(const id of HERITAGE_IDS)assert.ok(!court.themedVenues[id],'new venues load on selection');
const floors=new Set(),features={};
for(const id of HERITAGE_IDS){const scheme=court.setScheme(id),venue=court.themedVenues[id];assert.equal(scheme.name,HERITAGE_SCHEMES[id].name);assert.ok(venue.sides.visible);assert.equal(scene.background.getHexString(),scheme.sky.slice(1));assert.equal(court.floor.material.map.isCanvasTexture,true);floors.add(paintedFloorColor(id,0,0));let profiled=0,windows=0,ivy=0,ships=0,cranes=0,canals=0,bathhouse=0;const roofs=[];
 venue.sides.updateMatrixWorld(true);venue.sides.traverse(o=>{if(o.userData.profiledMainWall){const p=o.geometry.attributes.position;profiled++;for(let i=0;i<p.count;i++)assert.ok(Math.abs(p.getX(i)-(wallX(p.getZ(i))-.012))<2e-6,'decorative wall follows physical tambour');}if(o.userData.heritageWindow){windows++;assert.ok(o.material.transparent&&o.material.opacity<.5);const uv=o.geometry.attributes.uv;for(let i=0;i<uv.count;i++)assert.ok(uv.getX(i)>-.001&&uv.getX(i)<1.001&&uv.getY(i)>-.001&&uv.getY(i)<1.001,'window textures normalized inside each opening');}if(o.userData.wrigleyIvy)ivy++;if(o.userData.dockShip)ships++;if(o.userData.dockCrane)cranes++;if(o.userData.venetianCanal)canals++;if(o.userData.poolBathhouse)bathhouse++;if(o.userData.trussZ!==undefined)roofs.push(o);});assert.ok(profiled>=3);features[id]={windows,ivy,ships,cranes,canals,bathhouse};
 for(const side of [-1,1]){court.setEndView(side);for(const e of court.wallEnds){assert.equal(e.group.visible,e.side!==side);assert.ok(!e.objects.some(o=>o.userData.solidEndUpper&&o.visible),'old wall cannot block custom architecture');}for(const r of roofs)assert.equal(r.visible,r.userData.trussZ*side<2);}
 court.setView('overview');assert.ok(venue.ends.every(e=>!e.visible));assert.ok(roofs.every(r=>!r.visible));court.setView('play');const same=venue.sides.uuid,count=scene.children.length;court.setScheme(id);assert.equal(court.themedVenues[id].sides.uuid,same);assert.equal(scene.children.length,count,'reselection reuses scene objects');assert.equal(cleanSettings({court:id}).court,id);assert.equal(readCourtScheme({getItem:()=>id}),id);
 const coreWall=court.targets.find(o=>o.material.userData.courtRole==='lower');if(coreWall)assert.equal(coreWall.material.map,venue.wallMap);
}
assert.equal(floors.size,4);assert.ok(features['16'].windows>8);assert.ok(features['17'].bathhouse===0);assert.equal(features['18'].ships,0);assert.equal(features['18'].cranes,0);assert.equal(features['19'].canals,1);assert.ok(features['19'].windows>features['16'].windows);
const venice=court.themedVenues['19'];let canal;venice.sides.traverse(o=>{if(o.userData.venetianCanal)canal=o;});const offset=canal.material.map.offset.y;court.updateBalls(.5,{x:0,y:1,z:0});assert.notEqual(canal.material.map.offset.y,offset);court.setScheme('1');for(const id of HERITAGE_IDS)assert.ok(!court.themedVenues[id].sides.visible);const stopped=canal.material.map.offset.y;court.updateBalls(.5,{x:0,y:1,z:0});assert.equal(canal.material.map.offset.y,stopped);assert.equal(scene.background.getHexString(),'162e30');assert.ok(scene.children.length>initial);
const entrants=ROSTER.slice(0,8).map(p=>p.id),data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},t=new Tournament({entrants,courts:[...HERITAGE_IDS,'13','14','12']});saveTournament(storage,t);assert.deepEqual(loadTournament(storage).courts,t.courts);
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');for(const id of HERITAGE_IDS)assert.ok(html.includes(`value="${id}">${HERITAGE_SCHEMES[id].name}`));
console.log('Passed: four distinct floors and venue features; lazy creation and reuse; actual selection, end/overview cutaways, wall maps, tambour alignment, normalized translucent windows, animated canal, saved/tournament selection.',features);
delete globalThis.document;
