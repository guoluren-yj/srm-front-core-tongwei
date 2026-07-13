import React, { Component, Fragment } from 'react';
import { Form, Table, Output, DataSet, Attachment } from 'choerodon-ui/pro';
import { observer as mobserver } from 'mobx-react';
import intl from 'utils/intl';
import querystring from 'querystring';
import { PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { fetchPermissions } from '@/services/mouldMasterData';
import { Header, Content } from 'components/Page';
import { detailDS, tableLineDS, maExpandLineDs } from '../store/detailDS';
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
    this.state = {
      showContent: false,
    };
  }

  tableDS = new DataSet(tableLineDS());

  maExpandDs = new DataSet(maExpandLineDs());

  formDs = new DataSet(detailDS({ tableDS: this.tableDS, maExpandDs: this.maExpandDs }));

  componentDidMount() {
    const { location } = this.props;
    const params = querystring.parse(location.search.substr(1)) || {};
    const { mouldId } = params;
    fetchPermissions(['srm.pcn-admin.mould-manager.mould-data.ps.maexpend_content']).then(res => {
      this.setState({ showContent: res[0].approve });
    });
    if (mouldId) {
      this.formDs.setQueryParameter('mouldId', mouldId);
      // this.formDs.setQueryParameter('mouldStatus', mouldStatus);
      this.formDs.query();
    }
  }

  render() {
    const { customizeForm, customizeTable } = this.props;
    const { showContent } = this.state;
    const columns = [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'itemLov',
        width: 180,
      },
      {
        name: 'itemName',
        width: 180,
      },
      {
        name: 'categoryName',
        width: 300,
      },
      {
        name: 'uomName',
        width: 150,
      },
    ];
    // console.log(maExpandDs);
    const maExpandCol = [
      {
        name: 'lineNum',
        width: 80,
      },
    ];
    return (
      <Fragment>
        <Header title={intl.get('siec.mould.model.common.mouldDetail').d('模具主数据详情')} />
        <Content
          className={`${styles['custom-page-content']} ${styles['custom-page-form-content']} ${
            styles['custom-mould-page-form-content']
          } ${styles.customMargin}`}
        >
          <h3 id="newAddSupplierCompany" className={styles['rfx-card-item-title']}>
            {intl.get('siec.mould.model.common.mouldBaseInfo').d('模具基础信息')}
          </h3>
          {customizeForm(
            { code: 'SIEC.MOULD_DATA.DETAIL.HEADER', dataSet: this.formDs },
            <Form
              dataSet={this.formDs}
              showLines={6}
              columns={3}
              labelLayout="vertical"
              labelAlign="left"
              className="c7n-pro-vertical-form-display"
              useColon={false}
            >
              <Output name="mouldNum" />
              <Output name="mouldName" />
              <Output name="creationDate" />
              <Output name="companyLov" />
              <Output name="mouldPrincipalLov" />
              <Output name="mouldType" />
              <Output name="createdByName" />
              <Output name="sourcePlatform" />
              <Output name="mouldQuality" />
              <Output name="cavityQuality" />
              <Output name="shareQuality" />
              <Output name="mouldOwner" />
              <Output name="uomLov" />
              <Output name="modelSpecs" />
              <Output name="machineTonnage" />
              <Output name="mouldLife" />
              <Output name="moldingCycle" />
              <Output name="objectVersionNumber" />
              <Output name="mouldValue" />
              <Output name="remark" colSpan={2} />
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
              dataSet: this.tableDS,
            },
            <Table
              className={styles.customTable}
              dataSet={this.tableDS}
              key="detailTable"
              buttons={[]}
              columns={columns}
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
                dataSet: this.maExpandDs,
              },
              <Table
                style={{ maxHeight: '450px' }}
                className={styles.customTable}
                dataSet={this.maExpandDs}
                key="expandLine"
                buttons={[]}
                columns={maExpandCol}
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
              dataSet: this.formDs,
            },
            <Form
              dataSet={this.formDs}
              columns={2}
              useColon={false}
              useWidthPercent
              labelLayout="float"
            >
              <Attachment
                readOnly
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
