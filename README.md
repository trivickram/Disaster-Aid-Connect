
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

## 🛠️ AWS Setup Guide

### 1. Create a DynamoDB Table

- **Service**: DynamoDB
- **Table Name**: `Resources` (case-sensitive)
- **Primary key**: `id` (String)

### 2. Create Two Lambda Functions

#### a. `addResource`

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

Attach IAM policy: `AmazonDynamoDBFullAccess`

---

#### b. `getResources`

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

Attach IAM policy: `AmazonDynamoDBReadOnlyAccess`

---

### 3. Create API Gateway (REST API)

- Create new REST API: `DisasterAidAPI`
- Add **/add-resource** (POST) → Lambda: `addResource`
- Add **/get-resources** (GET) → Lambda: `getResources`
- Enable **CORS** for both methods
- Deploy the API to stage: `dev`
- Note the base URL (e.g. `https://your-id.execute-api.region.amazonaws.com/dev`)

---

### 4. Setup S3 for Static Website Hosting

- Create bucket: `disaster-aid`
- Disable "Block all public access"
- Enable **Static Website Hosting**
- Set `index.html` as main page
- Upload:
  - `index.html`
  - `add.html`
  - `scripts/add-resource.js`
  - `scripts/get-resources.js`
  - `styles/style.css`

Update JS files with the correct API Gateway URLs.

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

- Entries appear like this in the homepage table:

| Type  | Location   | Contact    | Description     | Timestamp          |
|-------|------------|------------|------------------|---------------------|
| food  | Hyderabad  | 1234567890 | Free food point  | 2025-08-05T09:30... |
| help  | Vizag      | 9876543210 | Volunteers ready | 2025-08-05T10:00... |

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
