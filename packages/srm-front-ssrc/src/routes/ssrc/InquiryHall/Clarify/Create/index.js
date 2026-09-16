/**
 * Create - 澄清函创建
 * @date: 2019-11-13
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import { connect } from 'dva';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { isUndefined, compose } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Button, Form, Spin, Collapse, Modal, Icon } from 'hzero-ui';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import remote from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
// import TinymceEditor from 'components/TinymceEditor';
import RichTextEditor from 'components/RichTextEditor';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
// 通威二开 - 可见供应商逻辑暂时停用，需要还原时取消下面的注释
// import { queryLov, queryLovData } from 'services/api';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { INQUIRY } from '@/utils/globalVariable';
// 通威二开 - 可见供应商逻辑暂时停用，需要还原时改回下面这行
// import { BID, INQUIRY } from '@/utils/globalVariable';
import { isPubPage, getTabKey } from '@/utils/utils';

import { getClarifyHeaderInfo } from '@/services/inquiryHallService';
import { getClarifyUpdateCode } from '../utils/util';
import BaseInfo from './BaseInfo';
import BaseTable from './BaseTable';

const { Panel } = Collapse;

class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['baseInfo', 'clarifyQuestion'], // 打开的折叠面板key
      selectedkeys: [],
      headerInfo: {}, // 简单头查询基本信息
      supplierSelectRows: [], // 可见供应商选中数据
      // 通威二开 - 可见供应商逻辑暂时停用，需要还原时取消下面两行注释
      // defaultVisibleSupplierText: '', // 默认全选时的可见供应商回显文案
      // visibleSupplierDisabled: false, // 从关联问题新建时，可见供应商不允许再改
    };
  }

  form;

  activeTabKey = getTabKey();

  sourceKey = this.props.sourceKey || INQUIRY;

  componentDidMount() {
    const {
      match: { params },
      clarificationQuestionPagination,
    } = this.props;
    // 快码值集
    this.queryLov();
    if (!isUndefined(params.clarifyId)) {
      this.fetchDetail();
    } else if (isUndefined(params.clarifyId)) {
      this.props.dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          clarificationContext: '',
        },
      });
      this.fetchHeaderInfo();
    } else if (!isUndefined(params.selectId)) {
      if (params.selectId !== 'false') {
        this.setState({
          selectedkeys: params.selectId.split(',').map((item) => Number(item)),
        });
      }
    }
    this.handleClarificationQuestion(clarificationQuestionPagination);
    // 通威二开 - 可见供应商逻辑暂时停用，需要还原时取消下面的注释
    // 招标大厅新建澄清函时，可见供应商默认勾选全部；
    // 从「关联问题」新建时改为只选勾选行的供应商，并置为只读
    // if (this.sourceKey === BID && isUndefined(params.clarifyId)) {
    //   this.initVisibleSuppliers();
    // }
  }

  // 通威二开 - 以下可见供应商相关方法暂时停用，需要还原时取消整段注释
  // /**
  //  * 处理值集查询地址
  //  * 替换掉 URL 上的占位符，并去掉自带的查询串（查询条件统一由参数传入）
  //  * 逻辑与 LovMultiple/LovModal 的 getUrl 保持一致
  //  */
  // getLovDataUrl(url, queryParams) {
  //   let result = url;
  //   Object.keys(queryParams || {}).forEach((key) => {
  //     result = result.replace(new RegExp(`{${key}}`, 'g'), queryParams[key]);
  //   });
  //   if (/\{organizationId\}|\{tenantId\}/.test(result)) {
  //     result = result.replace(/\{organizationId\}|\{tenantId\}/g, getCurrentOrganizationId());
  //   }
  //   const queryIndex = result.indexOf('?');
  //   return queryIndex === -1 ? result : result.substr(0, queryIndex);
  // }
  //
  // /**
  //  * 初始化可见供应商
  //  * 取数路径与 LovMultiple 弹窗保持一致：先查值集配置拿 queryUrl，再翻页取全量
  //  * 从「关联问题」新建时（URL 带 visibleSupplierNames），只取勾选行的供应商并置为只读；否则默认全选
  //  */
  // @Bind()
  // async initVisibleSuppliers() {
  //   const {
  //     match: { params },
  //     location: { search },
  //   } = this.props;
  //   const { sourceCategory: type, visibleSupplierNames } = querystring.parse(search.substr(1));
  //   const sourceType = ['RFQ', 'RFA'].includes(type) ? 'RFX' : type;
  //   const queryParams = { sourceId: params.sourceId, sourceType };
  //
  //   try {
  //     const lovInfo = await queryLov({ viewCode: 'SSRC.CLARIFY_VISIBLE_SUPPLIER' });
  //     if (!lovInfo?.queryUrl) {
  //       return;
  //     }
  //     const url = this.getLovDataUrl(lovInfo.queryUrl, queryParams);
  //     const sourceQueryParams = querystring.parse(lovInfo.queryUrl.split('?')[1] || '');
  //
  //     const pageSize = 500;
  //     let page = 0;
  //     let allRows = [];
  //     let total = Infinity;
  //     // 值集可能分页返回，翻页取完，避免漏选供应商
  //     while (allRows.length < total) {
  //       // 需要拿到上一页的总数才能决定是否继续翻页，只能串行请求
  //       // eslint-disable-next-line no-await-in-loop
  //       const res = await queryLovData(url, {
  //         ...sourceQueryParams,
  //         ...queryParams,
  //         page,
  //         size: pageSize,
  //       });
  //       const content = (Array.isArray(res) ? res : res?.content) || [];
  //       if (!content.length) {
  //         break;
  //       }
  //       allRows = allRows.concat(content);
  //       total = Number(res?.totalElements ?? allRows.length);
  //       page += 1;
  //     }
  //
  //     if (!allRows.length) {
  //       return;
  //     }
  //
  //     // 从「关联问题」新建时，只保留勾选行所属供应商，并把字段置为只读
  //     const visibleSupplierDisabled = !!visibleSupplierNames;
  //     let targetRows = allRows;
  //     if (visibleSupplierDisabled) {
  //       const supplierNames = String(visibleSupplierNames)
  //         .split(',')
  //         .map((name) => name.trim());
  //       targetRows = allRows.filter((item) =>
  //         supplierNames.includes((item.supplierCompanyName || '').trim())
  //       );
  //     }
  //
  //     if (!targetRows.length) {
  //       return;
  //     }
  //
  //     const supplierRows = targetRows.map((item) => ({
  //       supplierCompanyId: Number(item.supplierCompanyId),
  //       supplierCompanyName: item.supplierCompanyName,
  //     }));
  //
  //     this.setState({
  //       supplierSelectRows: supplierRows,
  //       defaultVisibleSupplierText: supplierRows.map((item) => item.supplierCompanyName).join(','),
  //       visibleSupplierDisabled,
  //     });
  //     this.syncVisibleSupplierToForm(supplierRows);
  //   } catch (e) {
  //     // 取不到供应商时不预置，页面表现与改动前一致
  //   }
  // }
  //
  // /**
  //  * 把可见供应商写进表单
  //  * visibleSuppliers 的 initialValue 只在挂载时求值，且该字段要等 sourceMethod 回来才渲染，
  //  * 所以取到数据后显式写入一次，headerInfo 回来后再补写一次，保证提交时能取到
  //  */
  // @Bind()
  // syncVisibleSupplierToForm(supplierRows = this.state.supplierSelectRows) {
  //   if (!this.form || !supplierRows.length) {
  //     return;
  //   }
  //   this.form.setFieldsValue({
  //     visibleSuppliers: supplierRows.map((item) => item.supplierCompanyId).join(','),
  //   });
  // }

  // 查询头信息
  @Bind()
  fetchHeaderInfo() {
    const { match: { params = {} } = {}, location: { search } = {}, clarifyRemote } = this.props;
    const type = querystring.parse(search)?.sourceCategory;
    getClarifyHeaderInfo({
      sourceHeaderId: params.sourceId,
      sourceFrom: type,
      customizeUnitCode: `SSRC.${this.sourceKey}_HALL.NEW_CLARIFY.PREVIEW`,
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        // 通威二开 - 可见供应商逻辑暂时停用，需要还原时改用下面注释里的写法
        // （回调里补写可见供应商：该字段要等 sourceMethod 回来才渲染，晚于预取数据返回时靠这里兜底）
        this.setState({
          headerInfo: result,
        });
        // this.setState(
        //   {
        //     headerInfo: result,
        //   },
        //   this.syncVisibleSupplierToForm
        // );

        if (clarifyRemote && clarifyRemote.event) {
          clarifyRemote.event.fireEvent('remoteHandleAfterFetchHeaderInfo', {
            that: this,
            result,
          });
        }
      }
    });
  }

  // 卸载阶段清空数据
  componentWillUnmount() {
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        clarificationDetails: {},
        selectedkeys: [],
        clarificationContext: undefined,
        clarificationQuestionList: [],
        clarificationQuestionPagination: {},
      },
    });
  }

  /**
   * 值集查询
   */
  @Bind()
  queryLov() {
    const { dispatch } = this.props;
    const lovCodes = {
      clarifyType: 'SSRC.CLARIFY_TYPE', // 澄清类型
      clarifyStatus: 'SSRC.CLARIFY_STATUS', // 澄清函状态值集
    };
    dispatch({
      type: 'inquiryHall/batchCode',
      payload: { lovCodes },
    });
  }

  /**
   * 查询详情页面信息
   */
  @Bind()
  fetchDetail() {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    dispatch({
      type: 'inquiryHall/fetchClarifyDetail',
      payload: {
        organizationId,
        clarifyId: params.clarifyId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.NEW_CLARIFY.PREVIEW`,
      },
    }).then((res) => {
      if (res && !res.failed) {
        this.handleVisibleSupplierData(res);
      }
    });
  }

  // 处理可见供应商数据
  handleVisibleSupplierData(headerInfo) {
    const { visibleSuppliers, visibleSuppliersMeaning } = headerInfo || {};
    if (!visibleSuppliers) return [];
    const supplierCompanyNames = visibleSuppliersMeaning ? visibleSuppliersMeaning.split(',') : [];
    const dealSupplierData = (visibleSuppliers?.split(',') || []).map((id, index) => {
      return {
        supplierCompanyId: Number(id),
        supplierCompanyName: supplierCompanyNames[index] || '',
      };
    });
    this.setState({
      supplierSelectRows: dealSupplierData,
    });
  }

  // 改变可见供应商选择数据
  @Bind()
  handleChangeVisibleSupplier(selectRows) {
    this.setState({
      supplierSelectRows: selectRows,
    });
  }

  /**
   * 澄清函引用问题
   */
  @Bind()
  handleClarificationQuestion(page = {}) {
    const {
      dispatch,
      match,
      organizationId,
      location: { search },
    } = this.props;
    const { clarifyId, sourceId, selectId } = match.params;
    const type = querystring.parse(search).sourceCategory;
    dispatch({
      type: 'inquiryHall/fetchClarifyReferIssue',
      payload: {
        page,
        organizationId,
        clarifyId,
        sourceId,
        sourceType: type,
        customizeUnitCode: getClarifyUpdateCode(this.sourceKey)?.tableCode,
      },
    }).then((res) => {
      if (res) {
        const list = res.content;
        const questionRows = [];
        const questionRowsAll = [];
        // 根据参数clarifyId判断,不存在则是新建，选中的问题从前一个页面获取，反之根据clarifyId判断
        if (!isUndefined(clarifyId)) {
          for (const key in list) {
            if (list[key].clarifyId && list[key].clarifyId.toString() === clarifyId) {
              questionRows.push(list[key].issueLineId);
              questionRowsAll.push(list[key]);
            }
          }
          this.setState({
            selectedkeys: questionRows,
          });
        } else if (!isUndefined(selectId) && selectId !== 'false') {
          const selectList = selectId.split(',');
          for (let key = 0; key < selectList.length; key++) {
            for (let row = 0; row < list.length; row++) {
              if (list[row].issueLineId === selectList[key]) {
                questionRowsAll.push(list[key]);
              }
            }
          }
          this.setState({
            selectedkeys: selectList,
          });
        }
      }
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 获取子组件参数
   * @param ref = {}
   */
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 保存
   * @return promise
   */
  @Bind()
  fetchSaveBaseInfo() {
    const {
      dispatch,
      clarificationDetails = {},
      organizationId,
      match,
      location: { search },
      // clarificationContext,
    } = this.props;
    const { selectedkeys = [], headerInfo } = this.state;
    const type = querystring.parse(search).sourceCategory;
    this.form.validateFields((err, values) => {
      if (!err) {
        // if (isEmpty(this.richTextEditor.getContent())) {
        //   notification.warning({
        //     message: intl
        //       .get(`ssrc.clarify.model.inquiryHall.clarifyMainContentNotBeNull`)
        //       .d('澄清函正文不能为空'),
        //   });
        // } else {
        // 默认值为-1, 保持原有逻辑，i、p公司可以为空
        let companyId = -1;
        if (headerInfo?.companyId) {
          companyId = headerInfo?.companyId;
        } else if (match?.params?.companyId && match.params.companyId !== 'null') {
          // eslint-disable-next-line prefer-destructuring
          companyId = match.params.companyId;
        }
        dispatch({
          type: 'inquiryHall/fetchClarifySave',
          payload: {
            ...clarificationDetails,
            ...values,
            organizationId,
            sourceId: match.params.sourceId,
            sourceType: ['RFQ', 'RFA'].includes(type) ? 'RFX' : type,
            companyId,
            issueLineIdList: selectedkeys.filter(Boolean),
            context: this.richTextEditor.getContent(),
            customizeUnitCode: Object.values(getClarifyUpdateCode(this.sourceKey))?.join(),
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch({
              type: 'inquiryHall/fetchClarifyDetail',
              payload: {
                organizationId,
                clarifyId: res.clarifyId,
                customizeUnitCode: `SSRC.${this.sourceKey}_HALL.NEW_CLARIFY.PREVIEW`,
              },
            });
          }
        });
        // }
      }
    });
  }

  /**
   *  表格默认勾选列
   */
  onSelectChange = (selectedRowKeys) => {
    this.setState({
      selectedkeys: selectedRowKeys,
    });
  };

  /**
   * 监听富文本编辑
   * @param {object} dataSource - 编辑的数据
   */
  @Bind()
  onRichTextEditorChange(dataSource) {
    const { dispatch } = this.props;
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        clarificationContext: dataSource,
      },
    });
  }

  /**
   * 执行提交
   * @param
   */
  @Bind()
  fetchclarifySubmit() {
    const {
      dispatch,
      clarificationDetails = {},
      organizationId,
      match,
      clarifyRemote,
      location: { search },
      // clarificationContext,
      fetchClarifyRelease,
    } = this.props;
    const { sourceId, companyId } = match.params;
    const { selectedkeys = [], headerInfo } = this.state;
    const type = querystring.parse(search).sourceCategory;
    this.form.validateFields((err, values) => {
      if (!err) {
        // if (isEmpty(this.richTextEditor.getContent())) {
        //   notification.warning({
        //     message: intl
        //       .get(`ssrc.clarify.model.inquiryHall.clarifyMainContentNotBeNull`)
        //       .d('澄清函正文不能为空'),
        //   });
        // } else {
        // 默认值为-1, 保持原有逻辑，i、p公司可以为空
        let temCompanyId = -1;
        if (headerInfo?.companyId) {
          temCompanyId = headerInfo?.companyId;
        } else if (companyId && companyId !== 'null') {
          // eslint-disable-next-line prefer-destructuring
          temCompanyId = companyId;
        }

        const params = {
          ...clarificationDetails,
          ...values,
          organizationId,
          sourceId,
          sourceType: ['RFQ', 'RFA'].includes(type) ? 'RFX' : type,
          companyId: temCompanyId,
          issueLineIdList: selectedkeys.filter(Boolean),
          context: this.richTextEditor.getContent(),
          customizeUnitCode: Object.values(getClarifyUpdateCode(this.sourceKey))?.join(),
        };

        const onOk = (others) => {
          dispatch({
            type: 'inquiryHall/fetchClarifyRelease',
            payload: {
              ...params,
              ...others,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.renderBachPath();
              // this.props.history.push(
              //   `/ssrc/inquiry-hall/inter-question/${sourceId}/${rfxNum}/${rfxTitle}/${companyId}/2`
              // );
            }
          });
        };
        // };

        const doSubmit = (payload) =>
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
            confirmLoading: fetchClarifyRelease,
            onOk: () => onOk(payload),
          });

        if (clarifyRemote && clarifyRemote.event) {
          clarifyRemote.event.fireEvent('doSubmit', {
            doSubmit,
            data: {
              ...params,
            },
          });
        } else {
          doSubmit();
        }
        // }
      }
    });
  }

  /**
   * 澄清函删除
   */
  @Bind()
  fetchClarifyScrapped() {
    const {
      dispatch,
      clarificationDetails = {},
      organizationId,
      // match,
      fetchClarifyScrappedLoading,
    } = this.props;
    // const { sourceId, rfxNum, rfxTitle, companyId } = match.params;
    const onOk = () => {
      dispatch({
        type: 'inquiryHall/fetchClarifyScrapped',
        payload: {
          organizationId,
          ...clarificationDetails,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.renderBachPath();
          // this.props.history.push(
          //   `/ssrc/inquiry-hall/inter-question/${sourceId}/${rfxNum}/${rfxTitle}/${companyId}/2`
          // );
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      confirmLoading: fetchClarifyScrappedLoading,
      onOk,
    });
  }

  @Bind()
  renderBachPath() {
    const { dispatch, match } = this.props;
    const path = match?.path;
    const { sourceId, rfxNum, companyId } = match.params;
    const { current, createFlag, sourceCategory } = querystring.parse(
      this.props.location.search.substr(1)
    );
    const url = `${this.activeTabKey}/inter-question/${sourceId}/${rfxNum}/sourceTitle/${companyId}/2`;
    const search = querystring.stringify({
      createFlag,
      current,
      sourceCategory,
    });
    dispatch(
      routerRedux.push({
        pathname: isPubPage(path, url),
        search,
      })
    );
  }

  @Bind()
  getBackPath() {
    const { match } = this.props;
    const path = match?.path;
    const { sourceId, rfxNum, companyId } = match.params;
    const { current, createFlag, sourceCategory } = querystring.parse(
      this.props.location.search.substr(1)
    );
    const url = isPubPage(
      path,
      `${this.activeTabKey}/inter-question/${sourceId}/${rfxNum}/sourceTitle/${companyId}/2`
    );
    const search = querystring.stringify({
      createFlag,
      current,
      sourceCategory,
    });
    return `${url}?${search}`;
  }

  tableCheckboxProps = (record) => {
    const { clarifyRemote, clarificationDetails } = this.props;
    const { headerInfo = {} } = this.state;
    const { sourceCategory } = querystring.parse(this.props.location.search.substr(1));
    const checkboxCommonProps = {};

    const checkboxProps = clarifyRemote
      ? clarifyRemote.process(
          'SSRC_INQUIRY_HALL_NEW_CLARIFY_PROCESS_TABLE_ROW_CHECK_BOX_PROPS',
          checkboxCommonProps,
          {
            record,
            sourceCategory,
            headerInfo,
            clarificationDetails,
          }
        )
      : checkboxCommonProps;

    return checkboxProps;
  };

  render() {
    const {
      clarificationDetails,
      organizationId,
      clarificationQuestionLoading,
      clarificationQuestionList,
      clarificationQuestionPagination,
      match,
      fetchClarifySaveLoading,
      fetchClarifyReleaseLoading,
      fetchClarifyScrappedLoading,
      customizeForm,
      customizeTable,
      clarificationContext,
      inquiryHall: {
        code: { clarifyType = [], clarifyStatus = [] },
      },
      clarifyRemote,
    } = this.props;
    const { sourceCategory } = querystring.parse(this.props.location.search.substr(1));
    const { rfxNum, sourceId } = match.params;
    const {
      collapseKeys,
      selectedkeys,
      headerInfo,
      supplierSelectRows,
      // 通威二开 - 可见供应商逻辑暂时停用，需要还原时取消下面两行注释
      // defaultVisibleSupplierText,
      // visibleSupplierDisabled,
    } = this.state;
    const { context = '' } = clarificationDetails;
    const staticTextProps = {
      docType: 0,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-bid-header',
      privateBucket: true,
      content: context,
      onEditorChange: this.onRichTextEditorChange,
      fileSize: FIlESIZE,
      ...(ChunkUploadProps || {}),
    };
    // const { getFieldDecorator } = this.props.form;
    const rowSelection = {
      selectedRowKeys: selectedkeys,
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => this.tableCheckboxProps(record),
    };
    const baseTableProps = {
      match,
      organizationId,
      clarificationQuestionLoading,
      clarificationQuestionList,
      clarifyType,
      clarificationQuestionPagination,
      onChange: this.handleClarificationQuestion,
      rowSelection,
      sourceCategory,
      customizeTable,
      sourceKey: this.sourceKey,
      clarifyRemote,
      headerInfo,
    };
    return (
      <React.Fragment>
        <Header
          backPath={this.getBackPath()}
          title={intl.get(`ssrc.inquiryHall.view.message.title.clarifyCreate`).d('澄清函预览')}
        >
          <Button
            icon="check"
            type="primary"
            loading={
              fetchClarifyReleaseLoading || fetchClarifySaveLoading || fetchClarifyScrappedLoading
            }
            onClick={this.fetchclarifySubmit}
          >
            {intl.get(`ssrc.clarify.common.button.submit`).d('发布')}
          </Button>
          <Button
            icon="save"
            onClick={this.fetchSaveBaseInfo}
            loading={
              fetchClarifySaveLoading || fetchClarifyReleaseLoading || fetchClarifyScrappedLoading
            }
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {/* 新建、审批拒绝、撤销审批 - 可以进入编辑页面 */}
          {['NEW', 'REJECTED', 'REVOKED'].includes(clarifyStatus) ? (
            <Button
              icon="delete"
              disabled={!clarificationDetails.clarifyId}
              onClick={this.fetchClarifyScrapped}
              loading={
                fetchClarifySaveLoading || fetchClarifyReleaseLoading || fetchClarifyScrappedLoading
              }
            >
              {intl.get(`ssrc.clarify.common.button.scrapped`).d('删除')}
            </Button>
          ) : null}
        </Header>
        <Content>
          <Spin spinning={false} wrapperClassName={classnames('ued-detail-wrapper')}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={(arr) => this.onCollapseChange(arr, 'baseInfo')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`ssrc.clarify.common.view.baseInfo`).d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('baseInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="baseInfo"
              >
                <BaseInfo
                  clarificationDetails={clarificationDetails}
                  matchDate={match.params}
                  onRef={this.handleRef}
                  customizeForm={customizeForm}
                  organizationId={organizationId}
                  clarifyStatus={clarifyStatus}
                  sourceNum={rfxNum}
                  sourceKey={this.sourceKey}
                  headerInfo={headerInfo}
                  sourceId={sourceId}
                  sourceCategory={sourceCategory}
                  supplierSelectRows={supplierSelectRows}
                  // 通威二开 - 可见供应商逻辑暂时停用，需要还原时取消下面两行注释
                  // defaultVisibleSupplierText={defaultVisibleSupplierText}
                  // visibleSupplierDisabled={visibleSupplierDisabled}
                  handleChangeVisibleSupplier={this.handleChangeVisibleSupplier}
                />
              </Panel>
              <Panel
                forceRender
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`ssrc.clarify.view.message.title.detail.clarifyContent`)
                        .d('澄清函正文')}
                    </h3>
                    <a>
                      {collapseKeys.includes('clarifyContent')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('clarifyContent') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="clarifyContent"
              >
                <Form>
                  <Form.Item>
                    {/* {getFieldDecorator('context', {
                      initialValue: clarificationContext,
                    })(
                      <RichTextEditor
                        {...staticTextProps}
                        ref={node => {
                          this.richTextEditor = node;
                        }}
                      />
                    )} */}
                    {clarificationContext !== undefined && (
                      <RichTextEditor
                        {...staticTextProps}
                        ref={(node) => {
                          this.richTextEditor = node;
                        }}
                      />
                    )}
                  </Form.Item>
                </Form>
              </Panel>
              <Panel
                showArrow={false}
                key="clarifyQuestion"
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`ssrc.clarify.view.message.title.lineQuestion`).d('关联问题')}
                    </h3>
                    <a>
                      {collapseKeys.includes('clarifyQuestion')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('clarifyQuestion') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <BaseTable {...baseTableProps} />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp, type = INQUIRY) => {
  return compose(
    formatterCollections({
      code: ['ssrc.clarify', 'ssrc.common', 'ssrc.inquiryHall'],
    }),
    withCustomize({
      unitCode: Object.values(getClarifyUpdateCode(type)),
      // unitCode: [
      //   `SSRC.${type}_HALL.NEW_CLARIFY.PREVIEW`, // 澄清答疑预览基础信息
      //   `SSRC.${type}_HALL.NEW_CLARIFY.PREVIEW_RELATED_ISSUES_TABLE`, // 澄清答疑预览关联问题表格
      // ],
    }),
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      fetchClarifySaveLoading: loading.effects['inquiryHall/fetchClarifySave'],
      fetchClarifyReleaseLoading: loading.effects['inquiryHall/fetchClarifyRelease'],
      fetchClarifyScrappedLoading: loading.effects['inquiryHall/fetchClarifyScrapped'],
      clarificationQuestionLoading: loading.effects['inquiryHall/fetchClarifyReferIssue'],
      clarificationDetailsLoading: loading.effects['inquiryHall/fetchClarifyDetail'],
      clarificationDetails: inquiryHall.clarificationDetails,
      clarificationQuestionList: inquiryHall.clarificationQuestionList,
      clarificationQuestionPagination: inquiryHall.clarificationQuestionPagination,
      organizationId: getCurrentOrganizationId(),
      clarificationContext: inquiryHall.clarificationContext,
      sourceKey: type,
    })),
    Form.create({ fieldNameProp: null }),
    remote(
      {
        code: 'SSRC_INQUIRY_HALL_NEW_CLARIFY',
        name: 'clarifyRemote',
      },
      {
        events: {
          // 发布提交
          doSubmit(props) {
            const { doSubmit } = props || {};
            doSubmit();
          },
          remoteHandleAfterFetchHeaderInfo() {},
        },
      }
    )
  )(Comp);
};

export default HOCComponent(Create);

export { HOCComponent, Create };
