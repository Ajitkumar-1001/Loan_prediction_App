# Admin Panel Setup Guide

## 🔐 Default Admin Credentials

### Login Details:
```
Email: admin@loanpredictor.com
Password: Admin@123
```

⚠️ **IMPORTANT**: Change the password after first login in production!

---

## 🚀 How to Access Admin Panel

### 1. **Start the Application**
```bash
# Using Docker
docker-compose up -d

# Or manually
cd loan_api
python init_admin.py  # Initialize admin user
uvicorn main:app --reload
```

### 2. **Login as Admin**
1. Go to http://localhost:8080 (or http://localhost:5173 for dev)
2. Click "Login"
3. Enter admin credentials
4. You'll be redirected to the chatbot

### 3. **Access Admin Panel**
1. In the chatbot page, you'll see a **⚙️ Settings icon** next to the header
2. Click it to open the Admin Panel
3. The panel will show:
   - Document upload section
   - List of uploaded documents

---

## 📤 Admin Features

### **Upload Documents**
- ✅ Supported formats: PDF, TXT, DOC, DOCX
- ✅ Documents are automatically processed and added to RAG knowledge base
- ✅ Chatbot will use uploaded documents to answer questions

### **Manage Documents**
- ✅ View all uploaded documents
- ✅ See file size, upload date, and uploader
- ✅ Delete documents

### **Chatbot Access**
- ✅ Admin can use chatbot normally
- ✅ Uploaded documents enhance chatbot responses

---

## 🔌 API Endpoints (Admin Only)

### **Upload Document**
```bash
curl -X POST http://localhost:8000/api/chatbot/upload-document \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

### **List Documents**
```bash
curl http://localhost:8000/api/chatbot/documents \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Delete Document**
```bash
curl -X DELETE http://localhost:8000/api/chatbot/documents/{document_id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔄 Initialize Admin User

### **Method 1: Auto-initialization (Recommended)**
The admin user is created automatically when you start the backend.

### **Method 2: Manual Script**
```bash
cd loan_api
python init_admin.py
```

### **Method 3: Custom Credentials**
Edit `loan_api/init_admin.py` and change:
```python
DEFAULT_ADMIN_EMAIL = "your-admin@email.com"
DEFAULT_ADMIN_PASSWORD = "YourPassword123"
```

Then run:
```bash
python init_admin.py
```

---

## 🧪 Testing the Admin Flow

### **Complete Test Flow:**

1. **Initialize Admin**
```bash
cd loan_api
python init_admin.py
```

2. **Start Backend**
```bash
uvicorn main:app --reload --port 8000
```

3. **Start Frontend**
```bash
cd frontend
npm run dev
```

4. **Login as Admin**
   - Navigate to http://localhost:5173
   - Login with admin credentials
   - Should redirect to chatbot

5. **Test Admin Panel**
   - Click ⚙️ icon in chatbot
   - Upload a test document (PDF or TXT)
   - Verify it appears in the list
   - Ask chatbot about the uploaded content
   - Try deleting the document

---

## 📋 Sample Test Document

Create a test file `banking_policy.txt`:
```
Sample Banking Policy

Loan Eligibility Criteria:
- Minimum age: 21 years
- Maximum age: 65 years
- Minimum annual income: $30,000
- Credit score minimum: 650
- Employment stability: 2 years minimum

Interest Rates 2024:
- Personal loans: 9.5% - 15% APR
- Home loans: 6.8% - 8.5% APR
- Auto loans: 7.2% - 11% APR

Documents Required:
- Government-issued ID
- Proof of income (3 months)
- Bank statements (6 months)
- Employment verification
```

Upload this and ask: "What is the minimum credit score for a loan?"

---

## 🔒 Security Notes

### **Admin Access Control:**
- ✅ All document endpoints require admin role
- ✅ JWT token authentication required
- ✅ Only users with `role="admin"` can access

### **Production Checklist:**
- [ ] Change default admin password
- [ ] Use environment variables for credentials
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Set up proper file size limits
- [ ] Configure secure file upload directory
- [ ] Add audit logging

---

## 🐛 Troubleshooting

### **Admin user not created?**
```bash
# Manually create
cd loan_api
python init_admin.py
```

### **Can't see admin panel?**
- Check role in localStorage: `localStorage.getItem('user_role')`
- Should return "admin"
- Try logging out and in again

### **File upload fails?**
- Check file size (default max: 50MB)
- Verify file format (PDF, TXT, DOC, DOCX only)
- Check backend logs for errors
- Ensure `Rag_files/uploaded_documents` directory exists

### **Documents not appearing in chat?**
- Documents are processed into ChromaDB
- May take a few seconds to index
- Restart chatbot session to ensure latest data

---

## 📁 File Structure

```
loan_predictor_app/
├── loan_api/
│   ├── init_admin.py          # Admin initialization script
│   ├── routers/
│   │   └── chatbot.py         # Document upload endpoints
│   └── main.py                # Auto-creates admin on startup
│
├── Rag_files/
│   ├── uploaded_documents/    # Uploaded files stored here
│   └── chroma_db/            # Vector database
│
└── frontend/
    └── src/assets/pages/
        └── Chatbot.tsx        # Admin UI
```

---

## ✅ Complete Feature List

### **Admin Panel Features:**
✅ Role-based access control
✅ Document upload (PDF, TXT, DOC, DOCX)
✅ Document listing with metadata
✅ Document deletion
✅ Automatic RAG knowledge base update
✅ Real-time document processing
✅ Beautiful admin UI

### **User Features:**
✅ Regular chatbot access
✅ Benefits from admin-uploaded documents
✅ No admin features visible

---

## 🎯 Next Steps

1. **Test the admin flow**
2. **Upload sample documents**
3. **Verify chatbot uses uploaded content**
4. **Change default password**
5. **Deploy to production**
