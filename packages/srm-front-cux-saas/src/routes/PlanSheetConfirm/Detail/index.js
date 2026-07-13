/**
 * index - 计划单确认
 * @date: 2019-12-11
 * @author: lichao <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button, Spin, Collapse, Icon, Form, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import { stringify } from 'querystring';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import { SRM_SPUC } from '_utils/config';
import OrderHeaderForm from './OrderHeaderForm';
import List from './List';
import OperationRecord from '../../components/PlantOperationRecord/OperationRecord';
import Attachment from './Attachment';
import './index.less';

// 折叠面板组件初始化
const { Panel } = Collapse;

@Form.create({ fieldNameProp: null })
@connect(({ loading, planSheetConfirm, planSheetCommon, planSheet }) => ({
  queryPlanHeaderLoading: loading.effects['planSheetConfirm/queryPlanDetailHeader'],
  queryPlanLineLoading: loading.effects['planSheetConfirm/queryPlanDetailLine'],
  surePlanLoading: loading.effects['planSheetConfirm/sureDetailPlan'],
  feedBackPlanLoading: loading.effects['planSheetConfirm/feedBackPlan'],
  planSheetConfirm,
  planSheetCommon,
  planSheet,
}))
@formatterCollections({
  code: [
    'sodr.planSheetConfirm',
    'sodr.common',
    'sodr.planSheet',
    'entity.company',
    'entity.attachment',
    'entity.order',
    'item.order',
    'entity.item',
  ],
})
export default class Detail extends PureComponent {
  form;

  constructor(props) {
    super(props);

    this.state = {
      organizationId: getCurrentOrganizationId(),
      operationRecordModalVisible: false, // 操作记录模态框
      collapseKeys: ['orderHeaderInfo'],
      attachmentUUID: null,
      fileVisible: false,
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    this.batchCode();
    this.queryPlanDetailHeader();
  }

  /**
   * 打开操作记录模态框
   */
  @Bind()
  openOperationRecord() {
    this.setState({
      operationRecordModalVisible: true,
    });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    const { dispatch } = this.props;
    this.setState({ operationRecordModalVisible: false });
    dispatch({
      type: `planSheetConfirm/updateState`,
      payload: {
        operationPagination: {},
        operationData: [],
      },
    });
  }

  /**
   * batchCode - 查询值集
   */
  batchCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'planSheetConfirm/batchCode',
    });
  }

  /**
   * fetchDetailHeader - 查询头明细数据 queryPlanDetailHeader
   */
  @Bind()
  queryPlanDetailHeader() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'planSheetConfirm/queryPlanDetailHeader',
      payload: {
        planHeaderId: params.id,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          attachmentUUID: res.supplierAttachmentUuid,
        });
        // 存在计划排期
        if (res.planningCycle) {
          this.queryPlanDetailLine();
        }
      }
    });
  }

  /**
   * 详情确认
   */
  @Bind()
  handleSure() {
    const { planSheetConfirm = {}, dispatch, history, form } = this.props;
    const { planDetailHeader = {}, planDetailList } = planSheetConfirm;
    // eslint-disable-next-line guard-for-in
    const handleData = planDetailList.map((i) => {
      const feedBackArr = [];
      const { scheduleDetailMap = {} } = i;
      // eslint-disable-next-line guard-for-in
      for (const j in scheduleDetailMap) {
        feedBackArr.push(...scheduleDetailMap[j]);
      }
      return {
        ...i,
        scheduleDetailMap: undefined,
        scheduleDetailList: feedBackArr,
      };
    });
    Modal.confirm({
      title: intl.get(`sodr.planSheet.view.message.title.confirmPlan`).d('是否确认计划单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        form.validateFields((errs, values) => {
          if (!errs) {
            dispatch({
              type: 'planSheetConfirm/sureDetailPlan',
              payload: {
                ...planDetailHeader,
                ...values,
                scheduleLines: handleData,
              },
            }).then((res) => {
              if (res) {
                notification.success();
                history.push({
                  pathname: '/scux/qwkj/plan-sheets-confirm/list',
                });
                this.queryPlanDetailHeader();
              }
            });
          }
        });
      },
    });
  }

  /**
   * 详情反馈
   */
  @Bind()
  handleFeedBack() {
    const { planSheetConfirm = {}, dispatch, history, form } = this.props;
    const { planDetailHeader = {}, feedBackArr, planDetailList } = planSheetConfirm;
    const handleData = planDetailList.map((i) => ({
      ...i,
      scheduleDetailMap: undefined,
      scheduleDetailList: feedBackArr,
    }));
    Modal.confirm({
      title: intl.get(`sodr.planSheet.view.message.title.confirmFeedBackPlan`).d('是否反馈计划单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        form.validateFields((errs, values) => {
          if (!errs) {
            dispatch({
              type: 'planSheetConfirm/feedBackPlan',
              payload: {
                ...planDetailHeader,
                ...values,
                // planStartDate: values.planStartDate ? values.planStartDate.format(DATETIME_MIN) : planDetailHeader.planStartDate,
                scheduleLines: handleData,
              },
            }).then((res) => {
              if (res) {
                notification.success();
                history.push({
                  pathname: '/scux/qwkj/plan-sheets-confirm/list',
                });
              }
            });
          }
        });
      },
    });
  }

  /**
   * queryPlanDetailLine - 查询行明细数据
   * @param {object} params - 查询条件
   */
  @Bind()
  queryPlanDetailLine() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'planSheetConfirm/queryPlanDetailLine',
      payload: { planHeaderId: params.id, camp: 0 },
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {string} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  // 获取表格渲染的格式数据
  @Bind()
  transformRender(dataSource = []) {
    if (dataSource.length > 0) {
      const planDataSource = dataSource.map((item) => {
        const { scheduleDetailMap = {}, ...rest } = item;
        let element = {};
        const planObj = {};
        // eslint-disable-next-line guard-for-in
        let dateList = [];
        // 获取日期数组
        if (Object.keys(scheduleDetailMap).length > 0) {
          dateList = Object.values(scheduleDetailMap)[0].map((i) => i.planDate);
        }
        dateList.forEach((date) => {
          const planDateList = [];
          // eslint-disable-next-line guard-for-in
          for (const planType in scheduleDetailMap) {
            const planArr = scheduleDetailMap[planType];
            planArr.forEach((plan) => {
              const key = `$$${plan.planDate}`;
              const planValue = {
                planType: plan.planType,
                planQuantity: plan.planQuantity,
                planTypeMeaning: plan.planTypeMeaning,
                planDate: plan.planDate,
                key: plan.key,
              };
              if (date === plan.planDate) {
                planDateList.push(planValue);
                planObj[key] = planDateList;
              }
            });
            element = {
              ...rest,
              ...planObj,
              scheduleDetailMap,
            };
          }
        });
        return element;
      });
      // console.log('planDataSource', planDataSource);
      return planDataSource;
    } else {
      return [];
    }
  }

  /**
   * 将表格渲染数据更新成接口需要的格式
   * @param {Aarry} dataRender 表格渲染格式数据
   * @param {Aarry} dataSource 初始化接口格式数据
   * @returns Array
   */
  @Bind()
  transformOrigin(dataRender = [], dataSource = []) {
    const copyData = JSON.parse(JSON.stringify(dataSource));
    // console.log('dataRender', dataRender);
    if (copyData.length > 0 && dataRender.length > 0) {
      copyData.forEach((item, idx) => {
        const { scheduleDetailMap = {} } = item;
        const _item = dataRender[idx];
        // eslint-disable-next-line guard-for-in
        for (const planType in scheduleDetailMap) {
          const planArr = scheduleDetailMap[planType];
          planArr.forEach((plan) => {
            // eslint-disable-next-line guard-for-in
            for (const _key in _item) {
              const planDateList = _item[`$$${plan.planDate}`];
              if (_key === `$$${plan.planDate}` && planDateList) {
                planDateList.forEach((m) => {
                  if (m.key === plan.key) {
                    // eslint-disable-next-line no-param-reassign
                    plan.planQuantity = m.planQuantity;
                  }
                });
              }
            }
          });
        }
      });
      // console.log('copyData', copyData);
      return copyData;
    } else {
      return [];
    }
  }

  /**
   * 查询采购方附件列表
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  @Bind()
  fetchPurchaserAttachmentList(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'planSheetCommon/queryFileListOrg',
      payload,
    });
  }

  /**
   * 查询供应商附件列表
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  @Bind()
  fetchSupplierAttachmentList(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'planSheetCommon/queryFileListOrg',
      payload,
    });
  }

  /**
   * 删除附件
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @param {string} payload.urls 要删除附件的url
   * @returns Promise
   */
  @Bind()
  removeAttachment(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'planSheetCommon/removeFile',
      payload,
    });
  }

  /**
   * fetchUuidBindHeader - 首次加载附件组件时判断该头是否有Uuid，没有就去请求一个并绑定
   */
  @Bind()
  fetchUuidBindHeader() {
    const { planSheetConfirm } = this.props;
    const { planDetailHeader = {} } = planSheetConfirm;
    const { supplierAttachmentUuid } = planDetailHeader;
    if (!supplierAttachmentUuid) {
      // 后台传过来的attachmentUuid不存在 则 新获取 uuid
      this.fetchUUID();
    } else {
      this.setState({
        fileVisible: true,
      });
    }
  }

  /**
   * 获取UUID  并将获得的uuid存入数据库
   */
  @Bind()
  fetchUUID() {
    const { dispatch, match = {}, planSheetConfirm } = this.props;
    const { params } = match;
    const { planDetailHeader = {} } = planSheetConfirm;
    dispatch({
      type: 'planSheetCommon/getAttachmentuuid',
    }).then((res) => {
      if (res) {
        this.setState({
          attachmentUUID: res.content,
          fileVisible: true,
        });
        dispatch({
          type: 'planSheetCommon/saveAttachmentUUID',
          payload: {
            planHeaderId: params.id,
            supplierAttachmentUuid: res.content,
            objectVersionNumber: planDetailHeader.objectVersionNumber,
          },
        }).then((response) => {
          if (response) {
            this.queryPlanDetailHeader();
          }
        });
      }
    });
  }

  @Bind()
  openUploadModal() {
    this.fetchUuidBindHeader();
  }

  /**
   * hideAttachment - 关闭附件弹窗
   */
  @Bind()
  hideAttachment() {
    this.setState({ fileVisible: false });
  }

  /**
   * 计划单的批量导入
   */
  @Bind()
  handleImport() {
    const { match } = this.props;
    // openTab({
    //   key: '/sodr/plan-sheet-update/data-import/SSCH.SCHEDULE_LINE_DETAIL',
    //   path: '/sodr/plan-sheet-update/data-import/SSCH.SCHEDULE_LINE_DETAIL',
    //   title: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
    //   search: queryString.stringify({
    //     backPath: `/sodr/plan-sheet/detail/${match.params.id}`,
    //     sync: true,
    //   }),
    // });
    const option = {
      pathname: '/scux/qwkj/plan-sheets-confirm/data-import/SSCH.SCHEDULE_LINE_DETAIL',
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: `/scux/qwkj/plan-sheets-confirm/detail/${match.params.id}`,
      }),
    };
    this.props.history.push(option);
  }

  render() {
    const {
      planSheetConfirm,
      queryPlanHeaderLoading,
      queryPlanLineLoading,
      surePlanLoading,
      form,
      dispatch,
      match,
    } = this.props;
    // console.log('planSheetConfirm', planSheetConfirm.planDetailList);
    const {
      collapseKeys = [],
      operationRecordModalVisible,
      organizationId,
      attachmentUUID,
      fileVisible,
    } = this.state;
    const { planDetailHeader = {}, planDetailList = [], planCycle = [] } = planSheetConfirm;

    const orderHeaderFormProps = {
      ref: (node) => {
        this.orderHeaderForm = node;
      },
      dataSource: planDetailHeader,
      planCycle,
      form,
    };
    const listProps = {
      loading: queryPlanLineLoading,
      dataSource: planDetailList,
      planDetailHeader,
      dispatch,
      transformRender: this.transformRender,
      transformOrigin: this.transformOrigin,
      // renderDataSource: this.renderDataSource,
    };

    const operationRecordProps = {
      dispatch,
      id: match.params.id,
      visible: operationRecordModalVisible,
      hideModal: this.hideOperationRecord,
    };

    const attachmentProps = {
      hideAttachment: this.hideAttachment,
      attachmentUUID, // 供应商uuid
      attachmentUuid: planDetailHeader.attachmentUuid, // 采购商uuid
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      onRemoveAttachment: this.removeAttachment,
      // loading: queryFileListOrgLoading, // 加载状态
      loading: false,
      bucketName: 'private-bucket',
      bucketDirectory: 'sodr-order',
      // onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
    };
    const primaryExportBtnProps = {
      icon: 'export',
    };
    return (
      <div>
        <Header
          title={intl.get(`sodr.common.view.message.title.plantConfirm`).d('计划单确认')}
          backPath="/scux/qwkj/plan-sheets-confirm/list"
        >
          <Button icon="check" loading={surePlanLoading} onClick={this.handleSure} type="primary">
            {intl.get(`sodr.common.view.button.sure`).d('确认')}
          </Button>
          {/* <Button
            icon="exclamation-circle-o"
            loading={feedBackPlanLoading}
            onClick={this.handleFeedBack}
          >
            {intl.get(`sodr.common.view.button.feedBack`).d('反馈')}
          </Button> */}
          <ExcelExport
            otherButtonProps={primaryExportBtnProps}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/schedule-line/${match.params.id}/schedule-line/export`}
          />
          <Button onClick={this.openUploadModal} icon="paper-clip">
            {intl.get('entity.attachment.tag').d('附件')}
          </Button>
          {fileVisible && <Attachment {...attachmentProps} />}
          <Button icon="clock-circle-o" onClick={this.openOperationRecord}>
            {intl.get(`sodr.common.view.button.operationRecord`).d('操作记录')}
          </Button>
          <Button onClick={this.handleImport} disabled={!planDetailHeader.planningCycle}>
            {intl.get('sodr.planSheet.button.planImport').d('批量导入填写')}
          </Button>
        </Header>
        <Content>
          <Spin
            spinning={queryPlanHeaderLoading || queryPlanLineLoading || false}
            wrapperClassName={classnames(DETAIL_DEFAULT_CLASSNAME, 'received-send-order-detail')}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={['orderHeaderInfo']}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`sodr.common.view.message.baseInfo`).d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('orderHeaderInfo')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="orderHeaderInfo"
              >
                <OrderHeaderForm {...orderHeaderFormProps} />
              </Panel>
            </Collapse>
            {planDetailHeader.planningCycle && <List {...listProps} />}
          </Spin>
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </div>
    );
  }
}
