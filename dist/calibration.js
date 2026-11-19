const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const CALIBRATION_KEY='royal-court-wheel-v1';
export function validRate(value){return typeof value==='number'&&Number.isFinite(value)&&value>=20&&value<=30000;}
export function mappedPower(rate,baseline=1200){if(!validRate(baseline))baseline=1200;const ratio=clamp(Number.isFinite(rate)?rate/baseline:0,0,25);return ratio<=1?.5*ratio**.75:.5+.5*(1-Math.exp(-.7*(ratio-1)));}
export class PowerCalibration{
 constructor(baseline=1200){this.baseline=validRate(baseline)?baseline:1200;this.samples=[];this.active=false;}
 start(){this.samples=[];this.active=true;}
 cancel(){this.active=false;this.samples=[];}
 record(rate){if(!this.active||!validRate(rate))return false;this.samples.push(rate);if(this.samples.length<10)return false;const ordered=[...this.samples].sort((a,b)=>a-b);this.baseline=(ordered[4]+ordered[5])/2;this.active=false;return true;}
 power(rate){return mappedPower(rate,this.active?1200:this.baseline);}
}
export function readCalibration(storage){try{const saved=JSON.parse(storage.getItem(CALIBRATION_KEY));return saved?.version===1&&validRate(saved.baseline)?saved.baseline:null;}catch{return null;}}
export function saveCalibration(storage,baseline){if(!validRate(baseline))return false;try{storage.setItem(CALIBRATION_KEY,JSON.stringify({version:1,baseline}));return true;}catch{return false;}}
