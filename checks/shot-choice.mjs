import assert from 'node:assert/strict';
import {ShotChoice,WheelStroke,contactShot} from '../dist/controls.js';
import {practiceTarget,practiceShot} from '../dist/practice.js';
const choice=new ShotChoice(),wheel=new WheelStroke();
choice.select('lob');wheel.input(150,100);wheel.tick(200,.1);assert.equal(choice.kind,'lob');wheel.input(-220,300);wheel.tick(400,.2);assert.equal(choice.kind,'lob');assert.equal(choice.consume(),'lob');assert.equal(choice.kind,'regular');choice.select('lob');choice.select('drive');assert.equal(choice.kind,'drive');assert.equal(choice.consume(),'drive');assert.equal(choice.kind,'regular');assert.equal(choice.consume(),'regular');
for(const side of [-1,1]){
 const player={x:0,z:7*side},ball={x:.5,y:.35,z:7*side};
 const drive=contactShot(ball,player,side,.05,1,'drive'),lob=contactShot(ball,player,side,.05,1,'lob');
 assert.ok(lob.vy>drive.vy);assert.equal(lob.angle,drive.angle);
 const crossTime=Math.abs(ball.z/drive.vz),netY=ball.y+drive.vy*crossTime-4.905*crossTime**2;assert.ok(netY<.914,'low drive must be allowed to hit the net');
 const high=contactShot({...ball,y:1.4},player,side,.05,1,'drive');assert.ok(high.elevation<drive.elevation,'low contact gets more face lift than a high contact');
 assert.ok(contactShot(ball,player,side,.9,1,'drive').speed>drive.speed);
 for(const n of [0,1,2,3]){const straight=practiceTarget(player,side,n,'straight');assert.equal(straight.x,player.x);const wide=practiceTarget(player,side,n,'footwork');assert.ok(n%2===0?wide.x>2:wide.x< -2);const v=practiceShot({x:0,y:1.2,z:-7*side},player,side,n,'footwork');assert.ok(Math.abs(v.target.x-wide.x)<1e-8);assert.ok(Math.hypot(v.vx,v.vz)<=11.001);}
}
console.log('Passed: click selection survives independent backswing/forward inputs, changes before contact, consumes once; drive can net, lob has distinct loft, power and lateral direction retained; straight and alternating practice feeds.');
