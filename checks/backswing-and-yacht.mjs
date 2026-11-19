import assert from 'node:assert/strict';
import * as THREE from '../dist/three.module.js';
import {strokePose} from '../dist/arm-pose.js';
import {createArmRig} from '../dist/arm-rig.js';
import {gallerySpectator} from '../dist/spectators.js';
import {WINDOW_LAYOUTS,portholeLightGeometry} from '../dist/court-windows.js';
import {saveSettings,readSettings} from '../dist/preferences.js';
import {COURT_SCHEMES} from '../dist/court-schemes.js';
const angle=p=>{const d=p.wrist.map((v,i)=>v-p.elbow[i]);return Math.atan2(d[1],Math.hypot(d[0],d[2]))*180/Math.PI;};
for(const hand of [-1,1]){assert.ok(Math.abs(angle(strokePose(-1,hand))-45)<1e-8,'full backswing forearm rises at 45 degrees');assert.ok(angle(strokePose(-.8,hand))>40,'normal drawn backswing is raised on both sides');const m=new THREE.MeshStandardMaterial(),rig=createArmRig(m,m,m);const pose=rig.pose(-1,hand);assert.ok(Math.abs(angle(pose)-45)<1e-8);assert.ok(Math.abs(angle(rig.pose(-1,hand,'regular',.001))-45)<1,'ready-to-stroke blend keeps the raised elbow plane');for(let t=-1;t<=0;t+=.01){const p=strokePose(t,hand);for(const v of [...p.wrist,...p.elbow,...p.head])assert.ok(Number.isFinite(v));}assert.equal(strokePose(0,hand).head[2],0,'contact still perpendicular to court');}
assert.notDeepEqual(WINDOW_LAYOUTS['2'],WINDOW_LAYOUTS['4']);assert.equal(WINDOW_LAYOUTS['5'].porthole,true);assert.ok(COURT_SCHEMES['5'].description.includes('red bootstripe'));const values=new Map(),store={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};saveSettings(store,{court:'5',mode:'footwork'});assert.equal(readSettings(store).court,'5');assert.equal(readSettings(store).mode,'footwork');
for(let i=0;i<12;i++){const p=gallerySpectator(i);assert.equal(p.userData.gallerySpectator,true);assert.ok(!p.children[0].children.some(o=>o.geometry?.type==='BoxGeometry'),'spectators use modeled torsos and arms');p.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(p);assert.ok(bounds.max.y-bounds.min.y>.5);}
console.log('Passed: raised forearms on both stroke sides with fixed contact, unique window layouts, Court 5 persistence and articulated gallery spectators.');

const light=portholeLightGeometry(5,5.45,2),points=light.attributes.position;assert.ok(points.count>60);for(let i=1;i<points.count;i++){const Y=(5-points.getX(i))*1.1,Z=points.getZ(i)-Y*.45/1.1;assert.ok(Math.abs(Math.hypot(Y-5.45,Z-2)-.48)<1e-5,'projected light boundary follows a circle in the window plane');assert.ok(Math.abs(points.getY(i)-.013)<1e-7);}console.log('Passed: porthole light projects the circular aperture into a floor ellipse.');
const watcher=gallerySpectator(2),head=watcher.children[0].children.find(o=>o.userData.spectatorHead);watcher.animateSpectator(1);const look=head.rotation.y;watcher.animateSpectator(4);assert.notEqual(head.rotation.y,look,'spectator looks around over time');watcher.applaud(4);watcher.animateSpectator(4.8);watcher.updateMatrixWorld(true);watcher.traverse(o=>{for(const value of o.matrixWorld.elements)assert.ok(Number.isFinite(value));});watcher.animateSpectator(8);console.log('Passed: spectator idle motion, applause and settling produce finite articulated poses.');
