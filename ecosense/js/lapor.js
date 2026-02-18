document.addEventListener('DOMContentLoaded', () => {

    // --- Data Management ---
    const STORAGE_KEY = 'ecosense_reports';

    // Initial Seed Data (if empty)
    const seedReports = [
        { ref: "ECO-2026-1001", type: "Tumpukan Sampah Liar", location: "Bekasi Utara", time: "2 jam lalu", status: "Dalam Proses", statusClass: "status-proses" },
        { ref: "ECO-2026-1002", type: "Pencemaran Sungai", location: "Bandung Wetan", time: "5 jam lalu", status: "Diterima", statusClass: "status-diterima" },
        { ref: "ECO-2026-1003", type: "Polusi Udara (Pembakaran)", location: "Tangerang Selatan", time: "1 hari lalu", status: "Selesai", statusClass: "status-selesai" },
        { ref: "ECO-2026-1004", type: "Penebangan Pohon Ilegal", location: "Bogor", time: "1 hari lalu", status: "Diterima", statusClass: "status-diterima" },
        { ref: "ECO-2026-1005", type: "Bau Limbah Pabrik", location: "Surabaya", time: "2 hari lalu", status: "Dalam Proses", statusClass: "status-proses" }
    ];

    function getReports() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seedReports));
            return seedReports;
        }
        return JSON.parse(stored);
    }

    function addReport(report) {
        const reports = getReports();
        reports.unshift(report); // Add to top
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
        renderFeed(); // Refresh feed
    }

    // --- Feed Logic ---
    const feedList = document.getElementById('feed-list');

    function renderFeed() {
        if (!feedList) return;
        const reports = getReports();
        // Show only top 5 recent
        const recent = reports.slice(0, 5);

        feedList.innerHTML = recent.map(rep => `
            <div class="feed-card ${rep.statusClass || getStatusClass(rep.status)} fade-up">
                <div class="feed-header">
                    <span class="feed-type">${rep.type}</span>
                    <span class="feed-time">${rep.time || 'Baru saja'}</span>
                </div>
                <div class="feed-loc">
                    <i data-lucide="map-pin" size="14"></i> ${rep.location}
                </div>
                <div class="feed-status">
                    <span class="status-pill">${rep.status}</span>
                </div>
            </div>
        `).join('');

        if (window.lucide) lucide.createIcons();
    }

    function getStatusClass(status) {
        if (status === 'Selesai') return 'status-selesai';
        if (status === 'Dalam Proses') return 'status-proses';
        return 'status-diterima';
    }

    // Initial Render
    renderFeed();

    // --- Search / Check Status Logic ---
    const checkBtn = document.getElementById('check-status-btn');
    const checkInput = document.getElementById('check-ref-input');
    const checkResult = document.getElementById('check-result');

    if (checkBtn && checkInput && checkResult) {
        checkBtn.addEventListener('click', () => {
            const query = checkInput.value.trim().toUpperCase();
            if (!query) return;

            checkResult.classList.remove('hidden');
            const reports = getReports();
            const found = reports.find(r => r.ref === query);

            if (found) {
                checkResult.innerHTML = `
                    <span class="result-header">Laporan Ditemukan!</span>
                    <div style="margin-top:4px; font-weight:600;">${found.type}</div>
                    <div class="text-muted" style="font-size:12px;">${found.location}</div>
                    <span class="result-status">${found.status}</span>
                `;
                checkResult.className = 'check-result found';
            } else {
                checkResult.innerHTML = `
                    <span class="result-header">Laporan Tidak Ditemukan</span>
                    <p>Mohon periksa kembali nomor referensi Anda.</p>
                `;
                checkResult.className = 'check-result not-found';
            }
        });
    }

    // --- Form Validation & Submission ---
    const form = document.getElementById('lapor-form');
    const descArea = document.getElementById('deskripsi');
    const charVal = document.getElementById('char-val');
    const successState = document.getElementById('success-state');
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = document.querySelector('.btn-text');
    const spinner = document.querySelector('.spinner');

    // Char count
    if (descArea) {
        descArea.addEventListener('input', (e) => {
            charVal.innerText = e.target.value.length;
        });
    }

    // Form logic
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validasi tambahan untuk radio button
            const severity = document.querySelector('input[name="severity"]:checked');
            if (!severity) {
                alert("Mohon pilih tingkat keparahan.");
                return;
            }

            // 1. MASUK KE STATE LOADING
            submitBtn.disabled = true;
            btnText.classList.add('hidden'); // Use hidden class instead of opacity style
            spinner.classList.remove('hidden');

            // Simulasi pengiriman data
            setTimeout(() => {
                // 2. AMBIL DATA FORM
                const namaUser = document.getElementById('nama').value;
                const jenis = document.getElementById('jenis').value;
                const lokasi = document.getElementById('lokasi').value;
                const ref = "ECO-2026-" + Math.floor(1000 + Math.random() * 9000);

                // SIMPAN KE STORAGE
                const newReport = {
                    ref: ref,
                    type: jenis,
                    location: lokasi,
                    time: "Baru saja",
                    status: "Diterima",
                    statusClass: "status-diterima",
                    date: new Date().toISOString()
                };
                addReport(newReport);

                // 3. UPDATE UI SUKSES
                document.getElementById('ref-num').innerText = ref;
                document.getElementById('success-name').innerText = namaUser;

                // 4. TRANSISI FORM KE SUCCESS STATE
                form.classList.add('hidden');
                successState.classList.remove('hidden');

                if (window.lucide) lucide.createIcons();

                // 5. SCROLL KE ATAS
                const card = document.getElementById('report-form-card');
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Clear form just in case (though hidden)
                form.reset();
                submitBtn.disabled = false;
                btnText.classList.remove('hidden');
                spinner.classList.add('hidden');

            }, 1500);
        });
    }

    // File Upload Preview (Simple)
    const fileInput = document.getElementById('file-upload');
    const filePreview = document.getElementById('file-preview');
    const fileNameSpan = document.getElementById('filename');

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                filePreview.classList.remove('hidden');
                fileNameSpan.innerText = e.target.files[0].name;
            }
        });
    }
});
