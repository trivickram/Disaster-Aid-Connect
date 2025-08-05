# 🆘 Disaster Aid Connect (AWS Free Tier Project)
[**Live Demo Links:**]
- [Add Resource Page](https://disastor-aid.s3.ap-south-1.amazonaws.com/Disastor-aid/add.html)
- [Homepage (View Resources)](https://disastor-aid.s3.ap-south-1.amazonaws.com/Disastor-aid/index.html)

Disaster Aid Connect is a beginner-friendly, full-stack serverless web application that allows users to add and view emergency resources such as food, shelter, and medical help during disasters.

The entire project runs within the **AWS Free Tier**, uses only basic HTML/CSS/JS for the frontend, and leverages AWS Lambda, DynamoDB, API Gateway, and S3 for the backend.

---

## 🏗️ Architecture Overview

```
[User Browser]
     ↓
[Static HTML/CSS/JS] - hosted on → [Amazon S3 (Static Website Hosting)]
     ↓ JS Fetch Calls
[Amazon API Gateway (GET/POST)]
     ↓
[AWS Lambda Functions (getResources / addResource)]
     ↓
[Amazon DynamoDB Table (Resources)]
```

---

## 🌐 Live Components

- **Frontend**: HTML/CSS/JS hosted on **Amazon S3**
- **Backend API**: Created using **AWS API Gateway + AWS Lambda**
- **Database**: Stores emergency resources in **Amazon DynamoDB**
- **Authentication**: Not required (open submission)

---

## ✅ Features

- 📥 Submit a new resource via a form (`add.html`)
- 📄 Display all available resources in a responsive **HTML table** (`index.html`)
- 🌙 Dark mode styling with responsive layout
- 🔒 Fully serverless, secured via API Gateway + CORS headers

---

## 🛠️ Step-by-Step AWS Setup Guide (Beginner Friendly)

### 1. Set up your AWS account
- Go to https://aws.amazon.com
- Click **Create an AWS Account**
- Enter email, password, and account name
- Provide credit card details (only for verification)
- Select Free Tier plan
- Sign in to AWS Management Console

### 2. Host the frontend on Amazon S3
- In AWS Console, search “S3”
- Click **Create Bucket**
- Bucket Name: `disaster-aid-connect-yourname`
- Region: Any close region (e.g., Asia Pacific Mumbai)
- Uncheck “Block all public access”
- Acknowledge the warning
- Go to the bucket > Properties > Static website hosting
- Enable it
- Set:
  - Index document: `index.html`
  - Error document: `index.html`
- Go to Permissions > Bucket Policy, paste this:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::disaster-aid-connect-yourname/*"
  }]
}
```
- Upload all files from the downloaded ZIP:
  - `index.html`, `add.html`, `scripts/`, `styles/`
- Visit the S3 Website Endpoint URL (shown under Static Hosting)

✅ You now have a hosted website!

### 3. Create a DynamoDB Table
- Search “DynamoDB” in the AWS Console
- Click **Create Table**
- Table name: `Resources`
- Partition Key: `id` (type: String)
- Leave all other settings default (Free Tier covers this)
- Click **Create Table**

✅ Database ready.

### 4. Create the Lambda Function (addResource)
- Go to Lambda
- Click **Create function**
- Name: `addResource`
- Runtime: Python 3.12
- Click **Create Function**
- Replace default code with this:

```python
import json, boto3, uuid, datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Resources')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    item = {
        'id': str(uuid.uuid4()),
        'type': body['type'],
        'location': body['location'],
        'contact': body['contact'],
        'description': body['description'],
        'timestamp': datetime.datetime.utcnow().isoformat()
    }
    table.put_item(Item=item)
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Resource added!'})
    }
```
- Click **Deploy**
- In the Configuration tab, scroll to **Permissions**
- Under **Execution role**, click the role name link (opens IAM)
- Click **Add permissions** > **Attach policies**
- Search and attach: `AmazonDynamoDBFullAccess`

### 5. Create another Lambda Function (getResources)
- Same process:
  - Name: `getResources`
  - Runtime: Python 3.12
  - Paste this code:

```python
import json, boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Resources')

def lambda_handler(event, context):
    response = table.scan()
    items = response['Items']
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(items)
    }
```
- Click **Deploy**
- Attach policy: `AmazonDynamoDBReadOnlyAccess`

### 6. Create API Gateway Endpoints
- Go to API Gateway
- Click **Create API**
- Choose **REST API**
- Name: `DisasterAidAPI`
- Click **Actions > Create Resource**
- Path: `/add-resource`
- Add method: **POST**
- Integration type: Lambda
- Select `addResource`
- Repeat for `/get-resources` (**GET** method → `getResources`)
- Click **Actions > Deploy API**
- Deployment Stage: `dev`
- Click **Deploy**
- Note down the Invoke URL
  - e.g. `https://your-api-id.amazonaws.com/dev/add-resource`
  - e.g. `https://your-api-id.amazonaws.com/dev/get-resources`

### 7. Connect Frontend with API
- Open `scripts/add-resource.js` and replace:

```js
const API_URL = "https://your-api-id.amazonaws.com/dev/add-resource";
```
- Open `scripts/get-resources.js` and replace:

```js
const API_URL = "https://your-api-id.amazonaws.com/dev/get-resources";
```
- Re-upload both files to your S3 bucket

✅ Your site is now fully functional!

---

## 🚦 How the Architecture Works: Point-to-Point Flow

### 1. User Browser
- The user opens the website in their browser (served from S3).
- They can view resources or submit a new resource using simple HTML forms.

### 2. Amazon S3 (Static Website Hosting)
- S3 hosts and serves all static files: `index.html`, `add.html`, CSS, and JS.
- When the user loads the page, all frontend code is delivered from S3.

### 3. JavaScript Fetch Calls
- The frontend JS uses `fetch()` to send HTTP requests to the backend API.
- For adding a resource, it sends a **POST** request.
- For viewing resources, it sends a **GET** request.

### 4. Amazon API Gateway
- API Gateway receives the HTTP requests from the browser.
- It acts as a secure entry point, routing requests to the correct Lambda function.
- Handles CORS so browsers can communicate with the backend.

### 5. AWS Lambda Functions
- API Gateway triggers the appropriate Lambda function:
  - `addResource` for **POST** requests (adding a resource)
  - `getResources` for **GET** requests (listing resources)
- Lambda runs the backend code (Python) in a serverless environment.

### 6. Amazon DynamoDB
- Lambda interacts with DynamoDB:
  - `addResource` writes a new item to the `Resources` table.
  - `getResources` reads all items from the table.
- DynamoDB stores all resource data securely and scalably.

### 7. Response Flow
- Lambda returns the result to API Gateway.
- API Gateway sends the response back to the browser.
- The frontend JS updates the page (shows success message or displays resources in a table).

---

## 🔄 Visualized Request Flow

```
[User Browser]
   |   |
   |   |  (HTML/JS/CSS loaded from S3)
   v   v
[Amazon S3]
   |
   |  (JS fetch() request)
   v
[API Gateway]
   |
   |  (routes to Lambda)
   v
[AWS Lambda]
   |
   |  (reads/writes DynamoDB)
   v
[DynamoDB]
   |
   |  (response flows back)
   v
[User Browser]
```

---

## 📝 Example: Add Resource (POST)
1. User fills out the form in `add.html` and clicks Submit.
2. JS sends a POST request to `/add-resource` endpoint via API Gateway.
3. API Gateway triggers the `addResource` Lambda function.
4. Lambda writes the new resource to DynamoDB.
5. Lambda returns a success message to API Gateway.
6. API Gateway sends the response back to the browser.
7. User sees a confirmation message.

## 📝 Example: Get Resources (GET)
1. User opens `index.html`.
2. JS sends a GET request to `/get-resources` endpoint via API Gateway.
3. API Gateway triggers the `getResources` Lambda function.
4. Lambda reads all resources from DynamoDB.
5. Lambda returns the data to API Gateway.
6. API Gateway sends the data back to the browser.
7. JS displays the resources in an interactive table.

---

## 🧩 Why This Architecture?
- **Serverless**: No servers to manage, AWS handles scaling and uptime.
- **Secure**: API Gateway controls access, CORS is enabled for safe browser requests.
- **Scalable**: DynamoDB can handle large amounts of data and traffic.
- **Beginner-Friendly**: Only basic HTML, JS, and AWS services are used. No frameworks required.
- **Cost-Effective**: All services are within AWS Free Tier.

---

## 🧾 File Structure

```
project/
├── index.html                  # Homepage - lists resources in a table
├── add.html                    # Form to add new resources
├── styles/
│   └── style.css               # Dark theme and responsive design
└── scripts/
    ├── add-resource.js         # Handles form POST to API Gateway
    └── get-resources.js        # Fetches and displays data in a table
```

---

## ✨ Sample Output

Entries appear like this in the homepage table:

| Type  | Location   | Contact    | Description     | Timestamp          |
|-------|------------|------------|------------------|---------------------|
| food  | Hyderabad  | 1234567890 | Free food point  | 2025-08-05T09:30... |
| help  | Vizag      | 9876543210 | Volunteers ready | 2025-08-05T10:00... |

---

## 🔌 How Data Flows (POST & GET Requests)

- **Add Resource (POST)**
  - User fills form in `add.html`
  - JS sends POST request to `/add-resource` API Gateway endpoint
  - API Gateway triggers `addResource` Lambda
  - Lambda writes data to DynamoDB
  - Response sent back to browser

- **Get Resources (GET)**
  - `index.html` loads and JS sends GET request to `/get-resources` API Gateway endpoint
  - API Gateway triggers `getResources` Lambda
  - Lambda reads all items from DynamoDB
  - Data returned and displayed in interactive table

---

## 🧠 What You Learn

- Deploying frontend via **S3 Static Hosting**
- Using **API Gateway** to expose backend logic
- Writing **serverless functions** with **Lambda**
- CRUD operations with **DynamoDB**
- Managing **IAM Roles and Permissions**
- Solving **CORS** and frontend-backend integration

---

## 📦 Next Features You Can Add

- ✅ Filter by location or resource type
- ✅ “Mark Safe” button and SafeUsers table
- ✅ Admin-only delete/edit (with Cognito)
- ✅ Search box or sort feature in the table

---

## 👏 Credits

Built as part of a beginner-to-intermediate project challenge using **only AWS Free Tier**, with a goal of learning full-stack serverless deployment in a real-world context.

---

## 📜 Code Walkthroughs: JavaScript & Lambda Scripts

### 1. JavaScript: add-resource.js (Handles Form Submission)

```js
// This code runs when the user submits the form to add a new resource.
document.getElementById("resourceForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Stops the page from reloading when the form is submitted.
  // Collects all the data the user entered into the form fields.
  const data = Object.fromEntries(new FormData(e.target));
  // Sends the data to the backend using a POST request.
  const res = await fetch("https://your-api-id.amazonaws.com/dev/add-resource", {
    method: "POST", // Tells the server we want to add (POST) something.
    headers: {'Content-Type': 'application/json'}, // Says we're sending data in JSON format.
    body: JSON.stringify(data) // Converts the form data into a JSON string.
  });
  // Waits for the server to reply and turns the reply into a JavaScript object.
  const result = await res.json();
  // Shows a message to the user (like "Resource added!")
  alert(result.message);
});
```
**Step-by-step for beginners:**
- The code waits for the user to submit the form.
- It stops the page from reloading (so you stay on the same page).
- It grabs all the info you typed in (like type, location, contact, description).
- It sends that info to the backend server using a special web request (POST).
- The backend replies with a message, which pops up on your screen.

---

### 2. JavaScript: get-resources.js (Fetches and Displays Data)

```js
// This code runs when the homepage loads and shows all resources in a table.
async function loadResources() {
  // Asks the backend for all resources using a GET request.
  const res = await fetch("https://your-api-id.amazonaws.com/dev/get-resources");
  // Turns the reply from the backend into a JavaScript array.
  const items = await res.json();
  // Finds the part of the page where the table rows go.
  const tbody = document.querySelector("#resourcesTable tbody");
  tbody.innerHTML = ""; // Clears out any old rows.
  // For each resource, creates a new row in the table.
  items.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.type}</td>
      <td>${item.location}</td>
      <td>${item.contact}</td>
      <td>${item.description}</td>
      <td>${item.timestamp}</td>
    `;
    tbody.appendChild(row); // Adds the row to the table.
  });
}

window.onload = loadResources; // Runs the function when the page opens.
```
**Step-by-step for beginners:**
- When you open the homepage, the code asks the backend for all resources.
- The backend sends back a list of resources.
- The code puts each resource into a new row in the table so you can see them all.

---

### 3. Lambda: addResource (Python)

```python
import json, boto3, uuid, datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Resources')

def lambda_handler(event, context):
    body = json.loads(event['body']) # Gets the data sent from the frontend.
    item = {
        'id': str(uuid.uuid4()), # Makes a unique ID for the new resource.
        'type': body['type'], # Gets the type (food, shelter, etc.)
        'location': body['location'], # Gets the location.
        'contact': body['contact'], # Gets the contact info.
        'description': body['description'], # Gets the description.
        'timestamp': datetime.datetime.utcnow().isoformat() # Adds the current time.
    }
    table.put_item(Item=item) # Saves the new resource in the database.
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'}, # Lets browsers access the response.
        'body': json.dumps({'message': 'Resource added!'}) # Sends a success message back.
    }
```
**Step-by-step for beginners:**
- The function runs when someone submits a new resource.
- It gets all the info sent from the website.
- It creates a new resource with a unique ID and the current time.
- It saves the resource in the DynamoDB database.
- It sends a message back saying the resource was added.

---

### 4. Lambda: getResources (Python)

```python
import json, boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Resources')

def lambda_handler(event, context):
    response = table.scan() # Gets all resources from the database.
    items = response['Items'] # Makes a list of all resources.
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'}, # Lets browsers access the response.
        'body': json.dumps(items) # Sends all resources back as a list.
    }
```
**Step-by-step for beginners:**
- The function runs when the homepage asks for all resources.
- It gets all resources from the DynamoDB database.
- It sends the list of resources back to the website so they can be shown in the table.

---
