/* Two editions, not one edition translated twice.
   EN is dry, understated, British-newspaper wit — the joke hides in the wording.
   ID is Indonesian stand-up: long setup, short punchline, local references,
   and the beat lands on the last four words. Several entries have no
   counterpart in the other language at all, which is the point. */
window.I18N = {
  en: {
    "cov.head":"The Quiet Half Of The Internet",
    "cov.sub":"Billing engines, double-entry ledgers, and the routers that decide whether you buffer tonight.",
    "cov.l1":"27 MODULES · 8 DATABASES · ONE DEPLOYABLE",
    "cov.l2":"WORKS ON MY MACHINE",
    "cov.l3":"KNOWN BUGS: NaN — see Corrections, p.1",
    "cov.l4":"PLUS: A CAT NAMED CIMOL",
    "cov.name":"MUHAMMAD ILHAM RAFIANNANDHA",
    "cov.role":"SENIOR FULL STACK ENGINEER · JAKARTA",
    "cov.scroll":"OPEN THE PAPER",
    "cov.price":"Rp 0",
    "mast":"THE BONSKY TIMES",
    "mast.tag":"All the code that's fit to ship",
    "folio.vol":"VOL. VI · No. 44",
    "folio.price":"FREE · ALWAYS WAS",
    "folio.city":"JAKARTA EDITION",
    "ticker":"SENIOR FULL STACK ENGINEER ★ JAKARTA · UTC+7 ★ 6+ YEARS IN PRODUCTION ★ JAVA · SPRING MODULITH · NEXT.JS · REACT NATIVE ★ ONE CAT, ORANGE, NAMED CIMOL ★",

    "fp.kicker":"PROFILE · PAGE ONE",
    "fp.head":"The Man Who Puts Money In Integers",
    "fp.deck":"Six years building systems where being wrong is expensive. A billing engine does not accept an apology.",
    "fp.byline":"BY THE DESK OF ILHAM RAFIANNANDHA",
    "fp.caption":"THE SUBJECT, photographed mid-gesture. He was asked to look professional. This was the result.",
    "fp.p1":"Muhammad Ilham Rafiannandha — known to everyone who has ever worked with him as Bonsky — builds the unglamorous half of the internet. Billing engines. Double-entry ledgers. Payment gateways. The routers that quietly decide whether your stream buffers tonight.",
    "fp.p2":"It is not work that photographs well. Nobody has ever demoed a reconciliation report to applause. But it is the work where being wrong costs actual money, and that has a way of concentrating the mind.",
    "fp.p3":"He is, at time of printing, Senior Full Stack Engineer at an Indonesian fibre ISP, where twenty-seven Spring Modulith modules and eight PostgreSQL databases are the difference between a customer being online and a customer being on the phone.",
    "fp.p4":"His degree is in English Literature. He would like this on the record.",

    "idx.h":"INSIDE TODAY",
    "idx.1":"Who He Is","idx.2":"The Arsenal","idx.3":"War Stories",
    "idx.4":"Shipped &amp; Live","idx.5":"Chronology","idx.6":"Write To Us",
    "idx.note":"No navigation bar. This is a newspaper.",

    "wx.h":"WEATHER",
    "wx.body":"JAKARTA — 31°C, humid, chance of rain around 4pm. Servers slightly warmer. Outlook: fine, assuming nobody deploys on a Friday.",

    "num.h":"BY THE NUMBERS",
    "num.years":"years in production","num.clients":"companies &amp; clients",
    "num.products":"products shipped","num.bugs":"known bugs","num.cat":"cat, orange, Cimol",

    "corr.h":"CORRECTIONS",
    "corr.body":"An earlier edition of this page reported <b>0</b> known bugs. That claim was, itself, the bug. We regret the error and have replaced the figure with <b>NaN</b>, which is at least honest.",

    "secB.label":"SECTION B","secB.h":"TECHNOLOGY",
    "secB.deck":"What he reaches for, arranged by the part of the stack that is currently on fire.",

    "secC.label":"SECTION C","secC.h":"WAR STORIES",
    "secC.deck":"Most of this work lives in private client repositories, several of which he lost access to the day the contract ended. Eight public repos is not the size of the work. It is the size of what he is allowed to hand you.",

    "w1.k":"LEAD FEATURE","w1.h":"Twenty-Seven Modules, Eight Databases, One Deployable",
    "w1.d":"An ISP's entire subscriber lifecycle, from the sign-up form to the router that cuts you off for not paying.",
    "w1.b":"A modular monolith on Spring Modulith — compiler-enforced boundaries, event-driven across contexts, per-context ACID over eight PostgreSQL databases. A real double-entry ledger, because a balance column tells you <i>what</i> and a ledger tells you <i>why</i>. Money as integer cents throughout, floats being a horror film. Payments arrive through one pluggable port with a Duitku adapter and a host-to-host BRI Fixed VA adapter behind it. FreeRADIUS and MikroTik do the actual cutting off.",
    "w1.cs":"Read the full case study",

    "w2.k":"OPERATIONS","w2.h":"The Booth Freezes At Midnight. He Does Not Drive There.",
    "w2.d":"Itoya Self Photo Studio — a booking platform, and the C++ agent that babysits the machines.",
    "w2.b":"Customers book a booth online. The booth is a PC. PCs freeze. The second problem is why this project has two halves: a Laravel and Vue booking platform, and a Windows agent doing DXGI capture and remote input over a uWebSockets relay, with a Flutter desktop dashboard on the other end.",

    "w3.k":"FINANCE","w3.h":"Proving That Every Rupiah That Moved Actually Moved",
    "w3.d":"A payment company's back office has exactly one job, and this is it.",
    "w3.b":"Two-stage reconciliation — third-party settlement against bank mutation, then that result against back-office records — with dispute, missing-in-bank and missing-in-back-office detection, plus disbursement and deduction.",

    "w4.k":"HUMAN RESOURCES","w4.h":"So People Stop Clocking In For Each Other",
    "w4.d":"CoffeeLabs: HRIS, point of sale, inventory, and a face-recognition service that ended a long-running tradition.",
    "w4.b":"Attendance with GPS geofencing, a separate Python model service behind a Node inference layer, a NestJS WhatsApp gateway for notifications, plus POS and inventory. He led the team and ran the internship programme.",

    "w5.k":"EDUCATION &amp; LABOUR","w5.h":"Teaching Japanese, Then Finding The Job",
    "w5.d":"ArkaLearn takes learners from JLPT N5 to SSW. Spectro is where they land.",
    "w5.b":"A two-sided marketplace with candidate and employer profiles, faceted search across six independent axes, applications tracking, in-app conversations, and document handling for Japan's Specified Skilled Worker visa — the part where a missing file costs somebody a job offer.",

    "w6.k":"TOURISM","w6.h":"Built For A Queue, Not For A Demo",
    "w6.d":"Taman Safari Bogor — ticketing site, back office, and the app the staff actually hold at the gate.",
    "w6.b":"QR and barcode scanning with on-device printing, and fraud detection that rejects a reused ticket at the turnstile rather than discovering it in a report the following morning.",

    "w7.k":"GOVERNMENT","w7.h":"A Ministry Portal With No Plugins To Audit",
    "w7.d":"DPUPR Musi Banyuasin, published as INFRALOK, on a CMS written for the purpose.",
    "w7.b":"The easy version of this job is a theme and a plugin directory. The problem with the easy version is that the people updating the site are civil servants, and every plugin is a future CVE somebody else has to patch. So: pages, posts, a nested menu builder, a media library, and a home page that rearranges from the admin panel.",

    "w8.k":"TRAVEL","w8.h":"Logistics, Wearing A Religious Hat",
    "w8.d":"Elteyba Tours and SmartHajj — pilgrimage travel, which is a supply chain with a deadline that does not negotiate.",
    "w8.b":"Passports, visas, seat quotas, flight manifests, hotel room-sharing logic, instalment tracking, and PDF manifests for immigration. Multi-role approval flows throughout.",

    "secD.label":"SECTION D","secD.h":"SHIPPED &amp; LIVE",
    "secD.deck":"Every address below was checked before this edition went to press, which is more than most portfolios can claim.",
    "ads.h":"CLASSIFIED",
    "ad1.h":"WANTED","ad1.b":"Someone brave enough to tell me a refactor is too large. Must be prepared to be argued with for forty minutes. References not required.",
    "ad2.h":"FOR SALE","ad2.b":"One Windows virtual machine, unopened, as new. Wrote a native CLI instead. Buyer collects.",
    "ad3.h":"LOST","ad3.b":"Four hours. Last seen in the vicinity of a floating-point rounding error. Sentimental value. No reward offered.",

    "secE.label":"SECTION E","secE.h":"CHRONOLOGY",
    "secE.deck":"Eleven employers and clients, in reverse order, as is traditional.",
    "t.now":"PRESENT","t.fsd":"Full Stack Developer","t.lead":"Full Stack Developer · Team Lead",
    "t.mob":"Mobile Developer","t.fse":"Full Stack Engineer",
    "t.web":"Full Stack Web Developer","t.intern":"Full Stack Web Developer · Internship",

    "talk.h":"ON THE RECORD",
    "talk.1":"Speaker — \"Web Application in the World of Work\", HMIK Talk, Pertamina University",
    "talk.2":"Main speaker — \"Ngoding Bareng\", Permikomnas Jakarta",
    "talk.note":"Two universities handed him a microphone in 2022. Nobody has asked for it back.",
    "edu.h":"EDUCATION",
    "edu.1":"Universitas Darma Persada, Jakarta",
    "edu.2":"Bachelor of English Literature — GPA 3.60 / 4.00 · 2018–2023",
    "edu.note":"Not a computer science degree. The reader will have noticed the code works anyway.",

    "cv.h":"THE CV, IN PDF",
    "cv.b":"Everything in this edition, compressed into the one format recruiters keep asking for. No design crimes. No \"references available upon request\".",
    "cv.btn":"Download the CV",

    "secF.label":"SECTION F","secF.h":"WRITE TO US",
    "secF.deck":"A system that has to balance to the cent, stay up at 3am, or ship to both stores. That is the favourite kind of letter.",
    "c.mail":"Electronic mail","c.li":"Professional network","c.gh":"Source, such as it is public","c.loc":"Desk location",

    "colo.1":"Set in Archivo Black, DM Serif Display, Newsreader and JetBrains Mono. Printed nowhere.",
    "colo.2":"Written and typeset by hand. No template, no framework, no build step.",
    "colo.3":"There are cats throughout this edition. The count is deliberate. Her name is Cimol and she is orange.",
    "skip":"Skip to the front page"
  },

  id: {
    "cov.head":"\u201cKerja Di Komputer\u201d",
    "cov.sub":"Enam tahun bikin sistem yang kalau salah, duitnya beneran ilang. Nyokap belum nyambung juga.",
    "cov.l1":"27 MODUL · 8 DATABASE · SATU DEPLOY",
    "cov.l2":"DI LAPTOP GUE JALAN KOK",
    "cov.l3":"BUG KETAUAN: NaN — lihat Ralat, hlm.1",
    "cov.l4":"BONUS: KUCING OREN NAMANYA CIMOL",
    "cov.name":"MUHAMMAD ILHAM RAFIANNANDHA",
    "cov.role":"SENIOR FULL STACK ENGINEER · JAKARTA",
    "cov.scroll":"BUKA KORANNYA",
    "cov.price":"Rp 0",
    "mast":"HARIAN BONSKY",
    "mast.tag":"Enak Dibaca, Kadang Perlu",
    "folio.vol":"TAHUN VI · No. 44",
    "folio.price":"GRATIS · DARI DULU",
    "folio.city":"EDISI JAKARTA",
    "ticker":"SENIOR FULL STACK ENGINEER ★ JAKARTA · UTC+7 ★ 6+ TAHUN DI PRODUKSI ★ JAVA · SPRING MODULITH · NEXT.JS · REACT NATIVE ★ PUNYA KUCING OREN NAMANYA CIMOL ★",

    "fp.kicker":"SOSOK · HALAMAN SATU",
    "fp.head":"Nyokapnya Masih Bilang Anaknya \"Kerja Di Komputer\"",
    "fp.deck":"Enam tahun bikin sistem yang kalau salah, duitnya beneran ilang. Sudah dijelasin tiga kali ke rumah. Belum nyambung juga.",
    "fp.byline":"DITULIS SENDIRI, KARENA GAK ADA YANG MAU NULISIN",
    "fp.caption":"YANG BERSANGKUTAN, difoto pas lagi gaya. Disuruh yang profesional. Ya begini hasilnya.",
    "fp.p1":"Muhammad Ilham Rafiannandha — dipanggil Bonsky sama semua orang yang pernah kerja bareng, dan gak ada satu pun yang inget kenapa — kerjanya di bagian internet yang gak ada bagus-bagusnya buat difoto. Billing engine. Buku besar. Payment gateway. Router yang diem-diem nentuin malam ini streaming lu buffering apa nggak.",
    "fp.p2":"Kerjaan model gini gak pernah bikin orang tepuk tangan. Belum pernah ada demo laporan rekonsiliasi terus satu ruangan berdiri. Tapi ini kerjaan yang kalau salah, duitnya ilang beneran — bukan ilang yang bisa di-Ctrl+Z. Ilang yang bikin orang nelfon jam dua pagi.",
    "fp.p3":"Sampai koran ini naik cetak, dia Senior Full Stack Engineer di sebuah ISP fiber. Dua puluh tujuh modul Spring Modulith dan delapan database PostgreSQL, dan itu semua yang misahin antara pelanggan lagi nonton sama pelanggan lagi nelfon CS.",
    "fp.p4":"Kuliahnya Sastra Inggris. Dia minta ini dicatat.",

    "idx.h":"DAFTAR ISI",
    "idx.1":"Orangnya Siapa","idx.2":"Senjatanya","idx.3":"Cerita Perang",
    "idx.4":"Yang Udah Jadi","idx.5":"Riwayat","idx.6":"Surat Pembaca",
    "idx.note":"Gak ada navbar. Ini koran.",

    "wx.h":"CUACA",
    "wx.body":"JAKARTA — 31°C, lembab, kemungkinan hujan jam 4 sore. Server lebih anget dikit. Prakiraan: aman, asal gak ada yang deploy hari Jumat.",

    "num.h":"ANGKA-ANGKA",
    "num.years":"tahun di produksi","num.clients":"perusahaan &amp; klien",
    "num.products":"produk dirilis","num.bugs":"bug yang ketauan","num.cat":"kucing oren, Cimol",

    "corr.h":"RALAT",
    "corr.body":"Edisi sebelumnya menulis jumlah bug yang ketauan ada <b>0</b>. Itu bukan data. Itu doa. Redaksi minta maaf dan sudah menggantinya jadi <b>NaN</b>, yang setidaknya jujur.",

    "secB.label":"BAGIAN B","secB.h":"TEKNOLOGI",
    "secB.deck":"Yang dipakai sehari-hari, dikelompokkin berdasarkan bagian mana dari stack yang lagi kebakaran.",

    "secC.label":"BAGIAN C","secC.h":"CERITA PERANG",
    "secC.deck":"Kebanyakan kerjaan ini ada di repo klien yang private, dan beberapa aksesnya udah dicabut hari kontraknya abis. Delapan repo public itu bukan ukuran kerjaannya. Itu ukuran yang boleh dikasih liat.",

    "w1.k":"LAPORAN UTAMA","w1.h":"Kalau Streaming Lu Buffering, Ada Kemungkinan Itu Salah Dia",
    "w1.d":"Seluruh siklus hidup pelanggan ISP, dari form daftar sampai router yang mutusin internet gara-gara nunggak.",
    "w1.b":"Modular monolith di atas Spring Modulith — batas antar modul dijaga compiler, komunikasi lewat event, ACID per konteks di delapan database PostgreSQL. Pakai buku besar double-entry beneran, karena kolom saldo cuma jawab <i>berapa</i>, sementara buku besar jawab <i>kenapa</i>. Duit disimpen sebagai integer cent dari ujung ke ujung, soalnya float dan duit itu kombinasi yang bikin orang resign. Pembayaran masuk lewat satu port yang bisa dicolok-copot: adapter Duitku, dan adapter BRI Fixed VA host-to-host. Yang mutusin internetnya beneran itu FreeRADIUS sama MikroTik.",
    "w1.cs":"Baca studi kasus lengkapnya",

    "w2.k":"OPERASIONAL","w2.h":"Booth-nya Nge-hang Jam 12 Malam. Dia Gak Ke Sana.",
    "w2.d":"Itoya Self Photo Studio — platform booking, plus agen C++ yang jagain mesinnya.",
    "w2.b":"Pelanggan booking booth online. Booth-nya PC. PC suka nge-hang. Masalah kedua itu alasan project ini punya dua bagian: platform booking Laravel dan Vue, plus agen Windows yang ngerekam layar pakai DXGI dan ngirim input balik lewat relay uWebSockets, dengan dashboard Flutter di ujung satunya. Daripada nyetir ke studio tengah malem cuma buat mencet tombol power.",

    "w3.k":"KEUANGAN","w3.h":"Buktiin Tiap Rupiah Yang Pindah Emang Beneran Pindah",
    "w3.d":"Back office perusahaan pembayaran cuma punya satu tugas, dan ini tugasnya.",
    "w3.b":"Rekonsiliasi dua tahap — settlement pihak ketiga diadu sama mutasi bank, hasilnya diadu lagi sama data back office — lengkap sama deteksi selisih, transaksi yang gak nyampe bank, dan yang gak kecatet di back office. Plus disbursement dan deduction.",

    "w4.k":"SUMBER DAYA MANUSIA","w4.h":"Biar Gak Ada Lagi Yang Absenin Temennya",
    "w4.d":"CoffeeLabs: HRIS, kasir, inventory, dan satu service face recognition yang mengakhiri sebuah tradisi.",
    "w4.b":"Absensi pakai GPS geofence, service model Python terpisah di belakang layer inference Node, WhatsApp gateway NestJS buat notifikasi, plus POS dan inventory. Dia yang mimpin timnya sekalian ngurus anak magang.",

    "w5.k":"PENDIDIKAN &amp; TENAGA KERJA","w5.h":"Diajarin Bahasa Jepang Dulu, Baru Dicariin Kerjaan",
    "w5.d":"ArkaLearn bawa muridnya dari JLPT N5 sampai SSW. Spectro tempat mereka mendarat.",
    "w5.b":"Marketplace dua sisi dengan profil kandidat dan perusahaan, filter enam sumbu, pelacakan lamaran, chat di dalam aplikasi, sampai pengelolaan dokumen visa Specified Skilled Worker Jepang — bagian di mana satu berkas ketinggalan bisa bikin orang gagal berangkat.",

    "w6.k":"PARIWISATA","w6.h":"Dibikin Buat Antrean Beneran, Bukan Buat Demo",
    "w6.d":"Taman Safari Bogor — situs tiket, back office, dan aplikasi yang dipegang petugas di gerbang.",
    "w6.b":"Scan QR dan barcode plus cetak struk langsung dari HP, dan deteksi tiket dobel yang nolaknya di pintu masuk — bukan baru ketauan besok paginya pas laporan udah dicetak.",

    "w7.k":"PEMERINTAHAN","w7.h":"Portal Dinas Yang Gak Punya Plugin Buat Diaudit",
    "w7.d":"DPUPR Musi Banyuasin, tayang dengan nama INFRALOK, di atas CMS yang ditulis khusus.",
    "w7.b":"Versi gampangnya: pasang tema, tambah plugin, kelar. Masalahnya yang update situs ini pegawai dinas, bukan developer, dan tiap plugin itu CVE masa depan yang harus ditambal orang lain. Jadi dibikin sendiri: halaman, berita, menu bertingkat, media library, dan homepage yang bisa disusun ulang dari panel admin.",

    "w8.k":"PERJALANAN","w8.h":"Masalah Logistik Yang Lagi Pakai Peci",
    "w8.d":"Elteyba Tours dan SmartHajj — travel ibadah, alias rantai pasok dengan deadline yang gak bisa diajak nego.",
    "w8.b":"Paspor, visa, kuota kursi, manifes penerbangan, logika bagi kamar hotel, cicilan, sampai manifes PDF buat imigrasi. Semuanya lewat alur persetujuan multi-peran.",

    "secD.label":"BAGIAN D","secD.h":"YANG UDAH JADI",
    "secD.deck":"Semua alamat di bawah ini dicek dulu sebelum edisi ini naik cetak. Dan itu lebih dari yang berani diklaim kebanyakan portfolio.",
    "ads.h":"IKLAN BARIS",
    "ad1.h":"DICARI","ad1.b":"Orang yang berani bilang \"refactor lu kegedean\". Harus siap didebat empat puluh menit. Gak perlu bawa surat pengalaman.",
    "ad2.h":"DIJUAL","ad2.b":"Satu VM Windows, masih segel, mulus. Gak jadi kepake, keburu dibikinin CLI sendiri. Ambil di tempat.",
    "ad3.h":"HILANG","ad3.b":"Waktu, empat jam. Terakhir keliatan di sekitar error pembulatan float. Bernilai sentimental. Gak ada imbalan.",

    "secE.label":"BAGIAN E","secE.h":"RIWAYAT",
    "secE.deck":"Sebelas perusahaan dan klien, dibalik urutannya, seperti kebiasaan.",
    "t.now":"SEKARANG","t.fsd":"Full Stack Developer","t.lead":"Full Stack Developer · Team Lead",
    "t.mob":"Mobile Developer","t.fse":"Full Stack Engineer",
    "t.web":"Full Stack Web Developer","t.intern":"Full Stack Web Developer · Magang",

    "talk.h":"PERNAH NGOMONG DI DEPAN",
    "talk.1":"Pembicara — \"Web Application in the World of Work\", HMIK Talk, Universitas Pertamina",
    "talk.2":"Pembicara utama — \"Ngoding Bareng\", Permikomnas Jakarta",
    "talk.note":"Dua kampus ngasih dia mic tahun 2022. Sampai sekarang gak ada yang minta balik. Entah karena bagus, entah karena lupa.",
    "edu.h":"PENDIDIKAN",
    "edu.1":"Universitas Darma Persada, Jakarta",
    "edu.2":"Sarjana Sastra Inggris — IPK 3.60 / 4.00 · 2018–2023",
    "edu.note":"Bukan lulusan Ilmu Komputer. Tapi sampai sekarang kodenya jalan, dan itu udah cukup buat tidur nyenyak.",

    "cv.h":"CV-NYA, DALAM PDF",
    "cv.b":"Semua isi edisi ini, dipadetin jadi satu format yang HRD terus-terusan minta. Padahal websitenya udah dibikinin susah-susah. Yaudah.",
    "cv.btn":"Unduh CV-nya",

    "secF.label":"BAGIAN F","secF.h":"SURAT PEMBACA",
    "secF.deck":"Sistem yang harus balance sampai rupiah terakhir, harus tetep idup jam 3 pagi, atau harus rilis di dua app store barengan. Nah, surat model gitu yang paling ditunggu.",
    "c.mail":"Surat elektronik","c.li":"Jaringan profesional","c.gh":"Kode, yang boleh dilihat","c.loc":"Lokasi meja",

    "colo.1":"Dicetak pakai Archivo Black, DM Serif Display, Newsreader, dan JetBrains Mono. Gak dicetak di mana-mana.",
    "colo.2":"Ditulis dan ditata manual. Tanpa template, tanpa framework, tanpa build step.",
    "colo.3":"Ada kucing di sepanjang edisi ini. Jumlahnya disengaja. Namanya Cimol, warnanya oren.",
    "skip":"Langsung ke halaman satu"
  }
};
