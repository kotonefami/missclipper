/** Background Script がリクエストを送信するために必要な情報 */
export type RequestContent = { URL: string; request: RequestInit; type: "json" | "none"; bodyType?: "formData" };

/** Background Script で {@link FormData} のプロパティとして処理できるオブジェクト */
export type BodyOfFormData = { key: string; URL: string; type: "blob" } | { key: string; value: string; type?: "string" };

// NOTE: sendMessage の型定義をオーバーライド
declare global {
    namespace chrome.runtime {
        export function sendMessage<Request extends RequestContent>(message: Request): Promise<Request["type"] extends "json" ? any : null>;
    }
}
