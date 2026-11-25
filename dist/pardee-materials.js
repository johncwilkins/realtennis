import * as THREE from './three.module.js';
// Small-scale mineral variation and wear, held at a physical scale by the venue UVs.
export function pardeeMaterialMaps(kind){const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d');let seed=kind==='slate'?1973:1873;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 c.fillStyle=kind==='slate'?'#565d63':kind==='stone'?'#716050':'#b8b0a0';c.fillRect(0,0,1024,1024);
 if(kind==='slate')for(let row=0;row<12;row++){const y=row*86;for(let col=-1;col<9;col++){const x=col*128+(row%2)*64,v=Math.floor(125+rnd()*22);c.fillStyle=`rgb(${v-9},${v-2},${v+5})`;c.fillRect(x+1,y+1,126,84);c.fillStyle='#cad0ce18';c.fillRect(x+3,y+2,123,2);c.fillStyle='#252c333b';c.fillRect(x+1,y+82,127,3);for(let n=0;n<24;n++){c.strokeStyle=n%3?'#e3e4df0b':'#25323b0e';const xx=x+rnd()*126,yy=y+rnd()*80;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+10+rnd()*35,yy+1+rnd()*2);c.stroke();}}}
 if(kind==='stone')for(let row=0;row<12;row++){const y=row*86;for(let col=-1;col<6;col++){const x=col*205+(row%2)*103,v=Math.floor(rnd()*19);c.fillStyle=`rgb(${144+v},${121+v},${102+v})`;c.fillRect(x+2,y+2,201,82);c.fillStyle='#ddd0b91b';c.fillRect(x+3,y+3,199,3);c.fillStyle='#372c2320';c.fillRect(x+3,y+79,199,4);}}
 for(let i=0;i<38000;i++){c.fillStyle=i%2?'#f6ebd41a':'#252b2b12';c.fillRect(rnd()*1024,rnd()*1024,.6+rnd()*3,.6+rnd()*2);}
 for(let i=0;i<220;i++){const x=rnd()*1024,y=rnd()*1024,r=8+rnd()*85,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,i%3?'#263c4010':'#c9be9920');g.addColorStop(1,'#39413a00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
 // Rain washes and tiny mineral veins break up otherwise regular blocks and tiles.
 for(let i=0;i<90;i++){c.strokeStyle=kind==='slate'?'#2b383d0b':'#4f45381a';c.lineWidth=.4+rnd()*2;const x=rnd()*1024,y=rnd()*1024;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+3,y+35,x-3,y+70,x+rnd()*8,y+110+rnd()*100);c.stroke();}
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;
 const relief=map.clone();relief.colorSpace=THREE.NoColorSpace;relief.needsUpdate=true;
 return {map,bumpMap:relief,bumpScale:kind==='stone'?.035:kind==='slate'?.012:.008,roughnessMap:relief,roughness:kind==='slate'?.94:.96};}
