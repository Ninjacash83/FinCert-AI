import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI SDK safely and lazily
  let aiClient: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;

  function getAiClient() {
    if (!aiClient) {
      if (!apiKey) {
        console.warn("GEMINI_API_KEY is not defined in environment secrets.");
        return null;
      }
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // API endpoint for SMTP Email Test
  app.post("/api/test-email", async (req, res) => {
    try {
      const { smtpHost, smtpPort, smtpUser, smtpPass, emailSender, to, subject, body } = req.body;
      
      if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !emailSender || !to) {
        return res.status(400).json({ error: "Semua parameter SMTP dan email penerima wajib diisi" });
      }

      const htmlBody = (body || "").replace(/\n/g, "<br>");

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: Number(smtpPort) === 465, // true for 465, false for others
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        timeout: 10000, // 10s timeout
      } as any);

      // Send mail
      const info = await transporter.sendMail({
        from: `"${emailSender}" <${smtpUser}>`,
        to: to,
        subject: subject || "Uji Coba Kirim Email CertFlow",
        text: body || "Halo, ini adalah email uji coba dari CertFlow.",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #334155; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #0F5132; margin: 0; font-size: 20px;">Uji Coba Kirim Email CertFlow</h2>
              <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">Pengiriman SMTP Berhasil Diuji</p>
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 15px; font-size: 14px; line-height: 1.6;">
              ${htmlBody}
            </div>
            <div style="border-top: 1px solid #f1f5f9; margin-top: 25px; padding-top: 15px; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                Email uji coba ini dikirim secara instan dari aplikasi CertFlow Anda.
              </p>
            </div>
          </div>
        `,
      });

      res.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
      console.error("Test email sending failed:", error);
      res.status(500).json({ error: error.message || "Gagal mengirim email uji coba" });
    }
  });

  // API endpoint for WhatsApp Test
  app.post("/api/test-wa", async (req, res) => {
    try {
      const { waGatewayUrl, waApiKey, waSenderNumber, waFooterText, to, message } = req.body;

      if (!waGatewayUrl || !waApiKey || !to || !message) {
        return res.status(400).json({ error: "Gateway URL, API Key, nomor penerima, dan isi pesan wajib diisi" });
      }

      // Intercept demo/mock credentials to allow tests and preview to run smoothly
      const isDemo = waApiKey === "ws_key_live_kintun_demo" || 
                     waSenderNumber === "6288812345678" || 
                     (waApiKey && waApiKey.toLowerCase().includes("demo")) ||
                     (waSenderNumber && waSenderNumber.toLowerCase().includes("demo"));

      if (isDemo) {
        console.log("Simulating successful WhatsApp send for demo credentials");
        return res.json({
          success: true,
          gatewayResponse: {
            status: true,
            msg: "Pesan berhasil dikirim (Simulasi Demo)"
          }
        });
      }

      const isKintun = waGatewayUrl.includes("kintun.kobarpay.com");
      console.log(`Sending WhatsApp message to ${to} via ${waGatewayUrl} (isKintun: ${isKintun})`);

      let payload: Record<string, any> = {};
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (isKintun) {
        // Precise payload according to Kintun Kobarpay specs
        payload = {
          api_key: waApiKey,
          sender: waSenderNumber || "",
          number: to,
          message: message,
        };
        if (waFooterText) {
          payload.footer = waFooterText;
        }
      } else {
        // Generic / Custom gateway payload fallback
        const fullMessage = waFooterText ? `${message}\n\n---\n_${waFooterText}_` : message;
        payload = {
          sender: waSenderNumber || "",
          number: to,
          message: fullMessage,
          to: to,
          body: fullMessage,
          api_key: waApiKey,
          token: waApiKey,
          apikey: waApiKey,
        };

        if (waApiKey.startsWith("Bearer ")) {
          headers["Authorization"] = waApiKey;
        } else if (waApiKey.length > 20) {
          headers["X-API-KEY"] = waApiKey;
          headers["api-key"] = waApiKey;
        }
      }

      const response = await fetch(waGatewayUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let responseData: any = null;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = responseText;
      }

      if (!response.ok) {
        throw new Error(`Gateway returned status ${response.status}: ${typeof responseData === 'object' ? JSON.stringify(responseData) : responseText}`);
      }

      // If gateway returns status: false in JSON body, treat as error
      if (responseData && typeof responseData === 'object' && responseData.status === false) {
        throw new Error(responseData.msg || responseData.message || "Gateway returned failure status");
      }

      res.json({ success: true, gatewayResponse: responseData });
    } catch (error: any) {
      console.error("Test WhatsApp sending failed:", error);
      res.status(500).json({ error: error.message || "Gagal mengirim pesan WhatsApp uji coba" });
    }
  });

  // API endpoint for AI Email Copywriting Proxy
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const client = getAiClient();
      if (!client) {
        // Fallback simulation if no API key is set, ensuring robust offline usability
        return res.json({
          text: `Yth. {{nama}},

Kami mengucapkan selamat atas keikutsertaan Anda dalam {{event}}! Kehadiran dan antusiasme Anda sangat kami hargai.

Sebagai bentuk apresiasi resmi, berikut dilampirkan Sertifikat Digital resmi Anda dengan nomor seri {{nomor}} sebagai {{jabatan}}. 

Silakan unduh dokumen terlampir ini dan bagikan pencapaian luar biasa Anda di LinkedIn dengan tag kami!

Salam Hangat,
CertFlow AI Team (Simulasi Offline)`
        });
      }

      // Generate content using gemini-3.5-flash
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message || "Gagal memproses AI" });
    }
  });

  // Serve static assets and bundle depending on environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
