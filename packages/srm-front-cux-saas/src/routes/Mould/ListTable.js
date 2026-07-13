/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-12-22 15:41:28
 * @LastEditors: yanglin
 * @LastEditTime: 2022-06-27 17:30:34
 */
import React, { PureComponent } from 'react';
// import { Table } from 'choerodon-ui/pro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import intl from 'utils/intl';
import style from './index.less';

const commonPrompt = 'siec.mould.model.common';

export default class ListTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // mountFlag: true,
    };
  }

  handleQuery = ({ params = {} }) => {
    const { dataSet } = this.props;

    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    const dataObj = dataSet.queryDataSet?.current?.toData();
    if (dataObj) {
      for (const key in dataObj) {
        if (!['multiSelectHeaderNums', 'multiSelectHeaderAndLineNums'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }

    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current?.set({
      ...params,
      ...clearParams,
    });

    dataSet.query(dataSet.currentPage);
  };

  resetQueryDs = () => {
    const { dataSet } = this.props;

    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current?.reset();
  };

  render() {
    const {
      dataSet,
      columns,
      code,
      searchCode,
      customizeTable,
      lovDs,
      searchTextField,
      searchPlaceholder,
      // handleChangeLov,
      showRightConfig,
      tableStatus,
      setTableStatus,
      ...otherParams
    } = this.props;
    let searchBarConfig = {
      right: {
        render: () => (
          <div className={style.rightTabs}>
            <div
              className={tableStatus === 'header' ? 'active' : ''}
              onClick={() => setTableStatus('header')}
            >
              <span>{intl.get(`${commonPrompt}.byMoldHeader`).d('按模具单')}</span>
            </div>
            <div
              className={tableStatus !== 'header' ? 'active' : ''}
              onClick={() => setTableStatus('line')}
            >
              <span>{intl.get(`${commonPrompt}.byMoldLine`).d('按模具行')}</span>
            </div>
          </div>
        ),
      },
    };
    if (tableStatus !== 'header') {
      searchBarConfig = {
        left: {
          render: () => (
            <MutlTextFieldSearch
              name="multiSelectHeaderAndLineNums"
              dataSet={dataSet}
              placeholder={intl
                .get('siec.mould.modal.multiSelectHeaderAndLineNums')
                .d('请输入模具编码-行号')}
            />
          ),
        },
        right: {
          render: () => (
            <div className={style.rightTabs}>
              <div
                className={tableStatus === 'header' ? 'active' : ''}
                onClick={() => setTableStatus('header')}
              >
                <span>{intl.get(`${commonPrompt}.byMoldHeader`).d('按模具单')}</span>
              </div>
              <div
                className={tableStatus !== 'header' ? 'active' : ''}
                onClick={() => setTableStatus('line')}
              >
                <span>{intl.get(`${commonPrompt}.byMoldLine`).d('按模具行')}</span>
              </div>
            </div>
          ),
        },
        onQuery: this.handleQuery,
        onClear: this.resetQueryDs,
        onReset: this.resetQueryDs,
      };
    }
    return (
      <div style={{ height: 'calc(100vh - 196px)' }}>
        {customizeTable(
          {
            code,
            dataSet,
          },
          <SearchBarTable
            style={{ maxHeight: `calc(100% - 22px)` }}
            searchCode={searchCode}
            dataSet={dataSet}
            columns={columns}
            // showAllPageSelectionButton
            {...otherParams}
            searchBarConfig={searchBarConfig}
          />
        )}
      </div>
    );
  }
}
