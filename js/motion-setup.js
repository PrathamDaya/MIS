import { animate, stagger } from "https://cdn.jsdelivr.net/npm/motion@14.6.0/+esm";

window.MISMotion = { animate, stagger };
document.documentElement.classList.add("motion-ready");
document.dispatchEvent(new Event("mis-motion-ready"));
