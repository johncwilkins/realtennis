export const CONTROL_LESSON=[
 {id:'welcome',title:'Learn the controls',text:'This lesson assumes you already know the rules of court tennis. It teaches movement, racket swings, shot choices and serving. No scoring or stamina pressure.'},
 {id:'move',title:'Move your feet',text:'Point the mouse at the glowing floor marker. Your player accelerates toward the cursor. On a phone, drag on the court to move.',success:'Good — your player reached the marker.'},
 {id:'back',title:'Draw the racket back',text:'Roll the wheel toward you until the racket is clearly behind you. On a phone, pull down on the racket pad. There is no ball yet.',success:'That is your backswing. The elbow bends and the racket is ready.'},
 {id:'swing',title:'Swing through',text:'Draw back again, then roll the wheel away from you to swing forward. Faster scrolling adds power. On a phone, slide the racket pad upward.',success:'Good forward swing. Now try it with a ball.'},
 {id:'regular',title:'Return a regular shot',text:'Steady practice feeds are coming to you. Move alongside the ball, draw back, and swing as it reaches your racket. Do not click a shot choice. Misses simply bring another ball.',success:'You made a regular return. Where you meet the ball controls its direction.'},
 {id:'drive',title:'Choose a drive',text:'A drive hits with more power than a regular shot and uses more energy in a match. Energy stays full during this lesson. While a feed is coming, left-click once on the court, or tap Drive, then swing normally. You can click before scrolling; the choice applies to one successful shot.',success:'Drive hit. The next shot automatically returns to Regular.'},
 {id:'lob',title:'Choose a lob',text:'While a feed is coming, right-click once anywhere on the court, or tap Lob. Then draw back and swing. You do not need to hold the mouse button.',success:'Lob hit. One click chooses one lob; wheel speed still controls power.'},
 {id:'serve',title:'Choose your serve',text:'Pick one of the five serve styles in the small panel at the bottom center of the court, then press Serve. He walks to the service position, tosses and swings. Long/short changes placement.',success:'Your serve reached the service penthouse. That is the service action.'},
 {id:'complete',title:'You are ready to play',text:'Move with the cursor, draw back and swing with the wheel. No click gives a regular shot; left selects one drive, right one lob. Use the bottom-center serve panel between points, or click the court to repeat your previous choice.'}
];
export class ControlsTutorial{
 constructor(){this.active=false;this.index=0;this.done=false;this.returnMode='straight';this.target={x:1.8,z:7};}
 get step(){return CONTROL_LESSON[this.index];}
 get feeds(){return this.active&&['regular','drive','lob'].includes(this.step.id)&&!this.done;}
 start(returnMode='straight'){this.active=true;this.returnMode=returnMode;this.index=0;this.resetStep();}
 stop(){this.active=false;}
 resetStep(){this.done=false;this.sawBack=false;this.serveChosen=false;}
 next(){if(this.index>0&&!this.done&&this.step.id!=='complete')return false;if(this.index<CONTROL_LESSON.length-1){this.index++;this.resetStep();return true;}return false;}
 observe({x,z,draw=0,contactStarted=false}){if(!this.active||this.done)return false;const before=this.done;if(this.step.id==='move'&&Math.hypot(x-this.target.x,z-this.target.z)<.6)this.done=true;if(draw>=.35){this.sawBack=true;if(this.step.id==='back')this.done=true;}if(this.step.id==='swing'&&this.sawBack&&contactStarted)this.done=true;return this.done!==before;}
 hit(kind){if(this.active&&!this.done&&({regular:'regular',drive:'drive',lob:'lob'}[this.step.id])===kind)this.done=true;}
 chooseServe(){if(this.active&&this.step.id==='serve')this.serveChosen=true;}
 served(){if(this.active&&this.step.id==='serve'&&this.serveChosen)this.done=true;}
}
// Screen-space placement shared by the serve panel and lesson marker.
export function nearbyPanel(anchor,viewport,size){const pad=12,gap=22;let x=anchor.x+gap;if(x+size.width>viewport.width-pad)x=anchor.x-size.width-gap;const top=viewport.height<500?76:108,maxY=Math.max(top,viewport.height-size.height-95);return {x:Math.max(pad,Math.min(viewport.width-size.width-pad,x)),y:Math.max(top,Math.min(maxY,anchor.y-35))};}
