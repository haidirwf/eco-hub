document.addEventListener("DOMContentLoaded", () => {
  // --- Data Management ---
  const STORAGE_KEY = "ecosense_reports";

  // 1. Improved Dummy Data
  const seedReports = [
    {
      ref: "ECO-2026-1001",
      type: "Tumpukan Sampah Liar",
      location: "Pinggir Kali Bekasi, Bekasi Utara",
      desc: "Tumpukan sampah plastik dan limbah rumah tangga yang menumpuk di pinggir kali, menimbulkan bau menyengat.",
      time: "2 jam lalu",
      status: "Dalam Proses",
      statusClass: "status-proses",
      date: "2026-02-18",
    },
    {
      ref: "ECO-2026-1002",
      type: "Pencemaran Sungai",
      location: "Jalan Riau, Bandung Wetan",
      desc: "Air sungai berubah warna menjadi hitam pekat dan berbusa, diduga akibat limbah tekstil.",
      time: "5 jam lalu",
      status: "Diterima",
      statusClass: "status-diterima",
      date: "2026-02-18",
    },
    {
      ref: "ECO-2026-1003",
      type: "Polusi Udara (Pembakaran)",
      location: "Pamulang, Tangerang Selatan",
      desc: "Pembakaran sampah kabel ilegal yang menghasilkan asap hitam tebal setiap sore hari.",
      time: "1 hari lalu",
      status: "Selesai",
      statusClass: "status-selesai",
      date: "2026-02-17",
    },
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
    renderFeed();
  }

  // --- Feed Logic & Modal ---
  const feedList = document.getElementById("feed-list");

  // Modal Elements
  const modal = document.getElementById("report-modal");
  window.closeModal = () => {
    if (modal) modal.classList.remove("open");
  };

  // Close on overlay click
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Function to open detail
  window.showReportDetail = (ref) => {
    const reports = getReports();
    const rep = reports.find((r) => r.ref === ref);
    if (!rep || !modal) return;

    // Populate Modal
    document.getElementById("modal-type").innerText = rep.type;
    document.getElementById("modal-ref").innerText = rep.ref;
    document.getElementById("modal-date").innerText = rep.date || rep.time;
    document.getElementById("modal-loc").innerText = rep.location;
    document.getElementById("modal-desc").innerText =
      rep.desc || "Tidak ada deskripsi detail.";

    const pill = document.getElementById("modal-status-pill");
    pill.innerText = rep.status;
    pill.className = `status-pill ${rep.statusClass || getStatusClass(rep.status)}`;

    // Open
    modal.classList.add("open");
  };

  function renderFeed() {
    if (!feedList) return;
    const reports = getReports();
    const recent = reports.slice(0, 5); // display top 5

    feedList.innerHTML = recent
      .map(
        (rep) => `
            <div class="feed-card ${rep.statusClass || getStatusClass(rep.status)} fade-up"
                 style="cursor: pointer;"
                 onclick="showReportDetail('${rep.ref}')">
                <div class="feed-header">
                    <span class="feed-type">${rep.type}</span>
                    <span class="feed-time">${rep.time || "Baru saja"}</span>
                </div>
                <div class="feed-loc">
                    <i data-lucide="map-pin" size="14"></i> ${rep.location.split(",")[0]}...
                </div>
                <div class="feed-status">
                    <span class="status-pill">${rep.status}</span>
                </div>
            </div>
        `,
      )
      .join("");

    if (window.lucide) lucide.createIcons();

    // Trigger animations
    setTimeout(() => {
      const cards = feedList.querySelectorAll(".feed-card");
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add("visible");
        }, index * 100);
      });
    }, 50);
  }

  function getStatusClass(status) {
    if (status === "Selesai") return "status-selesai";
    if (status === "Dalam Proses") return "status-proses";
    return "status-diterima";
  }

  renderFeed(); // Init

  // --- Check Status Logic ---
  const checkBtn = document.getElementById("check-status-btn");
  const checkInput = document.getElementById("check-ref-input");
  const checkResult = document.getElementById("check-result");

  if (checkBtn && checkInput && checkResult) {
    checkBtn.addEventListener("click", () => {
      const query = checkInput.value.trim().toUpperCase();
      if (!query) return;

      checkResult.classList.remove("hidden");
      const reports = getReports();
      const found = reports.find((r) => r.ref === query);

      // Same UI Style logic as requested
      if (found) {
        checkResult.innerHTML = `
                    <div class="result-found-card">
                        <div class="result-icon-box success">
                            <i data-lucide="check-circle" class="icon-success"></i>
                        </div>
                        <div class="result-content">
                            <h4>Laporan Ditemukan</h4>
                            <div class="result-detail-item"><strong>Jenis:</strong> ${found.type}</div>
                            <div class="result-detail-item"><strong>Lokasi:</strong> ${found.location}</div>
                            <span class="status-badge ${found.statusClass || getStatusClass(found.status)}">${found.status}</span>
                        </div>
                    </div>
                `;
        checkResult.className = "check-result-container fade-up visible";
      } else {
        checkResult.innerHTML = `
                    <div class="result-not-found-card">
                        <div class="result-icon-box error">
                            <i data-lucide="alert-circle" class="icon-error"></i>
                        </div>
                        <div class="result-content">
                            <h4>Tidak Ditemukan</h4>
                            <p>Nomor referensi <strong>${query}</strong> tidak terdaftar dlm sistem kami.</p>
                        </div>
                    </div>
                `;
        checkResult.className = "check-result-container fade-up visible";
      }
      if (window.lucide) lucide.createIcons();
    });
  }

  // --- Form Submit Animation Fix ---
  const form = document.getElementById("lapor-form");
  const submitBtn = document.querySelector(".submit-btn");
  const successState = document.getElementById("success-state");

  // Char count
  const desc = document.getElementById("deskripsi");
  if (desc) {
    desc.addEventListener(
      "input",
      (e) =>
        (document.getElementById("char-val").innerText = e.target.value.length),
    );
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const severity = document.querySelector('input[name="severity"]:checked');
      if (!severity) {
        alert("Mohon pilih tingkat keparahan.");
        return;
      }

      // 2. Fix Animation: Use Class Toggling
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;

      setTimeout(() => {
        const nama = document.getElementById("nama").value;
        const jenis = document.getElementById("jenis").value;
        const lokasi = document.getElementById("lokasi").value;
        const deskripsi = document.getElementById("deskripsi").value;
        const ref = "ECO-2026-" + Math.floor(1000 + Math.random() * 9000);

        const newReport = {
          ref: ref,
          type: jenis,
          location: lokasi,
          desc: deskripsi,
          time: "Baru saja",
          status: "Diterima",
          statusClass: "status-diterima",
          date: new Date().toLocaleDateString("id-ID"),
        };

        addReport(newReport);

        document.getElementById("ref-num").innerText = ref;
        document.getElementById("success-name").innerText = nama;

        form.classList.add("hidden");
        successState.classList.remove("hidden");
        if (window.lucide) lucide.createIcons();

        document
          .getElementById("report-form-card")
          .scrollIntoView({ behavior: "smooth", block: "start" });

        // Reset
        form.reset();
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      }, 1500);
    });
  }

  // File Preview
  const fInput = document.getElementById("file-upload");
  if (fInput) {
    fInput.addEventListener("change", (e) => {
      if (e.target.files.length) {
        document.getElementById("file-preview").classList.remove("hidden");
        document.getElementById("filename").innerText = e.target.files[0].name;
      }
    });
  }
});
