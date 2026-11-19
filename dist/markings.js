import {COURT as C,GALLERIES} from './court-geometry.js';
const yard=.9144;
// Main markings shown in the supplied plan; no extra half-yard floor ticks.
export function courtMarkings(){const marks=[];for(let n=1;n<=6;n++)marks.push({z:C.halfLength-n*yard,kind:'full',number:n,end:'service'});
 const service=GALLERIES.filter(g=>g.z>0);for(const g of service)marks.push({z:g.z,kind:'full',name:g.name,end:'service'});
 const last=service.find(g=>g.name==='Last gallery');marks.push({z:last.z-yard,kind:'full',name:'1 yard worse than last gallery',end:'service'});
 for(let n=1;n<=2;n++)marks.push({z:C.serviceLineZ+n*yard,kind:'full',number:n,end:'hazard'});
 for(const g of GALLERIES.filter(g=>g.z<0&&!g.win))marks.push({z:g.z,kind:'full',name:g.name,end:'hazard'});
 return marks;
}
