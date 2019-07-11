import React, { Component } from 'react'
import { DateTimePicker } from "./components/DateTimePicker";
import slots from "./slots";
import moment from "moment";

export class DateTimeSlotPicker extends Component{
    constructor (props) {
        super(props)
        this.state ={
            showTimeSlotPanel : false,
            availableTimeSlots: [],
            selectedDateValue : new Date()
        }
    }

    onDateChange = (date) => {
        console.log("Onchange Date  " + date)
        this.setState((state, props) => {
            return {
                availableTimeSlots : [],
                showTimeSlotPanel : false,
                selectedDateValue: date
            }
        })
        setTimeout(() => {
            this.setState((state, props) => {
                return {
                    availableTimeSlots : this.getAvailableTimeSlots(),
                    showTimeSlotPanel : true
                }
            })
        }, 4000);

    }

    getAvailableTimeSlots(){
        let slotsFromServer = slots;
        let availableTimeSlots = [];
        let amSlot = [];
        let pmSlot = []
        slotsFromServer.start_times.map(time => {
            let momentDate = moment.utc(time, "YYYY-MM-DDThh:mm:ssTZD");
            let timeStr = momentDate.format("hh:mm a")
            timeStr.indexOf("am") > 1 ? amSlot.push(momentDate.format("hh:mm")) : pmSlot.push(momentDate.format("hh:mm"))
        })
        availableTimeSlots.push(amSlot); availableTimeSlots.push(pmSlot);
        return availableTimeSlots;
    }

    render () {
        return (
            <div>
                <DateTimePicker
                          onChange={this.onDateChange}
                          showTimeSlotPanel = {this.state.showTimeSlotPanel}
                          availableTimeSlots = { this.state.availableTimeSlots }
                          format="MM/DD/YYYY hh:mm a"
                >
                </DateTimePicker>
            </div>
        )
    }
}
