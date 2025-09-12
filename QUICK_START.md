# 🚀 QUICK START GUIDE
## **PS-3 ADO + BAS - Get Running in 2 Minutes**

---

## **⚡ SUPER QUICK START (Windows)**

### **Step 1: Start Backend**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

### **Step 2: Start Frontend (New Terminal)**
```powershell
cd frontend
npm install
npm run dev
```

### **Step 3: Open Application**
```
http://localhost:5173
```

---

## **🔧 TROUBLESHOOTING**

### **Backend Issues:**
- **Port 8000 in use?** → Change port in `main.py` line 400+
- **Python not found?** → Install Python 3.10+ from python.org
- **Module not found?** → Run `pip install -r requirements.txt`

### **Frontend Issues:**
- **Port 5173 in use?** → Change port in `vite.config.ts`
- **Node not found?** → Install Node.js 18+ from nodejs.org
- **Module not found?** → Run `npm install`

### **Connection Issues:**
- **Backend not responding?** → Check if backend is running on port 8000
- **CORS errors?** → Ensure backend allows localhost:5173
- **API errors?** → Check browser console for details

---

## **✅ HEALTH CHECK**

Run this command to verify everything is working:
```powershell
powershell -ExecutionPolicy Bypass -File demo_healthcheck.ps1
```

**Expected Output:**
```
✅ Backend API: RUNNING
✅ Frontend: RUNNING
✅ All endpoints: WORKING
✅ DEMO READY!
```

---

## **🎯 DEMO FLOW**

1. **Open** http://localhost:5173
2. **Wait** for scenario to load
3. **Click** "Patch DB vuln" action
4. **Click** "Enable verbose auth logs" action  
5. **Click** "Deploy web honeypot placeholder" action
6. **Click** "Export Simulation Report (PDF)" button
7. **Show** the belief changes and ROI calculations

---

## **📞 SUPPORT**

If you encounter issues:
1. Check the troubleshooting section above
2. Run the health check script
3. Check the browser console for errors
4. Ensure both backend and frontend are running

---

**🏆 Ready to revolutionize cyber defense!** 🚀
