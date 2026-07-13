import React, { Fragment } from 'react'; //

import intl from 'utils/intl';
import { Content } from 'components/Page';
import classnames from 'classnames';
import {
  TextField,
  DatePicker,
  Select,
  Lov,
  NumberField,
  Form,
  Table,
  Button,
} from 'choerodon-ui/pro';
import { compose } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import AttachmentInfo from '../components/Attachment';
import ReadForm from './ReadForm.js';
import styles from '../../Mould/index.less';

const Index = ({
  formDs,
  tableDS,
  maExpandDs,
  currentStatus,
  customizeTable,
  customizeForm,
  showContent,
}) => {
  const columns = [
    {
      name: 'lineNum',
      width: 80,
    },
    {
      name: 'itemLov',
      width: 150,
      editor: currentStatus === 'PENDING',
    },
    {
      name: 'itemName',
      width: 150,
      editor: currentStatus === 'PENDING',
    },
    {
      name: 'categoryId',
      width: 300,
      editor: currentStatus === 'PENDING',
    },
    {
      name: 'uomId',
      width: 150,
      editor: currentStatus === 'PENDING',
    },
    {
      name: 'quantity',
      width: 150,
      editor: currentStatus === 'PENDING',
    },
    {
      name: 'modelSpecs',
      width: 150,
      editor: currentStatus === 'PENDING',
    },
  ];
  const maExpandCol = [
    {
      name: 'lineNum',
      width: 80,
    },
  ];

  // 行删除
  const deleteLine = (type) => {
    if (type === 'expand') {
      const { selected } = maExpandDs;
      const unSelectedLines = [];
      maExpandDs.delete(selected, false);
      const selectRecordId = selected.map((ele) => ele.id);
      maExpandDs.forEach((record) => {
        if (!selectRecordId.includes(record.id)) {
          unSelectedLines.push(record);
        }
      });
      maExpandDs.loadData(unSelectedLines);
    } else {
      const { selected } = tableDS;
      const unSelectedLines = [];
      tableDS.delete(selected, false);
      const selectRecordId = selected.map((ele) => ele.id);
      tableDS.forEach((record) => {
        if (!selectRecordId.includes(record.id)) {
          unSelectedLines.push(record);
        }
      });
      tableDS.loadData(unSelectedLines);
    }
  };

  // 行按钮
  const DeleteBtn = observer(() => {
    const isDisabled = tableDS.selected.length === 0;
    return (
      <Button
        className={styles.tableDeleteBtn}
        icon="delete"
        funcType="flat"
        disabled={isDisabled}
        onClick={deleteLine}
      >
        {intl.get(`hzero.common.button.delete`).d('删除')}
      </Button>
    );
  });
  const btns = ['add', <DeleteBtn />];

  const DeleteExpandBtn = observer(() => {
    // const { tableDS } =this.props;
    const isDisabled = maExpandDs.selected.length === 0;
    return (
      <Button
        className={styles.tableDeleteBtn}
        icon="delete"
        funcType="flat"
        disabled={isDisabled}
        onClick={() => deleteLine('expand')}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    );
  });

  return (
    <Fragment>
      <div className={`${classnames(styles['rfx-detail-list-card'])} ${styles.block}`}>
        <Content
          className={`${styles['custom-page-content']} ${styles['custom-page-form-content']} ${styles.customMargin}`}
        >
          <h3 id="newAddSupplierCompany" className={styles['rfx-card-item-title']}>
            {intl.get('siec.mould.model.common.mouldBaseInfo').d('模具基础信息')}
          </h3>
          {currentStatus === 'PENDING' ? (
            customizeForm(
              { code: 'SIEC.MOULD_PLATFORM.DETAIL.HEADER', dataSet: formDs },
              <Form dataSet={formDs} columns={3} labelLayout="float">
                <TextField name="maNum" />
                <Lov name="companyLov" />
                <Lov name="supplierLov" />
                <Lov name="mouldPrincipalLov" />
                <Lov name="mouldLov" />
                <TextField name="mouldName" />
                <TextField name="modelSpecs" />
                <Lov name="uomLov" />
                <NumberField name="shareQuality" />
                <NumberField name="mouldLife" />
                <NumberField name="mouldQuality" />
                <NumberField name="mouldValue" />
                <TextField name="moldingCycle" />
                <TextField name="machineTonnage" />
                <NumberField name="cavityQuality" />
                <Select name="mouldType" />
                <Select name="mouldOwner" />
                <DatePicker name="effectiveTimeFrom" />
                <DatePicker name="effectiveTimeTo" />
                <NumberField name="usedValue" />
                <NumberField name="remainValue" />
                <NumberField name="usedQuality" />
                <NumberField name="remainQuality" />
                <TextField name="createdByName" />
                <DatePicker name="creationDate" />
              </Form>
            )
          ) : (
            <ReadForm
              customizeForm={customizeForm}
              dataSet={formDs}
              code="SIEC.MOULD_PLATFORM.DETAIL.HEADER"
            />
          )}
        </Content>
        <Content className={`${styles['custom-page-content']} ${styles.mouldBaseInfoContent}`}>
          <h3 id="purchaseOrgInfo" className={styles['rfx-card-item-title']}>
            {intl.get('siec.mould.common.relateItemInfo').d('关联物料信息')}
          </h3>
          {customizeTable(
            {
              code: 'SIEC.MOULD_PLATFORM.DETAIL.LIST',
              dataSet: tableDS,
            },
            <Table
              className={styles.customTable}
              dataSet={tableDS}
              buttons={currentStatus === 'PENDING' ? btns : []}
              columns={columns}
            />
          )}
        </Content>
        {showContent && (
          <Content className={`${styles['custom-page-content']} ${styles.mouldBaseInfoContent}`}>
            <h3 id="purchaseOrgInfo" className={styles['rfx-card-item-title']}>
              {intl.get('siec.mould.common.expandLine').d('关联子模具信息')}
            </h3>
            {customizeTable(
              {
                code: 'SIEC.MOULD_PLATFORM.DETAIL.EXPAND_LINE',
                dataSet: maExpandDs,
              },
              <Table
                style={{ maxHeight: '450px' }}
                className={styles.customTable}
                dataSet={maExpandDs}
                buttons={currentStatus === 'PENDING' ? ['add', <DeleteExpandBtn />] : []}
                columns={maExpandCol}
              />
            )}
          </Content>
        )}
        <Content className={`${styles['custom-page-content']} ${styles.mouldBaseInfoContent}`}>
          <h3 id="attachment" className={styles['rfx-card-item-title']}>
            {intl.get('siec.mould.model.common.attachment').d('附件')}
          </h3>
          <AttachmentInfo
            attachmentUuid={formDs.current.get('attachmentUuid')}
            formDs={formDs}
            code="SIEC.MOULD_PLATFORM.DETAIL.ATTACHMENTINFO"
            customizeForm={customizeForm}
          />
        </Content>
      </div>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['hzero.common', 'siec.mould'],
  }),
  WithCustomizeC7N({
    unitCode: [
      'SIEC.MOULD_PLATFORM.DETAIL.LIST',
      'SIEC.MOULD_PLATFORM.DETAIL.HEADER',
      'SIEC.MOULD_PLATFORM.DETAIL.EXPAND_LINE',
      'SIEC.MOULD_PLATFORM.DETAIL.ATTACHMENTINFO',
    ],
  })
)(Index);
