import { getAccessToken, getRequestId } from 'utils/utils';
import axios from 'axios';
import { getMenuId } from 'utils/menuTab';
import { getEnvConfig } from 'utils/iocUtils';

const { API_HOST } = getEnvConfig();

const withTokenAxios = axios.create();
const jsonMimeType = 'application/json; charset=utf-8';

withTokenAxios.defaults = {
  ...withTokenAxios.defaults,
  headers: {
    ...(withTokenAxios.defaults || {}).headers,
    'Content-Type': jsonMimeType,
    Accept: 'application/json;',
    // 'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
};

// Add a request interceptor
withTokenAxios.interceptors.request.use(
  (config) => {
    let { url = '' } = config;
    if (url.indexOf('://') === -1 && !url.startsWith('/_api')) {
      url = `${API_HOST}${url}`;
    }
    // Do something before request is sent
    return {
      ...config,
      url,
      headers: {
        ...config.headers,
        Authorization: `bearer ${getAccessToken()}`,
        'H-Request-Id': `${getRequestId()}`,
        'H-Menu-Id': `${getMenuId()}`,
      },
    };
  },
  (err) => {
    return Promise.reject(err);
  }
);

withTokenAxios.interceptors.response.use(
  (res) => {
    const { status, data } = res;
    if (status === 204 || status === 200) {
      return res;
    }
    if (data && data.failed) {
      throw res;
    } else {
      return res;
    }
  },
  (err) => {
    throw err;
  }
);

export default withTokenAxios;
