/* eslint-disable no-template-curly-in-string */
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import intl from 'utils/intl';

import { Form, TextField, Select, IntlField } from 'choerodon-ui/pro';
import classnames from 'classnames';
import HighlightRichTextEditor from './HighlightRichTextEditor';
import styles from './RuleForm.less';

const HighlightRuleForm = forwardRef(({ dataSet, processVariables = [] }, ref) => {
  const [inputMsg, setInputMsg] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterContent, setFilterContent] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textAreaRef = useRef(null);
  const [inputMsg2, setInputMsg2] = useState('');
  const [showSuggestions2, setShowSuggestions2] = useState(false);
  const [filterContent2, setFilterContent2] = useState('');
  const [cursorPosition2, setCursorPosition2] = useState(0);
  const [selectedIndex2, setSelectedIndex2] = useState(0);
  const textAreaRef2 = useRef(null);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    // 获取规则详情的处理后内容（将高亮变量替换为 fieldCode）
    getRuleDetailWithFieldCodes: () => {
      return textAreaRef.current?.getTextWithFieldCodes?.() || inputMsg;
    },
    // 获取规则范围的处理后内容（将高亮变量替换为 fieldCode）
    getRuleScopeWithFieldCodes: () => {
      return textAreaRef2.current?.getTextWithFieldCodes?.() || inputMsg2;
    },
    // 获取原始内容
    getRuleDetailPlainText: () => {
      return textAreaRef.current?.getPlainText?.() || inputMsg;
    },
    getRuleScopePlainText: () => {
      return textAreaRef2.current?.getPlainText?.() || inputMsg2;
    },
  }));

  useEffect(() => {
    if (dataSet && dataSet.current) {
      // 使用原始数据而不是转换后的数据，这样可以保留 fieldCode 信息
      const ruleDetail = dataSet?.current?.get('ruleDetail') ?? '';
      const ruleScope = dataSet?.current?.get('ruleScope') ?? '';

      setInputMsg(ruleDetail);
      setInputMsg2(ruleScope);

      // 解析现有的高亮内容并设置编辑器的值
      if (textAreaRef.current && ruleDetail) {
        // 直接解析并高亮现有的 fieldCode，不先设置 value
        parseAndHighlightExistingContent(textAreaRef.current, ruleDetail, processVariables);
      }

      if (textAreaRef2.current && ruleScope) {
        // 直接解析并高亮现有的 fieldCode，不先设置 value
        parseAndHighlightExistingContent(textAreaRef2.current, ruleScope, processVariables);
      }
    }
  }, [dataSet, processVariables]);

  // 解析现有内容中的 fieldCode 并添加高亮
  const parseAndHighlightExistingContent = (editor, content, variables) => {
    if (!editor || !content || !variables || variables.length === 0) {
      return;
    }

    // 创建 fieldCode 和 label 的映射
    const codeToVariableMap = {};
    variables.forEach((v) => {
      if (v.fieldCode) {
        codeToVariableMap[v.fieldCode] = v;
      }
      if (v.label && v.label !== v.fieldCode) {
        codeToVariableMap[v.label] = v;
      }
    });

    // 查找所有匹配的 fieldCode 或 label
    const matches = [];
    Object.keys(codeToVariableMap).forEach((code) => {
      const regex = new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      let match;
      while ((match = regex.exec(content)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          value: match[0],
          variable: codeToVariableMap[code],
        });
      }
    });

    if (matches.length === 0) {
      return;
    }

    // 按位置倒序排列，从后往前替换避免位置偏移
    matches.sort((a, b) => b.start - a.start);

    // 构建新的内容，将 fieldCode 替换为 fieldName
    let newContent = content;
    const oldContent = content;
    const highlightData = [];

    matches.forEach((match) => {
      const fieldName = match.variable.fieldName || match.value;
      const before = newContent.substring(0, match.start);
      const after = newContent.substring(match.end);

      // 计算替换后的位置
      const lengthDiff = fieldName.length - match.value.length;

      // 替换内容
      newContent = before + fieldName + after;

      // 记录高亮数据（需要调整后续位置）
      for (let i = 0; i < highlightData.length; i++) {
        if (highlightData[i].start >= match.start) {
          highlightData[i] = {
            ...highlightData[i],
            start: highlightData[i].start + lengthDiff,
          };
        }
      }

      highlightData.unshift({
        start: match.start,
        fieldName,
        fieldCode: match.value,
      });
    });

    // 设置替换后的内容
    if (editor.setValueWithCursor) {
      editor.setValueWithCursor(newContent, 0);
    }

    // 设置高亮范围
    setTimeout(() => {
      if (editor.setHighlightRanges) {
        // 构建高亮范围数组
        const highlightRanges = [];
        let searchPos = 0;

        highlightData.forEach((item) => {
          // 在原始内容中查找 fieldCode 的位置
          const fieldCodeIndex = oldContent.indexOf(item.fieldCode, searchPos);

          if (fieldCodeIndex !== -1) {
            // 计算在新内容中对应的位置
            // 由于替换可能改变长度，需要重新计算位置
            let newContentIndex = fieldCodeIndex;

            // 调整位置：考虑之前替换造成的长度差异
            for (let i = 0; i < highlightData.length; i++) {
              const prevItem = highlightData[i];
              if (prevItem === item) break;

              const prevFieldCodeIndex = oldContent.indexOf(prevItem.fieldCode);
              if (prevFieldCodeIndex !== -1 && prevFieldCodeIndex < fieldCodeIndex) {
                const lengthDiff = prevItem.fieldName.length - prevItem.fieldCode.length;
                newContentIndex += lengthDiff;
              }
            }

            highlightRanges.push({
              start: newContentIndex,
              end: newContentIndex + item.fieldName.length,
              fieldCode: item.fieldCode,
              value: item.fieldName,
            });

            searchPos = fieldCodeIndex + item.fieldCode.length;
          }
        });

        // 使用新的方法设置高亮范围
        editor.setHighlightRanges(highlightRanges);
      }
    }, 50);
  };

  // 根据输入内容过滤变量列表
  const filteredVariables = processVariables.length
    ? processVariables.filter((item) =>
        item.label.toLowerCase().includes(filterContent.toLowerCase())
      )
    : [];

  // 根据输入内容过滤变量列表
  const filteredVariables2 = processVariables.length
    ? processVariables.filter((item) =>
        item.label.toLowerCase().includes(filterContent2.toLowerCase())
      )
    : [];

  const handleInput = (e) => {
    const value = e?.target?.value || '';
    const cursorPos = e?.target?.selectionStart || 0;

    setInputMsg(value);
    setCursorPosition(cursorPos);

    if (dataSet && dataSet.current) {
      dataSet.current.set('ruleDetailStr', value);
    }

    // 检查是否输入了斜杠
    checkSlashInput(value, cursorPos);
  };

  const handleInput2 = (e) => {
    const value = e?.target?.value || '';
    const cursorPos = e?.target?.selectionStart || 0;

    setInputMsg2(value);
    setCursorPosition2(cursorPos);

    if (dataSet && dataSet.current) {
      dataSet.current.set('ruleScopeStr', value);
    }

    // 检查是否输入了斜杠
    checkSlashInput2(value, cursorPos);
  };

  const checkSlashInput = (value, cursorPos) => {
    // 获取光标前的文本
    const textBeforeCursor = value.substring(0, cursorPos);
    // 查找最后一个斜杠的位置
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex !== -1) {
      // 获取斜杠后的内容作为过滤条件
      const searchText = textBeforeCursor.substring(lastSlashIndex + 1);

      // 检查斜杠后是否有空格（但允许换行符），如果有空格则不显示提示
      if (!searchText.includes(' ') && searchText.length <= 20) {
        setFilterContent(searchText);
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const checkSlashInput2 = (value, cursorPos) => {
    // 获取光标前的文本
    const textBeforeCursor = value.substring(0, cursorPos);
    // 查找最后一个斜杠的位置
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex !== -1) {
      // 获取斜杠后的内容作为过滤条件
      const searchText = textBeforeCursor.substring(lastSlashIndex + 1);

      // 检查斜杠后是否有空格（但允许换行符），如果有空格则不显示提示
      if (!searchText.includes(' ') && searchText.length <= 20) {
        setFilterContent2(searchText);
        setShowSuggestions2(true);
        setSelectedIndex2(0);
      } else {
        setShowSuggestions2(false);
      }
    } else {
      setShowSuggestions2(false);
    }
  };

  const handleKeyDown = (e) => {
    if (showSuggestions && filteredVariables.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredVariables.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredVariables.length - 1));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (selectedIndex >= 0 && selectedIndex < filteredVariables.length) {
          e.preventDefault();
          selectVariable(filteredVariables[selectedIndex]);
        } else if (e.key === 'Enter') {
          // 如果没有选中的建议项，让Enter键正常换行
          setShowSuggestions(false);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  const handleKeyDown2 = (e) => {
    if (showSuggestions2 && filteredVariables2.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex2((prev) => (prev < filteredVariables2.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex2((prev) => (prev > 0 ? prev - 1 : filteredVariables2.length - 1));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (selectedIndex2 >= 0 && selectedIndex2 < filteredVariables2.length) {
          e.preventDefault();
          selectVariable2(filteredVariables2[selectedIndex2]);
        } else if (e.key === 'Enter') {
          // 如果没有选中的建议项，让Enter键正常换行
          setShowSuggestions2(false);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions2(false);
      }
    }
  };

  const selectVariable = (variable) => {
    // 获取当前文本域的值，从HighlightRichTextEditor获取实际的纯文本内容
    const currentValue = textAreaRef.current?.getPlainText?.() || inputMsg || '';

    const textBeforeCursor = currentValue.substring(0, cursorPosition);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex !== -1) {
      const beforeSlash = currentValue.substring(0, lastSlashIndex);
      const afterCursor = currentValue.substring(cursorPosition);

      // 直接插入变量值，不添加 ${} 格式
      const newValue = beforeSlash + variable.value + afterCursor;

      // 更新值
      setInputMsg(newValue);

      if (dataSet && dataSet.current) {
        dataSet.current.set('ruleDetailStr', newValue);
      }

      // 计算新的光标位置（插入内容的最后）
      const newCursorPos = beforeSlash.length + variable.value.length;
      setCursorPosition(newCursorPos);

      // 使用HighlightRichTextEditor的方法
      if (textAreaRef.current) {
        // 直接插入高亮变量，替换从斜杠到光标位置的内容
        const newCursorPosition = textAreaRef.current.insertHighlightVariable(
          variable.value,
          lastSlashIndex, // 从斜杠位置开始替换
          variable.label, // 使用 fieldCode 作为第三个参数
          variable.fieldPrefix,
          cursorPosition // 替换到光标位置
        );

        // 设置最终的光标位置
        setTimeout(() => {
          if (textAreaRef.current) {
            textAreaRef.current.focus();
            setCursorPosition(newCursorPosition);
          }
        }, 60);
      }
    }

    setShowSuggestions(false);
    setFilterContent('');
  };

  const selectVariable2 = (variable) => {
    // 获取当前文本域的值，从HighlightRichTextEditor获取实际的纯文本内容
    const currentValue = textAreaRef2.current?.getPlainText?.() || inputMsg2 || '';

    const textBeforeCursor = currentValue.substring(0, cursorPosition2);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex !== -1) {
      const beforeSlash = currentValue.substring(0, lastSlashIndex);
      const afterCursor = currentValue.substring(cursorPosition2);

      // 直接插入变量值，不添加 ${} 格式
      const newValue = beforeSlash + variable.value + afterCursor;

      // 更新值
      setInputMsg2(newValue);

      if (dataSet && dataSet.current) {
        dataSet.current.set('ruleScopeStr', newValue);
      }

      // 计算新的光标位置（插入内容的最后）
      const newCursorPos = beforeSlash.length + variable.value.length;
      setCursorPosition2(newCursorPos);

      // 使用HighlightRichTextEditor的方法
      if (textAreaRef2.current) {
        // 直接插入高亮变量，替换从斜杠到光标位置的内容
        const newCursorPosition = textAreaRef2.current.insertHighlightVariable(
          variable.value,
          lastSlashIndex, // 从斜杠位置开始替换
          variable.label, // 使用 fieldCode 作为第三个参数
          variable.fieldPrefix,
          cursorPosition2 // 替换到光标位置
        );

        // 设置最终的光标位置
        setTimeout(() => {
          if (textAreaRef2.current) {
            textAreaRef2.current.focus();
            setCursorPosition2(newCursorPosition);
          }
        }, 60);
      }
    }

    setShowSuggestions2(false);
    setFilterContent2('');
  };

  const ruleId = dataSet?.current?.get('ruleId') ?? '';

  return (
    <Form dataSet={dataSet} labelLayout="float" columns={2}>
      <TextField name="ruleCode" disabled={ruleId} />
      <IntlField name="ruleName" />
      <Select name="ruleControlStrategy" />
      <Select name="ruleTarget" />

      <div className={styles['rule-form-rule-scope-container']} newLine colSpan={2} key="ruleScope">
        <HighlightRichTextEditor
          key="ruleScope"
          ref={textAreaRef2}
          id="rule-scope-textarea"
          name="ruleScopeStr"
          value={inputMsg2}
          filteredVariables={filteredVariables2}
          onChange={handleInput2}
          placeholder={intl
            .get('smbl.checkRules.view.title.ruleDetailPlaceholder')
            .d('输入/可快速插入流程变量')}
          ruleDetail={intl.get(`smbl.checkRules.model.ruleScope`).d('规则适用范围')}
          onKeyDown={handleKeyDown2}
          onBlur={() => {
            // 延迟隐藏，以便点击选项时能正常工作
            setTimeout(() => setShowSuggestions2(false), 200);
          }}
        />
        {showSuggestions2 && filteredVariables2.length > 0 && (
          <div className={styles['rule-form-suggestions-popup']}>
            {filteredVariables2.map((item, index) => (
              <div
                key={item.label}
                className={classnames(styles['suggestion-item'], {
                  [styles['suggestion-item-selected']]: index === selectedIndex2,
                })}
                onClick={() => selectVariable2(item)}
                onMouseEnter={() => setSelectedIndex2(index)}
              >
                <div className={styles['suggestion-label']}>
                  {`${item.fieldName}(${item.label})`}
                </div>
                <div className={styles['suggestion-desc']}>{item.fieldDesc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles['rule-form-textarea-container']} newLine colSpan={2} key="ruleDetail">
        <HighlightRichTextEditor
          key="ruleDetail"
          ref={textAreaRef}
          id="rule-detail-textarea"
          name="ruleDetailStr"
          value={inputMsg}
          filteredVariables={filteredVariables}
          onChange={handleInput}
          placeholder={intl
            .get('smbl.checkRules.view.title.ruleDetailPlaceholder')
            .d('输入/可快速插入流程变量')}
          ruleDetail={intl.get('smbl.checkRules.view.title.ruleDetail').d('规则详情')}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // 延迟隐藏，以便点击选项时能正常工作
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          style={{ height: '160px' }}
        />
        {showSuggestions && filteredVariables.length > 0 && (
          <div className={styles['rule-form-suggestions-popup']}>
            {filteredVariables.map((item, index) => (
              <div
                key={item.label}
                className={classnames(styles['suggestion-item'], {
                  [styles['suggestion-item-selected']]: index === selectedIndex,
                })}
                onClick={() => selectVariable(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={styles['suggestion-label']}>
                  <div>{`${item.fieldName}(${item.label})`}</div>
                  <div className={styles['suggestion-desc']}>{item.fieldDesc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Form>
  );
});

HighlightRuleForm.displayName = 'HighlightRuleForm';

export default HighlightRuleForm;
