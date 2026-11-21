import {WheelStroke} from './controls.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),median=values=>{const a=[...values].sort((a,b)=>a-b);return a[Math.floor(a.length/2)];};
export const MOUSE_KEY='royal-court-mouse-setup-v1';
export function wheelDelta(e,pageHeight=800){if(e.ctrlKey||!Number.isFinite(e.deltaY))return 0;return clamp(e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?pageHeight:1),-10000,10000);}
export function readMouseSettings(storage){try{const v=JSON.parse(storage.getItem(MOUSE_KEY));return {reach:clamp(Number.isFinite(v?.reach)?v.reach:1,.5,2),power:clamp(Number.isFinite(v?.power)?v.power:1,.5,1.8)};}catch{return {reach:1,power:1};}}
export function saveMouseSettings(storage,value){try{storage.setItem(MOUSE_KEY,JSON.stringify(value));return true;}catch{return false;}}
export function pointerReach(x,y,width,height,gain=1,anchorY=0){return {x:(x/width*2-1)*gain,y:anchorY+(-y/height*2+1-anchorY)*gain};}
export class QuickWheelSetup {
 constructor(){this.cancel();}
 start(){this.active=true;this.samples=[];this.resetSweep();}
 resetSweep(){this.stroke=new WheelStroke();this.back=0;this.forward=0;this.last=-Infinity;}
 cancel(){this.active=false;this.samples=[];this.resetSweep();}
 input(delta,time){if(!this.active||!delta)return;if(delta>0&&this.forward>0)this.finish();if(!this.active)return;this.stroke.input(delta*100,time,100);this.last=time;if(delta>0)this.back+=delta;else if(this.back>0)this.forward-=delta;}
 tick(time){if(this.active&&this.forward>0&&time-this.last>250)this.finish();}
 finish(){if(this.back>0&&this.forward>0&&this.stroke.rawRate>0)this.samples.push({back:this.back,rate:this.stroke.rawRate});this.resetSweep();if(this.samples.length>=3)this.active=false;}
 result(){if(this.samples.length<3)return null;return {travel:clamp(165/median(this.samples.map(s=>s.back)),.1,20),baseline:clamp(median(this.samples.map(s=>s.rate)),20,30000)};}
}
export function setupMouseUI({storage,settings,onCalibrated,inverted}){
 const $=s=>document.querySelector(s),quick=new QuickWheelSetup(),pad=$('#mouseSetupPad'),status=$('#mouseSetupStatus');let timer=null,applied=false;
 function render(){pad.hidden=!quick.active;status.textContent=quick.active?`Scroll toward you, then away, at a comfortable speed. Pause briefly. ${quick.samples.length} / 3 swings.`:applied?'Mouse setup saved. Try practice; fine-tune travel and power independently below.':'Quick setup takes three comfortable back-and-forward scrolls. No ball required.';}
 function update(){quick.tick(performance.now());if(!quick.active&&quick.result()&&!applied){applied=true;settings.power=1;$('#powerSensitivity').value=1;$('#powerSensitivityReadout').textContent='1.00×';saveMouseSettings(storage,settings);onCalibrated(quick.result());}render();}
 $('#quickMouseSetup').onclick=()=>{clearTimeout(timer);quick.start();applied=false;render();pad.focus();};$('#cancelMouseSetup').onclick=()=>cancel();
 pad.addEventListener('wheel',e=>{if(!quick.active)return;e.preventDefault();quick.input(wheelDelta(e,innerHeight)*(inverted()?-1:1),performance.now());update();clearTimeout(timer);timer=setTimeout(update,270);},{passive:false});
 function cancel(){clearTimeout(timer);quick.cancel();render();}
 for(const [id,key]of [['mouseReach','reach'],['powerSensitivity','power']]){const input=$('#'+id),output=$('#'+id+'Readout');input.value=settings[key];output.textContent=settings[key].toFixed(2)+'×';input.addEventListener('input',()=>{settings[key]=+input.value;output.textContent=settings[key].toFixed(2)+'×';saveMouseSettings(storage,settings);});}
 render();return {cancel};
}

Apartment graffiti now uses transparent ink overlays directly on brick, scattered across several levels instead of a gray-backed strip.

Graffiti lettering is hand-traced with irregular letter strokes, paint drips and overspray. Apartment tags use the facade’s exact UV grid and clear the full window/frame/sill rectangles, keeping all paint on the masonry.

Laptop-sized landscape windows now default to a 116% court view. Settings → Controls & view offers Auto, Standard, Larger and Largest court sizes plus a fullscreen button. Zoom shifts the aim toward the near court so both ends stay visible; overview retains its full-court framing. Display preference saves per browser.

Playground graffiti now uses irregular scrawls, heavily varied letter shapes, faded layers and cross-outs. Apartment art is unique across each full frontage instead of tiled rows of repeated slogans, with window exclusions calculated in world coordinates.
