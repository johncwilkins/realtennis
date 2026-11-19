import {canReturnService} from './serves.js';
import {COURT,wallX,playDepth} from './court-geometry.js';
const profiles=[{speed:4.2,acceleration:8,braking:13,reaction:.32,reach:.95,height:1.9,recover:6.8},{speed:4.9,acceleration:9.5,braking:15,reaction:.24,reach:1.03,height:2,recover:7},{speed:5.6,acceleration:11,braking:16,reaction:.19,reach:1.1,height:2.05,recover:7.2}];
export const opponentProfile=d=>typeof d==='object'&&d!==null?d:profiles[Math.max(0,Math.min(2,d))]??profiles[1];
const volleyIntelligence=p=>Math.max(0,Math.min(1,(p.intelligence??0)/100));
export const opponentContactHeight=p=>p.height+.35*volleyIntelligence(p);
export const opponentVolleyRise=p=>2+1.5*volleyIntelligence(p);
// Recognize a genuinely scoring opening route with the live court physics.
export function openingThreat(ball,side,stepPhysics){if(ball.serve)return null;const b={...ball};for(let i=0;i<480;i++){if(stepPhysics(b,1/120,false)){const opening=side>0?COURT.dedans:COURT.grille;if(b.crossed&&b.z*side>=playDepth(side)-.1&&Math.abs(b.x-opening.x)<opening.w/2&&Math.abs(b.y-opening.y)<opening.h/2)return side>0?'dedans':'grille';return null;}}return null;}
export function opponentCanContact(ball,player,difficulty=1){const p=opponentProfile(difficulty);return ball.y>.15&&ball.y<opponentContactHeight(p)&&ball.vy<opponentVolleyRise(p)&&Math.hypot(ball.x-player.x,ball.z-player.z)<p.reach;}
function travel(time,speed,p){const accelerate=Math.min(time,Math.max(0,(p.speed-speed)/p.acceleration));return speed*accelerate+.5*p.acceleration*accelerate**2+p.speed*(time-accelerate);}
export function opponentIntercept(ball,player,side,stepPhysics,difficulty=1){const p=opponentProfile(difficulty),b={...ball},speed=Math.min(p.speed,Math.hypot(player.vx||0,player.vz||0));let fallback=null,first=null,afterBack=null;const waitForWall=!ball.serve&&ball.vz*side>10&&!(p.openingThreat&&volleyIntelligence(p)>=.5);
 for(let i=1;i<=420;i++){if(stepPhysics(b,1/120,false))break;if(!canReturnService(b)||b.z*side<2.8||b.y<.25||b.y>opponentContactHeight(p)||b.vy>opponentVolleyRise(p)-.2)continue;const z=side*Math.min(playDepth(side)-.55,Math.max(2.8,b.z*side)),x=Math.max(-4.35,Math.min(wallX(z)-.45,b.x-.35*side)),time=i/120,distance=Math.hypot(x-player.x,z-player.z),gap=distance-travel(time,speed,p)-p.reach*.7,candidate={x,z,time,reachable:gap<=0,gap,defendingOpening:p.openingThreat??null,volley:b.bounces===0};candidate.waitBack=(b.backContacts||0)>(ball.backContacts||0);if(gap<=0){first??=candidate;if(candidate.waitBack){afterBack=candidate;break;}if(!waitForWall)break;}if(!fallback||gap<fallback.gap)fallback=candidate;
 }return (waitForWall&&afterBack)||first||fallback;}

export const opponentName=d=>['Amateur','Pro','Champ'][d]??'Champ';
export function opponentError(velocity,from,difficulty,rally,random=Math.random){if(difficulty===2||rally<3)return velocity;const chance=difficulty===0?.11:.045;if(random()>=chance)return velocity;const time=Math.abs(from.z/velocity.vz);if(time<.2||time>2.5)return velocity;const netHeight=.45+random()*.3,vy=(netHeight-from.y+4.905*time*time)/time;return {...velocity,vy:Math.min(velocity.vy,vy),unforcedError:true};}
