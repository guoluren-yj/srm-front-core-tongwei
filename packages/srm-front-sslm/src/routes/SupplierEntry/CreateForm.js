/**
 * index.js - 供应商录入
 * @date: 2022-03-14
 * @author: CDJ <yihao.yang@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { useEffect, useState } from 'react';
// import { Input } from 'choerodon-ui';
import { Form, Select, TextField, IntlField, Lov } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';

import TextSearch from '@/routes/components/TextSearch';

import styles from './index.less';

const CreateForm = observer(({ dataSet, textSearchFlag }) => {
  const [domesticForeignRelation, setDomesticForeignRelation] = useState('1');

  useEffect(() => {
    dataSet.current.set('domesticForeignRelation', domesticForeignRelation);
  }, []);

  const chinaFlag = dataSet.current?.get('registeredCountryId')?.countryCode === 'CN';

  return (
    <Form
      dataSet={dataSet}
      labelLayout="float"
      className={classnames(styles.createForm, 'addon-before-style')}
    >
      <Select
        name="domesticForeignRelation"
        onChange={newValue => {
          setDomesticForeignRelation(newValue);
        }}
      />
      {domesticForeignRelation === '1' ? (
        <TextSearch
          dataSet={dataSet}
          name="companyName"
          textSearchFlag={textSearchFlag}
          enableIntl
          searchLength={4}
          unifiedSocialCode="unifiedSocialCode"
        />
      ) : (
        <IntlField name="companyName" />
      )}
      {domesticForeignRelation === '2' && <Lov name="registeredCountryId" clearButton={false} />}
      {domesticForeignRelation === '2' && chinaFlag && <TextField name="idNum" />}
      {domesticForeignRelation === '2' && <TextField name="passport" restrict="A-Z,0-9" />}
      {domesticForeignRelation === '2' && (
        <TextField
          addonBefore={<Select name="internationalTelCode" clearButton={false} />}
          name="phone"
          restrict="0-9,-"
        />
      )}
      {domesticForeignRelation === '0' && (
        <TextField name="businessRegistrationNumber" restrict="-A-Z0-9" />
      )}
      {domesticForeignRelation === '0' && <TextField name="dunsCode" />}
      {domesticForeignRelation === '1' && <TextField name="unifiedSocialCode" />}
    </Form>
  );
});

export default CreateForm;
