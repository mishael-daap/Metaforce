# 🎙️ Podcast Outline

---

# 🎙️ Section 1: What is Metaforce and Who Was It Built For?

## Key Talking Points

### What it is
Metaforce is an AI-powered platform that accelerates Salesforce development.

### The Interface
It features an interface that lets you talk to an AI agent just like you would with ChatGPT or Claude.

### How it works
You can describe exactly what you want it to build—for example:

- Custom objects and fields
- Flows
- Permission sets

The agent will then plan, build, and deploy your requirements directly into Salesforce.

### Current Scope vs. Future Vision
Right now, the agent can only handle custom objects and fields, but we plan to expand its capabilities with subsequent releases.

### Target Audience
It was built primarily for Salesforce developers, but anyone who wants to build components in Salesforce can use it.

---

# 💡 Section 2: Why Metaforce? (The Origin Story)

## Key Talking Points

### The Spark (July 2025)
About a year ago, I was undergoing an intensive Salesforce CPQ training program with Oxfordable Careers. At the end of the training, we were handed a capstone project to build out.

### The Conflict
The requirements themselves weren't complex. Honestly, they were simple enough that you could explain the concept to an 8-year-old, and they'd get it right away. I had a crystal-clear picture of what needed to be built. The problem wasn't the *what*—it was the *how*.

### The Friction
I tried using tools like Gemini to help me build it. But I found myself stuck in this exhausting loop:

- Taking screenshots of my Salesforce setup
- Copying and pasting error messages
- Desperately trying to pass context back and forth

### The Realization
I realized that I had the intent and the access to Salesforce, but I lacked the technical understanding. Gemini had the technical understanding, but it had no access to my Salesforce org.

### The Failure
Because of that barrier, I didn't complete the project and ended up failing the program. That was quite a tough pill to swallow.

### The Solution
But I knew that if I could just drag and drop the entire requirement document into an agent that actually had direct access to my Salesforce org, it could execute the plan flawlessly.

That is exactly why I built this platform: to bridge the divide between the *what* and the *how* on Salesforce.

---

# 🖥️ Section 3: Live Demo Walkthrough

## Browser Tab Setup

1. **Metaforce Platform**
2. **Presentation Slides**
3. **Salesforce Org (Object Manager)**

## Action Flow & Script

### 1. Onboarding

- Sign up for a fresh account.
- Create a new project.

**Project Name**

> The Avocados 🥑

**Project Description**

> Compose a brief description explaining that this workspace is dedicated to configuring data models for the indie rock band, The Avocados.

---

### 2. Environment Connection

Connect the org by opening the Salesforce CLI (`sf` CLI) on your machine, copying the authentication details, and pasting them directly into Metaforce.

---

### 3. The Intent (Message 1)

Navigate to the chat interface and send the first prompt:

> I am configuring a Salesforce org for an indie rock band called The Avocados. I want to keep track of Gigs.

---

### 4. The Details (Message 2)

Send the second prompt to define the schema:

> Please generate the following three custom fields for the Gigs object:
>
> 1. **Gig_Date__c** (Date) – When the concert is happening.
> 2. **Venue_Name__c** (Text) – The location or venue name.
> 3. **Ticket_Price__c** (Currency) – The cost of admission.

---

### 5. Execution & Deployment
# 🎙️ Podcast Outline

---

# 🎙️ Section 1: What is Metaforce and Who Was It Built For?

## Key Talking Points

### What it is
Metaforce is an AI-powered platform that accelerates Salesforce development.

### The Interface
It features an interface that lets you talk to an AI agent just like you would with ChatGPT or Claude.

### How it works
You can describe exactly what you want it to build—for example:

- Custom objects and fields
- Flows
- Permission sets

The agent will then plan, build, and deploy your requirements directly into Salesforce.

### Current Scope vs. Future Vision
Right now, the agent can only handle custom objects and fields, but we plan to expand its capabilities with subsequent releases.

### Target Audience
It was built primarily for Salesforce developers, but anyone who wants to build components in Salesforce can use it.

---

# 💡 Section 2: Why Metaforce? (The Origin Story)

## Key Talking Points

### The Spark (July 2025)
About a year ago, I was undergoing an intensive Salesforce CPQ training program with Oxfordable Careers. At the end of the training, we were handed a capstone project to build out.

### The Conflict
The requirements themselves weren't complex. Honestly, they were simple enough that you could explain the concept to an 8-year-old, and they'd get it right away. I had a crystal-clear picture of what needed to be built. The problem wasn't the *what*—it was the *how*.

### The Friction
I tried using tools like Gemini to help me build it. But I found myself stuck in this exhausting loop:

- Taking screenshots of my Salesforce setup
- Copying and pasting error messages
- Desperately trying to pass context back and forth

### The Realization
I realized that I had the intent and the access to Salesforce, but I lacked the technical understanding. Gemini had the technical understanding, but it had no access to my Salesforce org.

### The Failure
Because of that barrier, I didn't complete the project and ended up failing the program. That was quite a tough pill to swallow.

### The Solution
But I knew that if I could just drag and drop the entire requirement document into an agent that actually had direct access to my Salesforce org, it could execute the plan flawlessly.

That is exactly why I built this platform: to bridge the divide between the *what* and the *how* on Salesforce.

---

# 🖥️ Section 3: Live Demo Walkthrough

## Browser Tab Setup

1. **Metaforce Platform**
2. **Presentation Slides**
3. **Salesforce Org (Object Manager)**

## Action Flow & Script

### 1. Onboarding

- Sign up for a fresh account.
- Create a new project.

**Project Name**

> The Avocados 🥑

**Project Description**

> Compose a brief description explaining that this workspace is dedicated to configuring data models for the indie rock band, The Avocados.

---

### 2. Environment Connection

Connect the org by opening the Salesforce CLI (`sf` CLI) on your machine, copying the authentication details, and pasting them directly into Metaforce.

---

### 3. The Intent (Message 1)

Navigate to the chat interface and send the first prompt:

> I am configuring a Salesforce org for an indie rock band called The Avocados. I want to keep track of Gigs.

---

### 4. The Details (Message 2)

Send the second prompt to define the schema:

> Please generate the following three custom fields for the Gigs object:
>
> 1. **Gig_Date__c** (Date) – When the concert is happening.
> 2. **Venue_Name__c** (Text) – The location or venue name.
> 3. **Ticket_Price__c** (Currency) – The cost of admission.

---

### 5. Execution & Deployment

Let the agent process the three requirements, generate the execution plan, and build them natively in Salesforce.

---

### 6. The Proof

Switch over to your Salesforce Org tab, refresh the Object Manager, and visually show the audience the newly deployed custom object and fields.

---

# 🚀 Section 4: What Are the Next Steps for Metaforce?

## Key Talking Points

### Early Stage Beta
This is a brand-new software platform.

### Continuous Improvement
As people begin to use it in real-world scenarios, we will naturally discover new edge cases and bugs.

### Iteration
Our immediate focus is to fix the issues we discover alongside our early users.

### Expanding the Skillset
Moving forward, we will actively expand the agent's capabilities to support more complex Salesforce metadata components beyond custom objects and fields.
Let the agent process the three requirements, generate the execution plan, and build them natively in Salesforce.

---

### 6. The Proof

Switch over to your Salesforce Org tab, refresh the Object Manager, and visually show the audience the newly deployed custom object and fields.

---

# 🚀 Section 4: What Are the Next Steps for Metaforce?

## Key Talking Points

### Early Stage Beta
This is a brand-new software platform.

### Continuous Improvement
As people begin to use it in real-world scenarios, we will naturally discover new edge cases and bugs.

### Iteration
Our immediate focus is to fix the issues we discover alongside our early users.

### Expanding the Skillset
Moving forward, we will actively expand the agent's capabilities to support more complex Salesforce metadata components beyond custom objects and fields.