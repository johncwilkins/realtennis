import {playDepth} from './court-geometry.js';
// Plan against the same collision step used by the live rally. No scripted rebounds.
export function traceCourtShot(from,velocity,stepPhysics){const b={...from,...velocity,crossed:false,bounces:0,serve:false,roof:false,wallContacts:0,backContacts:0,roofContacts:0};let crossing=false,firstBounce=null;
 for(let i=0;i<720;i++){const before=b.bounces,stop=stepPhysics(b,1/120,false);crossing ||= b.crossed;if(!firstBounce&&b.bounces>before)firstBounce={x:b.x,z:b.z};if(stop)return {ball:b,crossing,firstBounce,time:(i+1)/120};}return {ball:b,crossing,firstBounce,time:6};}
export function planCourtShot(from,opponent,side,stepPhysics,random=Math.random,tactics={}){
 const skill=(tactics.intelligence??100)/100,power=tactics.powerFactor??1;const choice=random(),route=choice<.30?'side-wall':choice<.50?'back-wall':choice<.67?'penthouse':'direct';let best=null;
 // Low contacts need more clearance; vary height and pace while preserving cut.
 for(const speed of [14,18,22,25])for(const rise of [3.5,5,6.5,8])for(const lateral of (route==='penthouse'?[-9,-6,-3]:route==='side-wall'?[4,7,10]:[-1,1,3])){
 const velocity={vx:lateral*power,vy:rise+Math.max(0,.65-from.y),vz:-side*speed*power,cut:route==='back-wall'?.2:.65},trial=traceCourtShot(from,velocity,stepPhysics),b=trial.ball;
 if(!trial.crossing||!trial.firstBounce||trial.firstBounce.z*side>=0)continue;
 const count=route==='side-wall'?b.wallContacts:route==='back-wall'?b.backContacts:route==='penthouse'?b.roofContacts:1;if(!count)continue;
 // Favor deep first bounces and space away from the defender, without firing every shot at an opening.
 const bounce=trial.firstBounce;let score=Math.min(12,Math.abs(bounce.z))*.22+Math.min(5,Math.abs(bounce.x-opponent.x))*.22*skill-Math.abs(rise-5)*.12-(route==='direct'?Math.abs(lateral-1)*.12:0)-Math.max(0,b.bounces<2?1:0);
 if(tactics.chase&&tactics.chase.owner===0&&b.bounces>=2){const end=b.z>0?'service':'hazard',distance=playDepth(Math.sign(b.z))-Math.abs(b.z);score+=end===tactics.chase.end?(distance<tactics.chase.distance-.08?5*skill:-2*skill)-Math.abs(distance-Math.max(.2,tactics.chase.distance-.4))*.2*skill:-3*skill;}if(tactics.intelligence!==undefined)score+=(random()-.5)*.65*(1-skill);
 if(!best||score>best.score)best={...velocity,route,score};
 }
 return best;
}
