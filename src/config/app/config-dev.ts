let devConfigMap = new Map([
    //["wssUrl", "ws://127.0.0.1:1234"],
    ["wssUrl","wss://ws.poemhub.top"],
    ["logoutUrl", "http://dev-tex.poemhub.top"],
    ["baseAuthUrl","https://tex.poemhub.top"],
    ["loginUrl", "/infra/user/login"],
    ["regUrl", "/infra/user/reg"],
    ["accessTokenUrlPath","/infra/auth/access-token/refresh"],
    ["appHome","http://192.168.10.93:8084"],
    ["appId" , "n29Pa29WS1"],
    ["phone","+8615683761628"],
    ["password","12345678"],
    ["deviceName","dolphin's macbook pro"],
    ["refreshUserUrl","/infra/user/current-user"],
    ["compileBaseUrl","https://tex.poemhub.top/tex/static/proj"],
    ["tplBaseUrl","http://dev-tex.poemhub.top/tex/static/tpl"],
    ["shareBaseUrl","http://dev-tex.poemhub.top/proj/share"],
    ["pdfScaleKey",""],
    ["pdfScrollKey","pdf:scroll:"],
    ["pdfCurPage","pdf:page:"]
]); 

export default devConfigMap;