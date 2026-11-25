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

        const SUPABASE_URL = "https://djradeolrbjmgoxxbdlj.supabase.co"; 
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcmFkZW9scmJqbWdveHhiZGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1OTA0NDQsImV4cCI6MjExMTE2NjQ0NH0.RvLrul0eFafGUcOn_9ORB8xh3IaP4n1FAsEmqXnrXCA";     
        
        let EMAIL = process.env.RESS_EMAIL || "admin@domain.com";
        let NAMA = process.env
