const $=id=>document.getElementById(id);
const name=$("name"),msg=$("msg"),img=$("img"),placeholder=$("placeholder"),
screen=$("screen"),modal=$("modal"),audio=$("audio"),play=$("playBtn"),
progress=$("progress"),time=$("time"),ending=$("ending");

const DB_NAME="birthdaylyDB";
const STORE="files";

function openDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>req.result.createObjectStore(STORE);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function saveFile(key,blob){
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).put(blob,key);
    tx.oncomplete=()=>{db.close();resolve()};
    tx.onerror=()=>{db.close();reject(tx.error)};
  });
}

async function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(r.result);
    r.onerror=()=>reject(r.error);
    r.readAsDataURL(file);
  });
}

name.oninput=()=>$("nameOut").textContent=name.value.trim()||"Your Name";

function wordCount(text){return text.trim()?text.trim().split(/\s+/).length:0;}
function limitWords(textarea,maxWords,counter){
  const words=textarea.value.trim()?textarea.value.trim().split(/\s+/):[];
  if(words.length>maxWords){
    textarea.value=words.slice(0,maxWords).join(" ")+" ";
  }
  counter.textContent=wordCount(textarea.value);
}
msg.oninput=()=>{
  limitWords(msg,500,$("count"));
  $("msgOut").textContent=msg.value.trim()||"Tulis ucapanmu di sebelah kiri dan lihat kejutannya muncul di sini.";
};
ending.oninput=()=>limitWords(ending,1000,$("endingCount"));

$("photo").onchange=e=>{
  const f=e.target.files[0];
  if(!f)return;
  if(!f.type.startsWith("image/")){ alert("Pilih file gambar ya bro 😎"); e.target.value=""; return; }
  const r=new FileReader();
  r.onload=ev=>{
    const im=new Image();
    im.onload=()=>{
      const max=1200;
      const scale=Math.min(1,max/Math.max(im.width,im.height));
      const w=Math.max(1,Math.round(im.width*scale));
      const h=Math.max(1,Math.round(im.height*scale));
      const c=document.createElement("canvas");
      c.width=w;c.height=h;
      c.getContext("2d").drawImage(im,0,0,w,h);
      selectedPhotoData=c.toDataURL("image/jpeg",0.82);
      img.src=selectedPhotoData;
      img.hidden=false;
      placeholder.hidden=true;
    };
    im.onerror=()=>alert("Foto tidak bisa dibaca bro 😅");
    im.src=ev.target.result;
  };
  r.readAsDataURL(f);
};

let selectedMusic=null;
let selectedPhotoData="";

$("music").onchange=e=>{
  const f=e.target.files[0];
  if(!f)return;

  selectedMusic=f;
  audio.src=URL.createObjectURL(f);
  $("musicName").textContent=f.name;
  $("songOut").textContent=f.name.replace(/\.[^.]+$/,"");
  audio.load();
  play.textContent="▶";
};

play.onclick=async()=>{
  if(!audio.src){
    alert("Upload musik dulu bro 🎵");
    return;
  }
  if(audio.paused){
    try{
      await audio.play();
      play.textContent="❚❚";
    }catch(err){
      alert("Browser menolak pemutaran. Klik tombol ▶ lagi ya.");
    }
  }else{
    audio.pause();
    play.textContent="▶";
  }
};

audio.addEventListener("timeupdate",()=>{
  const p=audio.duration?(audio.currentTime/audio.duration)*100:0;
  progress.style.width=p+"%";
  const m=Math.floor(audio.currentTime/60);
  const s=Math.floor(audio.currentTime%60).toString().padStart(2,"0");
  time.textContent=m+":"+s;
});

audio.addEventListener("ended",()=>{
  play.textContent="▶";
  progress.style.width="0%";
  time.textContent="0:00";
});

document.querySelectorAll(".theme").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".theme").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  screen.className="screen "+b.dataset.t;
});

$("previewBtn").onclick=async e=>{
  e.preventDefault();

  const activeTheme=document.querySelector(".theme.active")?.dataset.t||"romantic";
  const musicKey=selectedMusic ? "music-"+Date.now()+"-"+Math.random().toString(36).slice(2) : "";
  const photoFile=$("photo").files[0]||null;
  const photoKey=photoFile ? "photo-"+Date.now()+"-"+Math.random().toString(36).slice(2) : "";

  try{
    if(selectedMusic){
      await saveFile(musicKey,selectedMusic);
    }
    if(photoFile){
      await saveFile(photoKey,photoFile);
    }

    const data={
      name:name.value.trim()||"Someone Special",
      message:msg.value.trim()||
        "Selamat ulang tahun! Semoga hari ini penuh hal-hal baik, tawa, dan kejutan kecil yang bikin senyum.",
      ending:ending.value.trim()||
        "Semoga satu tahun ke depan punya lebih banyak alasan untuk bahagia. 💗",
      theme:activeTheme,
      photo: selectedPhotoData || (img.hidden?"":img.src),
      photoKey,
      musicKey,
      musicName:selectedMusic ? selectedMusic.name : ""
    };

    sessionStorage.setItem("birthdaylyData",JSON.stringify(data));
    modal.classList.add("show");
  }catch(err){
    console.error(err);
    alert("Musiknya gagal disimpan di browser. Coba file musik yang lebih kecil ya bro 😎");
  }
};

$("close").onclick=()=>{
  modal.classList.remove("show");
  window.location.href="birthday.html";
};