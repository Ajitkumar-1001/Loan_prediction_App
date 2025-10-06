# Network Access Fix - Smart Loan Predictor

## Issue Summary
Getting 404 errors when accessing login/signup from another device on the same network.

## Root Causes Identified

### 1. CORS Configuration ✅ FIXED
**File**: `loan_api/main.py`
**Issue**: Backend was blocking requests from non-localhost origins
**Fix**: Changed `allow_origins` from specific localhost URLs to `["*"]`

### 2. Nginx Proxy Configuration ✅ FIXED
**File**: `frontend/nginx.conf`
**Issue**: Line 26 had `proxy_pass http://backend:8000/` which strips the `/api/` prefix
**Fix**: Changed to `proxy_pass http://backend:8000/api/` to preserve the full path

### 3. Frontend API Calls ✅ FIXED
**Files**:
- `frontend/src/assets/pages/Loginpage.tsx` (Line 91)
- `frontend/src/assets/pages/Signup.tsx` (Line 111)
- `frontend/src/utils/api.ts` (Line 5) - **CRITICAL FIX FOR ALL APIs**

**Issue**: Hardcoded `http://localhost:8000` in multiple places
**Fix**:
- Login/Signup: Now uses `import.meta.env.VITE_API_URL || window.location.origin`
- **Secure API Utils**: Changed `getApiBaseUrl()` from `'http://localhost:8000'` to `window.location.origin`
- **This fixes ALL API calls**: Chatbot, Predict, Admin Panel, Document Upload, etc.

## How to Apply the Fixes

### Step 1: Rebuild Docker Containers

```bash
# Stop all containers
docker-compose down

# Rebuild with the updated code
docker-compose build

# Start all services
docker-compose up -d
```

### Step 2: Verify Services are Running

```bash
# Check all containers are up
docker-compose ps

# Should show all containers as "Up"
```

### Step 3: Find Your IP Address

```bash
# On Linux/Mac
hostname -I | awk '{print $1}'

# Or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Step 4: Access from Other Devices

From your friend's computer on the same network, access:
- **Frontend**: `http://YOUR_IP:8080` (e.g., `http://192.168.1.100:8080`)
- **Backend**: `http://YOUR_IP:8000`

## Testing the Fix

### Test 1: Backend Health Check
```bash
# From your machine
curl http://localhost:8000/api/chatbot/health

# From friend's machine (replace with your IP)
curl http://192.168.1.100:8000/api/chatbot/health
```

Both should return: `{"status":"healthy"}`

### Test 2: Login/Signup
1. Open browser on friend's machine
2. Go to `http://YOUR_IP:8080`
3. Click "Sign up" or "Login"
4. Enter credentials
5. Should work without 404 errors

## Troubleshooting

### If Still Getting 404 Errors

**Check 1: Verify nginx config was updated**
```bash
docker exec smartloanpred-frontend cat /etc/nginx/nginx.conf | grep proxy_pass
```
Should show: `proxy_pass http://backend:8000/api/;`

**Check 2: Verify backend CORS**
```bash
docker logs smartloanpred-backend | grep CORS
```

**Check 3: Test direct backend access**
```bash
# From friend's machine
curl -X POST http://YOUR_IP:8000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Check 4: Rebuild frontend specifically**
```bash
docker-compose build frontend
docker-compose up -d frontend
```

### If Firewall Issues

**Linux (ufw)**
```bash
sudo ufw allow 8080/tcp
sudo ufw allow 8000/tcp
sudo ufw allow 80/tcp
```

**Mac**
Go to System Preferences → Security & Privacy → Firewall → Firewall Options
Allow incoming connections for Docker

**Windows**
Windows Defender Firewall → Advanced Settings → Inbound Rules
Create rules for ports 80, 8000, 8080

### Check Browser Console

Open Developer Tools (F12) → Network Tab
- Check if requests are going to the correct URL
- Look for actual error responses
- Check request/response headers

## Expected Behavior After Fix

✅ Login page accessible from network
✅ Signup page accessible from network
✅ API calls go to `http://YOUR_IP:8080/api/user/login`
✅ Nginx proxies to `http://backend:8000/api/user/login`
✅ Backend processes request successfully
✅ JWT token returned and stored
✅ User redirected to predict page

## Files Modified

1. `loan_api/main.py` - Line 19: CORS allow_origins
2. `frontend/nginx.conf` - Line 26: proxy_pass URL
3. `frontend/src/assets/pages/Loginpage.tsx` - Line 91: Dynamic API URL
4. `frontend/src/assets/pages/Signup.tsx` - Line 111: Dynamic API URL
5. `DOCKER_SETUP.md` - Added network access documentation

## Quick Command Summary

```bash
# Apply all fixes
cd /Users/ajit/Desktop/loan_predictor_app
docker-compose down
docker-compose build
docker-compose up -d

# Verify
docker-compose ps
curl http://localhost:8000/api/chatbot/health

# Get your IP
hostname -I | awk '{print $1}'

# Share with friend: http://YOUR_IP:8080
```

## Security Notes

⚠️ **For Development/Testing Only**
- CORS is set to allow all origins (`allow_origins=["*"]`)
- Only use on trusted networks
- For production, restrict CORS to specific domains
- Enable HTTPS for production deployments

## Support

If issues persist:
1. Check Docker logs: `docker-compose logs -f backend`
2. Check nginx logs: `docker-compose logs -f frontend`
3. Verify network connectivity: `ping YOUR_IP` from friend's machine
4. Ensure all containers are healthy: `docker-compose ps`
