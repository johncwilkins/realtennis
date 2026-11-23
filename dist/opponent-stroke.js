import {opponentCanContact} from './opponent.js';
import {canReturnService} from './serves.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// A computer return requires preparation and one committed contact window.
// An unexpected bounce or late change of direction can make that swing miss.
export class OpponentStroke{
 constructor(){this.reset();}
 reset(){this.phase='reading';this.remaining=0;this.window=0;this.windowMax=1;}
 get pose(){return this.phase==='prepare'?-.65:this.phase==='swing'?.1+.9*(1-this.window/this.windowMax):this.phase==='missed'?1:0;}
 tick(dt,ball,player,profile,physics,waitBack=false){
  if(dt<=0)return;
  if(this.phase==='swing'){this.window-=dt;if(this.window<=0)this.phase='missed';return;}
  if(this.phase==='prepare'){this.remaining-=dt;if(this.remaining<=0){this.phase='swing';this.window=this.windowMax=.055+.065*clamp(profile.accuracy/100,0,1);}return;}
  if(this.phase!=='reading')return;
  const delay=.10+.13*(1-clamp(profile.intelligence/100,0,1)),b={...ball};
  for(let remaining=delay;remaining>1e-7;){const step=Math.min(1/120,remaining);remaining-=step;if(physics(b,step,false))return;}
  const p={x:player.x+(player.vx||0)*delay,z:player.z+(player.vz||0)*delay};
  if(b.crossed&&canReturnService(b)&&(!waitBack||(b.backContacts||0)>0)&&opponentCanContact(b,p,{...profile,reach:profile.reach*.9})){this.phase='prepare';this.remaining=delay;}
 }
 canHit(ball=null,player=null,profile=null){if(this.phase!=='swing'||this.window<=0)return false;if(!ball||!player||!profile)return true;const contactReach=profile.reach*(.70+.20*clamp(profile.accuracy/100,0,1));return Math.hypot(ball.x-player.x,ball.z-player.z)<contactReach;}
 consume(){this.phase='done';this.window=0;}
}
export function computerMistake(velocity,from,profile,rally,pressure=0,random=Math.random){
 const consistency=clamp((profile.consistency-1)/99,0,1),accuracy=clamp(profile.accuracy/100,0,1);
 const chance=.02+.085*(1-consistency)**.55+.045*(1-accuracy)+.02*(1-clamp(profile.intelligence/100,0,1))+Math.min(.06,Math.max(0,rally-3)*.003)+clamp(pressure,0,1)*(.04+.17*(1-consistency))+.012*profile.fatigue;
 if(rally<1||random()>=chance)return velocity;
 // A genuine mishit towards the net, rather than lowering an otherwise valid
 // wall/roof route which could rebound back into a perfectly legal return.
 const vz=-Math.sign(from.z)*clamp(Math.abs(velocity.vz),12,22),time=Math.abs(from.z/vz);
 if(time<.06||!Number.isFinite(time))return velocity;
 const vx=(from.x*.55-from.x)/time,vy=((.55+random()*.18)-from.y+4.905*time*time)/time;
 return {...velocity,vx,vy,vz,speed:Math.hypot(vx,vy,vz),cut:0,unforcedError:true};
}
