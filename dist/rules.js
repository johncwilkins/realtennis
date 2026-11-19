import {COURT} from './court-geometry.js';
export class Match {
 constructor({gamesToSet=6,bestOf=1}={}){this.gamesToSet=[3,6].includes(+gamesToSet)?+gamesToSet:6;this.bestOf=[1,3,5].includes(+bestOf)?+bestOf:1;this.sets=[0,0];this.completedSets=[];this.points=[0,0];this.games=[0,0];this.servicePlayer=Math.random()<.5?0:1;this.chases=[];this.playing=[];this.winner=null;}
 score(i){const a=this.points[i],b=this.points[1-i];return a>=3&&b>=3?(a===b?'40':a>b?'AD':'40'):['0','15','30','40'][a]||'40';}
 gamePoint(){return this.points.some((p,i)=>p>=3&&p>this.points[1-i]);}
 checkChange(){if(this.winner!==null)return false;if(!this.playing.length&&this.chases.length&&(this.chases.length>=2||this.gamePoint())){this.playing=this.chases.splice(0);this.servicePlayer=1-this.servicePlayer;return true;}return false;}
 point(winner){this.lastSetWinner=null;if(this.winner!==null)return 'match';this.points[winner]++;if(this.points[winner]>=4&&this.points[winner]-this.points[1-winner]>=2){this.games[winner]++;this.points=[0,0];if(this.games[winner]>=this.gamesToSet){this.sets[winner]++;this.lastSetWinner=winner;this.completedSets.push([...this.games]);this.chases=[];this.playing=[];if(this.sets[winner]>=Math.floor(this.bestOf/2)+1)this.winner=winner;else this.games=[0,0];}return 'game';}return 'point';}
 finishPoint(winner){if(this.winner!==null)return {kind:'match',winner:this.winner,changed:false};if(this.playing.length)this.playing.shift();let kind=this.point(winner);if(this.lastSetWinner!==null)kind=this.winner!==null?'match':'set';return {kind,winner,changed:this.checkChange()};}
 fall({end,distance,striker,gallery=null}){const active=this.playing[0];if(active){const sameEnd=active.end===end; // A chase must be beaten at the end where it was laid.
 const beat=sameEnd&&distance<active.distance-.08;const tied=sameEnd&&Math.abs(distance-active.distance)<=.08;
 if(tied){this.playing.shift();return {kind:'off',changed:this.checkChange()};}
 return this.finishPoint(beat?1-active.owner:active.owner);}
 const chase=end==='service'||distance>COURT.endRoofInner-Math.abs(COURT.serviceLineZ);
 if(chase||gallery){this.chases.push({end,distance,owner:striker,gallery});return {kind:'chase',changed:this.checkChange()};}
 return this.finishPoint(striker);}
}
