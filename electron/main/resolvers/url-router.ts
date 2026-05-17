// Central URL resolver — called from main process IPC
// Handles: .eth ENS, ipfs://, ipns://, https://, http://, search terms

export interface ResolvedURL {
  ok: boolean;
  url: string;          // The URL to actually load in the webview
  originalUrl: string;  // What the user typed
  type: 'https' | 'http' | 'ens' | 'ipfs' | 'ipns' | 'search' | 'error';
  ipfsGateway?: string;
  ensAddress?: string;
  error?: string;
}

const IPFS_GATEWAYS = [
  'https://ipfs.io',
  'https://cloudflare-ipfs.com',
  'https://dweb.link',
];

export async function resolveURL(raw: string): Promise<ResolvedURL> {
  const input = raw.trim();

  if (!input) {
    return { ok: false, url: '', originalUrl: raw, type: 'error', error: 'Empty URL' };
  }

  // ── IPFS protocol ──────────────────────────────────────────────────────────
  if (input.startsWith('ipfs://')) {
    const cid = input.slice(7);
    const url = `${IPFS_GATEWAYS[0]}/ipfs/${cid}`;
    return { ok: true, url, originalUrl: raw, type: 'ipfs', ipfsGateway: IPFS_GATEWAYS[0] };
  }

  // ── IPNS protocol ──────────────────────────────────────────────────────────
  if (input.startsWith('ipns://')) {
    const name = input.slice(7);
    const url = `${IPFS_GATEWAYS[0]}/ipns/${name}`;
    return { ok: true, url, originalUrl: raw, type: 'ipns', ipfsGateway: IPFS_GATEWAYS[0] };
  }

  // ── ENS domain (.eth) ──────────────────────────────────────────────────────
  if (input.endsWith('.eth') || /^[a-z0-9-]+\.eth$/i.test(input.split('/')[0])) {
    return resolveENS(input);
  }

  // ── Already a full URL ─────────────────────────────────────────────────────
  if (input.startsWith('https://') || input.startsWith('http://')) {
    return { ok: true, url: input, originalUrl: raw, type: input.startsWith('https') ? 'https' : 'http' };
  }

  // ── Bare domain (no protocol) ──────────────────────────────────────────────
  if (input.includes('.') && !input.includes(' ') && !input.startsWith('.')) {
    const url = `https://${input}`;
    return { ok: true, url, originalUrl: raw, type: 'https' };
  }

  // ── Search query ───────────────────────────────────────────────────────────
  const url = `https://www.google.com/search?q=${encodeURIComponent(input)}`;
  return { ok: true, url, originalUrl: raw, type: 'search' };
}

async function resolveENS(name: string): Promise<ResolvedURL> {
  // ENS resolution requires Ethereum RPC — do it via fetch to a public API
  // to avoid heavy ethers dependency in main process
  try {
    // Use public ENS subgraph or ETH RPC to resolve
    const domain = name.split('/')[0]; // strip path
    const path = name.includes('/') ? name.slice(name.indexOf('/')) : '';

    // Try eth.limo gateway first — serves ENS content via HTTPS
    const limoUrl = `https://${domain}.limo${path}`;

    // Verify the domain resolves by checking eth.limo
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(limoUrl, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok || res.status === 301 || res.status === 302 || res.status === 200) {
        return { ok: true, url: limoUrl, originalUrl: name, type: 'ens' };
      }
    } catch {
      clearTimeout(timeout);
    }

    // Fallback: use cloudflare ENS gateway
    const cfUrl = `https://${domain}.eth.limo${path}`;
    return { ok: true, url: cfUrl, originalUrl: name, type: 'ens' };
  } catch (err) {
    return { ok: false, url: '', originalUrl: name, type: 'error', error: `ENS resolution failed: ${err}` };
  }
}
