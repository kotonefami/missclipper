/**
 * Twitter メディア
 */
export class Media {
    /**
     * 取得されたURL
     */
    public url: string;

    /**
     * 動画であるかどうか
     */
    public isVideo: boolean;

    /**
     * メディアの拡張子
     */
    public extension: string;

    /**
     * @param url メディアURL
     * @param isVideo 動画であるかどうか
     */
    constructor(url: string, isVideo: boolean) {
        this.url = url;
        this.isVideo = isVideo;

        this.extension = /(format=([a-z0-9]+)|\.([a-zA-Z0-9]{1,4})$)/.exec(this.url ?? "")?.[2] ?? "";
    }

    /**
     * オリジナル画質のURLを取得します。
     * @returns オリジナル画質のメディアURL
     */
    getOriginalUrl(): string {
        if (this.url.startsWith("https://pbs.twimg.com/media/")) {
            return this.url.replace(/name=([0-9a-z]+)/, "name=4096x4096").replace(/format=([a-z0-9]+)/, "format=png");
        } else if (this.url.startsWith("https://pbs.twimg.com/profile_images/")) {
            return this.url.replace("_original", "");
        } else {
            return this.url;
        }
    }
}
