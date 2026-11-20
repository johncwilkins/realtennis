import {COURT as C,wallX} from './court-geometry.js';
import {mainWallRuns,venueRear} from './venue-walls.js';
const segments=mainWallRuns().map(r=>[r.xa,r.a,r.xb,r.b]);
segments.push([C.roofOuterX,-C.halfLength,C.roofOuterX,venueRear],[C.roofOuterX,-C.halfLength,wallX(-C.halfLength),-C.halfLength],[C.roofOuterX,venueRear,wallX(venueRear),venueRear]);
// Invert the display UV at each face, then look from that wall toward the live ball.
export function sphereBallGaze(faceX,faceY,ball){
 if(!ball||![ball.x,ball.y,ball.z].every(Number.isFinite))return {x:0,y:0};
 const angle=(faceX/1536-.5)*2*Math.PI,dx=Math.cos(angle),dz=Math.sin(angle),ox=-1.08,oz=1;let radius=Infinity;
 for(const [ax,az,bx,bz]of segments){const sx=bx-ax,sz=bz-az,den=dx*sz-dz*sx;if(Math.abs(den)<1e-8)continue;const qx=ax-ox,qz=az-oz,t=(qx*sz-qz*sx)/den,u=(qx*dz-qz*dx)/den;if(t>0&&u>=0&&u<=1)radius=Math.min(radius,t);}
 if(!Number.isFinite(radius))return {x:0,y:0};
 const x=ox+dx*radius,z=oz+dz*radius,y=((1-faceY/768)-.12)/.88*42,bx=ball.x-x,bz=ball.z-z,by=ball.y-y,distance=Math.max(.1,Math.hypot(bx,by,bz));
 return {x:(-dz*bx+dx*bz)/distance*11,y:-by/distance*14};
}
