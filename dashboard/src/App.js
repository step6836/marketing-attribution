import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AttributionDashboard() {
  // ========== ALL STATE DECLARATIONS ==========
  const [selectedScenario, setSelectedScenario] = useState('recommended');
  const [activeSection, setActiveSection] = useState('summary');
  const [compareMode, setCompareMode] = useState(false);
  const [customViewBudget, setCustomViewBudget] = useState(2750000);
  const [customCartBudget, setCustomCartBudget] = useState(2250000);
  const [animateJourney, setAnimateJourney] = useState(false);
  const [countUpRevenue, setCountUpRevenue] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========== ALL useEffect HOOKS (MUST COME BEFORE ANY RETURNS) ==========
  
  // Load data from JSON
  useEffect(() => {
    console.log('🔄 Loading attribution data...');
    
    fetch('/data/attribution-results.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('✅ Data loaded successfully:', data);
        setAnalysisData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error loading data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Animation for journey funnel
  useEffect(() => {
    if (activeSection === 'analysis') {
      setAnimateJourney(false);
      setTimeout(() => setAnimateJourney(true), 100);
    }
  }, [activeSection]);

  // Animation for revenue counter
  useEffect(() => {
    if (activeSection === 'summary') {
      let start = 0;
      const end = 54000000;
      const duration = 1500;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCountUpRevenue(end);
          clearInterval(timer);
        } else {
          setCountUpRevenue(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [activeSection]);

  // ========== EARLY RETURNS (AFTER ALL HOOKS) ==========
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 mb-2">Loading Analysis Results...</div>
          <div className="text-slate-600">Fetching attribution data from Python analysis</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</div>
          <div className="text-slate-600 mb-4">{error}</div>
          <div className="text-sm text-slate-500">
            Make sure attribution-results.json is in public/data/
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ========== REST OF THE CODE ==========

  const attributionData = [
    { 
      model: 'First-Touch', 
      view: analysisData.attribution_models.first_touch.view, 
      cart: analysisData.attribution_models.first_touch.cart 
    },
    { 
      model: 'Last-Touch', 
      view: analysisData.attribution_models.last_touch.view, 
      cart: analysisData.attribution_models.last_touch.cart 
    },
    { 
      model: 'Linear', 
      view: analysisData.attribution_models.linear.view, 
      cart: analysisData.attribution_models.linear.cart 
    },
    { 
      model: 'Shapley', 
      view: analysisData.attribution_models.shapley.view, 
      cart: analysisData.attribution_models.shapley.cart 
    },
    { 
      model: 'Markov', 
      view: analysisData.attribution_models.markov.view, 
      cart: analysisData.attribution_models.markov.cart 
    }
  ];

  const modelComparison = [
    { model: 'First-Touch', ...analysisData.model_comparison.first_touch },
    { model: 'Last-Touch', ...analysisData.model_comparison.last_touch },
    { model: 'Linear', ...analysisData.model_comparison.linear },
    { model: 'Shapley', ...analysisData.model_comparison.shapley },
    { model: 'Markov', ...analysisData.model_comparison.markov }
  ];

  const scenarios = {
    current: {
      name: 'Current State',
      subtitle: 'First-Touch Bias',
      viewBudget: 3000000,
      cartBudget: 2000000,
      projectedRevenue: 50000000,
      roas: 10.0,
      lift: 0,
      risk: 'Low'
    },
    recommended: {
      name: 'Recommended',
      subtitle: 'Shapley-Guided',
      viewBudget: 2750000,
      cartBudget: 2250000,
      projectedRevenue: 54000000,
      roas: 11.2,
      lift: 8,
      risk: 'Low'
    },
    aggressive: {
      name: 'Aggressive',
      subtitle: 'Markov-Guided',
      viewBudget: 2250000,
      cartBudget: 2750000,
      projectedRevenue: 57500000,
      roas: 12.5,
      lift: 15,
      risk: 'Medium'
    }
  };

  const scenario = scenarios[selectedScenario];

  const calculateCustomProjections = () => {
    const totalBudget = 5000000;
    const viewPercent = customViewBudget / totalBudget;
    const cartPercent = customCartBudget / totalBudget;
    
    const cartWeighting = cartPercent - 0.40;
    const projectedLift = Math.max(0, Math.min(15, cartWeighting * 75));
    const projectedRevenue = 50000000 * (1 + projectedLift / 100);
    const projectedRoas = 10 + (projectedLift * 0.15);
    
    return {
      lift: projectedLift.toFixed(1),
      revenue: projectedRevenue,
      roas: projectedRoas.toFixed(1)
    };
  };

  const customProjections = calculateCustomProjections();

  const sections = [
    { id: 'summary', label: 'Executive Summary' },
    { id: 'problem', label: 'Problem Statement' },
    { id: 'methodology', label: 'Methodology' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'financials', label: 'Financial Impact' },
    { id: 'roadmap', label: 'Implementation' }
  ];

  const journeyStages = [
    { stage: 'Initial Traffic', users: 3700000, percent: 100, delay: 0 },
    { stage: 'Product View', users: 3692300, percent: 99.9, delay: 200 },
    { stage: 'Cart Addition', users: 1072900, percent: 29.0, delay: 400 },
    { stage: 'Purchase', users: 303400, percent: 8.2, delay: 600 }
  ];

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Marketing Attribution Strategy</h1>
                <p className="text-sm text-slate-600 mt-1">
                  UrbanStyle E-commerce | {analysisData.meta.total_events.toLocaleString()} events analyzed
                  <span className="ml-2 text-emerald-600 font-semibold">● Live Data</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 border-t border-slate-100 pt-4">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {activeSection === 'summary' && (
          <div className="space-y-8">
            
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm transform hover:scale-105 transition-transform">
                <div className="text-slate-500 text-sm font-medium mb-2">Current Revenue</div>
                <div className="text-4xl font-bold text-slate-900 mb-1">$50M</div>
                <div className="text-slate-500 text-xs">Annual baseline</div>
              </div>
              <div className="bg-white border border-emerald-200 rounded-lg p-6 shadow-sm transform hover:scale-105 transition-transform">
                <div className="text-emerald-700 text-sm font-medium mb-2">Potential Uplift</div>
                <div className="text-4xl font-bold text-emerald-600 mb-1">+$4M</div>
                <div className="text-emerald-600 text-xs">8% growth opportunity</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm transform hover:scale-105 transition-transform">
                <div className="text-slate-500 text-sm font-medium mb-2">Budget Reallocation</div>
                <div className="text-4xl font-bold text-slate-900 mb-1">$250K</div>
                <div className="text-slate-500 text-xs">Awareness to cart optimization</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm transform hover:scale-105 transition-transform">
                <div className="text-slate-500 text-sm font-medium mb-2">Payback Period</div>
                <div className="text-4xl font-bold text-slate-900 mb-1">2 mo</div>
                <div className="text-slate-500 text-xs">Break-even timeline</div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-8 shadow-lg border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Key Insight</h2>
              <p className="text-lg text-slate-50 mb-6 leading-relaxed">
                Your brand awareness campaigns are performing exceptionally well, with an 11.9% conversion rate that significantly exceeds the industry average of 2.5%. However, a comprehensive attribution analysis across five different models reveals a systematic over-allocation to top-of-funnel activities, resulting in approximately $500K in suboptimal spend annually.
              </p>
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <div className="text-sm font-semibold text-slate-300 mb-3">RECOMMENDATION</div>
                <div className="text-base text-white leading-relaxed">
                  Reallocate $250K from display and social awareness campaigns to cart optimization initiatives, including abandoned cart email sequences, exit-intent interventions, and targeted retargeting. Conservative modeling projects an 8% revenue lift, equivalent to $4M in additional annual revenue.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {Object.entries(scenarios).map(([key, sc]) => (
                <div 
                  key={key}
                  className={`bg-white rounded-lg p-6 border-2 transition-all cursor-pointer hover:shadow-md transform hover:scale-105 ${
                    key === 'recommended' 
                      ? 'border-emerald-500 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => {
                    setSelectedScenario(key);
                    setActiveSection('financials');
                  }}
                >
                  <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">{sc.subtitle}</div>
                  <div className="text-slate-900 text-xl font-bold mb-3">{sc.name}</div>
                  <div className="text-4xl font-bold text-emerald-600 mb-4">
                    ${(sc.projectedRevenue / 1000000).toFixed(1)}M
                  </div>
                  <div className="flex gap-3 text-xs">
                    <div className="bg-slate-100 px-3 py-1.5 rounded">
                      <span className="text-slate-600">ROAS</span> <span className="text-slate-900 font-semibold">{sc.roas}:1</span>
                    </div>
                    <div className={`px-3 py-1.5 rounded ${
                      sc.risk === 'Low' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {sc.risk} Risk
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {activeSection === 'problem' && (
          <div className="space-y-8">
            
            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">The Attribution Problem</h2>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 transform hover:scale-105 transition-transform">
                    <div className="text-red-900 font-semibold mb-3">CMO's Perspective</div>
                    <div className="text-slate-700 text-sm mb-4 italic">
                      We need to maintain or increase budget for brand awareness initiatives. Our analysis shows that 99.8% of customer journeys begin with a view interaction. Reducing awareness spend would fundamentally undermine our ability to acquire new customers and could lead to significant revenue decline.
                    </div>
                    <div className="text-xs text-slate-500">Attribution basis: First-Touch model</div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 transform hover:scale-105 transition-transform">
                    <div className="text-blue-900 font-semibold mb-3">CFO's Perspective</div>
                    <div className="text-slate-700 text-sm mb-4 italic">
                      Current data indicates we're allocating approximately $500K to impression-based campaigns with minimal direct conversion impact. Last-touch attribution demonstrates that cart-stage interactions drive 65% of revenue. We should redirect capital to conversion optimization for improved ROI.
                    </div>
                    <div className="text-xs text-slate-500">Attribution basis: Last-Touch model</div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <div className="text-slate-900 font-semibold mb-4">Data-Driven Resolution</div>
                  <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
                    <p>
                      Both perspectives contain valid elements. View interactions are indeed critical for customer discovery and brand building. Simultaneously, cart-stage interactions demonstrably function as conversion multipliers with measurable impact on purchase completion rates.
                    </p>
                    
                    <p>
                      The core issue stems from reliance on First-Touch attribution, which systematically over-credits awareness activities by approximately 31 percentage points compared to more sophisticated multi-touch attribution models such as Shapley values and Markov chain analysis.
                    </p>
                    
                    <p className="text-slate-900 font-medium">
                      The optimal solution involves reallocating $250K toward cart optimization without compromising brand-building activities, achieving a balanced investment strategy informed by advanced attribution modeling.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Performance Benchmarking</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 transform hover:scale-105 transition-transform">
                  <div className="text-emerald-900 font-semibold mb-2">Conversion Rate</div>
                  <div className="text-4xl font-bold text-emerald-700 mb-2">11.9%</div>
                  <div className="text-slate-600 text-sm">Industry average: 2.5% | Performance: 5x above benchmark</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 transform hover:scale-105 transition-transform">
                  <div className="text-amber-900 font-semibold mb-2">Cart Abandonment Rate</div>
                  <div className="text-4xl font-bold text-amber-700 mb-2">71.8%</div>
                  <div className="text-slate-600 text-sm">Industry average: 69.8% | Optimization opportunity identified</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 transform hover:scale-105 transition-transform">
                  <div className="text-slate-900 font-semibold mb-2">Average Customer Journey</div>
                  <div className="text-4xl font-bold text-slate-700 mb-2">{analysisData.journey_stats.avg_days.toFixed(1)} days</div>
                  <div className="text-slate-600 text-sm">Industry average: 7.2 days | Within normal range</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 transform hover:scale-105 transition-transform">
                  <div className="text-emerald-900 font-semibold mb-2">Return on Ad Spend</div>
                  <div className="text-4xl font-bold text-emerald-700 mb-2">10:1</div>
                  <div className="text-slate-600 text-sm">Industry average: 4.2:1 | Strong performance</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeSection === 'methodology' && (
          <div className="space-y-8">
            
            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Analysis Methodology</h2>
              
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 transform hover:scale-105 transition-transform">
                  <div className="text-xl font-bold text-slate-900 mb-2">Data Scale</div>
                  <div className="text-slate-700 text-sm">{analysisData.meta.total_events.toLocaleString()} events analyzed across {analysisData.meta.total_users.toLocaleString()} users and 13.8 million sessions over a 30-day period</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 transform hover:scale-105 transition-transform">
                  <div className="text-xl font-bold text-slate-900 mb-2">Data Quality</div>
                  <div className="text-slate-700 text-sm">99% human traffic after advanced bot detection algorithm removed 3,678 automated accounts</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 transform hover:scale-105 transition-transform">
                  <div className="text-xl font-bold text-slate-900 mb-2">Model Diversity</div>
                  <div className="text-slate-700 text-sm">Five attribution models ranging from simple single-touch to advanced probabilistic approaches</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-8 mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Attribution Model Sophistication Analysis</h3>
                <ResponsiveContainer width="100%" height={450}>
                  <RadarChart data={modelComparison} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="model" tick={{ fill: '#475569', fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#475569', fontSize: 10 }} tickCount={11} />
                    <Radar name="Accuracy" dataKey="accuracy" stroke="#0f172a" fill="#0f172a" fillOpacity={0.1} />
                    <Radar name="Fairness" dataKey="fairness" stroke="#059669" fill="#059669" fillOpacity={0.1} />
                    <Radar name="Business Value" dataKey="business_value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-5 hover:border-red-600 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-slate-900 font-semibold">First-Touch & Last-Touch Attribution</div>
                    <div className="text-xs text-red-700 font-semibold bg-red-100 px-2 py-1 rounded">Sophistication: Low</div>
                  </div>
                  <div className="text-slate-700 text-sm">Single-touchpoint models that over-credit either initial discovery or final conversion. Simple to implement but susceptible to systematic bias.</div>
                </div>
                <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-5 hover:border-amber-600 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-slate-900 font-semibold">Linear Attribution</div>
                    <div className="text-xs text-amber-700 font-semibold bg-amber-100 px-2 py-1 rounded">Sophistication: Medium</div>
                  </div>
                  <div className="text-slate-700 text-sm">Distributes equal credit across all touchpoints. Eliminates single-point bias but lacks nuance regarding differential touchpoint impact.</div>
                </div>
                <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg p-5 hover:border-emerald-600 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-slate-900 font-semibold">Shapley Value Attribution</div>
                    <div className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-1 rounded">Sophistication: High</div>
                  </div>
                  <div className="text-slate-700 text-sm">Game theory-based approach calculating fair contribution based on marginal value across all possible touchpoint coalitions. Computationally intensive but mathematically rigorous.</div>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-5 hover:border-blue-600 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-slate-900 font-semibold">Markov Chain Attribution</div>
                    <div className="text-xs text-blue-700 font-semibold bg-blue-100 px-2 py-1 rounded">Sophistication: Very High</div>
                  </div>
                  <div className="text-slate-700 text-sm">Probabilistic model measuring conversion impact through removal effect analysis. Identifies which touchpoints function as true conversion multipliers versus supportive elements.</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeSection === 'analysis' && (
          <div className="space-y-8">
            
            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Attribution Model Comparison</h2>
              <p className="text-slate-600 mb-6">
                Revenue attribution variance across models demonstrates the significant impact of methodology selection. First-Touch attributes 99.8% to views, while Markov attributes 100% to cart interactions, illustrating the extreme range of possible conclusions.
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={attributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="model" tick={{ fill: '#475569' }} />
                  <YAxis tick={{ fill: '#475569' }} label={{ value: 'Revenue Attribution (%)', angle: -90, position: 'insideLeft', fill: '#475569' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                  />
                  <Legend />
                  <Bar dataKey="view" fill="#64748b" name="View Touchpoints" />
                  <Bar dataKey="cart" fill="#059669" name="Cart Touchpoints" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-slate-500 text-xs mt-4 italic">
                Note: Purchase touchpoints represent less than 0.2% across all models and are excluded from visualization for clarity.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Customer Journey Conversion Funnel</h2>
              <p className="text-slate-600 mb-6">
                Average customer journey consists of {analysisData.journey_stats.avg_touchpoints.toFixed(1)} touchpoints over {analysisData.journey_stats.avg_days.toFixed(1)} days. The cart stage exhibits a 71% abandonment rate, representing the primary optimization opportunity.
              </p>
              
              <div className="space-y-4">
                {journeyStages.map((stage, idx) => (
                  <div key={stage.stage} className="relative">
                    <div 
                      className={`rounded-lg p-6 transition-all duration-1000 ${
                        idx === 0 ? 'bg-slate-100 text-slate-900' :
                        idx === 1 ? 'bg-slate-200 text-slate-900' :
                        idx === 2 ? 'bg-amber-100 border-2 border-amber-300 text-slate-900' :
                        'bg-emerald-100 border-2 border-emerald-300 text-slate-900'
                      }`}
                      style={{
                        width: animateJourney ? `${Math.max(stage.percent, 15)}%` : '0%',
                        minWidth: idx === 3 ? '200px' : 'auto',
                        transitionDelay: `${stage.delay}ms`,
                        opacity: animateJourney ? 1 : 0
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-lg">{stage.stage}</div>
                          <div className="text-sm text-slate-600">{idx === 0 ? 'Entry point' : idx === 1 ? 'Catalog browsing' : idx === 2 ? 'Purchase intent signal' : 'Conversion'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{(stage.users / 1000000).toFixed(2)}M users</div>
                          <div className="text-sm text-slate-600">{stage.percent}%{idx === 2 ? ' | 71% abandon' : ''}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeSection === 'financials' && (
          <div className="space-y-8">
            
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Financial Impact Analysis</h2>
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    compareMode 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {compareMode ? 'Hide Comparison' : 'Compare Scenarios'}
                </button>
              </div>
            </div>

            {compareMode && (
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-8 border-2 border-blue-200 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Current vs Recommended Scenario</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <div className="text-slate-500 text-xs uppercase tracking-wide mb-2">CURRENT STATE</div>
                    <div className="text-2xl font-bold text-slate-900 mb-4">First-Touch Bias</div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Awareness Budget</div>
                        <div className="text-3xl font-bold text-slate-900">$3.00M</div>
                        <div className="text-xs text-slate-500">60% allocation</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Cart Budget</div>
                        <div className="text-3xl font-bold text-red-600">$2.00M</div>
                        <div className="text-xs text-red-500">40% allocation (under-funded)</div>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <div className="text-sm text-slate-600 mb-1">Projected Revenue</div>
                        <div className="text-3xl font-bold text-slate-900">$50.0M</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-lg p-6 border-2 border-emerald-500">
                    <div className="text-emerald-700 text-xs uppercase tracking-wide mb-2">RECOMMENDED</div>
                    <div className="text-2xl font-bold text-slate-900 mb-4">Shapley-Guided</div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Awareness Budget</div>
                        <div className="text-3xl font-bold text-slate-900">$2.75M</div>
                        <div className="text-xs text-emerald-600">55% allocation (-$250K)</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Cart Budget</div>
                        <div className="text-3xl font-bold text-emerald-600">$2.25M</div>
                        <div className="text-xs text-emerald-600">45% allocation (+$250K)</div>
                      </div>
                      <div className="pt-4 border-t border-emerald-200">
                        <div className="text-sm text-slate-600 mb-1">Projected Revenue</div>
                        <div className="text-3xl font-bold text-emerald-600">$54.0M</div>
                        <div className="text-xs text-emerald-600 font-semibold">+$4M increase (+8%)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Budget Allocator</h3>
              <p className="text-slate-600 text-sm mb-6">Adjust the budget allocation to see real-time impact on projected revenue and ROAS.</p>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-700">Brand Awareness Budget</label>
                    <span className="text-lg font-bold text-slate-900">${(customViewBudget / 1000000).toFixed(2)}M</span>
                  </div>
                  <input
                    type="range"
                    min="1500000"
                    max="3500000"
                    step="50000"
                    value={customViewBudget}
                    onChange={(e) => {
                      const newView = parseInt(e.target.value);
                      setCustomViewBudget(newView);
                      setCustomCartBudget(5000000 - newView);
                    }}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #64748b 0%, #64748b ${((customViewBudget - 1500000) / 2000000) * 100}%, #e2e8f0 ${((customViewBudget - 1500000) / 2000000) * 100}%, #e2e8f0 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>$1.5M</span>
                    <span>$3.5M</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-700">Cart Optimization Budget</label>
                    <span className="text-lg font-bold text-emerald-600">${(customCartBudget / 1000000).toFixed(2)}M</span>
                  </div>
                  <input
                    type="range"
                    min="1500000"
                    max="3500000"
                    step="50000"
                    value={customCartBudget}
                    onChange={(e) => {
                      const newCart = parseInt(e.target.value);
                      setCustomCartBudget(newCart);
                      setCustomViewBudget(5000000 - newCart);
                    }}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #059669 0%, #059669 ${((customCartBudget - 1500000) / 2000000) * 100}%, #e2e8f0 ${((customCartBudget - 1500000) / 2000000) * 100}%, #e2e8f0 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>$1.5M</span>
                    <span>$3.5M</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Projected Impact</h4>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Revenue Lift</div>
                      <div className="text-3xl font-bold text-emerald-600">+{customProjections.lift}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Projected Revenue</div>
                      <div className="text-3xl font-bold text-slate-900">${(customProjections.revenue / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Projected ROAS</div>
                      <div className="text-3xl font-bold text-slate-900">{customProjections.roas}:1</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Pre-Defined Scenarios</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                {Object.entries(scenarios).map(([key, sc]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedScenario(key)}
                    className={`p-6 rounded-lg border-2 transition-all text-left transform hover:scale-105 ${
                      selectedScenario === key
                        ? 'border-slate-900 bg-slate-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">{sc.subtitle}</div>
                    <div className="text-slate-900 text-xl font-bold mb-2">{sc.name}</div>
                    <div className="text-3xl font-bold text-emerald-600">
                      ${(sc.projectedRevenue / 1000000).toFixed(1)}M
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 rounded-lg p-8 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">{scenario.name} Scenario Details</h3>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="text-slate-600 text-sm mb-2 font-medium">Brand Awareness Allocation</div>
                      <div className="text-4xl font-bold text-slate-900 mb-1">
                        ${(scenario.viewBudget / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-slate-500 text-sm">
                        {((scenario.viewBudget / 5000000) * 100).toFixed(1)}% of total marketing budget
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-slate-600 text-sm mb-2 font-medium">Cart Optimization Allocation</div>
                      <div className="text-4xl font-bold text-emerald-600 mb-1">
                        ${(scenario.cartBudget / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-slate-500 text-sm">
                        {((scenario.cartBudget / 5000000) * 100).toFixed(1)}% of total marketing budget
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <div className="space-y-5">
                      <div>
                        <div className="text-slate-600 text-sm font-medium">Projected Annual Revenue</div>
                        <div className="text-4xl font-bold text-slate-900">
                          ${(scenario.projectedRevenue / 1000000).toFixed(1)}M
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-600 text-sm font-medium">Revenue Lift</div>
                        <div className="text-3xl font-bold text-emerald-600">+{scenario.lift}%</div>
                      </div>
                      <div>
                        <div className="text-slate-600 text-sm font-medium">Return on Ad Spend</div>
                        <div className="text-3xl font-bold text-slate-900">{scenario.roas}:1</div>
                      </div>
                      <div className={`px-4 py-2.5 rounded-md text-center font-medium ${
                        scenario.risk === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {scenario.risk} Risk Profile
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Scenario Comparison Chart</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={[
                  { scenario: 'Current', revenue: 50, roas: 10.0, lift: 0 },
                  { scenario: 'Recommended', revenue: 54, roas: 11.2, lift: 8 },
                  { scenario: 'Aggressive', revenue: 57.5, roas: 12.5, lift: 15 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="scenario" tick={{ fill: '#475569' }} />
                  <YAxis yAxisId="left" tick={{ fill: '#475569' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} name="Projected Revenue ($M)" />
                  <Line yAxisId="right" type="monotone" dataKey="roas" stroke="#64748b" strokeWidth={3} name="ROAS" />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}

        {activeSection === 'roadmap' && (
          <div className="space-y-8">
            
            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">90-Day Implementation Roadmap</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-6 transform hover:scale-105 transition-transform">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-blue-900 font-bold text-lg">Phase 1: Baseline Establishment</div>
                      <div className="text-slate-700 text-sm mt-2">Weeks 1-2 | Analytics Team</div>
                    </div>
                  </div>
                  <ul className="text-slate-700 text-sm space-y-2 ml-4">
                    <li>Document current conversion rates by marketing channel</li>
                    <li>Identify underperforming awareness campaigns in bottom performance quartile</li>
                    <li>Implement comprehensive cart abandonment tracking infrastructure</li>
                  </ul>
                </div>

                <div className="bg-emerald-50 border-l-4 border-emerald-600 rounded-r-lg p-6 transform hover:scale-105 transition-transform">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-emerald-900 font-bold text-lg">Phase 2: Initial Deployment</div>
                      <div className="text-slate-700 text-sm mt-2">Weeks 3-4 | Marketing Team</div>
                    </div>
                  </div>
                  <ul className="text-slate-700 text-sm space-y-2 ml-4">
                    <li>Launch abandoned cart email sequence (three-email cadence)</li>
                    <li>Deploy exit-intent popup interventions with value propositions</li>
                    <li>Initiate cart abandoner retargeting campaigns across display network</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-600 rounded-r-lg p-6 transform hover:scale-105 transition-transform">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-purple-900 font-bold text-lg">Phase 3: Optimization Testing</div>
                      <div className="text-slate-700 text-sm mt-2">Weeks 5-8 | Growth Team</div>
                    </div>
                  </div>
                  <ul className="text-slate-700 text-sm space-y-2 ml-4">
                    <li>A/B test email delivery timing (immediate, 1-hour, 24-hour intervals)</li>
                    <li>Test discount depth variations (5%, 10%, 15%) against control</li>
                    <li>Measure incremental lift using holdout control group methodology</li>
                  </ul>
                </div>

                <div className="bg-slate-100 border-l-4 border-slate-600 rounded-r-lg p-6 transform hover:scale-105 transition-transform">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-slate-900 font-bold text-lg">Phase 4: Scale and Validation</div>
                      <div className="text-slate-700 text-sm mt-2">Weeks 9-12 | Cross-Functional Team</div>
                    </div>
                  </div>
                  <ul className="text-slate-700 text-sm space-y-2 ml-4">
                    <li>Scale budget allocation to top-performing tactics based on test results</li>
                    <li>Calculate actual revenue lift versus projected 8% baseline</li>
                    <li>Present findings to executive leadership with next-phase recommendations</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Key Performance Indicators</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-5 border border-slate-200 transform hover:scale-105 transition-transform">
                    <div className="text-slate-600 text-sm mb-1 font-medium">Cart Recovery Rate</div>
                    <div className="text-2xl font-bold text-emerald-600">Target: +15%</div>
                    <div className="text-slate-500 text-xs mt-1">From 28.2% to 32.4%</div>
                  </div>
                  <div className="bg-white rounded-lg p-5 border border-slate-200 transform hover:scale-105 transition-transform">
                    <div className="text-slate-600 text-sm mb-1 font-medium">Revenue Per Session</div>
                    <div className="text-2xl font-bold text-slate-900">Target: +8%</div>
                    <div className="text-slate-500 text-xs mt-1">Weekly trend monitoring</div>
                  </div>
                  <div className="bg-white rounded-lg p-5 border border-slate-200 transform hover:scale-105 transition-transform">
                    <div className="text-slate-600 text-sm mb-1 font-medium">Cart Conversion Rate</div>
                    <div className="text-2xl font-bold text-slate-900">Target: +3-5%</div>
                    <div className="text-slate-500 text-xs mt-1">Percentage point improvement</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Risk Assessment and Mitigation</h2>
              
              <div className="space-y-5">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="text-red-900 font-bold text-lg mb-2">Risk: Awareness Reduction Impact</div>
                      <div className="text-slate-700 text-sm mb-4">
                        Potential concern that reducing display and social spend by $250K could negatively impact new customer acquisition volume and top-of-funnel traffic.
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-red-100">
                        <div className="text-slate-900 font-semibold text-sm mb-2">MITIGATION STRATEGY</div>
                        <ul className="text-slate-700 text-sm space-y-1.5">
                          <li>Selectively reduce only bottom-quartile campaigns by ROAS performance</li>
                          <li>Implement weekly monitoring of new visitor traffic with 5% threshold alert</li>
                          <li>Maintain full funding for high-performing brand campaigns</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="text-amber-900 font-bold text-lg mb-2">Risk: Discount Dependency Development</div>
                      <div className="text-slate-700 text-sm mb-4">
                        Concern that aggressive cart recovery discounting could train customer base to delay purchases in anticipation of promotional offers.
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-amber-100">
                        <div className="text-slate-900 font-semibold text-sm mb-2">MITIGATION STRATEGY</div>
                        <ul className="text-slate-700 text-sm space-y-1.5">
                          <li>Implement tiered approach: initial reminder without discount, followed by offer after 24-hour period</li>
                          <li>A/B test value-added messaging (free shipping, loyalty points) against discount offers</li>
                          <li>Establish maximum discount threshold of 10% to maintain margin integrity</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="text-slate-900 font-bold text-lg mb-2">Risk: Projected Lift Underperformance</div>
                      <div className="text-slate-700 text-sm mb-4">
                        Possibility that conservative 8% revenue lift projection may not fully materialize, with actual results in 3-4% range.
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-100">
                        <div className="text-slate-900 font-semibold text-sm mb-2">MITIGATION STRATEGY</div>
                        <ul className="text-slate-700 text-sm space-y-1.5">
                          <li>Even 4% lift equals $2M annual revenue increase, representing 8:1 ROI on implementation effort</li>
                          <li>Deploy phased approach beginning with $100K test allocation, scaling based on validated results</li>
                          <li>Document comprehensive learnings for iterative optimization regardless of initial outcome</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg p-8 text-white border border-slate-800">
              <h2 className="text-2xl font-bold mb-4">Strategic Rationale</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-slate-300 font-semibold mb-2">Data-Driven Foundation</div>
                  <div className="text-slate-200 text-sm leading-relaxed">
                    Analysis based on 67.5 million events across five attribution models, eliminating opinion-based decision making and providing quantitative validation for strategic recommendations.
                  </div>
                </div>
                <div>
                  <div className="text-slate-300 font-semibold mb-2">Favorable Risk-Reward Profile</div>
                  <div className="text-slate-200 text-sm leading-relaxed">
                    $250K reallocation represents 5% of marketing budget with potential $4M upside, yielding 16:1 return on investment with two-month payback period.
                  </div>
                </div>
                <div>
                  <div className="text-slate-300 font-semibold mb-2">Industry-Validated Approach</div>
                  <div className="text-slate-200 text-sm leading-relaxed">
                    Cart recovery campaigns demonstrate 6-12% average revenue lift across e-commerce sector. Conservative 8% projection accounts for execution variance.
                  </div>
                </div>
                <div>
                  <div className="text-slate-300 font-semibold mb-2">Existing Competitive Advantage</div>
                  <div className="text-slate-200 text-sm leading-relaxed">
                    11.9% conversion rate indicates strong brand equity and product-market fit. Optimization focuses on funnel efficiency rather than fundamental repositioning.
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        <div className="text-center text-slate-500 text-sm py-8 border-t border-slate-200">
          <div className="mb-1">
            Analysis conducted on {analysisData.meta.total_events.toLocaleString()} events 
            across {analysisData.meta.total_users.toLocaleString()} users utilizing five attribution methodologies
          </div>
          <div className="text-xs text-slate-400">
            Bot-filtered data | Sample: {analysisData.journey_stats.total_journeys_analyzed.toLocaleString()} journeys | 
            Avg: {analysisData.journey_stats.avg_touchpoints.toFixed(1)} touchpoints over {analysisData.journey_stats.avg_days.toFixed(1)} days
          </div>
        </div>

      </div>
    </div>
  );
}
