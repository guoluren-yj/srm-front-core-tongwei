import React, { useMemo, useEffect } from 'react';
import { Button, DataSet, Dropdown, Menu, Icon } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'hzero-front/lib/utils/intl';
import { Header, Content } from 'hzero-front/lib/components/Page';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import withProps from 'utils/withProps';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';

import EnableTag from '@/components/EnableTag';
import c7nModal, { confirm } from '@/utils/c7nModal';

import { listTableDataSet } from './storeDs';
import { headerOperateData } from './api';
import Detail from './Detail';

const Index = (props) => {
  const {
    match: { path = '' },
    tableDs,
  } = props;

  useEffect(() => {
    initQuery();
  }, []);

  const initQuery = async (flag = false) => {
    if (flag) {
      tableDs.query(tableDs.currentPage);
    } else {
      tableDs.query();
    }
  };

  // 启用/禁用
  const handleUpdate = async (record, other = {}) => {
    tableDs.status = 'loading';
    const res = getResponse(
      await headerOperateData({
        operateType: 'changeStatus',
        ruleId: record.get('ruleId'),
        ...other,
      })
    );
    if (res) {
      notification.success();
      initQuery(true);
      return;
    }
    tableDs.status = 'ready';
  };

  // 复制
  const handleCopy = async ({ ruleId }) => {
    const res = getResponse(
      await headerOperateData({
        operateType: 'copy',
        ruleId,
      })
    );
    if (res) {
      notification.success({
        message: intl.get('sagm.common.view.message.copySuccess').d('复制成功'),
      });
      initQuery(true);
    }
  };

  // 删除
  const handleDelete = (record) => {
    confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      content: intl.get('scux.feeRuleManagement.view.delete.modal.title').d('确认删除费用规则？'),
      onOk: async () => {
        tableDs.status = 'loading';
        const res = getResponse(
          await headerOperateData({
            operateType: 'delete',
            ruleId: record.get('ruleId'),
          })
        );
        if (res) {
          notification.success();
          initQuery(true);
          return true;
        }
        tableDs.status = 'ready';
      },
    });
  };

  // 行操作按钮
  const renderOptions = ({ record }) => {
    const { postageStatus: enabled, isDelete = 'Y', ruleId } = record.get([
      'postageStatus',
      'isDelete',
      'ruleId',
    ]);
    const options = [
      {
        text: intl.get('hzero.common.button.enable').d('启用'),
        show: !Number(enabled),
        event: () => handleUpdate(record, { postageStatus: '1' }),
      },
      {
        text: intl.get('hzero.common.button.disable').d('禁用'),
        show: isDelete === 'Y' && Number(enabled),
        event: () => handleUpdate(record, { postageStatus: '0' }),
      },
      {
        text: intl.get('hzero.common.button.copy').d('复制'),
        show: true,
        event: () => handleCopy({ ruleId }),
      },
      {
        text: intl.get('hzero.common.button.delete').d('删除'),
        show: isDelete === 'Y' && !Number(enabled),
        event: () => handleDelete(record),
      },
    ];

    const menus = options.filter((f) => f.show && f.type === 'menu');
    const actions = options.filter((f) => f.show && f.type !== 'menu');
    const menu = (
      <Menu>
        {menus.map((m) => (
          <Menu.Item key={m.text}>
            <a onClick={m.event} disabled={m.disabled}>
              {m.text}
            </a>
          </Menu.Item>
        ))}
      </Menu>
    );
    return (
      <span className="action-link">
        {actions.map((m, index) => (
          <Button
            color="primary"
            funcType="link"
            onClick={m.event}
            disabled={m.disabled}
            style={m.style || { marginLeft: index ? '16px' : 'unset' }}
          >
            {m.text}
          </Button>
        ))}
        {menus.length > 0 && (
          <Dropdown overlay={menu}>
            <Button color="primary" funcType="link" style={{ marginLeft: '16px' }}>
              {intl.get('sagm.common.model.options.more').d('更多操作')}
              <Icon type="arrow_drop_down" />
            </Button>
          </Dropdown>
        )}
      </span>
    );
  };

  // 编辑费用
  const handleOpenRight = ({
    ruleId,
    readOnly,
    title = intl.get('scux.feeRuleManagement.model.createAdditionalExpense').d('新建费用'),
  } = {}) => {
    const footerProps = readOnly
      ? { okFirst: true, okText: intl.get('hzero.common.button.close').d('关闭') }
      : { okText: intl.get('hzero.common.btn.save').d('保存') };
    c7nModal({
      title,
      key: 'freightRule',
      ...footerProps,
      style: { width: 1090 },
      children: <Detail readOnly={readOnly} ruleId={ruleId} onFetchList={initQuery} path={path} />,
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'postageStatus',
        width: 100,
        renderer: ({ record }) => <EnableTag enabledFlag={record.get('postageStatus')} />,
      },
      {
        name: 'postageName',
        width: 100,
        renderer: ({ record, text }) => (
          <a
            onClick={() =>
              handleOpenRight({
                ruleId: record.get('ruleId'),
                title: intl.get('sagm.freight.view.editAdditionalExpense').d('编辑附加费'),
              })
            }
          >
            {text}
          </a>
        ),
      },
      {
        name: 'postageType',
        width: 100,
      },
      {
        name: 'pricingMethod',
        width: 100,
      },
      {
        name: 'options',
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        // lock: 'right',
        renderer: renderOptions,
      },
      {
        name: 'createdBy',
        width: 120,
      },
      {
        name: 'creationDate',
      },
    ],
    []
  );

  return (
    <>
      <Header
        title={intl
          .get('scux.feeRuleManagement.view.title.twnf.feeRuleManagement')
          .d('费用规则管理')}
      >
        <Button icon="add" onClick={handleOpenRight}>
          {intl.get('hezro.common.button.add').d('新增')}
        </Button>
      </Header>
      <Content>
        <FilterBarTable
          key="feeRuleManagementList"
          cacheState
          border={false}
          dataSet={tableDs}
          columns={columns}
          customizable
          customizedCode="SCUX_TWNF_FEE_RULE_MANAGEMENT_LIST"
          filterBarConfig={{
            cacheKey: 'feeRuleManagementList',
            autoQuery: true,
            defaultSortedField: 'creationDate',
            left: {
              render: (ds) => {
                if (
                  ds &&
                  (!ds.getField('postageName') ||
                    !ds.getField('postageName')?.get('transformRequest'))
                ) {
                  ds.addField('postageName', {
                    transformRequest: (value) => {
                      if (value) {
                        return value.join(',');
                      }
                      return '';
                    },
                  });
                }
                return (
                  <MultipleTextSplitInput
                    name="postageName"
                    dataSet={ds}
                    placeholder={intl
                      .get('scux.feeRuleManagement.view.placeholder.multiProjectNumOrTitle')
                      .d('请输入附加费名称查询')}
                    style={{ width: '3rem' }}
                  />
                );
              },
            },
          }}
          style={{ maxHeight: 'calc(100% - 40px)' }}
        />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['scux.feeRuleManagement', 'sagm.common', 'sagm.freight'],
})(
  withProps(
    () => {
      return {
        tableDs: new DataSet(listTableDataSet()),
      };
    },
    {
      cacheState: true,
      keepOriginDataSet: true,
    }
  )(observer(Index))
);
