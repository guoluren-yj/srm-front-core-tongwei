/*
 * MainInfo - 企业主要信息
 * @Date: 2022-07-02 09:57:53
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { Fragment, Component } from 'react';
import { DataSet, notification, Button } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, round } from 'lodash';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import querystring from 'querystring';
// import { routerRedux } from 'dva/router';

import { getResponse, getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';

import { saveBasicInfo } from '@/services/enterpriseCertificationService';
import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';
import { getLegalDS } from './stores/legalDS';

import LegalInfo from './LegalInfo';
import ValidationSteps from '../components/ValidationSteps';

import styles from '../index.less';

const language = getCurrentLanguage();
const organizationId = getCurrentOrganizationId();
const isTenantLevel = organizationId !== 0;
const isChinese = language === 'zh_CN'; // 中文语言环境

/**
 * 主要信息
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
export default class MainInfo extends Component {
  constructor(props) {
    super(props);
    // 是否是预览
    const isPreview = props.location?.pathname?.match('preview');
    const routerParam = querystring.parse(props.location?.search?.substr(1));
    const { domesticForeignRelation, changeReqId } = routerParam;
    let domesticFlag = domesticForeignRelation;
    // domesticFlag true(境内和个人注册) false(境外注册)
    domesticFlag = Number(domesticFlag);
    // 个人注册
    const personalFlag = domesticFlag === 2;
    this.state = {
      // isEdit: true,
      pageLoading: false,
      orcLoading: false,
      domesticFlag: !!domesticFlag,
      personalFlag,
      changeReqId,
      isPreview,
    };
  }

  legalDS = new DataSet({
    ...getLegalDS(),
  });

  componentDidMount() {
    this.handleQueryLegalInfo();
  }

  // 处理查询
  @Bind()
  handleQueryLegalInfo() {
    const { changeReqId } = this.state;
    this.setState({
      pageLoading: true,
    });
    this.legalDS.setQueryParameter('changeReqId', changeReqId);
    this.legalDS.query().finally(() => {
      this.setState({
        pageLoading: false,
      });
    });
  }

  @Bind()
  async handlePrevious() {
    const { history, enterpriseCertificationRemote } = this.props;
    if (enterpriseCertificationRemote) {
      const eventProps = {
        history,
      };
      const cuxResult = await enterpriseCertificationRemote.event.fireEvent(
        'cuxMainInfoPrevious',
        eventProps
      );
      if (!cuxResult) {
        return;
      }
    }
    history.push({
      pathname: `/sslm/enterprise-certification/affiliated-result`,
    });
  }

  @Bind()
  handleGoToNext() {
    const { history } = this.props;
    const { changeReqId } = this.state;
    history.push({
      pathname: `/sslm/enterprise-certification/secondary-info`,
      search: querystring.stringify({
        changeReqId,
      }),
    });
  }

  @Bind()
  async handleSaveAndNext(nextFlag = false) {
    const { stepsObj = {} } = this.props;
    const { existFlag, partnerFlag } = stepsObj;
    const { changeReqId } = this.state;
    // 二级域名注册存在已认证的公司，但是没有合作伙伴可以编辑基本，业务信息
    const disabled = isTenantLevel ? partnerFlag === 1 : partnerFlag === 1 || existFlag === 1; // 页签只读不校验必填
    if (disabled) {
      // 下一步
      if (nextFlag) {
        this.handleGoToNext();
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl
            .get('spfm.supplierRegister.view.message.noNeedSaveData')
            .d('暂无需要保存的数据！'),
        });
      }
    } else if (this.legalDS.dirty) {
      const currentRecord = this.legalDS.current;
      const licenceUrlField = this.legalDS.getField('licenceUrl', currentRecord);
      const licenceUrlValidateFlag = await licenceUrlField.checkValidity(currentRecord);

      // 校验个人注册身份证附件
      const idFrontField = this.legalDS.getField('idFrontUuid', currentRecord);
      const idFrontValidateFlag = await idFrontField.checkValidity(currentRecord);
      const idBackField = this.legalDS.getField('idBackUuid', currentRecord);
      const idBackValidateFlag = await idBackField.checkValidity(currentRecord);

      const validateFlag = await this.legalDS?.current?.validate();
      if (validateFlag) {
        this.setState({
          pageLoading: true,
        });
        const data = this.legalDS?.current?.toJSONData() || {};
        let payload = {};
        const { currencyObj, registeredCountryObj, registeredCapital, ...other } = data;
        payload = {
          ...other,
          businessRegistrationNumber:
            data.domesticForeignRelation === '0' ? data.businessRegistrationNumber : null,
          registeredCapital:
            language === 'en_US'
              ? registeredCapital
                ? round(registeredCapital * 100, 6)
                : registeredCapital
              : registeredCapital,
          dataSource: 4,
        };
        if (payload.domesticForeignRelation === '0') {
          const {
            unifiedSocialCode,
            companyType,
            taxpayerType,
            licenceEndDate,
            longTermFlag,
            institutionalType,
            idType,
            idNum,
            passport,
            email,
            internationalTelCode,
            phone,
            idFrontUuid,
            idBackUuid,
            ...otherFieldValues
          } = payload;
          payload = otherFieldValues;
        }
        if (payload.domesticForeignRelation === '1') {
          const {
            businessRegistrationNumber,
            idType,
            idNum,
            passport,
            email,
            internationalTelCode,
            phone,
            idFrontUuid,
            idBackUuid,
            ...otherFieldValues
          } = payload;
          payload = otherFieldValues;
        }
        if (payload.domesticForeignRelation === '2') {
          const {
            unifiedSocialCode,
            companyType,
            taxpayerType,
            // longTermFlag,
            institutionalType,
            organizingInstitutionCode,
            dunsCode,
            businessRegistrationNumber,
            licenceUrl,
            ...otherFieldValues
          } = payload;
          payload = otherFieldValues;
        }
        if (isEmpty(payload.dunsCode)) {
          payload.dunsCode = null;
        }
        if (isEmpty(payload.organizingInstitutionCode)) {
          payload.organizingInstitutionCode = null;
        }
        return new Promise(resolve => {
          saveBasicInfo({
            changeReqId,
            ...payload,
          })
            .then(res => {
              if (getResponse(res)) {
                notification.success({
                  placement: 'bottomRight',
                  message: intl.get('hzero.common.notification.success').d('操作成功'),
                });
                if (nextFlag) {
                  this.handleGoToNext();
                } else {
                  this.handleQueryLegalInfo();
                }
              }
            })
            .finally(() => {
              this.setState({
                pageLoading: false,
              });
              resolve();
            });
        });
      } else if (!licenceUrlValidateFlag) {
        notification.error({
          placement: 'bottomRight',
          message: intl
            .get('spfm.enterprise.view.message.upload.businessLicense')
            .d('请上传营业执照'),
        });
      } else if (!idFrontValidateFlag || !idBackValidateFlag) {
        notification.error({
          placement: 'bottomRight',
          message: intl
            .get('spfm.enterprise.view.message.upload.identityDocument')
            .d('请上传身份证件'),
        });
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl
            .get('spfm.supplierRegister.view.message.maintainInfo')
            .d('请维护相关信息！'),
        });
      }
    } else if (nextFlag) {
      // 下一步
      this.handleGoToNext();
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl
          .get('spfm.supplierRegister.view.message.noNeedSaveData')
          .d('暂无需要保存的数据！'),
      });
    }
  }

  render() {
    const {
      pageLoading,
      orcLoading,
      domesticFlag,
      personalFlag,
      isPreview,
      changeReqId,
    } = this.state;
    const { location, stepsObj = {}, enterpriseCertificationRemote } = this.props;
    const { existFlag, partnerFlag } = stepsObj;

    const sourceKey = 'ENTERPRISE_CERTIFICATION';
    const loading = pageLoading || orcLoading;
    // 二级域名注册存在已认证的公司，但是没有合作伙伴可以编辑基本，业务信息，营业执照隐藏不校验必填
    const disabled = isTenantLevel ? partnerFlag === 1 : partnerFlag === 1 || existFlag === 1;
    const legalInfoData = this.legalDS.current && this.legalDS.current.toData();
    // src-31313 登记信息可编辑的时候，如果企业之前认证的营业执照没有则允许上传营业执照
    if (!isEmpty(legalInfoData)) {
      const { havePlatformLicence = 1 } = legalInfoData;
      this.legalDS.setState({
        licenceUrlHidden:
          isTenantLevel && partnerFlag !== 1 && existFlag === 1 && !!havePlatformLicence,
      });
    }
    const isEdit = !isPreview && !disabled;

    const legalProps = {
      isEdit,
      domesticFlag,
      personalFlag,
      changeReqId,
      dataSet: this.legalDS,
      remote: enterpriseCertificationRemote,
      handleQueryLegalInfo: this.handleQueryLegalInfo,
    };

    return (
      <Fragment>
        {!isPreview && (
          <Header
            title={intl
              .get('spfm.enterpriseCertification.view.title.enterpriseCertification')
              .d('企业认证')}
          >
            <Button
              icon="arrow_forward"
              color="primary"
              type="primary"
              onClick={() => this.handleSaveAndNext(true)}
              loading={loading}
              wait={200}
              waitType="debounce"
            >
              {intl.get('sslm.common.view.btn.nextStep').d('下一步')}
            </Button>
            <Button
              icon="arrow_back"
              funcType="flat"
              onClick={this.handlePrevious}
              loading={loading}
            >
              {intl.get('sslm.common.view.btn.lastStep').d('上一步')}
            </Button>
            <Button
              icon="save"
              funcType="flat"
              onClick={() => this.handleSaveAndNext()}
              loading={loading}
              wait={200}
              waitType="debounce"
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </Header>
        )}
        {!isPreview && <ValidationSteps location={location} stepsObj={stepsObj} />}
        <Content className={styles['main-index-content']}>
          <Spin spinning={loading}>
            {!isEmpty(legalInfoData?.zhimaLabels) && isChinese && (
              <div className={styles['enterprise-tags-wrap']}>
                <div className={styles['enterprise-tags-content']}>
                  <div className={styles['enterprise-name']}>{legalInfoData?.companyName}</div>
                  <EnterpriseTags
                    showHelp
                    key={sourceKey}
                    tagList={legalInfoData?.zhimaLabels}
                    parentId="sslmEnterpriseCertification"
                    tagClassName="sslm-enterprise-certification"
                  />
                </div>
              </div>
            )}
            <div id="regInfo">
              <div className={styles['certification-title']}>
                {intl.get('spfm.enterprise.view.message.page.regInfo').d('登记信息')}
                {isEdit && (
                  <div className={styles['certification-title-tips']}>
                    {intl
                      .get('spfm.enterpriseCertification.view.message.regInfoTips')
                      .d(
                        '请正确填写或更新有效的企业基本信息，以便您的合作伙伴参考使用，或发展潜在的合作关系。'
                      )}
                  </div>
                )}
              </div>
              <LegalInfo {...legalProps} />
            </div>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
