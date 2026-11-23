import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/three.module.js';
import {buildCameronHall} from '../dist/cameron-hall.js';
import {buildPlaygroundLighting} from '../dist/playground-lighting.js';
import {COURT as C,wallX} from '../dist/court-geometry.js';
import {COURT_SCHEMES,paintedFloorColor,readCourtScheme} from '../dist/court-schemes.js';
import {cleanSettings} from '../dist/preferences.js';
import {Tournament} from '../dist/tournament.js';
import {ROSTER} from '../dist/roster.js';
const venue=buildCameronHall();venue.setVisible(true);venue.setEndView(1);venue.sides.updateMatrixWorld(true);let profiled=0,frames=0,windows=0,panels=0;const trusses=[];
venue.sides.traverse(o=>{if(o.userData.profiledMainWall){profiled++;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)assert.ok(Math.abs(p.getX(i)-wallX(p.getZ(i))+.012)<2e-6);}if(o.userData.mainWallRun){frames++;for(const t of [-.5,0,.5]){const span=Math.hypot(wallX(o.userData.mainWallRun.b)-wallX(o.userData.mainWallRun.a),o.userData.mainWallRun.b-o.userData.mainWallRun.a),v=o.localToWorld(new THREE.Vector3(t*span,4,0));assert.ok(Math.abs(v.x-wallX(v.z))<1e-6,'upper architecture follows tambour');}}if(o.userData.cameronWindow){windows++;assert.ok(o.material.transparent&&o.material.opacity<.5&&o.material.transmission>0);assert.ok(o.position.z<-.1);}if(o.userData.cameronColorPanel)panels++;if(o.userData.trussZ!==undefined)trusses.push(o);});
assert.equal(profiled,3);assert.equal(frames,3);assert.ok(windows>10&&panels>10);assert.ok(trusses.length>=6);for(const side of [-1,1]){venue.setEndView(side);for(const t of trusses)assert.equal(t.visible,t.userData.trussZ*side<2);}
assert.deepEqual(venue.ends.map(e=>e.userData.endSide),[-1,1]);venue.setVisible(true,true);venue.setEndView(1);assert.ok(trusses.every(t=>!t.visible));assert.ok(venue.ends.every(g=>!g.visible));venue.setVisible(false);assert.ok(!venue.sides.visible);
const code=fs.readFileSync(new URL('../dist/cameron-hall.js',import.meta.url),'utf8');assert.ok(!code.includes('fillText(')&&!code.includes('sign('),'color and architecture only');
const lighting=buildPlaygroundLighting(),wash=lighting.lights.filter(l=>l.userData.playgroundEndWash);assert.equal(wash.length,2);for(const side of [-1,1]){const light=wash.find(l=>l.userData.playgroundEndWash===side),depth=side>0?C.halfLength:C.endRoofInner;assert.equal(Math.sign(light.position.z),side);for(const x of [-4,0,4]){const point=new THREE.Vector3(x,2.5,side*depth),d=point.distanceTo(light.position),normal=Math.abs(point.z-light.position.z)/d,illum=light.intensity/(d*d)*(1-(d/light.distance)**4)**2*normal;assert.ok(illum>.12,'both back walls get a modest warm lift across their width');}}assert.equal(lighting.group.visible,false,'daytime unaffected');
assert.equal(COURT_SCHEMES['14'].name,'Cameron Indoor');assert.equal(cleanSettings({court:'14'}).court,'14');assert.equal(readCourtScheme({getItem:()=> '14'}),'14');assert.notEqual(paintedFloorColor('14',0,0),paintedFloorColor('13',0,0));const t=new Tournament({entrants:ROSTER.slice(0,8).map(p=>p.id),courts:['14','13','12','1','2','3','4']});assert.equal(t.courtFor('q1'),'14');assert.ok(fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8').includes('value="14">Cameron Indoor'));
console.log('Passed: Cameron colors and sign-free architecture, tambour-aligned walls, transparent recessed glass, camera cutaway trusses, saved/tournament selection, localized lighting across both Playground ends.');
