import { getConfig } from "../config";
import { Tweet } from "./twitter";

/**
 * Misskey クリップ
 */
type Clip = {
    /**
     * クリップID
     */
    id: string;
    /**
     * クリップ名
     */
    name: string;
};

/**
 * Misskey からクリップのリストを取得します。
 */
export async function getClips(): Promise<Clip[]> {
    const config = await getConfig();

    const clips = (await chrome.runtime.sendMessage({
        URL: new URL("/api/clips/list", config.host).href,
        request: {
            method: "POST",
            headers: {
                Authorization: "Bearer " + config.api_token,
                "Content-Type": "application/json",
            },
            body: "{}",
        },
        type: "json",
    })) as Clip[];
    return clips.sort((a, b) => (a.name > b.name ? 1 : -1));
}

/**
 * Twitter のツイートを Misskey に投稿します。
 * メディアがある場合は、Misskey のドライブにアップロードしてノートに添付します。
 * @param tweet 投稿するツイートオブジェクト
 * @param clipId ノートを追加するクリップのID
 */
export async function postToMisskey(tweet: Tweet, clipId?: string): Promise<void> {
    const config = await getConfig();
    const author = await tweet.getAuthor();

    // NOTE: メディアをドライブにアップロード
    const mediaIds = await Promise.all(
        (await tweet.getMediaList()).map(async (media, mediaIndex) => {
            const body = [
                { key: "name", value: `${author.screenName}-${tweet.id}-${mediaIndex}` },
                { key: "inSensitive", value: tweet.hasSensitiveMedia.toString() },
                { key: "file", type: "blob", URL: media.getOriginalUrl() },
            ];

            const result = await chrome.runtime.sendMessage({
                URL: new URL("/api/drive/files/create", config.host).href,
                request: {
                    method: "POST",
                    headers: {
                        Authorization: "Bearer " + config.api_token,
                    },
                    body,
                },
                type: "json",
                bodyType: "formData",
            });
            return result.id as string;
        }),
    );

    // NOTE: ノートを作成する
    const noteData = (
        await chrome.runtime.sendMessage({
            URL: new URL("/api/notes/create", config.host).href,
            request: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + config.api_token,
                },
                body: JSON.stringify({
                    text:
                        tweet.text === ""
                            ? `https://x.com/i/status/${tweet.id}`
                            : tweet.text
                                  .split("\n")
                                  .map((l) => `> ${l}`)
                                  .join("\n") +
                              "\n" +
                              `https://x.com/i/status/${tweet.id}`,
                    channelId: config.channel_id,
                    mediaIds: mediaIds.length === 0 ? undefined : mediaIds,
                }),
            },
        })
    ).createdNote;

    // NOTE: クリップIDが指定されている場合は、ノートをクリップに追加
    if (clipId)
        await chrome.runtime.sendMessage({
            URL: new URL("/api/clips/add-note", config.host).href,
            request: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + config.api_token,
                },
                body: JSON.stringify({
                    clipId,
                    noteId: noteData.id,
                }),
            },
            type: "none",
        });
}
