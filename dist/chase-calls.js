import {COURT as C,GALLERIES} from './court-geometry.js';
const YARD=.9144,LINE_TOLERANCE=.03,words=['','a yard','two','three','four','five','six'];
const title=s=>s.charAt(0).toUpperCase()+s.slice(1);
function galleryName(name){return name==='Door'?'the Door Gallery':name==='Last gallery'?'Last Gallery':name==='Second gallery'?'the Second Gallery':name==='First gallery'?'the First Gallery':name==='Line'?'the Line':name;}
// Calls describe the measured second bounce; the precise stored chase remains the scoring target.
export function chaseCall(chase){const hazard=chase.end==='hazard',suffix=hazard?', hazard':'',depth=hazard?C.endRoofInner:C.halfLength,origin=hazard?C.endRoofInner-Math.abs(C.serviceLineZ):0,distance=Math.max(0,chase.distance-origin),galleries=GALLERIES.filter(g=>Math.sign(g.z)===(hazard?-1:1)&&!g.win).map(g=>({distance:depth-Math.abs(g.z)-origin,name:galleryName(g.name)})).sort((a,b)=>a.distance-b.distance);
 if(chase.gallery)return title(galleryName(chase.gallery))+suffix;
 if(distance<.5*YARD-LINE_TOLERANCE)return 'Better than half a yard'+suffix;
 const exact=[{distance:.5*YARD,name:'Half a yard'}],anchors=[];for(let n=1;n<=(hazard?2:6);n++){const anchor={distance:n*YARD,name:words[n]};anchors.push(anchor);exact.push({...anchor,name:title(anchor.name)});if(n<(hazard?2:6))exact.push({distance:(n+.5)*YARD,name:n===1?'One and two':title(words[n]+' and '+words[n+1])});}
 exact.push(...galleries.map(g=>({...g,name:title(g.name)})));
 if(!hazard){const last=galleries.find(g=>g.name==='Last Gallery');exact.push({distance:6.5*YARD,name:'Half a yard worse than six'},{distance:last.distance+.5*YARD,name:'Half a yard worse than Last Gallery'},{distance:last.distance+YARD,name:'A yard worse than the Last Gallery'});}
 const onLine=exact.filter(a=>Math.abs(a.distance-distance)<=LINE_TOLERANCE).sort((a,b)=>Math.abs(a.distance-distance)-Math.abs(b.distance-distance))[0];if(onLine)return onLine.name+suffix;
 const first=galleries.find(g=>g.name==='the First Gallery');if(distance>first.distance)return 'The Line'+suffix;
 if(!hazard){const last=galleries.find(g=>g.name==='Last Gallery'),second=galleries.find(g=>g.name==='the Second Gallery');if(distance>6.5*YARD&&distance<last.distance)return 'Better than Last Gallery';if(distance>last.distance&&distance<last.distance+.5*YARD)return 'Worse than Last Gallery';if(distance>last.distance+.5*YARD&&distance<last.distance+YARD)return 'Nearly a yard worse than Last Gallery';if(distance>last.distance+YARD&&distance<(last.distance+YARD+second.distance)/2)return 'More than a yard worse than the Last Gallery';}
 const nearest=[...anchors,...galleries].sort((a,b)=>Math.abs(a.distance-distance)-Math.abs(b.distance-distance))[0];return (distance<nearest.distance?'Better than ':'Worse than ')+nearest.name+suffix;
}
export function chaseBoardText(match){const playing=match.playing.length>0,all=playing?match.playing:match.chases;return all.length?all.map(c=>(playing?'PLAYING · ':'LAID · ')+chaseCall(c)).join('\n'):'No chases laid';}
