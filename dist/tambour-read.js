import {opponentIntercept} from './opponent.js';
import {wallX} from './court-geometry.js';
// One read per incoming shot. Weak thinkers initially treat the angled tambour
// as an ordinary flat wall, then correct after watching the actual ricochet.
export class TambourRead {
 constructor(){this.reset();}
 reset(){this.fooled=false;this.observed=0;this.remaining=0;this.wrongTarget=null;this.delay=0;}
 begin(profile,random=Math.random){this.reset();const iq=Math.max(0,Math.min(1,(profile.intelligence??50)/100));this.fooled=random()<.88*(1-iq)**1.6;this.delay=.16+.72*(1-iq)**1.4;}
 observe(ball,dt){const count=ball.tambourContacts||0;if(count>this.observed){this.observed=count;if(this.fooled)this.remaining=this.delay;}else if(this.remaining>0){this.remaining=Math.max(0,this.remaining-dt);if(this.remaining===0){this.fooled=false;this.wrongTarget=null;}}}
 intercept(ball,player,side,physics,profile){
  if(this.fooled&&this.remaining>0&&this.wrongTarget)return {...this.wrongTarget,misreadTambour:true};
  let sawTambour=false;const perceived=(b,dt,live)=>{const before={...b},stop=physics(b,dt,live);if(this.fooled&&(b.tambourContacts||0)>(before.tambourContacts||0)){sawTambour=true;b.x=wallX(b.z)-.096;b.vx=-Math.abs(before.vx)*.72;b.vz=before.vz*.98;b.vy=before.vy*.95;}return stop;};
  const meeting=opponentIntercept(ball,player,side,this.fooled?perceived:physics,profile);if(this.fooled&&sawTambour&&meeting){this.wrongTarget={...meeting};return {...meeting,misreadTambour:true};}return meeting;
 }
}
