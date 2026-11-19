// Stop automatic computer services after a complete point without human footwork.
// Only real movement in the human movement loop is recorded; end switches never count.
export class ReceiverActivity {
 constructor(){this.reset();}
 reset(){this.waiting=false;this.tracking=false;this.distance=0;this.resumeDistance=0;}
 beginPoint(server){this.tracking=server===1;this.distance=0;this.waiting=false;}
 recordMovement(distance){if(!Number.isFinite(distance)||distance<=0)return false;if(this.tracking)this.distance+=distance;if(this.waiting){this.resumeDistance=(this.resumeDistance||0)+distance;if(this.resumeDistance>=.15){this.waiting=false;this.resumeDistance=0;return true;}}return false;}
 finishPoint(){if(this.tracking&&this.distance<.15){this.waiting=true;this.resumeDistance=0;}this.tracking=false;return this.waiting;}
}
