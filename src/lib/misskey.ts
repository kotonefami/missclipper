import type { BackgroundRequestInit, BodyOfFormData } from "../shared";
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
 * Misskey API にリクエストを送信します。
 * リクエストは Background Script を介して行われます。
 *
 * @param url API エンドポイントの URL
 * @param options リクエストオプション
 */
async function fetch(request: BackgroundRequestInit<false>): Promise<object | null> {
    const config = await getConfig();

    // NOTE: リクエストボディをシリアライズ
    let body: BackgroundRequestInit<true>["body"];
    if (typeof request.body === "object" && !Array.isArray(request.body)) {
        body = JSON.stringify(request.body);
    } else {
        body = request.body;
    }

    return await chrome.runtime.sendMessage({
        ...request,
        url: new URL(request.url, config.host).href,
        body,
    } satisfies BackgroundRequestInit<true>);
}

/**
 * Misskey からクリップのリストを取得します。
 */
export async function getClips(): Promise<Clip[]> {
    const config = await getConfig();

    const clips = (await fetch({
        url: "/api/clips/list",
        method: "POST",
        headers: {
            Authorization: "Bearer " + config.api_token,
            "Content-Type": "application/json",
        },
        body: {},
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
                { key: "name", type: "string", value: `${author.screenName}-${tweet.id}-${mediaIndex}` },
                { key: "inSensitive", type: "string", value: tweet.hasSensitiveMedia.toString() },
                { key: "file", type: "blob", url: media.getOriginalUrl() },
            ] satisfies BodyOfFormData[];

            const result = (await fetch({
                url: new URL("/api/drive/files/create", config.host).href,
                method: "POST",
                headers: {
                    Authorization: "Bearer " + config.api_token,
                },
                body,
            })) as any;
            return result.id as string;
        }),
    );

    // NOTE: ノートを作成する
    const noteData = (
        (await fetch({
            url: new URL("/api/notes/create", config.host).href,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + config.api_token,
            },
            body: {
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
            },
        })) as any
    ).createdNote;

    // NOTE: クリップIDが指定されている場合は、ノートをクリップに追加
    if (clipId)
        await fetch({
            url: new URL("/api/clips/add-note", config.host).href,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + config.api_token,
            },
            body: {
                clipId,
                noteId: noteData.id,
            },
        });
}
