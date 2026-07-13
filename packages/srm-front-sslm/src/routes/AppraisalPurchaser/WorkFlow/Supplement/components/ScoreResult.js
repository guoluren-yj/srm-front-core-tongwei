/*
 * ScoreResult - 评分结果
 * @Date: 2023-11-20 13:33:31
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import React, { Fragment, useMemo, useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';

import SearchBar from '_components/SearchBarTable/SearchBar';

import { RenderReminder } from '@/routes/components/utils/appraisal';

const ScoreCombineTable = ({
  dataSet,
  wfParams,
  searchCode,
  custLoading,
  customizeTable,
  customizeUnitCode,
  supplementBasicDs,
}) => {
  const { modifyScoreRange, evalGranularity, evalHeaderId } =
    supplementBasicDs?.current?.get(['modifyScoreRange', 'evalGranularity', 'evalHeaderId']) || {};

  useEffect(() => {
    const queryParams = {
      ...wfParams,
      customizeUnitCode: [searchCode, customizeUnitCode].join(),
    };
    dataSet.setQueryParameter('queryParams', queryParams);
  }, [searchCode, customizeUnitCode, JSON.stringify(wfParams)]);

  // 处理筛选器fieldProps属性
  const fieldProps = useMemo(
    () => ({
      supplierId: {
        lovPara: {
          evalHeaderId,
        },
      },
    }),
    [evalHeaderId]
  );

  const columns = useMemo(() => {
    return [
      {
        name: 'supplierNum',
      },
      {
        name: 'supplierName',
      },
      {
        name: 'categoryName',
        hidden: evalGranularity !== 'SU+CA',
      },
      {
        name: 'itemName',
        hidden: evalGranularity !== 'SU+IT',
      },
      {
        name: 'lineScore',
        width: 80,
        renderer: ({ value, record: curRecord }) => {
          const { kpiEvalTplIndRemind } = curRecord?.get(['kpiEvalTplIndRemind']) || {};
          return [
            <span>{value}</span>,
            !isEmpty(kpiEvalTplIndRemind) && (
              <RenderReminder kpiEvalTplIndRemind={kpiEvalTplIndRemind} />
            ),
          ];
        },
      },
      {
        name: 'checkCollectScore',
        width: 80,
        editor: true,
        hidden: !modifyScoreRange?.includes('SUMMARY_SCORE'),
      },
      {
        name: 'rankNum',
        width: 100,
        renderer: ({ record }) => {
          const { rankNum, supplierTotalNum } = record?.get(['rankNum', 'supplierTotalNum']) || {};
          return rankNum ? `${rankNum}/${supplierTotalNum}` : '-';
        },
      },
      {
        name: 'levelCode',
        width: 80,
      },
      {
        name: 'checkLevelDesc',
        width: 100,
        editor: true,
        hidden: !modifyScoreRange?.includes('GRADE'),
      },
      {
        name: 'executeAction',
        width: 180,
      },
      {
        name: 'toStageDescription',
        width: 100,
      },
    ].filter(col => !col.hidden);
  }, [evalGranularity, modifyScoreRange]);

  return (
    <Fragment>
      <SearchBar
        autoQuery={false}
        dataSet={[dataSet]}
        searchCode={searchCode}
        fieldProps={fieldProps}
        defaultExpand={false}
        closeFilterSelector
      />
      {customizeTable(
        {
          code: customizeUnitCode,
        },
        <Table
          queryBar="none"
          dataSet={dataSet}
          columns={columns}
          custLoading={custLoading}
          selectionMode="none"
        />
      )}
    </Fragment>
  );
};

export default observer(ScoreCombineTable);
