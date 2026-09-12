/* =========================================================
   AYAR — burayı kendinize göre düzenleyin
   ========================================================= */
const CONFIG = {
  // WhatsApp Business numaranız, ülke kodu ile, sadece rakam. Örnek: "905321234567"
  // Boş bırakılırsa butonlar mesajı panoya kopyalar.
  whatsapp: "",
  tel: "+902242211219",
  // Çalışma saatleri. 0 = Pazar, 1 = Pazartesi ... Kapalı gün için null.
  // Google işletme profilinizdeki saatlerle birebir aynı olmalı.
  hours: {
    1:["09:00","18:30"], 2:["09:00","18:30"], 3:["09:00","18:30"],
    4:["09:00","18:30"], 5:["09:00","18:30"], 6:["09:00","18:30"], 0:null
  }
};

const DAYS = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const v  = id => ($(id)?.value || "").trim();

function toast(msg){
  let t = $("#toast");
  if(!t){ t = document.createElement("div"); t.id="toast"; t.className="toast"; t.setAttribute("role","status"); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("on");
  clearTimeout(t._t); t._t = setTimeout(()=>t.classList.remove("on"), 2600);
}
function copy(text){
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(text).then(()=>toast("Metin kopyalandı."));
  } else {
    const ta=document.createElement("textarea"); ta.value=text; document.body.appendChild(ta); ta.select();
    try{document.execCommand("copy");toast("Metin kopyalandı.");}catch(e){toast("Kopyalanamadı.");}
    ta.remove();
  }
}
function send(text){
  if(CONFIG.whatsapp){
    window.open("https://wa.me/"+CONFIG.whatsapp+"?text="+encodeURIComponent(text),"_blank","noopener");
  } else { copy(text); toast("WhatsApp numarası tanımlı değil. Metin kopyalandı."); }
}

/* ---------- çalışma saatleri ---------- */
const toMin = h => { const [a,b]=h.split(":").map(Number); return a*60+b; };
function openState(){
  const el = $("#openState"); if(!el) return;
  const now=new Date(), h=CONFIG.hours[now.getDay()], m=now.getHours()*60+now.getMinutes();
  if(!h){ el.innerHTML='<span class="dot shut"></span>Bugün kapalı'; return; }
  el.innerHTML = (m>=toMin(h[0]) && m<toMin(h[1]))
    ? '<span class="dot"></span>Açık, '+h[1]+'’a kadar'
    : '<span class="dot shut"></span>Kapalı, '+h[0]+'’da açılır';
}
function hoursList(){
  const el=$("#hoursList"); if(!el) return;
  const today=new Date().getDay();
  el.innerHTML=[1,2,3,4,5,6,0].map(d=>{
    const h=CONFIG.hours[d];
    return `<li class="${d===today?'today':''}"><b>${DAYS[d]}</b><span>${h?h[0]+" – "+h[1]:"Kapalı"}</span></li>`;
  }).join("");
}
openState(); hoursList();

/* ---------- çerçeve çizimleri ---------- */
function glassesSVG(shape){
  const S={dikdortgen:{rx:3,w:64,h:34},kare:{rx:5,w:60,h:46},yuvarlak:{rx:30,w:56,h:56},
    oval:{rx:26,w:66,h:40},panto:{rx:22,w:58,h:50},kelebek:{rx:10,w:66,h:38},aviator:{rx:18,w:64,h:46}
  }[shape]||{rx:4,w:64,h:36};
  const cy=50,gap=22,lx=100-gap/2-S.w,rx0=100+gap/2,y=cy-S.h/2;
  return `<svg viewBox="0 0 200 100" role="img" aria-label="${shape} çerçeve çizimi" fill="none"
    stroke="#101A2B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="${lx}" y="${y}" width="${S.w}" height="${S.h}" rx="${S.rx}"/>
    <rect x="${rx0}" y="${y}" width="${S.w}" height="${S.h}" rx="${S.rx}"/>
    <path d="M${lx+S.w} ${cy-4} q ${gap/2} -7 ${gap} 0"/>
    <path d="M${lx} ${cy-6} l -16 -5"/>
    <path d="M${rx0+S.w} ${cy-6} l 16 -5"/></svg>`;
}

/* ---------- çerçeve verisi ---------- */
const FRAMES=[
  {code:"AK-101",shape:"dikdortgen",material:"Asetat",  color:"Bağa deseni", use:"Günlük",who:"Unisex",stock:true},
  {code:"AK-104",shape:"yuvarlak",  material:"Metal",   color:"Antik altın", use:"Günlük",who:"Unisex",stock:true},
  {code:"AK-108",shape:"kelebek",   material:"Asetat",  color:"Füme",        use:"Günlük",who:"Kadın", stock:true},
  {code:"AK-112",shape:"kare",      material:"Asetat",  color:"Mat siyah",   use:"Ekran", who:"Erkek", stock:true},
  {code:"AK-117",shape:"aviator",   material:"Metal",   color:"Gümüş",       use:"Güneş", who:"Unisex",stock:true},
  {code:"AK-121",shape:"panto",     material:"Titanyum",color:"Lacivert",    use:"Günlük",who:"Unisex",stock:false},
  {code:"AK-126",shape:"oval",      material:"Titanyum",color:"Şampanya",    use:"Okuma", who:"Kadın", stock:true},
  {code:"AK-130",shape:"dikdortgen",material:"TR90",    color:"Kiremit",     use:"Çocuk", who:"Çocuk", stock:true}
];

/* ---------- randevu formu ---------- */
if($("#ap_wa")){
  const text=()=>{
    if(!v("#ap_name")||!v("#ap_phone")) return null;
    const l=["Randevu talebi — Akan Optik","Ad: "+v("#ap_name"),"Telefon: "+v("#ap_phone"),
      "Tarih: "+(v("#ap_date")||"belirtilmedi"),"Saat: "+v("#ap_time"),"Konu: "+v("#ap_topic")];
    if(v("#ap_note")) l.push("Not: "+v("#ap_note"));
    if($("#ap_remind").checked) l.push("Kontrol hatırlatması almak istiyorum.");
    return l.join("\n");
  };
  const guard=fn=>()=>{ const t=text(); if(!t){toast("Ad ve telefon alanlarını doldurun.");$("#ap_name").focus();return;} fn(t); };
  $("#ap_wa").addEventListener("click",guard(send));
  $("#ap_copy").addEventListener("click",guard(copy));
}

/* ---------- reçete çözümleyici ---------- */
if($("#rx_go")){
  const num=s=>{ if(s==null) return null; s=String(s).trim().replace(",","."); if(s==="") return null;
    const n=parseFloat(s); return isNaN(n)?null:n; };
  const eye=(sph,cyl,ax)=>{
    if(sph===null&&cyl===null) return null;
    const p=[];
    if(sph!==null){
      if(sph<0) p.push("uzağı görmede "+Math.abs(sph).toFixed(2)+" derece miyopi var, yani uzak nesneler bulanıklaşır");
      else if(sph>0) p.push("artı "+sph.toFixed(2)+" derece hipermetropi var, yani göz yakını netlemek için fazladan çaba harcar");
      else p.push("küresel numara sıfır, uzak için düzeltme gerekmiyor");
    }
    if(cyl!==null&&cyl!==0){
      let s=Math.abs(cyl).toFixed(2)+" derece astigmat var";
      if(ax!==null) s+=" ve ekseni "+ax+" derece";
      s+=". Astigmat, gözün her yöne aynı kırıcılıkta olmamasıdır; çizgiler eğik veya gölgeli görünebilir";
      p.push(s);
    } else if(cyl===0) p.push("astigmat düzeltmesi yok");
    return p.join(". ")+".";
  };
  $("#rx_go").addEventListener("click",()=>{
    const out=$("#rxOut");
    const R=eye(num(v("#r_sph")),num(v("#r_cyl")),num(v("#r_ax")));
    const L=eye(num(v("#l_sph")),num(v("#l_cyl")),num(v("#l_ax")));
    const add=num(v("#rx_add")), pd=num(v("#rx_pd"));
    if(!R&&!L&&add===null&&pd===null){ out.innerHTML='<p class="empty">Önce en az bir değer girin.</p>'; return; }
    let h="";
    if(R) h+="<h4>Sağ göz</h4><p>"+R+"</p>";
    if(L) h+="<h4>Sol göz</h4><p>"+L+"</p>";
    if(add!==null&&add!==0) h+="<h4>Yakın ilavesi</h4><p>Reçetede "+(add>0?"+":"")+add.toFixed(2)+
      " ADD değeri var. Bu, yakını görmek için eklenen destektir ve genellikle kırk yaş sonrası başlayan yakın görme zorluğuyla ilgilidir. Okuma gözlüğü, bifokal veya progresif cam seçenekleri konuşulabilir.</p>";
    if(pd!==null) h+="<h4>Göz bebeği mesafesi</h4><p>PD değeriniz "+pd+" mm. Camın optik merkezi bu ölçüye göre yerleştirilir; yanlış merkezleme zorlanma ve baş ağrısı yapabilir. Ölçümü mağazada teyit ediyoruz.</p>";
    const sphs=[num(v("#r_sph")),num(v("#l_sph"))].filter(x=>x!==null);
    if(sphs.length===2&&Math.abs(sphs[0]-sphs[1])>=2)
      h+="<h4>İki göz arasındaki fark</h4><p>Sağ ve sol numaranız arasında belirgin bir fark var. Bu durumda cam kalınlığı ve incelik oranı seçimi önem kazanır. Uygun indeksi mağazada birlikte belirleyelim.</p>";
    h+='<p class="note" style="margin-top:16px">Bu açıklama reçetenizi okumanıza yardımcı olmak içindir. Numaranızın güncel olup olmadığına yalnızca hekim karar verir.</p>';
    out.innerHTML=h;
  });
  $("#rx_clear").addEventListener("click",()=>{
    ["#r_sph","#r_cyl","#r_ax","#l_sph","#l_cyl","#l_ax","#rx_add","#rx_pd"].forEach(i=>$(i).value="");
    $("#rxOut").innerHTML='<p class="empty">Değerleri girip “Açıkla” düğmesine basın. Açıklama burada görünecek.</p>';
  });
}

/* ---------- çerçeve kataloğu ---------- */
if($("#frames")){
  const FILTERS=["Tümü","Günlük","Ekran","Okuma","Güneş","Çocuk"];
  let active="Tümü";
  function drawFilters(){
    $("#filters").innerHTML=FILTERS.map(f=>`<button class="chip" data-f="${f}" aria-pressed="${f===active}">${f}</button>`).join("");
    $$("#filters .chip").forEach(b=>b.addEventListener("click",()=>{active=b.dataset.f;drawFilters();draw();}));
  }
  function draw(){
    const list=FRAMES.filter(f=>active==="Tümü"||f.use===active);
    $("#frames").innerHTML=list.map(f=>`
      <article class="frame">${glassesSVG(f.shape)}
        <div class="code">${f.code}</div>
        <div class="meta">${f.material} &middot; ${f.color}<br>${f.who} &middot; ${f.use}</div>
        <div class="stock${f.stock?"":" no"}">${f.stock?"Mağazada mevcut":"Şu an yok, sorabilirsiniz"}</div>
        <button class="btn ghost" data-reserve="${f.code}">Bu modeli ayırt</button>
      </article>`).join("");
    $$("[data-reserve]").forEach(b=>b.addEventListener("click",()=>{
      const f=FRAMES.find(x=>x.code===b.dataset.reserve);
      const who=prompt("Adınız ve telefon numaranız:");
      if(!who) return;
      send(["Çerçeve ayırtma talebi — Akan Optik","Model: "+f.code+" ("+f.material+", "+f.color+")",
        "İleten: "+who,"İki gün ayrılmasını rica ediyorum."].join("\n"));
    }));
  }
  drawFilters(); draw();
}

/* ---------- çerçeve bulucu ---------- */
if($("#quiz")){
  const QUIZ=[
    {q:"Yüz hatlarınızı hangisi daha iyi anlatır?",k:"face",a:[
      {t:"Yuvarlak",s:"Yanaklar dolgun, çene yumuşak hatlı",v:"yuvarlak"},
      {t:"Köşeli",s:"Çene ve alın belirgin, geniş çene hattı",v:"kare"},
      {t:"Oval",s:"Alın ve çene dengeli, uzunluk fazla",v:"oval"},
      {t:"Kalp",s:"Alın geniş, çene daralan",v:"kalp"}]},
    {q:"Gözlüğü en çok ne için kullanacaksınız?",k:"use",a:[
      {t:"Gün boyu",s:"Sabahtan akşama takılacak",v:"Günlük"},
      {t:"Ekran",s:"Bilgisayar ve telefon başında",v:"Ekran"},
      {t:"Okuma",s:"Yakın iş ve okuma için",v:"Okuma"},
      {t:"Güneş",s:"Dışarıda, araç kullanırken",v:"Güneş"}]},
    {q:"Nasıl bir görünüm istiyorsunuz?",k:"style",a:[
      {t:"Fark edilmeyen",s:"İnce hatlı, yüze karışan",v:"ince"},
      {t:"Belirgin",s:"Kalın çerçeve, net duruş",v:"kalin"},
      {t:"Klasik",s:"Zamansız, sade biçimler",v:"klasik"},
      {t:"Renkli",s:"Desen ve renk görünsün",v:"renkli"}]},
    {q:"Ağırlık konusunda hassas mısınız?",k:"weight",a:[
      {t:"Çok hafif olsun",s:"Burunda iz kalmasın istiyorum",v:"hafif"},
      {t:"Dayanıklı olsun",s:"Sık düşürüyorum, sağlam dursun",v:"saglam"},
      {t:"Fark etmez",s:"Görünüm daha önemli",v:"farketmez"}]}
  ];
  const shell='<div class="qstep" id="qStep"></div><h3 id="qTitle"></h3><div class="opts" id="qOpts"></div><div class="qbar"><i id="qBar"></i></div>';
  let qi=0, answers={};

  function step(){
    const s=QUIZ[qi];
    $("#qStep").textContent="Soru "+(qi+1)+" / "+QUIZ.length;
    $("#qTitle").textContent=s.q;
    $("#qOpts").innerHTML=s.a.map((o,i)=>`<button class="opt" data-i="${i}">${o.t}<small>${o.s}</small></button>`).join("");
    $("#qBar").style.width=(qi/QUIZ.length*100)+"%";
    $$("#qOpts .opt").forEach(b=>b.addEventListener("click",()=>{
      answers[s.k]=s.a[+b.dataset.i].v; qi++;
      qi<QUIZ.length ? step() : result();
    }));
  }
  function result(){
    const {face,use,style,weight}=answers;
    const byFace={
      yuvarlak:[["kare","Köşeli hatlar yumuşak yüz çizgilerini dengeler ve yüzü daha uzun gösterir."],
                ["dikdortgen","Yatayda geniş, dikeyde ince kesim yanak dolgunluğunu dengeler."],
                ["kelebek","Yukarı doğru genişleyen üst hat bakışı yukarı taşır."]],
      kare:[["yuvarlak","Yuvarlak hatlar belirgin çene ve alın çizgisini yumuşatır."],
            ["oval","Yumuşak oval kesim köşeli hatların karşısında denge kurar."],
            ["panto","Üstü düz, altı yuvarlak biçim keskinliği kırar."]],
      oval:[["dikdortgen","Oval yüz çoğu biçimi taşır; dikdörtgen net bir çerçeve hattı verir."],
            ["panto","Klasik ve dengeli, yüz oranlarını bozmaz."],
            ["aviator","Damla kesim oval yüzde oturaklı durur."]],
      kalp:[["oval","Altta genişleyen yumuşak hat dar çene ile denge kurar."],
            ["panto","Yuvarlağa yakın alt hat alnın genişliğini dengeler."],
            ["yuvarlak","Yumuşak daire biçimi sivri çene hattını dengeler."]]
    }[face]||[];
    const mats = weight==="hafif" ? ["Titanyum","TR90"] : weight==="saglam" ? ["Asetat","TR90"] : ["Asetat","Metal"];
    const styleNote={ince:"İnce metal veya çerçevesiz montaj tercih edin.",
      kalin:"Kalın asetat, yüzde net bir çizgi bırakır.",
      klasik:"Bağa deseni ve antik altın gibi zamansız renkler uygun olur.",
      renkli:"Desenli asetat ve kontrast iç renkler iyi sonuç verir."}[style];
    const useNote={"Günlük":"Gün boyu kullanımda burunluk ayarı ve sap boyu belirleyicidir; mağazada ayarlıyoruz.",
      "Ekran":"Ekran kullanımında cam kaplaması, çerçeve biçiminden daha etkilidir.",
      "Okuma":"Okuma için biraz daha alçak ve hafif çerçeveler rahat olur.",
      "Güneş":"Güneş için yüzü saran, biraz daha büyük kesimler tercih edilir."}[use];
    const stock=FRAMES.filter(f=>(f.use===use||use==="Günlük")&&mats.includes(f.material)).slice(0,3);

    $("#qBar").style.width="100%";
    $("#qStep").textContent="Sonuç";
    $("#qTitle").textContent="Denemeye buradan başlayın";
    $("#qOpts").innerHTML="";
    $("#quiz").insertAdjacentHTML("beforeend",`
      <div style="margin-top:22px">
        <div class="frames" style="grid-template-columns:repeat(3,1fr)">
          ${byFace.slice(0,3).map(([sh,why])=>`<article class="frame">${glassesSVG(sh)}
            <div class="code">${sh.charAt(0).toUpperCase()+sh.slice(1)}</div>
            <div class="meta">${why}</div></article>`).join("")}
        </div>
        <p style="margin-top:20px">Malzeme olarak ${mats.join(" veya ")} öneriyoruz. ${styleNote} ${useNote}</p>
        ${stock.length?`<p>Mağazada şu an bulunan yakın modeller: ${stock.map(s=>s.code).join(", ")}.</p>`:""}
        <p class="note">Bu öneri genel yüz oranlarına dayanır. Çerçeve seçimi denemeden tamamlanmaz; birkaç modeli birlikte deneyebiliriz.</p>
        <div class="btnrow"><a class="btn" href="randevu.html">Randevu oluştur</a>
        <button class="btn ghost" id="qReset">Baştan başla</button></div>
      </div>`);
    $("#qReset").addEventListener("click",()=>{ qi=0; answers={}; $("#quiz").innerHTML=shell; step(); });
  }
  $("#quiz").innerHTML=shell; step();
}

/* ---------- onarım formu ---------- */
if($("#rp_wa")){
  const text=()=>{
    if(!v("#rp_name")||!v("#rp_phone")) return null;
    const l=["Onarım talebi — Akan Optik","Ad: "+v("#rp_name"),"Telefon: "+v("#rp_phone"),"Sorun: "+v("#rp_kind")];
    if(v("#rp_note")) l.push("Açıklama: "+v("#rp_note"));
    return l.join("\n");
  };
  const guard=fn=>()=>{ const t=text(); if(!t){toast("Ad ve telefon alanlarını doldurun.");$("#rp_name").focus();return;} fn(t); };
  $("#rp_wa").addEventListener("click",guard(send));
  $("#rp_copy").addEventListener("click",guard(copy));
}
