import TexHeader from "@/component/header/TexHeader";
import { readConfig } from "@/config/app/config-reader";
import store from "@/redux/store/store";
import { Goods } from "rd-component";

const Price: React.FC = () => {
  let lang = localStorage.getItem("userLanguage");
  return (
    <div>
      <TexHeader></TexHeader>
      <Goods
        refreshUrl={readConfig("refreshUserUrl")}
        appId={readConfig("appId")}
        store={store}
        lang={lang || "zh-CN"}
      ></Goods>
    </div>
  );
};

export default Price;
