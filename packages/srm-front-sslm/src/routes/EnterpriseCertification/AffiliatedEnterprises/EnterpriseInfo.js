/*
 * EnterpriseInfo - 关联企业 - 企业信息
 * @Date: 2022-07-09 19:27:29
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useCallback, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { Form, TextField, Select, Lov, IntlField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { getCurrentOrganizationId } from 'utils/utils';
import TextSearch from '@/routes/components/TextSearch';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();
const isTenantLevel = organizationId !== 0;

const EnterpriseInfo = observer(
  ({ dataSet, changeLovFlag, disabled, personalRegisterFlag, textSearchFlag }) => {
    const currentRecord = dataSet?.current;
    const [domesticFlag, setDomesticFlag] = useState(); // domesticFlag true(境内和个人注册) false(境外注册)
    const [personalFlag, setPersonalFlag] = useState(); // 个人注册
    const [idNumVisable, setIdNumVisable] = useState(currentRecord?.get('idType') === 'I');

    useEffect(() => {
      const domesticData = dataSet?.current.get('domesticForeignRelation');
      const idType = dataSet?.current.get('idType');
      const toBoolean = !!Number(domesticData);
      const toPersonalBoolean = Number(domesticData) === 2;
      setDomesticFlag(toBoolean);
      setPersonalFlag(toPersonalBoolean);
      setIdNumVisable(idType === 'I');
    }, [dataSet?.current.get('domesticForeignRelation')]);

    const handleDomesticChange = useCallback(value => {
      // 切换认证地址时，校验表单数据，重置必输提示信息
      dataSet.validate();
      setDomesticFlag(!!Number(value));
      setPersonalFlag(Number(value) === 2);
    }, []);
    const handleCompanyNameChange = useCallback(value => {
      if (!isEmpty(value)) {
        const { domesticForeignRelation } = value;
        setDomesticFlag(!!Number(domesticForeignRelation));
        setPersonalFlag(Number(domesticForeignRelation) === 2);
      } else {
        setDomesticFlag(false);
        setPersonalFlag(false);
      }
    }, []);

    // 渲染个人注册字段
    const renderPersonalField = useCallback(() => {
      const idCardVisable = personalFlag && idNumVisable;
      const passportVisable = personalFlag && !idCardVisable;
      return (
        <React.Fragment>
          <Lov
            name="registeredCountryObj"
            hidden={!personalFlag}
            disabled={disabled}
            clearButton={false}
            onChange={countryObj => {
              const { countryCode: newCountryCode } = countryObj || {};
              currentRecord.set({
                regionPathName: undefined,
                registeredRegionId: undefined,
              });
              if (newCountryCode === 'CN') {
                currentRecord.set({
                  idType: 'I',
                  passport: undefined,
                });
                setIdNumVisable(true);
              } else {
                const currentIdType = currentRecord.get('idType');
                setIdNumVisable(currentIdType === 'I');
              }
            }}
          />
          <Select
            name="idType"
            hidden={!personalFlag}
            onChange={value => {
              if (value === 'I') {
                currentRecord.set({
                  passport: undefined,
                });
              } else {
                currentRecord.set({
                  idNum: undefined,
                });
              }
              setIdNumVisable(value === 'I');
            }}
          />
          <TextField name="idNum" hidden={!idCardVisable} />
          <TextField name="passport" hidden={!passportVisable} restrict="A-Z,0-9" />
          <TextField
            addonBefore={<Select name="internationalTelCode" clearButton={false} />}
            name="phone"
            hidden={!personalFlag}
          />
        </React.Fragment>
      );
    });

    // 过滤下拉框，未开启个人注册，不展示个人注册选项
    const hanldeOptionFilter = useCallback(
      record => {
        return isTenantLevel && personalRegisterFlag ? true : Number(record.get('value')) !== 2;
      },
      [personalRegisterFlag]
    );

    return (
      <Form
        columns={3}
        dataSet={dataSet}
        labelLayout="float"
        className={styles['addon-before-style']}
        style={{ width: '75%', maxWidth: 1172 }}
      >
        <Select
          name="domesticForeignRelation"
          onChange={handleDomesticChange}
          disabled={disabled}
          optionsFilter={hanldeOptionFilter}
        />
        {changeLovFlag ? (
          <Lov name="companyNameObj" onChange={handleCompanyNameChange} />
        ) : domesticFlag && !personalFlag ? (
          <TextSearch
            dataSet={dataSet}
            name="companyName"
            textSearchFlag={textSearchFlag}
            enableIntl
            searchLength={4}
            legalRepName="legalRepName"
            unifiedSocialCode="unifiedSocialCode"
          />
        ) : (
          <IntlField name="companyName" />
        )}
        <TextField
          name="unifiedSocialCode"
          hidden={!domesticFlag || personalFlag}
          disabled={disabled}
        />
        <TextField name="dunsCode" hidden={domesticFlag || personalFlag} disabled={disabled} />
        <TextField
          name="businessRegistrationNumber"
          hidden={domesticFlag || personalFlag}
          disabled={disabled}
        />
        <TextField name="legalRepName" hidden={personalFlag} disabled={disabled} />
        {renderPersonalField()}
      </Form>
    );
  }
);

export default EnterpriseInfo;
