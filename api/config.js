export default async function handler(req, res) {
    // ==========================================
    // 1. SET HEADER CORS (BIAR GA ERROR LOAD FAILED)
    // ==========================================
    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // ==========================================
    // 2. HANDLE PREFLIGHT REQUEST (WAJIB BUAT POST)
    // ==========================================
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // ==========================================
    // 3. URL & KEY SUPABASE LU
    // ==========================================
    const SUPABASE_URL = "https://djradeolrbjmgoxxbdlj.supabase.co"; 
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcmFkZW9scmJqbWdveHhiZGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1OTA0NDQsImV4cCI6MjExMTE2NjQ0NH0.RvLrul0eFafGUcOn_9ORB8xh3IaP4n1FAsEmqXnrXCA";     
    
    const headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
    };

    // --- TAMBAHAN MULTI-TENANT ---
    // Ambil web_id dari URL (?web_id=kenzo_01)
    const WEB_ID = req.query.web_id || "web_default"; 
    // -----------------------------

    if (req.method === "GET") {
        try {
            // Ambil Config berdasarkan WEB_ID
            const rConfig = await fetch(`${SUPABASE_URL}/rest/v1/web_config?web_id=eq.${WEB_ID}&select=*`, { headers });
            const configData = await rConfig.json();

            // Ambil Log Statistik berdasarkan WEB_ID
            const rLogs = await fetch(`${SUPABASE_URL}/rest/v1/logs_result?web_id=eq.${WEB_ID}&select=created_at`, { headers });
            const logs = await rLogs.json();

            // Hitung Statistik
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
            const r = await fetch(`${SUPABASE_URL}/rest/v1/web_config?web_id=eq.${WEB_ID}`, {
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
            return res.status(200).json({ success: true, message: "SETTING BERHASIL DISIMPAN!" });
        } catch (e) { return res.status(500).json({ error: e.message }); }
    }
    return res.status(405).end();
}
