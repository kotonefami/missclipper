/** Background Script がリクエストを送信するために必要な情報 */
export type BackgroundRequestInit<Serialized extends boolean> = Omit<RequestInit, "body"> & {
    /** リクエストの送信先 URL */
    url: string;
    /** リクエストボディ */
    body?: (Serialized extends true ? string : object) | BodyOfFormData[];
};

/** Background Script で {@link FormData} のプロパティとして処理できるオブジェクト */
export type BodyOfFormData =
    | { key: string; url: string; type: "blob" }
    | { key: string; value: string; type: "string" };
