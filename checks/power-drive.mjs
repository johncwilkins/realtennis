import assert from 'node:assert/strict';
import fs from 'node:fs';
import {contactShot,ShotChoice} from '../dist/controls.js';
import {expendEnergy,skillShot,athleteProfile} from '../dist/athlete.js';
import {getCharacter} from '../dist/roster.js';
import {strokePose,supportArmPose} from '../dist/arm-pose.js';
const c=getCharacter('whitney'),p={x:0,z:7},ball={x:.75,y:1.1,z:7},stance={settledTime:.5,speed:0};
const normal=contactShot(ball,p,1,.8,1,'drive',75,stance),hard=contactShot(ball,p,1,.8,1,'power-drive',75,stance);assert.ok(Math.abs(hard.speed/normal.speed-1.17)<1e-12);assert.equal(hard.elevation,normal.elevation);assert.equal(hard.angle,normal.angle);assert.equal(hard.kind,'power-drive');
const choice=new ShotChoice();choice.select('power-drive');assert.equal(choice.consume(),'power-drive');assert.equal(choice.consume(),'regular');
let regular=100,drives=100,whacks=100;for(let i=0;i<80;i++){regular=expendEnergy(regular,c,{stroke:'regular',power:1});drives=expendEnergy(drives,c,{stroke:'drive',power:1});whacks=expendEnergy(whacks,c,{stroke:'power-drive',power:1});}assert.ok(regular>drives&&drives>whacks+15);assert.ok(drives<90,'sustained full drives now noticeably spend stamina');assert.ok(expendEnergy(100,c,{stroke:'drive',power:1})<expendEnergy(100,c,{stroke:'drive',power:.4}));
const profile=athleteProfile(c),a=skillShot(normal,ball,profile,1,()=>1,{errors:false}),b=skillShot(hard,ball,profile,1,()=>1,{errors:false});assert.ok(Math.abs(Math.atan2(b.vx,-b.vz))>Math.abs(Math.atan2(a.vx,-a.vz))*1.7,'power drive sacrifices directional control');
const source=fs.readFileSync(new URL('../dist/game.js',import.meta.url),'utf8'),listeners={};let selected=null;Function('renderer','chooseShot',source.match(/renderer\.domElement\.addEventListener\('dblclick'.*\);/)[0])({domElement:{addEventListener:(event,fn)=>listeners[event]=fn}},kind=>selected=kind);listeners.dblclick({button:0,preventDefault(){}});assert.equal(selected,'power-drive');assert.ok(source.includes('stroke:shotChoice.kind,power:calibration.power'),'missed hard swings pay their effort cost once');
let previous;const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));for(let phase=-1;phase<=1;phase+=.02){const pose=strokePose(phase,-1);assert.ok(Math.abs(dist(pose.shoulder,pose.elbow)-.34)<1e-8);assert.ok(Math.abs(dist(pose.elbow,pose.wrist)-.36)<1e-8);if(previous)assert.ok(dist(pose.wrist,previous)<.035,'backhand sweeps continuously');previous=pose.wrist;}
assert.ok(strokePose(0,-1).elbow[2]>-.1);assert.ok(supportArmPose(0,-1,-1).wrist[2]<-.3,'free arm helps across-body preparation');assert.ok(supportArmPose(0,1,-1).wrist[0]>.4,'free arm releases for follow-through');
console.log('Passed double-click selection, one-shot reset, 17% extra pace, greater directional risk and stamina cost; repeated normal drives retain speed but spend stamina; continuous anatomical backhand.',{regular,drives,whacks});
