'use client';

import base64 from 'base-64';
import axios, { type AxiosResponse, type AxiosError } from 'axios';

// interfaces
export interface IResponse {
  data: {
    title?: string;
    results?: any;
  };
  status?: number;
}

export interface IRequest {
  url: string; // must be full URL now
  method: "GET" | "POST" | "PUT" | "DELETE";
  postData?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

const auth = {
  username: 'username',
  password: 'password',
};

const createAuth = base64.encode(`${auth.username}:${auth.password}`);

const parseResults = (value: string): any => {
  try {
    return JSON.parse(value);
  } catch {
    return { title: 'Failed to parse error response' };
  }
};

// Axios interceptor to handle expired token
axios.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Token is invalid/expired
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      window.location.href = '/members/signout?reason=expired';
    }
    return Promise.reject(error);
  }
);

const getResponse = async (parameters: IRequest): Promise<IResponse> => {
  let response: AxiosResponse<any, any>;

  const url = parameters.url;

  const headers = parameters.headers || {
    Authorization: `Basic ${createAuth}`,
  };

  const timeout = parameters.timeout || 15000;

  try {
    if (parameters.method === 'GET') {
      response = await axios.get(url, { headers, timeout });
    } else if (parameters.method === 'POST') {
      response = await axios.post(url, parameters.postData, { headers, timeout });
    } else {
      throw new Error('Invalid HTTP method. Please use GET or POST.');
    }

    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError;
      const responseText = axiosErr.request?.responseText;

      const parsedResults = responseText
        ? parseResults(responseText)
        : { title: axiosErr.message };

      return {
        data: parsedResults,
        status: axiosErr.response?.status,
      };
    }

    return {
      data: {
        title: (error as Error).message,
      },
      status: 0,
    };
  }
};

const Request = {
  getResponse,
};

export default Request;
