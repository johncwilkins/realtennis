import {COURT,wallX} from './court-geometry.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function matchTarget(from,opponent,side,random=Math.random){
 const opportunity=random();if(side===1&&opponent.x< -1.5&&from.y>.55&&opportunity<.16)return {x:COURT.grille.x,y:COURT.grille.y,z:-COURT.endRoofInner,kind:'grille'};
 if(side===-1&&opponent.x>2.2&&from.y>.65&&opportunity<.10)return {x:COURT.dedans.x,y:COURT.dedans.y,z:COURT.halfLength,kind:'dedans'};
 const depth=7.0+random()*2.6,z=-side*depth,choice=random();let x,kind;
 if(opponent.x>2.5&&choice<.18){x=-2.1-random()*1.1;kind='crosscourt';}
 else if(choice<.82){x=Math.min(wallX(z)-.55,2.4+random()*1.5);kind='main-wall';}
 else{x=.3+random()*1.2;kind='center';}return {x,y:.095,z,kind};
}
export function floorBounce(b){const cut=clamp(b.cut||0,0,1);b.vy=Math.abs(b.vy)*(.64-.19*cut);b.vx*=.83+.10*cut;b.vz*=.86+.09*cut;}
