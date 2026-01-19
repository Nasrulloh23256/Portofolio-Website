const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const ogImagePatterns = [
    /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /name=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /content=["']([^"']+)["'][^>]*name=["']og:image["']/i,
    /property=["']og:image:url["'][^>]*content=["']([^"']+)["']/i,
];

export const fetchOgImage = async (url: string, timeoutMs = 5000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            headers: {
                "user-agent": userAgent,
            },
            signal: controller.signal,
        });

        if (!response.ok) return null;

        const html = await response.text();
        for (const pattern of ogImagePatterns) {
            const match = html.match(pattern);
            if (match?.[1]) {
                const imageUrl = match[1].trim();
                if (!imageUrl) continue;
                return new URL(imageUrl, url).toString();
            }
        }
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }

    return null;
};
