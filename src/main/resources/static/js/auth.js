    // ============================
    // DARK MODE
    // ============================
    function toggleDark() {
      var isDark = document.body.classList.toggle('dark');
      var icon = isDark ? '☀️' : '🌙';
      var b1 = document.getElementById('darkToggle');
      var b2 = document.getElementById('darkToggleLogin');
      if (b1) b1.textContent = icon;
      if (b2) b2.textContent = icon;
      localStorage.setItem('ein_dark', isDark ? '1' : '0');
    }
    (function () {
      if (localStorage.getItem('ein_dark') === '1') {
        document.body.classList.add('dark');
        document.addEventListener('DOMContentLoaded', function () {
          var icon = '☀️';
          var b1 = document.getElementById('darkToggle');
          var b2 = document.getElementById('darkToggleLogin');
          if (b1) b1.textContent = icon;
          if (b2) b2.textContent = icon;
        });
      }
    })();

    // ============================
    // AUTH — sessionStorage only
    // ============================
    var currentUser = null;
    var userPoints = 2500;
    var currentProfilePicBase64 = ""; // Holds the active base64 string for saving

    function init() {
      // If user already logged in this session → skip login screen
      var saved = sessionStorage.getItem('ein_user');
      if (saved) {
        currentUser = saved;
        enterApp(currentUser, false);
      }
    }

async function enterApp(username, animate) {
  currentUser = username;
  sessionStorage.setItem('ein_user', username);

  // 1. Setup the basic UI elements (Original logic)
  var firstName = username.split(' ')[0];
  var navUserEl = document.getElementById('navUser');
  if (navUserEl) navUserEl.textContent = 'مرحباً ' + firstName;

  // 2. Control the login screen animation (Original logic)
  if (animate !== false) {
    var lo = document.getElementById('loginScreen');
    if (lo) {
      lo.classList.add('hide');
      setTimeout(function () { lo.style.display = 'none'; }, 500);
    }
  } else {
    var lo = document.getElementById('loginScreen');
    if (lo) lo.style.display = 'none';
  }

  var wrapper = document.getElementById('appWrapper');
  if (wrapper) wrapper.classList.add('show');

  // 3. Run original interface builders
    if (typeof showPage === "function") showPage('main', false);

    // Create a helper flag to check if this is a guest account
    var isGuest = (username === 'مواطن مبادر' || sessionStorage.getItem('guestName'));

    // ONLY run setupCounters if it's a real user to prevent mock numbers from loading
    if (!isGuest && typeof setupCounters === "function") {
      setupCounters();
    }
    if (typeof setupReveal === "function") setupReveal();

      // 4. THE ULTIMATE FIX: Use a tiny timeout to execute after the DOM settles down
            setTimeout(async function () {
              var navPtsEl = document.getElementById('navPts');
              var tn = document.getElementById('ach-total-num');
              var pn = document.getElementById('ach-pts-num');
              var sn = document.getElementById('ach-solved-num');
              var achList = document.getElementById('ach-list');
              var profilePtsEl = document.getElementById('profilePtsDisplay');

              // Target the profile tab in your navbar navigation menu
              var profileTab = document.querySelector('[data-page="profile"]');

              if (isGuest) {
                // Guest / Quick Login: Clean slate forces absolute 0s
                if (navPtsEl) navPtsEl.textContent = "0";
                if (tn) tn.textContent = "0";
                if (pn) pn.textContent = "0";
                if (sn) sn.textContent = "0";
                if (profilePtsEl) profilePtsEl.textContent = "0 نقطة";
                if (achList) achList.style.display = 'none';

                // HIDE THE PROFILE NAVIGATION OPTION FOR GUESTS
                if (profileTab) profileTab.style.display = 'none';

              } else {
                // Real User: Fetch live data from your Spring Boot PostgreSQL backend
                try {
                  if (achList) achList.style.display = 'block';

                  // SHOW THE PROFILE NAVIGATION OPTION FOR REAL REGISTERED ACCOUNTS
                  if (profileTab) profileTab.style.display = '';

                  const response = await fetch('http://localhost:8081/api/auth/points/' + username);
                  if (response.ok) {
                    const data = await response.json();

                    // FIX 1: Synchronize global variable tracking state for coupons/rewards
                    userPoints = data.earnedPoints;

                    // FIX 2: Dynamically swap the ID out for the real First Name in the navbar greeting
                    if (navUserEl) navUserEl.textContent = 'مرحباً ' + data.firstName;

                    // Populate live numbers across the interface
                    if (navPtsEl) navPtsEl.textContent = data.earnedPoints.toLocaleString();
                    if (tn) tn.textContent = data.totalReports;
                    if (pn) pn.textContent = data.earnedPoints.toLocaleString();
                    if (sn) sn.textContent = data.solvedReports;

                    if (profilePtsEl) profilePtsEl.textContent = data.earnedPoints.toLocaleString() + " نقطة";

                    // Sync up profile page layout labels as well
                    var nd = document.getElementById('profileNameDisplay');
                    if (nd) nd.textContent = data.fullName;
                  }
                } catch (error) {
                  console.error("Error updating live statistics:", error);

                }
              }
            }, 50); // A 50ms delay is invisible to humans, but a lifetime to the browser queue!
  }
  // --- end of enterApp method ---
// --- end of enterApp method ---
    // --- end of enterApp method ---

    function doLogout() {
      sessionStorage.removeItem('ein_user');
      sessionStorage.removeItem('guestName');
      currentUser = null;
      window.location.reload();
    }
    // --- end of doLogout method ---

    // ============================
    // LOGIN ACTIONS
    // ============================



    //testttttttttttttttttttttttttttttttt
    async function doRegister() {
      let ok = true;
      const fields = ['rn1', 'rn2', 'rnid', 'rph', 'rps'];

      fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          const val = el.value.trim();
          el.classList.toggle('err', !val);
          if (!val) ok = false;
        }
      });

      if (!ok) {
        Swal.fire({
          icon: 'warning',
          title: 'تنبيه',
          text: 'يرجى تعبئة جميع الحقول المطلوبة',
          confirmButtonColor: '#3085d6',
          customClass: { container: 'bring-to-front' }
        });
        return;
      }

      try {
        const response = await fetch('http://localhost:8081/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: document.getElementById('rn1').value.trim(),
            lastName: document.getElementById('rn2').value.trim(),
            identityNumber: document.getElementById('rnid').value.trim(),
            phoneNumber: document.getElementById('rph').value.trim(),
            password: document.getElementById('rps').value.trim()
          })
        });

        const msg = await response.text();

        if (response.ok) {
          // SUCCESS: Shows for 2 seconds then moves to login tab automatically
          Swal.fire({
            icon: 'success',
            title: 'تم بنجاح',
            text: msg,
            timer: 700,
            showConfirmButton: false,
            customClass: { container: 'bring-to-front' }
          }).then(() => {
            switchLoginTab2('login');
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'عذراً',
            text: msg,
            confirmButtonColor: '#d33',
            customClass: { container: 'bring-to-front' }
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'لا يمكن الاتصال بالخادم.',
          customClass: { container: 'bring-to-front' }
        });
      }
    }
    // --- end of doRegister method ---
    async function doLogin() {
      const id = document.getElementById('lid').value.trim();
      const ps = document.getElementById('lps').value.trim();

      // 1. Check for empty fields and SHOW THE ALERT
      if (!id || !ps) {
        document.getElementById('lid').classList.toggle('err', !id);
        document.getElementById('lps').classList.toggle('err', !ps);

        Swal.fire({
          icon: 'warning',
          title: 'تنبيه',
          text: 'يرجى إدخال رقم الهوية وكلمة المرور',
          confirmButtonColor: '#3085d6',
          customClass: { container: 'bring-to-front' }
        });
        return;
      }

      try {
        const response = await fetch('http://localhost:8081/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: id, password: ps })
        });

        const msg = await response.text();

        if (response.ok) {
          // SUCCESS: Shows for 1.5 seconds then logs in automatically
          Swal.fire({
            icon: 'success',
            title: 'أهلاً بك',
            text: msg,
            timer: 550, // Closes after 0.5 seconds
            showConfirmButton: false, // No "OK" button needed
            customClass: { container: 'bring-to-front' }
          }).then(() => {
            enterApp(id);
          });
        } else {
          // ERROR: Still needs "OK" so the user can read what went wrong
          Swal.fire({
            icon: 'error',
            title: 'خطأ في الدخول',
            text: msg,
            confirmButtonColor: '#d33',
            customClass: { container: 'bring-to-front' }
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ في الاتصال بالخادم.',
          customClass: { container: 'bring-to-front' }
        });
      }
    }
    // --- end of doLogin method ---
    function doGuest() {
      const fieldLabels = {
        'gn1': 'الاسم الأول',
        'gn2': 'اسم الأب',
        'gn3': 'اسم الجد',
        'gn4': 'اسم العائلة'
      };

      let missingLabels = [];

      // Check each of the 4 guest name fields
      Object.keys(fieldLabels).forEach(id => {
        const input = document.getElementById(id);
        if (input) {
          const val = input.value.trim();
          if (!val) {
            input.classList.add('err');
            missingLabels.push(fieldLabels[id]);
          } else {
            input.classList.remove('err');
          }
        }
      });

      if (missingLabels.length > 0) {
        // Show specific alert for missing name parts
        Swal.fire({
          icon: 'warning',
          title: 'تنبيه',
          text: 'يرجى تعبئة: ' + missingLabels.join('، '),
          confirmButtonColor: '#3085d6',
          customClass: { container: 'bring-to-front' }
        });
        return;
      }

      const fullName = Object.keys(fieldLabels)
        .map(id => document.getElementById(id).value.trim())
        .join(' ');

      sessionStorage.setItem('guestName', fullName);
      enterApp(fullName);
    }
    // --- end of doGuest method ---
    // heres the message and i can
    function doQuickLogin(name) {
      // إظهار رسالة تنبيه مع زر موافق لضمان رؤية المستخدم للرسالة
      Swal.fire({
        icon: 'info',
        title: 'دخول سريع',
        text: 'تنبيه: يمكنك التصفح فقط بهذا الحساب، ولا يمكنك إضافة أو تحديث البلاغات.',
        showConfirmButton: true, // تفعيل زر التأكيد
        confirmButtonText: 'موافق', // نص الزر
        confirmButtonColor: '#3085d6',
        customClass: { container: 'bring-to-front' }
      }).then((result) => {
        // يتم الدخول فقط بعد أن يضغط المستخدم على الزر
        if (result.isConfirmed) {
          enterApp(name);
        }
      });
    }
    // --- end of doQuickLogin method ---
    function switchLoginTab(id, btn) {
      document.querySelectorAll('.ltab').forEach(function (t) { t.classList.remove('on'); });
      if (btn) btn.classList.add('on');
      document.querySelectorAll('.lpanel').forEach(function (p) { p.classList.remove('on'); });
      var el = document.getElementById('tab-' + id);
      if (el) el.classList.add('on');
      var ft = document.getElementById('lft');
      if (ft) {
        if (id === 'login') ft.innerHTML = 'ليس لديك حساب؟ <a onclick="switchLoginTab2(\'reg\')">سجّل الآن</a>';
        else if (id === 'reg') ft.innerHTML = 'لديك حساب؟ <a onclick="switchLoginTab2(\'login\')">سجّل دخولك</a>';
        else ft.innerHTML = 'لديك حساب؟ <a onclick="switchLoginTab2(\'login\')">سجّل دخولك</a>';
      }
    }
    function switchLoginTab2(id) {
      var tabs = document.querySelectorAll('.ltab');
      var map = { login: 0, reg: 1, guest: 2 };
      switchLoginTab(id, tabs[map[id]]);
    }
    function toggleEye(id, btn) {
      var el = document.getElementById(id);
      el.type = el.type === 'password' ? 'text' : 'password';
      btn.textContent = el.type === 'text' ? '🙈' : '👁';
    }

    // ============================
    // PAGE SWITCHING
    // ============================
    function showPage(name, scroll) {
      document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
      var pg = document.getElementById('page-' + name);
      if (pg) pg.classList.add('active');

      document.querySelectorAll('.navtab').forEach(function (t) { t.classList.remove('active'); });
      var tab = document.querySelector('[data-page="' + name + '"]');
      if (tab) tab.classList.add('active');

      if (scroll !== false) window.scrollTo({ top: 0, behavior: 'smooth' });

      if (name === 'reports') initMap();
      if (name === 'contrib') setupFadeIn();
      if (name === 'points') { setupScrollReveal(); renderAchList(); }
    }

    // ============================
    // MAP
    // ============================
    var mapInit = false;
    function initMap() {
      if (mapInit) return;
      mapInit = true;
      setTimeout(function () {
        try {
          var m = L.map('map').setView([31.88, 35.73], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(m);
        } catch (e) { }
      }, 200);
    }
    function findLocation() {
      if (!navigator.geolocation) { showToast('الموقع الجغرافي غير متاح'); return; }
      navigator.geolocation.getCurrentPosition(
        function (pos) { showToast('تم تحديد موقعك: ' + pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4)); },
        function () { showToast('تعذّر تحديد الموقع'); }
      );
    }

    // ============================
    // REPORT HISTORY (Achievements)
    // ============================
    var reportHistory = [
      { id: 'RPT-2026-0001', cat: 'حفرة في الطريق', icon: '🛣️', catKey: 'road', loc: 'شارع الجندويل، حي العيون', date: '2026-01-15', time: '09:23', pts: 500, status: 'solved', desc: 'حفرة كبيرة عمقها 30 سم تسببت في أضرار للمركبات وخطر على المشاة.' },
      { id: 'RPT-2026-0002', cat: 'عمود إنارة معطل', icon: '💡', catKey: 'light', loc: 'دوار المدينة، الشارع الرئيسي', date: '2026-01-28', time: '19:45', pts: 500, status: 'solved', desc: 'عمود إنارة لا يعمل منذ أسبوعين، يسبب خطراً في الليل على المشاة.' },
      { id: 'RPT-2026-0003', cat: 'تسرب مياه', icon: '💧', catKey: 'water', loc: 'حي الصافح، شارع الملك فيصل', date: '2026-02-10', time: '07:12', pts: 500, status: 'processing', desc: 'تسرب مياه واضح من أنبوب تحت الأرض أدى لتجمع مياه في الطريق.' },
      { id: 'RPT-2026-0004', cat: 'نفايات متراكمة', icon: '🗑️', catKey: 'waste', loc: 'مدخل حي القلعة', date: '2026-02-22', time: '11:05', pts: 500, status: 'solved', desc: 'تراكم كبير للنفايات لم يتم رفعه منذ أكثر من 10 أيام.' },
      { id: 'RPT-2026-0005', cat: 'رصيف متشقق', icon: '🏗️', catKey: 'road', loc: 'أمام مدرسة الأمل، حي السلالم', date: '2026-03-05', time: '08:30', pts: 500, status: 'open', desc: 'رصيف متشقق وغير صالح للمشاة خاصةً لذوي الاحتياجات الخاصة.' }
    ];

    var currentFilter = 'all';

    var catColors = { road: '#1a5fa8', light: '#f59e0b', water: '#06b6d4', waste: '#1aab6d' };
    var statusConfig = {
      solved: { label: '✅ تم الحل', bg: '#e6f4ee', color: '#006B3F' },
      processing: { label: '⏳ قيد التنفيذ', bg: '#fef3c7', color: '#92600a' },
      open: { label: '📋 مفتوح', bg: '#dce8f7', color: '#1A3A6B' }
    };

    function renderAchList() {
      var list = document.getElementById('ach-list');
      var empty = document.getElementById('ach-empty');
      if (!list) return;

      // 1. Check if the current logged-in user is a guest/quick login
      var isGuest = (currentUser === 'مواطن مبادر' || sessionStorage.getItem('guestName'));

      var filtered = currentFilter === 'all'
        ? reportHistory
        : reportHistory.filter(function (r) { return r.status === currentFilter; });

      // Calculate summary statistics
      var totalPts = reportHistory.reduce(function (s, r) { return s + r.pts; }, 0);
      var solvedCnt = reportHistory.filter(function (r) { return r.status === 'solved'; }).length;

      var tn = document.getElementById('ach-total-num');
      var pn = document.getElementById('ach-pts-num');
      var sn = document.getElementById('ach-solved-num');

      // 2. THE FIX: If it's a guest, force 0. Otherwise, show real data numbers.
      if (tn) tn.textContent = isGuest ? "0" : reportHistory.length;
      if (pn) pn.textContent = isGuest ? "0" : totalPts.toLocaleString();
      if (sn) sn.textContent = isGuest ? "0" : solvedCnt;

      // 3. If it's a guest, hide the card list and stop rendering the cards
      if (isGuest) {
        if (list) list.style.display = 'none';
        if (empty) empty.style.display = 'none';
        return; // Stop execution here for guests
      } else {
        if (list) list.style.display = 'block';
      }

      if (!filtered.length) {
        if (empty) empty.style.display = 'block';
        var cards = list.querySelectorAll('.ach-card');
        cards.forEach(function (c) { c.remove(); });
        return;
      }
      if (empty) empty.style.display = 'none';

      // Remove old cards
      var old = list.querySelectorAll('.ach-card');
      old.forEach(function (c) { c.remove(); });

      filtered.forEach(function (r) {
        var sc = statusConfig[r.status] || statusConfig.open;
        var cc = catColors[r.catKey] || '#1A3A6B';
        var card = document.createElement('div');
        card.className = 'ach-card';
        card.setAttribute('data-status', r.status);
        card.style.cssText = 'background:var(--bw);border:1.5px solid var(--bl);border-radius:16px;padding:18px 20px;cursor:pointer;transition:all .25s;display:flex;gap:16px;align-items:flex-start;box-shadow:var(--s1)';
        card.onmouseover = function () { this.style.borderColor = 'var(--pl)'; this.style.transform = 'translateY(-2px)'; this.style.boxShadow = 'var(--s2)'; };
        card.onmouseout = function () { this.style.borderColor = 'var(--bl)'; this.style.transform = 'none'; this.style.boxShadow = 'var(--s1)'; };
        card.onclick = function () { openAchDrawer(r); };
        card.innerHTML =
          '<div style="width:52px;height:52px;border-radius:14px;background:' + cc + '18;display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0;border:1.5px solid ' + cc + '30">' + r.icon + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px">' +
          '<h4 style="font-size:.97rem;font-weight:800;color:var(--t);margin:0">' + r.cat + '</h4>' +
          '<span style="font-size:.73rem;font-weight:700;padding:3px 12px;border-radius:20px;background:' + sc.bg + ';color:' + sc.color + ';white-space:nowrap">' + sc.label + '</span>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;font-size:.78rem;color:var(--tl);margin-bottom:8px">' +
          '<i class="fas fa-map-marker-alt" style="color:' + cc + '"></i>' +
          '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + r.loc + '</span>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">' +
          '<div style="display:flex;align-items:center;gap:4px;font-size:.75rem;color:var(--tx)">' +
          '<i class="fas fa-calendar-alt"></i> ' + r.date + ' &nbsp;•&nbsp; ' + r.time +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:5px;background:var(--gl);color:#92600a;padding:3px 11px;border-radius:20px;font-size:.77rem;font-weight:800">' +
          '<i class="fas fa-coins" style="color:var(--g)"></i> +' + r.pts.toLocaleString() + ' نقطة' +
          '</div>' +
          '</div>' +
          '</div>' +
          '<div style="color:var(--tx);font-size:.85rem;align-self:center;flex-shrink:0"><i class="fas fa-chevron-left"></i></div>';
        list.appendChild(card);
      });
    }
    // --- end of renderAchList method ---

    function openAchDrawer(r) {
      var sc = statusConfig[r.status] || statusConfig.open;
      var cc = catColors[r.catKey] || '#1A3A6B';

      // Timeline steps based on status
      var steps = [
        { icon: '📤', label: 'تم إرسال البلاغ', date: r.date, time: r.time, done: true },
        { icon: '🔍', label: 'قيد المراجعة', date: r.date, time: 'بعد 2 ساعة', done: r.status !== 'open' },
        { icon: '🔧', label: 'قيد التنفيذ', date: '', time: '', done: r.status === 'solved' || r.status === 'processing' },
        { icon: '✅', label: 'تم الحل', date: '', time: '', done: r.status === 'solved' }
      ];

      var timelineHtml = steps.map(function (s, i) {
        var isLast = i === steps.length - 1;
        return '<div style="display:flex;gap:14px;position:relative">'
          + (!isLast ? '<div style="position:absolute;right:19px;top:38px;bottom:0;width:2px;background:' + (s.done ? 'var(--p)' : 'var(--bd)') + ';z-index:0"></div>' : '')
          + '<div style="width:38px;height:38px;border-radius:50%;' + (s.done ? 'background:var(--p);' : 'background:var(--bl);border:2px solid var(--bd);') + ';display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;position:relative;z-index:1">'
          + '<span style="' + (s.done ? 'filter:brightness(10)' : '') + '">' + s.icon + '</span>'
          + '</div>'
          + '<div style="padding-bottom:' + (isLast ? '0' : '20px') + '">'
          + '<div style="font-size:.87rem;font-weight:700;color:' + (s.done ? 'var(--t)' : 'var(--tx)') + '">' + s.label + '</div>'
          + (s.date ? '<div style="font-size:.75rem;color:var(--tl);margin-top:2px">' + s.date + (s.time ? ' — ' + s.time : '') + '</div>' : '')
          + (!s.done && !s.date ? '<div style="font-size:.75rem;color:var(--tx);margin-top:2px">في الانتظار...</div>' : '')
          + '</div>'
          + '</div>';
      }).join('');

      var html =
        '<div style="background:linear-gradient(135deg,' + cc + ',' + cc + 'cc);padding:22px 24px;border-radius:18px;color:#fff;margin-bottom:22px">'
        + '<div style="display:flex;align-items:center;gap:12px">'
        + '<span style="font-size:2.2rem">' + r.icon + '</span>'
        + '<div>'
        + '<h3 style="font-size:1.1rem;font-weight:900;margin-bottom:3px">' + r.cat + '</h3>'
        + '<span style="font-size:.7rem;opacity:.8;background:rgba(255,255,255,.18);padding:2px 10px;border-radius:20px">' + r.id + '</span>'
        + '</div>'
        + '<span style="margin-right:auto;background:' + sc.bg + ';color:' + sc.color + ';font-size:.73rem;font-weight:700;padding:4px 13px;border-radius:20px">' + sc.label + '</span>'
        + '</div>'
        + '</div>'

        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:22px">'
        + '<div style="background:var(--bs);border-radius:12px;padding:14px">'
        + '<div style="font-size:.7rem;color:var(--tl);font-weight:700;margin-bottom:4px"><i class="fas fa-map-marker-alt"></i> الموقع</div>'
        + '<div style="font-size:.85rem;font-weight:700;color:var(--t)">' + r.loc + '</div>'
        + '</div>'
        + '<div style="background:var(--bs);border-radius:12px;padding:14px">'
        + '<div style="font-size:.7rem;color:var(--tl);font-weight:700;margin-bottom:4px"><i class="fas fa-calendar"></i> التاريخ والوقت</div>'
        + '<div style="font-size:.85rem;font-weight:700;color:var(--t)">' + r.date + ' — ' + r.time + '</div>'
        + '</div>'
        + '<div style="background:var(--gl);border-radius:12px;padding:14px">'
        + '<div style="font-size:.7rem;color:#92600a;font-weight:700;margin-bottom:4px"><i class="fas fa-coins"></i> النقاط المكتسبة</div>'
        + '<div style="font-size:1.3rem;font-weight:900;color:#92600a">+' + r.pts.toLocaleString() + '</div>'
        + '</div>'
        + '<div style="background:var(--bs);border-radius:12px;padding:14px">'
        + '<div style="font-size:.7rem;color:var(--tl);font-weight:700;margin-bottom:4px"><i class="fas fa-tag"></i> التصنيف</div>'
        + '<div style="font-size:.85rem;font-weight:700;color:var(--t)">' + r.cat + '</div>'
        + '</div>'
        + '</div>'

        + '<div style="margin-bottom:22px">'
        + '<div style="font-size:.82rem;font-weight:800;color:var(--t);margin-bottom:8px"><i class="fas fa-align-right"></i> وصف المشكلة</div>'
        + '<div style="background:var(--bs);border-radius:12px;padding:14px;font-size:.85rem;color:var(--tm);line-height:1.8">' + r.desc + '</div>'
        + '</div>'

        + '<div style="margin-bottom:6px">'
        + '<div style="font-size:.82rem;font-weight:800;color:var(--t);margin-bottom:14px"><i class="fas fa-route"></i> المسار الزمني للبلاغ</div>'
        + '<div style="padding-right:4px">' + timelineHtml + '</div>'
        + '</div>';

      document.getElementById('ach-drawer-body').innerHTML = html;
      var bg = document.getElementById('ach-drawer-bg');
      bg.style.display = 'flex';
      setTimeout(function () { bg.style.display = 'flex'; }, 10);
      document.body.style.overflow = 'hidden';
    }

    function closeAchDrawer(e) {
      if (e && e.target !== document.getElementById('ach-drawer-bg')) return;
      document.getElementById('ach-drawer-bg').style.display = 'none';
      document.body.style.overflow = '';
    }

    function filterAch(btn, filter) {
      currentFilter = filter;
      document.querySelectorAll('.ach-filter').forEach(function (b) {
        b.style.background = 'transparent';
        b.style.color = 'var(--tm)';
        b.style.borderColor = 'var(--bd)';
      });
      btn.style.background = 'var(--p)';
      btn.style.color = '#fff';
      btn.style.borderColor = 'var(--p)';
      renderAchList();
    }

    // ============================
    // REPORT SUBMIT
    // ============================
    var reportPoints = 0;
    var catMap = ['حفرة', 'نفايات', 'إنارة', 'مياه'];
    var catIconMap = ['🛣️', '🗑️', '💡', '💧'];
    var catKeyMap = ['road', 'waste', 'light', 'water'];

    function submitReport() {
      // Gather form data
      var descEl = document.getElementById('issue-desc');
      var desc = descEl ? descEl.value.trim() : '';
      var selCat = document.querySelector('input[name="cat"]:checked');
      var catIdx = selCat ? parseInt(selCat.id.replace('c', '')) - 1 : 0;
      var cat = catMap[catIdx] || 'بلاغ عام';
      var icon = catIconMap[catIdx] || '📋';
      var cKey = catKeyMap[catIdx] || 'road';

      var pts = 500;
      reportPoints += pts;
      userPoints += pts;
      document.getElementById('user-points').textContent = reportPoints;
      document.getElementById('navPts').textContent = userPoints.toLocaleString();

      var now = new Date();
      var dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
      var timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      var newId = 'RPT-2026-' + String(reportHistory.length + 1).padStart(4, '0');

      reportHistory.unshift({
        id: newId,
        cat: cat,
        icon: icon,
        catKey: cKey,
        loc: 'المملكة الأردنية الهاشمية',
        date: dateStr,
        time: timeStr,
        pts: pts,
        status: 'open',
        desc: desc || 'لم يتم إدخال وصف تفصيلي.'
      });

      renderAchList();
      showToast('تم إرسال البلاغ بنجاح! +500 نقطة 🎉');
      document.querySelector('.step-tr.processing .step-dot-tr').style.cssText = 'background:var(--p);border-color:var(--p);color:#fff';
    }

    // ============================
    // REWARDS
    // ============================
    function exchangeReward(name, cost) {
      if (userPoints >= cost) {
        userPoints -= cost;
        document.getElementById('navPts').textContent = userPoints.toLocaleString();
        openModal('reward_success', { name: name, cost: cost });
      } else {
        showToast('رصيدك غير كافٍ! تحتاج ' + cost + ' نقطة');
      }
    }

    // ============================
    // TOAST
    // ============================
    var toastTimer;
    function showToast(msg) {
      var t = document.getElementById('toast');
      document.getElementById('toastMsg').textContent = msg;
      t.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3000);
    }

    // ============================
    // MODAL
    // ============================
    function openModal(type, data) {
      var body = document.getElementById('modalBody');
      var html = '';
      if (type === 'vip') {
        html = '<div style="font-size:3.5rem;margin-bottom:14px">👑</div><h2 style="color:var(--p);margin-bottom:12px">تفاصيل هوية VIP</h2><p style="color:var(--tl);line-height:1.8">أهلاً بك في النخبة. هويتك مفعّلة في أنظمة البلديات، الأحوال المدنية، ووزارة الأشغال. عند زيارة أي مركز، فقط امسح رمز الـ QR الخاص بك.</p><br><button class="btn-exchange" style="width:100%;padding:12px" onclick="closeModalDirect()">تحميل الرمز الرقمي</button>';
      } else if (type === 'points') {
        html = '<h2 style="color:var(--p);margin-bottom:12px">💰 سجل النقاط</h2><p style="margin-bottom:16px">رصيدك الحالي: <strong style="color:var(--g);font-size:1.4rem">' + userPoints.toLocaleString() + '</strong> نقطة</p><div style="background:var(--bg);padding:14px;border-radius:12px;text-align:right;font-size:.85rem;line-height:2">+ 500 نقطة (بلاغ طريق)<br>+ 200 نقطة (تقييم بلاغ)<br>+ 300 نقطة (بلاغ مياه)</div>';
      } else if (type === 'reward_success') {
        html = '<div style="font-size:3.5rem;margin-bottom:14px">✅</div><h2 style="color:var(--a);margin-bottom:12px">مبروك!</h2><p style="color:var(--tl)">تم إصدار كوبون <strong>' + data.name + '</strong>.<br>تم خصم <strong>' + data.cost + '</strong> نقطة من رصيدك.</p><br><button class="btn-exchange" style="width:100%;padding:12px" onclick="closeModalDirect()">عرض الكوبون</button>';
      } else if (type === 'user_sarah' || type === 'user_ahmed' || type === 'user_omar' || type === 'contrib_user') {
        var names = { user_sarah: 'سارة محمد', user_ahmed: 'أحمد عبدالله', user_omar: 'عمر خالد', contrib_user: 'أحمد الزيود' };
        var pts = { user_sarah: 2100, user_ahmed: 2500, user_omar: 1950, contrib_user: 3200 };
        html = '<img src="https://i.pravatar.cc/80" style="border-radius:50%;margin-bottom:14px"><h2 style="color:var(--p)">' + (names[type] || 'مواطن') + '</h2><p style="color:var(--tl);margin:8px 0">مواطن مبادر — رتبة ذهبية</p><div style="background:var(--bg);padding:12px;border-radius:10px;text-align:right;font-size:.85rem;line-height:2"><span style="color:green">✔</span> البلاغات المكتملة: 45<br><span style="color:orange">★</span> معدل الدقة: 98%<br><i class="fas fa-coins" style="color:var(--g)"></i> النقاط: ' + pts[type] + '</div>';
      } else if (type === 'contrib') {
        html = '<h2 style="color:var(--p);margin-bottom:12px">🤝 انضم إلى لجنة</h2><p style="color:var(--tl)">انتقل إلى صفحة المساهمين لتقديم طلب الانضمام بالتفصيل.</p><br><button class="cbtn cbtn-primary" style="width:100%" onclick="closeModalDirect();showPage(\'contrib\')">انتقل إلى صفحة المساهمين</button>';
      } else if (type === 'join_form') {
        html = '<h2 style="color:var(--p);margin-bottom:12px">📝 طلب الانضمام</h2><p style="color:var(--tl);margin-bottom:16px">سيتم التواصل معك خلال 48 ساعة لاستكمال الإجراءات.</p><input class="jfi" placeholder="اسمك الكامل" style="margin-bottom:10px"><input class="jfi" placeholder="رقم هاتفك" style="margin-bottom:10px"><select class="jfi" style="margin-bottom:16px"><option>— اختر منطقتك —</option><option>عمّان</option><option>المملكة الأردنية الهاشمية</option><option>الزرقاء</option><option>إربد</option></select><button class="cbtn cbtn-primary" style="width:100%" onclick="closeModalDirect();showToast(\'تم إرسال طلبك بنجاح! ✅\')">إرسال الطلب</button>';
      }
      body.innerHTML = html;
      document.getElementById('modalBg').classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal(e) {
      if (e && e.target !== document.getElementById('modalBg')) return;
      closeModalDirect();
    }
    function closeModalDirect() {
      document.getElementById('modalBg').classList.remove('open');
      document.body.style.overflow = '';
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModalDirect(); });

    // ============================
    // STATS BAR CHART
    // ============================
    function drawStatsChart() {
      var canvas = document.getElementById('statsChart');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var W = canvas.offsetWidth || 380;
      var H = 230;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';

      var months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
      var reported = [1420, 1680, 1950, 2100, 2380, 2920];
      var resolved = [1200, 1480, 1720, 1870, 2150, 2380];

      var padL = 30, padR = 18, padT = 30, padB = 54;
      var chartW = W - padL - padR;
      var chartH = H - padT - padB;
      var maxVal = 3200;
      var barW = Math.floor(chartW / months.length * 0.32);
      var gap = Math.floor(chartW / months.length);

      // Grid lines
      ctx.strokeStyle = '#e8eef6';
      ctx.lineWidth = 1;
      [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
        var y = padT + chartH * (1 - t);
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
        ctx.fillStyle = '#93aac4';
        ctx.font = '600 10px Cairo, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal * t / 1000) + 'k', padL - 4, y + 4);
      });

      // Bars
      var colors = { rep: '#1A3A6B', res: '#006B3F' };
      var animProg = 0;
      function frame(prog) {
        ctx.clearRect(0, 0, W, H);
        // grid again
        ctx.strokeStyle = '#e8eef6'; ctx.lineWidth = 1;
        [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
          var y2 = padT + chartH * (1 - t);
          ctx.beginPath(); ctx.moveTo(padL, y2); ctx.lineTo(padL + chartW, y2); ctx.stroke();
          ctx.fillStyle = '#93aac4'; ctx.font = '600 10px Cairo, sans-serif'; ctx.textAlign = 'right';
          ctx.fillText(Math.round(maxVal * t / 1000) + 'k', padL - 4, y2 + 4);
        });

        months.forEach(function (m, i) {
          var cx = padL + gap * i + gap * 0.5;
          var rep = reported[i]; var res = resolved[i];
          var repH = (rep / maxVal) * chartH * prog;
          var resH = (res / maxVal) * chartH * prog;

          // Reported bar (blue)
          var rx = cx - barW - 2;
          var gradient1 = ctx.createLinearGradient(rx, padT + chartH - repH, rx, padT + chartH);
          gradient1.addColorStop(0, '#2563b0'); gradient1.addColorStop(1, '#1A3A6B');
          ctx.fillStyle = gradient1;
          var radius = Math.min(4, repH * 0.2);
          ctx.beginPath();
          ctx.moveTo(rx + radius, padT + chartH - repH);
          ctx.lineTo(rx + barW - radius, padT + chartH - repH);
          ctx.quadraticCurveTo(rx + barW, padT + chartH - repH, rx + barW, padT + chartH - repH + radius);
          ctx.lineTo(rx + barW, padT + chartH);
          ctx.lineTo(rx, padT + chartH);
          ctx.lineTo(rx, padT + chartH - repH + radius);
          ctx.quadraticCurveTo(rx, padT + chartH - repH, rx + radius, padT + chartH - repH);
          ctx.closePath(); ctx.fill();

          // Resolved bar (green)
          var gx = cx + 2;
          var gradient2 = ctx.createLinearGradient(gx, padT + chartH - resH, gx, padT + chartH);
          gradient2.addColorStop(0, '#1aab6d'); gradient2.addColorStop(1, '#006B3F');
          ctx.fillStyle = gradient2;
          var radius2 = Math.min(4, resH * 0.2);
          ctx.beginPath();
          ctx.moveTo(gx + radius2, padT + chartH - resH);
          ctx.lineTo(gx + barW - radius2, padT + chartH - resH);
          ctx.quadraticCurveTo(gx + barW, padT + chartH - resH, gx + barW, padT + chartH - resH + radius2);
          ctx.lineTo(gx + barW, padT + chartH);
          ctx.lineTo(gx, padT + chartH);
          ctx.lineTo(gx, padT + chartH - resH + radius2);
          ctx.quadraticCurveTo(gx, padT + chartH - resH, gx + radius2, padT + chartH - resH);
          ctx.closePath(); ctx.fill();

          // Month label
          ctx.fillStyle = '#607899'; ctx.font = '700 10px Cairo, sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(m, cx, padT + chartH + 16);
        });

        // Legend
        var lx = W - padR - 130;
        var ly = padT - 16;
        [[colors.rep, 'البلاغات المقدّمة'], [colors.res, 'البلاغات المحلولة']].forEach(function (pair, i) {
          ctx.fillStyle = pair[0];
          ctx.fillRect(lx + i * 66, ly, 10, 10);
          ctx.fillStyle = '#3a526b'; ctx.font = '600 10px Cairo, sans-serif'; ctx.textAlign = 'right';
          ctx.fillText(pair[1], lx + i * 66 - 4, ly + 9);
        });
      }

      var start2 = null;
      (function animate(ts) {
        if (!start2) start2 = ts;
        var p = Math.min((ts - start2) / 1200, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        frame(ease);
        if (p < 1) requestAnimationFrame(animate);
      })(performance.now());
    }


    function goStep(n) {
      for (var i = 1; i <= 3; i++) {
        var sn = document.getElementById('sn' + i);
        var sp = document.getElementById('sp' + i);
        var sl = document.getElementById('sl' + i);
        if (sn) { sn.classList.toggle('active', i === n); sn.classList.toggle('done', i < n); }
        if (sp) { sp.classList.toggle('active', i === n); }
        if (sl) { sl.classList.toggle('done', i < n); }
      }
    }

    // ============================
    // COUNTERS
    // ============================
    function setupCounters() {
      var els = document.querySelectorAll('.counter');
      var ob = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target, tgt = +el.dataset.t;
          var start = null;
          (function frame(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / 2000, 1);
            el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * tgt).toLocaleString('en');
            if (p < 1) requestAnimationFrame(frame);
          })(performance.now());
          ob.unobserve(el);
        });
      }, { threshold: .5 });
      els.forEach(function (el) { ob.observe(el); });
    }

    // ============================
    // REVEAL ANIMATIONS
    // ============================
    function setupReveal() {
      var ob = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); ob.unobserve(e.target); } });
      }, { threshold: .12 });
      document.querySelectorAll('.reveal').forEach(function (el) { ob.observe(el); });
    }
    function setupScrollReveal() {
      var ob = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('active'); ob.unobserve(e.target); } });
      }, { threshold: .12 });
      document.querySelectorAll('.scroll-reveal').forEach(function (el) { ob.observe(el); });
    }
    function setupFadeIn() {
      var ob = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); ob.unobserve(e.target); } });
      }, { threshold: .12 });
      document.querySelectorAll('.fade-in').forEach(function (el) { ob.observe(el); });
    }

    // ============================
    // DATE
    // ============================
    function setDate() {
      var el = document.getElementById('td');
      if (el) el.textContent = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // ============================
    // DONUT CHART - GOVERNORATES
    // ============================
    function drawGovChart() {
      var canvas = document.getElementById('govChart');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var cx = 110, cy = 110, r = 90, innerR = 58;
      var data = [
        { val: 33, color: '#1a5fa8' },
        { val: 24, color: '#1aab6d' },
        { val: 18, color: '#f59e0b' },
        { val: 14, color: '#ef4444' },
        { val: 7, color: '#8b5cf6' },
        { val: 4, color: '#64748b' }
      ];
      var total = data.reduce(function (s, d) { return s + d.val; }, 0);
      var start = -Math.PI / 2;
      var gap = 0.03;
      data.forEach(function (d) {
        var slice = (d.val / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start + gap / 2, start + slice - gap / 2);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();
        start += slice;
      });
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    // ============================
    // JOIN FORM STEPPER (INLINE)
    // ============================
    function joinStep(n) {
      for (var i = 1; i <= 4; i++) {
        var panel = document.getElementById('jp' + i);
        if (panel) panel.style.display = (i === n) ? 'block' : 'none';
      }
      for (var s = 1; s <= 3; s++) {
        var step = document.getElementById('js' + s);
        var line = document.getElementById('jl' + s);
        if (step) {
          step.classList.toggle('active', s === n);
          step.classList.toggle('done', s < n);
        }
        if (line) line.classList.toggle('done', s < n);
      }
      if (n === 3) {
        var fname = (document.getElementById('jFirstName') || {}).value || '';
        var lname = (document.getElementById('jLastName') || {}).value || '';
        var phone = (document.getElementById('jPhone') || {}).value || '';
        var dist = (document.getElementById('jDistrict') || {}).value || '—';
        var areas = [];
        ['jc1', 'jc2', 'jc3', 'jc4', 'jc5', 'jc6'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el && el.checked) areas.push(el.value);
        });
        document.getElementById('jc-name').textContent = (fname + ' ' + lname).trim() || '—';
        document.getElementById('jc-phone').textContent = phone || '—';
        document.getElementById('jc-district').textContent = dist;
        document.getElementById('jc-areas').textContent = areas.length ? areas.join('، ') : '—';
      }
    }

    function submitJoinForm() {
      var agree = document.getElementById('jAgree');
      if (!agree || !agree.checked) { showToast('يرجى الموافقة على الشروط أولاً'); return; }
      var ref = 'REF-2026-' + Math.floor(1000 + Math.random() * 9000);
      document.getElementById('jRefNum').textContent = ref;
      joinStep(4);
    }

    function resetJoinForm() {
      ['jFirstName', 'jLastName', 'jPhone', 'jEmail', 'jNID', 'jBio'].forEach(function (id) {
        var el = document.getElementById(id); if (el) el.value = '';
      });
      ['jc1', 'jc2', 'jc3', 'jc4', 'jc5', 'jc6'].forEach(function (id) {
        var el = document.getElementById(id); if (el) el.checked = false;
      });
      var sel = document.getElementById('jDistrict'); if (sel) sel.selectedIndex = 0;
      var ag = document.getElementById('jAgree'); if (ag) ag.checked = false;
    }

    // ============================
    // LOGIN MAP
    // ============================
    document.addEventListener('DOMContentLoaded', function () {
      var loginMap = L.map('loginMap', {
        zoomControl: false, dragging: false, scrollWheelZoom: false,
        doubleClickZoom: false, touchZoom: false, keyboard: false, attributionControl: false
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', maxZoom: 19
      }).addTo(loginMap);
      loginMap.setView([31.24, 36.51], 7);
      var rpts = [
        { lat: 31.882, lng: 35.728, color: '#ef4444', label: 'حفرة — السلط' },
        { lat: 31.950, lng: 35.933, color: '#fbbf24', label: 'إنارة — عمّان' },
        { lat: 32.556, lng: 35.851, color: '#3b82f6', label: 'نفايات — إربد' },
        { lat: 32.073, lng: 36.088, color: '#ef4444', label: 'تسرب — الزرقاء' },
        { lat: 29.560, lng: 35.010, color: '#fbbf24', label: 'حفرة — العقبة' },
        { lat: 31.716, lng: 35.794, color: '#3b82f6', label: 'إنارة — مادبا' },
        { lat: 30.186, lng: 35.734, color: '#ef4444', label: 'صرف — معان' },
        { lat: 32.341, lng: 36.108, color: '#fbbf24', label: 'رصيف — المفرق' },
        { lat: 31.477, lng: 35.544, color: '#3b82f6', label: 'حديقة — الكرك' },
        { lat: 32.034, lng: 35.744, color: '#ef4444', label: 'حفرة — جرش' },
        { lat: 32.380, lng: 35.993, color: '#fbbf24', label: 'إنارة — عجلون' },
        { lat: 31.182, lng: 35.703, color: '#3b82f6', label: 'نفايات — الطفيلة' },
        { lat: 32.200, lng: 36.200, color: '#ef4444', label: 'تسرب — الرمثا' },
        { lat: 31.780, lng: 35.980, color: '#fbbf24', label: 'طريق — ذيبان' },
        { lat: 32.550, lng: 35.850, color: '#3b82f6', label: 'رصيف — إربد' },
        { lat: 31.100, lng: 37.320, color: '#ef4444', label: 'حفرة — الأزرق' },
        { lat: 30.540, lng: 36.480, color: '#fbbf24', label: 'إنارة — القويرة' },
        { lat: 31.600, lng: 36.800, color: '#ef4444', label: 'صرف — الجفر' },
        { lat: 30.800, lng: 35.600, color: '#fbbf24', label: 'طريق — وادي موسى' }
      ];
      var colorLabel = { '#ef4444': '🔴 عاجل', '#fbbf24': '🟡 متوسط', '#3b82f6': '🔵 منخفض' };
      rpts.forEach(function (r) {
        var icon = L.divIcon({
          className: '',
          html: '<svg width="22" height="30" viewBox="0 0 22 30" xmlns="http://www.w3.org/2000/svg"><path d="M11 0C4.9 0 0 4.9 0 11c0 7.7 11 19 11 19s11-11.3 11-19c0-6.1-4.9-11-11-11z" fill="' + r.color + '"/><circle cx="11" cy="11" r="4" fill="white"/></svg>',
          iconSize: [22, 22], iconAnchor: [11, 22]
        });
        L.marker([r.lat, r.lng], { icon: icon }).addTo(loginMap)
          .bindPopup('<div style="font-family:Cairo,sans-serif;text-align:right;font-size:12px;min-width:130px"><strong>' + r.label + '</strong><br><span style="color:' + r.color + ';font-weight:700">' + colorLabel[r.color] + '</span></div>');
      });
    });

    // ============================
    // BOOT
    // ============================
    document.addEventListener('DOMContentLoaded', function () {
      setDate();
      init();
      renderAchList();
      setTimeout(drawGovChart, 300);
      // Draw stats chart when visible
      var statsOb = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { drawStatsChart(); statsOb.unobserve(e.target); }
        });
      }, { threshold: .3 });
      var sw = document.getElementById('statsChartWrap');
      if (sw) statsOb.observe(sw);
    });

    // ============================
    // PROFILE PAGE
    // ============================
function changeProfilePhoto(input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  if (file.size > 5 * 1024 * 1024) { showToast('حجم الصورة يتجاوز 5 ميجابايت'); return; }

  var reader = new FileReader();
  reader.onload = function (e) {
    var src = e.target.result;

    // Save string context globally to send on Save Profile trigger
    currentProfilePicBase64 = src;

    // Update avatar elements across the board
    var emoji = document.getElementById('profileAvatarEmoji');
    var img = document.getElementById('profileAvatarImg');
    if (emoji) emoji.style.display = 'none';
    if (img) { img.src = src; img.style.display = 'block'; }

    var prev = document.getElementById('photoPreview');
    var prevArea = document.getElementById('photoPreviewArea');
    if (prev) prev.src = src;
    if (prevArea) prevArea.style.display = 'block';
    showToast('تم اختيار الصورة الشخصية، اضغط حفظ التغييرات للتأكيد ✅');
  };
  reader.readAsDataURL(file);
}
// --- end of changeProfilePhoto method ---
async function saveProfile() {
  var first = (document.getElementById('profileFirstName') || {}).value || '';
  var mid = (document.getElementById('profileMidName') || {}).value || '';
  var last = (document.getElementById('profileLastName') || {}).value || '';
  var email = (document.getElementById('profileEmail') || {}).value || '';

  if (!first || !last) { showToast('يرجى إدخال الاسم الأول والعائلة على الأقل'); return; }

  var isGuest = (currentUser === 'مواطن مبادر' || sessionStorage.getItem('guestName'));
  if (isGuest) {
    showToast('حساب الزائر لا يمكنه تعديل البيانات الافتراضية!');
    return;
  }

  try {
    const response = await fetch('http://localhost:8081/api/auth/profile/' + currentUser, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: first,
        middleName: mid,
        lastName: last,
        email: email,
        profilePicture: currentProfilePicBase64 // Sends image directly to backend
      })
    });

    if (response.ok) {
      var fullName = [first, mid, last].filter(Boolean).join(' ');
      var nd = document.getElementById('profileNameDisplay');
      if (nd) nd.textContent = fullName;

      var nu = document.getElementById('navUser');
      if (nu) nu.textContent = 'مرحباً ' + first;

      Swal.fire({
        icon: 'success',
        title: 'تم الحفظ',
        text: 'تم حفظ بيانات ملفك الشخصي بنجاح في السيرفر!',
        timer: 1500,
        showConfirmButton: false,
        customClass: { container: 'bring-to-front' }
      });
    }
  } catch (error) {
    console.error("Error saving profile details:", error);
    showToast('حدث خطأ أثناء محاولة الاتصال بالخادم.');
  }
}
// --- end of saveProfile method ---
 // Populate profile fields from login data when profile page is shown
 var _origShowPage = showPage;
 showPage = function (name, scroll) {
   _origShowPage(name, scroll);

   if (name === 'profile' && currentUser) {
     var parts = currentUser.split(' ');
     var fn = document.getElementById('profileFirstName');
     var ln = document.getElementById('profileLastName');
     var nd = document.getElementById('profileNameDisplay');
     var pd = document.getElementById('profilePtsDisplay');

     // Check if current session is a guest session
     var isGuest = (currentUser === 'مواطن مبادر' || sessionStorage.getItem('guestName'));

     if (fn && !fn.value) fn.value = parts[0] || '';
     if (ln && !ln.value) ln.value = parts[parts.length - 1] || '';
     if (nd) nd.textContent = currentUser;

     // Force the user card widget to display 0 points if guest, or real points if logged in
     if (pd) {
       pd.textContent = isGuest ? "0 نقطة" : userPoints.toLocaleString() + ' نقطة';
     }
   }
 };
 // --- end of script file ---
