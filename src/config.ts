export interface Config {
    host: string;
    api_token: string;
    channel_id: string | null;
}

export const DEFAULT_CONFIG: Config = {
    host: "https://misskey.io",
    api_token: "",
    channel_id: null,
};

let config: Config | null = null;

/**
 * 設定を取得します。
 * キャッシュがある場合はキャッシュを返し、ない場合はストレージから読み込みます。
 */
export async function getConfig(): Promise<Config> {
    if (!config)
        config = {
            ...DEFAULT_CONFIG,
            ...(await chrome.storage.sync.get(DEFAULT_CONFIG)),
        };
    return config;
}

// NOTE: ストレージに変更があった場合、キャッシュをクリアする
if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.onChanged.addListener(() => (config = null));
}
