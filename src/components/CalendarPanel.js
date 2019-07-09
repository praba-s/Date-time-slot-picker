import React, {Component} from 'react'
import { isValidDate, isDateObejct, formatDate } from '../utils/index'
import scrollIntoView from '../utils/scroll-into-view'
import { PanelDate } from '../components/date'
import {isEmpty} from "../utils/utils";

export class CalendarPanel extends Component {
    constructor (props) {
        super(props)
        this.state = {
            panel: 'DATE',
            dates: [],
            now : '',
            calendarYear: '',
            calendarMonth: '',
            firstYear: '',
            months:['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
    }

    static defaultProps = {
        value: new Date(),
        format: 'YYYY-MM-DD',
        confirmText: 'OK',
        confirm: true,
        inputName: 'date',
        inputClass: 'mx-input',
        popupStyle: '',
        placeholder: "Please select Date",
    }

    componentDidMount() {
        const { value, format } = this.props
        const dateVal = !isEmpty(value) ? value : new Date()
        const now = this.getNow(dateVal)
        this.setState((state, prop) => {
            return {
                now : now,
                calendarYear: now.getFullYear(),
                calendarMonth: now.getMonth() ,
                firstYear: Math.floor(now.getFullYear() / 10) * 10,
            }
        });
    }

    timeType() {
        const h = /h+/.test(this.$parent.format) ? '12' : '24'
        const a = /A/.test(this.$parent.format) ? 'A' : 'a'
        return [h, a]
    }

    timeHeader() {
        if (this.props.type === 'time') {
            return this.$parent.format
        }
        return this.props.value && formatDate(this.props.value, this.props.dateFormat)
    }

    notBeforeTime() {
        return this.getCriticalTime(this.notBefore)
    }

    notAfterTime() {
        return this.getCriticalTime(this.notAfter)
    }


    getNow(value) {
        let val = value ? new Date(value): this.props.defaultValue && (isValidDate(this.props.defaultValue) ? new Date(this.props.defaultValue) : new Date())
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
        this.setState ({
            calendarYear: this.getNow(now).getFullYear(),
            calendarMonth :this.getNow(now).getMonth(),
            firstYear : Math.floor(now.getFullYear() / 10) * 10,
        })
    }

    getCriticalTime = (value) => {
        if (!value) {
            return null
        }
        const date = new Date(value)
        if (this.state.valueType === 'year') {
            return new Date(date.getFullYear(), 0).getTime()
        } else if (this.state.valueType === 'month') {
            return new Date(date.getFullYear(), date.getMonth()).getTime()
        } else if (this.state.valueType === 'date') {
            return date.setHours(0, 0, 0, 0)
        }
        return date.getTime()
    }

    inBefore(time, startAt) {
        if (startAt === undefined) {
            startAt = this.props.startAt
        }
        return (
            (this.notBeforeTime && time < this.notBeforeTime) ||
            (startAt && time < this.getCriticalTime(startAt))
        )
    }

    inAfter(time, endAt) {
        if (endAt === undefined) {
            endAt = this.endAt
        }
        return (
            (this.notAfterTime && time > this.notAfterTime) ||
            (endAt && time > this.getCriticalTime(endAt))
        )
    }

    inDisabledDays(time) {
        if (Array.isArray(this.disabledDays)) {
            return this.disabledDays.some(v => this.getCriticalTime(v) === time)
        } else if (typeof this.disabledDays === 'function') {
            return this.disabledDays(new Date(time))
        }
        return false
    }

    isDisabledYear(year) {
        const time = new Date(year, 0).getTime()
        const maxTime = new Date(year + 1, 0).getTime() - 1
        return (
            this.inBefore(maxTime) ||
            this.inAfter(time) ||
            (this.type === 'year' && this.inDisabledDays(time))
        )
    }

    isDisabledMonth(month) {
        const time = new Date(this.state.calendarYear, month).getTime()
        const maxTime = new Date(this.state.calendarYear, month + 1).getTime() - 1
        return (
            this.inBefore(maxTime) ||
            this.inAfter(time) ||
            (this.type === 'month' && this.inDisabledDays(time))
        )
    }

    isDisabledDate = (date) => {
        const time = new Date(date).getTime()
        const maxTime = new Date(date).setHours(23, 59, 59, 999)
        return (
            this.inBefore(maxTime) ||
            this.inAfter(time) ||
            this.inDisabledDays(time)
        )
    }

    isDisabledTime(date, startAt, endAt) {
        const time = new Date(date).getTime()
        return (
            this.inBefore(time, startAt) ||
            this.inAfter(time, endAt) ||
            this.inDisabledDays(time)
        )
    }

    selectDate = (date) => {
            let time = new Date(date)
            if (isDateObejct(this.value)) {
                time.setHours(
                    this.value.getHours(),
                    this.value.getMinutes(),
                    this.value.getSeconds()
                )
            }
            if (this.isDisabledTime(time)) {
                time.setHours(0, 0, 0, 0)
                if (
                    this.notBefore &&
                    time.getTime() < new Date(this.notBefore).getTime()
                ) {
                    time = new Date(this.notBefore)
                }
                if (
                    this.startAt &&
                    time.getTime() < new Date(this.startAt).getTime()
                ) {
                    time = new Date(this.startAt)
                }
            }
            this.updateNow(date)
            this.props.selectDate(date)
    }

    selectYear(year) {
        this.changeCalendarYear(year)
        if (this.type.toLowerCase() === 'year') {
            return this.selectDate(new Date(this.now))
        }
        this.dispatch('DatePicker', 'select-year', [year, this.index])
        this.showPanelMonth()
    }

    selectMonth(month) {
        this.changeCalendarMonth(month)
        if (this.type.toLowerCase() === 'month') {
            return this.selectDate(new Date(this.now))
        }
        this.dispatch('DatePicker', 'select-month', [month, this.index])
    }

    selectTime(time) {
        //this.$emit('select-time', time, false)
    }

    pickTime(time) {
        //this.$emit('select-time', time, true)
    }

    changeCalendarYear(year) {
        this.updateNow(new Date(year, this.state.calendarMonth))
    }

    changeCalendarMonth(month) {
        this.updateNow(new Date(this.state.calendarYear, month))
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
                                    date-format={dateFormat}
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
