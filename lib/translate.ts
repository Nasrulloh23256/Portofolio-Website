const translateUrl =
    process.env.TRANSLATE_API_URL ?? "https://libretranslate.de/translate";

const translateApiKey = process.env.TRANSLATE_API_KEY ?? "";

const shouldTranslate = (text: string) => {
    return text.trim().length > 0;
};

export const translateText = async (text: string) => {
    if (!shouldTranslate(text)) return text;

    try {
        const response = await fetch(translateUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                q: text,
                source: "id",
                target: "en",
                format: "text",
                api_key: translateApiKey || undefined,
            }),
        });

        if (!response.ok) {
            return text;
        }

        const data = (await response.json()) as { translatedText?: string };
        return data.translatedText ?? text;
    } catch {
        return text;
    }
};

type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };

const skipKeys = new Set(["imageUrl", "link"]);

export const translateJson = async (value: JsonValue): Promise<JsonValue> => {
    if (typeof value === "string") {
        return translateText(value);
    }

    if (Array.isArray(value)) {
        const translated = await Promise.all(value.map(translateJson));
        return translated;
    }

    if (value && typeof value === "object") {
        const entries = Object.entries(value);
        const translatedEntries = await Promise.all(
            entries.map(async ([key, entryValue]) => {
                if (skipKeys.has(key)) {
                    return [key, entryValue] as const;
                }
                const translatedValue = await translateJson(entryValue);
                return [key, translatedValue] as const;
            })
        );
        return Object.fromEntries(translatedEntries);
    }

    return value;
};
