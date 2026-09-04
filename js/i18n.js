/* Two languages, one dictionary. The Indonesian is not a translation of the
   English — it is rewritten in the register people actually speak in, because
   a literal translation of a joke stops being a joke. */
window.I18N = {
  en: {
    "skip":"Skip to content",
    "nav.about":"About","nav.stack":"Stack","nav.work":"Work","nav.live":"Live",
    "nav.career":"Career","nav.contact":"Contact",

    "hero.eyebrow":"SENIOR FULL STACK ENGINEER @ SBLNET",
    "hero.aka":"yes, that is the whole name",
    "hero.lede":"I build the systems where being wrong costs real money — billing engines, double-entry ledgers, payment gateways, and the routers that decide whether your stream buffers tonight.",
    "hero.meta":"Jakarta, Indonesia · UTC+7 · 6+ years shipping",
    "hero.sticker1":"SHIP IT","hero.sticker2":"WORKS ON MY MACHINE",
    "cta.hire":"Hire me","cta.cv":"Download CV",

    "stat.years":"YEARS SHIPPING","stat.clients":"COMPANIES &amp; CLIENTS",
    "stat.products":"PRODUCTS SHIPPED","stat.bugs":"KNOWN BUGS","stat.cat":"CAT NAMED CIMOL",
    "stat.note":"That last tile used to say <code>0</code>. That claim was, itself, the bug.",

    "sec.about":"WHOAMI","sec.stack":"THE ARSENAL","sec.work":"WAR STORIES",
    "sec.live":"SHIPPED IT","sec.career":"CAREER","sec.talks":"TALKED AT PEOPLE",
    "sec.edu":"EDUCATION","sec.contact":"SAY HI",

    "term.name":"Muhammad Ilham Rafiannandha",
    "term.twist":`My degree is in English Literature. GPA 3.60.
Four years of Shakespeare, and now I argue with a
compiler for a living. Same energy, honestly —
neither one ever tells you what it actually wants.`,
    "term.cat":`Cimol. Orange. Sits on the keyboard exclusively
during deploys. Has never once been wrong about
anything, and knows it.`,

    "flags.h":"RED FLAGS, DECLARED UP FRONT",
    "flags.1":"I have strong opinions about storing money as integer cents. Nobody has ever asked me. I tell them anyway.",
    "flags.2":"I wrote an entire CLI from scratch to avoid booting one Windows VM. \"Ten minutes,\" I said. Reader, it was not ten minutes.",
    "flags.3":"\"It's a small refactor\" is a sentence I have said out loud, in public, to people who trusted me.",

    "work.note":"Most of what I have shipped lives in employer and client repositories — private, and in several cases repositories my access ended with the contract. Eight public repos is not the size of the work; it is the size of what I am allowed to hand you.",
    "w1.h":"ISP Subscriber Platform",
    "w1.p":"An entire ISP's subscriber lifecycle in one platform: onboarding, automated network provisioning, recurring billing, double-entry accounting, and payment collection across multiple gateways plus a direct host-to-host bank integration.",
    "w1.a":"27-module modular monolith on Spring Modulith — hexagonal / DDD, event-driven boundaries",
    "w1.b":"8 PostgreSQL databases, per-context ACID via multi-datasource transaction management",
    "w1.c":"Double-entry General Ledger; money as integer cents, because floats and money are a horror film",
    "w1.d":"Pluggable gateway port: Duitku (VA / QRIS / e-wallet) plus host-to-host BRI Fixed VA",
    "w1.e":"FreeRADIUS + MikroTik RouterOS — PPPoE, live sessions, CoA disconnect, dunning auto-isolation",
    "w1.cs":"Read the case study",
    "w2.h":"Itoya — studio platform + remote agent",
    "w2.p":"Customers book a booth online. The booth is a PC. PCs freeze. That second problem is why this project has two halves — and why I wrote a C++ agent instead of driving to a studio at midnight.",
    "w3.h":"Finance &amp; Reconciliation Portal",
    "w3.p":"A payment company's back office has exactly one job: prove that every rupiah that moved actually moved. Two-stage reconciliation, dispute and missing-record detection, disbursement and deduction.",
    "w4.h":"CoffeeLabs — HRIS, POS &amp; face recognition",
    "w4.p":"Attendance with GPS geofencing, a separate face-recognition service so people stop clocking in for each other, a WhatsApp gateway, POS and inventory. I led the team and ran the internship programme.",
    "w4.bo":"Back office",
    "w5.h":"Spectro &amp; ArkaLearn — hired in Japan",
    "w5.p":"ArkaLearn teaches Japanese for work — JLPT N5 to N3, SSW prep. Spectro is the job portal those learners graduate into: two-sided marketplace, six-axis faceted search, in-app messaging, and SSW visa document handling.",
    "w6.h":"Taman Safari Bogor — gate to back office",
    "w6.p":"Ticketing site, back office, and the React Native gate app: QR and barcode scanning built for a queue rather than a demo, with fraud detection that rejects reused tickets at the turnstile instead of in a report afterwards.",
    "w7.h":"DPUPR — a government CMS I actually wrote",
    "w7.p":"The easy version is a theme and a plugin directory. The problem is that the people updating it are civil servants, and every plugin is a future CVE. So: pages, posts, a nested menu builder, media library and a composable home page — no plugin ecosystem to audit.",
    "w8.h":"Umrah &amp; Hajj platforms",
    "w8.p":"Pilgrimage travel is a logistics problem wearing a religious hat: passports, visas, seat quotas, flight manifests, hotel room-sharing, instalments, and a deadline that does not negotiate.",

    "live.note":"Everything below is running right now. I checked every link before publishing this page, which is more than most portfolios can say.",
    "l.sbl":"Fiber ISP — subscriber platform, billing, provisioning",
    "l.bp":"Apartment and room booking platform",
    "l.wb":"Daily and transit apartment rental",
    "l.ito":"Self-photo studio booking + remote management",
    "l.dpupr":"Government agency portal on a custom CMS",
    "l.cl":"Company site","l.clh":"Attendance, GPS geofence, face recognition",
    "l.clb":"Admin and operations console","l.elt":"Umrah &amp; Hajj agency platform",
    "l.eg":"Jamaah portal","l.ts":"Domestic ticketing + back office",
    "l.ark":"Japanese-language EdTech feeding a job portal",
    "l.gd":"B2B custom packaging catalogue",
    "l.tb":"Trilingual site (EN/ID/AR) + sales CRM",
    "l.aero":"Drone training centre — 2021 build was mine",
    "l.has":"Company profile + registration system",

    "t.now":"NOW","t.fsd":"Full Stack Developer","t.lead":"Full Stack Developer · Team Lead",
    "t.mob":"Mobile Developer","t.fse":"Full Stack Engineer",
    "t.web":"Full Stack Web Developer","t.intern":"Full Stack Web Developer · Internship",

    "talk.1":"Speaker, \"Web Application in the World of Work\" — HMIK Talk, Pertamina University",
    "talk.2":"Main speaker, \"Ngoding Bareng\" — Permikomnas Jakarta",
    "talk.note":"Two universities handed me a microphone in 2022 and nobody has asked for it back. I choose to read that as a good sign.",
    "edu.deg":"Bachelor of English Literature — GPA 3.60 / 4.00 · 2018—2023",
    "edu.note":"Not a computer science degree. You will have noticed the code works anyway.",

    "cv.h":"THE ACTUAL CV",
    "cv.p":"Everything on this page, compressed into the format recruiters keep asking for. One PDF, no design crimes, no \"references available upon request\".",
    "cv.btn":"Download CV (PDF)",
    "contact.p":"Got a system that has to balance to the cent, stay online at 3 AM, or ship to both app stores? That is my favourite kind of conversation.",
    "contact.loc":"Jakarta",
    "foot.q":"Interested in new things. Addicted to code. That's all.",
    "foot.built":"Built by hand. No template.",
    "foot.cat":"There are cats on this page. The count is deliberate. Her name is Cimol."
  },

  id: {
    "skip":"Lompat ke konten",
    "nav.about":"Tentang","nav.stack":"Senjata","nav.work":"Kerjaan","nav.live":"Live",
    "nav.career":"Karir","nav.contact":"Kontak",

    "hero.eyebrow":"SENIOR FULL STACK ENGINEER @ SBLNET",
    "hero.aka":"iya, sepanjang itu. maaf ya",
    "hero.lede":"Gue bikin sistem yang kalau salah, duitnya beneran ilang — billing engine, buku besar double-entry, payment gateway, sama router yang nentuin malam ini streaming lu buffering apa nggak.",
    "hero.meta":"Jakarta, Indonesia · UTC+7 · 6+ tahun ngirim ke produksi",
    "hero.sticker1":"GAS AJA","hero.sticker2":"DI LAPTOP GUE JALAN KOK",
    "cta.hire":"Rekrut gue","cta.cv":"Unduh CV",

    "stat.years":"TAHUN DI PRODUKSI","stat.clients":"PERUSAHAAN &amp; KLIEN",
    "stat.products":"PRODUK DIRILIS","stat.bugs":"BUG YANG KETAUAN","stat.cat":"KUCING NAMANYA CIMOL",
    "stat.note":"Kotak terakhir itu tadinya <code>0</code>. Klaim itu sendiri yang justru jadi bug-nya.",

    "sec.about":"SIAPA GUE","sec.stack":"SENJATA","sec.work":"CERITA PERANG",
    "sec.live":"YANG UDAH JADI","sec.career":"KARIR","sec.talks":"NGOMONG DI DEPAN ORANG",
    "sec.edu":"PENDIDIKAN","sec.contact":"SAPA GUE",

    "term.name":"Muhammad Ilham Rafiannandha",
    "term.twist":`Gue lulusan Sastra Inggris. IPK 3.60.
Empat tahun ngulik Shakespeare, sekarang tiap hari
berantem sama compiler. Sebenernya mirip sih —
dua-duanya gak pernah ngasih tau maunya apa.`,
    "term.cat":`Cimol. Oren. Naik ke keyboard cuma pas lagi deploy.
Belum pernah sekalipun salah, dan dia sadar itu.`,

    "flags.h":"RED FLAG, GUE UMUMIN DI DEPAN AJA",
    "flags.1":"Gue punya pendapat keras soal nyimpen duit pakai integer cent. Gak pernah ada yang nanya. Tetep gue ceritain.",
    "flags.2":"Pernah bikin CLI dari nol cuma biar gak usah nyalain Windows. \"Sepuluh menit doang,\" kata gue waktu itu. Ternyata bukan sepuluh menit.",
    "flags.3":"\"Refactor dikit doang kok\" — kalimat yang pernah gue ucapin, keras-keras, di depan orang yang percaya sama gue.",

    "work.note":"Sebagian besar kerjaan gue ada di repo perusahaan dan klien — private, dan beberapa aksesnya udah ilang bareng habisnya kontrak. Delapan repo public itu bukan ukuran kerjaannya; itu ukuran yang boleh gue kasih liat.",
    "w1.h":"Platform Pelanggan ISP",
    "w1.p":"Seluruh siklus hidup pelanggan ISP dalam satu platform: pendaftaran, provisioning jaringan otomatis, tagihan bulanan, akuntansi double-entry, sampai penagihan lewat banyak gateway plus integrasi host-to-host langsung ke bank.",
    "w1.a":"Modular monolith 27 modul di Spring Modulith — hexagonal / DDD, batas antar modul lewat event",
    "w1.b":"8 database PostgreSQL, ACID per konteks lewat multi-datasource transaction management",
    "w1.c":"Buku besar double-entry; duit disimpan sebagai integer cent, soalnya float dan duit itu film horor",
    "w1.d":"Port gateway yang bisa dicolok-copot: Duitku (VA / QRIS / e-wallet) plus BRI Fixed VA host-to-host",
    "w1.e":"FreeRADIUS + MikroTik RouterOS — PPPoE, sesi live, CoA disconnect, isolasi otomatis buat yang nunggak",
    "w1.cs":"Baca studi kasusnya",
    "w2.h":"Itoya — platform studio + agen remote",
    "w2.p":"Pelanggan booking booth online. Booth-nya PC. PC suka nge-hang. Masalah kedua itu alasan project ini punya dua bagian — dan alasan gue nulis agen C++ daripada nyetir ke studio jam 12 malem.",
    "w3.h":"Portal Finance &amp; Rekonsiliasi",
    "w3.p":"Back office perusahaan pembayaran cuma punya satu tugas: buktiin tiap rupiah yang pindah itu emang beneran pindah. Rekonsiliasi dua tahap, deteksi selisih dan data yang ilang, disbursement dan deduction.",
    "w4.h":"CoffeeLabs — HRIS, POS &amp; face recognition",
    "w4.p":"Absensi pakai GPS geofence, service face recognition terpisah biar gak ada lagi yang absenin temennya, WhatsApp gateway, POS dan inventory. Gue yang mimpin timnya sekalian ngurus anak magang.",
    "w4.bo":"Back office",
    "w5.h":"Spectro &amp; ArkaLearn — biar bisa kerja di Jepang",
    "w5.p":"ArkaLearn ngajarin bahasa Jepang buat kerja — JLPT N5 sampai N3, persiapan SSW. Spectro portal kerjanya: marketplace dua sisi, filter enam sumbu, chat di dalam aplikasi, sampai pengelolaan dokumen visa SSW.",
    "w6.h":"Taman Safari Bogor — dari gerbang sampai back office",
    "w6.p":"Situs tiket, back office, dan aplikasi gerbang React Native: scan QR dan barcode yang dibikin buat antrean beneran, bukan buat demo, plus deteksi tiket dobel yang nolak di pintu masuk — bukan baru ketauan besoknya di laporan.",
    "w7.h":"DPUPR — CMS pemerintah yang gue tulis sendiri",
    "w7.p":"Versi gampangnya: pasang tema, tambah plugin. Masalahnya yang update situs ini pegawai dinas, bukan developer, dan tiap plugin itu CVE masa depan. Jadi: halaman, berita, menu bertingkat, media library, dan homepage yang bisa disusun ulang sendiri — tanpa ekosistem plugin yang harus diaudit.",
    "w8.h":"Platform Umrah &amp; Haji",
    "w8.p":"Travel ibadah itu sebenernya masalah logistik yang lagi pakai peci: paspor, visa, kuota kursi, manifes penerbangan, pembagian kamar hotel, cicilan, dan deadline yang gak bisa diajak nego.",

    "live.note":"Semua yang di bawah ini jalan sekarang juga. Tiap link gue cek dulu sebelum halaman ini dipublish — dan itu lebih dari yang bisa diklaim kebanyakan portfolio.",
    "l.sbl":"ISP fiber — platform pelanggan, tagihan, provisioning",
    "l.bp":"Platform booking apartemen dan kamar",
    "l.wb":"Sewa apartemen harian dan transit",
    "l.ito":"Booking studio foto mandiri + remote management",
    "l.dpupr":"Portal dinas pemerintah di CMS custom",
    "l.cl":"Situs perusahaan","l.clh":"Absensi, GPS geofence, face recognition",
    "l.clb":"Konsol admin dan operasional","l.elt":"Platform travel Umrah &amp; Haji",
    "l.eg":"Portal jamaah","l.ts":"Tiket domestik + back office",
    "l.ark":"EdTech bahasa Jepang yang nyambung ke portal kerja",
    "l.gd":"Katalog packaging custom B2B",
    "l.tb":"Situs tiga bahasa (EN/ID/AR) + CRM sales",
    "l.aero":"Pusat pelatihan drone — versi 2021 buatan gue",
    "l.has":"Company profile + sistem pendaftaran",

    "t.now":"SEKARANG","t.fsd":"Full Stack Developer","t.lead":"Full Stack Developer · Team Lead",
    "t.mob":"Mobile Developer","t.fse":"Full Stack Engineer",
    "t.web":"Full Stack Web Developer","t.intern":"Full Stack Web Developer · Magang",

    "talk.1":"Pembicara, \"Web Application in the World of Work\" — HMIK Talk, Universitas Pertamina",
    "talk.2":"Pembicara utama, \"Ngoding Bareng\" — Permikomnas Jakarta",
    "talk.note":"Dua kampus ngasih gue mic di 2022 dan sampai sekarang gak ada yang minta balik. Gue anggap itu pertanda bagus.",
    "edu.deg":"Sarjana Sastra Inggris — IPK 3.60 / 4.00 · 2018—2023",
    "edu.note":"Bukan lulusan Ilmu Komputer. Tapi kodenya jalan juga kan.",

    "cv.h":"CV-NYA, YANG BENERAN",
    "cv.p":"Semua yang ada di halaman ini, dipadetin jadi format yang HRD terus-terusan minta. PDF, tanpa dosa desain, tanpa tulisan \"referensi tersedia bila diminta\".",
    "cv.btn":"Unduh CV (PDF)",
    "contact.p":"Punya sistem yang harus balance sampai satuan rupiah, harus tetep nyala jam 3 pagi, atau harus rilis di dua app store sekaligus? Nah itu obrolan favorit gue.",
    "contact.loc":"Jakarta",
    "foot.q":"Suka hal baru. Kecanduan ngoding. Udah, gitu aja.",
    "foot.built":"Dibikin manual. Tanpa template.",
    "foot.cat":"Ada kucing di halaman ini. Jumlahnya disengaja. Namanya Cimol."
  }
};
