/**
 * Twitter ユーザー
 */
export class User {
    /**
     * ユーザー名
     */
    public name: string;

    /**
     * ユーザーのスクリーンネーム
     */
    public screenName: string;

    /**
     * @param name ユーザー名
     * @param screenName ユーザーのスクリーンネーム
     */
    public constructor(name: string, screenName: string) {
        this.name = name;
        this.screenName = screenName;
    }
}
