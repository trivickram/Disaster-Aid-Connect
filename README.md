# 🆘 Disaster Aid Connect (AWS Free Tier Project)

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
// Listen for form submission
document.getElementById("resourceForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevents default form reload
  const data = Object.fromEntries(new FormData(e.target)); // Collects form data into an object
  const res = await fetch("https://your-api-id.amazonaws.com/dev/add-resource", {
    method: "POST", // HTTP POST request
    headers: {'Content-Type': 'application/json'}, // Tells server to expect JSON
    body: JSON.stringify(data) // Converts form data to JSON string
  });
  const result = await res.json(); // Parses JSON response
  alert(result.message); // Shows success message to user
});
```
**Explanation:**
- Adds an event listener to the form.
- Prevents page reload on submit.
- Collects all form fields into a JS object.
- Sends a POST request to the API Gateway endpoint with the form data as JSON.
- Waits for the response, parses it, and shows a message to the user.

---

### 2. JavaScript: get-resources.js (Fetches and Displays Data)

```js
// Fetch resources from API and display in table
async function loadResources() {
  const res = await fetch("https://your-api-id.amazonaws.com/dev/get-resources"); // GET request to API
  const items = await res.json(); // Parse JSON response
  const tbody = document.querySelector("#resourcesTable tbody"); // Find table body
  tbody.innerHTML = ""; // Clear previous rows
  items.forEach(item => {
    const row = document.createElement("tr"); // Create new table row
    row.innerHTML = `
      <td>${item.type}</td>
      <td>${item.location}</td>
      <td>${item.contact}</td>
      <td>${item.description}</td>
      <td>${item.timestamp}</td>
    `;
    tbody.appendChild(row); // Add row to table
  });
}

window.onload = loadResources; // Load resources when page opens
```
**Explanation:**
- Defines a function to fetch resources from the API.
- Parses the JSON response.
- Clears the table and adds a row for each resource.
- Runs automatically when the page loads.

---

### 3. Lambda: addResource (Python)

```python
import json, boto3, uuid, datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Resources')

def lambda_handler(event, context):
    body = json.loads(event['body']) # Parse incoming JSON
    item = {
        'id': str(uuid.uuid4()), # Unique ID for each resource
        'type': body['type'],
        'location': body['location'],
        'contact': body['contact'],
        'description': body['description'],
        'timestamp': datetime.datetime.utcnow().isoformat() # Current UTC time
    }
    table.put_item(Item=item) # Save item to DynamoDB
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'}, # Allow browser requests
        'body': json.dumps({'message': 'Resource added!'}) # Success message
    }
```
**Explanation:**
- Imports required libraries.
- Connects to DynamoDB and selects the table.
- Parses the incoming request body.
- Creates a new resource item with a unique ID and timestamp.
- Saves the item to DynamoDB.
- Returns a success message and CORS headers.

---

### 4. Lambda: getResources (Python)

```python
import json, boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Resources')

def lambda_handler(event, context):
    response = table.scan() # Reads all items from table
    items = response['Items'] # Gets the list of resources
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'}, # Allow browser requests
        'body': json.dumps(items) # Returns all resources as JSON
    }
```
**Explanation:**
- Imports required libraries.
- Connects to DynamoDB and selects the table.
- Scans the table to get all resources.
- Returns the list of resources and CORS headers.

---
