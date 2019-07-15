import React, { Component } from "react";
import moment from "moment";
import {isEmpty} from "../utils/utils";

export class TimePickerPanel extends Component{
    constructor (props) {
        super(props)
        this.state = {
            defaultTimeSlotsAM : this.getDefaultTimeSlots('12:00 am', '11:59 am'),
            defaultTimeSlotsPM : this.getDefaultTimeSlots('12:00 pm', '11:59 pm'),
            selectedTimeType : 'AM',
            selectedTimeSlot : '',
            selectedTime : '',
            selectedDate: ''
        }
    }

    static defaultProps = {
        selectedDate : moment(),
        selectedTime: '',
        availableTimeSlots: [[],[]],
        onTimeChange : ''
    }

    componentDidMount(){
        const { selectedDate, selectedTime } = this.props
        this.setState((state, props) => {
            return {
                selectedDate : selectedDate,
                selectedTimeSlot : !isEmpty(selectedTime)? selectedTime.split(" ")[0] : '',
                selectedTimeType : !isEmpty(selectedTime)? selectedTime.split(" ")[1].toUpperCase() : 'AM',
                selectedTime : selectedTime
            }
        });
    }

    getDefaultTimeSlots(start, end){
        let startTime = moment(start, 'hh:mm a');
        let endTime = moment(end, 'hh:mm a');
        if( endTime.isBefore(startTime) ){
            endTime.add(1, 'day');
        }
        let defaultTimeSlots = [];

        while(startTime <= endTime){
            defaultTimeSlots.push(new moment(startTime).format('hh:mm'));
            startTime.add(15, 'minutes');
        }
        return defaultTimeSlots;
    }

    handleTimeTypeChange = (index) => {
        this.setState({selectedTimeType: index === 0 ?  'AM' : 'PM'});
    }

    getCellClasses = (time) => {
        const {  selectedDate } = this.props;
        const { selectedTimeType, selectedTimeSlot, selectedTime} = this.state;
        const classes = []
        classes.push("cell")

        this.isDisabledTime(time,selectedTimeType) ? classes.push("disabled") : classes.push("selectable");
        if(selectedTimeSlot === time && (!isEmpty(selectedTime) && selectedTime.indexOf(selectedTimeType.toLowerCase())) > -1){
            classes.push("actived")
        }
        return classes
    }

    getSelectedTimeSlot(){

    }

    isDisabledTime(time, type){
        const { availableTimeSlots } = this.props
        let timeSlot = (type === 'AM') ? availableTimeSlots[0] : availableTimeSlots[1]
        return timeSlot.includes(time) ? false : true;
    }

    selectTime(time){
        if(!this.isDisabledTime(time, this.state.selectedTimeType)){
            this.setState((state, props) => {
                return {
                    selectedTimeSlot : time,
                    selectedTime : time + " "+this.state.selectedTimeType
                }
            })
            this.props.onTimeChange(time, this.state.selectedTimeType.toLowerCase())
        }
    }


    render (){
        const { defaultTimeSlotsAM, defaultTimeSlotsPM, selectedTimeType} = this.state;
        const timeFormat = ["AM", "PM"]
        const ths = timeFormat.map(timeform => {
            return <th>{timeform}</th>
        })
        const defaultTimeSlots = (selectedTimeType === "AM") ? defaultTimeSlotsAM : defaultTimeSlotsPM;
        const tbody = Array.apply(null, { length: 36 }).map((week, i) => {
            const tds = defaultTimeSlots.slice(3 * i, 3 * i + 3).map(time => {
                let cellClassName = this.getCellClasses(time).join(" ");
                return (
                    <td
                        className={cellClassName}
                        onClick={() => this.selectTime(time)}>
                        <div>{time} <span style={{ 'verticalAlign': 'super', 'fontSize': '10px'}}>{this.state.selectedTimeType.toLocaleLowerCase()}</span></div>
                    </td>
                )
            })
            return <tr>{tds}</tr>
        })
        return (
            <div className="mx-calendar">
                <div className="mx-calendar-header">
                    <div className="mx-calendar-header">
                        <a className="mx-icon-last-month" onClick={this.handleTimeTypeChange.bind(this, 0)}>&#8249;</a>
                        <a className="mx-current-year">&nbsp;{this.state.selectedTimeType}</a>
                        <a className="mx-icon-next-month" onClick={this.handleTimeTypeChange.bind(this, 1)}>&#8250;</a>
                    </div>
                </div>
                <div className="mx-time-picker-content" >
                    <table className="mx-panel mx-panel-date">
                        <thead>
                        <tr>
                            {}
                        </tr>
                        </thead>
                        <tbody>
                        {tbody}
                        </tbody>
                    </table>
                </div>

            </div>
        )
    }
}


