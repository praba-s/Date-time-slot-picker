import React, { Component } from 'react'
import { isValidDate, isValidRangeDate, isDateObejct, isPlainObject, formatDate, parseDate, convertTimeFrom12To24 } from '../utils/index'
import { CalendarPanel } from '../components/CalendarPanel'
import { TimePickerPanel } from "./TimePickerPanel";
import { isEmpty } from '../utils/utils'
import moment from 'moment'

export class DateTimePicker extends Component{

    constructor(props) {
        super(props);
        this.state = {
            selectedDate: '',
            showPopup: false,
            position: {},
            selectedTime: ""
        }
    }

    static defaultProps = {
        format: 'MM/DD/YYYY hh:mm a',
        type: 'type',
        confirmText: 'OK',
        confirm: false,
        inputName: 'date',
        inputClass: 'mx-input',
        popupStyle: '',
        placeholder: "Please select Date",
        showTimeSlotPanel: false,
        selectedTime: '',
        onDateChange: () => { },
        onTimeChange: () => { }
    }

    componentDidMount() {
        const { value, format } = this.props
        const dateVal = !isEmpty(value) && this.isValidValue(value) ? value : ''
        this.setState((state, props) => {
            return {
                selectedDate: dateVal
            }
        });
        this.updateDate()
    }

    text = () => {
        const { selectedDate } = this.state
        /*let dateText = this.isValidValue(selectedDate)
                ? this.stringify(this.parse(selectedDate))
                : ''*/
        console.log("selectedDate **** " + selectedDate)

        let dateText  = isEmpty(selectedDate) ? '' : moment(selectedDate).format(this.props.format);
        return dateText;
    }

    parse (value) {
        return (isPlainObject(this.props.format) && typeof this.props.format.parse === 'function')
            ? this.props.format.parse(value)
            : parseDate(value, this.props.format)
    }

    stringify (date) {
        return (isPlainObject(this.format) && typeof this.format.stringify === 'function')
            ? this.format.stringify(date)
            : formatDate(date, this.format)
    }

    isValidValue (value) {
        return isValidDate(this.parse(value))
    }

    showPopup = (event) => {
        const { selectedDate } = this.state
        event.preventDefault();
        event.nativeEvent.stopImmediatePropagation();
        if (this.disabled) {
            return
        }
        this.setState((state,props) => {
            return {
                selectedDate : (selectedDate === '') ? new Date() : selectedDate,
                showPopup: true
            }
        });
        this.updateDate();
    }

    closePopup = () => {
        this.setState({showPopup: false});
    }

    handleBlur = (event) =>{
       // this.$emit('blur', event)
    }

    handleFocus (event) {
        if (!this.showPopup) {
            this.showPopup(event)
        }
        //this.props.focus(event) //TODO
    }

    handleKeydown = (event) => {
        const keyCode = event.keyCode
        // Tab 9 or Enter 13
        if (keyCode === 9 || keyCode === 13) {
            // ie emit the watch before the change event
            event.stopPropagation()
            this.handleChange()
            this.closePopup()
        }
    }

    clearDate = (e) => {
        e.stopPropagation();
        this.setState({selectedDate:  ''})
        this.updateDate(true)
        if(this.props.clear !== undefined){ this.props.clear()};
    }

    handleInput = (event) => {
    }

    handleChange = () => {
        if (this.props.editable) {
            const value = this.text()
            const checkDate = this.$refs.calendarPanel.isDisabledTime
            if (!value) {
                this.clearDate()
                return
            }

            const date = this.parse(value)
            if (date && !checkDate(date, null, null)) {
                this.setState({'selectedDate' : date})
                this.updateDate(true)
                this.closePopup()
                return
            }

            this.props.inputError(value);
        }
    }

    selectDate = (date, close = false) => {
         this.setState( (state, props) => {
                 return {
                     selectedDate : date
                 };
             });

         this.updateDate(close)
        if(close){ this.closePopup() }
    }

    selectTime = (time, timeType) => {
        let date = this.state.selectedDate;
        let timeArr = !isEmpty(time) ? time.split(":") : []
        let formattedTime = convertTimeFrom12To24(time + " " + timeType);
        if(timeArr.length > 0 ){
            date.setHours(parseInt(formattedTime.split(":")[0]))
            date.setMinutes(parseInt(formattedTime.split(":")[1]))
        }
        this.setState((state, props) => {
            return {
                selectedTime: time,
                selectedDate: date,
            }
        })
        if(this.props.onTimeChange !== undefined){ this.props.onTimeChange(time + " " + timeType)};
        this.closePopup()
    }

    updateDate = (confirm = false) => {
        if (this.props.disabled) {
            return false
        }
        const equal = this.dateEqual(this.props.value, this.state.selectedDate)
        if (equal) {
            return false
        }
        //if(this.props.input != undefined){ this.props.input()};
        if(this.props.onDateChange !== undefined){ this.props.onDateChange(this.state.selectedDate)};


        /*this.handleChange();
        this.handleInput()*/
        //return true;
    }

    dateEqual (a, b) {
        return isDateObejct(a) && isDateObejct(b) && a.getTime() === b.getTime()
    }

    confirmDate = () => {
        const valid = this.props.range ? isValidRangeDate(this.state.selectedDate) : isValidDate(this.state.selectedDate)
        if (valid) {
            this.updateDate(true)
        }
        this.closePopup()
    }

    computedWidth () {
        if (typeof this.props.width === 'number' || (typeof this.props.width === 'string' && /^\d+$/.test(this.props.width))) {
            return this.props.width + 'px'
        }
        return this.props.width
    }

    innerPlaceholder = () => {
        if (typeof this.props.placeholder === 'string') {
            return this.props.placeholder
        }
    }

    calendarChange(){

    }

    changeCalendarYear = () => {

    }

    render(){

        const {placeholder, dateFormat, type, confirm, editable, disabled,
            inputName, inputClass, showTimeSlotPanel, availableTimeSlots } = this.props;
        const { selectedDate, selectedTime } = this.state
        let computedWidth = this.computedWidth(); //TODO
        let innerPopupStyle = { ...this.state.position, ...this.props.popupStyle }
        let inputValue = this.text();
        return (
            <div>
            <div className="mx-datepicker"
                style={{"width": computedWidth}}>
                <div className="mx-input-wrapper" onClick={this.showPopup.bind(this)}>

                    <input
                        className={inputClass}
                        name={inputName}
                        ref="input"
                        type="text"
                        disabled={disabled}
                        readOnly={!editable}
                        value={inputValue}
                        placeholder={placeholder}
                        onKeyDown={this.handleKeydown}
                        onFocus={this.handleFocus.bind(this)}
                        onBlur={this.handleBlur}
                        onInput={this.handleInput}
                        onChange={this.handleChange}/>
                    <span
                      v-if="showClearIcon"
                      className="mx-input-append mx-clear-wrapper" onClick={this.clearDate}>
                        <slot name="mx-clear-icon">
                            <i className="mx-input-icon mx-clear-icon"></i>
                        </slot>
                    </span>
                    <span className="mx-input-append">
                        <slot name="calendar-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 200 200" className="mx-calendar-icon">
                            <rect x="13" y="29" rx="14" ry="14" width="174" height="158" fill="transparent" />
                            <line x1="46" x2="46" y1="8" y2="50" />
                            <line x1="154" x2="154" y1="8" y2="50" />
                            <line x1="13" x2="187" y1="70" y2="70" />
                            <text x="50%" y="135" fontSize="90" strokeWidth="1" textAnchor="middle" dominantBaseline="middle">{new Date().getDate()}</text>
                          </svg>
                        </slot>
                    </span>
                </div>
            </div>
                {this.state.showPopup &&
                    <div className="mx-datepicker-popup"
                     style={{innerPopupStyle}}
                     ref="calendar">
                    <div className="mx-Datetime-picker-wrapper">
                        <CalendarPanel
                            index="-1"
                            type={type}
                            date-format={dateFormat}
                            value={selectedDate}
                            visible={this.state.showPopup}
                            selectDate={this.selectDate}
                            />
                        { showTimeSlotPanel &&
                             <TimePickerPanel
                                    index="-1"
                                    type={type}
                                    selectedDate={selectedDate}
                                    selectedTime={selectedTime}
                                    selectTime={this.selectTime}
                                    availableTimeSlots={ availableTimeSlots }
                             />
                        }
                    </div>
                    <slot name="footer">
                        {confirm &&
                            <div className="mx-datepicker-footer">
                                <button type="button" className="mx-datepicker-btn mx-datepicker-btn-confirm" onClick={this.confirmDate}>OK</button>
                            </div>
                        }
                    </slot>
                    </div>
                }
        </div>
        )
    }
}
