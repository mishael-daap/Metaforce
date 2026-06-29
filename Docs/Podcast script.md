what is metaforce and who was it built for? 
- It is an ai powered platform that accelerates salesforce development
- It has an interface that lets you talk to an agent just like you would with chatgpt and claude 
- you can describe what you want it to build for example, custom objects and fields or flows or permission sets
- the agent will plan, build and deploy your requirements in salesforce
- right now the agent can only handle custom objects and fields, but we plan to expand it's capabilities with subsequent releases
- it was built for salesforce developers, but anyone who wants to build in salesforce can use it


why metaforce?
- In July 2025 that's About a year ago, I was doing a intensive Salesforce CPQ training program with Oxfordable Careers. At the end of it, we were handed a capstone project to build out.

- The requirements themselves weren't complex. Honestly, they were simple enough that you could explain the concept to an 8-year-old and they’d get it right away. I had a crystal-clear picture of what needed to be built. The problem wasn't the what—it was the how.

- I tried using tools like Gemini to help me build it. But I found myself stuck in this exhausting loop: taking screenshots of my Salesforce setup, copying and pasting error messages, and trying to pass context back and forth.

- Then i realized I had the intent and the access to Salesforce, but lacked the technical understanding. Gemini had the the technical understanding, but it had no access to my Salesforce org.

- I didnt complete the project and ended up failing the program, and that was quite a tough pill to swallow

- But I knew If I could just drag and drop this entire requirement document into an agent that actually has direct access to my Salesforce org, it could execute the plan flawlessly and that is why I built this platform, to bridge the divide between the what and the how on salesforce. 

Demo

3 tabs: 
- metaforce
- slide
- salesforce org

flow
- sign up
- create project
    - The Avocados 🥑
    - [compose a description]
- connect org: open sf cli and copy details
- go to chat
- message: "I am configuring a salesforce org for an indie rock band called The Avocados. I want to keep track of three core things: Gigs, Merchandise, and Fan Club Members."
- message2: 1. Gigs Object (3 Fields)
Gig_Date__c (Date) – When the concert is happening.

Venue_Name__c (Text) – The location or venue name.

Ticket_Price__c (Currency) – The cost of admission.

2. Songs Object (3 Fields)
Release_Date__c (Date) – When the track was dropped.

Track_Duration__c (Text or Number) – The length of the song (e.g., 3:45).

Streaming_Count__c (Number) – Total plays to track popularity.

3. Fan Club Members Object (5 Fields)
Join_Date__c (Date) – When the fan signed up.

Email__c (Email) – For newsletter and updates.

Tier__c (Picklist) – Membership level (e.g., VIP, General).

Total_Spent__c (Currency) – Lifetime financial support from the fan.

Favorite_Track__c (Text) – Personalization data.
- 

- create the three requirements




