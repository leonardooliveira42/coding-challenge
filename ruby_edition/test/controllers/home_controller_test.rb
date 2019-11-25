require 'test_helper'

class HomeControllerTest < ActionDispatch::IntegrationTest
  # testing the responses of the page
  test "can see home page" do 
    get '/home'

    assert_select "h3", "Absences"
  end

  test "can see single employee" do 
    get '/', params: { userId: "644"}

    assert_select ".navbar-brand", "Employee: Max"
  end
  
  test "not valid user" do 
    get '/', params: { userId: "645"}

    assert_select "script", "alert('No match to the user Id')"
  end

  test "can see range date page" do 
    get '/', params: { startDate: "2017-01-01", endDate: "2017-03-01"}

    assert_select ".navbar-brand", "Range date: 2017-01-01 to 2017-03-01"
  end

  test "not valid date" do 
    get '/', params: { startDate: '1', endDate: '1' }

    assert_select "script", "alert('The dates are not valid')"
  end

  test "range date inverted" do 
    get '/', params: { startDate: '2017-04-01', endDate: '2017-01-01' }

    assert_select "script", "alert('Range date is invalid, startDate newer than endDate')"
  end

  test "return the ical file" do 
    get '/', params: {}

    assert_response :success
    assert_equal "text/icb", response.content_type
  end
end
