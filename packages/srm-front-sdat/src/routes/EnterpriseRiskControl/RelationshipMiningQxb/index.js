/* eslint-disable react/no-array-index-key */
/**
 * 关系挖掘页面
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from 'components/Page';
import withProps from 'utils/withProps';
import uuid from 'uuid/v4';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import * as echarts from 'echarts';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  Row,
  Col,
  DataSet,
  Table,
  Button,
  Icon,
  Tooltip,
  Modal,
  CheckBox,
  TextField,
  Spin,
  Range,
} from 'choerodon-ui/pro';
import { Popover, Tabs } from 'choerodon-ui';
import notification from 'utils/notification';

import ToggleBtn from '@/components/ToggleBtn';
import { getUrlParam } from '@/utils/utils';
import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import {
  fetchRelationMining,
  fetchExportPath,
  getCompanyList,
  fetchMiningHisData, // 历史数据挖掘
  fetchReMining,
  fetchExportContract,
} from '@/services/riskControl/qxbMiningService';

import { RelationMiningDS } from './stores/relationMiningDS';
import RiskMapModal from './RiskMapModal';
import MiningHistory from './MiningHistory';

import styles from './index.less';

const defaultUrl = require('@/assets/illustrate01.svg');
const refreshSrc = require('@/assets/refresh_svg.svg');
const downloadSrc = require('@/assets/download.svg');
const noneSrc = require('@/assets/no_search_result.svg');

const { TabPane } = Tabs;

const { paramKey = 'testKey', tenantId = '' } = getUrlParam() || {};

let chartMiningDom = null;
let hisMiningDom = null;
let myMiningChart = null;

let relationsMap = []; // 揭示数据

let uniqueMiningData = []; // 挖掘数据
let uniqueHisMiningData = []; // 历史记录挖掘数据

let relationsMiningMap = []; // 挖掘数据
let relationsHisMiningMap = [];

let modal = null;
let hasHisMap = false;

let statusMap = {
  noData: true, // 查询无数据
  noQuery: true, // 未查询
};

const param = {
  tenantId,
  paramKey,
};

const RelationshipMining = (props) => {
  const { hisRoadListDS, qxbListDS } = props;

  const [activeKey, setActiveKey] = useState('road');
  const [refresh, setRefresh] = useState(false);
  const [companyList, setCompanyList] = useState([]); // 所有公司列表
  const [selectedList, setSelectedList] = useState([]); // 已勾选的公司列表
  // const [defaultSelect, setDefaultSelect] = useState(new Date().getTime());
  const [searchContent, setSearchContent] = useState('');
  const [filterList, setFilterList] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [selected, setSelected] = useState(null);
  const [syncFlag, setSyncFlag] = useState('');
  const [loading, setChangeLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [levelValue, setLevel] = useState(10);

  useEffect(() => {
    document.title = intl.get('sdat.supplier.view.title.relationShooting').d('关系排查');
    if (paramKey) {
      getCompanyList({ paramKey, tenantId }).then((res) => {
        if (getResponse(res)) {
          const comArr = [];
          if (res && res.length) {
            res.forEach((companyName) => {
              comArr.push({
                companyName,
                companyId: uuid(),
              });
            });
          }
          setCompanyList(comArr);
          setFilterList(comArr);
          setSelectedList(comArr.filter((_, index) => index < 20).map((item) => item.companyName));
        }
      });
    }

    return () => {
      chartMiningDom = null;
      hisMiningDom = null;
      myMiningChart = null;
      relationsMap = [];
      uniqueMiningData = [];
      uniqueHisMiningData = [];
      relationsMiningMap = [];
      relationsHisMiningMap = [];
      hasHisMap = false;
      statusMap = {};
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (activeKey === 'map') {
      refreshChart();
      refreshHisChart();
    }
  }, [activeKey]);

  /**
   * 重新挖掘操作
   */
  const handleReMining = async () => {
    const fetchType = selected?.dataType ?? '';

    if (selected && selected.dataId) {
      const res = await fetchReMining({
        ...selected,
        tenantId,
        fetchType,
        level: selected?.level ?? '',
        paramKey: selected?.searchKey ?? '',
      });

      if (getResponse(res) && !(res.code && res.code.includes('error'))) {
        setSyncFlag(new Date().getTime());
      }
    }
  };

  const refreshChart = () => {
    chartMiningDom = document.getElementById('supplier-relation-ship-mining');
    if (chartMiningDom) {
      myMiningChart = echarts.init(chartMiningDom);
      const option = chartOption('default');
      myMiningChart.setOption(option);
    }
  };

  const refreshHisChart = () => {
    hisMiningDom = document.getElementById('supplier-relation-his-mining');
    if (hisMiningDom) {
      myMiningChart = echarts.init(hisMiningDom);
      const option = chartOption('hisChart');
      myMiningChart.setOption(option);
    }
  };

  const resetChart = () => {
    const option = chartOption('default');
    if (myMiningChart) {
      myMiningChart.setOption(option);
    }
  };

  const chartOption = (type) => {
    let dataArr = [];
    let mapData = [];

    if (type === 'default') {
      dataArr = uniqueMiningData;
      mapData = relationsMiningMap;
    } else if (type === 'hisChart') {
      dataArr = uniqueHisMiningData;
      mapData = relationsHisMiningMap;
    }

    return {
      title: {
        text: intl.get('sdat.supplier.view.title.relationMap').d('关系图谱'),
      },
      tooltip: {
        show: false,
      },
      toolbox: {
        show: true,
        feature: {
          restore: {
            show: true,
            icon: `image://${refreshSrc}`,
          },
          saveAsImage: {
            show: true,
            icon: `image://${downloadSrc}`,
          },
        },
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'circular',
          symbolSize: 100,
          roam: true,
          itemStyle: {
            color: ({ data }) => {
              const name = data?.name ?? '';
              const colorStr =
                name.includes('有限') || name.includes('公司') || name.includes('合伙')
                  ? '#66a3e8'
                  : '#e85364';
              return colorStr;
            },
          },
          label: {
            show: true,
            formatter: (params) => {
              const label = params?.name ?? '';
              let result = '';

              for (let i = 0; i < label.length; i++) {
                if (i % 5 === 0 && i !== 0) {
                  result += `-${label[i]}`;
                } else {
                  result += label[i];
                }
              }

              const text = result?.split('-')?.join('\n') ?? '';
              return text;
            },
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 8],
          edgeLabel: {
            fontSize: 20,
          },
          data: dataArr,
          links: mapData,
          lineStyle: {
            opacity: 0.9,
            width: 1,
            curveness: 0,
          },
        },
      ],
    };
  };

  const list = () => {
    return [
      {
        id: 'road',
        title: intl.get('sdat.supplier.view.btn.road').d('路径'),
      },
      {
        id: 'map',
        title: intl.get('sdat.supplier.view.btn.map').d('图谱'),
      },
    ].filter(Boolean);
  };

  const handleModeChange = (key) => {
    setActiveKey(key);
  };

  /**
   * 查看关系图谱
   * @param {*} record
   */
  const handleView = (record) => {
    if (modal) {
      modal.close();
    }

    const handleCloseModal = () => {
      modal.close();
    };

    modal = Modal.open({
      title: intl.get('sdat.monitorBusiness.view.title.relationDetails').d('关系详情'),
      children: <RiskMapModal record={record} />,
      closable: true,
      drawer: true,
      // mask: false,
      style: { width: '800px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * 渲染路径
   * @param {*} record
   * @returns
   */
  const getRoadPath = (record) => {
    const obj = record?.toData() ?? {};
    const { cuzRelationPath = [] } = obj;

    return cuzRelationPath.map((item) => {
      return (
        <div
          key={item.nodeId}
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span>{item.name}</span>
          {['L', 'R', 'H'].includes(item.line) ? (
            <div
              style={{
                display: 'flex',
                padding:
                  item.line === 'H'
                    ? '0 20px'
                    : item.line === 'L'
                    ? '0 20px 0 5px'
                    : '0 5px 0 20px',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '18px', marginRight: '-7px' }}>
                {item.line === 'L' ? <Icon type="baseline-arrow_left" /> : null}
              </span>
              <div>
                <div style={{ lineHeight: '18px', padding: '0 5px' }}>{item.labelText}</div>
                <div style={{ height: '14px', borderTop: '1px solid #000' }} />
              </div>
              <span style={{ fontSize: '18px', marginLeft: '-7px' }}>
                {item.line === 'R' ? <Icon type="baseline-arrow_right" /> : null}
              </span>
            </div>
          ) : null}
        </div>
      );
    });
  };

  const columns = () => {
    return [
      {
        name: 'serialNumber',
        header: intl.get('sdat.supplier.view.title.serialNumber').d('序号'),
        width: 60,
        renderer: ({ record }) => {
          const { currentPage, pageSize } = qxbListDS;
          return record.index + 1 + (currentPage - 1) * pageSize;
        },
      },
      {
        name: 'relationshipDetails',
        width: 80,
        renderer: ({ record }) => {
          return (
            <a onClick={() => handleView(record)}>
              {intl.get('hzero.common.view.title.view').d('查看')}
            </a>
          );
        },
      },
      {
        name: 'CompanyName',
        width: 150,
      },
      // { name: 'Level', width: 80 },
      { name: 'RelatedCompanyName', width: 150 },
      { name: 'RelatedName', width: 200 },
      {
        name: 'affiliatedRoad',
        width: 1200,
        renderer: ({ record }) => {
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                overflowX: 'hidden',
                // maxWidth: '580px',
              }}
            >
              {getRoadPath(record)}
            </div>
          );
        },
      },
    ];
  };

  /**
   * 启信宝关系挖掘
   */
  const handleQXBMining = async () => {
    if (!selectedList.length || selectedList.length < 2) {
      setAlertMsg(
        intl.get('sdat.supplier.view.title.selectedBigThenTwo').d('请在左侧至少选择两家供应商')
      );
      return;
    }

    const fetchParam = {
      ...param,
      level: levelValue,
      companyList: selectedList,
    };

    const result = await fetchRelationMining({
      ...fetchParam,
    });
    if (result.success) {
      formatResData(result?.data ?? {}, 'default');
      const dataArr = result?.data?.Data ?? [];
      if (dataArr.length) {
        // 有数据
        statusMap.noData = false;
        statusMap.noQuery = false;
        setRefresh(true);
      } else {
        statusMap.noData = true;
        statusMap.noQuery = false;
        setRefresh(true);
      }
    } else {
      notification.error({
        message: result?.message ?? result?.msg ?? '',
      });
      statusMap.noData = true;
      statusMap.noQuery = true;
      resetChart();
      setRefresh(true);
    }
  };

  /**
   * 接口返回数据解析
   * @param {*} result
   * @param {*} type
   */
  const formatResData = (result, type) => {
    const data = result?.Data ?? [];
    const dataArr = Array.isArray(data) ? [...data] : [];
    const seriesData = []; // 去重的企业列表

    if (dataArr.length) {
      dataArr.forEach((item) => {
        const subjectList = item.SubjectList;

        if (subjectList && subjectList.length) {
          subjectList.forEach((item2) => {
            seriesData.push({
              ...item2,
              name: item2.Name,
            });
          });
        }

        if (item.RelationList && item.RelationList.length) {
          item.RelationList.forEach((item2) => {
            let source = '';
            let target = '';

            if (subjectList && subjectList.length) {
              subjectList.forEach((item3) => {
                if (item2.EndNodeId === item3.NodeId) {
                  target = item3.Name;
                }
                if (item2.StartNodeId === item3.NodeId) {
                  source = item3.Name;
                }
              });
            }

            relationsMap.push({
              ...item2,
              source,
              target,
              label: {
                show: true,
                color: '#000',
                verticalAlign: 'middle',
                fontSize: 12,
                formatter: () => {
                  const labelList = (item2?.PropertyList ?? []).map((r) => r.LabelText);
                  return labelList && labelList.length ? labelList.join(',') : '';
                },
              },
            });
          });
        }
      });
    }

    // 去重
    if (type === 'default') {
      qxbListDS.data = dataArr;
      uniqueMiningData = uniqueList(seriesData);
      relationsMiningMap = [...relationsMap];
    } else {
      // 历史记录数据
      hisRoadListDS.data = dataArr;
      uniqueHisMiningData = uniqueList(seriesData);
      relationsHisMiningMap = [...relationsMap];
    }
  };

  /**
   * 对象数组去重
   */
  const uniqueList = (arr) => {
    const result = [];
    const obj = {};
    for (let i = 0; i < arr.length; i++) {
      if (!obj[arr[i].NodeId]) {
        result.push(arr[i]);
        obj[arr[i].NodeId] = true;
      }
    }
    return result;
  };

  /**
   * 导出路径
   */
  const handleExportPath = (hisTag = '') => {
    const pathExportList = [];

    const data = hisTag === 'his' ? hisRoadListDS.toData() : qxbListDS.toData();

    if (activeTab === '1') {
      data.forEach((item) => {
        pathExportList.push(item.Path);
      });
    }

    if (activeTab === '2') {
      if (!['MOBILE', 'ADDRESS', 'EMAIL'].includes(selected?.dataType)) {
        data.forEach((item) => {
          pathExportList.push(item.Path);
        });
      } else {
        data.forEach((item) => {
          pathExportList.push({
            ...item,
            companyName: item.CompanyName,
            relationList: item.RelationList,
            relatedCompanyName: item.RelatedCompanyName,
            relatedName: item.RelatedName,
            relatedType: item.RelatedType,
          });
        });
      }
    }

    if (pathExportList.length) {
      if (activeTab === '2' && ['MOBILE', 'ADDRESS', 'EMAIL'].includes(selected?.dataType)) {
        fetchExportContract({
          contactList: pathExportList,
        });
      } else {
        fetchExportPath({ paths: pathExportList });
      }
    } else {
      notification.warning({
        message: intl.get('sdat.common.view.message.noDataToExport').d('暂无可导出数据'),
      });
    }
  };

  /**
   * 切换选择项
   */
  const handleChangeSelected = (checked, companyName) => {
    const selectArr = [...selectedList];
    if (checked) {
      // 选中状态
      if (selectArr.length < 20) {
        selectArr.push(companyName);
      }
    } else {
      // 取消选中
      const index = selectArr.indexOf(companyName);
      selectArr.splice(index, 1);
    }
    setSelectedList(selectArr);
  };

  /**
   * 移除已选择
   */
  const handleRemove = (item) => {
    const selectArr = [...selectedList];
    if (selectArr.length) {
      const index = selectArr.indexOf(item);
      selectArr.splice(index, 1);
    }
    setSelectedList(selectArr);
  };

  /**
   * 渲染已选择的列表
   */
  const content = useMemo(() => {
    return (selectedList || []).map((item) => {
      return (
        <div
          key={item}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            lineHeight: '32px',
            width: '268px',
          }}
        >
          <span>{item}</span>
          <Tooltip title={intl.get('sdat.supplier.view.tooltip.removeSelect').d('移除已选')}>
            <Icon
              type="close"
              style={{
                fontSize: '14px',
                cursor: 'pointer',
              }}
              onClick={() => handleRemove(item)}
            />
          </Tooltip>
        </div>
      );
    });
  }, [selectedList]);

  /**
   * 输入内容
   * @param {*} e
   */
  const handleInput = (e) => {
    const txt = e?.target?.value?.trim() ?? '';
    setSearchContent(txt);
  };

  const handleClear = () => {
    setSearchContent('');
    setFilterList(companyList);
  };

  const handleQuery = () => {
    let rtnList = [...companyList];
    if (searchContent) {
      // 筛选
      rtnList = companyList.filter((item) => item.companyName.includes(searchContent));
    }
    setFilterList(rtnList);
  };

  const handleChangeTab = (key) => {
    setActiveTab(key);
    if (key === '2') {
      setSyncFlag(new Date().getTime());
    }
    setRefresh(true);
  };

  /**
   * 挖掘历史记录
   * @param {object} item
   */
  const selectHistoryItem = (item) => {
    setSelected({ ...item });
    if (item && item.dataId) {
      setChangeLoading(true);
      fetchMiningHisData({
        dataId: item.dataId,
        ...param,
      }).then((result) => {
        setChangeLoading(false);
        if (getResponse(result)) {
          const relationData = result && result.relationData ? JSON.parse(result.relationData) : {};
          formatResData(relationData, 'hisChart');
          const dataArr = relationData && relationData.Data ? relationData.Data : [];
          hasHisMap = !!dataArr.length;
        } else {
          hasHisMap = false;
        }
        refreshHisChart();
        setRefresh(true);
      });
    }
  };

  /**
   * 穿透层级改变值
   * @param {*} value
   */
  const handleChange = (value) => {
    setLevel(value);
  };

  return (
    <div className={styles['relationship-mining-basic']}>
      <Header title={intl.get('sdat.supplier.view.title.relationShooting').d('关系排查')} />
      <div className={styles['relationship-mining-container']}>
        <Row style={{ height: 'calc(100vh - 66px)', overflow: 'hidden' }}>
          <Col
            span={5}
            style={{
              height: '100%',
              padding: '20px 0',
              borderRight: '1px solid rgba(242,242,242,1)',
            }}
          >
            <Tabs activeKey={activeTab} onChange={handleChangeTab}>
              <TabPane
                tab={intl.get('sdat.supplier.view.title.relationShooting').d('关系排查')}
                key="1"
              >
                <div style={{ padding: '20px' }}>
                  <div
                    className={styles['relationship-mining-company-basic']}
                    id="sdat-relations-mining-company-popover"
                  >
                    <div className={styles['relationship-mining-company-list-panel']}>
                      <div style={{ width: '3px', height: '12px', background: '#00B8CC' }} />
                      <span style={{ marginLeft: '10px' }}>
                        {intl.get('sdat.supplier.view.title.businessList').d('企业列表')}
                      </span>
                    </div>
                    <div>
                      <span style={{ marginRight: '8px' }}>{selectedList?.length ?? 0}/20</span>
                      {selectedList.length ? (
                        <Popover
                          content={content}
                          trigger="click"
                          placement="rightTop"
                          getPopupContainer={() =>
                            document.getElementById('sdat-relations-mining-company-popover')
                          }
                        >
                          <a>{intl.get('sdat.supplier.view.button.viewSelected').d('查看已选')}</a>
                        </Popover>
                      ) : null}
                    </div>
                  </div>

                  <div
                    style={{
                      lineHeight: '40px',
                      background: '#fff',
                      marginBottom: '8px',
                    }}
                  >
                    <TextField
                      clearButton
                      prefix={<Icon type="search" />}
                      style={{ width: '100%' }}
                      value={searchContent}
                      placeholder={intl
                        .get('sdat.supplier.view.placeholder.enterCompanyName')
                        .d('请输入公司名称查询')}
                      onInput={handleInput}
                      onClear={handleClear}
                      onEnterDown={handleQuery}
                    />
                  </div>

                  <div className={styles['relationship-scroll-panel']}>
                    {(filterList || []).map((item) => {
                      return (
                        <div
                          key={item.companyId}
                          className={styles['company-list']}
                          style={{
                            fontSize: '14px',
                            color: '#1D2129',
                            lineHeight: '22px',
                            margin: '12px 0',
                          }}
                        >
                          <CheckBox
                            checked={
                              selectedList &&
                              selectedList.length &&
                              selectedList.includes(item.companyName)
                            }
                            onChange={(e) => handleChangeSelected(e, item.companyName)}
                          >
                            {item.companyName}
                          </CheckBox>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      fontSize: '14px',
                      color: '#1D2129',
                      fontWeight: '500',
                      lineHeight: '22px',
                      marginBottom: '8px',
                      marginTop: '32px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ width: '3px', height: '12px', background: '#00B8CC' }} />
                    <span style={{ marginLeft: '10px' }}>
                      {intl.get('sdat.supplier.view.title.penetrationLevel').d('穿透层级')}
                    </span>
                  </div>
                  <Range
                    range={false}
                    value={levelValue}
                    min={1}
                    max={10}
                    step={1}
                    onChange={handleChange}
                  />

                  <div
                    style={{
                      fontSize: '14px',
                      color: '#1D2129',
                      fontWeight: '500',
                      lineHeight: '22px',
                      marginBottom: '8px',
                      marginTop: '32px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ width: '3px', height: '12px', background: '#00B8CC' }} />
                    <span style={{ marginLeft: '10px' }}>
                      {intl.get('sdat.supplier.view.title.relationType').d('关系类型')}
                    </span>
                  </div>
                  <div>
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ color: '#868D9C', lineHeight: '18px' }}>
                        {intl
                          .get('sdat.supplier.view.title.relationship')
                          .d('任职关系（穿透10层）')}
                      </div>
                      <div style={{ color: '#1D2129', lineHeight: '18px', marginTop: '4px' }}>
                        {intl
                          .get('sdat.supplier.view.title.legalRepresentative')
                          .d('法定代表人、董监高、历史董监高')}
                      </div>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ color: '#868D9C', lineHeight: '18px' }}>
                        {intl
                          .get('sdat.supplier.view.title.investmentRelations')
                          .d('投资关系（穿透10层）')}
                      </div>
                      <div style={{ color: '#1D2129', lineHeight: '18px', marginTop: '4px' }}>
                        {intl.get('sdat.supplier.view.title.hisShareholders').d('股东、历史股东')}
                      </div>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ color: '#868D9C', lineHeight: '18px' }}>
                        {intl.get('sdat.supplier.view.title.contract').d('联系方式')}
                      </div>
                      <div style={{ color: '#1D2129', lineHeight: '18px', marginTop: '4px' }}>
                        {intl
                          .get('sdat.supplier.view.title.samePhone')
                          .d('相同电话、相同邮箱、相同地址')}
                      </div>
                    </div>
                  </div>

                  <div className={styles['relation-mining-btn-span']}>
                    <Button color="primary" style={{ width: '100%' }} onClick={handleQXBMining}>
                      {intl.get('sdat.supplier.view.title.relationShooting').d('关系排查')}
                    </Button>
                    {/* <div style={{ marginTop: '8px', display: 'flex' }}>
                      <Icon type="help" style={{ color: '#C9CDD4' }} />
                      <span style={{ color: '#868D9C' }}>
                        {intl
                          .get('sdat.supplier.view.message.alertMsg')
                          .d('查询一次计算一次额度扣减')}
                      </span>
                    </div> */}
                  </div>
                </div>
              </TabPane>
              <TabPane
                tab={intl.get('sdat.supplier.view.title.historyRecord').d('历史记录')}
                key="2"
              >
                <MiningHistory onSelect={selectHistoryItem} syncFlag={syncFlag} />
              </TabPane>
            </Tabs>
          </Col>
          <Col
            span={19}
            style={{
              backgroundColor: activeKey === 'road' ? '#fff' : '#f7f8fa',
              paddingLeft: activeKey === 'road' ? '16px' : '0',
            }}
          >
            {activeTab === '1' ? (
              <>
                {!statusMap.noData ? ( // 有数据（已经执行查询）
                  <div>
                    <div style={{ backgroundColor: '#fff', padding: '16px 8px 8px 0' }}>
                      <div style={{ display: 'inline-block' }}>
                        {activeKey === 'road' && (
                          <Button
                            icon="unarchive"
                            color="primary"
                            funcType="link"
                            onClick={handleExportPath}
                          >
                            {intl.get('sdat.common.view.button.export').d('导出')}
                          </Button>
                        )}
                      </div>
                      <ToggleBtn
                        style={{ float: 'right' }}
                        toggleList={list()}
                        key="tab1"
                        // defaultValue={defaultSelect}
                        onSelect={handleModeChange}
                      />
                    </div>
                    {activeKey === 'road' ? (
                      <div
                        style={{
                          height: 'calc(100vh - 180px)',
                          overflow: 'hidden',
                          overflowY: 'scroll',
                        }}
                      >
                        <Table
                          dataSet={qxbListDS}
                          queryBar="none"
                          border={false}
                          columns={columns()}
                        />
                      </div>
                    ) : (
                      <div>
                        <div
                          id="supplier-relation-ship-mining"
                          style={{ height: 'calc(100vh - 160px)' }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {statusMap.noQuery ? (
                      <div
                        style={{
                          height: 'calc(100vh - 100px)',
                          display: 'flex',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <img alt="noContent" src={defaultUrl} />
                        <div
                          style={{
                            fontSize: '16px',
                            color: '#1D2129',
                            fontWeight: '500',
                            lineHeight: '24px',
                          }}
                        >
                          {alertMsg}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          height: 'calc(100vh - 100px)',
                          display: 'flex',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <img alt="noneSrc" style={{ width: '160px' }} src={noneSrc} />
                        <div
                          style={{
                            fontSize: '16px',
                            color: '#1D2129',
                            fontWeight: '500',
                            lineHeight: '24px',
                            marginTop: '10px',
                          }}
                        >
                          {intl.get('sdat.supplier.view.title.queryNoData').d('未查询到关联关系')}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {hasHisMap ? ( // 有数据
                  <div>
                    <div style={{ backgroundColor: '#fff', padding: '16px 8px 8px 0' }}>
                      <div style={{ display: 'inline-block' }}>
                        {activeKey === 'road' && (
                          <>
                            <Button
                              icon="unarchive"
                              color="primary"
                              funcType="flat"
                              onClick={() => handleExportPath('his')}
                            >
                              {intl.get('sdat.common.view.button.export').d('导出')}
                            </Button>
                            <Button
                              icon="sync"
                              color="primary"
                              funcType="flat"
                              onClick={handleReMining}
                            >
                              {intl.get('sdat.common.view.button.reInvest').d('重新排查')}
                            </Button>
                          </>
                        )}
                      </div>
                      <ToggleBtn
                        style={{ float: 'right' }}
                        toggleList={list()}
                        key="tab2"
                        // defaultValue={defaultSelect}
                        onSelect={handleModeChange}
                      />
                    </div>
                    {activeKey === 'road' ? (
                      <div
                        style={{
                          height: 'calc(100vh - 180px)',
                          overflow: 'hidden',
                          overflowY: 'scroll',
                        }}
                      >
                        <Spin spinning={loading}>
                          <Table
                            dataSet={hisRoadListDS}
                            queryBar="none"
                            // rowHeight='auto'
                            border={false}
                            columns={columns()}
                          />
                        </Spin>
                      </div>
                    ) : (
                      <div style={{ padding: '16px', backgroundColor: '#fff' }}>
                        <div
                          id="supplier-relation-his-mining"
                          style={{ height: 'calc(100vh - 138px)', backgroundColor: '#f7f8fa' }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      height: 'calc(100vh - 100px)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ textAlign: 'center', height: '40px' }}>
                        <NoContent style={{ width: '40px', height: '40px' }} />
                      </div>
                      <div className={styles['chart-no-content-message']}>
                        {intl.get('hzero.common.message.data.none').d('暂无数据')}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default formatterCollections({
  code: ['sdat.supplier', 'sdat.common', 'sdat.monitorBusiness'],
})(
  withProps(
    () => {
      const hisRoadListDS = new DataSet(RelationMiningDS()); // 挖掘历史路径列表
      const qxbListDS = new DataSet(RelationMiningDS()); // 启信宝关系挖掘列表吧
      return { hisRoadListDS, qxbListDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(RelationshipMining)
);
