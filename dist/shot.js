// Ballistic solution ends at the selected 3D point, while clearing the sagging net.
export function solveShot(from,to,{kind='drive',power=.5}={}){
 const dx=to.x-from.x,dz=to.z-from.z,dy=to.y-from.y,dist=Math.hypot(dx,dz),speed=kind==='lob'?10:kind==='cut'?13+power*3:15+power*7;
 let time=Math.max(.5,dist/speed);const u=-from.z/dz;
 if(u>0&&u<1){const netX=from.x+u*dx,required=.9144+.61*(Math.abs(netX)/5)**1.7+(kind==='cut'?.16:.2);const linear=from.y+u*dy;const needed=Math.max(0,(required-linear)*2/(9.81*u*(1-u)));time=Math.max(time,Math.sqrt(needed));}
 if(kind==='lob')time=Math.max(time,dist/10+.3);
 return {vx:dx/time,vy:(dy+4.905*time*time)/time,vz:dz/time,time,cut:kind==='cut'?.65:0};
}
