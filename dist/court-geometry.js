// Shared dimensions for rendered surfaces and collision planes (metres).
export const COURT={halfWidth:5,halfLength:14.63,serviceLineZ:-8.2292,faultLineX:1.75,roofInnerX:-4.85,roofOuterX:-7.175,roofLow:2.25,roofHigh:3.4,endRoofInner:12.305,tambourStart:-10.23,tambourEnd:-11.43,tambourInset:.72,dedans:{x:0,y:1.60,w:6.035,h:1.10},grille:{x:3.45,y:1.60,w:1.00,h:1.10}};
export const sideRoofHeight=x=>COURT.roofLow+(-x+COURT.roofInnerX)*(COURT.roofHigh-COURT.roofLow)/(COURT.roofInnerX-COURT.roofOuterX);
export const endRoofHeight=z=>COURT.roofLow+(Math.abs(z)-(z>0?COURT.halfLength:COURT.endRoofInner))*(COURT.roofHigh-COURT.roofLow)/(COURT.halfLength-COURT.endRoofInner);
export function wallX(z){if(z>=COURT.tambourStart)return 5;if(z<=COURT.tambourEnd)return 5-COURT.tambourInset;return 5-COURT.tambourInset*(COURT.tambourStart-z)/(COURT.tambourStart-COURT.tambourEnd);}
export function wallNormal(z){const slope=z<COURT.tambourStart&&z>COURT.tambourEnd?COURT.tambourInset/(COURT.tambourStart-COURT.tambourEnd):0;const n=Math.hypot(1,slope);return {x:-1/n,z:slope/n};}
export function reflect(b,n,restitution=.8){const dot=b.vx*n.x+b.vy*(n.y||0)+b.vz*(n.z||0);if(dot>=0)return false;b.vx-=(1+restitution)*dot*n.x;b.vy-=(1+restitution)*dot*(n.y||0);b.vz-=(1+restitution)*dot*(n.z||0);return true;}
export const GALLERY={frontX:-4.87,netX:-5.20,low:1.05,high:2.15,halfWidth:.58,postHalfWidth:.12};
const galleryWidths=[1.647,1.14,2.775,2.775];let galleryEdge=1.075;
export const GALLERY_BAYS=galleryWidths.map(width=>{const bay={z:galleryEdge+width/2,halfWidth:width/2,width};galleryEdge+=width;return bay;});
export const GALLERIES=[-1,1].flatMap(side=>GALLERY_BAYS.map((bay,i)=>({...GALLERY,...bay,z:side*bay.z,win:side===-1&&i===3,name:i===0?'First gallery':i===1?'Door':i===2?'Second gallery':side===-1?'Winning gallery':'Last gallery'})));

export function galleryCollision(old,b,galleries=GALLERIES,radius=.095){if(b.x>=old.x)return null;
 const crossing=x=>old.x>x&&b.x<=x;const at=x=>{const t=(old.x-x)/(old.x-b.x);return {x,y:old.y+(b.y-old.y)*t,z:old.z+(b.z-old.z)*t};};
 const frameX=GALLERY.frontX+radius;
 if(crossing(frameX)){const p=at(frameX);if(p.y<2.25+radius){const near=galleries.filter(g=>Math.abs(p.z-g.z)<=g.halfWidth+g.postHalfWidth).sort((a,b)=>Math.abs(a.z)-Math.abs(b.z));const g=near[0];const clearHeight=p.y-radius>(g?.low??GALLERY.low)&&p.y+radius<(g?.high??GALLERY.high);if(!g||!clearHeight)return {kind:'wall',...p};if(Math.abs(p.z-g.z)>g.halfWidth-radius)return {kind:'gallery',gallery:g,...p};}}
 const netX=GALLERY.netX+radius;if(crossing(netX)){const p=at(netX);const g=galleries.find(g=>Math.abs(p.z-g.z)<=g.halfWidth&&p.y>=g.low&&p.y<=g.high);if(g)return {kind:'gallery',gallery:g,...p};}return null;
}

// Modest spring and a rounded valley seam; all impacts still lose energy.
export function roofBounce(b,n){if(b.x<COURT.roofInnerX&&b.x>COURT.roofOuterX&&Math.abs(b.z)>(b.z>0?COURT.halfLength:COURT.endRoofInner)&&Math.abs(b.z)<(b.z>0?COURT.halfLength+(COURT.halfLength-COURT.endRoofInner):COURT.halfLength)){const gap=sideRoofHeight(b.x)-endRoofHeight(b.z);if(Math.abs(gap)<.10){const slope=(COURT.roofHigh-COURT.roofLow)/(COURT.roofInnerX-COURT.roofOuterX),w=(gap/.10+1)/2,length=Math.hypot(slope*w,1,slope*(1-w));n={x:slope*w/length,y:1/length,z:-Math.sign(b.z)*slope*(1-w)/length};}}if(!reflect(b,n,.42))return false;const normal=b.vx*n.x+b.vy*(n.y||0)+b.vz*(n.z||0);b.vx=normal*n.x+(b.vx-normal*n.x)*.90;b.vy=normal*(n.y||0)+(b.vy-normal*(n.y||0))*.90;b.vz=normal*(n.z||0)+(b.vz-normal*(n.z||0))*.90;return true;}

export const STANDARD_SERVE={x:-2.6,y:1.9,z:6,vx:-6.75,vy:4.5,vz:-10};

export const playDepth=side=>side<0?COURT.endRoofInner:COURT.halfLength;
