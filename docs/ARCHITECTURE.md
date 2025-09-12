# 🏗️ System Architecture

## **PS-3 ADO + BAS Architecture Overview**

---

## **High-Level Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Data Layer    │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (JSON)        │
│                 │    │                 │    │                 │
│ • UI Components │    │ • API Endpoints │    │ • Scenario Data │
│ • Charts        │    │ • Business Logic│    │ • Threat Intel  │
│ • State Mgmt    │    │ • Calculations  │    │ • Config        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## **Frontend Architecture (React)**

### **Component Structure**
```
App.tsx
├── AttackerBeliefs (Chart.js)
├── SimulationStatus
├── AttackerMind (Psychology)
├── MathematicalTransparency
├── AvailableActions
├── TurnLog
└── ExportButton
```

### **State Management**
- **React Hooks** for local state
- **useState** for component state
- **useEffect** for side effects
- **Custom hooks** for API calls

### **Key Technologies**
- **React 18** - UI framework
- **Chart.js** - Data visualization
- **TypeScript** - Type safety
- **Vite** - Build tool

---

## **Backend Architecture (FastAPI)**

### **API Layer**
```
main.py
├── CORS Middleware
├── Route Handlers
│   ├── /scenario
│   ├── /simulate_turn
│   ├── /optimize_deception
│   ├── /export_slide
│   └── /health
└── Error Handling
```

### **Business Logic Layer**
- **Bayesian Calculations** - Belief updates
- **ROI Optimization** - Best action selection
- **Game Theory** - Strategic analysis
- **Threat Modeling** - Risk assessment

### **Key Technologies**
- **FastAPI** - Web framework
- **Pydantic** - Data validation
- **Python 3.10+** - Runtime
- **Uvicorn** - ASGI server

---

## **Data Flow**

### **1. Initialization**
```
Frontend → GET /scenario → Backend → scenario.json
```

### **2. Simulation Turn**
```
Frontend → POST /simulate_turn → Backend → Calculations → Response
```

### **3. Optimization**
```
Frontend → POST /optimize_deception → Backend → AI Analysis → Response
```

### **4. Export**
```
Frontend → GET /export_slide → Backend → Data Aggregation → Response
```

---

## **Mathematical Models**

### **Bayesian Update**
```python
def calculate_bayesian_update(prior_beliefs, action, evidence):
    updated_beliefs = {}
    for threat_id in prior_beliefs:
        prior = prior_beliefs[threat_id]
        effectiveness = action.effectiveness[threat_id]
        evidence_strength = evidence[threat_id]
        
        numerator = effectiveness * prior
        denominator = numerator + (1 - effectiveness) * (1 - prior)
        
        updated_beliefs[threat_id] = numerator / denominator
    return updated_beliefs
```

### **Expected Loss Calculation**
```python
def calculate_expected_loss(beliefs, threats):
    total_loss = 0.0
    for threat in threats:
        probability = beliefs[threat.id]
        impact = threat.impact
        total_loss += probability * impact
    return total_loss
```

### **ROI Calculation**
```python
def calculate_roi(action, beliefs_before, beliefs_after, threats):
    cost = action.cost
    loss_before = calculate_expected_loss(beliefs_before, threats)
    loss_after = calculate_expected_loss(beliefs_after, threats)
    
    loss_reduction = loss_before - loss_after
    roi = (loss_reduction - cost) / cost
    return roi
```

---

## **Security Considerations**

### **Input Validation**
- **Pydantic models** for request validation
- **Type checking** for all inputs
- **Range validation** for probabilities
- **Sanitization** for all user inputs

### **CORS Configuration**
- **Restricted origins** (localhost only)
- **No credentials** in CORS
- **Specific headers** allowed

### **Error Handling**
- **Graceful degradation** on errors
- **No sensitive data** in error messages
- **Proper HTTP status codes**
- **Logging** for debugging

---

## **Performance Optimizations**

### **Frontend**
- **React.memo** for component optimization
- **useCallback** for function memoization
- **Lazy loading** for heavy components
- **Chart.js** for efficient rendering

### **Backend**
- **Async/await** for non-blocking operations
- **Caching** for scenario data
- **Efficient algorithms** for calculations
- **Minimal memory footprint**

---

## **Scalability Considerations**

### **Horizontal Scaling**
- **Stateless backend** - easy to scale
- **Load balancer** ready
- **Database abstraction** layer
- **Microservices** architecture

### **Vertical Scaling**
- **Memory efficient** algorithms
- **CPU optimized** calculations
- **I/O optimization** for data access
- **Resource monitoring** built-in

---

## **Deployment Architecture**

### **Development**
```
Local Machine
├── Frontend (localhost:5173)
├── Backend (localhost:8000)
└── Data (JSON files)
```

### **Production**
```
Load Balancer
├── Frontend (CDN)
├── Backend (Multiple instances)
└── Database (PostgreSQL)
```

---

## **Monitoring & Observability**

### **Health Checks**
- **API health** endpoint
- **Dependency checks**
- **Performance metrics**
- **Error tracking**

### **Logging**
- **Structured logging** (JSON)
- **Request/response** logging
- **Error logging** with stack traces
- **Performance** logging

---

## **Future Enhancements**

### **Phase 2**
- **Database integration** (PostgreSQL)
- **Authentication** (OAuth2)
- **Real-time updates** (WebSockets)
- **Advanced AI** (ML models)

### **Phase 3**
- **Multi-tenant** support
- **API versioning**
- **Advanced analytics**
- **Integration** with SIEMs

---

## **Technology Stack**

### **Frontend**
- React 18
- TypeScript
- Chart.js
- Vite
- CSS3

### **Backend**
- FastAPI
- Python 3.10+
- Pydantic
- Uvicorn

### **Data**
- JSON files
- In-memory caching
- Future: PostgreSQL

### **DevOps**
- Git
- GitHub Actions
- Docker (future)
- Kubernetes (future)
