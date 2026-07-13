/*
 * @Date: 2022-06-15 15:17:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { connect } from 'dva';
import React, { useEffect, useState, useCallback } from 'react';
import { Route, Switch, Redirect } from 'dva/router';
import { compose, isEmpty } from 'lodash';

import { getRoutes, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'utils/remote';

import { fetchPublicData, fetchPortal } from '@/services/enterpriseCertificationService';
import { fetchSettings } from '@/services/commonService';

const Index = ({ match, routerData, location = {}, enterpriseCertificationRemote }) => {
  const routes = getRoutes(match.path, routerData);
  const [redirectRoutes, setRedirectRoutes] = useState([]);
  const [stepsObj, setStepsObj] = useState({});

  const [domRenderFlag, setDomRenderFlag] = useState(false);

  const { pathname } = location;
  const { firmAttestationStatus: newFirmAttestationStatus } = stepsObj;

  useEffect(() => {
    handlePublicData();
    return () => {
      setDomRenderFlag(false);
    };
  }, [pathname]);

  const handlePublicData = useCallback(() => {
    const { hostname } = window.location;
    Promise.all([fetchSettings(), fetchPublicData(hostname), fetchPortal({ domainName: hostname })])
      .then(response => {
        const [settingData, publicData, portalData] = response;
        let ocrFlag = false;
        let textSearchFlag = true;
        if (getResponse(settingData)) {
          ocrFlag = settingData['000106'] === '1';
          textSearchFlag = settingData['000108'] === '1';
        }
        // 查询当前二级域名在平台门户管理的配置
        let newPersonalRegisterFlag = false;
        if (getResponse(portalData)) {
          // 个人注册标识 personalRegisterFlag
          if (portalData && !isEmpty(portalData.content)) {
            const config = portalData.content[0];
            const { personalRegisterFlag } = config || {};
            newPersonalRegisterFlag = personalRegisterFlag;
          }
        }
        if (getResponse(publicData)) {
          const {
            country,
            realNameFlag,
            userAttestationStatus,
            companyAttestationStatus,
            firmAttestationStatus,
            investigateTemplateId,
            bankAccountCheckType,
            domesticForeignRelation,
            partnerFlag, // 1 - 有合作伙伴
            noRelieve, // 1-不解绑
            companyFlag, // 1-关联表有数据
            strategyCfBasic = {},
            appealFlag,
            existFlag, // 1-关联企业已经生成co编码
            companyName,
            readCooperationFlag, // 已经同意合作条款
            inviteCompanyIds, // 邀请注册的要求合作公司
          } = publicData;
          const goToResultPage =
            firmAttestationStatus === 'SUBMIT' ||
            firmAttestationStatus === 'APPROVING' ||
            firmAttestationStatus === 'REJECT' ||
            firmAttestationStatus === 'WFL_REJECT';
          let toRoute = '/sslm/enterprise-certification/certification';
          if (goToResultPage) {
            toRoute = '/sslm/enterprise-certification/result';
          } else if (!realNameFlag) {
            toRoute =
              companyAttestationStatus && companyAttestationStatus !== 'NEW'
                ? '/sslm/enterprise-certification/affiliated-result'
                : '/sslm/enterprise-certification/affiliated';
          } else if (realNameFlag && userAttestationStatus && userAttestationStatus === 'SUCCESS') {
            toRoute = companyAttestationStatus
              ? companyAttestationStatus !== 'NEW'
                ? '/sslm/enterprise-certification/affiliated-result'
                : '/sslm/enterprise-certification/affiliated'
              : '/sslm/enterprise-certification/certification-result';
          } else if (realNameFlag && userAttestationStatus && userAttestationStatus !== 'NEW') {
            toRoute = '/sslm/enterprise-certification/certification-result';
          }
          toRoute = enterpriseCertificationRemote
            ? enterpriseCertificationRemote.process(
                'SSLM_ENTERPRISE_CERTIFICATION_JUMP_ROUTE',
                toRoute,
                { publicData }
              )
            : toRoute;
          setRedirectRoutes([
            <Redirect exact key="index" from="/sslm/enterprise-certification" to={toRoute} />,
            // <Redirect
            //   exact
            //   key="result"
            //   from="/sslm/enterprise-certification/result"
            //   to="/sslm/enterprise-certification/affiliated-result"
            // />,
            <Redirect
              exact
              key="preview"
              from="/sslm/enterprise-certification/preview-result"
              to="/sslm/enterprise-certification/result"
            />,
          ]);
          setStepsObj({
            country,
            realNameFlag,
            investigateTemplateId,
            bankAccountCheckType,
            domesticForeignRelation,
            partnerFlag,
            noRelieve,
            companyFlag,
            strategyCfBasic,
            ocrFlag,
            textSearchFlag,
            firmAttestationStatus,
            appealFlag,
            existFlag,
            companyName,
            personalRegisterFlag: newPersonalRegisterFlag,
            readCooperationFlag,
            inviteCompanyIds,
          });
        }
      })
      .finally(() => setDomRenderFlag(true));
  }, []);

  const finalRoutes =
    newFirmAttestationStatus === 'REJECT'
      ? routes.filter(
          r =>
            // r.path !== '/sslm/enterprise-certification/result' &&
            r.path !== '/sslm/enterprise-certification/preview-result'
        )
      : routes;
  return domRenderFlag ? (
    <Switch>
      {finalRoutes.map(item => (
        <Route
          key={item.key}
          path={item.path}
          render={props =>
            React.createElement(item.component, {
              ...props,
              stepsObj,
              setStepsObj,
              enterpriseCertificationRemote,
            })
          }
        />
      ))}
      {redirectRoutes}
    </Switch>
  ) : null;
};

export default compose(
  formatterCollections({
    code: [
      'spfm.enterpriseCertification',
      'spfm.supplierRegister',
      'spfm.enterprise',
      'spfm.contactPerson',
      'spfm.bank',
      'spfm.supplierManage',
      'spfm.approval',
      'spfm.business',
      'spfm.certificationApproval',
      'spfm.address',
      'spfm.finance',
      'spfm.attachment',
      'spfm.common',
      'entity.attachment',
      'sslm.common',
      'sslm.enterpriseInform',
      'sslm.supplierInform',
      'sslm.investCorrelat',
      'sslm.supplyAbility',
      'sslm.supplierEntry',
    ],
  }),
  remote(
    {
      code: 'SSLM_ENTERPRISE_CERTIFICATION', // 对应二开模块暴露的Expose的编码
      name: 'enterpriseCertificationRemote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      events: {
        cuxAffiliatedEnterprisesSave() {}, // 关联企业二开保存
        cuxMainInfoPrevious() {}, // 主要信息上一步
      },
    }
  ),
  connect(({ global }) => ({
    routerData: global.routerData,
  }))
)(Index);
