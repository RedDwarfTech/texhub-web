import { createBrowserRouter } from "react-router-dom";
import { PaySuccess, RdLogin, RdReg } from "rd-component";
import "rd-component/dist/style.css";
import DocTab from "@/page/profile/project/ProjectTab";
import Home from "@/page/home/Home";
import Template from "@/page/template/Template";
import TemplateDetail from "@/page/template/detail/TemplateDetail";
import store from "../store/store";
import { readConfig } from "@/config/app/config-reader";
import Price from "@/component/common/price/Price";
import App from "@/page/main/App";
import TeXShareRecieved from "@/page/profile/project/share/TexShareRecieved";
import Settings from "@/page/profile/panel/Settings";
import FullScreen from "@/component/common/previewer/feat/fullscreen/FullScreen";

const routes = createBrowserRouter([
    {
        path: "/product/pay/success",
        element: <PaySuccess />
    },
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/doc/tab",
        element: <DocTab />
    },
    {
        path: "/tpl",
        element: <Template />
    },
    {
        path: "/tpl/detail",
        element: <TemplateDetail />
    },
    {
        path: "/editor",
        element: <App />
    },
    {
        path: "/preview/fullscreen",
        element: <FullScreen />
    },
    {
        path: "/user/login",
        element: <RdLogin appId={readConfig("appId")} store={store} loginUrl={readConfig("loginUrl")} />
    },
    {
        path: "/user/reg",
        element: <RdReg appId={readConfig("appId")} store={store} regUrl={readConfig("regUrl")} />
    },
    {
        path: "/user/panel",
        element: <Settings/>
    },
    {
        path: "/goods",
        element: <Price/>
    },
    {
        path: "/proj/share",
        element: <TeXShareRecieved/>
    }
]);

export default routes;