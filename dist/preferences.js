import {SERVE_TYPES} from './serves.js';
import {getCharacter} from './roster.js';
const key='royal-court-settings-v1';
export const DEFAULT_SETTINGS={human:'whitney',computer:'henri',court:'1',mode:'straight',pace:'0.9',view:'play',sensitivity:1,invert:false,guides:true,sound:false,serve:'long',serveStyle:'bobble',games:'6',sets:'1'};
export function cleanSettings(raw={}){const r={...DEFAULT_SETTINGS};for(const [k,allowed]of Object.entries({court:['1','2','3','4','5','6','7','8','9','10','11'],mode:['straight','footwork','match','calibrate'],pace:['0.7','0.9','1.1'],view:['play','low','overview'],serve:['long','short'],serveStyle:Object.keys(SERVE_TYPES),games:['3','6'],sets:['1','3','5']}))if(allowed.includes(String(raw[k])))r[k]=String(raw[k]);for(const k of ['invert','guides','sound'])if(typeof raw[k]==='boolean')r[k]=raw[k];if(Number.isFinite(raw.sensitivity))r.sensitivity=Math.max(.5,Math.min(2,raw.sensitivity));r.human=getCharacter(raw.human).id;r.computer=getCharacter(raw.computer??({0:'lucien',1:'charles',2:'henri'}[raw.difficulty]),'henri').id;return r;}
export function readSettings(storage){try{const saved=JSON.parse(storage.getItem(key)||'null');return cleanSettings(saved&&typeof saved==='object'?saved:{court:storage.getItem('royal-court-scheme-v1')});}catch{return {...DEFAULT_SETTINGS};}}
export function saveSettings(storage,value){try{storage.setItem(key,JSON.stringify(cleanSettings(value)));return true;}catch{return false;}}

