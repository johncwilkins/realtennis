import {COURT} from './court-geometry.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function movePlayer(state,target,dt,{maxSpeed=6.2,acceleration=14,braking=20}={}){
 // Integrate in small steps so the same acceleration and stopping distance apply at any frame rate.
 for(let remaining=dt;remaining>1e-7;){const h=Math.min(remaining,1/120);remaining-=h;const dx=target.x-state.x,dz=target.z-state.z,d=Math.hypot(dx,dz);const speed=Math.min(maxSpeed,Math.sqrt(2*braking*Math.max(0,d-.025)));const wantedX=d>.001?dx/d*speed:0,wantedZ=d>.001?dz/d*speed:0;let ax=wantedX-state.vx,az=wantedZ-state.vz;const change=Math.hypot(ax,az),limit=(Math.hypot(wantedX,wantedZ)<Math.hypot(state.vx,state.vz)?braking:acceleration)*h;if(change>limit){ax*=limit/change;az*=limit/change;}state.vx+=ax;state.vz+=az;state.x+=state.vx*h;state.z+=state.vz*h;if(d<.025&&Math.hypot(state.vx,state.vz)<.2){state.x=target.x;state.z=target.z;state.vx=state.vz=0;}}
 return state;
}
export class WheelStroke{
 constructor(){this.reset();}
 reset(){this.targetHoldUntil=0;this.energyCharged=false;this.position=0;this.pose=0;this.draw=0;this.armed=false;this.forward=false;this.contactStarted=false;this.pendingContact=false;this.contactUntil=0;this.activeUntil=0;this.lastEvent=-1000;this.lastForward=-1000;this.power=0;this.rawRate=0;this.rateSamples=[];this.hit=false;}
 input(delta,time,rateScale=1){const units=Math.abs(delta);if(units<.01)return;const gap=clamp(time-this.lastEvent,1,250);this.lastEvent=time;
 if(delta>0){this.rateSamples=[];this.energyCharged=false;this.draw=clamp(Math.max(this.draw,-this.position)+units/300,0,1);this.position=-this.draw;this.armed=this.draw>=.08;this.forward=false;this.pendingContact=false;this.contactStarted=false;this.contactUntil=0;this.activeUntil=0;this.hit=false;return;}
 if(!this.armed)return;if(!this.hit)this.targetHoldUntil=Math.max(this.targetHoldUntil,time+180);this.rateSamples.push({time,units,gap});this.rateSamples=this.rateSamples.filter(s=>time-s.time<160);const rate=this.rateSamples.reduce((n,s)=>n+s.units,0)/(this.rateSamples.reduce((n,s)=>n+s.gap,0)/1000),rawRate=rate/Math.max(.01,rateScale),p=clamp((rate-180)/3000,.08,1);this.rawRate=time-this.lastForward>220?rawRate:this.rawRate*.25+rawRate*.75;this.power=time-this.lastForward>220?p:this.power*.25+p*.75;this.lastForward=time;this.position=clamp(this.position+units/200,-1,1.1);this.forward=true;if(this.position>=0&&!this.contactStarted)this.pendingContact=true;
 }
 tick(time,dt){if(time<this.contactUntil){this.pose=0;return;}
 const desired=this.position,step=(this.forward?7+12*this.power:8)*dt,next=this.pose+clamp(desired-this.pose,-step,step);
 if(this.pendingContact&&this.pose<=0&&next>=0){this.pose=0;this.contactStarted=true;this.pendingContact=false;this.activeUntil=time+280;this.contactUntil=time+110;this.targetHoldUntil=this.activeUntil+90;}else this.pose=next;
 if(time-this.lastForward>650&&this.position>=0){this.armed=false;this.forward=false;this.draw=0;this.position=0;}
 if(this.hit)this.activeUntil=0;
 }
 canHit(time,accuracy=50){const help=clamp((accuracy-50)/50,0,1);return this.armed&&!this.hit&&this.contactStarted&&time<=this.activeUntil+60*help&&this.pose>=-.01&&this.pose<=.65+.18*help;}
 movementHeld(time){return time<this.targetHoldUntil;}
 consume(time=this.lastForward){this.targetHoldUntil=time+140;this.hit=true;this.activeUntil=0;this.pose=0;this.contactUntil=time+95;}
}
// Feet must have settled before the stroke; swing-time braking alone is not enough.
// Contact is beside the body at comfortable extension, rather than crowded or stretched.
export function driveSupport(ball,player,side,{settledTime=0,speed=0}={}){
 const right=Math.abs(ball.x-player.x),ahead=Math.abs((ball.z-player.z)*side);
 const settled=clamp((settledTime-.16)/.16,0,1),still=clamp((.75-speed)/.50,0,1);
 const extension=clamp((right-.28)/.27,0,1)*clamp((1.45-right)/.35,0,1),timing=clamp((1.15-ahead)/.55,0,1);
 const height=clamp((ball.y-.25)/.35,0,1)*clamp((2.15-ball.y)/.45,0,1);
 return settled*still*extension*timing*height;
}
export function contactShot(ball,player,side,power,preferredHand=0,kind='regular',accuracy=50,stance=null){
 // Forward and right are relative to the player's end, so direction remains correct after changing ends.
 const ahead=(ball.z-player.z)*-side,right=(ball.x-player.x)*side,hand=Math.abs(right)<.2&&preferredHand?preferredHand:right<0?-1:1;const timingError=Math.sign(ahead)*Math.max(0,Math.abs(ahead)-(.45+.18*clamp((accuracy-50)/50,0,1)));const steer=-hand*clamp(timingError/1.15,-1,1),angle=steer*(side*steer>0?.62:.42);const speed=10+12*clamp(power,0,1)**.85;
 // Launch from the racket face, without a net-height solver or clearance correction.
 const loft=kind==='lob',depthLift=clamp((Math.abs(ball.z)-6)*.60,0,6),lowLift=clamp((.85-ball.y)*4,-2.5,3);
 const drive=kind==='drive',p=clamp(power,0,1);let elevation=clamp((drive?10:11.5)+depthLift+lowLift+clamp(ahead,-1.6,1.6)*1.2,drive?6:8,22);
 const support=drive&&stance?driveSupport(ball,player,side,stance):0,baseDrive=Math.min(24,speed*1.16),solidDrive=Math.max(baseDrive,25+3*p);
 const horizontal=loft?8+5*p+clamp((Math.abs(ball.z)-7)*.45,0,3):drive?baseDrive+(solidDrive-baseDrive)*support:speed;
 const vy=loft?7.2+2.2*p+clamp(ahead,-1.6,1.6)*.12:horizontal*Math.tan(elevation*Math.PI/180);if(loft)elevation=Math.atan2(vy,horizontal)*180/Math.PI;
 return {vx:side*Math.sin(angle)*horizontal,vy,vz:-side*Math.cos(angle)*horizontal,ahead,angle,speed:Math.hypot(horizontal,vy),hand,cut:loft?.1:.55,kind:loft?'lob':drive?'drive':'regular',elevation,driveSupport:support};
}
export function canContact(ball,player,side,accuracy=50){const help=clamp((accuracy-50)/50,0,1),right=(ball.x-player.x)*side,ahead=(ball.z-player.z)*-side;return Math.abs(right)<=1.8+.12*help&&Math.abs(ahead)<=1.6+.12*help&&ball.y>=.12&&ball.y<=2.2;}
export function racketSide(ball,player,side,previous=1){let x=ball.x;const distance=Math.abs(ball.z-player.z);if(distance>3&&Math.abs(ball.vz)>.1){const time=(player.z-ball.z)/ball.vz;if(time>0&&time<2){x=ball.x+ball.vx*time;const lo=-4.6,span=9;let folded=((x-lo)%(span*2)+span*2)%(span*2);x=lo+(folded>span?span*2-folded:folded);}}const right=(x-player.x)*side;return right>.12?1:right<-.12?-1:previous;}

// Selection is independent of wheel input and is consumed only on a successful strike.
export class ShotChoice{
 constructor(){this.reset();}
 select(kind){if(kind==='drive'||kind==='lob')this.kind=kind;return this.kind;}
 reset(){this.kind='regular';}
 consume(){const kind=this.kind;this.reset();return kind;}
}

export function canCollectBall(practice,mode,server,position){return !practice&&mode==='ready'&&server===0&&position.z>COURT.halfLength-1.4&&Math.abs(position.x-COURT.dedans.x)<COURT.dedans.w/2;}

