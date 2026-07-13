/**
 * 关系排查报告
 */

import React, { useEffect, useState } from 'react';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getAccessToken, getCurrentLanguage } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { getEnvConfig } from 'utils/iocUtils';

import { fetchRiskTroubleshoot } from '@/services/riskProfileService';
import { getRealUrlParam } from '@/utils/utils';

import styles from './index.less';

const { HZERO_FILE } = getEnvConfig();

const RiskProfile = props => {
  const { location = {} } = props;
  const { search = '' } = location;

  const {
    businessNumber = '',
    businessType = '',
    dataType = '',
    organizationId = '',
    _timestamp = '',
    lang = '',
  } = getRealUrlParam(search);

  const [result, setResult] = useState({});
  const [showSpan, setShowSpan] = useState(false);

  useEffect(() => {
    if (businessType && businessNumber) {
      fetchRiskTroubleshoot({
        businessNumber,
        businessType,
        dataType,
        organizationId,
        lang: getCurrentLanguage() || lang,
      }).then(res => {
        if (getResponse(res)) {
          setResult(res);
        }
      });
    }
  }, [businessNumber, businessType, organizationId, _timestamp]);

  const handleDownLoad = () => {
    if (result?.fileUrl) {
      window.open(
        `${HZERO_FILE}/v1/${organizationId}/file-preview/by-url?url=${
          result.fileUrl
        }&bucketName=${PRIVATE_BUCKET}&access_token=${getAccessToken()}`
      );
    }
  };

  const toggleStatus = () => {
    setShowSpan(!showSpan);
  };

  return (
    <>
      {result?.relationFlag ? (
        <div className={styles['risk-profile-basic']}>
          <div className={styles['risk-profile-toggle-row']}>
            <Icon type="error" style={{ marginRight: '8px', fontSize: '16px' }} />
            <div>{intl.get('sdat.riskTroubleshoot.view.title.riskTip').d('风险提示')}</div>
            <Icon
              type={showSpan ? 'expand_less' : 'expand_more'}
              style={{ marginLeft: '8px', cursor: 'pointer' }}
              onClick={toggleStatus}
            />
          </div>
          {showSpan ? (
            <div style={{ marginLeft: '24px', color: '#F06200' }}>
              <div className={styles['risk-profile-row']}>
                <div className={styles['risk-profile-row-title']}>
                  {intl.get('sdat.riskTroubleshoot.view.title.troubleTime').d('排查时间')}：
                </div>
                <div className={styles['risk-profile-row-content']}>{result?.creationDate}</div>
              </div>

              <div className={styles['risk-profile-row']}>
                <div className={styles['risk-profile-row-title']}>
                  {intl.get('sdat.riskTroubleshoot.view.title.investigationScope').d('排查范围')}：
                </div>
                <div className={styles['risk-profile-row-content']}>{result?.companyData}</div>
              </div>

              <div className={styles['risk-profile-row']}>
                <div className={styles['risk-profile-row-title']}>
                  {intl.get('sdat.riskTroubleshoot.view.title.relationType').d('关系类型')}：
                </div>
                <div className={styles['risk-profile-row-content']}>
                  <ul>
                    <li>
                      {intl
                        .get('sdat.riskTroubleshoot.view.title.investmentRelations')
                        .d('投资关系（股东、历史股东）')}
                    </li>
                    ，&nbsp;&nbsp;
                    <li>
                      {intl
                        .get('sdat.riskTroubleshoot.view.title.relationship')
                        .d('任职关系（法定代表人、董监高、历史董监高）')}
                    </li>
                    ，&nbsp;&nbsp;
                    <li>
                      {intl
                        .get('sdat.riskTroubleshoot.view.title.contact')
                        .d(
                          '联系方式（相同电话、相同邮箱、相同地址、历史相同电话、历史相同邮箱、历史相同地址）'
                        )}
                    </li>
                  </ul>
                </div>
              </div>

              <div className={styles['risk-profile-row']}>
                <div className={styles['risk-profile-row-title']}>
                  {intl.get('sdat.riskTroubleshoot.view.title.shootingResults').d('排查结果')}：
                </div>
                <div className={styles['risk-profile-row-content']} style={{ display: 'flex' }}>
                  {result?.relationResult}
                  {result?.fileUrl ? (
                    <div
                      style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => handleDownLoad()}
                    >
                      <Icon
                        type="attach_file"
                        // transform: 'rotate(0.75turn)',
                        style={{ fontSize: '0.14rem', margin: '0 4px 0 8px' }}
                      />
                      <span style={{ textDecoration: 'underline' }}>{result?.fileName}</span>
                      <Icon style={{ fontSize: '0.14rem', marginLeft: '4px' }} type="get_app" />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

export default formatterCollections({
  code: ['sdat.riskTroubleshoot'],
})(RiskProfile);
