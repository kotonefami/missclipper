import { waitForElement } from "./lib/element";
import { getClips } from "./lib/misskey";

const styleTag = document.createElement("style");
styleTag.textContent = `
.mscl-dialog {
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;

    &::before {
        content: "";
        position: fixed;
        top: 0px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        backdrop-filter: brightness(80%) blur(3px);
        z-index: -1;
    }

    & button {
        background: unset;
        border: unset;
        font: unset;
        padding: unset;

        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }

    & > div {
        display: flex;
        flex-direction: column;

        position: fixed;
        top: 3em;
        left: 3em;
        right: 3em;
        bottom: 3em;
        max-width: 30em;
        margin-inline: auto;

        background-color: #000000;
        color: #ffffff;

        border-radius: 1em;
        overflow: hidden;

        & header, & footer {
            display: flex;
            justify-content: space-between;

            background-color: #202020;

            text-align: center;
            padding: 1em;
        }
        & > div {
            display: flex;
            flex-direction: column;

            flex: 1;
            overflow-y: scroll;
            overscroll-behavior: contain;

            gap: 1em;
            padding-block: 1em;
            & > button {
                padding-inline: 1em;
            }
        }
    }
}
</style>
`;
waitForElement("head").then((head) => head[0].appendChild(styleTag));

const dialogTemplate = new DOMParser().parseFromString(
    `
    <div class="mscl-dialog">
        <div>
            <header>
                クリップを選択してください
                <button type="button" class="close">閉じる</button>
            </header>
            <div data-mc-list>
                読み込み中です。
            </div>
            <footer>
                ...
            </footer>
        </div>
    </div>
`,
    "text/html",
).body.children[0];

export async function askClipId(callback?: (clipId: string) => any): Promise<string> {
    return new Promise<string>(async (resolve) => {
        const dialogElement = dialogTemplate.cloneNode(true) as Element;
        waitForElement("#react-root").then((root) => root.item(0).appendChild(dialogElement));

        dialogElement.querySelector<HTMLButtonElement>(".close")?.addEventListener("click", () => {
            dialogElement.remove();
        });

        const listElement = dialogElement.querySelector("[data-mc-list]")!;
        listElement.innerHTML = "";
        for (const clip of await getClips()) {
            const buttonElement = document.createElement("button");
            buttonElement.textContent = clip.name;
            buttonElement.addEventListener("click", () => {
                dialogElement.remove();
                callback?.(clip.id);
                resolve(clip.id);
            });
            listElement.appendChild(buttonElement);
        }
    });
}
