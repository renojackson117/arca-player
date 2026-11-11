'use strict';
const $=id=>document.getElementById(id);
const canvas=$('screen'),ctx=canvas.getContext('2d',{alpha:false});
const sample=document.createElement('canvas'),sctx=sample.getContext('2d',{willReadFrequently:true});
const video=$('video');
let palette=[],images=[],cache=new Map(),objectUrl=null,lastRender=0,ready=false,framePending=false;
const fmt=t=>{t=Math.max(0,Math.floor(Number.isFinite(t)?t:0));return `${Math.floor(t/3600)?Math.floor(t/3600)+':':''}${Math.floor(t/60)%60}:${String(t%60).padStart(2,'0')}`};
function status(t){$('status').textContent=t}
async function init(){
 const response=await fetch('palette.json');if(!response.ok)throw Error('palette.json HTTP '+response.status);
 palette=await response.json();images=palette.map(p=>{let i=new Image();i.decoding='async';i.src='assets/'+p.file;return i});
 status(`준비 완료 · 이미지 ${palette.length}개 · 동영상 파일을 열어주세요`);
}
init().catch(e=>status('이미지 목록 로딩 실패: '+e.message+' · GitHub Pages 주소에서 접속해 주세요'));
$('file').addEventListener('change',e=>{
 const f=e.target.files?.[0];if(!f)return;
 video.pause();if(objectUrl)URL.revokeObjectURL(objectUrl);
 objectUrl=URL.createObjectURL(f);ready=false;video.src=objectUrl;video.volume=Number($('volume').value)/100;video.load();
 $('placeholder').classList.add('hidden');$('pill').classList.remove('hidden');
 status('영상 불러오는 중 · '+f.name);
 video.play().catch(()=>status('자동 재생이 제한되었습니다. ▶ 버튼을 눌러주세요'));
});
video.addEventListener('loadeddata',()=>{ready=true;render(true);status('실시간 모자이크 재생 준비 완료')});
video.addEventListener('error',()=>status('영상 디코딩 실패 · 브라우저가 지원하는 MP4(H.264) 또는 WebM 파일을 사용해 주세요'));
video.addEventListener('seeked',()=>render(true));
video.addEventListener('pause',()=>render(true));
video.addEventListener('ended',()=>{$('play').textContent='▶';render(true)});
$('play').onclick=()=>{if(!video.src){$('file').click();return}if(video.paused)video.play().catch(e=>status('재생 실패: '+e.message));else video.pause()};
$('seek').oninput=e=>{if(Number.isFinite(video.duration)&&video.duration>0){video.currentTime=video.duration*Number(e.target.value)/1000;$('current').textContent=fmt(video.currentTime)}};
$('volume').oninput=e=>{let n=Number(e.target.value);video.volume=n/100;$('volumeLabel').textContent=n+'%'};
$('count').oninput=e=>{$('countLabel').textContent=Number(e.target.value).toLocaleString()+'개';cache.clear();render(true)};
$('blend').oninput=e=>{$('blendLabel').textContent=e.target.value+'%';render(true)};
$('full').onclick=()=>document.fullscreenElement?document.exitFullscreen():$('viewer').requestFullscreen().catch(e=>status(e.message));
function choose(r,g,b){const key=((r>>4)<<8)|((g>>4)<<4)|(b>>4);if(cache.has(key))return cache.get(key);
 let best=0,dist=Infinity;for(let i=0;i<palette.length;i++){let c=palette[i].rgb,dr=r-c[0],dg=g-c[1],db=b-c[2],d=dr*dr*.30+dg*dg*.59+db*db*.11;if(d<dist){dist=d;best=i}}
 cache.set(key,best);return best;
}
function render(force=false){
 if(!ready||!palette.length||video.readyState<2||!video.videoWidth)return;
 const now=performance.now();if(!force&&now-lastRender<95)return;lastRender=now;
 const rect=$('viewer').getBoundingClientRect(),w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));
 const count=Number($('count').value),cols=count===1?1:Math.max(1,Math.round(Math.sqrt(count*w/h))),rows=count===1?1:Math.max(1,Math.round(count/cols));
 const dpr=Math.min(window.devicePixelRatio||1,2),pw=Math.round(w*dpr),ph=Math.round(h*dpr);
 if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;
 if(sample.width!==cols||sample.height!==rows){sample.width=cols;sample.height=rows}
 const sw=video.videoWidth,sh=video.videoHeight,scale=Math.max(cols/sw,rows/sh),cropW=cols/scale,cropH=rows/scale;
 sctx.drawImage(video,(sw-cropW)/2,(sh-cropH)/2,cropW,cropH,0,0,cols,rows);
 const data=sctx.getImageData(0,0,cols,rows).data,tw=w/cols,th=h/rows,blend=Number($('blend').value)/100;
 ctx.fillStyle='#050507';ctx.fillRect(0,0,w,h);
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const j=(y*cols+x)*4,r=data[j],g=data[j+1],b=data[j+2],im=images[choose(r,g,b)],px=x*tw,py=y*th;
  if(im?.complete&&im.naturalWidth)ctx.drawImage(im,px,py,tw+.65,th+.65);
  else{ctx.fillStyle=`rgb(${r},${g},${b})`;ctx.fillRect(px,py,tw+.65,th+.65)}
  if(blend>0){ctx.fillStyle=`rgba(${r},${g},${b},${(blend*.78).toFixed(3)})`;ctx.fillRect(px,py,tw+.65,th+.65)}
 }
 $('pill').textContent=`● 실시간 · ${cols} × ${rows} · ${(cols*rows).toLocaleString()}개 타일`;
}
function tick(){if(!video.paused)render();requestAnimationFrame(tick)}requestAnimationFrame(tick);
setInterval(()=>{if(!video.src)return;let d=video.duration,c=video.currentTime;
 $('current').textContent=fmt(c);$('duration').textContent=fmt(d);
 if(Number.isFinite(d)&&d>0&&document.activeElement!==$('seek'))$('seek').value=Math.round(c/d*1000);
 $('play').textContent=video.paused?'▶':'Ⅱ';
},200);
window.addEventListener('resize',()=>render(true));document.addEventListener('fullscreenchange',()=>render(true));
