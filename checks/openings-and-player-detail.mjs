import assert from 'node:assert/strict';
import fs from 'node:fs';
import {COURT as C,sideRoofHeight,endRoofHeight,wallX,wallNormal,reflect,galleryCollision,GALLERIES,roofBounce} from '../dist/court-geometry.js';
import {floorBounce} from '../dist/rally.js';
import {endGuideGeometry} from '../dist/end-guide.js';
import {supportArmPose} from '../dist/arm-pose.js';
import {randomPlayerBands} from '../dist/player-bands.js';
import {createArmRig} from '../dist/arm-rig.js';
import * as THREE from '../dist/three.module.js';
// T&RA Radley drawing: 6035 mm dedans, 1000 mm grille; 1050 sill and 2150 head.
assert.equal(C.dedans.w,6.035);assert.equal(C.grille.w,1);
for(const side of [-1,1]){const g=side>0?C.dedans:C.grille,guide=endGuideGeometry(side);assert.ok(Math.abs(g.y-g.h/2-1.05)<1e-9);assert.ok(Math.abs(g.y+g.h/2-2.15)<1e-9);assert.equal(guide.opening.right-guide.opening.left,g.w);assert.equal(guide.roof[3][0],C.roofOuterX);}
const src=fs.readFileSync(new URL('../dist/game.js',import.meta.url),'utf8'),code=src.slice(src.indexOf('function physics('),src.indexOf('function forecast('));let outcome='';const physics=Function('C','sideRoofHeight','endRoofHeight','wallX','wallNormal','reflect','galleryCollision','roofBounce','floorBounce','galleries','beep','fault','point','fall','court',code+';return physics;')(C,sideRoofHeight,endRoofHeight,wallX,wallNormal,reflect,galleryCollision,roofBounce,floorBounce,GALLERIES,()=>{},()=>{},(_,r)=>outcome=r,()=>{},{collectBall(){}});
for(const [side,x,y,win]of [[1,2.5,1.6,true],[1,3.2,1.6,false],[1,0,.7,false],[-1,C.grille.x,1.8,true],[-1,C.grille.x,.7,false],[-1,C.grille.x-.65,1.6,false]]){outcome='';const b={x,y,z:side*((side>0?C.halfLength:C.endRoofInner)-.12),vx:0,vy:0,vz:side*12,crossed:true,bounces:0,last:0,serve:false};physics(b,.006,true);assert.equal(!!outcome,win,`opening scoring at ${side},${x},${y}`);if(!win)assert.ok(b.vz*side<0);}
const on=randomPlayerBands(()=>.1),off=randomPlayerBands(()=>.99);assert.ok(on.head&&on.wrist&&on.wristMaterial);assert.ok(off.head&&!off.wrist&&!off.wristMaterial);const m=new THREE.MeshStandardMaterial(),rig=createArmRig(m,m,m,on.wristMaterial);assert.ok(rig.root.children.some(o=>o.userData.wristband));const ready=rig.pose(0,1,'regular',1);assert.ok(ready.wrist[1]<1.02&&ready.head[1]<1.5);
for(const hand of [-1,1])for(let phase=-1;phase<=1;phase+=.05){const p=supportArmPose(0,phase,hand);assert.ok(p.wrist[1]>1.05);assert.ok(Math.abs(Math.hypot(...p.wrist.map((v,i)=>v-p.elbow[i]))-.36)<1e-8);}
console.log('Passed: Radley aperture dimensions and scoring boundaries, full-width roof high edge, random colored accessories, lower ready grip, and raised articulated free arm.');
