import { getConfig } from "./config";
import { getClips } from "./lib/misskey";
import type { RequestContent } from "./shared";

async function refreshList() {
    const listElement = document.querySelector("#list")!;
    listElement.innerHTML = "";

    const config = await getConfig();

    for (const clip of await getClips()) {
        const itemElement = document.createElement("li");

        const linkElement = document.createElement("a");
        linkElement.target = "_blank";
        linkElement.href = new URL("/clips/" + clip.id, config.host).toString();
        linkElement.textContent = clip.name;
        itemElement.appendChild(linkElement);

        const buttonElement = document.createElement("button");
        buttonElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" id="root" fill="currentColor"><path d="M80-120v-80h800v80H80Zm680-160v-560h60v560h-60Zm-600 0 210-560h100l210 560h-96l-50-144H308l-52 144h-96Zm176-224h168l-82-232h-4l-82 232Z"/></svg>`;
        buttonElement.addEventListener("click", () => {
            const newName = prompt("新しい名前を入力してください", clip.name);
            if (!newName) return;

            chrome.runtime
                .sendMessage({
                    URL: new URL("/api/clips/update", config.host).href,
                    request: {
                        method: "POST",
                        headers: {
                            Authorization: "Bearer " + config.api_token,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            clipId: clip.id,
                            name: newName,
                        }),
                    },
                    type: "none",
                } satisfies RequestContent)
                .then(() => refreshList());
        });
        itemElement.appendChild(buttonElement);

        listElement.appendChild(itemElement);
    }
}
refreshList();
