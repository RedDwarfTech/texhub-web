import proConfigMap from "./config-pro";
import devConfigMap from './config-dev';

export function readConfig(key:string) {
    const isProduction = process.env.NODE_ENV === 'production';
    if(isProduction){
        return proConfigMap.get(key)??"";
    }
    const isDev = process.env.NODE_ENV === 'development';
    if(isDev){
        return devConfigMap.get(key)??"";
    }
    return ""
}




