# 📽️ Presentation

---

# Slide 1: The Mission

## **Project: The Avocados 🥑**

### The Client
An up-and-coming indie rock band.

### The Problem
They are booking live shows but currently have absolutely no way to track or manage their gigs.

### The Goal
Build a custom data structure to track live concerts (**Gigs**).


# Slide 2: Project Onboarding & Environment Setup

## 1. Authentication

**Sign Up with Google**

- Instant, secure workspace entry.

---

## 2. Workspace Initialization

### Project Name

**The Avocados 🥑**

### Project Description

A collaborative workspace to build out the custom data architecture for managing merchandise, tour schedules, and fan engagement for the indie rock band **"The Avocados."**

---

## 3. Establishing the Environment Connection (SF CLI Workflow)

Run the following commands in your local terminal to authenticate your target org and extract the connection details for the platform.

```bash
# Step 1: Authenticate natively via your web browser and set your project alias
sf org login web --alias the-avocados-org --set-default

# Step 2: Verify your active connections and check the org status
sf org list

# Step 3: Extract the raw JSON metadata containing the connection parameters
sf org display --target-org the-avocados-org
```

# Slide 3: Agent Planning & Execution Pipeline

## 💬 Step 1: Setting the Stage (Message 1)

Copy and paste this exact prompt to give the agent its business mission.

```text
I am configuring a Salesforce org for an indie rock band called The Avocados. I want to keep track of Gigs.
```

---

## 💬 Step 2: Defining the Schema (Message 2)

Copy and paste this exact prompt to deliver the core requirements.

```text
Please generate the following 3 custom fields for the Gigs object:
1. Gig_Date__c (Date) – When the concert is happening.
2. Venue_Name__c (Text) – The location or venue name.
3. Ticket_Price__c (Currency) – The cost of admission.
```

---

## 🔄 Step 3: Moving to Execution (Plan Mode → Build Mode)

### Toggle to Build Mode

Click the **Plan** button to toggle the interface over to **Build Mode**.

### Session Maintenance

Navigate to **Actions → Project Setup**.

In the modal overlay, paste the access token.


---

# Slide 4: Verification and End-to-End Testing

## 🔍 Step 1: Ground Truth Verification in Salesforce

- Log in to your target Salesforce org.
- Navigate to **Setup** (click the gear icon in the top-right corner).
- Open **Object Manager** and search for your newly deployed object: **Gigs**.

---

## 🎨 Step 2: Creating the Custom Tab UI

Navigate back to **Setup Home** and use the **Quick Find** box to search for **Tabs**.

Under **Custom Object Tabs**, click **New**.

### Configure the Tab Details

- **Object:** Gigs
- **Tab Style:** Guitar 🎸
- **Description:** Custom interface tab providing users and band management with a centralized view to schedule, track, and update tour dates and live performances for The Avocados.

Click **Next**, keep the default settings, and then click **Save**.

---

## 🧪 Step 3: End-to-End Data Entry Test

- Click the **App Launcher** (waffle icon) and navigate back to the **Service App** (or your preferred app bundle).
- Click your newly created **Gigs** tab in the navigation bar.
- Click **New** to create a live record and populate the fields:

| Field | Value |
|--------|-------|
| **Gig Name** | The Avocados Album Launch |
| **Gig Date** | Select any date |
| **Venue Name** | The Rock Arena |
| **Ticket Price** | $25.00 |

Click **Save**.

---

## 🏁 Step 4: Closing the Loop with the Agent

Switch back to **Tab 1 (Metaforce)** and send a final confirmation message to the agent.

```text
The requirements have been properly built and verified in the Salesforce org! Awesome job.
```