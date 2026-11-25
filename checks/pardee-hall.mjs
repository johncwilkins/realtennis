import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/three.module.js';
import {buildCourt} from '../dist/court.js';
import {courtScheme,readCourtScheme,paintedFloorColor} from '../dist/court-schemes.js';
import {cleanSettings} from '../dist/preferences.js';
import {wallX} from '../dist/court-geometry.js';
const gradient={addColorStop(){}},ctx=new Proxy({measureText:()=>({width:30}),createRadialGradient:()=>gradient,createLinearGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:()=>{}});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};
const scene=new THREE.Scene();scene.fog=new THREE.Fog('#123456',32,70);const court=buildCourt(scene,{capabilities:{getMaxAnisotropy:()=>1}});
assert.ok(!court.themedVenues['22']);assert.equal(court.setScheme('22').name,'Pardee Hall');const venue=court.themedVenues['22'];assert.ok(venue.sides.visible);assert.equal(scene.fog.near,65);assert.equal(scene.fog.far,110);
let panes=0,dormers=0,mansards=0,pavilions=0,profiles=0;for(const root of [venue.sides,...venue.ends])root.traverse(o=>{if(o.userData.pardeeDormer)dormers++;if(o.userData.pardeeWindow){panes++;assert.ok(o.material.transparent&&o.material.opacity<.3&&o.material.transmission>.5);const uv=o.geometry.attributes.uv;for(let i=0;i<uv.count;i++)assert.ok(uv.getX(i)>=-.001&&uv.getX(i)<=1.001&&uv.getY(i)>=-.001&&uv.getY(i)<=1.001);}if(o.userData.pardeeWindowTrim){assert.ok(o.geometry.isBufferGeometry);assert.equal(o.geometry.type,'ShapeGeometry','window surrounds are flat');assert.ok(o.position.z<0,'trim stays behind the wall face');}if(o.userData.pardeeMansard){mansards++;const bounds=new THREE.Box3().setFromObject(o);assert.ok(bounds.max.y-bounds.min.y>3.4,'broad steep mansard dominates the silhouette');}if(o.userData.pardeePavilion)pavilions++;if(o.userData.profiledMainWall){profiles++;assert.equal(o.userData.profiledMainWall.high,6.1);const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)assert.ok(Math.abs(p.getX(i)-(wallX(p.getZ(i))-.012))<2e-6);}});
assert.ok(panes-dormers>=10&&panes-dormers<=20,'one sparse row replaces the crowded two-story window grid');assert.ok(mansards>=6);assert.equal(pavilions,2);assert.equal(profiles,3);
for(const side of [-1,1]){court.setEndView(side);assert.equal(court.wallEnds.find(e=>e.side===side).group.visible,false);assert.ok(court.wallEnds.every(e=>!e.objects.some(o=>o.userData.solidEndUpper&&o.visible)));}
court.setView('overview');assert.ok(venue.ends.every(e=>!e.visible));court.setView('low');assert.ok(venue.ends.every(e=>e.visible));const count=scene.children.length;court.setScheme('22');assert.equal(scene.children.length,count);assert.equal(cleanSettings({court:'22'}).court,'22');assert.equal(readCourtScheme({getItem:()=>'22'}),'22');assert.equal(courtScheme('22').colors.lower,'#71313f');assert.equal(paintedFloorColor('22',0,0),'#a77c4e');assert.ok(court.floor.material.map.isCanvasTexture);
court.setScheme('14');assert.ok(!venue.sides.visible);court.setScheme('22');assert.ok(venue.sides.visible);
const source=fs.readFileSync(new URL('../dist/pardee-hall.js',import.meta.url),'utf8');assert.ok(!/fillText|TextGeometry|load\(/.test(source),'architecture contains no signs, logos or external image assets');const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(html.includes('value="22">Pardee Hall</option>'));
delete globalThis.document;console.log('Passed Pardee registration, lazy reuse, glazing, mansards, pavilions, tambour, solid walls, view cutaways and no signage.');
