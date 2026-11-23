import {computerMistake} from './opponent-stroke.js';
import {planCourtShot} from './court-play.js';
import {matchTarget} from './rally.js';
import {solveShot} from './shot.js';
import {athleteProfile,skillShot} from './athlete.js';
export function characterReturn(from,opponent,side,physics,character,energy,chase,rally,random=Math.random,movement=null){const profile=athleteProfile(character,energy),iq=profile.intelligence/100,target=matchTarget(from,opponent,side,random);let velocity;
 // Stronger thinkers more often plan live wall/roof rebounds and the chase's second bounce.
 if(random()<.08+.85*iq**2)velocity=planCourtShot(from,opponent,side,physics,random,{...profile,chase});
 if(!velocity){if(random()<.85*(1-iq)**1.2){target.x=-.8+random()*2;target.z=-side*(5.5+random()*2.5);target.y=.095;target.kind='center';}velocity=solveShot(from,target,{kind:target.kind==='grille'||target.kind==='dedans'?'drive':'cut',power:(.4+random()*.25)*profile.powerFactor});}
 velocity={...velocity,kind:velocity.route==='penthouse'?'lob':Math.abs(velocity.vz)>20?'drive':'regular'};const distance=movement?Math.hypot(from.x-movement.x,from.z-movement.z):0,speed=movement?Math.hypot(movement.vx||0,movement.vz||0):0;const stretch=Math.max(0,Math.min(1,(distance/profile.reach-.45)/.55)),rush=Math.min(1,speed/profile.speed),pace=Math.max(0,Math.min(1,(Math.hypot(from.vx||0,from.vz||0)-8)/16)),pressure=Math.min(1,(.65*stretch+.35*rush)*(.4+.6*pace));const execution=skillShot(velocity,from,profile,rally,random,{opponent:true,pressure,errors:false});execution.vy+=(random()*2-1)*(.06+.60*(1-profile.accuracy/100))*(1+.8*pressure);return computerMistake(execution,from,profile,rally,pressure,random);}

