import React, { useEffect, useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js"
import { Doughnut, Bar } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"

interface Scenario {
  title: string
  description: string
  assets: Array<{
    id: string
    name: string
    value: number
    vulnerability: string
  }>
  threats: Array<{
    id: string
    name: string
    probability: number
    impact: number
    description: string
  }>
  actions: Array<{
    id: string
    name: string
    cost: number
    description: string
    effectiveness: Record<string, number>
  }>
  attacker_profile: {
    sophistication: string
    persistence: string
    resources: string
    motivation: string
  }
}

interface AttackerMind {
  sophistication: string
  current_focus: string
  decision_factors: string[]
  psychological_state: string
}

interface SimulationResult {
  updated_beliefs: Record<string, number>
  expected_loss_before: number
  expected_loss_after: number
  roi: number
  rationale_summary: string
  action_taken: any
  evidence: Record<string, number>
}

const App: React.FC = () => {
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [beliefs, setBeliefs] = useState<Record<string, number>>({})
  const [turn, setTurn] = useState(0)
  const [log, setLog] = useState<string[]>([])
  const [expectedLoss, setExpectedLoss] = useState<number>(0)
  const [simulationHistory, setSimulationHistory] = useState<SimulationResult[]>([])
  const [showFormulas, setShowFormulas] = useState(false)
  const [attackerMind, setAttackerMind] = useState<AttackerMind | null>(null)
  const [optimizationResult, setOptimizationResult] = useState<any>(null)
  const [showAssumptions, setShowAssumptions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const normalize = (b: Record<string, number>) => {
      const sum = Object.values(b).reduce((a, c) => a + c, 0)
      if (sum <= 0) return b
      const normalized: Record<string, number> = {}
      Object.entries(b).forEach(([k, v]) => { normalized[k] = Math.max(0, v) / sum })
      return normalized
    }

    const loadScenario = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API}/scenario`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: Scenario = await response.json()
        setScenario(data)
        setBeliefs(normalize({"H1": 0.6, "H2": 0.25, "H3": 0.15}))
        
        // Initialize attacker mind state
        setAttackerMind({
          sophistication: data.attacker_profile?.sophistication || "High",
          current_focus: "Database Exfiltration",
          decision_factors: ["Asset Value", "Detection Difficulty", "Success Probability"],
          psychological_state: "Calculating optimal attack vector"
        })
      } catch (err) {
        // Offline fallback: load baked-in scenario from public
        console.error('Error loading scenario:', err)
        try {
          const res = await fetch('/scenario.json')
          if (!res.ok) throw new Error(`offline scenario fetch failed: ${res.status}`)
          const data = await res.json()
          setScenario(data)
          setBeliefs(normalize({"H1": 0.6, "H2": 0.25, "H3": 0.15}))
          setError(null)
        } catch (e) {
          setError(err instanceof Error ? err.message : 'Failed to load scenario')
        }
      } finally {
        setLoading(false)
      }
    }

    loadScenario()
  }, [])

  const onAction = async (actionId: string) => {
    if (!scenario) {
      setError('No scenario loaded')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API}/simulate_turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": (import.meta as any).env?.VITE_DEMO_API_KEY || '' },
        body: JSON.stringify({ chosen_action_id: actionId, current_beliefs: beliefs }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SimulationResult = await response.json()
      
      const action = scenario.actions.find((a) => a.id === actionId)
      if (!action) {
        throw new Error('Action not found')
      }

      const historyEntry: SimulationResult = {
        turn: turn + 1,
        action: action.name,
        cost: action.cost,
        beliefsBefore: {...beliefs},
        beliefsAfter: data.updated_beliefs,
        expectedLossBefore: data.expected_loss_before,
        expectedLossAfter: data.expected_loss_after,
        roi: data.roi,
        rationale: data.rationale_summary
      }
      
      // Normalize on FE as well
      const sum = Object.values(data.updated_beliefs || {}).reduce((a: number, c: number) => a + c, 0)
      const normalized = sum > 0 ? Object.fromEntries(Object.entries(data.updated_beliefs).map(([k, v]) => [k, v / sum])) : data.updated_beliefs
      setBeliefs(normalized)
      setExpectedLoss(data.expected_loss_after)
      setTurn(t => t + 1)
      setLog(l => [`Turn ${turn + 1}: ${action.name} (ROI=${data.roi?.toFixed(2)})`, ...l])
      setSimulationHistory(h => [historyEntry, ...h])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed'
      setError(errorMessage)
      setLog(l => [`Action failed: ${errorMessage}`, ...l])
      console.error('Error executing action:', err)
    } finally {
      setLoading(false)
    }
  }

  const optimizeDefense = async () => {
    try {
      const res = await fetch(`${API}/optimize_deception`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_beliefs: beliefs, available_budget: 100 }),
      })
      const data = await res.json()
      setOptimizationResult(data)
      setLog(l => [`AI Optimization: Best action is ${data.best_action?.name} (ROI=${data.analysis?.roi?.toFixed(2)})`, ...l])
    } catch (e) {
      setLog(l => [`Optimization failed: ${String(e)}`, ...l])
    }
  }

  const resetSimulation = () => {
    setBeliefs({"H1": 0.6, "H2": 0.25, "H3": 0.15})
    setTurn(0)
    setLog([])
    setExpectedLoss(0)
    setSimulationHistory([])
    setOptimizationResult(null)
    setAttackerMind({
      sophistication: "High",
      current_focus: "Database Exfiltration",
      decision_factors: ["Asset Value", "Detection Difficulty", "Success Probability"],
      psychological_state: "Calculating optimal attack vector"
    })
  }

  const exportToPDF = () => {
    const element = document.getElementById('export-content')
    if (!element) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PS-3 Simulation Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .beliefs { display: flex; justify-content: space-around; margin: 20px 0; }
          .belief-item { text-align: center; }
          .history-table { width: 100%; border-collapse: collapse; }
          .history-table th, .history-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); 
                      font-size: 48px; color: rgba(0,0,0,0.1); z-index: -1; }
        </style>
      </head>
      <body>
        <div class="watermark">PS-3 PROTOTYPE</div>
        <div class="header">
          <h1> Adaptive Deception Orchestrator (ADO) + Bayesian Adversary Simulator (BAS)</h1>
          <h2>Simulation Export Report</h2>
          <p><strong>Scenario:</strong> ${scenario?.title || 'N/A'}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="section">
          <h3>Final Attacker Beliefs</h3>
          <div class="beliefs">
            <div class="belief-item">
              <strong>Database Exfiltration (H1)</strong><br>
              ${(beliefs.H1 || 0).toFixed(3)}
            </div>
            <div class="belief-item">
              <strong>Mailbox Takeover (H2)</strong><br>
              ${(beliefs.H2 || 0).toFixed(3)}
            </div>
            <div class="belief-item">
              <strong>Web Defacement (H3)</strong><br>
              ${(beliefs.H3 || 0).toFixed(3)}
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Simulation Summary</h3>
          <p><strong>Total Turns:</strong> ${turn}</p>
          <p><strong>Final Expected Loss:</strong> $${expectedLoss.toFixed(2)}</p>
          <p><strong>Total Actions Taken:</strong> ${simulationHistory.length}</p>
          <p><strong>Beliefs Sum:</strong> ${((beliefs.H1||0)+(beliefs.H2||0)+(beliefs.H3||0)).toFixed(3)}</p>
        </div>

        <div class="section">
          <h3>Action History</h3>
          <table class="history-table">
            <thead>
              <tr>
                <th>Turn</th>
                <th>Action</th>
                <th>Cost</th>
                <th>ROI</th>
                <th>Expected Loss Before</th>
                <th>Expected Loss After</th>
                <th>Rationale</th>
              </tr>
            </thead>
            <tbody>
              ${simulationHistory.map(entry => `
                <tr>
                  <td>${entry.turn}</td>
                  <td>${entry.action}</td>
                  <td>$${entry.cost}</td>
                  <td>${entry.roi.toFixed(2)}</td>
                  <td>$${entry.expectedLossBefore.toFixed(2)}</td>
                  <td>$${entry.expectedLossAfter.toFixed(2)}</td>
                  <td>${entry.rationale}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="section">
          <h3>ROI Inputs</h3>
          <p>ROI = (Loss_Reduction - Cost) / Cost</p>
          <ul>
            ${simulationHistory.slice(0,1).map(entry => `
              <li>First action inputs: loss_before=$${entry.expectedLossBefore.toFixed(2)}, loss_after=$${entry.expectedLossAfter.toFixed(2)}, cost=$${entry.cost}</li>
            `).join('')}
          </ul>
        </div>

        <div class="section">
          <h3>Assumptions & Methodology</h3>
          <ul>
            <li>Bayesian inference used for belief updates</li>
            <li>Expected loss calculated using asset values and compromise probabilities</li>
            <li>ROI = (Loss Before - Loss After - Cost) / Cost</li>
            <li>Defense effects applied as risk multipliers</li>
            <li>Simulation limited to 3 turns for demonstration</li>
          </ul>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.print()
  }

  const actions = scenario?.actions ?? []
  const disabled = turn >= 3 || !scenario

  const beliefData = {
    labels: ["Database Exfiltration", "Mailbox Takeover", "Web Defacement"],
    datasets: [{
      data: [beliefs.H1 || 0, beliefs.H2 || 0, beliefs.H3 || 0],
      backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"],
      borderWidth: 2,
      borderColor: "#fff"
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Attacker Belief Distribution"
      }
    }
  }

  // Loading state
  if (loading && !scenario) {
    return (
      <div style={{ 
        fontFamily: "Inter, system-ui, Arial", 
        padding: 20, 
        maxWidth: 1200, 
        margin: "0 auto",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          background: "white",
          borderRadius: 12,
          padding: 40,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: 16 }}>🔄</div>
          <h2 style={{ color: "#2d3748", marginBottom: 8 }}>Loading PS-3 ADO + BAS</h2>
          <p style={{ color: "#4a5568" }}>Initializing threat intelligence and simulation engine...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !scenario) {
    return (
      <div style={{ 
        fontFamily: "Inter, system-ui, Arial", 
        padding: 20, 
        maxWidth: 1200, 
        margin: "0 auto",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          background: "white",
          borderRadius: 12,
          padding: 40,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: 16 }}>❌</div>
          <h2 style={{ color: "#e53e3e", marginBottom: 8 }}>Connection Error</h2>
          <p style={{ color: "#4a5568", marginBottom: 16 }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      fontFamily: "Inter, system-ui, Arial", 
      padding: 20, 
      maxWidth: 1200, 
      margin: "0 auto",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh"
    }}>
      <div id="export-content" style={{
        background: "white",
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ 
          textAlign: "center", 
          color: "#2d3748", 
          marginBottom: 8,
          fontSize: "2.5rem",
          fontWeight: "bold"
        }}>
           Adaptive Deception Orchestrator (ADO) + Bayesian Adversary Simulator (BAS)
        </h1>
        
        <p style={{ 
          textAlign: "center", 
          color: "#4a5568", 
          fontSize: "1.2rem",
          marginBottom: 32
        }}>
          <strong>Scenario:</strong> {scenario?.title ?? "Loading..."}
        </p>

        {/* Error Display */}
        {error && (
          <div style={{
            background: "#fed7d7",
            border: "1px solid #feb2b2",
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            color: "#c53030"
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <div>
            <h3 style={{ color: "#2d3748", marginBottom: 16 }}> Attacker Beliefs</h3>
            <div style={{ height: 300 }}>
              <Doughnut data={beliefData} options={options} />
            </div>
            <div style={{ marginTop: 16, fontSize: "0.9rem", color: "#4a5568" }}>
              <div>H1 (Database): {(beliefs.H1 || 0).toFixed(3)}</div>
              <div>H2 (Mailbox): {(beliefs.H2 || 0).toFixed(3)}</div>
              <div>H3 (Web): {(beliefs.H3 || 0).toFixed(3)}</div>
              <div style={{ marginTop: 8, fontWeight: 600 }}>Σ beliefs: {((beliefs.H1||0)+(beliefs.H2||0)+(beliefs.H3||0)).toFixed(3)}</div>
            </div>
          </div>
          
          <div>
            <h3 style={{ color: "#2d3748", marginBottom: 16 }}> Simulation Status</h3>
            <div style={{ 
              background: "#f7fafc", 
              padding: 20, 
              borderRadius: 8,
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ marginBottom: 12 }}>
                <strong>Turn:</strong> {turn + 1} of 3
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Expected Loss:</strong> ${expectedLoss.toFixed(2)}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Actions Available:</strong> {actions.length}
              </div>
              <div style={{ 
                background: turn >= 3 ? "#fed7d7" : "#c6f6d5", 
                padding: 8, 
                borderRadius: 4,
                textAlign: "center",
                fontWeight: "bold",
                color: turn >= 3 ? "#c53030" : "#2f855a"
              }}>
                {turn >= 3 ? " Simulation Complete!" : " Simulation Active"}
              </div>
              {error && (
                <div style={{ marginTop: 8, background: "#fff3cd", color: "#856404", padding: 8, borderRadius: 4, textAlign: "center" }}>
                  Offline Mode: using local scenario
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NEW: Attacker's Mind Visualization */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ color: "#2d3748", marginBottom: 16 }}>🧠 Attacker's Mind (Real-time Analysis)</h3>
          <div style={{ 
            background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)", 
            padding: 20, 
            borderRadius: 12,
            color: "white",
            boxShadow: "0 8px 25px rgba(255, 107, 107, 0.3)"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>Current Focus</h4>
                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
                  {attackerMind?.current_focus || "Analyzing targets..."}
                </p>
              </div>
              <div>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>Sophistication Level</h4>
                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
                  {attackerMind?.sophistication || "High"}
                </p>
              </div>
              <div>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>Psychological State</h4>
                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
                  {attackerMind?.psychological_state || "Calculating..."}
                </p>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: 12, background: "rgba(255,255,255,0.1)", borderRadius: 8 }}>
              <strong>Decision Factors:</strong> {attackerMind?.decision_factors?.join(", ") || "Asset Value, Detection Difficulty, Success Probability"}
            </div>
          </div>
        </div>

        {/* NEW: Mathematical Transparency Panel */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: "#2d3748", margin: 0 }}>📊 Mathematical Transparency</h3>
            <div>
              <button 
                onClick={() => setShowFormulas(!showFormulas)}
                style={{
                  padding: "8px 16px",
                  marginRight: 8,
                  borderRadius: 6,
                  border: "1px solid #667eea",
                  background: showFormulas ? "#667eea" : "white",
                  color: showFormulas ? "white" : "#667eea",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                {showFormulas ? "Hide" : "Show"} Formulas
              </button>
              <button 
                onClick={() => setShowAssumptions(!showAssumptions)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid #48bb78",
                  background: showAssumptions ? "#48bb78" : "white",
                  color: showAssumptions ? "white" : "#48bb78",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                {showAssumptions ? "Hide" : "Show"} Assumptions
              </button>
            </div>
          </div>
          
          {showFormulas && (
            <div style={{ 
              background: "#f8f9fa", 
              padding: 20, 
              borderRadius: 8,
              border: "1px solid #e9ecef",
              marginBottom: 16
            }}>
              <h4 style={{ color: "#495057", marginBottom: 12 }}>Core Mathematical Formulas</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <strong>Bayesian Update:</strong>
                  <div style={{ fontFamily: "monospace", fontSize: "0.9rem", marginTop: 4, padding: 8, background: "white", borderRadius: 4 }}>
                    P(H|E) = P(E|H) × P(H) / P(E)
                  </div>
                </div>
                <div>
                  <strong>Expected Loss:</strong>
                  <div style={{ fontFamily: "monospace", fontSize: "0.9rem", marginTop: 4, padding: 8, background: "white", borderRadius: 4 }}>
                    E[L] = Σ P(Threat_i) × Impact_i
                  </div>
                </div>
                <div>
                  <strong>ROI Calculation:</strong>
                  <div style={{ fontFamily: "monospace", fontSize: "0.9rem", marginTop: 4, padding: 8, background: "white", borderRadius: 4 }}>
                    ROI = (Loss_Reduction - Cost) / Cost
                  </div>
                </div>
              </div>
            </div>
          )}

          {showAssumptions && (
            <div style={{ 
              background: "#fff3cd", 
              padding: 20, 
              borderRadius: 8,
              border: "1px solid #ffeaa7"
            }}>
              <h4 style={{ color: "#856404", marginBottom: 12 }}>Key Assumptions & Limitations</h4>
              <ul style={{ margin: 0, paddingLeft: 20, color: "#856404" }}>
                <li>Bayesian inference assumes threat probabilities are independent</li>
                <li>Action effectiveness based on historical data and expert assessment</li>
                <li>Attacker behavior follows rational decision-making patterns</li>
                <li>Defense actions have immediate and lasting effects</li>
                <li>Asset values are static throughout simulation</li>
                <li>No external factors (market changes, new vulnerabilities) considered</li>
              </ul>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: "#2d3748", margin: 0 }}> Available Actions</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                onClick={optimizeDefense}
                disabled={disabled}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid #9f7aea",
                  background: disabled ? "#e2e8f0" : "linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)",
                  color: disabled ? "#a0aec0" : "white",
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "bold"
                }}
              >
                🔒🤖 AI Optimize
              </button>
              <button 
                onClick={resetSimulation}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid #e53e3e",
                  background: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "bold"
                }}
              >
                🔄 Reset
              </button>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <button onClick={() => onAction('patch_db')} disabled={disabled || loading} style={{ padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>Demo Turn 1: Patch DB</button>
            <button onClick={() => onAction('auth_logs')} disabled={disabled || loading} style={{ padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>Demo Turn 2: Monitor Auth</button>
            <button onClick={() => onAction('web_honeypot')} disabled={disabled || loading} style={{ padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>Demo Turn 3: Honeypot</button>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {actions.map(a => (
              <button 
                key={a.id} 
                onClick={() => onAction(a.id)} 
                disabled={disabled || loading}
                style={{ 
                  padding: "12px 24px",
                  borderRadius: 8,
                  border: "none",
                  background: (disabled || loading) ? "#e2e8f0" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: (disabled || loading) ? "#a0aec0" : "white",
                  fontWeight: "bold",
                  cursor: (disabled || loading) ? "not-allowed" : "pointer",
                  boxShadow: (disabled || loading) ? "none" : "0 4px 12px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.2s",
                  fontSize: "1rem",
                  position: "relative"
                }}
                onMouseOver={(e) => {
                  if (!disabled && !loading) {
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.6)"
                  }
                }}
                onMouseOut={(e) => {
                  if (!disabled && !loading) {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)"
                  }
                }}
              >
                {loading ? "⏳ Processing..." : `🔒 ${a.name} ($${a.cost})`}
              </button>
            ))}
          </div>

          {/* AI Optimization Results */}
          {optimizationResult && (
            <div style={{ 
              marginTop: 16, 
              padding: 16, 
              background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)", 
              borderRadius: 8,
              color: "white"
            }}>
              <h4 style={{ margin: "0 0 8px 0" }}>🤖 AI Optimization Result</h4>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                <strong>Recommended Action:</strong> {optimizationResult.best_action?.name} 
                <br />
                <strong>Expected ROI:</strong> {optimizationResult.analysis?.roi?.toFixed(2)}
                <br />
                <strong>Loss Reduction:</strong> ${optimizationResult.analysis?.expected_loss_reduction?.toFixed(2)}
                <br />
                <strong>Inputs:</strong> loss_before={optimizationResult.analysis?.loss_before?.toFixed?.(2) || 'n/a'}, loss_after={optimizationResult.analysis?.loss_after?.toFixed?.(2) || 'n/a'}, cost={optimizationResult.best_action?.cost}
              </p>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 32 }}>
          <h3 style={{ color: "#2d3748", marginBottom: 16 }}> Turn Log</h3>
          <div style={{ 
            background: "#f7fafc", 
            padding: 16, 
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            maxHeight: 200,
            overflowY: "auto"
          }}>
            {log.length === 0 ? (
              <div style={{ color: "#a0aec0", fontStyle: "italic" }}>No actions taken yet...</div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {log.map((line, idx) => (
                  <li key={idx} style={{ marginBottom: 8, color: "#4a5568" }}>
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button 
            onClick={exportToPDF}
            style={{
              padding: "16px 32px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(72, 187, 120, 0.4)",
              fontSize: "1.1rem",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)"
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(72, 187, 120, 0.6)"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(72, 187, 120, 0.4)"
            }}
          >
             Export Simulation Report (PDF)
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
