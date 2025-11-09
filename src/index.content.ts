import { askClipId } from "./ask";
import { waitForElement, runWithAllElement } from "./lib/element";
import { Tweet } from "./lib/twitter";
import { postToMisskey } from "./lib/misskey";

const styleTag = document.createElement("style");
styleTag.textContent = `
.missclipper-button {
    background: none;
    border: none;
    cursor: pointer;

    display: flex;
    align-items: center;

    width: 1.25em;
    height: 1.25em;
    align-self: center;

    position: relative;
}
.missclipper-button::before {
    content: "";
    display: block;
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
    border-radius: 1000px;
    transition-duration: 0.2s;
}
.missclipper-button svg {
    width: 100%;
    height: auto;
}
.missclipper-button:hover::before {
    background-color: rgb(239, 243, 244, 0.1);
}
.missclipper-button:active::before {
    background-color: rgb(239, 243, 244, 0.2);
}
</style>
`;
waitForElement("head").then((head) => head[0].appendChild(styleTag));

const downloadButtonTemplate = new DOMParser().parseFromString(
    `
    <div class="missclipper-button">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(113, 118, 123)">
            <path d="M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-330q0-17 11.5-28.5T400-720q17 0 28.5 11.5T440-680v330q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-350q0-17 11.5-28.5T680-720q17 0 28.5 11.5T720-680v350Z"/>
        </svg>
    </div>
`,
    "text/html",
).body.children[0];

runWithAllElement<HTMLElement>('article[data-testid="tweet"]', (element) => {
    const downloadButton = element
        .querySelector('[role="group"]')!
        .appendChild(downloadButtonTemplate.cloneNode(true)) as HTMLDivElement;
    downloadButton.onclick = async (evt) => {
        evt.preventDefault();

        const clipId = await askClipId();
        const tweet = new Tweet(element);
        postToMisskey(tweet, clipId);
        tweet.removeBookmark();
    };
});
