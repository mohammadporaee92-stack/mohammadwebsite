// ============================================================
// Instagram integration architecture (Meta Graph API).
// Until the owner connects an access token, the site shows
// elegant placeholder cards linking to the Instagram profile.
// Owner TODO: create Meta app, connect IG Business account,
// set INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_ENABLED=true in .env
// ============================================================

export interface IgPost {
  id: string;
  caption: string;
  mediaUrl: string;
  permalink: string;
  timestamp: string;
}

export function instagramUsername() {
  return process.env.INSTAGRAM_USERNAME || "mohammad_por_ai";
}

export function instagramUrl() {
  return `https://instagram.com/${instagramUsername()}`;
}

export function instagramEnabled() {
  return (
    process.env.INSTAGRAM_ENABLED === "true" &&
    !!process.env.INSTAGRAM_ACCESS_TOKEN
  );
}

export async function getInstagramFeed(limit = 6): Promise<IgPost[]> {
  if (!instagramEnabled()) return [];
  try {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp&limit=${limit}&access_token=${token}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.data || []).map((p: Record<string, string>) => ({
      id: p.id,
      caption: p.caption || "",
      mediaUrl: p.media_url || "",
      permalink: p.permalink || instagramUrl(),
      timestamp: p.timestamp || "",
    }));
  } catch {
    return [];
  }
}
