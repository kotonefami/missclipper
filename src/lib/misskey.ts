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

    const clips = (await (
        await fetch(new URL("/api/clips/list", config.host), {
            method: "POST",
            headers: {
                Authorization: "Bearer " + config.api_token,
                "Content-Type": "application/json",
            },
            body: "{}",
        })
    ).json()) as Clip[];

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
            const body = new FormData();
            body.append("name", `${author.screenName}-${tweet.id}-${mediaIndex}`);
            body.append("isSensitive", tweet.hasSensitiveMedia.toString());
            body.append("file", await (await fetch(media.getOriginalUrl())).blob());

            const result = await (
                await fetch(new URL("/api/drive/files/create", config.host), {
                    method: "POST",
                    headers: {
                        Authorization: "Bearer " + config.api_token,
                    },
                    body,
                })
            ).json();
            return result.id as string;
        }),
    );

    // NOTE: ノートを作成する
    const noteData = (
        await (
            await fetch(new URL("/api/notes/create", config.host), {
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
            })
        ).json()
    ).createdNote;

    // NOTE: クリップIDが指定されている場合は、ノートをクリップに追加
    if (clipId)
        await fetch(new URL("/api/clips/add-note", config.host), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + config.api_token,
            },
            body: JSON.stringify({
                clipId,
                noteId: noteData.id,
            }),
        });
}
