import React, { Component } from 'react'
import { DateTimePicker } from "./components/DateTimePicker";
import slots from "./slots";
import moment from "moment";

export class DateTimeSlotPicker extends Component{
    constructor (props) {
        super(props)
        this.state ={
            showSlotPanel : false,
            availableTimeSlots: [],
            selectedDateValue : new Date()

        }
    }

    componentDidMount() {
        this.getAvailableTimeSlots();
    }

    onDateChange = (date) => {
        this.setState((state, props) => {
            return {
                availableTimeSlots : [],
                showSlotPanel : false,
                selectedDateValue: date
            }
        })
        setTimeout(() => {
            this.setState((state, props) => {
                return {
                    availableTimeSlots : this.getAvailableTimeSlots(),
                    showSlotPanel : true
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
                <DateTimePicker dateFormat="YYYY-MM-DD"
                          onChange={this.onDateChange}
                          showSlotPanel = {this.state.showSlotPanel}
                          availableTimeSlots = { this.state.availableTimeSlots }
                >
                </DateTimePicker>
            </div>
        )
    }
}
