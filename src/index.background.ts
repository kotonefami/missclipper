import type { BackgroundRequestInit } from "./shared";

chrome.runtime.onMessage.addListener((request: BackgroundRequestInit<true>, _, callback: (arg: object | null) => unknown) => {
    new Promise<object | null>(async (resolve, reject) => {
        try {
            let body: BodyInit | null;
            if (typeof request.body === "string") {
                body = request.body;
            } else if (typeof request.body === "object") {
                body = new FormData();
                for (const formData of request.body) {
                    if (formData?.type === "blob") {
                        body.append(formData.key, await (await fetch(formData.url)).blob());
                    } else {
                        body.append(formData.key, formData.value);
                    }
                }
            } else {
                body = null;
            }

            // TODO: DNS エラーなどは Failed to fetch で catch に飛ばない問題
            const response = await fetch(request.url, { ...request, body });
            if (!response.ok) {
                // TODO: よりよいエラーハンドリング
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            try {
                resolve(await response.json());
            } catch {
                resolve(null);
            }
        } catch (e) {
            console.error(e);
            reject(e);
        }
    }).then(callback);
    return true;
});
