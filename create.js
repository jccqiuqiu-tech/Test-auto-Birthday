const $=id=>document.getElementById(id);
const name=$("name"),msg=$("msg"),img=$("img"),placeholder=$("placeholder"),
screen=$("screen"),modal=$("modal"),audio=$("audio"),play=$("playBtn"),
progress=$("progress"),time=$("time"),ending=$("ending");

name.oninput=()=>$("nameOut").textContent=name.value.trim()||"Your Name";

function wordCount(text){return text.trim()?text.trim().split(/\s+/).length:0;}
function limitWords(textarea,maxWords,counter){
  const words=textarea.value.trim()?textarea.value.trim().split(/\s+/):[];
  if(words.length>maxWords) textarea.value=words.slice(0,maxWords).join(" ")+" ";
  counter.textContent=wordCount(textarea.value);
}
msg.oninput=()=>{
  limitWords(msg,500,$("count"));
  $("msgOut").textContent=msg.value.trim()||"Tulis ucapanmu di sebelah kiri dan lihat kejutannya muncul di sini.";
};
ending.oninput=()=>limitWords(ending,1000,$("endingCount"));

let selectedMusic=null;
let selectedPhotoBlob=null;
let selectedPhotoData="";

$("photo").onchange=e=>{
  const f=e.target.files[0];
  if(!f)return;
  if(!f.type.startsWith("image/")){alert("Pilih file gambar ya bro 😎");e.target.value="";return;}
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
      c.toBlob(blob=>selectedPhotoBlob=blob,"image/jpeg",0.82);
    };
    im.onerror=()=>alert("Foto tidak bisa dibaca bro 😅");
    im.src=ev.target.result;
  };
  r.readAsDataURL(f);
};

$("music").onchange=e=>{
  const f=e.target.files[0];
  if(!f)return;
  if(!f.type.startsWith("audio/")){alert("Pilih file musik ya bro 🎵");e.target.value="";return;}
  if(f.size>30*1024*1024){alert("Musiknya maksimal 30 MB dulu bro 😎");e.target.value="";return;}
  selectedMusic=f;
  audio.src=URL.createObjectURL(f);
  $("musicName").textContent=f.name;
  $("songOut").textContent=f.name.replace(/\.[^.]+$/," ");
  audio.load();
  play.textContent="▶";
};

play.onclick=async()=>{
  if(!audio.src){alert("Upload musik dulu bro 🎵");return;}
  if(audio.paused){try{await audio.play();play.textContent="❚❚";}catch(err){alert("Browser menolak pemutaran. Klik tombol ▶ lagi ya.");}}
  else{audio.pause();play.textContent="▶";}
};

audio.addEventListener("timeupdate",()=>{
  const p=audio.duration?(audio.currentTime/audio.duration)*100:0;
  progress.style.width=p+"%";
  const m=Math.floor(audio.currentTime/60);
  const s=Math.floor(audio.currentTime%60).toString().padStart(2,"0");
  time.textContent=m+":"+s;
});
audio.addEventListener("ended",()=>{play.textContent="▶";progress.style.width="0%";time.textContent="0:00";});

document.querySelectorAll(".theme").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".theme").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  screen.className="screen "+b.dataset.t;
});

function makeId(){
  if(crypto.randomUUID) return crypto.randomUUID().replaceAll("-","").slice(0,12);
  return Math.random().toString(36).slice(2)+Date.now().toString(36);
}

function safeFileName(name){
  return name.replace(/[^a-zA-Z0-9._-]/g,"-").slice(0,80);
}

async function uploadMedia(id){
  let photoPath="";
  let musicPath="";

  if(selectedPhotoBlob){
    photoPath=`photos/${id}.jpg`;
    const {error}=await birthdaySupabase.storage.from("birthday-media").upload(photoPath,selectedPhotoBlob,{contentType:"image/jpeg",upsert:false});
    if(error)throw error;
  }

  if(selectedMusic){
    musicPath=`music/${id}-${safeFileName(selectedMusic.name)}`;
    const {error}=await birthdaySupabase.storage.from("birthday-media").upload(musicPath,selectedMusic,{contentType:selectedMusic.type||"audio/mpeg",upsert:false});
    if(error)throw error;
  }

  return {photoPath,musicPath};
}

function publicUrl(path){
  if(!path)return "";
  return birthdaySupabase.storage.from("birthday-media").getPublicUrl(path).data.publicUrl;
}

async function createBirthday(){
  const activeTheme=document.querySelector(".theme.active")?.dataset.t||"romantic";
  const id=makeId();
  const data={
    id,
    name:name.value.trim()||"Someone Special",
    message:msg.value.trim()||"Selamat ulang tahun! Semoga hari ini penuh hal-hal baik, tawa, dan kejutan kecil yang bikin senyum.",
    ending:ending.value.trim()||"Semoga satu tahun ke depan punya lebih banyak alasan untuk bahagia. 💗",
    theme:activeTheme,
    musicName:selectedMusic?selectedMusic.name:""
  };

  const media=await uploadMedia(id);
  data.photoPath=media.photoPath;
  data.musicPath=media.musicPath;

  const {error}=await birthdaySupabase.from("birthday_pages").insert(data);
  if(error)throw error;

  const base=new URL("birthday.html",location.href).href;
  const link=`${base}?id=${encodeURIComponent(id)}`;
  return {data,link,photoUrl:publicUrl(media.photoPath),musicUrl:publicUrl(media.musicPath)};
}

$("previewBtn").onclick=async e=>{
  e.preventDefault();
  const btn=$("previewBtn");
  const original=btn.textContent;
  btn.disabled=true;
  btn.textContent="Membuat link... ⏳";
  try{
    const result=await createBirthday();
    $("shareLink").value=result.link;
    $("shareBox").hidden=false;
    $("copyStatus").textContent="Link sudah online. Bisa dibuka dari HP/laptop lain. 🔥";
    modal.classList.add("show");
  }catch(err){
    console.error(err);
    alert("Gagal membuat link birthday: "+(err.message||err));
  }finally{
    btn.disabled=false;
    btn.textContent=original;
  }
};

$("copyLink").onclick=async()=>{
  const link=$("shareLink").value;
  try{
    await navigator.clipboard.writeText(link);
    $("copyStatus").textContent="Link berhasil disalin bro 🔥";
  }catch(e){
    $("shareLink").select();
    document.execCommand("copy");
    $("copyStatus").textContent="Link berhasil disalin bro 🔥";
  }
};

$("close").onclick=()=>{
  modal.classList.remove("show");
  const link=$("shareLink").value;
  if(link) window.location.href=link;
};
