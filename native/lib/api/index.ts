import { API } from "./api";

export const BASE_URL = "http://192.168.1.100:8080/api";
export const api = new API(BASE_URL);

export default API;
export * from "./types";
