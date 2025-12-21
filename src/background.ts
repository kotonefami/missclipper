type RequestContent = {URL: string, request: RequestInit, type: "json" | "none", bodyType?: "formdata"}

type BodyOfFormdata = { key: string, URL: string, type: "blob" } | { key: string, value: string, type?: "string"}

chrome.runtime.onMessage.addListener(
    (request: RequestContent, _, callback: (arg: object | null) => unknown) => 
{
    (async () => {
        try{
            if (request.bodyType == "formdata") {
                const newbody = new FormData();
                for(const formdata of request.request.body as unknown as BodyOfFormdata[]){
                    if(formdata?.type === "blob"){
                        newbody.append(formdata.key, await (await fetch(formdata.URL)).blob())
                    } else {
                        newbody.append(formdata.key, formdata.value)
                    }
                }
                request.request.body = newbody;
            }
            const fetched = await fetch(request.URL, request.request)
            switch(request.type){
                case "json":{
                    callback(await fetched.json())
                }
                case "none":{
                    callback(null);
                }
            }
        } catch(e){
            console.error(e);
            callback(null);
        }
    })();
    return true
});