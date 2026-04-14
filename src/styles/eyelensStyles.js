export function injectStyles() {
  if (document.getElementById("eyelens-styles")) return;
  const style = document.createElement("style");
  style.id = "eyelens-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=ABeeZee:ital@0;1&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=DM+Mono:wght@500&display=swap');

    :root {
      --em: #667871; --em-dark: #4f5f58; --em-mid: #5a6a64; --em-bright: #8a9b95; --em-darkest: #2c3330;
      --em-light: #E8EDEB; --em-pale: #F2F5F4;
      --white: #FFFFFF; --off: #FAFAFA;
      --g50: #F5F4F4; --g100: #E8E6E5; --g200: #D4D1D0;
      --g300: #B8B4B3; --g400: #928E8D; --g500: #6B6667;
      --g600: #524D4E; --g700: #3A3536; --black: #231F20;
      --beige: #F2EDE4; --gold: #B8924E; --gold-lt: #F0E4CE;
      --red: #D94040; --amber: #C97C1A; --blue: #2563EB;
      --green: #16A34A;
      --ui-scale: 1.06;
      --font-d: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
      --font-b: 'ABeeZee', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --font-n: 'DM Mono', 'Courier New', monospace;
      --tr: 0.22s cubic-bezier(.4,0,.2,1);
      --tr-slow: 0.45s cubic-bezier(.4,0,.2,1);
      --background: #f7f8f6;
      --dashboard-bg: #f7f8f6;
      --surface: #ffffff;
      --card: #ffffff;
      --sidebar: var(--em-pale);
      --text-primary: var(--black);
      --text-secondary: var(--g500);
    }

    html.dark {
      color-scheme: dark;
      --background: #0d0d0d;
      --dashboard-bg: #0d0d0d;
      --surface: #141414;
      --card: #1c1c1c;
      --sidebar: #111111;
      --border: #252525;
      --text-primary: #f5f5f5;
      --text-secondary: #888888;
      --white: var(--card);
      --off: var(--surface);
      --black: var(--text-primary);
      --g50: #121212;
      --g100: #1a1a1a;
      --g200: #252525;
      --g300: #333333;
      --g400: #888888;
      --g500: var(--text-secondary);
      --g600: #b0b0b0;
      --g700: #d0d0d0;
      --beige: var(--surface);
      --em-light: #252b29;
      --em-pale: #1c201f;
      --text: #888888;
      --text-h: #f5f5f5;
      --bg: #0d0d0d;
      --code-bg: #1c1c1c;
    }

    *,
    *::before,
    *::after {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }

    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: var(--font-b); -webkit-font-smoothing:antialiased; zoom: var(--ui-scale); background: var(--background); color: var(--text-primary); }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(28px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity:0; }
      to   { opacity:1; }
    }
    @keyframes slideRight {
      from { transform: translateX(-100%); }
      to   { transform: translateX(0); }
    }
    @keyframes float {
      0%,100% { transform:translateY(0) rotate(-2deg); }
      50%      { transform:translateY(-12px) rotate(2deg); }
    }
    @keyframes pulse {
      0%,100% { transform:scale(1); }
      50%      { transform:scale(1.05); }
    }
    @keyframes shimmer {
      from { background-position: -200% center; }
      to   { background-position: 200% center; }
    }
    @keyframes spin {
      from { transform:rotate(0deg); }
      to   { transform:rotate(360deg); }
    }
    @keyframes bounce {
      0%,100% { transform:translateY(0); }
      50%      { transform:translateY(-6px); }
    }
    @keyframes toastIn {
      from { opacity:0; transform:translateY(60px) scale(.92); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }
    @keyframes countUp {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes gradientShift {
      0%   { background-position:0% 50%; }
      50%  { background-position:100% 50%; }
      100% { background-position:0% 50%; }
    }
    @keyframes orb {
      0%,100% { transform:translate(0,0) scale(1); }
      33%      { transform:translate(30px,-20px) scale(1.08); }
      66%      { transform:translate(-20px,30px) scale(.94); }
    }

    .page-enter { animation: fadeUp var(--tr-slow) forwards; }
    .hero-text-1 { animation: fadeUp .7s .1s both; }
    .hero-text-2 { animation: fadeUp .7s .25s both; }
    .hero-text-3 { animation: fadeUp .7s .4s both; }
    .hero-text-4 { animation: fadeUp .7s .55s both; }
    .hero-visual-wrap { animation: fadeIn .9s .2s both; }

    /* ── Home page typography boost ── */
    .home-page .hero-badge { font-size:12px; }
    .home-page .hero-heading { font-size:clamp(58px,6.6vw,88px); }
    .home-page .hero-sub { font-size:19px; max-width:500px; }
    .home-page .hero-stat h3 { font-size:30px; }
    .home-page .hero-stat p { font-size:13px; }
    .home-page .section-label { font-size:12px; }
    .home-page .section-title { font-size:clamp(32px,4vw,50px); }
    .home-page .section-desc { font-size:16px; }
    .home-page .cat-body h3 { font-size:20px; }
    .home-page .cat-body p { font-size:13px; }
    .home-page .product-brand { font-size:11px; }
    .home-page .product-name { font-size:15px; }
    .home-page .rating-ct { font-size:12px; }
    .home-page .product-price { font-size:19px; }
    .home-page .trust-pill { font-size:14px; }
    .home-page .why-card h3 { font-size:17px; }
    .home-page .why-card p { font-size:14px; }
    .home-page .testi-text { font-size:15px; }
    .home-page .testi-name { font-size:15px; }
    .home-page .testi-meta { font-size:12px; }

    /* ── About page typography boost ── */
    .about-page .section-label { font-size:12px; }
    .about-page .section-title { font-size:clamp(34px,4.2vw,52px); }
    .about-page .btn { font-size:14px; }

    .float-anim { animation: float 4s ease-in-out infinite; }
    .pulse-anim { animation: pulse 2s ease-in-out infinite; }

    .stagger-1 { animation: fadeUp .6s .1s both; }
    .stagger-2 { animation: fadeUp .6s .2s both; }
    .stagger-3 { animation: fadeUp .6s .3s both; }
    .stagger-4 { animation: fadeUp .6s .4s both; }
    .stagger-5 { animation: fadeUp .6s .5s both; }
    .stagger-6 { animation: fadeUp .6s .6s both; }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width:5px; }
    ::-webkit-scrollbar-thumb { background:#C8C8C2; border-radius:50px; }

    /* ── Navbar ── */
    .navbar {
      position:fixed; top:0; left:0; right:0; z-index:900;
      height:64px; padding:0 40px;
      display:flex; align-items:center; justify-content:space-between;
      background:rgba(255,255,255,.88); backdrop-filter:blur(20px) saturate(1.5);
      border-bottom:1px solid rgba(0,0,0,.06);
      transition:box-shadow var(--tr), background var(--tr);
    }
    .navbar.scrolled { box-shadow:0 4px 24px rgba(0,0,0,.08); }
    .nav-logo {
      font-family:var(--font-d); font-size:22px; font-weight:800;
      color:var(--black); letter-spacing:-.03em; cursor:pointer;
      transition:transform var(--tr);
    }
    .nav-logo:hover { transform:scale(1.04); }
    .nav-logo .dot { color:var(--em); }
    .nav-links { display:flex; align-items:center; gap:32px; }
    .nav-link {
      font-size:16px; font-weight:500; color:var(--g600);
      cursor:pointer; transition:color var(--tr); position:relative; padding:4px 0;
    }
    .nav-link::after {
      content:''; position:absolute; bottom:-2px; left:0; right:100%; height:2px;
      background:var(--em); border-radius:2px; transition:right var(--tr);
    }
    .nav-link:hover::after, .nav-link.active::after { right:0; }
    .nav-link:hover, .nav-link.active { color:var(--em); }
    .nav-right { display:flex; align-items:center; gap:8px; }
    .nav-icon-btn {
      width:36px; height:36px; border-radius:10px;
      border:1.5px solid var(--g200); background:var(--white);
      display:flex; align-items:center; justify-content:center;
      color:var(--g600); transition:all var(--tr); cursor:pointer;
      position:relative;
    }
    .nav-icon-btn:hover { border-color:var(--em); color:var(--em); background:var(--em-light); transform:translateY(-1px); }
    .cart-badge {
      position:absolute; top:-6px; right:-6px;
      width:18px; height:18px; background:var(--em);
      border-radius:50%; font-size:10px; font-weight:800;
      color:var(--white); display:flex; align-items:center; justify-content:center;
      border:2px solid var(--white);
      animation: bounce .6s ease;
    }

    /* ── Buttons ── */
    .btn {
      display:inline-flex; align-items:center; justify-content:center; gap:8px;
      padding:11px 24px; border-radius:12px; border:1.5px solid transparent;
      font-family:var(--font-b); font-size:13px; font-weight:600;
      letter-spacing:.02em; cursor:pointer; transition:all var(--tr);
      position:relative; overflow:hidden; white-space:nowrap;
    }
    .btn::before {
      content:''; position:absolute; inset:0;
      background:rgba(255,255,255,0); transition:background var(--tr);
    }
    .btn:hover::before { background:rgba(255,255,255,.1); }
    .btn:active { transform:scale(.97); }
    .btn-primary { background:var(--em); color:var(--white); border-color:var(--em); }
    .btn-primary:hover { background:var(--em-dark); border-color:var(--em-dark); box-shadow:0 4px 20px rgba(102,120,113,.35); transform:translateY(-2px); }
    .btn-secondary { background:var(--white); color:var(--em); border-color:var(--em); }
    .btn-secondary:hover { background:var(--em-light); transform:translateY(-2px); }
    .btn-ghost { background:transparent; color:var(--g600); border-color:var(--g200); }
    .btn-ghost:hover { background:var(--g50); border-color:var(--g300); color:var(--black); transform:translateY(-1px); }
    .btn-dark { background:var(--black); color:var(--white); border-color:var(--black); }
    .btn-dark:hover { background:var(--g700); transform:translateY(-2px); }
    .btn-danger { background:#FEF2F2; color:var(--red); border-color:rgba(217,64,64,.2); }
    .btn-danger:hover { background:var(--red); color:var(--white); }
    .btn-sm { padding:7px 14px; font-size:12px; border-radius:8px; }
    .btn-lg { padding:15px 32px; font-size:15px; border-radius:14px; }
    .btn-full { width:100%; }

    /* ── Badges ── */
    .badge {
      display:inline-flex; align-items:center; gap:4px;
      padding:3px 10px; border-radius:999px;
      font-size:10px; font-weight:800; letter-spacing:.05em; text-transform:uppercase;
    }
    .badge-em    { background:var(--em-light); color:var(--em-dark); }
    .badge-sale  { background:var(--red); color:var(--white); }
    .badge-new   { background:var(--black); color:var(--white); }
    .badge-oos   { background:var(--g100); color:var(--g500); }
    .badge-gold  { background:var(--gold-lt); color:var(--gold); }
    .badge-delivered { background:#F0FDF4; color:var(--green); }
    .badge-transit   { background:#FEF8EE; color:var(--amber); }
    .badge-processing { background:var(--em-light); color:var(--em-dark); }

    /* ── Input ── */
    .input {
      width:100%; padding:11px 14px; border-radius:12px;
      border:1.5px solid var(--g200); background:var(--off);
      font-family:var(--font-b); font-size:13px; color:var(--g700);
      outline:none; transition:all var(--tr); appearance:none;
    }
    .input:focus { border-color:var(--em); background:var(--white); box-shadow:0 0 0 3px rgba(102,120,113,.12); }
    .input::placeholder { color:var(--g400); }
    .field-label { font-size:11px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--g500); margin-bottom:6px; display:block; }

    /* ── Hero ── */
    .hero-section {
      min-height:100vh; display:grid; grid-template-columns:1fr 1fr;
      background:var(--white); padding-top:64px; overflow:hidden;
      position:relative;
    }
    .hero-orb {
      position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none;
    }
    .hero-left {
      display:flex; flex-direction:column; justify-content:center;
      padding:80px 48px 80px 64px; position:relative; z-index:2;
    }
    .hero-badge {
      display:inline-flex; align-items:center; gap:8px;
      background:var(--em-light); color:var(--em-dark);
      font-size:11px; font-weight:800; letter-spacing:.08em; text-transform:uppercase;
      padding:6px 14px; border-radius:999px; border:1px solid rgba(102,120,113,.22);
      width:fit-content; margin-bottom:24px;
    }
    .hero-badge-dot { width:6px; height:6px; background:var(--em); border-radius:50%; animation:pulse 1.5s infinite; }
    .hero-heading {
      font-family:var(--font-d); font-size:clamp(52px,6vw,80px); font-weight:800;
      color:var(--black); line-height:1.0; letter-spacing:-.03em; margin-bottom:20px;
    }
    .hero-heading em { color:var(--em); font-style:italic; }
    .hero-sub { font-size:17px; color:var(--g500); line-height:1.7; max-width:420px; margin-bottom:36px; }
    .hero-cta { display:flex; gap:14px; margin-bottom:52px; }
    .hero-stats { display:flex; gap:0; }
    .hero-stat { border-right:1px solid var(--g100); padding-right:40px; }
    .hero-stat:last-child { border-right:none; padding-right:0; }
    .hero-stat h3 { font-family:var(--font-d); font-size:26px; font-weight:800; color:var(--black); }
    .hero-stat p  { font-size:12px; color:var(--g400); font-weight:500; letter-spacing:.03em; }
    .hero-right {
      display:flex; align-items:center; justify-content:center;
      background:linear-gradient(135deg, var(--em-pale) 0%, var(--em-light) 60%, rgba(102,120,113,.22) 100%);
      position:relative; overflow:hidden;
    }
    .hero-float-card {
      position:absolute; bottom:80px; left:40px;
      background:rgba(255,255,255,.95); backdrop-filter:blur(16px);
      border:1px solid rgba(255,255,255,.9); border-radius:16px;
      padding:14px 18px; display:flex; align-items:center; gap:12px;
      box-shadow:0 8px 32px rgba(0,0,0,.12);
      animation: float 3.5s ease-in-out infinite;
    }
    .hero-float-card .icon { font-size:24px; }
    .hero-float-card h4 { font-size:12px; font-weight:800; color:var(--black); }
    .hero-float-card p  { font-size:11px; color:var(--g500); }
    .hero-float-card-2 {
      position:absolute; top:100px; right:32px;
      background:var(--em); color:var(--white);
      border-radius:14px; padding:12px 16px;
      box-shadow:0 8px 32px rgba(102,120,113,.38);
      animation: float 4.2s 1s ease-in-out infinite;
    }
    .hero-float-card-2 .rating { font-size:20px; font-weight:900; font-family:var(--font-d); }
    .hero-float-card-2 .label { font-size:10px; opacity:.8; }

    /* ── Section commons ── */
    .section-pad { padding:96px 0; }
    .container { max-width:1200px; margin:0 auto; padding:0 40px; }
    .section-header { text-align:center; margin-bottom:56px; }
    .section-label { font-size:11px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:var(--em); display:block; margin-bottom:12px; }
    .section-title { font-family:var(--font-d); font-size:clamp(28px,3.5vw,44px); font-weight:800; color:var(--black); line-height:1.1; letter-spacing:-.02em; }
    .section-title em { font-style:italic; color:var(--em); }
    .section-desc { font-size:15px; color:var(--g500); margin-top:12px; max-width:480px; margin-inline:auto; line-height:1.7; }

    /* ── Categories ── */
    .cat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
    .cat-card {
      border-radius:20px; overflow:hidden; cursor:pointer;
      aspect-ratio:3/4; position:relative;
      transition:transform var(--tr-slow), box-shadow var(--tr-slow);
    }
    .cat-card:hover { transform:translateY(-8px) scale(1.01); box-shadow:0 24px 56px rgba(0,0,0,.18); }
    .cat-emoji { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:80px; transition:transform var(--tr-slow); opacity:.6; }
    .cat-card:hover .cat-emoji { transform:scale(1.15) rotate(5deg); }
    .cat-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 55%); }
    .cat-body { position:absolute; bottom:0; left:0; right:0; padding:24px; color:var(--white); }
    .cat-body h3 { font-family:var(--font-d); font-size:18px; font-weight:800; margin-bottom:4px; }
    .cat-body p  { font-size:12px; opacity:.75; }
    .cat-arrow { position:absolute; top:16px; right:16px; width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,.15); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; color:var(--white); font-size:14px; transition:all var(--tr); }
    .cat-card:hover .cat-arrow { background:rgba(255,255,255,.9); color:var(--black); transform:rotate(45deg); }

    /* ── Product cards ── */
    .products-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
    .product-card {
      background:var(--white); border-radius:20px;
      border:1px solid var(--g100); overflow:hidden;
      transition:transform var(--tr-slow), box-shadow var(--tr-slow);
      cursor:pointer;
    }
    .product-card:hover { transform:translateY(-6px); box-shadow:0 16px 48px rgba(0,0,0,.1); }
    .product-img {
      position:relative; aspect-ratio:4/3; overflow:hidden;
      display:flex; align-items:center; justify-content:center;
    }
    .product-emoji { font-size:56px; transition:transform .5s cubic-bezier(.4,0,.2,1); }
    .product-card:hover .product-emoji { transform:scale(1.1) rotate(-3deg); }
    .badge-abs { position:absolute; top:12px; left:12px; }
    .wish-btn {
      position:absolute; top:12px; right:12px;
      width:32px; height:32px; border-radius:50%;
      background:rgba(255,255,255,.9); backdrop-filter:blur(8px);
      border:none; display:flex; align-items:center; justify-content:center;
      font-size:14px; opacity:0; transform:scale(.8);
      transition:all var(--tr); cursor:pointer;
    }
    .product-card:hover .wish-btn { opacity:1; transform:scale(1); }
    .wish-btn:hover { background:var(--red); color:var(--white); transform:scale(1.1); }
    .product-body { padding:16px; }
    .product-brand { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--g400); margin-bottom:4px; }
    .product-name  { font-size:14px; font-weight:600; color:var(--black); margin-bottom:8px; line-height:1.3; }
    .stars { color:#F59E0B; font-size:12px; }
    .rating-ct { font-size:11px; color:var(--g400); }
    .product-footer { display:flex; align-items:center; justify-content:space-between; }
    .product-price-orig { font-size:11px; color:var(--g400); text-decoration:line-through; margin-right:3px; }
    .product-price { font-family:var(--font-n); font-size:18px; font-weight:700; color:var(--black); }
    .add-btn {
      background:var(--black); color:var(--white);
      border:none; padding:8px 14px; border-radius:8px;
      font-size:12px; font-weight:700; cursor:pointer; transition:all var(--tr);
      font-family:var(--font-b);
    }
    .add-btn:hover { background:var(--em); transform:scale(1.05); }
    .add-btn.added { background:var(--green); }

    /* ── Why us ── */
    .why-section { background:linear-gradient(135deg,#231F20 0%,#2f3d38 100%); }
    .why-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
    .why-card {
      padding:32px 24px; border-radius:20px;
      background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
      text-align:center; color:var(--white);
      transition:all var(--tr-slow); position:relative; overflow:hidden;
    }
    .why-card::before {
      content:''; position:absolute; inset:0;
      background:radial-gradient(circle at 50% 0%, rgba(102,120,113,.28), transparent 70%);
      opacity:0; transition:opacity var(--tr);
    }
    .why-card:hover { background:rgba(255,255,255,.08); transform:translateY(-4px); }
    .why-card:hover::before { opacity:1; }
    .why-icon { font-size:36px; margin-bottom:16px; display:block; }
    .why-card h3 { font-family:var(--font-d); font-size:16px; font-weight:700; margin-bottom:8px; }
    .why-card p  { font-size:13px; color:rgba(255,255,255,.55); line-height:1.6; }

    /* ── Testimonials ── */
    .testimonial-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
    .testi-card {
      background:var(--white); border:1px solid var(--g100); border-radius:20px;
      padding:28px; transition:all var(--tr-slow);
      position:relative; overflow:hidden;
    }
    .testi-card::after {
      content:''; position:absolute; top:0; left:0; right:0; height:3px;
      background:linear-gradient(90deg, var(--em), var(--em-mid));
      transform:scaleX(0); transform-origin:left; transition:transform var(--tr);
    }
    .testi-card:hover { box-shadow:0 16px 48px rgba(0,0,0,.08); transform:translateY(-4px); }
    .testi-card:hover::after { transform:scaleX(1); }
    .quote-mark { font-size:48px; line-height:1; color:var(--em); font-family:Georgia; margin-bottom:8px; }
    .testi-text { font-size:14px; color:var(--g600); line-height:1.7; margin-bottom:20px; }
    .testi-stars { color:var(--gold); font-size:13px; margin-bottom:16px; }
    .testi-author { display:flex; align-items:center; gap:12px; }
    .testi-avatar { width:40px; height:40px; border-radius:50%; background:var(--em-light); display:flex; align-items:center; justify-content:center; font-size:18px; }
    .testi-name { font-size:14px; font-weight:700; color:var(--black); }
    .testi-meta { font-size:11px; color:var(--g400); }

    /* ── Trust bar ── */
    .trust-bar {
      background:var(--g50); border-top:1px solid var(--g100); border-bottom:1px solid var(--g100);
      padding:20px 0;
    }
    .trust-pills { display:flex; align-items:center; justify-content:center; gap:40px; flex-wrap:wrap; }
    .trust-pill { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:var(--em-dark); background:var(--em-pale); border:1px solid var(--em-light); padding:8px 16px; border-radius:999px; }
    .trust-pill span { font-size:16px; }

    /* ── Footer ── */
    .footer { background:var(--black); color:var(--white); padding:80px 40px 32px; }
    .footer-inner { max-width:1200px; margin:0 auto; }
    .footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:60px; padding-bottom:48px; border-bottom:1px solid rgba(255,255,255,.06); }
    .footer-logo { font-family:var(--font-d); font-size:26px; font-weight:800; margin-bottom:16px; }
    .footer-desc { font-size:13px; color:rgba(255,255,255,.4); line-height:1.7; max-width:280px; }
    .footer-socials { display:flex; gap:10px; margin-top:20px; }
    .social-btn {
      width:34px; height:34px; border-radius:8px;
      background:rgba(255,255,255,.06); border:none;
      display:flex; align-items:center; justify-content:center;
      font-size:14px; cursor:pointer; color:rgba(255,255,255,.5);
      transition:all var(--tr);
    }
    .social-btn:hover { background:var(--em); color:var(--white); transform:translateY(-2px); }
    .footer-col h4 { font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.25); margin-bottom:20px; }
    .footer-links { display:flex; flex-direction:column; gap:10px; }
    .footer-link { font-size:13px; color:rgba(255,255,255,.5); cursor:pointer; transition:color var(--tr); }
    .footer-link:hover { color:var(--white); }
    .footer-bottom { display:flex; align-items:center; justify-content:space-between; padding-top:24px; font-size:12px; color:rgba(255,255,255,.25); }

    /* ── PLP ── */
    .plp-header { background:var(--g50); border-bottom:1px solid var(--g100); padding:80px 40px 40px; }
    .plp-header h1 { font-family:var(--font-d); font-size:clamp(32px,4vw,52px); font-weight:800; color:var(--black); letter-spacing:-.02em; }
    .plp-layout { display:grid; grid-template-columns:240px 1fr; gap:40px; padding:40px 0 80px; }
    .filter-sidebar { position:sticky; top:80px; height:fit-content; }
    .filter-heading { font-size:14px; font-weight:800; color:var(--black); margin-bottom:20px; display:flex; justify-content:space-between; }
    .filter-section { margin-bottom:24px; }
    .filter-title { font-size:11px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; color:var(--g500); margin-bottom:10px; }
    .filter-option { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--g700); cursor:pointer; padding:4px 0; transition:color var(--tr); }
    .filter-option:hover { color:var(--em); }
    .filter-option input { accent-color:var(--em); }
    .sort-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
    .sort-bar p { font-size:13px; color:var(--g500); }
    .plp-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }

    /* ── PDP ── */
    .pdp-layout { display:grid; grid-template-columns:1fr 1fr; gap:56px; padding:96px 0; }
    .gallery-main {
      border-radius:24px; overflow:hidden;
      background:var(--beige); aspect-ratio:1;
      display:flex; align-items:center; justify-content:center;
      cursor:zoom-in; position:relative;
    }
    .gallery-emoji { font-size:120px; transition:transform var(--tr-slow); pointer-events:none; }
    .gallery-main:hover .gallery-emoji { transform:scale(1.12); }
    .gallery-thumbs { display:flex; gap:10px; margin-top:12px; }
    .g-thumb {
      width:72px; height:72px; border-radius:12px; overflow:hidden;
      border:2px solid var(--g200); cursor:pointer; transition:all var(--tr);
      display:flex; align-items:center; justify-content:center;
      font-size:28px; background:var(--beige);
    }
    .g-thumb.active, .g-thumb:hover { border-color:var(--em); transform:scale(1.05); }
    .pdp-brand { font-size:11px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:var(--em); margin-bottom:8px; }
    .pdp-name { font-family:var(--font-d); font-size:clamp(26px,3vw,36px); font-weight:800; color:var(--black); letter-spacing:-.02em; line-height:1.2; margin-bottom:16px; }
    .pdp-rating { display:flex; align-items:center; gap:8px; margin-bottom:20px; }
    .pdp-price-wrap { margin-bottom:28px; }
    .pdp-price { font-family:var(--font-n); font-size:32px; font-weight:800; color:var(--black); }
    .pdp-price-orig { font-size:18px; color:var(--g400); text-decoration:line-through; margin-left:8px; }
    .pdp-save { font-size:13px; color:var(--green); font-weight:700; margin-left:8px; }
    .color-swatches { display:flex; gap:10px; margin-bottom:20px; }
    .c-swatch {
      width:28px; height:28px; border-radius:50%; cursor:pointer;
      transition:all var(--tr); border:3px solid transparent;
    }
    .c-swatch.active, .c-swatch:hover { transform:scale(1.2); box-shadow:0 0 0 2px var(--white), 0 0 0 4px var(--em); }
    .size-btns { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:28px; }
    .size-btn {
      padding:10px 18px; border-radius:10px; border:1.5px solid var(--g200);
      font-size:13px; font-weight:600; color:var(--g700); background:var(--white);
      cursor:pointer; transition:all var(--tr); font-family:var(--font-b);
    }
    .size-btn:hover { border-color:var(--em); color:var(--em); }
    .size-btn.active { border-color:var(--em); background:var(--em-light); color:var(--em); }
    .pdp-cta { display:flex; gap:12px; margin-bottom:28px; }
    .spec-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:28px; }
    .spec-item { padding:14px; border-radius:12px; background:var(--g50); border:1px solid var(--g100); transition:border-color var(--tr); }
    .spec-item:hover { border-color:var(--em); }
    .spec-label { font-size:10px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--g400); margin-bottom:4px; }
    .spec-value { font-size:14px; font-weight:700; color:var(--black); }

    /* ── Cart ── */
    .cart-layout { display:grid; grid-template-columns:1fr 380px; gap:40px; padding:96px 0; }
    .cart-item {
      display:flex; align-items:center; gap:20px; padding:20px;
      border-radius:16px; border:1px solid var(--g100);
      margin-bottom:16px; transition:box-shadow var(--tr);
    }
    .cart-item:hover { box-shadow:0 4px 20px rgba(0,0,0,.06); }
    .cart-item-img { width:80px; height:80px; border-radius:12px; background:var(--beige); display:flex; align-items:center; justify-content:center; font-size:36px; flex-shrink:0; }
    .qty-ctrl { display:flex; align-items:center; gap:0; border:1.5px solid var(--g200); border-radius:10px; overflow:hidden; }
    .qty-btn { width:34px; height:34px; border:none; background:transparent; font-size:16px; cursor:pointer; transition:background var(--tr); font-weight:700; color:var(--g600); font-family:var(--font-b); }
    .qty-btn:hover { background:var(--g50); }
    .qty-num { width:36px; text-align:center; font-size:14px; font-weight:700; font-family:var(--font-n); border:none; outline:none; }
    .order-summary { position:sticky; top:80px; background:var(--white); border:1px solid var(--g100); border-radius:20px; padding:28px; }
    .summary-title { font-family:var(--font-d); font-size:18px; font-weight:800; color:var(--black); margin-bottom:20px; }
    .summary-row { display:flex; justify-content:space-between; font-size:14px; color:var(--g600); margin-bottom:12px; }
    .summary-total { display:flex; justify-content:space-between; font-family:var(--font-n); font-size:20px; font-weight:800; color:var(--black); padding-top:16px; border-top:1px solid var(--g100); }

    /* ── Checkout ── */
    .checkout-grid { display:grid; grid-template-columns:1fr 380px; gap:40px; padding:96px 0; }
    .checkout-section { background:var(--white); border:1px solid var(--g100); border-radius:20px; padding:28px; margin-bottom:20px; }
    .section-heading { font-family:var(--font-d); font-size:20px; font-weight:800; color:var(--black); margin-bottom:20px; display:flex; align-items:center; gap:10px; letter-spacing:-0.01em; }
    .section-num { width:28px; height:28px; border-radius:50%; background:var(--em); color:var(--white); font-size:12px; font-weight:800; display:flex; align-items:center; justify-content:center; }
    .form-row2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .addr-chips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
    .addr-chip {
      padding:6px 14px; border-radius:999px; border:1.5px solid var(--g200);
      font-size:12px; font-weight:600; cursor:pointer; transition:all var(--tr);
      font-family:var(--font-b); background:var(--white);
    }
    .addr-chip.active { border-color:var(--em); background:var(--em-light); color:var(--em); }
    .pay-tabs { display:flex; gap:0; border-radius:12px; overflow:hidden; border:1.5px solid var(--g200); width:fit-content; margin-bottom:24px; }
    .pay-tab {
      padding:10px 20px; font-size:13px; font-weight:600; font-family:var(--font-b);
      background:var(--white); color:var(--g600); cursor:pointer; border:none; transition:all var(--tr);
    }
    .pay-tab.active { background:var(--em); color:var(--white); }
    .pay-panel { display:none; }
    .pay-panel.active { display:block; animation:fadeIn .3s; }
    .upi-apps { display:flex; gap:10px; flex-wrap:wrap; }
    .upi-app {
      padding:10px 16px; border-radius:10px; border:1.5px solid var(--g200);
      font-size:13px; font-weight:700; cursor:pointer; transition:all var(--tr);
      font-family:var(--font-b); background:var(--white); display:flex; align-items:center; gap:8px;
    }
    .upi-app.active { border-color:var(--em); background:var(--em-light); color:var(--em); }
    .lens-plan-btn:hover { background:var(--g50); border-color:var(--g300); }
    .del-opt {
      padding:16px; border-radius:14px; border:1.5px solid var(--g200);
      cursor:pointer; transition:all var(--tr); margin-bottom:10px;
    }
    .del-opt.active { border-color:var(--em); background:var(--em-light); }
    .del-opt h4 { font-size:13px; font-weight:700; color:var(--black); }
    .del-opt p  { font-size:12px; color:var(--g500); }

    /* ── Account ── */
    .account-layout { display:grid; grid-template-columns:260px 1fr; gap:40px; padding:96px 0; }
    .account-sidebar { position:sticky; top:80px; height:fit-content; background:var(--white); border:1px solid var(--g100); border-radius:20px; overflow:hidden; }
    .acct-profile { text-align:center; padding:32px; background:linear-gradient(135deg, var(--em-pale), var(--em-light)); }
    .acct-avatar { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg, var(--em-light), var(--em-mid)); display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:800; color:var(--em-dark); margin:0 auto 12px; border:3px solid var(--white); box-shadow:0 0 0 4px var(--em-light); }
    .acct-name { font-family:var(--font-d); font-size:16px; font-weight:800; color:var(--black); }
    .acct-email { font-size:12px; color:var(--g500); margin-top:3px; }
    .acct-nav { padding:10px; }
    .acct-nav-item {
      display:flex; align-items:center; gap:12px; padding:12px 14px;
      border-radius:12px; font-size:13px; font-weight:500; color:var(--g600);
      cursor:pointer; transition:all var(--tr); margin-bottom:2px; position:relative;
    }
    .acct-nav-item:hover { background:var(--g50); color:var(--black); }
    .acct-nav-item.active { background:var(--em-light); color:var(--em); font-weight:700; position:relative; }
    .acct-nav-item.active::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:16px; background:var(--em); border-radius:0 3px 3px 0; }
    .order-item { transition: box-shadow var(--tr); }
    .order-item:hover { box-shadow: 0 4px 20px rgba(0,0,0,.08); }

    /* ── Admin ── */
    .admin-wrap { display:flex; height:100vh; overflow:hidden; }
    .admin-sidebar {
      width:220px; min-width:220px; background:var(--em-pale); border-right:1px solid var(--g100);
      display:flex; flex-direction:column; transition:width var(--tr);
      overflow:hidden;
    }
    .admin-sidebar.collapsed { width:60px; min-width:60px; }
    .adm-logo { height:60px; display:flex; align-items:center; justify-content:flex-start; gap:12px; padding:0 16px; border-bottom:1px solid var(--g100); flex-shrink:0; }
    .adm-logo-img { height:32px; width:auto; max-width:min(148px, 100%); object-fit:contain; flex-shrink:0; display:block; }
    .admin-sidebar.collapsed .adm-logo { padding:0 10px; justify-content:center; }
    .admin-sidebar.collapsed .adm-logo-img { max-width:40px; height:28px; }
    .adm-nav { flex:1; padding:8px; overflow-y:auto; scrollbar-width:none; }
    .adm-nav::-webkit-scrollbar { display:none; }
    .adm-item {
      display:flex; align-items:center; gap:12px; padding:9px 12px;
      border-radius:8px; color:var(--g500); font-size:13px; font-weight:500;
      cursor:pointer; transition:all var(--tr); white-space:nowrap; overflow:hidden;
      margin-bottom:2px; position:relative; border:none; background:transparent; width:100%;
      font-family:var(--font-b);
    }
    .adm-item:hover { background:var(--em-light); color:var(--em-dark); }
    .adm-item.active { background:var(--em-light); color:var(--em); font-weight:600; }
    .adm-item.active::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:16px; background:var(--em); border-radius:0 2px 2px 0; }
    .adm-label { overflow:hidden; transition:opacity var(--tr), width var(--tr); }
    .admin-sidebar.collapsed .adm-label { opacity:0; width:0; }
    .adm-badge { margin-left:auto; background:var(--em); color:var(--white); font-size:10px; font-weight:800; padding:2px 6px; border-radius:50px; flex-shrink:0; transition:opacity var(--tr); }
    .admin-sidebar.collapsed .adm-badge { opacity:0; }
    .adm-section { font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:var(--g300); padding:10px 12px 6px; white-space:nowrap; transition:opacity var(--tr); }
    .admin-sidebar.collapsed .adm-section { opacity:0; }
    .adm-toggle { padding:14px 16px; border-top:1px solid var(--g100); display:flex; align-items:center; gap:12px; cursor:pointer; color:var(--g400); font-size:12px; flex-shrink:0; transition:color var(--tr); border-top-color:var(--g100); background:transparent; border-left:none; border-right:none; border-bottom:none; width:100%; font-family:var(--font-b); }
    .adm-toggle:hover { color:var(--em); }
    .admin-main { flex:1; display:flex; flex-direction:column; overflow:hidden; background:var(--dashboard-bg); }
    .admin-topbar { height:60px; background:rgba(255,255,255,.86); border-bottom:1px solid var(--g100); display:flex; align-items:center; padding:0 28px; gap:16px; flex-shrink:0; backdrop-filter: blur(12px) saturate(140%); }
    html.dark .admin-topbar { background: rgba(20,20,20,.82); border-bottom-color: var(--border); }
    .adm-topbar-title { font-size:16px; font-weight:800; color:var(--black); margin-right:auto; }
    .adm-topbar-sub { font-size:13px; font-weight:400; color:var(--g400); margin-left:6px; }
    .admin-content { flex:1; overflow-y:auto; padding:28px; }
    .admin-content::-webkit-scrollbar { width:5px; }
    .admin-content::-webkit-scrollbar-thumb { background:var(--g300); border-radius:50px; }
    .adm-page-section { animation:fadeUp .3s; }
    .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
    .kpi-card {
      padding:24px; border-radius:16px; background:var(--white);
      border:1px solid var(--g100); box-shadow:0 1px 4px rgba(0,0,0,.05);
      transition:all var(--tr);
    }
    .kpi-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.1); transform:translateY(-2px); border-top:2px solid var(--em); }
    .kpi-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; margin-bottom:16px; }
    .kpi-label { font-size:11px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--g500); margin-bottom:4px; }
    .kpi-value { font-family:var(--font-n); font-size:24px; font-weight:900; color:var(--black); line-height:1.1; }
    .kpi-delta { font-size:12px; font-weight:600; margin-top:6px; }
    .kpi-up { color:var(--em); } .kpi-down { color:var(--red); }
    .adm-card { background:var(--white); border-radius:16px; border:1px solid var(--g100); box-shadow:0 1px 4px rgba(0,0,0,.05); }
    .adm-card-pad { padding:20px 24px; }
    .adm-card-title { font-size:14px; font-weight:800; color:var(--black); margin-bottom:20px; }
    .adm-table { width:100%; border-collapse:collapse; }
    .adm-table th { font-size:10px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; color:var(--g400); padding:10px 14px; text-align:left; border-bottom:1.5px solid var(--g100); white-space:nowrap; }
    .adm-table td { padding:12px 14px; font-size:13px; color:var(--g600); border-bottom:1px solid var(--g100); vertical-align:middle; }
    .adm-table tr:last-child td { border-bottom:none; }
    .adm-table tr:hover td { background:var(--em-pale); }
    .adm-row { display:flex; gap:16px; margin-bottom:24px; }
    .adm-avatar { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,var(--em-light),var(--em-bright)); display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; color:var(--em-dark); }
    .inner-tabs { display:flex; gap:4px; background:var(--em-light); padding:4px; border-radius:8px; width:fit-content; margin-bottom:20px; }
    .inner-tab { padding:7px 16px; border-radius:6px; border:none; background:transparent; font-family:var(--font-b); font-size:13px; font-weight:500; color:var(--g500); cursor:pointer; transition:all var(--tr); }
    .inner-tab.active { background:var(--white); color:var(--em); font-weight:700; box-shadow:0 1px 4px rgba(0,0,0,.08); }
    .city-bar { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
    .city-name { width:80px; font-size:12px; color:var(--g600); text-align:right; flex-shrink:0; }
    .city-track { flex:1; height:7px; background:var(--g100); border-radius:50px; overflow:hidden; }
    .city-fill { height:100%; background:linear-gradient(90deg,var(--em),var(--em-bright)); border-radius:50px; }
    .city-val { width:55px; font-size:12px; font-weight:700; color:var(--black); }

    /* ── Toast ── */
    .toast {
      position:fixed; bottom:28px; right:28px; z-index:9999;
      background:var(--em-dark); color:var(--white);
      padding:14px 22px; border-radius:14px;
      font-size:13px; font-weight:600;
      display:flex; align-items:center; gap:10px;
      box-shadow:0 8px 32px rgba(0,0,0,.18);
      animation:toastIn .35s cubic-bezier(.4,0,.2,1) forwards;
    }
    .toast-icon { font-size:16px; }
    .toast-success { background: rgba(22,163,74,.16); color: var(--green); border: 1px solid rgba(22,163,74,.28); }
    .toast-error { background: rgba(217,64,64,.16); color: var(--red); border: 1px solid rgba(217,64,64,.28); }
    .toast-info { background: rgba(37,99,235,.14); color: var(--blue); border: 1px solid rgba(37,99,235,.24); }
    .toast-warning { background: rgba(201,124,26,.16); color: var(--amber); border: 1px solid rgba(201,124,26,.26); }

    /* ── Divider ── */
    .divider { height:1px; background:var(--g100); margin:20px 0; }

    /* ── Tabs ── */
    .tab-bar { display:flex; border-bottom:2px solid var(--g100); margin-bottom:28px; gap:4px; }
    .tab-btn {
      padding:12px 20px; font-size:13px; font-weight:600; font-family:var(--font-b);
      border:none; background:transparent; color:var(--g500); cursor:pointer;
      position:relative; transition:color var(--tr);
    }
    .tab-btn::after { content:''; position:absolute; bottom:-2px; left:0; right:100%; height:2px; background:var(--em); transition:right var(--tr); }
    .tab-btn.active { color:var(--em); }
    .tab-btn.active::after { right:0; }
    .tab-panel { display:none; animation:fadeIn .3s; }
    .tab-panel.active { display:block; }

    /* ── Coupon ── */
    .coupon-row { display:flex; gap:8px; }
    .coupon-chips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
    .coupon-chip { padding:5px 12px; border-radius:999px; border:1.5px dashed var(--em); color:var(--em); font-size:12px; font-weight:700; cursor:pointer; transition:all var(--tr); font-family:var(--font-b); background:transparent; }
    .coupon-chip:hover { background:var(--em-light); border-color:var(--em-dark); }

    /* ── Breadcrumb ── */
    .breadcrumb { font-size:12px; color:var(--g400); display:flex; align-items:center; gap:6px; margin-bottom:12px; }
    .breadcrumb span { cursor:pointer; color:var(--em); transition:color var(--tr); }
    .breadcrumb span:hover { color:var(--em-dark); }

    /* ── Admin: premium UI helpers ── */
    .adm-page-head { display:flex; align-items:flex-end; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-bottom:18px; }
    .adm-page-title { font-family:var(--font-d); font-size:20px; font-weight:900; color:var(--black); letter-spacing:-.02em; }
    .adm-page-sub { margin-top:4px; font-size:12px; color:var(--g500); }
    .adm-toolbar { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
    .adm-input-wrap { position:relative; }
    .adm-input-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--g400); font-size:14px; pointer-events:none; }
    .adm-input { padding-left:34px !important; }

    .adm-table thead th { position:sticky; top:0; background:var(--white); z-index:2; }
    html.dark .adm-table thead th { background: var(--card); border-bottom-color: var(--border); }
    .adm-table tbody tr:nth-child(even) td { background: rgba(0,0,0,.012); }
    html.dark .adm-table tbody tr:nth-child(even) td { background: rgba(255,255,255,.02); }
    .adm-table tbody tr:hover td { background: rgba(102,120,113,.1); }
    html.dark .adm-table tbody tr:hover td { background: rgba(102,120,113,.14); }

    .adm-pill {
      display:inline-flex; align-items:center; gap:6px;
      padding:6px 10px; border-radius:999px;
      font-size:12px; font-weight:800; letter-spacing:.02em;
      border:1px solid var(--g100);
      background:var(--g50); color:var(--g700);
      white-space:nowrap;
    }
    html.dark .adm-pill { border-color: var(--border); background: var(--surface); }
    .adm-pill-dot { width:7px; height:7px; border-radius:50%; background:var(--g300); }
    .adm-pill--ok { background: rgba(22,163,74,.10); color: var(--green); border-color: rgba(22,163,74,.25); }
    .adm-pill--warn { background: rgba(201,124,26,.10); color: var(--amber); border-color: rgba(201,124,26,.25); }
    .adm-pill--bad { background: rgba(217,64,64,.10); color: var(--red); border-color: rgba(217,64,64,.25); }
    .adm-pill--info { background: rgba(37,99,235,.10); color: var(--blue); border-color: rgba(37,99,235,.22); }

    .adm-empty {
      text-align:center; padding:46px 16px;
      color:var(--g500);
    }
    .adm-empty .ico { font-size:38px; margin-bottom:10px; opacity:.9; }
    .adm-empty .t { font-family:var(--font-d); font-weight:900; color:var(--black); font-size:16px; margin-bottom:6px; }
    .adm-empty .d { font-size:13px; line-height:1.6; max-width:420px; margin:0 auto; }

    .adm-skel-row { height:14px; border-radius:8px; background:linear-gradient(90deg, var(--g100) 25%, var(--g200) 50%, var(--g100) 75%); background-size:200% 100%; animation:shimmer 1.2s ease-in-out infinite; }
    .adm-skel-stack { display:grid; gap:10px; padding:14px 0; }

    .adm-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter: blur(6px); }
    .adm-modal {
      width:min(720px, 100%);
      max-height:90vh;
      display:flex;
      flex-direction:column;
      background:var(--white); border-radius:18px;
      border:1px solid var(--g100);
      box-shadow:0 28px 70px rgba(0,0,0,.28);
      overflow:hidden;
    }
    html.dark .adm-modal { border-color: var(--border); background: var(--card); }
    .adm-modal-head { padding:16px 18px; border-bottom:1px solid var(--g100); display:flex; align-items:center; justify-content:space-between; gap:12px; }
    html.dark .adm-modal-head { border-bottom-color: var(--border); }
    .adm-modal-title { font-family:var(--font-d); font-size:15px; font-weight:900; color:var(--black); }
    .adm-modal-body {
      padding:18px;
      overflow-y:auto;
      flex:1;
      min-height:0;
      max-height:calc(90vh - 120px);
    }
    .adm-modal-foot { padding:14px 18px; border-top:1px solid var(--g100); display:flex; justify-content:flex-end; gap:10px; }
    html.dark .adm-modal-foot { border-top-color: var(--border); }

    /* ── Mobile bottom nav ── */
    .mobile-bottom-nav {
      display:none; position:fixed; bottom:0; left:0; right:0; z-index:901;
      background:rgba(255,255,255,.96); backdrop-filter:blur(20px);
      border-top:1px solid var(--g100);
      padding:8px 0 max(8px, env(safe-area-inset-bottom));
      box-shadow:0 -4px 20px rgba(0,0,0,.08);
    }
    .mobile-bottom-nav-inner { display:flex; align-items:center; justify-content:space-around; }
    .mob-nav-btn {
      display:flex; flex-direction:column; align-items:center; gap:3px;
      padding:6px 12px; border-radius:12px; border:none; background:transparent;
      cursor:pointer; transition:all var(--tr); color:var(--g500); font-family:var(--font-b);
      min-width:56px;
    }
    .mob-nav-btn.active { color:var(--em); }
    .mob-nav-btn svg { transition:transform var(--tr); }
    .mob-nav-btn.active svg { transform:scale(1.15); }
    .mob-nav-label { font-size:10px; font-weight:600; letter-spacing:.02em; }
    .mob-cart-wrap { position:relative; }
    .mob-cart-badge { position:absolute; top:-4px; right:-4px; width:16px; height:16px; background:var(--em); border-radius:50%; font-size:9px; font-weight:800; color:var(--white); display:flex; align-items:center; justify-content:center; border:2px solid var(--white); }

    /* ── Mobile drawer overlay ── */
    .drawer-overlay {
      position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:950;
      backdrop-filter:blur(4px); animation:fadeIn .2s;
    }
    .drawer {
      position:fixed; top:0; left:0; bottom:0; width:min(300px, 85vw); z-index:951;
      background:var(--white); display:flex; flex-direction:column;
      animation:slideInLeft .3s cubic-bezier(.4,0,.2,1);
      box-shadow:8px 0 32px rgba(0,0,0,.15);
    }
    @keyframes slideInLeft {
      from { transform:translateX(-100%); }
      to   { transform:translateX(0); }
    }
    .drawer-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid var(--g100); }
    .drawer-close { width:32px; height:32px; border-radius:8px; border:1.5px solid var(--g200); background:transparent; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; }
    .drawer-links { display:flex; flex-direction:column; padding:16px 16px; gap:4px; flex:1; overflow-y:auto; }
    .drawer-link { display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:12px; font-family:var(--font-d); font-size:16px; font-weight:700; color:var(--black); cursor:pointer; transition:all var(--tr); }
    .drawer-link:hover, .drawer-link.active { background:var(--em-light); color:var(--em); }
    .drawer-link .link-icon { font-size:18px; }

    /* ── responsive ── */
    @media (max-width:1024px) {
      .hero-section { grid-template-columns:1fr; }
      .hero-right { display:none; }
      .cat-grid { grid-template-columns:repeat(2,1fr); }
      .products-grid { grid-template-columns:repeat(2,1fr); }
      .why-grid { grid-template-columns:repeat(2,1fr); }
      .testimonial-grid { grid-template-columns:repeat(2,1fr); }
      .plp-layout { grid-template-columns:1fr; }
      .filter-sidebar { display:none; }
      .plp-grid { grid-template-columns:repeat(2,1fr); }
      .pdp-layout { grid-template-columns:1fr; }
      .cart-layout, .checkout-grid { grid-template-columns:1fr; }
      .account-layout { grid-template-columns:1fr; }
      .footer-grid { grid-template-columns:1fr 1fr; }
      .kpi-grid { grid-template-columns:repeat(2,1fr); }
      /* About / Contact */
      .about-mission-grid { grid-template-columns:1fr !important; gap:32px !important; }
      .contact-grid { grid-template-columns:1fr !important; }
      .stats-grid { grid-template-columns:repeat(2,1fr) !important; }
    }

    /* ── Mobile filter sheet ── */
    .filter-sheet-btn {
      display:none; align-items:center; gap:8px;
      padding:10px 18px; border-radius:10px;
      border:1.5px solid var(--g200); background:var(--white);
      font-family:var(--font-b); font-size:13px; font-weight:600;
      color:var(--g700); cursor:pointer; transition:all var(--tr);
    }
    .filter-sheet-btn:hover { border-color:var(--em); color:var(--em); }
    .filter-sheet-overlay {
      position:fixed; inset:0; background:rgba(0,0,0,.5);
      z-index:970; backdrop-filter:blur(4px); animation:fadeIn .2s;
    }
    .filter-sheet {
      position:fixed; left:0; right:0; bottom:0; z-index:971;
      background:var(--white); border-radius:24px 24px 0 0;
      padding:0 0 max(24px, env(safe-area-inset-bottom));
      max-height:82vh; overflow-y:auto;
      animation:slideUpSheet .3s cubic-bezier(.4,0,.2,1);
    }
    @keyframes slideUpSheet {
      from { transform:translateY(100%); }
      to   { transform:translateY(0); }
    }
    .filter-sheet-handle { width:40px; height:4px; background:var(--g200); border-radius:2px; margin:14px auto 0; }
    .filter-sheet-header { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid var(--g100); }
    .filter-sheet-title { font-family:var(--font-d); font-size:16px; font-weight:800; color:var(--black); }
    .filter-sheet-body { padding:16px 20px; }

    /* ── PDP sticky mobile CTA ── */
    .pdp-sticky-cta {
      display:none; position:fixed; bottom:0; left:0; right:0; z-index:800;
      background:rgba(255,255,255,.97); backdrop-filter:blur(16px);
      border-top:1px solid var(--g100);
      padding:12px 16px max(12px, env(safe-area-inset-bottom));
      box-shadow:0 -4px 20px rgba(0,0,0,.08);
    }
    .pdp-sticky-inner { display:flex; gap:10px; align-items:center; }
    .pdp-sticky-price { font-family:var(--font-n); font-size:20px; font-weight:800; color:var(--black); flex-shrink:0; }

    /* ── Mobile scrollable table wrapper ── */
    .table-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; border-radius:12px; }
    .table-scroll .adm-table { min-width:600px; }

    /* ── Mobile-optimised product card wishlist (always show on touch) ── */
    @media (hover:none) {
      .wish-btn { opacity:1; transform:scale(1); }
      .product-card:hover { transform:none; box-shadow:none; }
      .product-card:active { transform:scale(.98); }
      .cat-card:hover { transform:none; box-shadow:none; }
      .cat-card:active { transform:scale(.98); box-shadow:0 12px 28px rgba(0,0,0,.15); }
      .why-card:hover { transform:none; background:rgba(255,255,255,.05); }
      .testi-card:hover { transform:none; box-shadow:none; }
    }

    @media (max-width:768px) {
      :root { --ui-scale: 1.03; }

      .home-page .hero-heading { font-size:clamp(38px,10vw,54px); }
      .home-page .hero-sub { font-size:15px; }
      .home-page .hero-stat h3 { font-size:23px; }
      .home-page .section-title { font-size:clamp(24px,6.5vw,36px); }
      .home-page .section-desc { font-size:14px; }
      .home-page .cat-body h3 { font-size:14px; }
      .home-page .cat-body p { font-size:12px; }
      .home-page .product-name { font-size:14px; }
      .home-page .product-price { font-size:16px; }
      .home-page .why-card h3 { font-size:14px; }
      .home-page .why-card p { font-size:12px; }
      .home-page .testi-text { font-size:14px; }

      .about-page .section-title { font-size:clamp(26px,7vw,38px); }
      .about-page .section-label { font-size:11px; }
      .about-page .btn { font-size:13px; }

      /* Layout */
      .mobile-bottom-nav { display:block; }
      body { padding-bottom:72px; }

      /* Navbar */
      .navbar { padding:0 16px; height:56px; }
      .nav-links { display:none; }
      .nav-icon-btn.desktop-only { display:none; }
      .btn.desktop-only { display:none; }
      .nav-hamburger { display:flex !important; }

      /* Hero */
      .hero-section { min-height:auto; padding-top:56px; }
      .hero-left { padding:36px 20px 52px; }
      .hero-heading { font-size:clamp(34px,9vw,50px); line-height:1.05; }
      .hero-sub { font-size:14px; margin-bottom:24px; line-height:1.65; }
      .hero-cta { flex-direction:column; gap:10px; }
      .hero-cta .btn { width:100%; justify-content:center; font-size:14px; padding:13px 24px; }
      .hero-stats { gap:0; justify-content:space-between; border-top:1px solid var(--g100); padding-top:24px; }
      .hero-stat { flex:1; text-align:center; }
      .hero-stat h3 { font-size:22px; }
      .hero-stat p { font-size:11px; }

      /* Section */
      .section-pad { padding:48px 0; }
      .container { padding:0 16px; }
      .section-title { font-size:clamp(22px,6vw,32px); }
      .section-header { margin-bottom:28px; }
      .section-desc { font-size:13px; }

      /* Trust bar: horizontal scroll */
      .trust-bar { padding:0; overflow-x:auto; -webkit-overflow-scrolling:touch; }
      .trust-pills { display:flex; flex-wrap:nowrap; gap:0; padding:14px 16px; width:max-content; }
      .trust-pill { white-space:nowrap; padding:8px 14px; background:var(--g50); border-radius:999px; border:1px solid var(--g100); font-size:12px; }

      /* Categories */
      .cat-grid { grid-template-columns:1fr 1fr; gap:10px; }
      .cat-card { aspect-ratio:1; border-radius:16px; }
      .cat-emoji { font-size:46px; }
      .cat-body { padding:16px; }
      .cat-body h3 { font-size:13px; }
      .cat-body p { font-size:11px; }
      .cat-arrow { width:26px; height:26px; font-size:12px; top:10px; right:10px; }

      /* Products */
      .products-grid { grid-template-columns:1fr 1fr; gap:10px; }
      .product-price { font-size:15px; }
      .product-body { padding:12px; }
      .product-name { font-size:13px; }
      .wish-btn { opacity:1; transform:scale(1); width:28px; height:28px; font-size:12px; }
      .product-emoji { font-size:44px; }
      .add-btn { padding:7px 11px; font-size:11px; }

      /* Why */
      .why-grid { grid-template-columns:1fr 1fr; gap:10px; }
      .why-card { padding:20px 14px; border-radius:16px; }
      .why-icon { font-size:26px; margin-bottom:10px; }
      .why-card h3 { font-size:13px; }
      .why-card p { font-size:11px; }

      /* Testimonials */
      .testimonial-grid { grid-template-columns:1fr; gap:12px; }
      .testi-card { padding:20px; }

      /* PLP */
      .plp-header { padding:68px 16px 20px; }
      .plp-header h1 { font-size:clamp(22px,7vw,34px); }
      .plp-grid { grid-template-columns:1fr 1fr; gap:10px; }
      .plp-layout { padding:16px 0 64px; }
      .sort-bar { gap:10px; }
      .sort-bar p { font-size:12px; }
      .filter-sheet-btn { display:flex; }
      .filter-sidebar { display:none !important; }

      /* PDP */
      .pdp-layout { gap:20px; padding:16px 0 120px; }
      .gallery-main { border-radius:16px; }
      .gallery-emoji { font-size:72px; }
      .g-thumb { width:56px; height:56px; border-radius:10px; font-size:22px; }
      .pdp-name { font-size:clamp(20px,5vw,26px); }
      .pdp-price { font-size:24px; }
      .pdp-price-orig { font-size:15px; }
      .pdp-cta { display:none; }
      .pdp-sticky-cta { display:block; }
      .spec-grid { grid-template-columns:1fr 1fr; gap:8px; }
      .spec-item { padding:12px; }

      /* Cart */
      .cart-layout { grid-template-columns:1fr; gap:16px; padding:20px 0 80px; }
      .cart-item { padding:14px 12px; gap:12px; }
      .cart-item-img { width:60px; height:60px; border-radius:10px; font-size:26px; }
      .order-summary { position:static; border-radius:16px; padding:20px; }
      .coupon-row { flex-direction:column; }
      .coupon-row .btn { width:100%; }

      /* Checkout */
      .checkout-grid { grid-template-columns:1fr; gap:14px; padding:20px 0 80px; }
      .checkout-section { padding:18px 14px; border-radius:16px; margin-bottom:14px; }
      .section-heading { font-size:15px; }
      .form-row2 { grid-template-columns:1fr; gap:10px; }
      .pay-tabs { width:100%; }
      .pay-tab { flex:1; text-align:center; padding:10px 8px; font-size:12px; }
      .upi-apps { gap:8px; }
      .upi-app { padding:8px 12px; font-size:12px; }

      /* Account */
      .account-layout { grid-template-columns:1fr; gap:14px; padding:20px 0 80px; }
      .account-sidebar { position:static; border-radius:16px; overflow:visible; }
      .acct-profile { padding:24px 20px; border-radius:16px 16px 0 0; }
      .acct-avatar { width:60px; height:60px; font-size:22px; }
      .acct-name { font-size:15px; }
      .acct-nav { display:flex; gap:6px; padding:10px 10px 14px; overflow-x:auto; -webkit-overflow-scrolling:touch; flex-wrap:nowrap; scrollbar-width:none; }
      .acct-nav::-webkit-scrollbar { display:none; }
      .acct-nav-item { flex-shrink:0; flex-direction:column; gap:4px; padding:10px 14px; text-align:center; font-size:12px; border-radius:12px; min-width:64px; margin-bottom:0; min-height:56px; }

      /* Footer */
      .footer { padding:40px 16px 80px; }
      .footer-grid { grid-template-columns:1fr; gap:24px; }
      .footer-logo { font-size:22px; }
      .footer-bottom { flex-direction:column; gap:10px; text-align:center; }
      .footer-bottom span:last-child { display:flex; flex-wrap:wrap; justify-content:center; gap:6px; }

      /* Admin */
      .admin-wrap { flex-direction:column; height:100dvh; }
      .admin-sidebar { display:none; }
      .admin-sidebar.mobile-open { display:flex; position:fixed; top:0; left:0; bottom:0; z-index:960; width:260px; animation:slideInLeft .3s; }
      .admin-topbar { padding:0 12px; gap:8px; }
      .adm-topbar-title { font-size:13px; }
      .admin-content { padding:12px; }
      .kpi-grid { grid-template-columns:1fr 1fr; gap:8px; }
      .kpi-card { padding:14px; border-radius:12px; }
      .kpi-icon { width:32px; height:32px; font-size:15px; margin-bottom:10px; }
      .kpi-value { font-size:17px; }
      .kpi-delta { font-size:11px; }
      .adm-row { flex-direction:column; }
      .adm-card-pad { padding:14px 16px; }
      .adm-mob-menu { display:flex !important; }
      .inner-tabs { overflow-x:auto; -webkit-overflow-scrolling:touch; width:100%; }
      .inner-tab { white-space:nowrap; }

      /* Toast: above bottom nav */
      .toast { bottom:80px; right:12px; left:12px; font-size:12px; padding:12px 16px; }
    }

    @media (max-width:480px) {
      .hero-heading { font-size:clamp(30px,9vw,42px); }
      .products-grid { gap:8px; }
      .plp-grid { gap:8px; }
      .cat-grid { gap:8px; }
      .why-grid { gap:8px; }
      .hero-stat h3 { font-size:19px; }
      .kpi-grid { gap:6px; }
    }

    @media (max-width:360px) {
      .hero-heading { font-size:28px; }
      .container { padding:0 12px; }
      .product-body { padding:10px; }
      .add-btn { padding:6px 8px; font-size:10px; }
      .product-price { font-size:13px; }
    }
  `;
  document.head.appendChild(style);
}
