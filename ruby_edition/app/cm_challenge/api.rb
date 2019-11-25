require 'json'
require 'icalendar'

module CmChallenge
  class Api
    class << self
      def absences
        load_file('absences.json')
      end

      def members
        load_file('members.json')
      end

      private

      def load_file(file_name)
        file = File.join(File.dirname(__FILE__), 'json_files', file_name)
        json = JSON.parse(File.read(file))
        symbolize_collection(json['payload'])
      end

      def symbolize_collection(collection)
        collection.map { |hash| symbolize_hash(hash)}
      end

      def symbolize_hash(hash)
        hash.each_with_object({}) { |(k, v), h| h[k.to_sym] = v; }
      end
    end
  end

  class Absences
    # This method receives two parameters, the absences and the members 
    def to_ical (array_absences, array_members)
      cal = Icalendar::Calendar.new   # creating a new calendar object
      cal.prodid = "Calendar of Absences" #changing the name of the calendar
      array_absences.each do |absence|  #iterating through the registered absences
        event = Icalendar::Event.new    #Creating a new event
        clear_startDate = absence[:start_date].gsub!(/[^0-9]/,'')  #cleaning the string
        event.dtstart = Icalendar::Values::Date.new(clear_startDate)  #setting the start date
        clear_endDate = absence[:end_date].gsub!(/[^0-9]/,'') #cleaning the string
        event.dtend = Icalendar::Values::Date.new(clear_endDate) #setting the end date
        name = array_members.select { |item| item[:user_id] == absence[:user_id] } #saving the name of the absent employee
        if absence[:type] == "vacation"
          event.summary = "#{name.first[:name]} is on vacation" #Creating a title for the event (summary), when the employee is on vacation
        else
          event.summary = "#{name.first[:name]} is sick" #Creating a title for the event, when the employee is sick
        end        
        #Adding a description to the event, with some important info
        event.description = "#{name.first[:name]} is absent! Motive: #{absence[:type]} Member note: #{absence[:member_note]} Admitter note: #{absence[:admitter_note]}"
        #Adding the event to the calendar
        cal.add_event(event)
      end
      cal.publish
      cal_string = cal.to_ical #Converting the calendar to a string
      file = File.open('public/docs/ical.icb','w') #creating a new file with the extension of .icb
      file.puts cal_string  #Writing the string calendar in the file
      file.close            #closing the file
    end
  end
end
