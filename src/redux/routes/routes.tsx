import { createBrowserRouter } from "react-router-dom";
import App from "@/page/main/App";
import { PaySuccess } from "rd-component";
import "rd-component/dist/style.css";
import DocTab from "@/page/profile/docs/DocTab";
import Home from "@/page/home/Home";

const routes = createBrowserRouter([
    {
        path: "/product/pay/success",
        element: <PaySuccess />
    },
    {
        path: "/",
        element: <App />
    },
    {
        path: "/home",
        element: <Home />
    },
    {
        path: "/doc/tab",
        element: <DocTab />
    }
]);

export default routes;