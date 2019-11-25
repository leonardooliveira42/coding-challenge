Rails.application.routes.draw do
  # The user has the possibity to see the list of absences, whos is on vacation and who is sick in the home page
  get 'home', to: "home#home"
  # Root
  get 'home/index'
  root 'home#index'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
