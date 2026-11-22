import assert from 'node:assert/strict';
import fs from 'node:fs';
import {athleteProfile,skillShot} from '../dist/athlete.js';
import {ROSTER} from '../dist/roster.js';
import {WheelStroke,canContact,contactShot,movePlayer} from '../dist/controls.js';
import {TambourRead} from '../dist/tambour-read.js';
import {characterReturn} from '../dist/character-play.js';
import {opponentCanContact} from '../dist/opponent.js';
import {COURT as C,sideRoofHeight,endRoofHeight,wallX,wallNormal,reflect,galleryCollision,GALLERIES,roofBounce} from '../dist/court-geometry.js';
import {floorBounce} from '../dist/rally.js';
const character=rating=>({...ROSTER[0],ratings:Object.fromEntries(Object.keys(ROSTER[0].ratings).map(k=>[k,rating]))});
const low=character(30),high=character(80),weak=athleteProfile(low),strong=athleteProfile(high);
assert.ok(weak.reaction>strong.reaction+.12);assert.ok(weak.thinkInterval>strong.thinkInterval*1.7);assert.ok(weak.recoveryFactor<strong.recoveryFactor-.19);
const stroke=new WheelStroke();Object.assign(stroke,{armed:true,contactStarted:true,activeUntil:1000,pose:.5});assert.ok(!stroke.canHit(1030,30));assert.ok(stroke.canHit(1030,80));assert.ok(!stroke.canHit(1040,80));stroke.hit=true;assert.ok(!stroke.canHit(1000,80),'no second contact');stroke.hit=false;stroke.armed=false;assert.ok(!stroke.canHit(1000,80),'still requires a swing');
for(const side of [-1,1]){const player={x:0,z:side*7},ball={x:side*1.85,y:1,z:side*7};assert.ok(!canContact(ball,player,side,30));assert.ok(canContact(ball,player,side,80));ball.x=side*2;assert.ok(!canContact(ball,player,side,80),'contact allowance stays small');const b={x:side*.7,y:1,z:side*6.4};assert.ok(Math.abs(contactShot(b,player,side,.5,1,'regular',80).angle)<Math.abs(contactShot(b,player,side,.5,1,'regular',30).angle));}
let seed=522;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
function errors(profile,pressure){let n=0;for(let i=0;i<12000;i++)n+=!!skillShot({vx:0,vy:5,vz:-16},{x:0,y:1,z:7},profile,6,random,{opponent:true,pressure}).unforcedError;return n/12000;}
const rates={weakSet:errors(weak,0),weakRushed:errors(weak,1),strongSet:errors(strong,0),strongRushed:errors(strong,1)};assert.ok(rates.weakRushed>rates.weakSet+.12);assert.ok(rates.strongRushed<rates.weakRushed*.5);
const source=fs.readFileSync(new URL('../dist/game.js',import.meta.url),'utf8'),code=source.slice(source.indexOf('function physics('),source.indexOf('function forecast('));
const physics=Function('C','sideRoofHeight','endRoofHeight','wallX','wallNormal','reflect','galleryCollision','roofBounce','floorBounce','galleries','beep','fault','point','fall','court',code+';return physics;')(C,sideRoofHeight,endRoofHeight,wallX,wallNormal,reflect,galleryCollision,roofBounce,floorBounce,GALLERIES,()=>{},()=>{},()=>{},()=>{},{collectBall(){}});
// Identical drives, positions and court physics for the two ratings, from both ends.
function coverage(profile){let returned=0,legal=0;seed=117;for(const side of [-1,1])for(const x of [-2,0,2])for(const ahead of [-1.1,0,1.1])for(const power of [.4,.7,.95]){const b={x,y:1.1,z:side*7},ball={...b,...contactShot(b,{x:x-side*.65,z:b.z+side*ahead},side,power,1,'drive',80),bounces:0,crossed:false,last:0,serve:false,roof:false},p={x:0,z:-side*7,vx:0,vz:0},read=new TambourRead();read.begin(profile,random);let target={...p},next=profile.reaction,crossed=false;for(let n=0;n<600;n++){const time=n/120;if(physics(ball,1/120,false))break;crossed ||=ball.crossed;read.observe(ball,1/120);if(time>=next){next=time+profile.thinkInterval;const meeting=read.intercept(ball,p,-side,physics,profile);if(meeting)target=meeting;}movePlayer(p,target,1/120,{maxSpeed:profile.speed,acceleration:profile.acceleration,braking:profile.braking});if(time>=profile.reaction&&ball.crossed&&ball.z*-side>.4&&(!target.waitBack||(ball.backContacts||0)>0)&&opponentCanContact(ball,p,profile)){returned++;break;}}legal+=crossed;}return {returned,legal};}
const coverageLow=coverage(weak),coverageHigh=coverage(strong);assert.equal(coverageLow.legal,coverageHigh.legal);assert.ok(coverageHigh.returned>coverageLow.returned+5);assert.ok(coverageLow.returned>0,'weak players still return ordinary shots');
function choices(c){let advanced=0,central=0;for(let i=0;i<120;i++){const from={x:0,y:1.1,z:7,vx:0,vz:14},v=characterReturn(from,{x:0,z:-7},1,physics,c,100,null,0,random);advanced+=!!v.route;const flight={...from,...v,bounces:0,crossed:false,serve:false};for(let j=0;j<700;j++){if(physics(flight,1/120,false))break;if(flight.bounces){central+=Math.abs(flight.x)<1.6;break;}}}return {advanced,central};}
const choicesLow=choices(low),choicesHigh=choices(high);assert.ok(choicesHigh.advanced>choicesLow.advanced*2);assert.ok(choicesLow.central>choicesHigh.central);
// Repeat forecasts use one persistent read per shot, rather than shaking the target each frame.
const read=new TambourRead(),b={x:0,y:1,z:7,vx:2,vy:5,vz:-15,crossed:false,bounces:0,serve:false};read.begin(weak,()=>.9);const p={x:0,z:-7,vx:0,vz:0},a=read.intercept(b,p,-1,physics,weak),again=read.intercept(b,p,-1,physics,weak);assert.deepEqual(a,again);assert.ok(a.x>=-4.35&&a.x<=wallX(a.z)-.45);
console.log('Passed: rating-dependent timing, bounded contact/steering allowance, pressure errors, realistic coverage separation, weaker tactics and persistent anticipation.',{rates,coverageLow,coverageHigh,choicesLow,choicesHigh});
