import { host, api_token, channel_id } from "../config";
import { Tweet } from "./twitter";

type Clip = {
    id: string;
    name: string;
}

export async function getClips(): Promise<Clip[]> {
    const clips = await (await fetch(new URL("/api/clips/list", host), {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + api_token,
            "Content-Type": "application/json",
        },
        body: "{}",
    })).json() as Clip[];

    return clips.sort((a, b) => a.name > b.name ? 1 : -1);
}

export async function postToMisskey(tweet: Tweet, clipId?: string) {
    const author = await tweet.getAuthor();
    const mediaIds = await Promise.all((await tweet.getMediaList()).map(async (media, mediaIndex) => {
        const body = new FormData();
        body.append("name", `${author.screenName}-${tweet.id}-${mediaIndex}`);
        body.append("isSensitive", tweet.hasSensitiveMedia.toString());
        body.append("file", await (await fetch(media.getOriginalUrl())).blob());

        const result = await (await fetch(new URL("/api/drive/files/create", host), {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + api_token,
            },
            body
        })).json();
        return result.id as string;
    }));

    const noteData = (await (await fetch(new URL("/api/notes/create", host), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + api_token
        },
        body: JSON.stringify({
            text: tweet.text === "" ? `https://x.com/i/status/${tweet.id}` :
                tweet.text.split("\n").map(l => `> ${l}`).join("\n") + "\n" + `https://x.com/i/status/${tweet.id}`,
            channelId: channel_id,
            mediaIds: mediaIds.length === 0 ? undefined : mediaIds
        })
    })).json()).createdNote;

    if (clipId) await fetch(new URL("/api/clips/add-note", host), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + api_token
        },
        body: JSON.stringify({
            clipId,
            noteId: noteData.id
        })
    });
}
