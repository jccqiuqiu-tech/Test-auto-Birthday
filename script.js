const toast=document.getElementById("toast");
document.getElementById("year").textContent=new Date().getFullYear();

const observer=new IntersectionObserver((entries)=>{
  entries.forEach((entry)=>{if(entry.isIntersecting) entry.target.classList.add("visible")});
},{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

function showToast(){
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer=setTimeout(()=>toast.classList.remove("show"),2800);
}
document.getElementById("startBtn").addEventListener("click",showToast);
document.getElementById("surpriseBtn").addEventListener("click",()=>{
  const btn=document.getElementById("surpriseBtn");
  btn.textContent="Surprise unlocked ✨";
  btn.style.background="#e85d3f";
  btn.style.color="#fff";
  setTimeout(()=>{btn.textContent="Open surprise ✦";btn.style.background="";btn.style.color=""},1800);
});

document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener("click",e=>{
    const target=document.querySelector(link.getAttribute("href"));
    if(target){e.preventDefault();target.scrollIntoView({behavior:"smooth"})}
  });
});

document.addEventListener("mousemove",(e)=>{
  document.querySelector(".cursor-glow").style.transform=`translate(${e.clientX-100}px,${e.clientY-100}px)`;
});
