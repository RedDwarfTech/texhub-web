import { createBrowserRouter } from "react-router-dom";
import { PaySuccess, RdLogin } from "rd-component";
import "rd-component/dist/style.css";
import DocTab from "@/page/profile/project/ProjectTab";
import Home from "@/page/home/Home";
import Template from "@/page/template/Template";
import TemplateDetail from "@/page/template/detail/TemplateDetail";
import { lazy } from "react";
import store from "../store/store";
import { readConfig } from "@/config/app/config-reader";
const App = lazy(() => import('@/page/main/App'));

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
        path: "/user/login",
        element: <RdLogin appId={readConfig("appId")} store={store} loginUrl={readConfig("loginUrl")} />
    },
    {
        path: "/user/reg",
        element: <RdLogin appId={readConfig("appId")} store={store} loginUrl={readConfig("regUrl")} />
    }
]);

export default routes;