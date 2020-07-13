import {
    MOBILE_MAX_LENGTH,
    MOBILE_MIN_LENGTH,
    COUNTRY_CODE_MAX_LENGTH,
    COUNTRY_CODE_MIN_LENGTH
} from "./app-config.constant";




export const emailRegex = new RegExp(/^\w+([.-]\w+)*@\w+([.-]\w+)*\.\w{2,3}$/);

export const countryCodeRegex = new RegExp(/^[\+][\d]{1,5}$/);

export const mobileRegex = new RegExp(/^[\d]{8,15}$/);