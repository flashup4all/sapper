
import axios from "axios";
import { goto, url } from "@sveltech/routify";

import { environment } from '../environments/index.js';
import { user_token } from "../constant";
import { get_token, clear_store } from "../localstore";
import toastr from "toastr";


export const axiosInstance = axios.create({
  baseURL: environment.host,
  timeout: 1000,
});

axiosInstance.interceptors.request.use(function (config) {
	//const token = JSON.parse(this.local.get_store('atkn')) || null;
  const token = get_token() 
    config.headers.Authorization = `Bearer ${token}`; 
    config.headers = { ...config.headers };
    // you can also do other modification in config
    // console.log(config)
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

axiosInstance.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    if (error.response.status === 422) {
      toastr.error(error.response.statusText, "Validation Error!")
      let validation_error = error.response.data;
      let messages="";
      Object.entries(validation_error.errors).map(([key, value ]) => {
        messages += `${key}: ${value[0]} \n`
      })
      toastr.error(messages, "Validation Error!")
    }

    if (error.response.status === 401) {
      toastr.error("Authentication Token expired, Please login again", "Authentication Error!")
      clear_store()
      $goto("/auth");
    }
    return  Promise((resolve, reject) => {
      reject(error);
    });
  });
