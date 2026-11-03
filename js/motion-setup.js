const reduced=()=>window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const stagger=step=>index=>index*step;
function animate(target,frames,options={}){
 if(reduced())return;
 const items=Array.isArray(target)?target:[target],duration=Math.max(1,(options.duration??0.24)*1000),easing="cubic-bezier(.22,1,.36,1)",value=x=>Array.isArray(x)?x[1]:x,start=x=>Array.isArray(x)?x[0]:x;
 items.forEach((el,index)=>{
  if(!el||!el.animate)return;
  const delay=(typeof options.delay==="function"?options.delay(index,el):options.delay||0)*1000;
  let from,to;
  if("x" in frames||"y" in frames||"width" in frames||"height" in frames){
   const before=getComputedStyle(el),oldTransform=before.transform==="none"?"translate(0px,0px)":before.transform,oldWidth=before.width,oldHeight=before.height;
   const x=value(frames.x??0),y=value(frames.y??0),w=value(frames.width??oldWidth),h=value(frames.height??oldHeight),transform=`translate(${x}px,${y}px)`;
   el.style.transform=transform;if("width" in frames)el.style.width=typeof w==="number"?w+"px":w;if("height" in frames)el.style.height=typeof h==="number"?h+"px":h;
   from={transform:oldTransform,width:oldWidth,height:oldHeight};to={transform,width:el.style.width||oldWidth,height:el.style.height||oldHeight};
  }else{
   const fromOpacity=start(frames.opacity??1),toOpacity=value(frames.opacity??1),fromY=start(frames.y??0),toY=value(frames.y??0),fromScale=start(frames.scale??1),toScale=value(frames.scale??1);
   from={opacity:fromOpacity,transform:`translateY(${fromY}px) scale(${fromScale})`};to={opacity:toOpacity,transform:`translateY(${toY}px) scale(${toScale})`};
  }
  const animation=el.animate([from,to],{duration,easing,delay,fill:"both"});animation.onfinish=()=>animation.cancel();
 });
}
window.MISMotion={animate,stagger};
document.documentElement.classList.add("motion-ready");
document.dispatchEvent(new Event("mis-motion-ready"));
