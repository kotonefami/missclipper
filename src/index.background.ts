import type { BodyOfFormData, RequestContent } from "./shared";

chrome.runtime.onMessage.addListener((request: RequestContent, _, callback: (arg: object | null) => unknown) => {
    (async () => {
        try {
            if (request.bodyType == "formData") {
                const newFormData = new FormData();
                for (const formData of request.request.body as unknown as BodyOfFormData[]) {
                    if (formData?.type === "blob") {
                        newFormData.append(formData.key, await (await fetch(formData.URL)).blob());
                    } else {
                        newFormData.append(formData.key, formData.value);
                    }
                }
                request.request.body = newFormData;
            }

            const response = await fetch(request.URL, request.request);
            switch (request.type) {
                case "json": {
                    callback(await response.json());
                }
                case "none": {
                    callback(null);
                }
            }
        } catch (e) {
            console.error(e);
            callback(null);
        }
    })();
    return true;
});
