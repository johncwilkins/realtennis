import {COURT} from './court-geometry.js';
import {solveShot} from './shot.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function practiceTarget(player,side,returnNumber=0,mode='straight'){return {x:clamp(player.x+(mode==='footwork'?(returnNumber%2===0?2.3:-2.3):0),-4.15,3.8),y:.095,z:side*clamp(player.z*side+1.1,2,COURT.halfLength-.35)};}
export function practiceShot(from,player,side,returnNumber=0,mode='straight'){const target=practiceTarget(player,side,returnNumber,mode),base=solveShot(from,target,{power:.1});const time=Math.max(base.time,Math.hypot(target.x-from.x,target.z-from.z)/11);return {vx:(target.x-from.x)/time,vy:(target.y-from.y+4.905*time*time)/time,vz:(target.z-from.z)/time,time,target,cut:.25};}
