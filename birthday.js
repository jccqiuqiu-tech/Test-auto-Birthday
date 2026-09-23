const q=new URLSearchParams(location.search);
let saved={};
try{saved=JSON.parse(sessionStorage.getItem("birthdaylyData")||"{}");}catch(e){saved={};}

const finalName=document.getElementById("finalName");
const finalMessage=document.getElementById("finalMessage");
const finalPhoto=document.getElementById("finalPhoto");
const coverPhoto=document.getElementById("coverPhoto");
const placeholder=document.getElementById("placeholder");
const trackName=document.getElementById("trackName");
const finalEnding=document.getElementById("finalEnding");
const audio=document.getElementById("audio");
audio.loop=true; // musik terus berjalan sampai user menekan pause
const playBtn=document.getElementById("playBtn");
const progress=document.getElementById("progress");
const time=document.getElementById("time");
const openBtn=document.getElementById("openBtn");
const endingBtn=document.getElementById("endingBtn");
const introStage=document.getElementById("introStage");
const messageStage=document.getElementById("messageStage");
const endingStage=document.getElementById("endingStage");

const name=saved.name||q.get("name");
const msg=saved.message||q.get("message");
const photo=saved.photo||q.get("photo");
const theme=saved.theme||q.get("theme")||"romantic";
const musicName=saved.musicName||q.get("musicName");
const ending=saved.ending||q.get("ending");
const musicKey=saved.musicKey||"";
const photoKey=saved.photoKey||"";

if(name)finalName.textContent=name;
if(msg)finalMessage.textContent=msg;
if(ending)finalEnding.textContent=ending;
document.body.className="theme-"+theme;

function showPhoto(src){
  if(!src)return false;
  finalPhoto.src=src;
  finalPhoto.style.display="block";
  placeholder.style.display="none";
  coverPhoto.src=src;
  coverPhoto.style.display="block";
  coverPhoto.setAttribute("src",src);
  coverPhoto.style.visibility="visible";
  coverPhoto.style.opacity="1";
  return true;
}


if(musicName)trackName.textContent=musicName;

function openDB(){return new Promise((resolve,reject)=>{
  const req=indexedDB.open("birthdaylyDB",1);
  req.onupgradeneeded=()=>req.result.createObjectStore("files");
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error);
});}

async function loadPhoto(){
  // Jalur utama: data URL yang sudah dikompres saat upload.
  if(photo && showPhoto(photo)) return;

  // Fallback: ambil Blob foto dari IndexedDB.
  if(!photoKey) return;
  try{
    const db=await openDB();
    const blob=await new Promise((resolve,reject)=>{
      const tx=db.transaction("files","readonly");
      const req=tx.objectStore("files").get(photoKey);
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
    db.close();
    if(blob instanceof Blob){
      const reader=new FileReader();
      reader.onload=()=>showPhoto(reader.result);
      reader.readAsDataURL(blob);
    }
  }catch(err){console.error("Photo load failed:",err);}
}


async function loadMusic(){
  if(!musicKey)return;
  try{
    const db=await openDB();
    const blob=await new Promise((resolve,reject)=>{
      const tx=db.transaction("files","readonly");
      const req=tx.objectStore("files").get(musicKey);
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
    db.close();
    if(blob){
      audio.src=URL.createObjectURL(blob);
      audio.load();
      // Coba lanjut play sesegera mungkin setelah pindah dari tombol "Buat Halaman".
      try{await audio.play();}catch(e){
        playBtn.classList.add("needs-play");
      }
    }
  }catch(err){console.error("Music load failed:",err);}
}

openBtn.onclick=async()=>{
  introStage.classList.remove("active");
  messageStage.classList.add("active");
  // Kalau browser mengizinkan, klik pembuka menjadi gesture untuk mulai musik.
  if(audio.src&&audio.paused){try{await audio.play();}catch(e){}}
};

playBtn.onclick=async()=>{
  if(!audio.src)return;
  if(audio.paused){try{await audio.play();}catch(e){}}else audio.pause();
};

endingBtn.onclick=()=>{
  messageStage.classList.remove("active");
  endingStage.classList.add("active");
};

audio.onplay=()=>{document.querySelector(".disc")?.classList.add("playing");};
audio.onpause=()=>{document.querySelector(".disc")?.classList.remove("playing");};
audio.ontimeupdate=()=>{
  const pct=audio.duration?(audio.currentTime/audio.duration)*100:0;
  progress.style.width=pct+"%";
  const s=Math.floor(audio.currentTime||0);
  time.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
};
audio.onended=()=>{progress.style.width="0%";time.textContent="0:00";};

introStage.classList.add("active");
messageStage.classList.remove("active");
endingStage.classList.remove("active");
loadPhoto();
loadMusic();
