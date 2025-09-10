import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "http://0.0.0.0";

// Allow CORS (frontend running on port 8000)
app.use(cors({
    origin: `${process.env.REVEAL_URL}`   // or "*" if you want to allow all origins
  }));

// 🔹 Proxy for slides by pitch_id
app.get("/api/slides", async (req, res) => {
  try {
    const pitch_id = req.query.pitch_id;

    const strapiRes = await fetch(
      `${process.env.STRAPI_URL}/api/slides?populate=*&filters[idea][pitch_id][$eq]=${pitch_id}`,
      {
        headers: {
          "Authorization": `Bearer ${process.env.STRAPI_TOKEN}`
        }
      }
    );

    const data = await strapiRes.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error /api/slides:", err);
    res.status(500).json({ error: "Failed to fetch slides from Strapi" });
  }
});

// 🔹 Proxy for file details (images)
app.get("/api/files/:id", async (req, res) => {
  try {
    const fileId = req.params.id;

    const strapiRes = await fetch(
      `${process.env.STRAPI_URL}/api/upload/files/${fileId}`,
      {
        headers: {
          "Authorization": `Bearer ${process.env.STRAPI_TOKEN}`
        }
      }
    );

    const data = await strapiRes.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error /api/files:", err);
    res.status(500).json({ error: "Failed to fetch file from Strapi" });
  }
});

app.get("/api/brand-colors", async (req, res) => {
  try {
    const pitch_id = req.query.pitch_id;

    const strapiRes = await fetch(
      `${process.env.STRAPI_URL}/api/brand-colors?populate=*&filters[brand][pitch_id][$eq]=${pitch_id}`,
      {
        headers: {
          "Authorization": `Bearer ${process.env.STRAPI_TOKEN}`
        }
      }
    );

    const data = await strapiRes.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error /api/brand-colors:", err);
    res.status(500).json({ error: "Failed to fetch brand-colors from Strapi" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running at ${HOST}:${PORT}`);
});
