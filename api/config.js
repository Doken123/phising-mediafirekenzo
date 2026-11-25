export default async function handler(req, res) {
    // Domain setting lu
    res.setHeader("Access-Control-Allow-Origin", "https://websetting.my.id"); 
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    // URL & Key Supabase lu
    const SUPABASE_URL = "https://djradeolrbjmgoxxbdlj.supabase.co"; 
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcmFkZW9scmJqbWdveHhiZGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1OTA0NDQsImV4cCI6MjExMTE2NjQ0NH0.RvLrul0eFafGUcOn_9ORB8xh3IaP4n1FAsEmqXnrXCA";     
    
    const headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
    };

    if (req.method === "GET") {
        try {
            const rConfig = await fetch(`${SUPABASE_URL}/rest/v1/web_config?id=eq.1&select=*`, { headers });
            const configData = await rConfig.json();

            const rLogs = await fetch(`${SUPABASE_URL}/rest/v1/logs_result?select=created_at`, { headers });
            const logs = await rLogs.json();

            const today = new Date();
            today.setHours(0,0,0,0);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let hariIni = 0;
            let kemarin = 0;
            
            if(Array.isArray(logs)) {
                logs.forEach(log => {
                    const logDate = new Date(log.created_at);
                    if (logDate >= today) hariIni++;
                    else if (logDate >= yesterday && logDate < today) kemarin++;
                });
            }

            const finalData = {
                ...(configData[0] || {}),
                stat_hari_ini: hariIni,
                stat_kemarin: kemarin,
                stat_total: logs.length || 0
            };

            return res.status(200).json(finalData);
        } catch (e) { return res.status(500).json({ error: e.message }); }
    }

    if (req.method === "POST") {
        try {
            const r = await fetch(`${SUPABASE_URL}/rest/v1/web_config?id=eq.1`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({
                    email_tujuan: req.body.email_tujuan,
                    banner_url: req.body.banner_url,
                    footer_text: req.body.footer_text,
                    nama_ress: req.body.nama_ress
                })
            });
            if (!r.ok) throw new Error(await r.text());
            return res.status(200).json({ success: true, message: "SETTING KESIMPEN ANJING!" });
        } catch (e) { return res.status(500).json({ error: e.message }); }
    }
    return res.status(405).end();
}
