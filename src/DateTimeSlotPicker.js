import React, { Component } from 'react'
import { DateTimePicker } from "./components/DateTimePicker";
import slots from "./slots";
import moment from "moment";

/*
import {buildUrl} from "../../actions";
import {TicketPolicyActions} from "../../constants";
import axios from "axios";
import config from "../../config";*/


export default class DateTimeSlotPicker extends Component{
    constructor (props) {
        super(props)
        this.state ={
            showTimeSlotPanel : false,
            availableTimeSlots: [],
            selectedDateValue : new Date(),
            isTimeSlotsLoading: false
        }
    }

    componentDidMount() {
        //this.getAvailableTimeSlots(this.state.selectedDateValue)
    }

    onDateChange = (date) => {
        this.setState((state, props) => {
            return {
                availableTimeSlots : [],
                showTimeSlotPanel : false,
                selectedDateValue: date,
                isTimeSlotsLoading: true
            }
        })
        setTimeout(() => {
            this.setState((state, props) => {
                return {
                    availableTimeSlots : this.getAvailableTimeSlots(),
                    showTimeSlotPanel : true,
                    //isTimeSlotsLoading: false
                }
            })
        }, 4000);
    }

    onTimeChange = (time) => {}

    onDateTimeChange = (date) => {}

    /*onDateChange = (date) => {
        console.log("On Date Change  " + date)
        if(date === ''){
            return
        }
        this.setState((state, props) => {
            return {
                availableTimeSlots : [],
                showTimeSlotPanel : false,
                selectedDateValue: date
            }
        })
        this.getAvailableTimeSlots(date)
    }

    getAvailableTimeSlots(date){
        let dateString  = moment(date).format("YYYY-MM-DD")
        console.log("selected Date: " + dateString);
        axios.get(buildUrl(config.endpoints.getOpenSlots(dateString))).then(({ data: openSlots }) => {
            this.setState((state, props) => {
                  return {
                      availableTimeSlots: this.parseTimeSlot(openSlots.start_times),
                      showTimeSlotPanel: true,
                  }
              }
            )}).catch((error) => {
            const { status: statusCode } = error.response
            const err = status.error(error, 'There was an error fetching your notification. Please try again later.')

        })
    }*/

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

    parseTimeSlot(slots){
        let slotsFromServer = slots;
        let availableTimeSlots = [];
        let amSlot = [];
        let pmSlot = [];
        slotsFromServer.map(time => {
            let momentDate = moment.utc(time, "YYYY-MM-DDThh:mm:ssTZD");
            let timeStr = momentDate.format("hh:mm a")
            timeStr.indexOf("am") > 1 ? amSlot.push(momentDate.format("hh:mm")) : pmSlot.push(momentDate.format("hh:mm"))
        })
        availableTimeSlots.push(amSlot); availableTimeSlots.push(pmSlot);
        return availableTimeSlots;
    }

    render() {
        const {showTimeSlotPanel, availableTimeSlots, isTimeSlotsLoading} = this.state
        return (
          <div>
              <DateTimePicker format="MM/DD/YYYY hh:mm a"
                              onDateTimeChange={this.onDateTimeChange}
                              onDateChange={this.onDateChange}
                              onTimeChange={this.onTimeChange}
                              showTimeSlotPanel = {showTimeSlotPanel}
                              availableTimeSlots = {availableTimeSlots }
                              notBefore={new Date()}
                              notAfter={new Date(2019, 6, 28)}
                              isTimeSlotsLoading = {isTimeSlotsLoading}
                              disabledDays={[new Date(2019, 6, 20), new Date(2019, 6, 17)]}
              >
              </DateTimePicker>

          </div>
        )
    }
}
