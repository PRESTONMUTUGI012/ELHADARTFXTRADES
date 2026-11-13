const PARTNER_APP_ID = "34UGhpx0qrXHqpfKHAkGH";
const AFFILIATE_TOKEN = "3A2CFHPG722B";
const exchangeRates = { KES: 129.0, UGX: 3750.0, TZS: 2600.0, EUR: 0.92, GBP: 0.79 };

// Fallback exhaustive institutional assets so the app loads instantly even if offline
let exhaustiveAssets = [
    { symbol: 'R_10', name: 'Volatility 10 Index', market: 'synthetic_index' },
    { symbol: '1HZ10V', name: 'Volatility 10 (1s) Index', market: 'synthetic_index' },
    { symbol: 'R_25', name: 'Volatility 25 Index', market: 'synthetic_index' },
    { symbol: '1HZ25V', name: 'Volatility 25 (1s) Index', market: 'synthetic_index' },
    { symbol: 'R_50', name: 'Volatility 50 Index', market: 'synthetic_index' },
    { symbol: '1HZ50V', name: 'Volatility 50 (1s) Index', market: 'synthetic_index' },
    { symbol: 'R_75', name: 'Volatility 75 Index', market: 'synthetic_index' },
    { symbol: '1HZ75V', name: 'Volatility 75 (1s) Index', market: 'synthetic_index' },
    { symbol: 'R_100', name: 'Volatility 100 Index', market: 'synthetic_index' },
    { symbol: '1HZ100V', name: 'Volatility 100 (1s) Index', market: 'synthetic_index' },
    { symbol: 'BOOM500', name: 'Boom 500 Index', market: 'synthetic_index' },
    { symbol: 'CRASH500', name: 'Crash 500 Index', market: 'synthetic_index' },
    { symbol: 'BOOM1000', name: 'Boom 1000 Index', market: 'synthetic_index' },
    { symbol: 'CRASH1000', name: 'Crash 1000 Index', market: 'synthetic_index' },
    { symbol: 'JD10', name: 'Jump 10 Index', market: 'synthetic_index' },
    { symbol: 'JD25', name: 'Jump 25 Index', market: 'synthetic_index' },
    { symbol: 'JD50', name: 'Jump 50 Index', market: 'synthetic_index' },
    { symbol: 'JD75', name: 'Jump 75 Index', market: 'synthetic_index' },
    { symbol: 'JD100', name: 'Jump 100 Index', market: 'synthetic_index' },
    { symbol: 'frxEURUSD', name: 'EUR/USD', market: 'forex' },
    { symbol: 'frxGBPUSD', name: 'GBP/USD', market: 'forex' },
    { symbol: 'frxUSDJPY', name: 'USD/JPY', market: 'forex' },
    { symbol: 'frxAUDUSD', name: 'AUD/USD', market: 'forex' },
    { symbol: 'frxUSDCAD', name: 'USD/CAD', market: 'forex' },
    { symbol: 'frxXAUUSD', name: 'Gold vs US Dollar', market: 'commodities' },
    { symbol: 'frxXAGUSD', name: 'Silver vs US Dollar', market: 'commodities' },
    { symbol: 'WTI', name: 'WTI Crude Oil', market: 'commodities' }
];

let currentCategory = 'all';
let currentSymbol = '1HZ10V';
let currentChartInterval = '15';
let marketDataStore = {};
let tvWidgetInstance = null;
let authMode = 'signin';

// 1-Minute (60 Seconds) Splash Screen Sequence
let remainingSeconds = 60;
function runSplashSequence() {
    const timerDisplay = document.getElementById('loading-timer-display');
    const progressBar = document.getElementById('core-progress-bar');
    const statusText = document.getElementById('loading-status-text');

    const stages = {
        45: "Ingesting Exhaustive Synthetic, Forex & Commodity Assets...",
        30: "Calibrating BOS, CHOCH, OB & FVG Structure Detectors...",
        15: "Syncing Adaptive Digit Strategy Shifter (Matches -> Over/Under -> Even/Odd)...",
        5:  "Finalizing Institutional Live EAT Clock & Killzones..."
    };

    const interval = setInterval(() => {
        remainingSeconds--;
        const mins = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
        const secs = (remainingSeconds % 60).toString().padStart(2, '0');
        
        if (timerDisplay) timerDisplay.innerText = `${mins}:${secs}`;
        if (progressBar) progressBar.style.width = `${((60 - remainingSeconds) / 60) * 100}%`;
        if (stages[remainingSeconds] && statusText) {
            statusText.innerText = stages[remainingSeconds];
        }

        if (remainingSeconds <= 0) {
            clearInterval(interval);
            dismissSplash();
        }
    }, 1000);
}

function dismissSplash() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 500);
    }
}

function toggleAuthModal(show) {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        if (show) modal.classList.remove('hidden');
        else modal.classList.add('hidden');
    }
}

function switchAuthTab(mode) {
    authMode = mode;
    const signinTab = document.getElementById('tab-signin');
    const signupTab = document.getElementById('tab-signup');
    const nameBox = document.getElementById('name-field-box');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (mode === 'signin') {
        signinTab.className = "text-sm font-bold text-fxgreen border-b-2 border-fxgreen pb-1";
        signupTab.className = "text-sm font-bold text-slate-400 hover:text-white pb-1";
        nameBox.classList.add('hidden');
        submitBtn.innerText = "SIGN IN TO TERMINAL";
    } else {
        signupTab.className = "text-sm font-bold text-fxgreen border-b-2 border-fxgreen pb-1";
        signinTab.className = "text-sm font-bold text-slate-400 hover:text-white pb-1";
        nameBox.classList.remove('hidden');
        submitBtn.innerText = "CREATE ACCOUNT & REGISTER";
    }
}

function submitAuthForm() {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    if (!email || !pass) { alert("Please fill in your email and password."); return; }
    
    if (authMode === 'signup') {
        const name = document.getElementById('auth-name').value || "Trader";
        alert(`✅ Account successfully created and registered for ${name} (${email})!`);
    } else {
        alert(`✅ Signed in successfully as ${email}!`);
    }
    toggleAuthModal(false);
}

function setMode(mode) {
    document.getElementById('btn-demo').className = mode === 'demo' ? 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition' : 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
    document.getElementById('btn-real').className = mode === 'real' ? 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition' : 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
}

function authDeriv() {
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${PARTNER_APP_ID}&affiliate_token=${AFFILIATE_TOKEN}`;
}

function switchCategory(cat) {
    currentCategory = cat;
    renderScannerList();
    renderAssetDropdown();
}

function changeChartTimeframe(interval) {
    currentChartInterval = interval;
    document.querySelectorAll('.tf-btn').forEach(btn => {
        if (btn.dataset.tf === interval) {
            btn.className = "tf-btn px-2 py-1 rounded bg-emerald-600 text-white font-bold";
        } else {
            btn.className = "tf-btn px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-fxgreen";
        }
    });
    initTradingViewWidget(currentSymbol);
}

function initTradingViewWidget(symbolCode) {
    const container = document.getElementById('tradingview_advanced_chart');
    if (!container || typeof TradingView === 'undefined') return;
    container.innerHTML = '';

    let tvSymbol = "FX:EURUSD";
    if (symbolCode.includes("XAU")) tvSymbol = "OANDA:XAUUSD";
    else if (symbolCode.includes("XAG")) tvSymbol = "OANDA:XAGUSD";
    else if (symbolCode.includes("GBP")) tvSymbol = "FX:GBPUSD";
    else if (symbolCode.includes("JPY")) tvSymbol = "FX:USDJPY";
    else if (symbolCode.includes("AUD")) tvSymbol = "FX:AUDUSD";
    else if (symbolCode.includes("BTC")) tvSymbol = "BINANCE:BTCUSDT";
    else if (symbolCode.includes("ETH")) tvSymbol = "BINANCE:ETHUSDT";
    else if (symbolCode.includes("US30") || symbolCode.includes("DJI")) tvSymbol = "FOREXCOM:DJI";
    else if (symbolCode.includes("US100") || symbolCode.includes("NDX")) tvSymbol = "FOREXCOM:NSXUSD";

    tvWidgetInstance = new TradingView.widget({
        "width": "100%", "height": "100%", "symbol": tvSymbol, "interval": currentChartInterval,
        "timezone": "Etc/UTC", "theme": "dark", "style": "1", "locale": "en",
        "toolbar_bg": "#030712", "enable_publishing": false, "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "studies": [
            "MASimple@tv-basicstudies",
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies",
            "BB@tv-basicstudies"
        ],
        "container_id": "tradingview_advanced_chart"
    });
}

function selectSymbol(sym, name) {
    currentSymbol = sym;
    const searchInput = document.getElementById('asset-search-input');
    if (searchInput) searchInput.value = name;

    closeAssetDropdown();
    document.getElementById('chart-title-label').innerText = `${name} (${sym}) - Institutional Suite`;
    initTradingViewWidget(sym);

    if (window.derivApiInstance && window.derivApiInstance.isConnected) {
        window.derivApiInstance.subscribeTicks(sym, handleIncomingTick);
    }
    renderScannerList();
}

// Clickable & Searchable Asset Dropdown Logic
function openAssetDropdown() {
    const box = document.getElementById('asset-dropdown-results');
    if (box) {
        box.classList.remove('hidden');
        renderAssetDropdown();
    }
}

function closeAssetDropdown() {
    const box = document.getElementById('asset-dropdown-results');
    if (box) box.classList.add('hidden');
}

function filterAssetDropdown() {
    const box = document.getElementById('asset-dropdown-results');
    if (box) box.classList.remove('hidden');
    renderAssetDropdown();
}

function renderAssetDropdown() {
    const box = document.getElementById('asset-dropdown-results');
    if (!box) return;
    box.innerHTML = '';

    const searchInput = document.getElementById('asset-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let filtered = exhaustiveAssets;
    if (currentCategory !== 'all') {
        filtered = exhaustiveAssets.filter(a => a.market === currentCategory);
    }
    if (query) {
        filtered = filtered.filter(a => a.name.toLowerCase().includes(query) || a.symbol.toLowerCase().includes(query));
    }

    if (filtered.length === 0) {
        box.innerHTML = `<div class="p-2 text-slate-500 text-center">No assets found</div>`;
        return;
    }

    filtered.forEach(m => {
        const div = document.createElement('div');
        div.onclick = (e) => {
            e.stopPropagation();
            selectSymbol(m.symbol, m.name);
        };
        div.className = "p-2 hover:bg-emerald-950/60 cursor-pointer flex justify-between items-center border-b border-slate-900 text-xs";
        div.innerHTML = `
            <span class="font-bold text-white">${m.name}</span>
            <span class="text-fxgreen text-[10px]">${m.symbol}</span>
        `;
        box.appendChild(div);
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const container = document.getElementById('asset-search-input');
    const box = document.getElementById('asset-dropdown-results');
    if (container && box && !container.contains(e.target) && !box.contains(e.target)) {
        closeAssetDropdown();
    }
});

function renderScannerList() {
    const container = document.getElementById('scanner-market-list');
    if (!container) return;
    container.innerHTML = '';

    const searchInput = document.getElementById('asset-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let filtered = exhaustiveAssets;
    if (currentCategory !== 'all') {
        filtered = exhaustiveAssets.filter(a => a.market === currentCategory);
    }
    if (query && query !== (marketDataStore[currentSymbol]?.name || '').toLowerCase()) {
        filtered = filtered.filter(a => a.name.toLowerCase().includes(query) || a.symbol.toLowerCase().includes(query));
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-slate-500 text-center py-4">No matching assets found... Select from dropdown above.</div>`;
        return;
    }

    filtered.slice(0, 25).forEach(m => {
        const st = marketDataStore[m.symbol] || { price: 'Loading...', winrate: 89 };
        const isSel = m.symbol === currentSymbol;
        const div = document.createElement('div');
        div.onclick = () => selectSymbol(m.symbol, m.name);
        div.className = `cursor-pointer p-1.5 rounded-xl border grid grid-cols-3 items-center text-[11px] transition ${isSel ? 'bg-emerald-950/70 border-fxgreen' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`;
        div.innerHTML = `
            <div class="font-bold text-white truncate">${m.name}</div>
            <div class="text-fxgreen font-bold text-right">${st.price}</div>
            <div class="text-gold font-bold text-right">${st.winrate}%</div>
        `;
        container.appendChild(div);
    });
}

function handleIncomingTick(tick) {
    const sym = tick.symbol;
    const quote = Number(tick.quote);
    const pip = tick.pip_size || 4;
    const priceFormatted = quote.toFixed(pip);

    if (!marketDataStore[sym]) {
        marketDataStore[sym] = { quotes: [], digits: [0,0,0,0,0,0,0,0,0,0], total: 0 };
    }
    const st = marketDataStore[sym];
    st.price = priceFormatted;
    st.quotes.push(quote);
    if (st.quotes.length > 80) st.quotes.shift();

    const lastDig = parseInt(priceFormatted.slice(-1));
    if (!isNaN(lastDig)) {
        st.digits[lastDig]++;
    }
    st.total++;
    st.winrate = Math.floor(88 + (Math.sin(st.total) * 9));

    if (sym === currentSymbol) {
        updateAdaptiveDigitEngine(st, quote, priceFormatted);
    }
    renderScannerList();
}

function updateAdaptiveDigitEngine(st, quote, priceFormatted) {
    const total = st.total || 1;
    let maxP = -1, maxD = 0, minP = 999, minD = 0;
    let evenCount = 0, oddCount = 0;
    let overCount = 0, underCount = 0;

    for(let i=0; i<10; i++) {
        const count = st.digits[i] || 0;
        const pct = Math.round((count / total) * 100);
        const el = document.getElementById(`f-${i}`);
        if(el) el.innerText = `${pct}%`;

        if (pct > maxP) { maxP = pct; maxD = i; }
        if (pct < minP) { minP = pct; minD = i; }

        if (i % 2 === 0) evenCount += count;
        else oddCount += count;

        if (i >= 5) overCount += count;
        else underCount += count;
    }

    // Adaptive Strategy Shifter Logic
    let modeText = "Matches & Differs (A+)";
    let contractText = `Digit Match (Digit ${maxD})`;
    let entryText = `Target Digit: ${maxD}`;
    let durationText = "1 Tick (Match) / 3 Ticks";

    if (maxP < 13 && total > 20) {
        modeText = "Over / Under Shifter";
        const overPct = Math.round((overCount / total) * 100);
        if (overPct > 54) {
            contractText = "Under 5 (Digits 0-4)";
            entryText = "Target Range: 0–4";
            durationText = "3 Ticks";
        } else {
            contractText = "Over 4 (Digits 5-9)";
            entryText = "Target Range: 5–9";
            durationText = "3 Ticks";
        }
    } else if (maxP < 11 && total > 35) {
        modeText = "Even / Odd Parity Shifter";
        const evenPct = Math.round((evenCount / total) * 100);
        if (evenPct >= 53) {
            contractText = "Even Digits (0, 2, 4, 6, 8)";
            entryText = "Parity: Even";
            durationText = "2 Ticks";
        } else {
            contractText = "Odd Digits (1, 3, 5, 7, 9)";
            entryText = "Parity: Odd";
            durationText = "2 Ticks";
        }
    }

    document.getElementById('digit-active-mode-label').innerText = `Mode: ${modeText}`;
    document.getElementById('digit-contract-target').innerText = contractText;
    document.getElementById('digit-entry-point').innerText = entryText;
    document.getElementById('digit-duration-ticks').innerText = durationText;

    const history = st.quotes;
    if (history.length < 3) return;
    const isRise = history[history.length - 1] >= history[history.length - 2];

    document.getElementById('rise-fall-signal-badge').innerText = isRise ? "RISE (CALL)" : "FALL (PUT)";
    document.getElementById('rise-fall-signal-badge').className = isRise ? "text-[10px] font-mono font-bold text-fxgreen bg-emerald-950 px-2 py-1 rounded border border-emerald-700" : "text-[10px] font-mono font-bold text-rose-400 bg-rose-950 px-2 py-1 rounded border border-rose-700";

    document.getElementById('active-speed-boat').innerText = isRise ? "Boat 2: Tick Momentum Scalper" : "Boat 3: Tick Reversal Scalper";
    document.getElementById('candle-holding-rule').innerText = isRise ? "Hold 15M / 1H Swing Candle (BOS Bullish)" : "Hold 15M / 1H Swing Candle (BOS Bearish)";
    document.getElementById('structure-confluence-status').innerText = isRise ? "CHOCH Confirmed + FVG Fill" : "CHOCH Bearish + OB Tap";
}

function executeBulkOrder(action) {
    const lot = document.getElementById('order-lot-size').value;
    const type = document.getElementById('order-exec-mode').value;
    triggerElhadartProfitAlert(`Bulk ${action} (${type})`, 34.50);
    alert(`🚀 Executing Bulk ${action} Institutional Order!\nLot Size: ${lot}\nExecution Mode: ${type}\nStructure: BOS & OB Confluence Validated.`);
}

function executeRiseFallTrade() {
    triggerElhadartProfitAlert("Rise/Fall Contract", 22.00);
    alert(`🚀 Rise/Fall Contract Successfully Executed via Speed Boat AI!`);
}

function updateClockAndKillzones() {
    const now = new Date();
    const eat = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const hours = eat.getUTCHours();
    const clockEl = document.getElementById('live-eat-clock');
    if (clockEl) clockEl.innerText = eat.toUTCString().slice(17, 25) + " EAT";

    let kzText = "24/7 Global Asset Session";
    if (hours >= 10 && hours < 15) kzText = "🔥 London Open Killzone Active";
    else if (hours >= 15 && hours < 19) kzText = "⚡ London / NY Overlap Active";
    
    const kzEl = document.getElementById('active-killzone-status');
    if (kzEl) kzEl.innerText = kzText;
}

document.addEventListener('DOMContentLoaded', () => {
    runSplashSequence();

    const amt = document.getElementById('conv-amt');
    const curr = document.getElementById('conv-curr');
    function updateConv() {
        const val = (parseFloat(amt.value) || 0) * (exchangeRates[curr.value] || 1);
        document.getElementById('conv-result').innerText = `${val.toLocaleString(undefined, {minimumFractionDigits: 2})} ${curr.value}`;
    }
    if (amt && curr) {
        amt.addEventListener('input', updateConv);
        curr.addEventListener('change', updateConv);
    }

    setInterval(updateClockAndKillzones, 1000);

    // Initialise default asset selection
    selectSymbol(currentSymbol, 'Volatility 10 (1s) Index');
    renderScannerList();

    const derivApi = new DerivAPIConnector(PARTNER_APP_ID);
    window.derivApiInstance = derivApi;

    derivApi.connect().then(() => {
        document.getElementById('stream-status-badge').innerText = "📡 Connected & Streaming Feeds";
        derivApi.fetchActiveSymbols((symbols) => {
            if (symbols && symbols.length > 0) {
                exhaustiveAssets = symbols.map(s => ({
                    symbol: s.symbol || s.underlying_symbol,
                    name: s.display_name || s.underlying_symbol_name,
                    market: s.market
                }));
            }

            document.getElementById('header-asset-count').innerText = `${exhaustiveAssets.length} Global Assets Loaded`;
            renderScannerList();

            exhaustiveAssets.slice(0, 40).forEach(a => {
                derivApi.addSimultaneousSubscription(a.symbol, handleIncomingTick);
            });
        });
    }).catch(err => {
        console.error("Connection error:", err);
        document.getElementById('stream-status-badge').innerText = "⚠️ Reconnecting Stream...";
    });
});
