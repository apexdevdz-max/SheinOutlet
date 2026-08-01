import { NextResponse } from "next/server";

/**
 * POST /api/revalidate
 * 
 * Triggers a Netlify rebuild to regenerate:
 * - Static pages (SSG/ISR)
 * - search-index.json
 * - sitemap.xml
 * 
 * Call this from the admin panel after modifying products.
 * 
 * Requires NETLIFY_BUILD_HOOK_URL in environment variables.
 * Create a build hook in: Netlify Dashboard > Site > Build & Deploy > Build hooks
 * Example: https://api.netlify.com/build_hooks/YOUR_HOOK_ID
 */
export async function POST() {
  const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL;

  if (!hookUrl) {
    return NextResponse.json(
      { error: "NETLIFY_BUILD_HOOK_URL not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(hookUrl, { method: "POST" });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Netlify responded with ${res.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Rebuild triggered. Changes will be live in ~2-3 minutes.",
    });
  } catch (err) {
    console.error("[revalidate] Failed to trigger rebuild:", err);
    return NextResponse.json(
      { error: "Failed to trigger rebuild" },
      { status: 500 }
    );
  }
}
