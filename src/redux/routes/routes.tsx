import { createBrowserRouter } from "react-router-dom";
import { PaySuccess } from "rd-component";
import "rd-component/dist/style.css";
import DocTab from "@/page/profile/project/tab/ProjectTab";
import Home from "@/page/home/Home";
import Template from "@/page/template/Template";
import TemplateDetail from "@/page/template/detail/TemplateDetail";
import store from "../store/store";
import { readConfig } from "@/config/app/config-reader";
import Price from "@/component/common/price/Price";
import App from "@/page/main/app/App";
import TeXShareRecieved from "@/page/profile/project/share/TexShareRecieved";
import Settings from "@/page/profile/panel/Settings";
import FullScreen from "@/component/common/previewer/feat/fullscreen/FullScreen";
import DocCenter from "@/page/document/DocCenter";
import VerifyPwd from "@/page/pwd/verify/VerifyPwd";
import ResetPwd from "@/page/pwd/reset/ResetPwd";
import RdTeXHubLogin from "@/page/profile/user/login/RdTeXHubLogin";
import RdTeXHubReg from "@/page/profile/user/reg/RdTeXHubReg";

const routeDefine = [
  {
    path: "/product/pay/success",
    element: <PaySuccess />,
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/doc/tab",
    element: <DocTab />,
  },
  {
    path: "/doc/help",
    element: <DocCenter />,
  },
  {
    path: "/tpl",
    element: <Template />,
  },
  {
    path: "/tpl/detail",
    element: <TemplateDetail />,
  },
  {
    path: "/editor",
    element: <App />,
  },
  {
    path: "/preview/fullscreen",
    element: <FullScreen />,
  },
  {
    path: "/user/login",
    element: (
      <RdTeXHubLogin
        appId={readConfig("appId")}
        cfSiteKey={readConfig("cfSiteKey")}
        store={store}
        loginUrl={readConfig("loginUrl")}
        enableWechatLogin={false}
      />
    ),
  },
  {
    path: "/user/reg",
    element: (
      <RdTeXHubReg
        appId={readConfig("appId")}
        store={store}
        regUrl={readConfig("regUrl")}
      />
    ),
  },
  {
    path: "/user/panel",
    element: <Settings />,
  },
  {
    path: "/goods",
    element: <Price />,
  },
  {
    path: "/proj/share",
    element: <TeXShareRecieved />,
  },
  {
    path: "/userpage/pwd/retrieve",
    element: <VerifyPwd />,
  },
  {
    path: "/userpage/pwd/reset",
    element: <ResetPwd />,
  },
];

const routes = createBrowserRouter(routeDefine,{
  future: {
    v7_normalizeFormMethod: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  }
});

export default routes;
