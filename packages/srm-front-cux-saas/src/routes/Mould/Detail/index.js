import React, { Component, Fragment } from 'react';
import {
  Button,
  TextField,
  DatePicker,
  Select,
  Lov,
  Attachment,
  NumberField,
  TextArea,
  Form,
  Table,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { observer as mobserver } from 'mobx-react';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { fetchPermissions } from '@/services/mouldMasterData';

import { Content } from 'components/Page';
// import ReadForm from './ReadForm.js';
import styles from '../index.less';

@formatterCollections({
  code: ['hzero.common', 'siec.mould'],
})
@WithCustomizeC7N({
  unitCode: [
    'SIEC.MOULD_DATA.DETAIL.HEADER',
    'SIEC.MOULD_DATA.DETAIL.LIST',
    'SIEC.MOULD_DATA.DETAIL.EXPAND_LIST',
    'SIEC.MOULD_DATA.DETAIL.HEADER_CHANGE',
  ],
})
@mobserver
class index extends Component {
  constructor(props) {
    super(props);
    this.state = { showContent: false };
  }

  deleteLine = type => {
    // const { mouldItemList } = this.state;
    // const selectedRecords = this.tableDS.selected;
    // let newMouldItemList = mouldItemList;
    // selectedRecords.forEach(i => {
    //   const data = i.toData();
    //   newMouldItemList = newMouldItemList.filter(item => item.itemId !== data.itemId);
    // });
    // this.setState({
    //   mouldItemList: newMouldItemList,
    // });
    const { tableDS, maExpandDs } = this.props;
    if (type === 'expand') {
      const { selected } = maExpandDs;
      const unSelectedLines = [];
      maExpandDs.delete(selected, false);
      const selectRecordId = selected.map(ele => ele.id);
      maExpandDs.forEach(record => {
        if (!selectRecordId.includes(record.id)) {
          unSelectedLines.push(record);
        }
      });
      maExpandDs.loadData(unSelectedLines);
    } else {
      const { selected } = tableDS;
      const unSelectedLines = [];
      tableDS.delete(selected, false);
      const selectRecordId = selected.map(ele => ele.id);
      tableDS.forEach(record => {
        if (!selectRecordId.includes(record.id)) {
          unSelectedLines.push(record);
        }
      });
      tableDS.loadData(unSelectedLines);
    }
  };

  componentDidMount() {
    fetchPermissions(['srm.pcn-admin.mould-manager.mould-data.ps.maexpend_content']).then(res => {
      this.setState({ showContent: res[0].approve });
    });
  }

  render() {
    const { customizeForm, customizeTable, formDs, tableDS, maExpandDs, statusMap } = this.props;

    // 子组件的状态由子组件自身管理
    const mouldStatus = formDs?.current?.get('mouldStatus');
    const isCreate = !formDs?.current?.get('mouldId');
    const isEdit = isCreate || ['NEW'].includes(mouldStatus);

    const lineChangeFlag =
      mouldStatus === 'EFFECTIVE' &&
      statusMap.size &&
      statusMap.get(mouldStatus) &&
      statusMap.get(mouldStatus).includes('CHANGE');

    const { showContent } = this.state;
    const columns = [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'itemLov',
        width: 180,
        editor: isEdit || lineChangeFlag,
      },
      {
        name: 'itemName',
        width: 180,
        editor: isEdit || lineChangeFlag,
      },
      {
        name: 'categoryId',
        width: 300,
        editor: isEdit || lineChangeFlag,
      },
      {
        name: 'uomId',
        width: 150,
        editor: isEdit || lineChangeFlag,
      },
    ];
    // console.log(maExpandDs);
    const maExpandCol = [
      {
        name: 'lineNum',
        width: 80,
      },
    ];
    const DeleteBtn = observer(() => {
      // const { tableDS } =this.props;
      const isDisabled = tableDS.selected.length === 0;
      return (
        <Button
          className={styles.tableDeleteBtn}
          icon="delete"
          funcType="flat"
          disabled={isDisabled}
          onClick={() => this.deleteLine()}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
      );
    });
    const DeleteExpandBtn = observer(() => {
      // const { tableDS } =this.props;
      const isDisabled = maExpandDs.selected.length === 0;
      return (
        <Button
          className={styles.tableDeleteBtn}
          icon="delete"
          funcType="flat"
          disabled={isDisabled}
          onClick={() => this.deleteLine('expand')}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
      );
    });
    const btns = ['add', <DeleteBtn />];
    return (
      <Fragment>
        <Content
          className={`${styles['custom-page-content']} ${styles['custom-page-form-content']} ${
            styles['custom-mould-page-form-content']
          } ${styles.customMargin}`}
        >
          <h3 id="newAddSupplierCompany" className={styles['rfx-card-item-title']}>
            {intl.get('siec.mould.model.common.mouldBaseInfo').d('模具基础信息')}
          </h3>
          {isEdit
            ? customizeForm(
                { code: 'SIEC.MOULD_DATA.DETAIL.HEADER', dataSet: formDs },
              <Form
                dataSet={formDs}
                showLines={6}
                columns={3}
                labelLayout="float"
                useColon={false}
              >
                <TextField name="mouldNum" disabled={!isCreate} />
                <TextField name="mouldName" disabled={!isEdit} />
                <DatePicker name="creationDate" disabled />
                <Lov name="supplierLov" disabled={!isEdit} />
                <Lov name="companyLov" disabled={!isEdit} />
                <Lov name="mouldPrincipalLov" disabled={!isEdit} />
                <Select name="mouldType" disabled={!isEdit} />
                <TextField name="createdByName" disabled />
                <Select name="sourcePlatform" disabled />
                <NumberField name="mouldQuality" disabled={!isEdit} />
                <NumberField name="cavityQuality" disabled={!isEdit} />
                <NumberField name="shareQuality" disabled={!isEdit} />
                <Select name="mouldOwner" disabled={!isEdit} />
                <Lov name="uomLov" disabled={!isEdit} />
                <TextField name="modelSpecs" disabled={!isEdit} />
                <TextField name="machineTonnage" disabled={!isEdit} />
                <NumberField name="mouldLife" disabled={!isEdit} />
                <TextField name="moldingCycle" disabled={!isEdit} />
                <TextField name="objectVersionNumber" disabled />
                <NumberField name="mouldValue" disabled={!isEdit} />
                <TextArea name="remark" colSpan={2} disabled={!isEdit} />
              </Form>
              )
            : customizeForm(
                { code: 'SIEC.MOULD_DATA.DETAIL.HEADER_CHANGE', dataSet: formDs },
              <Form
                dataSet={formDs}
                showLines={6}
                columns={3}
                labelLayout="float"
                useColon={false}
              >
                <TextField name="mouldNum" disabled={!isCreate} />
                <TextField name="mouldName" />
                <DatePicker name="creationDate" disabled />
                <Lov name="supplierLov" />
                <Lov name="companyLov" />
                <Lov name="mouldPrincipalLov" />
                <Select name="mouldType" />
                <TextField name="createdByName" disabled />
                <Select name="sourcePlatform" disabled />
                <NumberField name="mouldQuality" />
                <NumberField name="cavityQuality" />
                <NumberField name="shareQuality" />
                <Select name="mouldOwner" />
                <Lov name="uomLov" />
                <TextField name="modelSpecs" />
                <TextField name="machineTonnage" />
                <NumberField name="mouldLife" />
                <TextField name="moldingCycle" />
                <TextField name="objectVersionNumber" disabled />
                <NumberField name="mouldValue" />
                <TextArea name="remark" colSpan={2} />
              </Form>
              )}
        </Content>

        <Content
          className={`${styles['custom-page-content']} ${styles.attachment} ${
            styles.mouldBaseInfoContent
          }`}
        >
          <h3 id="purchaseOrgInfo" className={styles['rfx-card-item-title']}>
            {intl.get('siec.mould.common.relateItemInfo').d('关联物料信息')}
          </h3>
          {customizeTable(
            {
              code: 'SIEC.MOULD_DATA.DETAIL.LIST', // SIEC.MOULD_DATA.LIST.LIST
              dataSet: tableDS,
            },
            <Table
              className={styles.customTable}
              dataSet={tableDS}
              key="detailTable"
              buttons={isEdit || lineChangeFlag ? btns : []}
              columns={columns}
              selectionMode={isEdit || lineChangeFlag ? 'rowbox' : 'none'}
            />
          )}
        </Content>
        {showContent && (
          <Content
            className={`${styles['custom-page-content']} ${styles.attachment} ${
              styles.mouldBaseInfoContent
            }`}
          >
            <h3 id="expandLine" className={styles['rfx-card-item-title']}>
              {intl.get('siec.mould.common.expandLine').d('关联子模具信息')}
            </h3>
            {customizeTable(
              {
                code: 'SIEC.MOULD_DATA.DETAIL.EXPAND_LIST',
                dataSet: maExpandDs,
              },
              <Table
                style={{ maxHeight: '450px' }}
                className={styles.customTable}
                dataSet={maExpandDs}
                key="expandLine"
                buttons={isEdit || lineChangeFlag ? ['add', <DeleteExpandBtn />] : []}
                columns={maExpandCol}
                selectionMode={isEdit || lineChangeFlag ? 'rowbox' : 'none'}
              />
            )}
          </Content>
        )}

        <Content
          className={`${styles['custom-page-content']} ${styles.attachment} ${
            styles.mouldBaseInfoContent
          }`}
        >
          <h3 id="attachmentInfo" className={styles['rfx-card-item-title']}>
            {intl.get('siec.mould.common.attachmentInfo').d('附件信息')}
          </h3>
          {customizeForm(
            {
              code: 'SIEC.MOULD_DATA.DETAIL.ATTACHINFO',
              dataSet: formDs,
            },
            <Form dataSet={formDs} columns={2} useColon={false} useWidthPercent labelLayout="float">
              <Attachment
                labelLayout="float"
                help={
                  <span className="attachment-title">
                    {intl.get('siec.mould.view.attachment.supportExtensions').d('支持扩展名')}: .rar
                    .zip .doc .docx .pdf .jpg...
                  </span>
                }
                name="attachmentUuid"
                bucketName={PRIVATE_BUCKET}
              />
            </Form>
          )}
        </Content>
      </Fragment>
    );
  }
}

export default index;
