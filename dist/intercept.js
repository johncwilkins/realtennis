import {canReturnService} from './serves.js';
import {movePlayer} from './controls.js';
import {COURT,wallX,playDepth} from './court-geometry.js';
// Forecast with the live game's collision step, so wall, floor, roof and tambour bounces match play.
export function predictIntercept(ball,player,target,side,stepPhysics,previous=1){const b={...ball},p={x:player.x,z:player.z,vx:player.vx||0,vz:player.vz||0};let best=null;const dt=1/90;
 for(let n=1;n<=225;n++){movePlayer(p,target,dt);p.x=Math.max(-4.35,Math.min(wallX(p.z)-.5,p.x));p.z=side*Math.max(.65,Math.min(playDepth(side)-.55,p.z*side));if(stepPhysics(b,dt,false))break;if(b.z*side<=.4||b.y<.12||b.y>2.2||!canReturnService(b))continue;const ahead=(b.z-p.z)*-side,right=(b.x-p.x)*side,score=Math.abs(ahead)+.12*Math.abs(b.y-1)+Math.max(0,Math.abs(right)-1.8)*.25;const hand=right>.2?1:right<-.2?-1:previous;if(!best||score<best.score)best={x:b.x,y:b.y,z:b.z,playerX:p.x,playerZ:p.z,time:n*dt,right,ahead,score,hand};}
 return best;
}
