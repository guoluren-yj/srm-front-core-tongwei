/* eslint-disable no-param-reassign */
import React, { useEffect, useMemo, useRef } from 'react';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import { Table, Button, Modal, DataSet } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { fetchEnabled, fetchDisabled, fetFieldsList } from '@/services/checkRuleService';

import { RuleFormDS } from '../stores/checkRuleDS';
// import RuleForm from './RuleForm';
import HighlightRuleForm from './HighlightRuleForm';

import styles from './index.less';

const { Column } = Table;

let alertFieldsList = [];

export default function RuleTableComp({ rulesListDS, categoryId, documentId }) {
  const ruleFormDS = useMemo(() => new DataSet({ ...RuleFormDS(), forceValidate: true }), []);
  const highlightRuleFormRef = useRef(null); // 添加 ref 用于访问 HighlightRuleForm 的方法

  // const [alertFieldsList, setAlertFieldsList] = useState([]);

  useEffect(() => {
    rulesListDS.addEventListener('load', loadEvent);
    return () => {
      alertFieldsList = [];
      rulesListDS.removeEventListener('load', loadEvent);
    };
  }, []);

  useEffect(() => {
    if (documentId) {
      handleInitFialds(documentId);
    }
  }, [documentId]);

  /**
   * 去除文本中的 fieldPrefix 部分
   * @param {string} text - 原始文本
   * @param {Array} fieldsList - 字段列表
   * @returns {string} 处理后的文本
   */
  const removeFieldPrefix = (text, fieldsList) => {
    if (!text || !fieldsList || fieldsList.length === 0) {
      return text;
    }

    let result = text;

    // 遍历字段列表，将包含 fieldPrefix 的字段编码替换为纯字段编码
    fieldsList.forEach((field) => {
      const { fieldCode, fieldPrefix } = field;

      if (fieldCode && fieldPrefix) {
        // 构建完整的字段编码格式：fieldPrefix_fieldCode
        const fullFieldCode = `${fieldPrefix}_${fieldCode}`;

        // 使用全局替换，将完整字段编码替换为纯字段编码
        const regex = new RegExp(fullFieldCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        result = result.replace(regex, fieldCode);
      }
    });
    return result;
  };

  const loadEvent = ({ dataSet }) => {
    const list = dataSet?.toData();
    formatQueryList(list, alertFieldsList);
  };

  const formatQueryList = (list, alertFields) => {
    if (list && list.length && alertFields && alertFields.length) {
      // 处理规则数据，去除 ruleScope 和 ruleDetail 中的 fieldPrefix
      rulesListDS.forEach((record, index) => {
        const item = list[index];
        if (item) {
          // 处理 ruleScope
          if (item.ruleScope) {
            const processedRuleScope = removeFieldPrefix(item.ruleScope, alertFields);
            record.set('ruleScope', processedRuleScope);
          }

          // 处理 ruleDetail
          if (item.ruleDetail) {
            const processedRuleDetail = removeFieldPrefix(item.ruleDetail, alertFields);
            record.set('ruleDetail', processedRuleDetail);
          }
        }

        record.status = 'sync';
      });
    }
  };

  const handleInitFialds = async (docId) => {
    const res = await fetFieldsList({
      documentId: docId,
    });

    if (getResponse(res)) {
      const fields = res?.content ?? [];

      const formatFields = fields.map((item) => ({
        ...item,
        label: item?.fieldCode,
        value: item?.fieldName,
      }));
      // setAlertFieldsList(formatFields);
      alertFieldsList = [...formatFields];
      if (rulesListDS?.length) {
        const list = rulesListDS?.toData();
        formatQueryList(list, formatFields);
      }
    }
  };

  /**
   * 获取处理后的规则内容（将高亮变量替换为 fieldCode）
   * @returns {Object} 包含规则详情和规则范围的处理后内容
   */
  const getProcessedRuleContent = () => {
    if (!highlightRuleFormRef.current) {
      return {
        ruleDetail: '',
        ruleScope: '',
      };
    }

    return {
      ruleDetail: highlightRuleFormRef.current.getRuleDetailWithFieldCodes(),
      ruleScope: highlightRuleFormRef.current.getRuleScopeWithFieldCodes(),
    };
  };

  /**
   * 根据文本的字段编码，替换为字段名称
   * @param {*} text 文本
   * @returns
   */
  const getNameDetailByCode = (text) => {
    if (!text || !alertFieldsList || alertFieldsList.length === 0) {
      return text;
    }

    let result = text;

    // 遍历字段列表，将字段编码替换为字段名称
    alertFieldsList.forEach((field) => {
      const { fieldName, fieldCode } = field;
      if (fieldName && fieldCode) {
        // 使用全局替换，将所有匹配的字段编码替换为字段名称
        const regex = new RegExp(fieldCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        result = result.replace(regex, fieldName);
      }
    });

    return result;
  };

  const handleCreateRule = (item) => {
    let modal = null;

    if (item) {
      const obj = item?.toData() ?? {};
      // 编辑规则时，需要将字段编码替换为字段名称
      const ruleDetailStr = getNameDetailByCode(obj?.ruleDetail);
      const ruleScopeStr = getNameDetailByCode(obj?.ruleScope);
      ruleFormDS.loadData([{ ...obj, ruleDetailStr, ruleScopeStr }]);
    } else {
      ruleFormDS.loadData([]);
      ruleFormDS.create(
        {
          tenantId: getCurrentOrganizationId(),
          categoryId,
        },
        0
      );
    }

    const handleCloseModal = () => {
      if (modal) {
        ruleFormDS.loadData([]);
        ruleFormDS.reset();
        modal.close();
      }
    };

    const handleCreate = async () => {
      const isValid = await ruleFormDS.validate();

      const recrdStatus = ruleFormDS?.current?.status ?? '';
      if (recrdStatus === 'sync') {
        handleCloseModal();
      }
      if (isValid) {
        const categoryIdStr = ruleFormDS?.current?.get('categoryId') ?? '';
        if (!categoryIdStr) {
          return;
        }

        const { ruleDetail, ruleScope } = getProcessedRuleContent();

        if (!ruleScope) {
          notification.error({
            message: intl
              .get('smbl.checkRules.view.title.ruleScopeNotNull')
              .d('规则适用范围不能为空'),
          });
          return;
        }
        if (ruleFormDS?.current) {
          ruleFormDS.current.set('ruleDetail', ruleDetail);
          ruleFormDS.current.set('ruleScope', ruleScope);
        }

        const res = await ruleFormDS.submit();
        if (getResponse(res)) {
          handleCloseModal();
          rulesListDS.query();
        }
      }
    };

    modal = Modal.open({
      title: item
        ? intl.get('smbl.checkRules.view.title.editRule').d('编辑规则')
        : intl.get('smbl.checkRules.view.title.createRule').d('新建规则'),
      children: (
        <HighlightRuleForm
          ref={highlightRuleFormRef}
          dataSet={ruleFormDS}
          processVariables={alertFieldsList}
        />
      ),
      closable: true,
      drawer: true,
      mask: true,
      fullScreen: true,
      style: { width: '800px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCreate}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const buttons = () => {
    return [
      <Button key="add" icon="playlist_add" funcType="flat" onClick={() => handleCreateRule('')}>
        {intl.get('hzero.common.button.create').d('新增')}
      </Button>,
    ];
  };

  const handlleEnabled = (record, flag) => {
    const obj = record?.toData() ?? {};
    if (!obj.ruleId) return;
    if (flag === '1') {
      // 启用
      fetchEnabled(obj).then((res) => {
        if (getResponse(res)) {
          rulesListDS.query();
        }
      });
    } else {
      fetchDisabled(obj).then((res) => {
        if (getResponse(res)) {
          rulesListDS.query();
        }
      });
    }
  };

  const renderText = (text) => {
    if (!text) {
      return '-';
    }

    // 创建高亮处理函数，只高亮匹配到的 fieldCode 或 label
    const createHighlightedText = (content, variables) => {
      if (!content || !variables || variables.length === 0) {
        return content;
      }

      // 转义HTML特殊字符并去除换行符
      let highlightedText = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, ' ') // 将换行符替换为空格
        .replace(/\r/g, ' ') // 将回车符替换为空格
        .replace(/\s+/g, ' ') // 将多个连续空格替换为单个空格
        .trim(); // 去除首尾空格

      // 创建 fieldCode 到 fieldName 的映射
      const fieldCodeToNameMap = {};
      variables.forEach((v) => {
        if (v.fieldCode && v.fieldName) {
          fieldCodeToNameMap[v.fieldCode] = v.fieldName;
        }
        if (v.label && v.fieldName) {
          fieldCodeToNameMap[v.label] = v.fieldName;
        }
      });

      // 创建变量正则表达式，同时匹配 fieldCode 和 label
      const variablePatterns = variables
        .map((v) => {
          const fieldCodeEscaped = v.fieldCode
            ? v.fieldCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            : '';
          const labelEscaped = v.label ? v.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';

          // 返回 fieldCode 和 label 的组合模式
          const patterns = [];
          if (fieldCodeEscaped) patterns.push(fieldCodeEscaped);
          if (labelEscaped && labelEscaped !== fieldCodeEscaped) {
            patterns.push(labelEscaped);
          }

          return patterns.join('|');
        })
        .filter((pattern) => pattern); // 过滤掉空的模式

      if (variablePatterns.length > 0) {
        const pattern = `(${variablePatterns.join('|')})`;
        const variableRegex = new RegExp(pattern, 'g');

        // 应用高亮样式，将匹配到的 fieldCode 替换为 fieldName
        highlightedText = highlightedText.replace(variableRegex, (match) => {
          const fieldName = fieldCodeToNameMap[match] || match;
          return `<span style="color: #1890ff; font-weight: 600;">${fieldName}</span>`;
        });
      }

      return highlightedText;
    };

    const highlightedContent = createHighlightedText(text, alertFieldsList);

    return (
      <>
        <div
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px',
            height: '28px',
          }}
        />
      </>
    );
  };

  return (
    <>
      <FilterBar
        dataSet={[rulesListDS]}
        cacheState
        cacheKey="SMBL.CHECK_RULES_LIST_CACHE"
        checkDataSetStatus={false}
        fields={[
          {
            name: 'ruleName',
            type: 'string',
            label: intl.get(`smbl.checkRules.model.ruleName`).d('规则名称'),
            merge: true,
            display: false,
          },
        ]}
      />
      <div className={styles['rule-table-container']} style={{ height: 'calc(100vh - 400px)' }}>
        <Table
          dataSet={rulesListDS}
          queryBar="none"
          border={false}
          autoHeight={{ type: 'maxHeight', diff: 40 }}
          buttons={buttons()}
          // rowHeight="auto"
        >
          <Column
            name="enableFlag"
            renderer={({ record }) =>
              record.get('enableFlag') === '1' ? (
                <span className={styles['enable-flag']} style={{ color: 'green' }}>
                  启用
                </span>
              ) : (
                <span className={styles['disable-flag']} style={{ color: 'red' }}>
                  禁用
                </span>
              )
            }
          />
          <Column name="ruleCode" />
          <Column name="ruleName" width={200} />
          <Column name="ruleControlStrategy" width={200} />
          <Column name="ruleTarget" width={200} />
          <Column
            name="ruleScope"
            width={200}
            tooltip="overflow"
            renderer={({ text }) => renderText(text)}
          />
          <Column
            name="ruleDetail"
            width={200}
            tooltip="overflow"
            renderer={({ text }) => renderText(text)}
          />
          <Column
            name="operation"
            header={intl.get('hzero.common.title.operator').d('操作')}
            renderer={({ record }) => {
              const enableFlag = record?.get('enableFlag') ?? '';
              return (
                <>
                  <a style={{ marginRight: '8px' }} onClick={() => handleCreateRule(record)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                  {enableFlag === '0' ? (
                    <a onClick={() => handlleEnabled(record, '1')}>
                      {intl.get('hzero.common.button.enable').d('启用')}
                    </a>
                  ) : (
                    <a onClick={() => handlleEnabled(record, '0')}>
                      {intl.get('hzero.common.button.disable').d('禁用')}
                    </a>
                  )}
                </>
              );
            }}
          />
        </Table>
      </div>
    </>
  );
}
