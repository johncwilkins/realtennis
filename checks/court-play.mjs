import fs from 'node:fs';import assert from 'node:assert/strict';import {COURT as C,sideRoofHeight,endRoofHeight,wallX,wallNormal,reflect,galleryCollision,GALLERIES,roofBounce} from '../dist/court-geometry.js';import {floorBounce} from '../dist/rally.js';import {contactShot,movePlayer} from '../dist/controls.js';import {opponentProfile,opponentIntercept,opponentCanContact} from '../dist/opponent.js';
const source=fs.readFileSync(new URL('../dist/game.js',import.meta.url),'utf8'),code=source.slice(source.indexOf('function physics('),source.indexOf('function forecast('));const physics=Function('C','sideRoofHeight','endRoofHeight','wallX','wallNormal','reflect','galleryCollision','roofBounce','floorBounce','galleries','beep','fault','point','fall','court',code+';return physics;')(C,sideRoofHeight,endRoofHeight,wallX,wallNormal,reflect,galleryCollision,roofBounce,floorBounce,GALLERIES,()=>{},()=>{},()=>{},()=>{},{collectBall(){}});

import {planCourtShot,traceCourtShot} from '../dist/court-play.js';
for(const side of [-1,1])for(const [choice,route,key] of [[.1,'side-wall','wallContacts'],[.4,'back-wall','backContacts'],[.6,'penthouse','roofContacts'],[.9,'direct',null]]){const from={x:0,y:1,z:side*7},shot=planCourtShot(from,{x:0,z:-side*7},side,physics,()=>choice);assert.ok(shot,route+' has a legal candidate from '+side);assert.equal(shot.route,route);const result=traceCourtShot(from,shot,physics);assert.ok(result.crossing&&result.firstBounce.z*side<0);if(key)assert.ok(result.ball[key]>0,route+' actually rebounds');console.log(side,route,JSON.stringify(shot));}
for(const side of [-1,1]){const from={x:0,y:1,z:side*7},shot=planCourtShot(from,{x:0,z:-side*7},side,physics,()=>.4),b={...from,...shot,crossed:false,bounces:0,serve:false,roof:false};const meet=opponentIntercept(b,{x:0,z:-side*7},-side,physics,1);assert.ok(meet?.reachable);assert.ok(meet.waitBack,'deep ball can be taken after its back-wall rebound');}
import {bodyMotion,createFootwork} from '../dist/footwork.js';import * as THREE from '../dist/three.module.js';
assert.ok(bodyMotion(0,1,1,0,.2).lower>bodyMotion(0,1,1,0,1.3).lower,'low contact bends knees more');assert.ok(bodyMotion(.5,1,1,0).weightZ>bodyMotion(-.5,1,0,0).weightZ,'stroke transfers weight forward');
const mat=new THREE.MeshStandardMaterial(),feet=createFootwork(mat,mat);for(let n=0;n<90;n++)feet.pose(1/60,{speed:.5,vx:0,vz:-.5,plant:1,crouch:.14});assert.ok(Math.abs(feet.legs[0].foot.x-feet.legs[1].foot.x)>.4,'planted stance widens');for(const leg of feet.legs)assert.ok(Math.abs(leg.shoe.rotation.y)<.12,'retreat preserves shoe alignment');
console.log('Passed: court-surface shot routes, post-back-wall intercepts, low-contact flex, weight transfer and planted stance.');

const chaseFrom={x:0,y:1,z:7},defender={x:0,z:-7},chase={owner:0,end:'hazard',distance:2};
const chaseResults=[1,100].map(intelligence=>{const shot=planCourtShot(chaseFrom,defender,1,physics,()=>.9,{intelligence,chase});return traceCourtShot(chaseFrom,shot,physics).ball;});
import {playDepth} from '../dist/court-geometry.js';
const chaseDistance=b=>playDepth(Math.sign(b.z))-Math.abs(b.z);
assert.ok(chaseResults.every(b=>b.bounces>=2&&b.z<0));
assert.ok(chaseDistance(chaseResults[0])>2,'low intelligence misses a demanding chase');
assert.ok(chaseDistance(chaseResults[1])<2,'high intelligence places a second bounce to beat the chase');
console.log('Passed: intelligence changes chase tactics against live collision physics.');
