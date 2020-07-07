# EventsFly

A web service to interact with events in communities (e.g. Universities, Apartments, Offices, etc.)

This starts from an idea to digitize flyers (posters) in a University.
Let's see how far we can go from here.

Prodcut 1.0 scope:
a. Log in from University portal
b. Show flyers in a list mode (Thumbnail mode is a plus)
c. Show high resolution flyer when "view" it
d. Add new flyers to backend datebase.
e. Sort/Filter flyers by attributes, includes
   Start date, End Date
   Types (Hiring, Events, Lost&Found, Annoucement, ...)
   Departments
   ...

Technical Spec:
i)   Frontend: HTML/CSS, Javascript (Bootstrap, Momentjs, JQuery)
ii)  Backend: Javascript (Express, Nodejs)
iii) Database service: GCP Datastore
iv)  Deployment: GCP App Engine
v)   Library: HighSlide JS
vi)  APIs: Google Log in, Google Map, Slack, ...

Project Method (Agile / Scrum):
Iteration 1 Stories:
  > Log in
  > Show List
  > Add Entry
  > ...
