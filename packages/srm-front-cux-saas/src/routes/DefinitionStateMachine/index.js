/**
 * @description 状态机定义
 * @export DefinitionStateMachine
 * @class DefinitionStateMachine
 * @extends {Component}
 */

import React, { Component, Fragment } from 'react';
import {
  Table,
  DataSet,
  Button,
  Modal,
  Form,
  TextField,
  Spin,
  NumberField,
  Select,
  Switch,
  Tree,
  Output,
  SelectBox,
  Lov,
  Tooltip,
  IntlField,
} from 'choerodon-ui/pro';
import CommonImport from 'hzero-front/lib/components/Import';
import { notification, Tabs, Row, Col } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, omit } from 'lodash';
import { observer } from 'mobx-react-lite';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SIEC } from '_utils/config';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { downloadFileByAxios } from 'services/api';
import {
  confirmDefineData,
  confirmAuthorityData,
  deleteLine,
  tablePageDataSave,
  tablePageDataDelete,
  tableButtonDataSave,
  tableButtonDataDelete,
  tableStrategyDataSave,
  tableStrategyDataDelete,
} from '@/services/definitionMachineCFServices';
import PolicyConfigModal from './PolicyConfigModal';
import TabContainer from './TabContainer';
import {
  getConfigParams,
  getConfigValues,
  judgeStateInProcess,
  getReferenceConfig,
} from '../../services/definitionStateMachineServices';

import {
  tableData,
  drawerData,
  treeData,
  headerData,
  pageTableData,
  buttonTableData,
  stateMachineStrategyLeft,
  stateMachineStrategyRight,
} from './stores/initialDataDs.js';
import {
  getPolicyConfigDataDs,
  getParamTableDs,
  getConditionJsonDs,
  getCustomizeConditionCombinationDs,
} from './stores/policyConfigDs';
import './index.less';

const prefix = 'scux.definitionStateMachine';
const { TabPane } = Tabs;
const { Option } = SelectBox;
const modalKey = Modal.key();
const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: ['scux.definitionStateMachine', 'spfm.rulesDefinition'],
})
export default class DefinitionStateMachine extends Component {
  state = {
    statusConfigId: '',
    statusDetailId: '',
    activeKey: 'statusDefine',
    partKey: '',
    allDrawerDataDs: {},
    modalVisible: false,
    conditionVisible: false,
    workFlowFlag: 0,
    activatedStatusDetailId: '',
    exportLoading: false,
  };

  treeDataDs = new DataSet(treeData());

  // 树列表DS
  headerDataDs = new DataSet(headerData()); // tab页头DS

  statusDefineDS = new DataSet(tableData('statusDefine'));

  // 状态定义DS
  pageTableDataDS = new DataSet(pageTableData());

  // 页面定义DS
  buttonTableDataDS = new DataSet(buttonTableData());

  // 按钮定义DS
  statePermissionConfigDS = new DataSet(tableData('statePermissionConfig'));

  // 状态权限配置DS
  stateMachineStrategyLeftDS = new DataSet(stateMachineStrategyLeft());

  // 状态机策略选择功能审批DS
  stateMachineStrategyRightDS = new DataSet(stateMachineStrategyRight(0)); // 状态机策略功能审批查询DS

  // 状态机策略选择工作流审批DS
  stateMachineStrategyWorkFlowDS = new DataSet(stateMachineStrategyRight(1)); // 状态机策略工作流审批查询DS

  policyConfigDataDs = new DataSet(getPolicyConfigDataDs());

  // 策略逻辑DS
  paramTableDs = new DataSet(getParamTableDs());

  // 条件规则DS
  conditionJsonDs = new DataSet(getConditionJsonDs()); // 策略配置条件DS

  // 自定义组合规则DS
  customizeConditionCombinationDs = new DataSet(getCustomizeConditionCombinationDs());

  componentDidMount() {
    this.treeDataDs.addEventListener('select', ({ record }) => {
      const { statusConfigId } = record.toData();
      const { activeKey, partKey } = this.state;
      this.headerDataDs.setQueryParameter('statusConfigId', statusConfigId);
      const tableDs = this.getCurrentDs(activeKey, partKey === '2' ? '1' : partKey);
      tableDs.setQueryParameter('statusConfigId', statusConfigId);
      tableDs.query();
      this.headerDataDs.query().then((response) => {
        if (response) {
          const { moduleCode = '' } = response;
          getConfigParams({ fullPathCode: 'SCUX_'.concat(moduleCode) }).then((res) => {
            if (res) {
              res.parameters && this.paramTableDs.loadData(JSON.parse(res.parameters)); // eslint-disable-line
            }
          });
        }
      });
      tableDs.query();
      this.setState({
        statusConfigId,
        statusDetailId: '',
        partKey: partKey === '2' ? '1' : partKey,
      });
    });
  }

  /**
   * 获得当前表格DS
   * @param {number} statusConfigId - 树状分类定义主键
   * @param {string} key - 当前tabKey
   * @param {string} partKey - 当前tab中的块级key
   */
  @Bind()
  getCurrentDs(key, partKey) {
    let currentDS;
    switch (key) {
      case 'statusDefine':
        currentDS = this.statusDefineDS;
        break;
      case 'pageDefine':
        currentDS = this.pageTableDataDS;
        break;
      case 'buttonDefine':
        currentDS = this.buttonTableDataDS;
        break;
      case 'statePermissionConfig':
        currentDS = this.statePermissionConfigDS;
        break;
      case 'stateMachineStrategy':
        switch (partKey) {
          case '1':
            currentDS = this.stateMachineStrategyLeftDS;
            break;
          case '2':
            currentDS = this.stateMachineStrategyRightDS;
            break;
          case '3':
            currentDS = this.stateMachineStrategyWorkFlowDS;
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
    return currentDS;
    // }
  }

  // 状态定义列
  columns = [
    {
      name: 'statusCode',
    },
    {
      name: 'statusDesc',
    },
    {
      name: 'sortNum',
      width: 120,
    },
    {
      name: 'enabledFlag',
      width: 100,
    },
    {
      name: 'statusStageCodeMeaning',
    },
    {
      header: intl.get(`${prefix}.model.definitionMachineCF.operation`).d('操作'),
      renderer: ({ record }) => (
        <a onClick={() => this.handleCreate(1, record, 'statusDefine')}>
          {intl.get(`${prefix}.model.definitionMachineCF.editor`).d('编辑')}
        </a>
      ),
    },
  ];

  // 页面定义列
  pageColumns = [
    {
      name: 'relationPageDesc',
      editor: (record) => {
        if (record.getState('editing')) {
          return <TextField name="relationPageDesc" />;
        } else {
          return record.getState('editing');
        }
      },
    },
    {
      name: 'relationPageValue',
      editor: (record) => {
        if (record.getState('editing')) {
          return <TextField name="relationPageValue" />;
        } else {
          return record.getState('editing');
        }
      },
    },
    {
      name: 'enableFlag',
      width: 150,
      editor: (record) => {
        if (record.getState('editing')) {
          return <Switch name="enableFlag" unCheckedValue={0} checkedValue={1} />;
        } else {
          return false;
        }
      },
    },
    {
      name: 'operation',
      header: intl.get('hzero.common.btn.action').d('操作'),
      width: 200,
      align: 'center',
      renderer: this.commands,
      lock: 'right',
    },
  ];

  // 按钮定义列
  buttonColumns = [
    {
      name: 'operationCode',
      editor: (record) => {
        if (record.getState('editing')) {
          return <TextField name="operationCode" />;
        } else {
          return record.getState('editing');
        }
      },
    },
    {
      name: 'operationDesc',
      editor: (record) => record.getState('editing'),
      // editor: (record) => {
      //   if (record.getState('editing')) {
      //     return <IntlField name="operationDesc" />;
      //   } else {
      //     return record.getState('editing');
      //   }
      // },
    },
    {
      name: 'operationType',
      editor: (record) => {
        if (record.getState('editing')) {
          return <Select name="operationType" />;
        } else {
          return record.getState('editing');
        }
      },
    },
    {
      name: 'enableFlag',
      width: 150,
      editor: (record) => {
        if (record.getState('editing')) {
          return <Switch name="enableFlag" unCheckedValue={0} checkedValue={1} />;
        } else {
          return false;
        }
      },
    },
    {
      name: 'operation',
      header: intl.get('hzero.common.btn.action').d('操作'),
      width: 200,
      align: 'center',
      renderer: this.commands,
      lock: 'right',
    },
  ];

  // 状态权限配置列
  permissionColumns = [
    {
      name: 'statusCode',
    },
    {
      name: 'statusDesc',
    },
    {
      name: 'moduleDesc',
    },
    {
      name: 'relationPageDesc',
    },
    {
      name: 'supplierRelationPageDesc',
    },
    {
      name: 'editableFlag',
      renderer: ({ value }) =>
        value
          ? value === '0'
            ? intl.get(`${prefix}.view.message.onlyRead`).d('只读')
            : intl.get(`${prefix}.view.message.ReadAndWrite`).d('读写')
          : value,
    },
    {
      name: 'queryRoleNames',
    },
    {
      name: 'authorityEnabledFlag',
    },
    {
      header: intl.get(`${prefix}.model.definitionMachineCF.operation`).d('操作'),
      renderer: ({ record }) => (
        <a onClick={() => this.handleCreate(1, record, 'statePermissionConfig')}>
          {intl.get(`${prefix}.model.definitionMachineCF.editor`).d('编辑')}
        </a>
      ),
    },
  ];

  // 状态机策略-状态列
  strategyLeftColumns = [
    {
      name: 'statusCode',
      width: 90,
      // renderer: ({ record }) => record.index + 1,
    },
    {
      name: 'statusDesc',
    },
  ];

  // 状态机策略-明细列
  @Bind
  getStrategyRightColumns(workFlowFlag) {
    return [
      workFlowFlag === 1
        ? {
            name: 'workflowOperationCode',
            width: 150,
            editor: true,
          }
        : {
            name: 'operationLov',
            width: 150,
            editor: () => <Lov name="operationCode" />,
          },
      {
        name: 'condition',
        renderer: ({ record, dataSet }) => (
          <a onClick={() => this.handleStrategyModal({ record, dataSet })}>
            {intl.get(`${prefix}.model.definitionMachineCF.editor`).d('编辑')}
          </a>
        ),
      },
      {
        name: 'conditionExpression',
        width: 200,
      },
      {
        name: 'statusCodeLOV',
        width: 150,
        editor: () => <Lov name="statusCode" />,
      },
      // {
      //   name: 'executeType',
      //   width: 150,
      //   editor: () => <TextField name="executeType" />,
      // },
      // {
      //   name: 'queryRoleLov',
      //   width: 200,
      //   editor: () => <Lov name="queryRoleNames" />,
      // },
      {
        name: 'operationRoleLov',
        width: 200,
        editor: () => <Lov name="operationRoleNames" />,
      },
      {
        name: 'postActionIdLov',
        width: 200,
        editor: () => <Lov name="functionNames" />,
      },
      {
        name: 'flowCode',
        width: 200,
        editor: true,
      },
      {
        name: 'nodeDesc',
        width: 150,
        editor: () => <TextField name="nodeDesc" />,
      },
      {
        name: 'filterCreatorFlag',
        width: 100,
        editor: true,
      },
    ];
  }

  // 操作列渲染
  @Bind()
  commands({ record }) {
    const btns = [];
    const { activeKey = '' } = this.state;
    if (!record.getState('editing')) {
      btns.push(
        <a style={{ cursor: 'pointer' }} onClick={() => this.handleAction(record, activeKey)}>
          {intl.get('hzero.common.status.editor').d('编辑')}
        </a>
      );
    } else {
      btns.push(
        <a
          style={{ cursor: 'pointer', marginRight: '8px' }}
          onClick={() => this.handleAction(record, activeKey)}
        >
          {intl.get('hzero.common.status.cancel').d('取消')}
        </a>,
        <a style={{ cursor: 'pointer' }} onClick={() => this.tableDataSave(record, activeKey)}>
          {intl.get('hzero.common.status.save').d('保存')}
        </a>
      );
    }
    return btns;
  }

  /**
   * 操作行的编辑与取消
   * @param {*object} record - 行数据
   * @param {*string} activeKey - 当前tabKey
   */
  @Bind()
  handleAction(record, activeKey) {
    if (!record.getState('editing')) {
      record.setState('editing', true);
    } else if (record.get('relationPageId') || record.get('statusOperationId')) {
      record.reset();
      record.setState('editing', false);
    } else {
      this.getCurrentDs(activeKey).remove(record);
    }
  }

  /**
   * 操作行保存
   * @param {*object} record - 行数据
   * @param {*string} activeKey - 当前tabKey
   */
  @Bind()
  async tableDataSave(record, activeKey) {
    const { statusConfigId = '' } = this.state;
    const currentDS = this.getCurrentDs(activeKey);
    let response;
    if (activeKey === 'pageDefine') {
      response = await tablePageDataSave(new Array({ ...record.toJSONData(), statusConfigId }));
    } else if (activeKey === 'buttonDefine') {
      response = await tableButtonDataSave(new Array({ ...record.toJSONData(), statusConfigId }));
    }
    if (!isEmpty(response) && response.message && response.failed) {
      notification.error({ message: response.message });
    } else {
      currentDS.query();
    }
  }

  /**
   * 获得当前弹框DS
   * @param {string} key - 当前tabKey
   */
  @Bind()
  getCurrentDrawerDs(key) {
    const { allDrawerDataDs = {} } = this.state;
    if (allDrawerDataDs[key]) {
      return allDrawerDataDs[key];
    } else {
      let currentDrawerDataDs;
      switch (key) {
        case 'statusDefine':
          currentDrawerDataDs = new DataSet(drawerData('statusDefine'));
          break;
        case 'statePermissionConfig':
          currentDrawerDataDs = new DataSet(drawerData('statePermissionConfig'));
          break;
        // case 'stateMachineStrategy':
        //   currentDrawerDataDs = new DataSet(drawerData('statePermissionConfig'));
        //   break;
        default:
          break;
      }
      this.setState({
        allDrawerDataDs: { ...allDrawerDataDs, [key]: currentDrawerDataDs },
      });
      return currentDrawerDataDs;
    }
  }

  /**
   * 新增值
   * @param {number} flag - 新增（0）或修改（1）标识
   * @param {object} record - 修改行
   * @param {string} activeKey - 当前tabKey
   */
  @Bind()
  handleCreate(flag, record = {}, activeKey) {
    if (['statusDefine', 'statePermissionConfig'].includes(activeKey)) {
      this.handleDrawerEdit(flag, record, activeKey);
    } else if (['pageDefine', 'buttonDefine'].includes(activeKey)) {
      const currentRecord = this.getCurrentDs(activeKey).create({}, 0);
      currentRecord.setState('editing', true);
    } else {
      const { partKey } = this.state;
      const currentRecord = this.getCurrentDs(activeKey, partKey).create({}, 0);
      currentRecord.setState('editing', true);
    }
  }

  /**
   * 删除值
   * @param {object} data - 选择行
   * @param {string} activeKey - 当前tabKey
   */
  @Bind()
  handleDelete(data = [], activeKey) {
    const { statusConfigId, statusDetailId, partKey } = this.state;
    let response;

    if (activeKey === 'statusDefine') {
      response = deleteLine(data);
    } else if (activeKey === 'pageDefine') {
      response = tablePageDataDelete(data);
    } else if (activeKey === 'buttonDefine') {
      response = tableButtonDataDelete(data);
    } else if (activeKey === 'stateMachineStrategy') {
      response = tableStrategyDataDelete(data);
    }

    response.then((res) => {
      if (res) {
        if (res.failed) {
          notification.warning({
            message: res.message,
            placement: 'bottomRight',
          });
        } else {
          notification.success({
            message: intl.get(`${prefix}.view.message.deleteSuccess`).d('删除成功!'),
            placement: 'bottomRight',
          });
          const tableDs = this.getCurrentDs(activeKey, partKey);
          if (['statusDefine', 'pageDefine', 'buttonDefine'].includes(activeKey)) {
            tableDs.setQueryParameter('statusConfigId', statusConfigId);
          } else if (activeKey === 'stateMachineStrategy') {
            tableDs.setQueryParameter('statusDetailId', statusDetailId);
          }
          tableDs.query();
        }
      }
    });
  }

  @Bind()
  handleReferenceConfig(_, activeKey) {
    const { statusConfigId = '', partKey } = this.state;
    const tableDs = this.getCurrentDs(activeKey, partKey);
    getReferenceConfig(statusConfigId).then((res) => {
      if (res === 'success' || !res.failed) {
        if (activeKey === 'stateMachineStrategy') {
          this.setState({ partKey: '1', activeKey });
          const leftTree = this.getCurrentDs('stateMachineStrategy', '1');
          const rightTree = this.getCurrentDs('stateMachineStrategy', '2');
          leftTree.setQueryParameter('statusConfigId', statusConfigId);
          leftTree.query();
          rightTree.loadData([]);
        } else {
          getReferenceConfig(statusConfigId).then(() => {
            tableDs.query();
          });
        }
        notification.success({
          message: intl.get(`${prefix}.view.message.referenceSuccess`).d('引用成功!'),
          placement: 'bottomRight',
        });
      } else if (res && res.failed && res.message) {
        notification.warning({
          message: res.message,
          placement: 'bottomRight',
        });
      }
    });
  }

  /**
   * 保存值
   */
  @Bind()
  async handleSave(resolve, reject) {
    const { activeKey, partKey, statusDetailId } = this.state;
    const { moduleCode = '' } = this.headerDataDs.current.toData();
    const currentDS = this.getCurrentDs(activeKey, partKey);
    const defaultConditionType = 'TRUE'; // 后端需要默认值 不然没选报错
    const conditionJson = {
      conditionType: defaultConditionType,
      conditionLines: [],
    };
    const validFlag = await currentDS?.current?.validate();
    if (validFlag) {
      const payload = currentDS.toJSONData().map((n) => ({
        conditionLines: [],
        conditionJson: JSON.stringify(conditionJson),
        conditionType: 'TRUE',
        ...n,
        statusDetailId,
        moduleCode: 'SCUX_'.concat(moduleCode),
      }));
      const response = tableStrategyDataSave(payload);
      response.then((res) => {
        if (res) {
          if (res.failed) {
            notification.warning({
              message: res.message,
              placement: 'bottomRight',
            });
          } else {
            notification.success({
              message: intl.get(`${prefix}.view.message.saveSuccess`).d('保存成功!'),
              placement: 'bottomRight',
            });
            currentDS.setQueryParameter('statusDetailId', statusDetailId);
            currentDS.query();
            if (resolve && typeof resolve === 'function') {
              resolve();
            }
          }
        }
      });
    } else {
      notification.warning({
        message: intl.get(`${prefix}.view.message.warning`).d('请填写必填项!'),
        placement: 'bottomRight',
      });
      if (reject && typeof reject === 'function') {
        reject();
      }
    }
  }

  /**
   * 弹框（新增/编辑）
   * @param {number} flag - 新增（0）或修改（1）标识
   * @param {object} record - 修改行
   * @param {string} activeKey - 当前tabKey
   */
  @Bind()
  handleDrawerEdit(flag, record = {}, activeKey) {
    let drawerDataDs = this.getCurrentDrawerDs(activeKey);
    const { allDrawerDataDs } = this.state;

    const statusDetailId = !isEmpty(record) ? record.get('statusDetailId') : undefined;
    if (flag) {
      drawerDataDs.setQueryParameter('statusDetailId', statusDetailId);
      drawerDataDs.query().then((res) => {
        if (res) {
          drawerDataDs.current.status = 'update';
        }
      });
    } else {
      drawerDataDs = new DataSet(drawerData(this.state.activeKey));
      drawerDataDs.create({}, 0);
      this.setState({
        allDrawerDataDs: { ...allDrawerDataDs, [activeKey]: drawerDataDs },
      });
    }

    // 弹框
    if (activeKey === 'statusDefine') {
      this.statusDefineModal(drawerDataDs, flag);
    } else {
      this.statePermissionConfigModal(drawerDataDs);
    }
  }

  /**
   * 状态定义弹框
   * @param {object} drawerDataDs - 弹框DS
   * @param {number} flag - 是否新建，0新建，1修改
   */
  @Bind()
  statusDefineModal(drawerDataDs, flag) {
    Modal.open({
      title: intl.get(`${prefix}.modal.title.newService`).d('新建服务'),
      drawer: true,
      closable: true,
      children: (
        <Spin dataSet={drawerDataDs}>
          <Form dataSet={drawerDataDs} labelAlign="left" labelWidth={90}>
            <TextField name="statusCode" disabled={flag} />
            <IntlField name="statusDesc" />
            <NumberField name="sortNum" />
            <Select name="statusStageCode" />
            <Switch name="enabledFlag" />
          </Form>
        </Spin>
      ),
      style: { width: 400 },
      onOk: this.handleConfirm,
    });
  }

  /**
   * 状态权限配置弹框
   * @param {object} drawerDataDs
   */
  @Bind()
  statePermissionConfigModal(drawerDataDs) {
    Modal.open({
      title: intl.get(`${prefix}.modal.title.editNewService`).d('编辑权限'),
      drawer: true,
      closable: true,
      children: (
        <Spin dataSet={drawerDataDs}>
          <Form dataSet={drawerDataDs} labelAlign="left" labelWidth={100}>
            <Output name="statusCode" />
            <Output name="statusDesc" />
            <Lov name="relationPageLOV" />
            <Lov name="supplierRelationPageLOV" />

            <SelectBox name="editableFlag">
              <Option value="0">{intl.get(`${prefix}.view.message.onlyRead`).d('只读')}</Option>
              <Option value="1">{intl.get(`${prefix}.view.message.ReadAndWrite`).d('读写')}</Option>
            </SelectBox>
            <Lov name="queryRoleLOV" />
            <Switch name="authorityEnabledFlag" />
          </Form>
        </Spin>
      ),
      style: { width: 400 },
      onOk: this.handleConfirm,
    });
  }

  // 弹框确认
  @Bind()
  async handleConfirm() {
    const { statusConfigId, activeKey } = this.state;
    const drawerDataDs = this.getCurrentDrawerDs(activeKey);
    const validFlag = await drawerDataDs.current.validate();
    let response;

    let flag = true;
    if (validFlag) {
      const currentData = drawerDataDs.current.toJSONData();
      const newData = {
        ...currentData,
        statusConfigId,
      };
      if (activeKey === 'statusDefine') {
        response = confirmDefineData(newData);
      } else if (activeKey === 'statePermissionConfig') {
        response = confirmAuthorityData(newData);
      }
      response.then((res) => {
        if (res) {
          if (res.failed) {
            notification.warning({
              message: res.message,
              placement: 'bottomRight',
            });
            flag = false;
          } else {
            const tableDs = this.getCurrentDs(activeKey);
            tableDs.setQueryParameter('statusConfigId', statusConfigId);
            tableDs.query();
          }
        }
      });
      return flag;
    } else {
      notification.warning({
        message: intl.get(`${prefix}.view.message.warning`).d('请填写必填项!'),
        placement: 'bottomRight',
      });
      return false;
    }
  }

  /**
   * 策略弹框
   */
  openEditModal = () => {
    Modal.open({
      key: modalKey,
      title: intl.get(`${prefix}.model.moldFileManagement.condition`).d('条件规则配置'),
      closable: true,
      okCancel: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: 800 },
      onOk: () => {
        this.tempSavePolicyConfig();
      },
      afterClose: () => this.closePolicyConfigModal(),
      children: (
        <PolicyConfigModal
          paramTableDs={this.paramTableDs}
          conditionJsonDs={this.conditionJsonDs}
          policyConfigDataDs={this.policyConfigDataDs}
          customizeConditionCombinationDs={this.customizeConditionCombinationDs}
          conditionCreate={() => {
            this.conditionJsonDs.create({});
          }}
          // returnFieldDs={returnFieldDs} //执行规则暂不需要
          // returnValueDs={returnValueDs}
        />
      ),
    });
  };

  /**
   * 策略弹框
   * @param {object} param - {record,dataSet}
   * @param {boolean} flag - 展开/关闭标识
   */
  @Bind()
  handleStrategyModal(param = {}) {
    const { record = {} } = param;
    const statusDetailIdFromLine = record.get('statusDetailId');
    getConfigValues({ statusDetailId: statusDetailIdFromLine }).then((res) => {
      if (res) {
        const modalData = (res.content || []).filter((n) => n.ruleId === record.get('ruleId'));
        const { conditionType = '', conditionLines = [], customizeConditionCombination } =
          modalData.length > 0 && modalData[0].conditionJson
            ? JSON.parse(modalData[0].conditionJson)
            : record.data && record.data.conditionJson
            ? JSON.parse(record.data && record.data.conditionJson)
            : {};
        const editData = {
          ...record.data,
          conditionType,
          conditionLines,
        };
        this.policyConfigDataDs.create(editData);
        this.conditionJsonDs.loadData(conditionLines);
        this.customizeConditionCombinationDs.create({ customizeConditionCombination });
        this.openEditModal();
      }
    });
  }

  @Bind()
  closePolicyConfigModal() {
    this.policyConfigDataDs.reset();
    // returnFieldDs.reset();
    this.conditionJsonDs.loadData([]);
    this.customizeConditionCombinationDs.reset();
    // console.log('this.conditionJsonDs---', this.conditionJsonDs.toData());
    // const currentDS = this.getCurrentDs(this.state.activeKey, this.state.partKey);
    // console.log('currentDS---', currentDS.toData());
  }

  // 状态机策略保存
  @Bind()
  tempSavePolicyConfig() {
    const { activeKey = '', partKey = '' } = this.state;
    this.policyConfigDataDs.validate().then((response) => {
      this.conditionJsonDs.validate().then((r) => {
        this.customizeConditionCombinationDs.validate().then((vr) => {
          const policyConfigData = this.policyConfigDataDs.current.toData();
          const { conditionType } = policyConfigData;
          if (response && (conditionType === 'TRUE' || (r && vr))) {
            const {
              customizeConditionCombination,
            } = this.customizeConditionCombinationDs.current.toData();
            const conditionJsonData = this.conditionJsonDs.toData();
            const conditionJson = {
              conditionType,
              conditionLines: conditionType === 'TRUE' ? [] : conditionJsonData,
              customizeConditionCombination:
                conditionType === 'TRUE' ? undefined : customizeConditionCombination,
            };
            // 返回字段值拼成对象最后转成json字符串
            const saveData = {
              ...omit(policyConfigData, ['conditionExpression']),
              tenantId: getCurrentOrganizationId(),
              conditionJson: JSON.stringify(conditionJson),
            };
            const currentDS = this.getCurrentDs(activeKey, partKey);
            currentDS.current.set(saveData);
            // return this.handleSave(resolve, reject);
          }
        });
      });
    });
  }

  // 行触发
  @Bind()
  onRow(record) {
    const { activeKey, activatedStatusDetailId } = this.state;
    return {
      onClick: () => {
        const { statusDetailId = '', statusConfigId = '' } = record.data || {};
        this.setState({ activatedStatusDetailId: statusDetailId });
        judgeStateInProcess({ statusDetailId }).then((res) => {
          if (res >= 1) {
            this.setState({ partKey: '3', statusDetailId, workFlowFlag: 1 });
            const tableDs = this.getCurrentDs(activeKey, '3');
            tableDs.getField('statusCodeLOV').setLovPara('statusConfigId', statusConfigId);
            tableDs.getField('statusCodeLOV').setLovPara('tenantId', organizationId);
            tableDs.setQueryParameter('statusDetailId', statusDetailId);
            tableDs.query();
          } else {
            this.setState({ partKey: '2', statusDetailId, workFlowFlag: 0 });
            const tableDs = this.getCurrentDs(activeKey, '2');
            tableDs.getField('operationLov').setLovPara('statusConfigId', statusConfigId);
            tableDs.getField('operationLov').setLovPara('tenantId', organizationId);
            tableDs.getField('statusCodeLOV').setLovPara('statusConfigId', statusConfigId);
            tableDs.getField('statusCodeLOV').setLovPara('tenantId', organizationId);
            tableDs.setQueryParameter('statusDetailId', statusDetailId);
            tableDs.query();
          }
        });
      },
      style: {
        background: record.get('statusDetailId') === activatedStatusDetailId ? '#f0fffe' : '#fff',
      },
    };
  }

  // 导出
  @Bind()
  handleExport(statusConfigId) {
    this.setState({ exportLoading: true });
    const api = `${SRM_SIEC}/v1/${organizationId}/status-details/export?statusConfigId=${statusConfigId}`;
    downloadFileByAxios({
      requestUrl: api,
      method: 'GET',
    }).finally(() => {
      this.setState({ exportLoading: false });
    });
  }

  /**
   * tab切换
   * @param {string} key -当前tabKey
   */
  @Bind()
  handleTabChange(key) {
    const { statusConfigId = '' } = this.state;
    if (key === 'stateMachineStrategy') {
      this.setState({ partKey: '1', activeKey: key });
      const leftDS = this.getCurrentDs(key, '1');
      leftDS.setQueryParameter('statusConfigId', statusConfigId);
      leftDS.query();
    } else {
      this.setState({ partKey: '', activeKey: key, statusDetailId: '' });
      const currentDS = this.getCurrentDs(key);
      currentDS.setQueryParameter('statusConfigId', statusConfigId);
      currentDS.query();
    }
  }

  render() {
    const {
      statusConfigId,
      statusDetailId,
      activeKey,
      partKey,
      // modalVisible,
      // conditionVisible,
      workFlowFlag,
    } = this.state;

    const Buttons = observer((props) => {
      const selectedData = props.dataSet.selected.map((item) => item.data);
      const tenantId = getCurrentOrganizationId();
      const templateCode = 'SRM_C_SIEC_STATUS_DETAIL_IMPORT';
      return (
        ['statusDefine', 'pageDefine', 'buttonDefine', 'stateMachineStrategy'].includes(
          activeKey
        ) && (
          <Fragment>
            <Button
              icon="add"
              color="primary"
              onClick={() => this.handleCreate(0, {}, activeKey)}
              disabled={activeKey === 'stateMachineStrategy' && !statusDetailId}
            >
              {intl.get(`${prefix}.view.button.create`).d('新增值')}
            </Button>
            {activeKey === 'stateMachineStrategy' && (
              <Button
                onClick={() => this.handleSave()}
                disabled={activeKey === 'stateMachineStrategy' && !statusDetailId}
              >
                {intl.get(`${prefix}.view.button.save`).d('保存值')}
              </Button>
            )}
            <Button
              icon="delete"
              onClick={() => this.handleDelete(selectedData, activeKey)}
              disabled={isEmpty(selectedData)}
            >
              {intl.get(`${prefix}.view.button.delete`).d('删除值')}
            </Button>
            {activeKey === 'statusDefine' && (
              <CommonImport
                businessObjectTemplateCode={templateCode}
                prefixPatch={SRM_SIEC}
                refreshButton
                buttonText={intl.get(`${prefix}.view.button.newImport`).d('导入')}
                args={{
                  tenantId,
                  templateCode,
                }}
                buttonProps={{
                  icon: 'archive',
                  type: 'c7n-pro',
                }}
              />
            )}
            {activeKey === 'statusDefine' && (
              <Button
                icon="unarchive"
                onClick={() => this.handleExport(statusConfigId)}
                loading={this.state.exportLoading}
              >
                {intl.get(`${prefix}.view.button.export`).d('导出')}
              </Button>
            )}
            <Tooltip
              title={intl
                .get(`${prefix}.view.message.title.tooltip.group`)
                .d('引用默认配置会清空当前所有的配置')}
              placement="right"
            >
              <Button onClick={() => this.handleReferenceConfig(selectedData, activeKey)}>
                {intl.get(`${prefix}.view.button.referenceConfig`).d('引用默认配置')}
              </Button>
            </Tooltip>
          </Fragment>
        )
      );
    });

    return (
      <Fragment>
        <Header title={intl.get(`${prefix}.view.title.definitionMachine`).d('状态机定义')}>
          {statusConfigId && <Buttons dataSet={this.getCurrentDs(activeKey, partKey)} />}
        </Header>
        <Row className="contentStyle">
          <Col span={5}>
            <Content>
              <Tree
                dataSet={this.treeDataDs}
                renderer={({ record }) => record.get('moduleDesc')}
                showIcon
              />
            </Content>
          </Col>
          <Col span={19}>
            <Content>
              {!statusConfigId ? (
                <div className="rule-definition-black">
                  <div className="blank-pic" />
                  <div className="blank-title">
                    {intl.get(`${prefix}.view.title.blankTitle`).d('请从左侧菜单中选择状态机分类')}
                  </div>
                  <div className="blank-desc">
                    {intl
                      .get(`${prefix}.view.title.blankDesc`)
                      .d('状态机定义可以配置相关单据的流程')}
                  </div>
                </div>
              ) : (
                <Tabs onChange={this.handleTabChange}>
                  <TabPane
                    tab={intl.get(`${prefix}.view.tab.statusDefine`).d('状态定义')}
                    key="statusDefine"
                  >
                    <TabContainer
                      headerDataDs={this.headerDataDs}
                      currentDS={this.statusDefineDS}
                      columns={this.columns}
                    />
                  </TabPane>
                  {/* <TabPane
                      tab={intl.get(`${prefix}.view.tab.pageDefine`).d('页面定义')}
                      key="pageDefine"
                    >
                      <TabContainer
                        headerDataDs={this.headerDataDs}
                        currentDS={this.pageTableDataDS}
                        columns={this.pageColumns}
                      />
                    </TabPane> */}
                  <TabPane
                    tab={intl.get(`${prefix}.view.tab.buttonDefine`).d('操作定义')}
                    key="buttonDefine"
                  >
                    <TabContainer
                      headerDataDs={this.headerDataDs}
                      currentDS={this.buttonTableDataDS}
                      columns={this.buttonColumns}
                    />
                  </TabPane>
                  <TabPane
                    tab={intl.get(`${prefix}.view.tab.statePermissionConfig`).d('状态权限配置')}
                    key="statePermissionConfig"
                  >
                    <TabContainer
                      headerDataDs={this.headerDataDs}
                      currentDS={this.statePermissionConfigDS}
                      columns={this.permissionColumns}
                    />
                  </TabPane>
                  <TabPane
                    tab={intl.get(`${prefix}.view.tab.stateMachineStrategy`).d('状态机策略')}
                    key="stateMachineStrategy"
                  >
                    <Spin dataSet={this.headerDataDs}>
                      <Form dataSet={this.headerDataDs} columns={3} labelWidth={130}>
                        <Output name="classificationDesc" />
                        <Output name="moduleDesc" />
                        <Output name="statusMachineDesc" />
                      </Form>
                    </Spin>
                    <div
                      style={{
                        position: 'relative',
                        marginTop: '20px',
                        borderTop: '1px solid #ddd',
                        paddingTop: '14px',
                        display: 'flex',
                        zIndex: '1',
                      }}
                    >
                      <div style={{ width: '20%' }}>
                        <Table
                          dataSet={this.stateMachineStrategyLeftDS}
                          columns={this.strategyLeftColumns}
                          customizable={false}
                          onRow={({ record }) => this.onRow(record)}
                          highLightRow={false}
                        />
                      </div>
                      <div style={{ width: '78%', marginLeft: '12px' }}>
                        <Table
                          dataSet={
                            workFlowFlag === 1
                              ? this.stateMachineStrategyWorkFlowDS
                              : this.stateMachineStrategyRightDS
                          }
                          columns={this.getStrategyRightColumns(workFlowFlag)}
                          customizable={false}
                          width="900"
                        />
                        {/* <PolicyConfigModal
                          title={intl
                            .get(`${prefix}.model.moldFileManagement.condition`)
                            .d('条件规则配置')}
                          conditionVisible={conditionVisible}
                          handleConditionVisible={this.handleConditionVisible}
                          cancel={() => this.handleModalVisible(false)}
                          onOk={this.tempSavePolicyConfig}
                          visible={modalVisible}
                          policyConfigDataDs={this.policyConfigDataDs}
                          conditionJsonDs={this.conditionJsonDs}
                          paramTableDs={this.paramTableDs}
                        /> */}
                      </div>
                    </div>
                  </TabPane>
                </Tabs>
              )}
            </Content>
          </Col>
        </Row>
      </Fragment>
    );
  }
}
