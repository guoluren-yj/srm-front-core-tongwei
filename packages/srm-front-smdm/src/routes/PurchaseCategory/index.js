/**
 * PurchaseCategory 自主品类定义
 * @date: 2018-7-2
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Form, Input, Modal, Checkbox, Row, Col } from 'hzero-ui';
import { Menu, Dropdown, Icon } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined, isFunction } from 'lodash';
import queryString from 'querystring';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { Content, Header } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';

import notification from 'utils/notification';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import ExcelExport from 'components/ExcelExport';
import { enableRender } from 'utils/renderer';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { observer } from 'mobx-react-lite';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import { SRM_MDM } from '_utils/config';
import CommonImport from 'hzero-front/lib/components/Import';
import { queryPermissions } from '@/services/purchaseCategoryService';
import CategoryForm from './CategoryForm';
import MaterielModal from './MaterielModal';
import AssignPurchaseMadal from './AssignPurchaseMadal';
import ListTable from './list';
import styles from './index.less';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@withCustomize({
  unitCode: [
    'SMDM.PURCHASE_CATEGORY_LIST.EDIT',
    'SMDM.PURCHASE_CATEGORY_LIST.SEARCH',
    'SMDM.PURCHASE_CATEGORY_LIST.BTNS',
    'SMDM.PURCHASE_CATEGORY_LIST.ASSIGNBUYER_LIST',
    'SMDM.PURCHASE_CATEGORY_LIST.ASSIGNBUYER_SEARCH',
  ],
})
@formatterCollections({
  code: [
    'smdm.purchaseCategory',
    'smdm.common',
    'smdm.paymentTerms',
    'smdm.materiel',
    'spfm.portalAssign',
  ],
})
@cuxRemote(
  {
    code: 'SMDM_PURCHASECATEGORYLIST_LIST',
    name: 'remote',
  },
  {
    process: {
      cuxCategoryFormData: undefined,
      cuxCompanyEdit: undefined,
      cuxIsMultiple: undefined,
      cuxColumns: undefined,
      cuxBeforeDisable: undefined,
    },
  }
)
@Form.create({ fieldNameProp: null })
@connect(({ loading, smdmPurchaseCategory }) => ({
  smdmPurchaseCategory,
  saving: loading.effects['smdmPurchaseCategory/fetchPurchaseCategory'],
  updateLoading: loading.effects['smdmPurchaseCategory/updatePurchaseCategory'],
}))
export default class PurchaseCategory extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      display: true,
      materielVisible: false,
      purchaseAssignVisible: false,
      materielRecord: {},
      purchaseAssignRecord: {},
      expandedList: [],
      categoryFormData: {},
      organizationId: getCurrentOrganizationId(),
      importPermissions: {},
      sortType: 'asc',
      sortColumn: 'categoryCode',
    };
  }

  /**
   * componentDidMount - 组件初始化请求数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'smdmPurchaseCategory/init' });
    this.handleInit();
    this.fetchCategoryList();
    const importCodeList = [
      'srm.bg.manager.mdm.purchase-category.ps.new.list.import',
      'srm.bg.manager.mdm.purchase-category.ps.new.assign.item.import',
      'srm.bg.manager.mdm.purchase-category.ps.new.assign.import',
    ];

    queryPermissions(importCodeList).then((res) => {
      if (res && !res.failed) {
        const importPermissions = {};
        res.forEach((item) => {
          if (item.code === 'srm.bg.manager.mdm.purchase-category.ps.new.list.import') {
            importPermissions.list = item;
          } else if (
            item.code === 'srm.bg.manager.mdm.purchase-category.ps.new.assign.item.import'
          ) {
            importPermissions.assignItem = item;
          } else if (item.code === 'srm.bg.manager.mdm.purchase-category.ps.new.assign.import') {
            importPermissions.assign = item;
          }
        });
        this.setState({ importPermissions });
      }
    });
  }

  @Bind()
  handleSetState(partState) {
    this.setState(partState);
  }

  @Bind()
  handleInit() {
    const { remote } = this.props;
    if (remote) {
      remote.event.fireEvent('onInit', {
        handleSetState: this.handleSetState,
      });
    }
  }

  /**
   * fetchCategoryList - 查询采购品类列表数据
   * @param {object} params - 请求参数
   */
  fetchCategoryList(params = {}) {
    const { dispatch } = this.props;
    const { organizationId, sortType, sortColumn } = this.state;
    const categoryCodeSortFlag = sortType === 'asc' ? 1 : 0;
    return dispatch({
      type: 'smdmPurchaseCategory/fetchPurchaseCategory',
      payload: {
        organizationId,
        categoryCodeSortFlag: sortType ? categoryCodeSortFlag : undefined,
        ...params,
        sortType,
        sortColumn,
        customizeUnitCode:
          'SMDM.PURCHASE_CATEGORY_LIST.GRID,SMDM.PURCHASE_CATEGORY_LIST.EDIT,SMDM.PURCHASE_CATEGORY_LIST.SEARCH',
      },
    });
  }

  /**
   * handleSearchCategory - 搜索采购品类，返回搜索结果的节点id和祖父节点id
   * @param {object} e - 事件对象
   */
  @Bind()
  handleSearchCategory() {
    const { form } = this.props;
    const exList = [];
    const exTreeKey = (list) => {
      if (list) {
        for (let i = 0; i < list.length; i++) {
          exList.push(list[i].categoryId);
          if (list[i].children) {
            exTreeKey(list[i].children);
          }
        }
      }
    };
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        this.fetchCategoryList({
          ...fieldsValue,
        }).then((res) => {
          if ((res && res.length > 0 && fieldsValue.categoryCode) || fieldsValue.categoryName) {
            exTreeKey(res);
            this.setState({
              expandedList: exList,
            });
          } else {
            this.setState({
              expandedList: [],
            });
          }
        });
      }
    });
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchImport(code) {
    let retitle = '';
    if (code === 'SMDM.ITEM_CATEGORY.IMPORT') {
      retitle = 'hzero.common.viewtitle.batchImport'; // 批量导入
    } else if (code === 'SMDM_ITEM_CATEGORY_ASSIGN') {
      retitle = 'hzero.common.purchaseCategory.category.assignImport'; // 分配物料导入
    } else if (code === 'SMDM_ITEM_CATEGORY_PURCHASER') {
      retitle = 'hzero.common.category.purchaserImport'; // 分配采购员导入
    }
    openTab({
      key: `/smdm/purchase/category/import/${code}`,
      search: queryString.stringify({
        key: `/smdm/purchase/category/import/${code}`,
        title: retitle,
        action: retitle,
      }),
    });
  }

  /**
   * handleResetSearch - 重置搜索品类查询条件
   */
  @Bind()
  handleResetSearch() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * showTemplate - 跳转报价模板页面
   * @param {object} record - 行数据
   */
  @Bind()
  showTemplate(record) {
    const { history } = this.props;
    history.push(
      `/smdm/purchase/category/import/template/${this.state.organizationId}/${record.categoryId}`
    );
  }

  /**
   * 控制modal - 显示与隐藏
   * @param {boolean}} flag - 是否显示modal
   */
  handleModalVisible(flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'smdmPurchaseCategory/saveReducers',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

  /**
   * showModal - 显示模态框
   *  @param {object} record - 编辑的行数据
   */
  @Bind()
  showModal(record) {
    const { remote } = this.props;
    const { cuxCategoryFormData } = remote.props?.process || {};
    if (record) {
      this.setState({
        categoryFormData: isFunction(cuxCategoryFormData)
          ? cuxCategoryFormData(record)
          : { categoryId: record.categoryId, isEdit: false, isChild: true },
      });
    } else {
      this.setState({
        categoryFormData: { isEdit: false },
      });
    }
    this.handleModalVisible(true);
  }

  /**
   * hideModal - 隐藏模态框
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleModalVisible(false);
    }
  }

  /**
   * handleSaveCategory - 模态框编辑的确认操作，动作为新增或编辑
   * @param {object} fieldsValue - 操作的数据项
   * @param {string} categoryCode - 品类代码
   * @param {string} categoryName - 品类名称
   * @param {string} ouId - 业务实体
   * @param {string} uomId - 计量单位
   * @param {string} impStandard - 引入要求
   */
  @Bind()
  handleSaveCategory(fieldsValue) {
    const { dispatch } = this.props;
    const { categoryFormData } = this.state;
    const params =
      categoryFormData.categoryId && categoryFormData.isEdit
        ? {
            body: [
              {
                ...categoryFormData,
                ...fieldsValue,
                tenantId: this.state.organizationId,
              },
            ],
            organizationId: this.state.organizationId,
            customizeUnitCode: 'SMDM.PURCHASE_CATEGORY_LIST.EDIT',
          }
        : {
            body: [
              {
                ...fieldsValue,
                enabledFlag: 1,
                templateEnabledFlag: 0,
                parentCategoryId: categoryFormData.isChild ? categoryFormData.categoryId : '',
                tenantId: this.state.organizationId,
              },
            ],
            organizationId: this.state.organizationId,
            customizeUnitCode: 'SMDM.PURCHASE_CATEGORY_LIST.EDIT',
          };
    dispatch({
      type: 'smdmPurchaseCategory/updatePurchaseCategory',
      payload: params,
    }).then((res) => {
      if (res) {
        notification.success();
        this.hideModal();
        this.handleSearchCategory();
      }
    });
  }

  /**
   * handleDisTemplate - 设置报价模板的启用禁用
   * @param {object} record - 行数据
   * @param {boolean} flag - 启用标识
   */
  @Bind()
  handleDisTemplate(record, flag) {
    const { dispatch } = this.props;
    dispatch({
      type: `smdmPurchaseCategory/${flag ? 'enableTemplate' : 'disableTemplate'}`,
      payload: {
        ...record,
        organizationId: this.state.organizationId,
        categoryId: record.categoryId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchCategory();
      }
    });
  }

  /**
   * handleDisCategory - 设置品类的启用禁用
   * @param {object} record - 行数据
   * @param {boolean} flag - 启用标识
   */
  @Bind()
  async handleDisCategory(record, flag) {
    const { dispatch, remote } = this.props;
    const { cuxBeforeDisable } = remote.props?.process || {};
    if (isFunction(cuxBeforeDisable)) {
      const value = await cuxBeforeDisable(flag);
      if (!value) return;
    }
    dispatch({
      type: `smdmPurchaseCategory/${flag ? 'enableCategory' : 'disableCategory'}`,
      payload: {
        body: {
          ...record,
        },
        organizationId: this.state.organizationId,
        categoryId: record.categoryId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchCategory();
      }
    });
  }

  /**
   * handleUpdateCategory - 更新品类信息
   * @param {object} record - 行数据
   */
  @Bind()
  handleUpdateCategory(record) {
    this.setState({
      categoryFormData: {
        ...record,
        isEdit: true,
      },
    });
    this.handleModalVisible(true);
  }

  /**
   * 打开分类物料modal
   * @param {Object} record
   */
  @Bind()
  handleShowModal(record) {
    this.setState({ materielRecord: record, materielVisible: true });
  }

  /**
   * 打开分类物料modal
   */
  @Bind()
  handleCloseModal() {
    this.setState({ materielVisible: false });
  }

  /**
   * 显示分配采购侧滑modal
   */
  @Bind()
  showPurchaseAssign(record) {
    this.setState({ purchaseAssignRecord: record, purchaseAssignVisible: true });
  }

  /**
   * 隐藏分配采购侧滑modal
   */
  @Bind()
  hidePurchaseAssign() {
    this.setState({ purchaseAssignVisible: false });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { form } = this.props;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    return filterValues;
  }

  /**
   * 查询物料
   * @param {Object} params
   */
  @Bind()
  handleSearchMateriel(params = {}) {
    const {
      dispatch,
      smdmPurchaseCategory: { materielPagination = {} },
    } = this.props;
    const {
      organizationId,
      materielRecord: { categoryId },
    } = this.state;
    const { pagination, ...otherParams } = params;
    const page = isEmpty(pagination) ? materielPagination : pagination;
    dispatch({
      type: 'smdmPurchaseCategory/fetchMateriel',
      payload: { organizationId, categoryId, ...otherParams, page },
    });
  }

  /**
   * 保存物料
   * @param {Object} params
   */
  @Bind()
  handleSaveMateriel(tableData) {
    const { dispatch } = this.props;
    const {
      organizationId,
      materielRecord: { categoryId },
    } = this.state;
    dispatch({
      type: 'smdmPurchaseCategory/saveMateriel',
      payload: { organizationId, categoryId, tableData },
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch({
          type: 'smdmPurchaseCategory/updateState',
          payload: {
            materielPagination: {},
          },
        });
        this.handleSearchMateriel();
      }
    });
  }

  @Bind()
  handleDeleteMateriel(idList) {
    const { dispatch } = this.props;
    const { organizationId } = this.state;
    dispatch({
      type: 'smdmPurchaseCategory/deleteMateriel',
      payload: { organizationId, idList },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchMateriel();
        this.handleClearSelectedRows();
      }
    });
  }

  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   *点击展开节点触发方法
   *
   * @param {*Boolean} expanded 展开收起标志
   * @param {*Object} record 行记录
   */
  @Bind()
  onExpand(expanded, record = {}) {
    const { expandedList = [] } = this.state;
    this.setState({
      expandedList: expanded
        ? expandedList.concat(record.categoryId)
        : expandedList.filter((o) => o !== record.categoryId),
    });
  }

  /**
   * renderFilterForm - 渲染搜索表单
   */
  renderFilterForm() {
    const { form, customizeFilterForm } = this.props;
    const { getFieldDecorator } = form;
    const { display } = this.state;
    return customizeFilterForm(
      {
        code: 'SMDM.PURCHASE_CATEGORY_LIST.SEARCH',
        form,
        expand: display,
      },
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.purchaseCategory.model.category.categoryCode')
                    .d('品类代码')}
                >
                  {getFieldDecorator('categoryCode')(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.purchaseCategory.model.category.categoryName')
                    .d('品类名称')}
                >
                  {getFieldDecorator('categoryName')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ display: display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ display: display ? 'none' : 'inline-block' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button onClick={this.handleResetSearch}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                type="primary"
                htmlType="submit"
                onClick={this.handleSearchCategory}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  @Bind()
  handleUpdateExcessDeliveryFlag(event, record) {
    const { target = {} } = event;
    const { categoryId } = record;
    const { dispatch } = this.props;
    dispatch({
      type: 'smdmPurchaseCategory/updateExcessDeliveryFlag',
      payload: {
        excessDeliveryFlag: target.checked || 0,
        categoryId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchCategory();
      }
    });
  }

  @Bind()
  handleSortColumn(sortColumn, sortType) {
    this.setState(
      {
        sortColumn,
        sortType,
      },
      () => {
        this.handleSearchCategory();
      }
    );
  }

  @Bind()
  handleRowSelect(selectedRowKeys, selectedRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'smdmPurchaseCategory/updateState',
      payload: {
        selectedRowKeys,
        selectedRows,
      },
    });
  }

  render() {
    const {
      saving,
      updateLoading,
      smdmPurchaseCategory: {
        purchaseCategoryList = [],
        selectedRowKeys,
        modalVisible,
        impStandardList,
      },
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      customizeFilterForm,
      clearProperties,
      remote,
    } = this.props;
    const { cuxIsMultiple, cuxColumns } = remote.props?.process || {};
    const rowSelection =
      isFunction(cuxIsMultiple) && cuxIsMultiple()
        ? {
            selectedRowKeys,
            onChange: this.handleRowSelect,
          }
        : undefined;
    const newCuxColumns = isFunction(cuxColumns) ? cuxColumns() : [];
    const otherButtonProps = {
      type: 'c7n-pro',
      icon: 'unarchive',
    };
    const {
      categoryFormData,
      materielVisible,
      materielRecord,
      purchaseAssignVisible,
      purchaseAssignRecord,
      organizationId,
    } = this.state;
    const materielProps = {
      materielRecord,
      onSearchMateriel: this.handleSearchMateriel,
      onSave: this.handleSaveMateriel,
      onDelete: this.handleDeleteMateriel,
      onClearRows: (ref) => {
        this.handleClearSelectedRows = ref;
      },
    };
    const modalTitle =
      categoryFormData.categoryId && categoryFormData.isEdit
        ? intl.get('smdm.purchaseCategory.view.message.title.modal.edit').d('编辑品类')
        : intl.get('smdm.purchaseCategory.view.message.title.modal.create').d('新建品类');
    const columns = [
      ...newCuxColumns,
      {
        title: intl.get('smdm.purchaseCategory.model.category.categoryCode').d('品类代码'),
        width: 180,
        dataIndex: 'categoryCode',
        sortable: true,
        fixed: 'left',
      },
      {
        title: intl.get('smdm.common.model.project.companyName').d('公司'),
        dataIndex: 'companyName',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get('smdm.purchaseCategory.model.category.categoryName').d('品类名称'),
        dataIndex: 'categoryName',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get('smdm.purchaseCategory.model.category.ouName').d('业务实体'),
        dataIndex: 'ouName',
        width: 200,
        fixed: 'left',
      },
      {
        title: intl.get('smdm.purchaseCategory.model.category.uomName').d('计量单位'),
        width: 150,
        dataIndex: 'uomName',
      },
      {
        title: intl.get('smdm.paymentTerms.model.excessDeliveryFlag').d('允许超量送货'),
        dataIndex: 'excessDeliveryFlag',
        width: 120,
        // align: 'center',
        render: ({ rowData }) => {
          return (
            <Checkbox
              checkedValue={1}
              unCheckedValue={0}
              onChange={(event) => this.handleUpdateExcessDeliveryFlag(event, rowData)}
              checked={rowData.excessDeliveryFlag}
            />
          );
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        align: 'left',
        width: 100,
        dataIndex: 'enabledFlag',
        render: ({ rowData }) => enableRender(rowData.enabledFlag),
      },
      {
        title: intl.get('smdm.purchaseCategory.model.category.impStandardMeaning').d('引入要求'),
        align: 'left',
        dataIndex: 'impStandardMeaning',
      },
      {
        title: intl.get('smdm.common.model.common.externalSystemCode').d('来源系统'),
        width: 120,
        align: 'left',
        dataIndex: 'externalSystemCode',
      },
      {
        title: intl.get('smdm.purchaseCategory.model.category.assignAttribute').d('分配属性'),
        width: 120,
        align: 'left',
        dataIndex: 'templateName',
      },
      {
        title: intl.get('smdm.purchaseCategory.model.category.rateTypeName').d('下级品类'),
        align: 'left',
        width: 150,
        dataIndex: 'rateTypeName',
        render: ({ rowData }) => {
          const normatBtns =
            rowData.enabledFlag === 1
              ? [
                <PermissionButton
                  data-name="create" // 二开过滤使用，不允许删除
                  onClick={() => this.showModal(rowData)}
                  permissionList={[
                      {
                        code: `srm.bg.manager.mdm.purchase-category.button.subcategory-new`,
                        type: 'button',
                      },
                    ]}
                  type="text"
                >
                  {intl.get('hzero.common.button.create').d('新建')}
                </PermissionButton>,
                <a onClick={() => this.handleDisCategory(rowData, false)}>
                  {intl.get('hzero.common.button.disable').d('禁用')}
                </a>,
                ]
              : [
                <a onClick={() => this.handleDisCategory(rowData, true)}>
                  {intl.get('hzero.common.button.enable').d('启用')}
                </a>,
                ];
          const processBtns = remote
            ? remote.process('SMDM_PURCHASECATEGORYLIST_LIST.SUBCATEGORY_BTNS', normatBtns, {
                rowData,
                state: this.state,
              })
            : normatBtns;
          return <span className="action-link">{processBtns}</span>;
        },
      },
      // {
      //   title: intl.get('smdm.purchaseCategory.model.template').d('报价模板'),
      //   align: 'center',
      //   width: 100,
      //   dataIndex: 'template',
      //   render: (text, record) =>
      //     record.enabledFlag === 1 && (
      //       <React.Fragment>
      //         {record.templateEnabledFlag === 1 ? (
      //           <span className="action-link">
      //             <a onClick={() => this.showTemplate(record)} style={{ marginRight: '4px' }}>
      //               {intl.get('hzero.common.button.setting').d('设置')}
      //             </a>
      //             <a onClick={() => this.handleDisTemplate(record, false)}>
      //               {intl.get('hzero.common.button.disable').d('禁用')}
      //             </a>
      //           </span>
      //         ) : (
      //           <a onClick={() => this.handleDisTemplate(record, true)}>
      //             {intl.get('hzero.common.button.enable').d('启用')}
      //           </a>
      //         )}
      //       </React.Fragment>
      //     ),
      // },
      {
        title: intl.get('smdm.purchaseCategory.view.message.materiel').d('分类物料'),
        align: 'left',
        width: 100,
        // fixed: 'right',
        dataIndex: 'materiel',
        render: ({ rowData }) => (
          <a onClick={() => this.handleShowModal(rowData)}>
            {intl.get('smdm.purchaseCategory.view.message.materiel').d('分类物料')}
          </a>
        ),
      },
      {
        title: intl.get('smdm.purchaseCategory.view.message.assignBuyer').d('分配采购员'),
        align: 'left',
        width: 150,
        dataIndex: 'assignPurchaser',
        render: ({ rowData }) => (
          <a onClick={() => this.showPurchaseAssign(rowData)}>
            {intl.get('smdm.purchaseCategory.view.message.asignment').d('分配')}
          </a>
        ),
      },
      {
        title: intl.get('smdm.purchaseCategory.view.message.executorBy').d('分配需求执行人'),
        align: 'left',
        width: 150,
        dataIndex: 'executorName',
      },
      {
        title: intl.get('smdm.purchaseCategory.view.message.orderExecutorBy').d('订单执行人'),
        align: 'left',
        width: 150,
        dataIndex: 'orderExecutorByName',
      },
      {
        title: intl.get('smdm.purchaseCategory.view.message.sourceExecutorBy').d('寻源执行人'),
        align: 'left',
        width: 150,
        dataIndex: 'sourceExecutorByName',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'left',
        width: 100,
        fixed: 'right',
        dataIndex: 'operator',
        render: ({ rowData }) => {
          return (
            rowData.enabledFlag === 1 && (
              <PermissionButton
                onClick={() => this.handleUpdateCategory(rowData)}
                permissionList={[
                  {
                    code: `srm.bg.manager.mdm.purchase-category.button.edit`,
                    type: 'button',
                  },
                ]}
                type="text"
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </PermissionButton>
            )
          );
        },
      },
    ];

    const { importPermissions, sortType, sortColumn } = this.state;
    const HeaderBtn = observer(() => {
      const headerButtons = [
        {
          name: 'create',
          noNest: true,
          btnProps: { onClick: () => this.showModal() },
          child: (
            <PermissionButton
              icon="plus"
              type="primary"
              onClick={() => this.showModal()}
              permissionList={[
                {
                  code: `srm.bg.manager.mdm.purchase-category.button.create`,
                  type: 'button',
                },
              ]}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </PermissionButton>
          ),
        },
        {
          name: 'newExport',
          btnComp: ExcelExportPro,
          btnType: 'c7n-pro',
          btnProps: {
            templateCode: 'SMDM_ITEM_CATEGORY_LIST_EXPORT',
            otherButtonProps: {
              ...otherButtonProps,
              permissionList: [
                {
                  code: 'srm.bg.manager.mdm.purchase-category.ps.new.category.list.export',
                  type: 'button',
                },
              ],
            },
            buttonText: intl.get('hzero.common.export.new').d('导出-新'),
            requestUrl: `${SRM_MDM}/v1/${organizationId}/item-categories/item-categories/export`,
            queryParams: this.handleGetFormValue(),
          },
        },
        {
          name: 'export',
          btnComp: ExcelExport,
          btnType: 'c7n-pro',
          btnProps: {
            exportAsync: true,
            otherButtonProps: {
              ...otherButtonProps,
              permissionList: [
                {
                  code: 'srm.bg.manager.mdm.purchase-category.ps.category.list.export',
                  type: 'button',
                },
              ],
            },
            buttonText: intl.get('hzero.common.button.export').d('导出'),
            requestUrl: `${SRM_MDM}/v1/${organizationId}/item-categories/item-categories/export`,
            queryParams: this.handleGetFormValue(),
          },
        },
        {
          name: 'batchImport',
          noNest: true,
          btnProps: {
            onClick: () => this.handleBatchImport('SMDM.ITEM_CATEGORY.IMPORT'),
          },
          child: (
            <PermissionButton
              type="c7n-pro"
              icon="archive"
              permissionList={[
                {
                  code: `srm.bg.manager.mdm.purchase-category.ps.list.import`,
                  type: 'button',
                  meaning: '批量导入',
                },
              ]}
              onClick={() => this.handleBatchImport('SMDM.ITEM_CATEGORY.IMPORT')}
            >
              {intl.get('hzero.common.title.batchImport').d('批量导入')}
            </PermissionButton>
          ),
        },
        {
          name: 'assignImport',
          noNest: true,
          btnProps: {
            onClick: () => this.handleBatchImport('SMDM_ITEM_CATEGORY_ASSIGN'),
          },
          child: (
            <PermissionButton
              type="c7n-pro"
              icon="archive"
              onClick={() => this.handleBatchImport('SMDM_ITEM_CATEGORY_ASSIGN')}
              permissionList={[
                {
                  code: `srm.bg.manager.mdm.purchase-category.ps.assign.item.import`,
                  type: 'button',
                  meaning: '分配物料导入',
                },
              ]}
            >
              {intl.get('hzero.common.title.assignImport').d('分配物料导入')}
            </PermissionButton>
          ),
        },
        {
          name: 'purchaserImport',
          noNest: true,
          btnProps: {
            onClick: () => this.handleBatchImport('SMDM_ITEM_CATEGORY_PURCHASER'),
          },
          child: (
            <PermissionButton
              type="c7n-pro"
              icon="archive"
              onClick={() => this.handleBatchImport('SMDM_ITEM_CATEGORY_PURCHASER')}
              permissionList={[
                {
                  code: `srm.bg.manager.mdm.purchase-category.ps.assign.import`,
                  type: 'button',
                  meaning: '分配采购员导入',
                },
              ]}
            >
              {intl.get('hzero.common.title.purchaserImport').d('分配采购员导入')}
            </PermissionButton>
          ),
        },
      ];

      if (
        !(
          importPermissions?.list?.controllerType === 'hidden' &&
          importPermissions?.assignItem?.controllerType === 'hidden' &&
          importPermissions?.assign?.controllerType === 'hidden'
        )
      ) {
        headerButtons.push({
          name: 'newImport',
          noNest: true,
          child: (
            <Dropdown
              overlay={
                <Menu className={styles.menu}>
                  {importPermissions?.list &&
                  importPermissions?.list?.approve === false &&
                  importPermissions?.list?.controllerType === 'hidden' ? (
                    <></>
                  ) : (
                    <Menu.Item>
                      <CommonImport
                        prefixPatch="/smdm"
                        businessObjectTemplateCode="SMDM.ITEM_CATEGORY.IMPORT"
                        buttonText={intl.get('hzero.common.title.batchImport').d('批量导入')}
                        buttonProps={{
                          disabled:
                            importPermissions?.list &&
                            importPermissions?.list?.approve === false &&
                            importPermissions?.list?.controllerType !== 'hidden',
                          // permissionList: [
                          //   {
                          //     code: `srm.bg.manager.mdm.purchase-category.ps.new.list.import`,
                          //     type: 'button',
                          //     meaning: '批量导入',
                          //   },
                          // ],
                        }}
                      />
                    </Menu.Item>
                  )}

                  {importPermissions?.assignItem &&
                  importPermissions?.assignItem?.approve === false &&
                  importPermissions?.assignItem?.controllerType === 'hidden' ? (
                    <></>
                  ) : (
                    <Menu.Item>
                      <CommonImport
                        prefixPatch="/smdm"
                        businessObjectTemplateCode="SMDM_ITEM_CATEGORY_ASSIGN"
                        buttonText={intl.get('hzero.common.title.assignImport').d('分配物料导入')}
                        buttonProps={{
                          disabled:
                            importPermissions?.assignItem &&
                            importPermissions?.assignItem?.approve === false &&
                            importPermissions?.assignItem?.controllerType !== 'hidden',
                          // permissionList: [
                          //   {
                          //     code: `srm.bg.manager.mdm.purchase-category.ps.new.assign.item.import`,
                          //     type: 'button',
                          //     meaning: '分配物料导入',
                          //   },
                          // ],
                        }}
                      />
                    </Menu.Item>
                  )}
                  {importPermissions?.assign &&
                  importPermissions?.assign?.approve === false &&
                  importPermissions?.assign?.controllerType === 'hidden' ? (
                    <></>
                  ) : (
                    <Menu.Item>
                      <CommonImport
                        prefixPatch="/smdm"
                        businessObjectTemplateCode="SMDM_ITEM_CATEGORY_PURCHASER"
                        buttonText={intl
                          .get('hzero.common.title.purchaserImport')
                          .d('分配采购员导入')}
                        buttonProps={{
                          disabled:
                            importPermissions?.assign &&
                            importPermissions?.assign?.approve === false &&
                            importPermissions?.assign?.controllerType !== 'hidden',
                          // permissionList: [
                          //   {
                          //     code: `srm.bg.manager.mdm.purchase-category.ps.new.assign.import`,
                          //     type: 'button',
                          //     meaning: '分配采购员导入',
                          //   },
                          // ],
                        }}
                      />
                    </Menu.Item>
                  )}
                </Menu>
              }
            >
              <PermissionButton
                type="c7n-pro"
                icon="archive"
                className={styles['srm-common-new-button']}
              >
                {intl.get(`hzero.common.import.new`).d('导入-新')}
                <Icon type="expand_more" />
                <span className={styles['srm-common-export-button-tag']}>NEW</span>
              </PermissionButton>
            </Dropdown>
          ),
        });
      }

      return (
        <>
          {customizeBtnGroup(
            {
              code: 'SMDM.PURCHASE_CATEGORY_LIST.BTNS',
              pro: true,
            },
            <DynamicButtons buttons={headerButtons} />
          )}
        </>
      );
    });
    return (
      <React.Fragment>
        <Header title={intl.get('smdm.purchaseCategory.view.message.title.list').d('自主品类定义')}>
          <HeaderBtn />
          {/*
          <PermissionButton
            icon="plus"
            type="primary"
            onClick={() => this.showModal()}
            permissionList={[
              {
                code: `srm.bg.manager.mdm.purchase-category.button.create`,
                type: 'button',
              },
            ]}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </PermissionButton>
          <ExcelExportPro
            templateCode="SMDM_ITEM_CATEGORY_LIST_EXPORT"
            requestUrl={`${SRM_MDM}/v1/${organizationId}/item-categories/item-categories/export`}
            queryParams={this.handleGetFormValue()}
            otherButtonProps={{
              ...otherButtonProps,
              permissionList: [
                {
                  code: 'srm.bg.manager.mdm.purchase-category.ps.new.category.list.export',
                  type: 'button',
                },
              ],
            }}
            buttonText={intl.get('hzero.common.export.new').d('导出-新')}
          />
          {importPermissions?.list?.controllerType === 'hidden' &&
          importPermissions?.assignItem?.controllerType === 'hidden' &&
          importPermissions?.assign?.controllerType === 'hidden' ? (
            <></>
          ) : (
            <Dropdown
              overlay={
                <Menu className={styles.menu}>
                  {importPermissions?.list &&
                  importPermissions?.list?.approve === false &&
                  importPermissions?.list?.controllerType === 'hidden' ? (
                    <></>
                  ) : (
                    <Menu.Item>
                      <CommonImport
                        prefixPatch="/smdm"
                        businessObjectTemplateCode="SMDM.ITEM_CATEGORY.IMPORT"
                        buttonText={intl.get('hzero.common.title.batchImport').d('批量导入')}
                        buttonProps={{
                          disabled:
                            importPermissions?.list &&
                            importPermissions?.list?.approve === false &&
                            importPermissions?.list?.controllerType !== 'hidden',
                          // permissionList: [
                          //   {
                          //     code: `srm.bg.manager.mdm.purchase-category.ps.new.list.import`,
                          //     type: 'button',
                          //     meaning: '批量导入',
                          //   },
                          // ],
                        }}
                      />
                    </Menu.Item>
                  )}

                  {importPermissions?.assignItem &&
                  importPermissions?.assignItem?.approve === false &&
                  importPermissions?.assignItem?.controllerType === 'hidden' ? (
                    <></>
                  ) : (
                    <Menu.Item>
                      <CommonImport
                        prefixPatch="/smdm"
                        businessObjectTemplateCode="SMDM_ITEM_CATEGORY_ASSIGN"
                        buttonText={intl.get('hzero.common.title.assignImport').d('分配物料导入')}
                        buttonProps={{
                          disabled:
                            importPermissions?.assignItem &&
                            importPermissions?.assignItem?.approve === false &&
                            importPermissions?.assignItem?.controllerType !== 'hidden',
                          // permissionList: [
                          //   {
                          //     code: `srm.bg.manager.mdm.purchase-category.ps.new.assign.item.import`,
                          //     type: 'button',
                          //     meaning: '分配物料导入',
                          //   },
                          // ],
                        }}
                      />
                    </Menu.Item>
                  )}
                  {importPermissions?.assign &&
                  importPermissions?.assign?.approve === false &&
                  importPermissions?.assign?.controllerType === 'hidden' ? (
                    <></>
                  ) : (
                    <Menu.Item>
                      <CommonImport
                        prefixPatch="/smdm"
                        businessObjectTemplateCode="SMDM_ITEM_CATEGORY_PURCHASER"
                        buttonText={intl
                          .get('hzero.common.title.purchaserImport')
                          .d('分配采购员导入')}
                        buttonProps={{
                          disabled:
                            importPermissions?.assign &&
                            importPermissions?.assign?.approve === false &&
                            importPermissions?.assign?.controllerType !== 'hidden',
                          // permissionList: [
                          //   {
                          //     code: `srm.bg.manager.mdm.purchase-category.ps.new.assign.import`,
                          //     type: 'button',
                          //     meaning: '分配采购员导入',
                          //   },
                          // ],
                        }}
                      />
                    </Menu.Item>
                  )}
                </Menu>
              }
            >
              <PermissionButton
                type="c7n-pro"
                icon="archive"
                className={styles['srm-common-new-button']}
              >
                {intl.get(`hzero.common.import.new`).d('导入-新')}
                <Icon type="expand_more" />
                <span className={styles['srm-common-export-button-tag']}>NEW</span>
              </PermissionButton>
            </Dropdown>
          )}
          <ExcelExport
            requestUrl={`${SRM_MDM}/v1/${organizationId}/item-categories/item-categories/export`}
            queryParams={this.handleGetFormValue()}
            otherButtonProps={{
              ...otherButtonProps,
              permissionList: [
                {
                  code: 'srm.bg.manager.mdm.purchase-category.ps.category.list.export',
                  type: 'button',
                },
              ],
            }}
          />
          <PermissionButton
            type="c7n-pro"
            icon="archive"
            onClick={() => this.handleBatchImport('SMDM.ITEM_CATEGORY.IMPORT')}
            permissionList={[
              {
                code: `srm.bg.manager.mdm.purchase-category.ps.list.import`,
                type: 'button',
                meaning: '批量导入',
              },
            ]}
          >
            {intl.get('hzero.common.title.batchImport').d('批量导入')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            icon="archive"
            onClick={() => this.handleBatchImport('SMDM_ITEM_CATEGORY_ASSIGN')}
            permissionList={[
              {
                code: `srm.bg.manager.mdm.purchase-category.ps.assign.item.import`,
                type: 'button',
                meaning: '分配物料导入',
              },
            ]}
          >
            {intl.get('hzero.common.title.assignImport').d('分配物料导入')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            icon="archive"
            onClick={() => this.handleBatchImport('SMDM_ITEM_CATEGORY_PURCHASER')}
            permissionList={[
              {
                code: `srm.bg.manager.mdm.purchase-category.ps.assign.import`,
                type: 'button',
                meaning: '分配采购员导入',
              },
            ]}
          >
            {intl.get('hzero.common.title.purchaserImport').d('分配采购员导入')}
          </PermissionButton> */}
        </Header>
        <Content>
          <div className="table-list-search">{this.renderFilterForm()}</div>
          <ListTable
            rowKey="categoryId"
            loading={saving}
            data={purchaseCategoryList}
            columns={columns}
            height={600}
            sortType={sortType}
            sortColumn={sortColumn}
            onSortColumn={this.handleSortColumn}
            expandedRowKeys={this.state.expandedList}
            pagination={false}
            rowSelection={rowSelection}
            onExpandChange={this.onExpand}
          />
          {modalVisible && (
            <CategoryForm
              clearProperties={clearProperties}
              customizeForm={customizeForm}
              title={modalTitle}
              loading={updateLoading}
              modalVisible={modalVisible}
              onCancel={this.hideModal}
              onOk={this.handleSaveCategory}
              initData={categoryFormData}
              impStandardList={impStandardList}
              remote={remote}
            />
          )}
          {purchaseAssignVisible && (
            <AssignPurchaseMadal
              customizeTable={customizeTable}
              customizeFilterForm={customizeFilterForm}
              purchaseAssignRecord={purchaseAssignRecord}
              purchaseAssignVisible={purchaseAssignVisible}
              onCancel={this.hidePurchaseAssign}
            />
          )}
          <Modal
            width={800}
            destroyOnClose
            visible={materielVisible}
            onCancel={this.handleCloseModal}
            footer={null}
            bodyStyle={{ padding: '0px' }}
          >
            <MaterielModal {...materielProps} />
          </Modal>
        </Content>
      </React.Fragment>
    );
  }
}
