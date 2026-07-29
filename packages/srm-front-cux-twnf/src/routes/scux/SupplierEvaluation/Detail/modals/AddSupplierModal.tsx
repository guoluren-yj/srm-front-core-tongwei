import React from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';

import {
  prefix,
  supplierBusinessStandardDS,
  supplierTechnicalStandardDS,
  supplierSelectDS,
} from '../initialDs';
import intl from 'hzero-front/lib/utils/intl';
import FormPro from '../../../../../components/FormPro';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import styles from './index.less';

const { Panel } = Collapse;

export const openAddSupplierModal = (dataSet: any, basicInfoDs: any) => {
  const supplierSelectDs = new DataSet(supplierSelectDS());
  const businessStandardDs = new DataSet(supplierBusinessStandardDS(dataSet.getState('nominationHeaderId'), supplierSelectDs));
  const technicalStandardDs = new DataSet(supplierTechnicalStandardDS(dataSet.getState('nominationHeaderId')));
  supplierSelectDs.setQueryParameter('companyId', basicInfoDs.current?.get('companyId'));

  const businessFields = [
    { name: 'taxLevel', _type: 'Select', colSpan: 2 },
    { name: 'supplierRating', _type: 'Select', colSpan: 2 },
    { name: 'registeredCapitalFrom', _type: 'NumberField' },
    { name: 'registeredCapitalTo', _type: 'NumberField' },
    { name: 'paidInCapitalFrom', _type: 'NumberField' },
    { name: 'paidInCapitalTo', _type: 'NumberField' },
    { name: 'establishmentYearsFrom', _type: 'NumberField' },
    { name: 'establishmentYearsTo', _type: 'NumberField' },
  ];

  const technicalColumns = [
    { name: 'seqNum', width: 80 },
    { name: 'mainCategoryName', width: 200 },
    { name: 'qualificationType', width: 150 },
    { name: 'qualificationGrade', width: 150 },
  ];

  const supplierColumns = [
    { name: 'supplierCompanyName', width: 200 },
    { name: 'supplierCompanyNum', width: 150 },
    { name: 'registeredCapital', width: 120 },
    { name: 'paidInCapital', width: 120 },
    { name: 'buildDate', width: 120 },
    { name: 'taxLevel', width: 120 },
    { name: 'supplierRating', width: 120 },
  ];

  const handleOk = async () => {
    const selectedSuppliers = supplierSelectDs.selected;
    if (selectedSuppliers.length > 0) {
      const originData = selectedSuppliers.map((record: any) => ({ ...record.toData(), _status: 'add'}));
      const targetData = originData.filter((sup) => dataSet.every((item: any) => item.get('supplierCompanyNum') !== sup.supplierCompanyNum));
      targetData.map(data => {
        dataSet.create(data)
      })
    }
    return true;
  };

  Modal.open({
    key: Modal.key(),
    drawer: true,
    title: intl.get(`${prefix}.view.supplier`).d('供应商'),
    style: { width: 1000 },
    children: (
      <div className={styles['detail-container']}>
        <Collapse trigger="text-icon" ghost expandIconPosition="text-right" defaultActiveKey={['businessStandard', 'technicalStandard', 'supplier']}>
          <Panel header={intl.get(`${prefix}.view.businessStandard`).d('商务标准')} key="businessStandard">
            <FormPro
              dataSet={businessStandardDs}
              columns={4}
              fields={businessFields}
              readOnly
            />
          </Panel>
          <Panel header={intl.get(`${prefix}.view.technicalStandard`).d('技术标准')} key="technicalStandard">
            <Table
              dataSet={technicalStandardDs}
              columns={technicalColumns}
              customizedCode="customized"
            />
          </Panel>
          <Panel header={intl.get(`${prefix}.view.supplier`).d('供应商')} key="supplier">
            <FilterBarTable
              dataSet={supplierSelectDs}
              columns={supplierColumns}
              customizedCode="customized"
              filterBarConfig={{
                autoQuery: false,
              }}
            />
          </Panel>
        </Collapse>
      </div>
    ),
    onOk: handleOk,
    okText: intl.get('hzero.common.button.ok').d('确定'),
    cancelText: intl.get('hzero.common.button.cancel').d('取消'),
    destroyOnClose: true,
  });
};

const AddSupplierModal: React.FC = () => {
  return null;
};

export default AddSupplierModal;
