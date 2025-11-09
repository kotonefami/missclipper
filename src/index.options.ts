import { type Config, DEFAULT_CONFIG } from "./config";

const form = document.querySelector<HTMLFormElement>("form")!;
const messageDiv = document.querySelector<HTMLDivElement>("#message")!;
const hostInput = document.querySelector<HTMLInputElement>("input#host")!;
const apiTokenInput = document.querySelector<HTMLInputElement>("input#api_token")!;
const channelIdInput = document.querySelector<HTMLInputElement>("input#channel_id")!;

/**
 * ユーザーにメッセージを表示します。メッセージは、3秒後に自動的に非表示になります。
 * @param text 表示するメッセージ
 * @param type メッセージの種類 (success または error)
 */
function showMessage(text: string, type: "success" | "error") {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type} show`;
    setTimeout(() => {
        messageDiv.className = "message";
    }, 3000);
}

/**
 * ストレージから設定を読み込み、フォームに反映します。
 */
async function loadConfig() {
    const result = await chrome.storage.sync.get(DEFAULT_CONFIG);
    const config = result as Config;

    hostInput.value = config.host;
    apiTokenInput.value = config.api_token;
    channelIdInput.value = config.channel_id ?? "";
}

form.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const channelId = channelIdInput.value.trim();

    const config: Config = {
        host: hostInput.value.trim(),
        api_token: apiTokenInput.value.trim(),
        channel_id: channelId === "" ? null : channelId,
    };

    try {
        new URL(config.host); // NOTE: URL の検証
        await chrome.storage.sync.set(config);
        showMessage("設定を保存しました。", "success");
    } catch (error) {
        showMessage("設定の保存に失敗しました: " + (error as Error).message, "error");
    }
});
form.addEventListener("reset", async (evt) => {
    evt.preventDefault();
    if (confirm("設定をリセットしてもよろしいですか？")) {
        await chrome.storage.sync.clear();
        await loadConfig();
        showMessage("設定をリセットしました。", "success");
    }
});

loadConfig();
