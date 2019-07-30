import React, {Component} from 'react'
import { isValidDate, isDateObejct, formatDate } from '../../utils'
import scrollIntoView from '../../utils/scroll-into-view'
import { PanelDate } from './date'
import {isEmpty} from "../../utils/utils";
import moment from 'moment-timezone'

export class CalendarPanel extends Component {
    constructor (props) {
        super(props)
        this.state = {
            panel: 'DATE',
            valueType: 'date',
            dates: [],
            now : '',
            calendarYear: 0,
            calendarMonth: 0,
            firstYear: '',
            months:['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
    }

    static defaultProps = {
        value: moment(),
        format: 'YYYY-MM-DD',
        confirmText: 'OK',
        confirm: true,
        inputName: 'date',
        inputClass: 'mx-input',
        popupStyle: '',
        placeholder: "Please select Date",
        startAt: null,
        endAt: null,
        notBefore: null,
        notAfter: null,
        disabledDays: {
            type: [Array, Function],
            default: function () {
                return []
            }
        },
    }

    componentDidMount() {
        const { value, format } = this.props
        const now = this.getNow(value)
        this.setState((state, prop) => {
            return {
                now : now,
                calendarYear: now.year(),
                calendarMonth: now.month() ,
                firstYear: Math.floor(now.year() / 10) * 10,
            }
        });
    }

    timeType() {
        const h = /h+/.test(this.$parent.format) ? '12' : '24'
        const a = /A/.test(this.$parent.format) ? 'A' : 'a'
        return [h, a]
    }

    timeHeader() {
        return this.props.value && formatDate(this.props.value, this.props.dateFormat)
    }

    notBeforeTime() {
        return this.getCriticalTime(this.props.notBefore)
    }

    notAfterTime() {
        return this.getCriticalTime(this.props.notAfter)
    }


    getNow(value) {
        let val = !isEmpty(value) ? value : moment(new Date())
        console.log('inside getNow  '+val)
        return val;
    }

    updateNow(value) {
        const oldNow = this.state.now
        this.setState({now: this.getNow(value)})
        this.updateCalendar(value);
        if (this.props.visible && this.state.now !== oldNow) {
            /*this.dispatch('DatePicker', 'calendar-change', [
                new Date(this.now),
                new Date(oldNow)
            ])*/
        }
    }

    updateCalendar(now){
        this.setState ((state, props) => {
            return {
                calendarYear: this.getNow(now).year(),
                calendarMonth :this.getNow(now).month(),
                firstYear : Math.floor(now.year() / 10) * 10,
            }
        })
    }

    getCriticalTime = (value) => {
        if (!value) {
            return null
        }
        let date = moment(value)
        return date.hours(0).minutes(0).seconds(0).milliseconds(0)
    }

    inBefore(time, startAt) {
        if (isEmpty(startAt)) {
            startAt = this.props.startAt
        }
        return (
            (this.notBeforeTime() && time < this.notBeforeTime()) ||
            (startAt && time < this.getCriticalTime(startAt))
        )
    }

    inAfter(time, endAt) {
        if (isEmpty(endAt)) {
            endAt = this.endAt
        }
        return (
            (this.notAfterTime() && time > this.notAfterTime()) ||
            (endAt && time > this.getCriticalTime(endAt))
        )
    }

    inDisabledDays(time) {
        const { disabledDays } = this.props;
        if (Array.isArray(disabledDays)) {
            return disabledDays.some(v => this.getCriticalTime(v) === time)
        } else if (typeof disabledDays === 'function') {
            return disabledDays(moment(time))
        }
        return false
    }

    isDisabledDate = (date) => {
        const time = moment(date)//new Date(date).getTime()
        const maxTime = moment(date).hours(23).minutes(59).seconds(59).milliseconds(999)
        let inB = this.inBefore(maxTime)
        let inA = this.inAfter(maxTime)
        let inD = this.inDisabledDays(maxTime)
        console.log(inB)
        return (
          inB ||
          inA ||
          inD
        )
    }

    isDisabledTime(date, startAt, endAt) {
        const time = date.valueOf()
        return (
            this.inBefore(time, startAt) ||
            this.inAfter(time, endAt) ||
            this.inDisabledDays(time)
        )
    }

    selectDate = (date) => {
        const {notBefore, startAt  } = this.props

          /*  let time = date
            if (isDateObejct(this.value)) {
                time.setHours(
                    this.value.hours(),
                    this.value.minutes(),
                    this.value.seconds()
                )
            }
            if (this.isDisabledTime(time)) {
                time.setHours(0, 0, 0, 0)
                if (
                    notBefore &&
                    time.getTime() < new Date(notBefore).getTime()
                ) {
                    time = new Date(notBefore)
                }
                if (
                    startAt &&
                    time.getTime() < new Date(startAt).getTime()
                ) {
                    time = new Date(startAt)
                }
            }*/
            this.updateNow(date)
            this.props.selectDate(date)
    }

    changeCalendarYear(year) {
        this.updateNow(moment(year +'-'+this.state.calendarMonth, 'YYYY-M'))
    }

    changeCalendarMonth(month) {
        this.updateNow(moment(this.state.calendarYear +'-'+month, 'YYYY-M'))

    }

    getSibling() {
        const calendars = this.$parent.$children.filter(
            v => v.$options.name === this.$options.name
        )
        const index = calendars.indexOf(this)
        const sibling = calendars[index ^ 1]
        return sibling
    }

    handleIconMonth(flag) {
        const month = this.state.calendarMonth
        this.changeCalendarMonth(month + flag)
    }

    handleIconYear (flag){
        if (this.state.panel === 'YEAR') {
            this.changePanelYears(flag)
        } else {
            const year = this.state.calendarYear
            this.changeCalendarYear(year + flag)
        }
    }

    changePanelYears(flag) {
        this.setState({'firstYear':this.state.firstYear + flag * 10})
    }

    render() {
        const {value, dateFormat, startAt, endAt, visible, type, index, defaultValue, firstDayOfWeek, notBefore, notAfter, disabledDays, minuteStep, timeSelectOptions, timePickerOptions} = this.props;
        const { panel, firstYear, calendarMonth, calendarYear, months } = this.state;
        let panelClass = 'mx-calendar mx-calendar-panel-' + panel.toLowerCase();

        return (
            <div className={panelClass} style={{position: 'relative', float: 'left'}}>
                <div className="mx-calendar-header">
                        <a href="#" className="mx-icon-last-month" onClick={this.handleIconMonth.bind(this,-1)}>&#8249;</a>

                        <a href="#" className="mx-current-month">{months[calendarMonth]}</a>
                        <a href="#" className="mx-current-year">&nbsp;{calendarYear}</a>
                        <a href="#" className="mx-icon-next-month" onClick={(flag) => this.handleIconMonth(1)}>&#8250;</a>
                </div>

                <div className="mx-calendar-content">
                    {
                        (panel === 'DATE') &&
                        <PanelDate value={value}
                                    dateFormat={dateFormat}
                                    calendarMonth={calendarMonth}
                                    calendarYear={calendarYear}
                                    startAt={startAt}
                                    endAt={endAt}
                                    firstDayOfWeek={firstDayOfWeek}
                                    disabledDate={this.isDisabledDate}
                                    select={this.selectDate}
                                    />
                    }


                </div>
            </div>
        )
    }
}
