import {chaseCall} from './chase-calls.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),unit=v=>(clamp(v,1,100)-1)/99;
export function athleteProfile(c,energy=100){const r=c.ratings,fatigue=1-clamp(energy,0,100)/100,speedFactor=1-.25*fatigue;return {speed:(2.9+3.4*unit(r.velocity))*speedFactor,acceleration:(4.8+9.7*unit(r.acceleration))*(1-.35*fatigue),braking:14+5*unit(r.acceleration),reaction:.34-.17*unit(r.intelligence),reach:1.03*c.height/72,height:2.05*c.height/72,recover:6.5+2.5*unit(r.intelligence),powerFactor:(.88+.20*unit(r.power))*(1-.16*fatigue),accuracy:r.accuracy,consistency:r.consistency,intelligence:r.intelligence,fatigue};}
export function strokePower(power,profile){return clamp(power*(.72+.40*unit(profile.powerRating??50))*(1-.16*profile.fatigue),0,1);}
export function humanPower(power,c,energy){const p=athleteProfile(c,energy);return strokePower(power,{...p,powerRating:c.ratings.power});}
export function expendEnergy(energy,c,{distance=0,acceleration=0,stroke=null}={}){const efficiency=1.20-.55*unit(c.ratings.stamina),strokeCost=stroke==='drive'?.021:stroke==='lob'?.022:stroke?.014:0;return clamp(energy-efficiency*(Math.max(0,distance)*.006+Math.max(0,acceleration)*.0015+strokeCost),0,100);}
export function recoveryAmount({changed=false,kind='point'}={}){return (changed?.18:0)+(kind==='set'?1.12:kind==='game'?.12:0);}
export const recoverEnergy=(energy,event)=>clamp(energy+recoveryAmount(event),0,100);
export function skillShot(velocity,from,profile,rally=0,random=Math.random,{errors=true,opponent=false}={}){const spread=(.006+.060*(1-unit(profile.accuracy)))*(1+.45*profile.fatigue),yaw=(random()*2-1)*spread,cos=Math.cos(yaw),sin=Math.sin(yaw);let result={...velocity,vx:velocity.vx*cos-velocity.vz*sin,vz:velocity.vx*sin+velocity.vz*cos};
 const chance=opponent?.018+.14*(1-unit(profile.consistency))**1.5+Math.min(.03,Math.max(0,rally-3)*.002)+.014*profile.fatigue:.004+.12*(1-unit(profile.consistency))**2+.008*profile.fatigue;if(errors&&rally>=(opponent?2:3)&&random()<chance){const t=Math.abs(from.z/result.vz);if(t>.2&&t<2.5)result={...result,vy:Math.min(result.vy,((.45+random()*.25)-from.y+4.905*t*t)/t),unforcedError:true};}return result;}
export function chaseAdvice(c,match,side){if(c.ratings.intelligence<50||!match.playing?.length)return '';const chase=match.playing[0],name=chaseCall(chase);return chase.owner===0?`Defend “${name}”: make him stretch.`:`Beat “${name}”: finish your second bounce closer to the back wall.`;}

// A fast ball crowding the torso forces a cramped block rather than a clean swing.
// Use incoming velocity before the return replaces it; lateral spacing lets players escape it.
export function crowdedReturn(velocity,ball,player,profile,random=Math.random){
 const pace=Math.hypot(ball.vx,ball.vz),dx=ball.x-player.x,dz=ball.z-player.z;
 const crowd=clamp(1-Math.abs(dx)/.62,0,1)*clamp(1-Math.abs(dz)/1.6,0,1);
 const height=clamp((ball.y-.15)/.45,0,1)*clamp((2.35-ball.y)/.35,0,1);
 const pressure=crowd*height*clamp((pace-9)/13,0,1);
 if(!Number.isFinite(pressure)||pressure<=0)return velocity;
 const skill=unit(profile.accuracy),severity=pressure*(1.10-.30*skill+.18*profile.fatigue);
 const yaw=(random()*2-1)*.24*severity,scale=1-severity*(.08+.16*random()),c=Math.cos(yaw),s=Math.sin(yaw);
 const vx=(velocity.vx*c-velocity.vz*s)*scale,vz=(velocity.vx*s+velocity.vz*c)*scale;
 const vy=velocity.vy*scale+(random()*2-1)*1.5*severity;
 return {...velocity,vx,vy,vz,speed:Math.hypot(vx,vz),jammed:pressure>.12,bodyPressure:pressure};
}

