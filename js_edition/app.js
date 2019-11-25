const express = require('express')
const api = require('./src/api.js');
const ical = require('ical-generator');
const fs = require('fs');
const path = require('path');
const app = express()
const port = 3000
var absences; 
var members; 

// Function to start the server 
app.listen(port, async () =>{
    // Creating the variables once
    absences = await api.absences().then((res) => {return res});
    members = await api.members().then((res) => {return res});    
    console.log(`Crewmeister coding challenge - back end simple server, listen on port: ${port}!`)
});

// Main function 
app.get('/', async (req, res) => {
    // Get quantity of params passed by the url
    var sizeParams = Object.keys(req.query).length;

    switch(sizeParams) {
        case 0: // Zero params 
            // Write the file public/icalFile.icb with the content of the returned content of the function genIcalFile
            fs.writeFile('./public/icalFile.icb',genIcalFile(absences, members), function(err){
                if(err) console.log(err); 
                else res.download('./public/icalFile.icb'); // Send the option to download the file 
            });
            break; 
        case 1: // One param
            var id = req.query.userId;  //If the param doesn't exist, it will assign undefined
            if(id) {    // If is undefined it won't execute
                // Select the absences of that specific employee
                var employeeAbsence = selectOneEmployee(absences, id)
                // If there is no employee with userId equals to id, then the lenght will be 0
                if(employeeAbsence.length > 0) {    
                    res.send(JSON.stringify(employeeAbsence));
                } else res.send('No match found');  // And there will not be a match 
            } else {
                res.send('invalid param');  // if the single param is not userId
            }
            break; 
        case 2: 
            // Collecting the params
            var sDate = req.query.startDate; 
            var eDate = req.query.endDate;
            // If the params do not exits, then it wont pass this next if 
            if( sDate && eDate ){          
                // Parsing the data        
                var parsedStartDate = d(sDate), 
                    parsedEndDate = d(eDate);

                // If parse fails, then it wont execute the contente of this if, this mean that the date isn't valid
                if(!isNaN(parsedStartDate) && !isNaN(parsedEndDate)){
                    // The endDate must be newer than the startDate
                    if(parsedEndDate < parsedStartDate) {
                        res.send('invalid range date')
                    }else {
                        // If all the requiremenst are right, then send the json to the user 
                        res.send(JSON.stringify(selectRangeDate(absences, parsedStartDate, parsedEndDate)));
                    }
                } else {
                    // Message if the dates are invalid 
                    res.send('invalid dates'); 
                }
            }else {
                // Message if the params are invalid
                res.send('invalid params'); 
            }
            break; 
        default: 
            res.send("unknown request"); 
            break;
    } 
});

// Function to list the absences of the employees who is on vacation 
app.get('/vacation', async(req, res) => {
    // Send the filtered array
    res.send(JSON.stringify(filterArray(absences, 'vacation')))
});

// Function to list the absences of the employees who is sick 
app.get('/sickness', async(req, res) => {
    // Send the filtered array
    res.send(JSON.stringify(filterArray(absences, 'sickness')))
});

// Function to decrease the length of the lines who need to parse dates; 
function d (date){
    return Date.parse(date); 
}


// Function to generate the ical file 
function genIcalFile(absences, members) {
    // Set the atributes of the file 
    const cal = ical({domain: 'crewmeister.com', name: 'Absences Icalendar file'}); 
    // Create a loop to iterate the absences array 
    absences.forEach((item) => {
        // Search the name of the absent employee 
        var employee = members.filter(function(member) { return member.userId == item.userId})[0]; 
        // Create an event 
        cal.createEvent({
            start: item.startDate, 
            end: item.endDate, 
            summary: (item.type === "vacation") ? `${employee.name} is on vacation` : `${employee.name} is sick`, 
            description: `${employee.name} is absent! Motive: ${absences.type},\
            Member note: ${absences.memberNote}, Admitter note: ${absences.admitterNote}`
        });
    });
    // Return the ical in a string
    return cal.toString();
}

// Function to select the absences of a specific employee
function selectOneEmployee (absences, id) {
    var employeeAbsence = absences.filter(function(item) {
        return item.userId == id;
    });
    return employeeAbsence;
}

// Function to select the absences in a speficic range date 
function selectRangeDate (absences, start, end) { // the dates passed were parsed already
    var selectedDates = absences.filter(function(item){
        var auxStartDate = d(item.startDate), 
            auxEndDate = d(item.endDate);
        return auxStartDate > start && auxStartDate < end && auxEndDate < end; 
    });
    return selectedDates;
}

// Function to filter the absences array, taking as a criteria the type of absence 
function filterArray (absences, type) {
    var filtered = absences.filter((item) => {
        return item.type == type;
    });
    return filtered; 
}