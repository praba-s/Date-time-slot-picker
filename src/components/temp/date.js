import React, { Component } from 'react'
import { formatDate } from '../../utils'
import PropTypes from 'prop-types'
import moment from 'moment'

export class PanelDate extends Component {
  constructor (props) {
      super(props)
      this.state = {
          days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      }
  }

  selectDate ({ year, month, day }) {

    const date = moment(year +'-' + month + '-' + day, 'YYYY-M-D')
      if (this.props.disabledDate(date)) {
          return
      }
      this.props.select(date)
  }

  getDays (firstDayOfWeek) {
    const days = this.state.days
    const firstday = parseInt(firstDayOfWeek, 10)
    return days.concat(days).slice(firstday, firstday + 7)
  }

  getDates (year, month, firstDayOfWeek) {
    const arr = []
    const time = moment(year +'-'+month, "YYYY-M")

    time.date(0)
    const lastMonthLength = (time.day() + 7 - firstDayOfWeek) % 7 + 1
    const lastMonthfirst = time.date() - (lastMonthLength - 1)
    for (let i = 0; i < lastMonthLength; i++) {
      arr.push({ year, month: month - 1, day: lastMonthfirst + i })
    }

    time.month(time.month() + 2).date(0)
    const curMonthLength = time.date()
    for (let i = 0; i < curMonthLength; i++) {
      arr.push({ year, month, day: 1 + i })
    }

    time.month(time.month() + 1).date(1)
    const nextMonthLength = 42 - (lastMonthLength + curMonthLength)
    for (let i = 0; i < nextMonthLength; i++) {
      arr.push({ year, month: month + 1, day: 1 + i })
    }

    return arr
  }

  getCellClasses ({ year, month, day }) {

    const { value, startAt, endAt, disabledDate, calendarMonth  } = this.props;

    const classes = []
    classes.push("cell")
    const cellTime = moment(year +'-' + month+"-" + day, 'YYYY-M-D').valueOf()
    const today = moment(new Date()).hours(0).minutes(0).seconds(0).milliseconds(0)
    const curTime = value && moment(value).hours(0).minutes(0).seconds(0).milliseconds(0)
    const startTime = startAt && moment(startAt).hours(0).minutes(0).seconds(0).milliseconds(0)
    const endTime = endAt && moment(endAt).hours(0).minutes(0).seconds(0).milliseconds(0)

    if (month < calendarMonth) {
      classes.push('last-month')
    } else if (month > calendarMonth) {
      classes.push('next-month')
    } else {
      classes.push('cur-month')
    }

    if (cellTime === today) {
      classes.push('today')
    }

    if (disabledDate(cellTime)) {
      classes.push('disabled')
    }

    if (curTime) {
      if (cellTime === curTime) {
        classes.push('actived')
      } else if (startTime && cellTime <= curTime) {
        classes.push('inrange')
      } else if (endTime && cellTime >= curTime) {
        classes.push('inrange')
      }
    }
    return classes
  }

  getCellTitle ({ year, month, day }) {
    return moment(year +'-' + month + '-' + day, 'YYYY-M-D').format(this.props.dateFormat)
  }

  render () {
      const {firstDayOfWeek, calendarYear, calendarMonth } = this.props;

      const ths = this.getDays(firstDayOfWeek).map(day => {
        return <th key={day}>{day}</th>
      })

    let indexKey = 0;
    const dates = this.getDates(calendarYear, calendarMonth, firstDayOfWeek)
    const tbody = Array.apply(null, { length: 6 }).map((week, i) => {
      const tds = dates.slice(7 * i, 7 * i + 7).map(date => {
        indexKey = indexKey + 1;
        let className =  this.getCellClasses(date).join(' ')
        return (
          <td
            className = {className}
            key={indexKey}
            data-year={date.year}
            data-month={date.month}
            title={this.getCellTitle(date)}
            onClick={() => this.selectDate(date)}>
            {date.day}
          </td>
        )
      })
      return <tr>{tds}</tr>
    })

    return (
      <table className="mx-panel mx-panel-date">
        <thead>
          <tr>{ths}</tr>
        </thead>
        <tbody>
          {tbody}
        </tbody>
      </table>
    )
  }
}

PanelDate.propTypes = {
    value: PropTypes.any,
    startAt: PropTypes.any,
    endAt: PropTypes.any,
    dateFormat: PropTypes.string,

    calendarMonth: PropTypes.number,
    calendarYear: PropTypes.number,
    firstDayOfWeek: function(props, propName, componentName){
        let isValid = val => val >= 1 && val <= 7;
        if(!isValid){
            return new Error(
                'Invalid prop `' + propName + '` supplied to' +
                ' `' + componentName + '`. Validation failed.'
                );
        }
    },
    disabledDate: PropTypes.func,
    select : PropTypes.func
}

PanelDate.defaultProps = {
    dateFormat : 'YYYY-MM-DD',
    calendarMonth : moment(new Date()).month(),
    calendarYear : moment(new Date()).year(),
    firstDayOfWeek: 7,
    disabledDate :  () => {return false}
}
