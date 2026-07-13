/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-09-02 16:28:34
 * @FilePath: /srm-front-spfm/src/routes/PortalConfig/index.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
/**
 * PortalConfig - 门户配置
 * @date: 2021-06-23
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useMemo, useState, useEffect } from 'react';
import { cleanCookies } from 'universal-cookie/cjs/utils';
import { ModalProvider } from 'choerodon-ui/pro';
import { getAccessToken, extractAccessTokenFromHash, setAccessToken } from 'utils/utils';
import { setSecureCookie } from 'srm-front-boot/lib/utils/utils';
import { getUserSelfService } from '@/services/portalService';
import { getExpires } from '@/utils/utils';
import StoreProvider from './store';
import PortalConfig from './PortalConfig';

const { origin, pathname, search } = window.location;
/**
 * @function getUrlParam 解析url参数
 * @param {name} - name
 */
const getUrlParam = name => {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`); // 构造一个含有目标参数的正则表达式对象
  const r = search.substr(1).match(reg); // 匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; // 返回参数值
};

/**
 * @function isReload 是否刷新页面
 */
const isReload = () => {
  const baseUrl = origin + pathname;
  const loginStatus = getUrlParam('login'); // 登录状态
  const accessToken = extractAccessTokenFromHash(window.location.hash);
  if (accessToken) {
    // 已登录且存在token时，存储token并刷新页面
    setAccessToken(accessToken);
    window.location.hash = '';
  }

  if (loginStatus === 'success') {
    const authorizeUrl = `${origin}/oauth/oauth/authorize?response_type=token&client_id=srm-front&redirect_uri=${encodeURIComponent(
      baseUrl
    )}`;
    window.location.replace(authorizeUrl);
  }
};

isReload();

export default props => {
  const [needRequest, setNeedRequest] = useState(
    props.match.path.includes('/public/home') && getAccessToken()
  );
  useEffect(() => {
    // 获取用户信息，判断是否为失效token
    if (needRequest) {
      getUserSelfService()
        .then(res => {
          if (res && res.currentRoleCode.includes('guest')) {
            window.location.replace(
              `${window.$$env.BASE_PATH || '/'}spfm/simplified-register/list`
            );
          } else if (res && res.currentRoleCode.includes('certification')) {
            window.location.replace(
              `${window.$$env.BASE_PATH || '/'}sslm/enterprise-certification`
            );
          }
          setSecureCookie('realName', res.realName, { path: '/', expires: getExpires(86400000) });
          // 记录当前登录为平台级/租户级
          setSecureCookie('isTenant', res.tenantId, { path: '/', expires: getExpires(86400000) });
          setNeedRequest(false);
        })
        .catch(() => {
          cleanCookies();
          setNeedRequest(false);
        });
    } else {
      setNeedRequest(false);
    }
  }, []);

  return useMemo(() => {
    if (needRequest) {
      return null;
    }
    return (
      <StoreProvider {...props}>
        <ModalProvider>
          <PortalConfig />
        </ModalProvider>
      </StoreProvider>
    );
  }, [needRequest, props]);
};
