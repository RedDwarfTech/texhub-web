import TexHeader from "@/component/header/TexHeader";
import { readConfig } from "@/config/app/config-reader";
import store from "@/redux/store/store";
import { Goods } from "rd-component";

const Price: React.FC = () => {
    return (
        <div>
            <TexHeader></TexHeader>
            <Goods refreshUrl={readConfig("refreshUserUrl")} appId={readConfig("appId")} store={store}></Goods>
        </div>
    );
}

export default Price;