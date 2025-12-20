

chrome.runtime.onMessage.addListener(
    async (request: {URL: string, request: RequestInit, type: "json" | "none"}) => 
{
    const fetched = await fetch(request.URL, request.request)
    switch(request.type){
        case "json":{
            return await fetched.json()
        }
        case "none":{
            return null;
        }
    }
});