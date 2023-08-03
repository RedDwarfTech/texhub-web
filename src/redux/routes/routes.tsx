import { createBrowserRouter } from "react-router-dom";
import { PaySuccess } from "rd-component";
import "rd-component/dist/style.css";
import DocTab from "@/page/profile/docs/DocTab";
import Home from "@/page/home/Home";
import Template from "@/page/template/Template";

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
    }
]);

export default routes;