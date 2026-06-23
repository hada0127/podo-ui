import { defineConfig } from "vite";

// Dev-server config for the Podo editor. `allowedHosts: true` lets the server be
// reached through a tunnel (ngrok, cloudflared, …) — Vite otherwise rejects any
// request whose Host header is not localhost ("Blocked request… not allowed").
// `host: true` binds all interfaces so the tunnel (and LAN) can connect.
export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
});
