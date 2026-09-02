import React, { useMemo, useCallback, useEffect } from 'react';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';

import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { parse, stringify } from 'querystring';
import { observer } from 'mobx-react-lite';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { filterNullValueObject, getCurrentUserId, getResponse } from 'hzero-front/lib/utils/utils';

import { tableDs, prefix, getTabValue } from './initialDs';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { supplierEvaluationPostApi } from '../../../../services/scux/supplierEvaluationServices';

const handleToTenderDetail = (history: any, record: any) => {
  history.push({
    pathname: `/ssrc/new-project-setup/detail/${record.get('sourceProjectId')}`,
  });
};

const handleToDetail = (history: any, search: any) => {
  history.push({
    pathname: '/scux/supplier-evaluation/detail',
    search,
  });
};

const handleToSupplierEntryDetail = (history: any, record: any, type: string) => {
  handleToDetail(history, stringify({
    nominationHeaderId: record?.get('nominationHeaderId'),
    type,
  }));
};

const handleToEdit = (history: any, record: any) => {
  handleToDetail(history, stringify({
    nominationHeaderId: record?.get('nominationHeaderId'),
    type: 'pendingReview',
  }));
};

const handleToShortlistEdit = (history: any, record: any) => {
  handleToDetail(history, stringify({
    nominationHeaderId: record?.get('nominationHeaderId'),
    type: 'edit',
  }));
};

const handleToChange = (history: any, record: any) => {
  const nominationHeaderId = record?.get('nominationHeaderId');
  Modal.confirm({
    title: '变更确认',
    children: '请确认是否进行变更。若无需变更，可直接点击招标计划单号进行查看。',
    onOk: async () => {
      if (record?.get('nominationStatus') !== 'CHANGING') {
        const res = await supplierEvaluationPostApi({ nominationHeaderId }, 'CHANGE');
        if (!getResponse(res)) return;
      }
      handleToDetail(history, stringify({
        nominationHeaderId,
        type: 'change',
      }));
    },
  });
};

const handleToSubmit = (history: any, record: any) => {
  handleToDetail(history, stringify({
    nominationHeaderId: record?.get('nominationHeaderId'),
    type: 'submit',
  }));
};

const SupplierEvaluationList = ({ history, location }: any) => {
  // 跳转时 URL 携带 sourceProjectNum，预置到查询条件进行过滤
  const { sourceProjectNum } = parse((location?.search || '').replace(/^\?/, ''));
  const tableDS = useMemo(() => new DataSet(tableDs('ALL')), []);

  useEffect(() => {
    setTimeout(()=>{
      // 跳转时 URL 携带 sourceProjectNum，预置到查询条件进行过滤
      if (tableDS && sourceProjectNum) {
        // 同步写入 queryDataSet.current（无记录时先 create），便于搜索框回显与导出
        const qds = tableDS.queryDataSet;
        if (qds && !qds.current) {
          qds.create({});
        }
        qds?.current?.set('sourceProjectNum', sourceProjectNum);
      }
      tableDS?.query();
    }, 500)
  }, []);

  const columns = useMemo(() => {
    const renderSourceProjectNum = ({ value, record }: any) => {
      // 列表接口未返回 sourceProjectNum 时，用跳转带入的查询值兜底展示
      const displayValue = value || tableDS?.getQueryParameter?.('sourceProjectNum');
      return (
        <a
          onClick={() => handleToTenderDetail(history, record)}
        >
          {displayValue}
        </a>
      );
    };

    const renderNominationNum = ({ value, record }: any) => (
      <a
        onClick={() => handleToSupplierEntryDetail(history, record, 'view')}
      >
        {value}
      </a>
    );

    const renderFbcNumber = ({ value, record }: any) => {
      const url = record.get('fbcUrl');
      if (!value) return null;
      if (url) {
        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        );
      }
      return <span>{value}</span>;
    };

    // 全部 t：根据状态显示不同操作按钮
    const currentUserId = getCurrentUserId();

    const renderAction = ({ record }: any) => {
      const isBidDirector = String(record.get('createdBy')) === String(currentUserId);
      // 评审人员：技术/商务/财务任一评审权限标记为 1（与详情页一致）
      const isReviewer = +record.get('technologyUserFlag') === 1
        || +record.get('businessUserFlag') === 1
        || +record.get('financeUserFlag') === 1;
      const status = record.get('nominationStatus');
      const buttons: any[] = [];

      // 新建 → 编辑（仅入围负责人）
      if (status === 'NEW' && isBidDirector) {
        buttons.push(
          <Button funcType={FuncType.flat} onClick={() => handleToShortlistEdit(history, record)}>
            {intl.get(`${prefix}.button.edit`).d('编辑')}
          </Button>
        );
      }

      // 待评审 → 变更（入围负责人）/ 评审（评审人员）；变更中 → 仅变更（入围负责人）
      if (status === 'PENDING_REVIEW' || status === 'CHANGING') {
        if (isBidDirector) {
          buttons.push(
            <Button funcType={FuncType.flat} onClick={() => handleToChange(history, record)}>
              {intl.get(`${prefix}.button.change`).d('变更')}
            </Button>
          );
        }
        if (status === 'PENDING_REVIEW' && isReviewer) {
          buttons.push(
            <Button funcType={FuncType.flat} onClick={() => handleToEdit(history, record)}>
              {intl.get(`${prefix}.button.review`).d('评审')}
            </Button>
          );
        }
      }

      // 待发布/待提交 → 修改（评审人员）/ 提交 / 变更（仅入围负责人）
      if (status === 'TO_BE_RELEASED') {
        if (isReviewer) {
          buttons.push(
            <Button funcType={FuncType.flat} onClick={() => handleToEdit(history, record)}>
              {intl.get(`${prefix}.button.modify`).d('修改')}
            </Button>
          );
        }
        if (isBidDirector) {
          buttons.push(
            <Button funcType={FuncType.flat} onClick={() => handleToSubmit(history, record)}>
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>,
            <Button funcType={FuncType.flat} onClick={() => handleToChange(history, record)}>
              {intl.get(`${prefix}.button.change`).d('变更')}
            </Button>
          );
        }
      }

      // 审批拒绝 → 提交（仅入围负责人）
      if (status === 'REJECTED' && isBidDirector) {
        buttons.push(
          <Button funcType={FuncType.flat} onClick={() => handleToSubmit(history, record)}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
        );
      }

      // 无任何按钮时展示 -
      if (buttons.length === 0) {
        return '-';
      }
      return <>{buttons}</>;
    };

    return [
      { name: 'nominationStatusMeaning', width: 80 },
      {
        name: 'action',
        title: intl.get(`${prefix}.field.action`).d('操作'),
        width: 210,
        align: 'center',
        renderer: renderAction,
      },
      { name: 'nominationNum', width: 160, renderer: renderNominationNum },
      { name: 'sourceProjectNum', width: 160, renderer: renderSourceProjectNum },
      { name: 'sourceProjectName', width: 200 },
      { name: 'companyName', width: 150 },
      { name: 'templateName', width: 150 },
      { name: 'bidDirectorName', width: 120 },
      { name: 'createdByName', width: 120 },
      { name: 'fbcNumber', width: 150, renderer: renderFbcNumber },
      { name: 'fbcUrl', width: 200 },
      { name: 'fbcResult', width: 150 },
      { name: 'financePersonName', width: 120 },
      { name: 'technicalPersonName', width: 120 },
      { name: 'supManagerPersonName', width: 120 },
      { name: 'reviewType', width: 120 },
      { name: 'creationDate', width: 150 },
    ];
  }, [history, intl, prefix]);

  const getQueryData = useCallback(() => {
    const queryData = tableDS?.queryDataSet?.current?.toData() || {};
    return filterNullValueObject(queryData);
  }, [tableDS]);

  const getSelectedKeys = useCallback(() => {
    const key = getTabValue('ALL', 'primaryKey');
    if (!key) return {};
    return { [`${key}s`]: tableDS.selected.map((r: any) => r.get(key)) };
  }, [tableDS]);

  const handleExport = useCallback(() => {
    let data = {};
    if (tableDS.selected.length > 0) {
      data = getSelectedKeys();
    } else {
      data = getQueryData();
    }
    const exportUrl = getTabValue('ALL', 'exportUrl');
    downloadFileByAxios({
      requestUrl: exportUrl,
      method: 'POST',
      queryData: data,
    });
  }, [tableDS]);

  const getButtonConfigs = (selected: any[]) => {
    return [
      {
        name: 'newExport',
        child: selected.length === 0
          ? intl.get('hzero.common.button.newExport').d('(新)导出')
          : intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'unarchive',
          onClick: () => handleExport(),
        },
      },
    ];
  };

  const HeaderButtons = useMemo(
    () =>
      observer(({ dataSet }: any) => {
        const selected = dataSet?.selected || [];
        const buttons = getButtonConfigs(selected);

        return <DynamicButtons buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />;
      }),
    [history, intl]
  );

  return (
    <>
      <Header title={intl.get(`${prefix}.view.title`).d('入围供应商评审')}>
        <HeaderButtons dataSet={tableDS} />
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 242px)' }}>
          <FilterBarTable
            virtual
            virtualCell
            columns={columns as any}
            dataSet={tableDS as any}
            style={{ maxHeight: 'calc(100% - 22px)' }}
            customizable
            customizedCode={getTabValue('ALL', 'customizedCode')}
            searchCode={getTabValue('ALL', 'searchCode')}
            filterBarConfig={{
              autoQuery: false,
            }}
          />
        </div>
      </Content>
    </>
  );
};

export default React.memo(formatterCollections({ code: [prefix] })(SupplierEvaluationList));
