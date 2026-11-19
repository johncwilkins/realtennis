import {planCourtShot} from './court-play.js';
import {matchTarget} from './rally.js';
import {solveShot} from './shot.js';
import {athleteProfile,skillShot} from './athlete.js';
export function characterReturn(from,opponent,side,physics,character,energy,chase,rally,random=Math.random){const profile=athleteProfile(character,energy),iq=profile.intelligence/100,target=matchTarget(from,opponent,side,random);let velocity;
 // Stronger thinkers more often plan live wall/roof rebounds and the chase's second bounce.
 if(random()<.25+.75*iq)velocity=planCourtShot(from,opponent,side,physics,random,{...profile,chase});
 if(!velocity){if(iq<.5&&random()>.35){target.x=.2+random()*1.2;target.z=-side*(6+random()*3);}velocity=solveShot(from,target,{kind:target.kind==='grille'||target.kind==='dedans'?'drive':'cut',power:(.4+random()*.25)*profile.powerFactor});}
 velocity={...velocity,kind:velocity.route==='penthouse'?'lob':Math.abs(velocity.vz)>20?'drive':'regular'};return skillShot(velocity,from,profile,rally,random);}
