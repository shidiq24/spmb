import { db } from "./firebase-config.js";
import { supabase } from "./supabase-config.js";
// Cukup gunakan satu blok impor Firestore saja
import { 
    doc, 
    getDoc, 
    setDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const elements = {
    inputNISN: document.getElementById("nisn"),
    status: document.getElementById("status"),
    btnCekNISN: document.getElementById("btnCekNISN"),
    btnSubmit: document.getElementById("btnSubmit"),
    btnUpdate: document.getElementById("btnUpdate"),
    btnCetakBukti: document.getElementById("btnCetakBukti"),
    form: document.getElementById("form"),
    formCard: document.getElementById("formCard"),
    nisnForm: document.getElementById("nisnForm"),
    jalur: document.getElementById("jalur"),
    jenis_prestasi: document.getElementById("jenis_prestasi"),
    prestasiBox: document.getElementById("prestasiBox"),
    nama: document.getElementById("nama"),
    jk: document.getElementById("jk"),
    asal_sekolah: document.getElementById("asal_sekolah"),
    agama: document.getElementById("agama"),
	no_wa: document.getElementById("no_wa"),
    no_kk: document.getElementById("no_kk"),
    nik: document.getElementById("nik"),
    rt: document.getElementById("rt"),
    rw: document.getElementById("rw"),
    dusun: document.getElementById("dusun"),
    desa: document.getElementById("desa"),
    kecamatan: document.getElementById("kecamatan"),
    kkFile: document.getElementById("kkFile"),
    aktaFile: document.getElementById("aktaFile"),
    sklFile: document.getElementById("sklFile"),
    fotoFile: document.getElementById("fotoFile"),
    kkPreview: document.getElementById("kkPreview"),
    aktaPreview: document.getElementById("aktaPreview"),
    sklPreview: document.getElementById("sklPreview"),
    fotoPreview: document.getElementById("fotoPreview"),
    progressContainer: document.getElementById("progressContainer"),
    progressKK: document.getElementById("progressKK"),
    progressAkta: document.getElementById("progressAkta"),
    progressSKL: document.getElementById("progressSKL"),
    progressFoto: document.getElementById("progressFoto"),
	btnResetLainnya: document.getElementById("btnResetLainnya"),
    previewBukti: document.getElementById("previewBukti"),
	statusKK: document.getElementById("statusKK"),
    statusAkta: document.getElementById("statusAkta"),
    statusSKL: document.getElementById("statusSKL"),
    statusFoto: document.getElementById("statusFoto"),
};

let dataPendaftar = null;

function resetUI() {
    elements.form.reset();
    elements.formCard.classList.add("hidden");
    elements.prestasiBox.classList.add("hidden");
    elements.btnUpdate.classList.add("hidden");
    elements.btnCetakBukti.classList.add("hidden");
    elements.btnSubmit.classList.remove("hidden");
    elements.btnSubmit.disabled = false;
    elements.btnUpdate.disabled = false;
    elements.progressContainer.classList.add("hidden");
    [elements.progressKK, elements.progressAkta, elements.progressSKL, elements.progressFoto].forEach(bar => bar.style.width = "0%");
    [elements.kkPreview, elements.aktaPreview, elements.sklPreview, elements.fotoPreview].forEach(img => {
        img.src = "";
        img.classList.add("hidden");
    });
}

function preview(input, img) {
    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        img.src = URL.createObjectURL(file);
        img.classList.remove("hidden");
    };
}
[preview(elements.kkFile, elements.kkPreview), preview(elements.aktaFile, elements.aktaPreview), 
 preview(elements.sklFile, elements.sklPreview), preview(elements.fotoFile, elements.fotoPreview)];

elements.jalur.onchange = () => elements.prestasiBox.classList.toggle("hidden", elements.jalur.value !== "Prestasi");

elements.btnCekNISN.onclick = async () => {
    const nisn = elements.inputNISN.value.trim();
    if (!/^[0-9]{10}$/.test(nisn)) return alert("NISN harus 10 digit angka");
    resetUI();
	elements.inputNISN.readOnly = true; // Kunci input NISN setelah dicek
    elements.status.innerText = "Memeriksa...";
    elements.btnCekNISN.disabled = true;
    try {
        const snap = await getDoc(doc(db, "pendaftar_2026", nisn));
        elements.formCard.classList.remove("hidden");
        elements.nisnForm.value = nisn;
        if (snap.exists()) {
            dataPendaftar = snap.data();
            isiForm(dataPendaftar);
            elements.btnSubmit.classList.add("hidden");
            elements.btnUpdate.classList.remove("hidden");
            elements.btnCetakBukti.classList.remove("hidden");
        } else {
            dataPendaftar = null;
        }
    } catch (e) { alert("Error: " + e.message); }
    elements.status.innerText = "";
    elements.btnCekNISN.disabled = false;
};


function isiForm(d) {
    elements.nama.value = d.nama || "";
    elements.jk.value = d.jk || "";
    elements.asal_sekolah.value = d.asal_sekolah || "";
    elements.agama.value = d.agama || "";
    elements.no_kk.value = d.no_kk || "";
	elements.no_wa.value = d.no_wa || "";
    elements.nik.value = d.nik || "";
    elements.rt.value = d.alamat?.rt || "";
    elements.rw.value = d.alamat?.rw || "";
    elements.dusun.value = d.alamat?.dusun || "";
    elements.desa.value = d.alamat?.desa || "";
    elements.kecamatan.value = d.alamat?.kecamatan || "";
    elements.jalur.value = d.jalur || "";
    if (d.jalur === "Prestasi") {
        elements.prestasiBox.classList.remove("hidden");
        elements.jenis_prestasi.value = d.jenis_prestasi || "";
    }
	// Update status dokumen berdasarkan data di database
    updateStatusDokumen(elements.statusKK, !!d.dokumen?.kk);
    updateStatusDokumen(elements.statusAkta, !!d.dokumen?.akta);
    updateStatusDokumen(elements.statusSKL, !!d.dokumen?.skl);
    updateStatusDokumen(elements.statusFoto, !!d.dokumen?.foto);
	// Tampilkan preview jika ada
    if (d.dokumen?.kk) {
        elements.kkPreview.src = d.dokumen.kk;
        elements.kkPreview.classList.remove("hidden");
    }
	// Tampilkan preview jika ada
    if (d.dokumen?.akta) {
        elements.aktaPreview.src = d.dokumen.akta;
        elements.aktaPreview.classList.remove("hidden");
    }
	// Tampilkan preview jika ada
    if (d.dokumen?.skl) {
        elements.sklPreview.src = d.dokumen.skl;
        elements.sklPreview.classList.remove("hidden");
    }
	// Tampilkan preview jika ada
    if (d.dokumen?.foto) {
        elements.fotoPreview.src = d.dokumen.foto;
        elements.fotoPreview.classList.remove("hidden");
    }
}

//format Wasapp
function formatWhatsApp(phone) {
    let cleaned = phone.replace(/\D/g, ''); // Hapus semua karakter non-angka
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('8')) {
        cleaned = '62' + cleaned;
    }
    return cleaned;
}

// fungsi upload
async function uploadFile(file, path, progressElement, existingURL) {
    if (!file) return existingURL || ""; 

    // VALIDASI UKURAN FILE (Maksimal 500KB)
    const maxSize = 500 * 1024; // 500 KB dalam bytes
    if (file.size > maxSize) {
        alert(`File "${file.name}" terlalu besar! Maksimal ukuran adalah 500KB. Silakan kompres foto Anda terlebih dahulu.`);
        progressElement.style.width = "0%";
        throw new Error("File terlalu besar"); // Menghentikan proses upload
    }
    
    const extension = file.type === "application/pdf" ? "pdf" : "jpg";
    const fileName = `${path}.${extension}`; 

    const { data, error } = await supabase.storage
        .from('dokumen')
        .upload(fileName, file, { upsert: true });

    if (error) throw error;
    
    progressElement.style.width = "100%";
    const { data: link } = supabase.storage.from('dokumen').getPublicUrl(fileName);
    
    return `${link.publicUrl}?t=${new Date().getTime()}`;
}

function validasiForm() {
    const fields = [
        { el: elements.jalur, name: "Jalur Pendaftaran" },
        { el: elements.nama, name: "Nama Lengkap" },
        { el: elements.jk, name: "Jenis Kelamin" },
        { el: elements.asal_sekolah, name: "Asal Sekolah" },
		{ el: elements.no_wa, name: "Nomor WhatsApp" },
        { el: elements.no_kk, name: "Nomor KK" },
        { el: elements.nik, name: "NIK" },
        { el: elements.desa, name: "Desa" },
        { el: elements.kecamatan, name: "Kecamatan" }
    ];

    for (let field of fields) {
        if (!field.el.value || field.el.value.trim() === "") {
            alert(`${field.name} tidak boleh kosong!`);
            field.el.focus();
            return false;
        }
    }

    // Validasi tambahan untuk Nomor KK dan NIK (harus 16 digit)
    if (elements.no_kk.value.length !== 16 || elements.nik.value.length !== 16) {
        alert("Nomor KK dan NIK harus 16 digit angka!");
        return false;
    }

    return true;
}


elements.form.onsubmit = async (e) => {
    e.preventDefault();
    if (!validasiForm()) return;

    // --- FITUR KONFIRMASI (Point 1) ---
    const konfirmasi = await Swal.fire({
        title: 'Cek Kembali Data Anda',
        text: "Pastikan semua data dan dokumen yang diunggah sudah benar.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Kirim Sekarang!',
        cancelButtonText: 'Periksa Lagi'
    });

    if (!konfirmasi.isConfirmed) return;

    // Menampilkan loading state
    Swal.fire({
        title: 'Sedang Memproses...',
        text: 'Mohon tunggu, jangan tutup halaman ini.',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    const nisn = elements.nisnForm.value;
    elements.progressContainer.classList.remove("hidden");
    elements.btnSubmit.disabled = true;
    elements.btnUpdate.disabled = true;

    try {
        const [kkURL, aktaURL, sklURL, fotoURL] = await Promise.all([
            uploadFile(elements.kkFile.files[0], `${nisn}/kk`, elements.progressKK, dataPendaftar?.dokumen?.kk),
            uploadFile(elements.aktaFile.files[0], `${nisn}/akta`, elements.progressAkta, dataPendaftar?.dokumen?.akta),
            uploadFile(elements.sklFile.files[0], `${nisn}/skl`, elements.progressSKL, dataPendaftar?.dokumen?.skl),
            uploadFile(elements.fotoFile.files[0], `${nisn}/foto`, elements.progressFoto, dataPendaftar?.dokumen?.foto)
        ]);

        await setDoc(doc(db, "pendaftar_2026", nisn), {
            jalur: elements.jalur.value,
            jenis_prestasi: elements.jenis_prestasi.value,
            nama: elements.nama.value,
            no_wa: formatWhatsApp(elements.no_wa.value), // Gunakan fungsi format di sini
            jk: elements.jk.value,
            asal_sekolah: elements.asal_sekolah.value,
            agama: elements.agama.value,
            no_kk: elements.no_kk.value,
            nik: elements.nik.value,
            alamat: { 
                rt: elements.rt.value, 
                rw: elements.rw.value, 
                dusun: elements.dusun.value, 
                desa: elements.desa.value, 
                kecamatan: elements.kecamatan.value 
            },
            dokumen: { kk: kkURL, akta: aktaURL, skl: sklURL, foto: fotoURL },
            waktuDaftar: serverTimestamp()
        });

        await Swal.fire({
            title: 'Berhasil!',
            text: 'Data pendaftaran Anda telah tersimpan.',
            icon: 'success'
        });

        location.reload();
    } catch (err) { 
        Swal.fire('Gagal!', err.message, 'error');
        elements.btnSubmit.disabled = false;
        elements.btnUpdate.disabled = false;
    }
};

elements.btnUpdate.onclick = () => elements.form.requestSubmit();

elements.btnCetakBukti.onclick = () => {
    const d = dataPendaftar;
	// Fungsi pembantu untuk membuat baris ceklis
    const rowCheck = (label, isExist) => `
        <div class="check-item">
            <div class="box-check">${isExist ? '✓' : ''}</div>
            <span>${label}</span>
        </div>`;
    const huruf = d.jalur ? d.jalur.charAt(0).toUpperCase() : "-";
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
	const fotoTampil = d.dokumen?.foto.includes('?t=') 
        ? d.dokumen.foto 
        : `${d.dokumen.foto}?t=${new Date().getTime()}`;
    document.getElementById("formCard").classList.add("hidden");
    document.getElementById("previewBukti").classList.remove("hidden");
    document.getElementById("formulirCetak").innerHTML = `
        <div class="formulir">
            <div class="kop">
                <img src="img/logo_pemda.png" class="logo kiri">
                <div class="judul">
                    <h2>SPMB SMP NEGERI 1 UMBULSARI</h2>
                    <h3>BUKTI PENDAFTARAN</h3>
                </div>
                <img src="img/logo_sekolah.png" class="logo kanan">
            </div>

            <div class="jalur-box">
                <div class="box">${huruf}</div>
                <div class="box"></div>
                <div class="box"></div>
                <div class="box"></div>
            </div>

            <img src="${fotoTampil}" class="foto-siswa">

            <div class="line"></div>

            <b>DATA SISWA</b>
            <table class="tabel">
                <tr><td width="200">NISN</td><td>: ${elements.nisnForm.value}</td></tr>
                <tr><td>Nama</td><td>: ${d.nama}</td></tr>
                <tr><td>Jenis Kelamin</td><td>: ${d.jk}</td></tr>
                <tr><td>Asal Sekolah</td><td>: ${d.asal_sekolah}</td></tr>
                <tr><td>Agama</td><td>: ${d.agama}</td></tr>
				<tr><td>WhatsApp</td><td>: ${d.no_wa || '-'}</td></tr>
            </table>

            <div class="line"></div>

            <b>DATA KEPENDUDUKAN</b>
            <table class="tabel">
                <tr><td width="200">No KK</td><td>: ${d.no_kk}</td></tr>
                <tr><td>NIK</td><td>: ${d.nik}</td></tr>
                <tr>
                    <td>Alamat</td>
                    <td>
                        RT ${d.alamat?.rt || '0'} / RW ${d.alamat?.rw || '0'}, dusun ${d.alamat?.dusun || '-'}, desa ${d.alamat?.desa || '-'},<br>
                        Kec. ${d.alamat?.kecamatan || '-'}
                    </td>
                </tr>
            </table>

            <div class="line"></div>

            <b>JALUR PENDAFTARAN</b>
            <table class="tabel">
                <tr><td width="200">Jalur</td><td>: ${d.jalur}</td></tr>
                <tr><td>Jenis Prestasi</td><td>: ${d.jenis_prestasi || "-"}</td></tr>
            </table>

            <div class="line"></div>
			
            <b>KELENGKAPAN BERKAS (VERIFIKASI SISTEM)</b>
            <div class="checklist-section">
                ${rowCheck('Fotokopi Kartu Keluarga', !!d.dokumen?.kk)}
                ${rowCheck('Fotokopi Akta Kelahiran', !!d.dokumen?.akta)}
                ${rowCheck('Fotokopi SKL / Ijazah', !!d.dokumen?.skl)}
                ${rowCheck('Pas Foto 3x4', !!d.dokumen?.foto)}
            </div>
            <div class="ttd">
                Dicetak pada : ${today}
                <br><br><br><br>
                ( __________________ )
                <br>
                Tanda Tangan Siswa
            </div>
        </div>`;
};

document.getElementById("btnPrint").onclick = () => window.print();
document.getElementById("btnBack").onclick = () => {
    document.getElementById("previewBukti").classList.add("hidden");
    document.getElementById("formCard").classList.remove("hidden");
};


// app.js (Letakkan paling bawah)
document.addEventListener("DOMContentLoaded", () => {
    const editNisn = sessionStorage.getItem("edit_nisn");
    
    // Pastikan elemen inputNISN ada sebelum diisi
    if (editNisn && elements.inputNISN) {
        elements.inputNISN.value = editNisn;
        
        // Beri jeda sangat singkat (100ms) agar Firebase siap
        setTimeout(() => {
            elements.btnCekNISN.click();
            // Hapus storage agar tidak terus menerus "Cek NISN" saat refresh
            sessionStorage.removeItem("edit_nisn");
        }, 100);
    }
});

// 2. event listener untuk tombol tersebut (bisa di bagian bawah app.js)
elements.btnResetLainnya.onclick = () => {
    // Konfirmasi singkat agar tidak sengaja terklik
    if (!confirm("Apakah Anda ingin mendaftarkan siswa lainnya? Data yang belum tersimpan akan hilang.")) return;
	dataPendaftar = null;
    // Reset Input NISN awal
    elements.inputNISN.value = "";
    elements.inputNISN.readOnly = false;
    
    // Jalankan fungsi resetUI yang sudah ada
    resetUI(); 

    // Sembunyikan layar preview bukti dan tampilkan kembali area pencarian
    elements.previewBukti.classList.add("hidden");
    elements.status.innerText = "";
    
    // Scroll ke atas otomatis
    window.scrollTo(0, 0);
};

function updateStatusDokumen(idElement, isAvailable) {
    if (isAvailable) {
        idElement.innerText = "✓ Sudah tersedia";
        idElement.classList.replace("status-missing", "status-uploaded");
    } else {
        idElement.innerText = "✗ Belum diunggah";
        idElement.classList.replace("status-uploaded", "status-missing");
    }
	
}// Tambahkan listener pada input file agar status berubah saat file dipilih
elements.kkFile.onchange = () => {
    if(elements.kkFile.files[0]) updateStatusDokumen(elements.statusKK, true);
};
elements.aktaFile.onchange = () => {
    if(elements.aktaFile.files[0]) updateStatusDokumen(elements.statusAkta, true); // Benar: statusAkta
};
elements.sklFile.onchange = () => {
    if(elements.sklFile.files[0]) updateStatusDokumen(elements.statusSKL, true); // Benar: statusSKL
};
// Tambahkan juga untuk Foto:
elements.fotoFile.onchange = () => {
    if(elements.fotoFile.files[0]) updateStatusDokumen(elements.statusFoto, true);
};
