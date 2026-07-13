import React, { Component } from 'react';
import { DatePicker } from 'hzero-ui';
import intl from 'utils/intl';

const promptCode = 'sodr.demandForecast';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isopen: false,
      time: props.value,
    };
  }

  render() {
    const { isopen, time } = this.state;
    const { onDateChange } = this.props;
    return (
      <div>
        <DatePicker
          value={time}
          open={isopen}
          showTime={false}
          c7nMode="year"
          mode="year"
          format="YYYY"
          allowClear={false}
          onOpenChange={(status) => {
            if (status) {
              this.setState({ isopen: true });
            } else {
              this.setState({ isopen: false });
            }
          }}
          onChange={(v) => {
            this.setState({
              time: v,
              isopen: false,
            });
            onDateChange(v);
          }}
          onPanelChange={(v) => {
            this.setState({
              time: v,
              isopen: false,
            });
            onDateChange(v);
          }}
          placeholder={intl.get(`${promptCode}.view.message.model.selectYear`).d('请选择年份')}
        />
      </div>
    );
  }
}
