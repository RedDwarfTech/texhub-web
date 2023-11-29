let devConfigMap = new Map([
    ["wssUrl", "ws://192.168.10.93:58080/post/websocket"],
    ["logoutUrl", "http://dev-tex.poemhub.top"],
    ["baseAuthUrl","http://192.168.10.93:11014"],
    ["loginUrl", "/texpub/user/login"],
    ["regUrl", "/texpub/user/reg"],
    ["accessTokenUrlPath","/texpub/auth/access-token/refresh"],
    ["appHome","http://192.168.10.93:8084"],
    ["appId" , "n29Pa29WS1"],
    ["phone","+8615683761628"],
    ["password","12345678"],
    ["deviceName","dolphin's macbook pro"],
    ["refreshUserUrl","/texpub/user/current-user"],
    ["compileBaseUrl","http://dev-tex.poemhub.top/tex/static/proj"],
    ["tplBaseUrl","http://dev-tex.poemhub.top/tex/static/tpl"],
    ["wssUrl","ws://127.0.0.1:1234"],
    ["shareBaseUrl","http://dev-tex.poemhub.top/proj/share"],
    ["pdfScaleKey",""],
    ["pdfScrollKey","pdf:scroll:"],
    ["pdfCurPage","pdf:page:"]
]); 

export default devConfigMap;