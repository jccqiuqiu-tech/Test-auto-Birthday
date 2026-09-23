const q=new URLSearchParams(location.search);
const birthdayId=q.get("id");

const finalName=document.getElementById("finalName");
const finalMessage=document.getElementById("finalMessage");
const finalPhoto=document.getElementById("finalPhoto");
const coverPhoto=document.getElementById("coverPhoto");
const placeholder=document.getElementById("placeholder");
const trackName=document.getElementById("trackName");
const finalEnding=document.getElementById("finalEnding");
const audio=document.getElementById("audio");
audio.loop=true;
const playBtn=document.getElementById("playBtn");
const progress=document.getElementById("progress");
const time=document.getElementById("time");
const openBtn=document.getElementById("openBtn");
const endingBtn=document.getElementById("endingBtn");
const introStage=document.getElementById("introStage");
const messageStage=document.getElementById("messageStage");
const endingStage=document.getElementById("endingStage");

function showPhoto(src){
  if(!src)return false;
  finalPhoto.src=src;
  finalPhoto.style.display="block";
  placeholder.style.display="none";
  coverPhoto.src=src;
  coverPhoto.style.display="block";
  coverPhoto.style.visibility="visible";
  coverPhoto.style.opacity="1";
  return true;
}

async function loadBirthday(){
  if(!birthdayId){
    finalName.textContent="Birthdayly";
    finalMessage.textContent="Link birthday-nya belum lengkap bro 😅";
    return;
  }

  const {data,error}=await birthdaySupabase
    .from("birthday_pages")
    .select("id,name,message,ending,theme,photo_path,music_path,music_name")
    .eq("id",birthdayId)
    .maybeSingle();

  if(error){
    console.error(error);
    finalMessage.textContent="Data birthday gagal dimuat. Coba buka link-nya lagi ya bro 😅";
    return;
  }

  if(!data){
    finalName.textContent="Birthdayly";
    finalMessage.textContent="Halaman birthday ini tidak ditemukan atau link-nya salah. 😅";
    return;
  }

  finalName.textContent=data.name||"Someone Special";
  finalMessage.textContent=data.message||"";
  finalEnding.textContent=data.ending||"";
  document.body.className="theme-"+(data.theme||"romantic");
  trackName.textContent=data.music_name||"Your birthday song";

  if(data.photo_path){
    const {data:photo}=birthdaySupabase.storage.from("birthday-media").getPublicUrl(data.photo_path);
    showPhoto(photo.publicUrl);
  }

  if(data.music_path){
    const {data:music}=birthdaySupabase.storage.from("birthday-media").getPublicUrl(data.music_path);
    audio.src=music.publicUrl;
    audio.load();
  }
}

openBtn.onclick=async()=>{
  introStage.classList.remove("active");
  messageStage.classList.add("active");
  if(audio.src&&audio.paused){try{await audio.play();}catch(e){playBtn.classList.add("needs-play");}}
};

playBtn.onclick=async()=>{
  if(!audio.src)return;
  if(audio.paused){try{await audio.play();}catch(e){}}
  else audio.pause();
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
loadBirthday();
