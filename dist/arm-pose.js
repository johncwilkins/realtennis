const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),len=v=>Math.hypot(...v),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),scale=(v,k)=>v.map(x=>x*k),add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]);
export function raisedBackswing(shoulder=[-.22,1.34,0],hand=1){const upper=scale([-hand*.25,-.10,-.21],.34/Math.hypot(.25,.10,.21)),elbow=add(shoulder,upper),rise=.36/Math.sqrt(2),dx=hand<0?.18:-.08,wrist=add(elbow,[dx,rise,-Math.sqrt(rise*rise-dx*dx)]);return {elbow,wrist};}
export function strokePose(position=0,hand=1){
 const p=clamp(position,-1,1),bh=clamp((1-hand)/2,0,1),shoulder=[-.22,1.34,0],contact=lerp([-hand*.64,1.02,0],[.38,1.05,.19],bh),backPose=raisedBackswing(shoulder,hand),back=lerp(backPose.wrist,[.18,1.35,-.40],bh),follow=lerp([-hand*.17,1.30,.57],[.08,1.46,.52],bh);
 const desired=p<0?lerp(contact,back,1-(1+p)**2):lerp(contact,follow,p),delta=sub(desired,shoulder),distance=clamp(len(delta),.08,.695),dir=scale(delta,1/(len(delta)||1));const wrist=add(shoulder,scale(dir,distance));
 // Fixed-length upper arm and forearm, with the elbow bent back away from the court's forward axis.
 const upper=.34,forearm=.36,a=(upper*upper-forearm*forearm+distance*distance)/(2*distance),h=Math.sqrt(Math.max(0,upper*upper-a*a)),forehandPole=p<0?lerp([-.18,.25,-1],sub(backPose.elbow,shoulder),Math.min(1,-p*2)):[-.18,.25,-1],pole=lerp(forehandPole,p<0?[.35,-.35,-.22]:[.15,-.45,.65],bh),ortho=sub(pole,scale(dir,dot(pole,dir))),bend=scale(ortho,1/(len(ortho)||1)),elbow=add(add(shoulder,scale(dir,a)),scale(bend,h));
 const theta=p*(p<0?1.36:1.22),yaw=hand*theta+(1-hand)*Math.PI/2,shaft=[-Math.cos(yaw),0,Math.sin(yaw)].map(v=>Math.abs(v)<1e-12?0:v),head=add(wrist,scale(shaft,.45));
 return {shoulder,elbow,wrist,head,shaft,yaw,hand,position:p};
}

export function armTo(shoulder,desired,pole=[-.6,-.2,0]){const delta=sub(desired,shoulder),distance=clamp(len(delta),.08,.695),dir=scale(delta,1/(len(delta)||1)),wrist=add(shoulder,scale(dir,distance)),upper=.34,forearm=.36,a=(upper*upper-forearm*forearm+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,upper*upper-a*a)),ortho=sub(pole,scale(dir,dot(pole,dir))),bend=scale(ortho,1/(len(ortho)||1)),elbow=add(add(shoulder,scale(dir,a)),scale(bend,height));return {shoulder,elbow,wrist};}

// The free arm balances the shoulder turn, then releases as the racket comes through.
export function supportArmPose(ready=0,phase=0,hand=1,celebrate=0){const w=clamp(ready,0,1),p=clamp(phase,-1,1),rest=[.30,1.06,.22],back=hand<0?[.24,1.34,-.56]:[.46,1.17,.12],follow=hand<0?[.48,1.2,.04]:[.14,1.17,.34];let desired=p<0?lerp(rest,back,-p):lerp(rest,follow,p);desired=lerp(desired,[.045,.91,.38],w);desired=lerp(desired,[.32,1.66,.20],clamp(celebrate,0,1));return armTo([.235,1.28,0],desired,[.6,-.2,hand<0?-.3:.1]);}

