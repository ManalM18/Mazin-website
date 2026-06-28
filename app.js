/* ==========================================================================
   APP.JS - RESTORED FIRST LAYOUT WITH DYNAMIC FULL-SCREEN LIVE BACKGROUND
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Global page features
  initPageLiveBackground();
  initGlobalUI();
  
  // Custom section animations
  initBlueprintGenerator();
  initArchitectAvatar();
  initSwarmSandbox();
  initRoiCalculator();
  initContactForm();

});

/* ==========================================================================
   FULL SCREEN INTERACTIVE LIVE BACKGROUND CANVAS
   ========================================================================== */

function initPageLiveBackground() {
  const canvas = document.getElementById('page-bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Responsive resize
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  });

  const nodes = [];
  const maxNodes = Math.min(100, Math.floor((width * height) / 12000)); // Dynamic node limit
  const maxDistance = 125;

  // Mouse vector tracker
  let mouse = { x: 0, y: 0, active: false, radius: 180 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Populate floating nodes
  for (let i = 0; i < maxNodes; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: 1.5 + Math.random() * 2,
      color: i % 2 === 0 ? 'rgba(79, 70, 229, 0.25)' : 'rgba(6, 182, 212, 0.25)' // faint Indigo vs Cyan
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Update positions
    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;

      // Bounce boundaries
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      // Gravity drag pull towards mouse pointer
      if (mouse.active) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          node.x += (dx / dist) * force * 0.45;
          node.y += (dy / dist) * force * 0.45;
        }
      }

      // Draw point
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
    });

    // Draw connection webbing lines
    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < maxDistance) {
          // Fade connection based on distance (very faint!)
          const alpha = (1 - dist / maxDistance) * 0.055;
          ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================================
   GLOBAL UI INTERACTIONS (Header Scroll, Mobile Nav Overlay, Scroll Progress)
   ========================================================================== */

function initGlobalUI() {
  const header = document.getElementById('header');
  const scrollProgress = document.getElementById('scroll-progress');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  window.addEventListener('scroll', () => {
    // Header scrolled class
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll progress bar
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const scrollPct = (window.scrollY / totalHeight) * 100;
      scrollProgress.style.width = `${scrollPct}%`;
    }
  });

  // Mobile navigation drawer toggle
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileNav.classList.remove('active');
    });
  });

  // Monogram click scroll to top
  document.getElementById('logo-trigger').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   INSTANT SWARM BLUEPRINT GENERATOR WIDGET ENGINE
   ========================================================================== */

function initBlueprintGenerator() {
  const sliderHours = document.getElementById('gen-hours');
  const displayHours = document.getElementById('gen-hours-val');
  const descInput = document.getElementById('gen-process-desc');
  const btnGenerate = document.getElementById('btn-generate-blueprint');
  const btnReset = document.getElementById('btn-reset-gen');
  const btnDeploy = document.getElementById('btn-deploy-blueprint');

  const inputView = document.getElementById('gen-input-view');
  const loadingView = document.getElementById('gen-loading-view');
  const resultView = document.getElementById('gen-result-view');

  const progressBarFill = document.getElementById('gen-progress-bar');
  const loadingConsole = document.getElementById('gen-loading-console');

  const nodesList = document.getElementById('result-nodes-list');
  const savingsCash = document.getElementById('result-savings-cash');
  const roiRating = document.getElementById('result-roi-rating');
  const recipeText = document.getElementById('result-recipe-text');

  if (!btnGenerate) return;

  // Sync hours display on slide
  sliderHours.addEventListener('input', () => {
    displayHours.textContent = `${sliderHours.value} hrs`;
  });

  // Action: Generate Blueprint
  btnGenerate.addEventListener('click', () => {
    const desc = descInput.value.trim();
    if (!desc) {
      showToast("Please describe the manual process to analyze.", "error");
      return;
    }

    // Enter simulation state
    inputView.classList.add('gen-hidden');
    loadingView.classList.remove('gen-hidden');
    resultView.classList.add('gen-hidden');

    progressBarFill.style.width = '0%';
    loadingConsole.innerHTML = '';

    const logs = [
      { time: 100, text: "> Spawning blueprint parser context..." },
      { time: 450, text: "> Segmenting workflow steps and actions..." },
      { time: 850, text: "> Scanning matching agent nodes..." },
      { time: 1250, text: "> Compiling recommendation matrices..." },
      { time: 1650, text: "> Allocating swarm node instances..." },
      { time: 2050, text: "> Estimating ROI multipliers & weekly reclaimed time..." },
      { time: 2350, text: "> Finalizing custom recipe configuration schema..." },
      { time: 2500, text: "> Swarm Blueprint compilation complete!" }
    ];

    // Animate progress bar over 2.5s
    const totalDuration = 2500;
    const startTime = performance.now();

    function updateProgress() {
      const now = performance.now();
      const elapsed = now - startTime;
      const pct = Math.min(100, (elapsed / totalDuration) * 100);
      progressBarFill.style.width = `${pct}%`;

      if (elapsed < totalDuration) {
        requestAnimationFrame(updateProgress);
      }
    }
    requestAnimationFrame(updateProgress);

    // Stream logs
    logs.forEach(logEntry => {
      setTimeout(() => {
        const logDiv = document.createElement('div');
        logDiv.className = 'log-entry system-log';
        logDiv.textContent = logEntry.text;
        loadingConsole.appendChild(logDiv);
        loadingConsole.scrollTop = loadingConsole.scrollHeight;
      }, logEntry.time);
    });

    // Populate result view and transition
    setTimeout(() => {
      const analysis = runKeywordAnalysis(desc);
      const hoursWasted = parseInt(sliderHours.value);

      // Calculations
      const weeklyHoursSaved = hoursWasted * 0.9;
      const annualSavings = Math.round(weeklyHoursSaved * 50 * 52);
      
      savingsCash.textContent = `$${annualSavings.toLocaleString()}`;
      
      let ratingText = '';
      if (hoursWasted <= 5) {
        ratingText = '78% ROI (Rapid Value)';
      } else if (hoursWasted <= 15) {
        ratingText = '125% ROI (High Impact)';
      } else if (hoursWasted <= 30) {
        ratingText = '210% ROI (Hyper Efficiency)';
      } else {
        ratingText = '340% ROI (Critical Automation)';
      }
      roiRating.textContent = ratingText;

      // Populate nodes
      nodesList.innerHTML = '';
      analysis.nodes.forEach(node => {
        const span = document.createElement('span');
        span.className = `node-tag ${node.colorClass}`;
        span.textContent = node.name;
        nodesList.appendChild(span);
      });

      recipeText.textContent = analysis.recipe;

      loadingView.classList.add('gen-hidden');
      resultView.classList.remove('gen-hidden');
    }, 2650);
  });

  // Action: Reset Form
  btnReset.addEventListener('click', () => {
    descInput.value = '';
    sliderHours.value = 15;
    displayHours.textContent = '15 hrs';
    
    inputView.classList.remove('gen-hidden');
    loadingView.classList.add('gen-hidden');
    resultView.classList.add('gen-hidden');
  });

  // Action: Deploy / Scroll & Autofill
  btnDeploy.addEventListener('click', () => {
    const desc = descInput.value.trim();
    const hoursWasted = sliderHours.value;
    const analysis = runKeywordAnalysis(desc);
    const nodeNames = analysis.nodes.map(n => n.name).join(', ');
    
    const contactMessage = document.getElementById('contact-message');
    if (contactMessage) {
      contactMessage.value = `Hi Mazin, I would like to deploy this Swarm Blueprint:\n\n- Manual Process: "${desc}"\n- Recommended Swarm: [${nodeNames}]\n- Estimated Hours Saved: ${hoursWasted} hrs/week\n- Est. Annual Savings: ${savingsCash.textContent}\n- ROI Rating: ${roiRating.textContent}\n\nLet's get this set up.`;
    }
    
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    showToast("Blueprint copied into briefing form! Ready to align.", "success");
  });
}

function runKeywordAnalysis(desc) {
  const text = desc.toLowerCase();
  
  // 1. Leads / CRM / Scraper
  if (text.includes('lead') || text.includes('crm') || text.includes('hubspot') || 
      text.includes('salesforce') || text.includes('enrich') || text.includes('scrape') || 
      text.includes('linkedin') || text.includes('prospect') || text.includes('email finder') || 
      text.includes('contact') || text.includes('client')) {
    return {
      nodes: [
        { name: 'Lead Scraper', colorClass: 'color-cyan' },
        { name: 'LLM Validator', colorClass: 'color-indigo' },
        { name: 'CRM Sync Agent', colorClass: 'color-emerald' }
      ],
      recipe: "Swarm [Lead Scraper] scans profiles -> Swarm [LLM Validator] qualifies contacts -> Swarm [CRM Sync Agent] logs prospects."
    };
  }
  
  // 2. Invoice / Excel / Accounting
  if (text.includes('invoice') || text.includes('receipt') || text.includes('excel') || 
      text.includes('sheet') || text.includes('pdf') || text.includes('billing') || 
      text.includes('accounting') || text.includes('quickbooks') || text.includes('stripe') || 
      text.includes('payment') || text.includes('finance') || text.includes('expense')) {
    return {
      nodes: [
        { name: 'Document OCR', colorClass: 'color-cyan' },
        { name: 'LLM Auditor', colorClass: 'color-indigo' },
        { name: 'Ledger Porter', colorClass: 'color-emerald' }
      ],
      recipe: "Swarm [Document OCR] parses receipts -> Swarm [LLM Auditor] reconciles line items -> Swarm [Ledger Porter] updates accounting ledger."
    };
  }
  
  // 3. Support / Ticketing
  if (text.includes('support') || text.includes('ticket') || text.includes('email') || 
      text.includes('slack') || text.includes('discord') || text.includes('customer') || 
      text.includes('reply') || text.includes('helpdesk') || text.includes('zendesk') || 
      text.includes('intercom')) {
    return {
      nodes: [
        { name: 'Email Triage', colorClass: 'color-cyan' },
        { name: 'Context Retriever', colorClass: 'color-indigo' },
        { name: 'Draft Generator', colorClass: 'color-emerald' }
      ],
      recipe: "Swarm [Email Triage] classifies incoming tickets -> Swarm [Context Retriever] pulls support docs -> Swarm [Draft Generator] drafts response drafts."
    };
  }
  
  // 4. Data Sync / SQL / Database
  if (text.includes('sync') || text.includes('database') || text.includes('sql') || 
      text.includes('migration') || text.includes('api') || text.includes('airtable') || 
      text.includes('notion') || text.includes('transfer') || text.includes('upload')) {
    return {
      nodes: [
        { name: 'API Listener', colorClass: 'color-cyan' },
        { name: 'Schema Validator', colorClass: 'color-indigo' },
        { name: 'DB Committer', colorClass: 'color-emerald' }
      ],
      recipe: "Swarm [API Listener] detects source data changes -> Swarm [Schema Validator] maps destination types -> Swarm [DB Committer] upserts records."
    };
  }
  
  // 5. Content Creation / Social / Marketing
  if (text.includes('marketing') || text.includes('social') || text.includes('post') || 
      text.includes('blog') || text.includes('write') || text.includes('content') || 
      text.includes('linkedin post') || text.includes('twitter') || text.includes('generate') || 
      text.includes('newsletter')) {
    return {
      nodes: [
        { name: 'Trend Researcher', colorClass: 'color-cyan' },
        { name: 'Copywriting Agent', colorClass: 'color-indigo' },
        { name: 'Publisher Bot', colorClass: 'color-emerald' }
      ],
      recipe: "Swarm [Trend Researcher] curates hot topics -> Swarm [Copywriting Agent] writes brand-aligned posts -> Swarm [Publisher Bot] queues social scheduling."
    };
  }
  
  // Default Fallback
  return {
    nodes: [
      { name: 'Data Extractor', colorClass: 'color-cyan' },
      { name: 'Decision Core', colorClass: 'color-indigo' },
      { name: 'System Gateway', colorClass: 'color-emerald' }
    ],
    recipe: "Swarm [Data Extractor] parses operational inputs -> Swarm [Decision Core] applies cognitive logic -> Swarm [System Gateway] updates target software."
  };
}

/* ==========================================================================
   ARCHITECT PROFILE CIRCULAR NEURAL AVATAR CANVAS
   ========================================================================== */

function initArchitectAvatar() {
  const canvas = document.getElementById('architect-avatar-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const size = 140;
  canvas.width = size * 2;
  canvas.height = size * 2;
  ctx.scale(2, 2);

  const cx = size / 2;
  const cy = size / 2;
  const points = [];
  const numPoints = 18;
  let angle = 0;

  for (let i = 0; i < numPoints; i++) {
    const theta = (i / numPoints) * Math.PI * 2;
    const offset = Math.random() * 15 - 7.5;
    points.push({
      radius: 40 + offset,
      theta: theta,
      speed: 0.005 + Math.random() * 0.005,
      size: 1.5 + Math.random() * 2,
      phase: Math.random() * 10
    });
  }

  function draw() {
    ctx.clearRect(0, 0, size, size);
    angle += 0.006;

    const coords = points.map(p => {
      const rad = p.radius + Math.sin(angle * 2 + p.phase) * 5;
      const th = p.theta + angle;
      return {
        x: cx + Math.cos(th) * rad,
        y: cy + Math.sin(th) * rad * 0.6,
        size: p.size
      };
    });

    ctx.strokeStyle = 'rgba(79, 70, 229, 0.08)';
    ctx.lineWidth = 0.6;
    for (let i = 0; i < coords.length; i++) {
      for (let j = i + 1; j < coords.length; j++) {
        const dx = coords[i].x - coords[j].x;
        const dy = coords[i].y - coords[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 45) {
          ctx.beginPath();
          ctx.moveTo(coords[i].x, coords[i].y);
          ctx.lineTo(coords[j].x, coords[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = 'rgba(79, 70, 229, 0.4)';
    coords.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================================
   INTERACTIVE SWARM SANDBOX ENGINE
   ========================================================================== */

function initSwarmSandbox() {
  const canvasContainer = document.getElementById('studio-canvas-container');
  const nodesWrap = document.getElementById('canvas-nodes-wrap');
  const svgOverlay = document.getElementById('canvas-svg-overlay');
  
  const runBtn = document.getElementById('run-simulation-btn');
  const compileBtn = document.getElementById('btn-compile-blueprint');
  
  const consoleOutput = document.getElementById('console-output');
  const clearLogsBtn = document.getElementById('clear-logs-btn');
  const statusLabel = document.getElementById('simulation-status-label');
  const consolePulse = document.querySelector('.console-pulse');

  // Drawer
  const drawer = document.getElementById('node-properties-drawer');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const btnSaveProperties = document.getElementById('btn-save-properties');
  const btnDeleteNode = document.getElementById('btn-delete-node');
  
  const propIdInput = document.getElementById('prop-node-id');
  const propNameInput = document.getElementById('prop-node-name');
  const propModelGroup = document.getElementById('drawer-group-model');
  const propModelSelect = document.getElementById('prop-node-model');
  const propDescTextarea = document.getElementById('prop-node-desc');

  // Modal
  const modalBackdrop = document.getElementById('proposal-modal-backdrop');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnModalDeploy = document.getElementById('btn-modal-deploy');
  
  const modalFeasibility = document.getElementById('modal-feasibility');
  const modalNodesCount = document.getElementById('modal-nodes-count');
  const modalWorkflowType = document.getElementById('modal-workflow-type');
  const modalSavings = document.getElementById('modal-annual-savings');
  const modalEfficiency = document.getElementById('modal-efficiency');
  const modalFlowDiagram = document.getElementById('modal-flow-diagram');

  if (!canvasContainer) return;

  // State Variables
  let nodes = [];
  let connections = [];
  let selectedNodeId = null;
  let draggingNode = null;
  let dragStartX = 0;
  let dragStartY = 0;
  
  let drawingCable = null;
  let simulationActive = false;
  let dataParticles = [];
  let particleAnimationId = null;

  // Node Templates metadata
  const NODE_TEMPLATES = {
    // Triggers
    'email-watcher': { name: 'Email Listener', icon: '✉️', type: 'trigger', desc: 'Polls inbox for attachments', defaultPrompt: 'Listen to incoming emails containing invoice PDFs in attachments.' },
    'webhook-listener': { name: 'Webhook Receiver', icon: '🌐', type: 'trigger', desc: 'Listens to external system events', defaultPrompt: 'Trigger when database changes occur or API payload is pushed.' },
    'scheduled-cron': { name: 'Scheduled Trigger', icon: '⏱️', type: 'trigger', desc: 'Runs at a set time interval', defaultPrompt: 'Trigger daily at 09:00 AM UTC.' },
    // Agents
    'llm-classifier': { name: 'LLM Classifier', icon: '🧠', type: 'agent', desc: 'Segments tasks and routes data', defaultPrompt: 'Analyze email body text and classify customer urgency score.' },
    'pdf-parser': { name: 'Document OCR', icon: '📄', type: 'agent', desc: 'Extracts data from PDF/Images', defaultPrompt: 'Extract line-items, tax amount, vendor details, and totals from PDF.' },
    'web-scraper': { name: 'Web Scraper', icon: '🕷️', type: 'agent', desc: 'Gathers text and listings online', defaultPrompt: 'Scrape pricing data for matching catalog products.' },
    // Integrations
    'crm-sync': { name: 'CRM Sync Agent', icon: '💼', type: 'integration', desc: 'Writes to HubSpot/Salesforce', defaultPrompt: 'Sync contact and score data directly to HubSpot contact schema.' },
    'db-porter': { name: 'SQL Database Sync', icon: '🗄️', type: 'integration', desc: 'Queries & writes database tables', defaultPrompt: 'Upsert record mapping values to transactions table.' },
    'email-sender': { name: 'Email Sender', icon: '📤', type: 'integration', desc: 'Drafts and dispatches emails', defaultPrompt: 'Draft reply email confirming transaction and send to client.' },
    'slack-notifier': { name: 'Slack Alerts', icon: '💬', type: 'integration', desc: 'Sends channel alerts & reports', defaultPrompt: 'Alert operations channel with parsed details.' },
    // Gateways
    'human-in-loop': { name: 'Human Gatekeeper', icon: '👤', type: 'gateway', desc: 'Halts for manual review', defaultPrompt: 'Hold execution for admin validation if variance > $100.' }
  };

  // Node class generator helper
  function createNode(templateKey, x, y) {
    const template = NODE_TEMPLATES[templateKey];
    if (!template) return null;
    const id = 'node_' + Math.random().toString(36).substr(2, 9);
    return {
      id: id,
      type: template.type,
      template: templateKey,
      name: template.name,
      icon: template.icon,
      x: x,
      y: y,
      config: {
        model: template.type === 'agent' ? 'claude-3-5' : '',
        prompt: template.defaultPrompt
      }
    };
  }

  // Render nodes list onto the viewport wrapper
  function renderGraph() {
    // 1. Clean existing HTML nodes
    nodesWrap.innerHTML = '';

    // 2. Render each node as a DOM element
    nodes.forEach(node => {
      const nodeEl = document.createElement('div');
      nodeEl.className = 'studio-node';
      nodeEl.id = node.id;
      nodeEl.style.left = node.x + 'px';
      nodeEl.style.top = node.y + 'px';

      if (node.id === selectedNodeId) {
        nodeEl.classList.add('selected');
      }

      // Inside Node markup
      let bodyHtml = `<div class="studio-node-header">
        <span class="mini-icon">${node.icon}</span>
        <h4>${node.name}</h4>
      </div>
      <div class="studio-node-body">
        <span>${NODE_TEMPLATES[node.template].desc}</span>`;
      
      if (node.type === 'agent') {
        bodyHtml += `<br><span class="engine-badge">${node.config.model === 'claude-3-5' ? 'Claude 3.5' : node.config.model === 'gpt-4o' ? 'GPT-4o' : 'DeepSeek'}</span>`;
      }
      bodyHtml += `</div>`;
      nodeEl.innerHTML = bodyHtml;

      // Add ports
      // Inputs port (if not trigger)
      if (node.type !== 'trigger') {
        const inPort = document.createElement('div');
        inPort.className = 'node-port port-in';
        inPort.dataset.nodeId = node.id;
        inPort.dataset.portType = 'in';
        nodeEl.appendChild(inPort);
      }

      // Outputs port (if not integration)
      if (node.type !== 'integration') {
        const outPort = document.createElement('div');
        outPort.className = 'node-port port-out';
        outPort.dataset.nodeId = node.id;
        outPort.dataset.portType = 'out';
        nodeEl.appendChild(outPort);
      }

      // Listen to drag & drop inside canvas
      nodeEl.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('node-port')) return; // Ignore drag if port is clicked
        
        draggingNode = node;
        const rect = nodeEl.getBoundingClientRect();
        dragStartX = e.clientX - rect.left + canvasContainer.getBoundingClientRect().left;
        dragStartY = e.clientY - rect.top + canvasContainer.getBoundingClientRect().top;
        
        // Select node
        selectedNodeId = node.id;
        document.querySelectorAll('.studio-node').forEach(el => el.classList.remove('selected'));
        nodeEl.classList.add('selected');
        
        // Open drawer
        openPropertiesDrawer(node);
        
        e.stopPropagation();
      });

      nodesWrap.appendChild(nodeEl);
    });

    // 3. Draw connection lines on SVG
    drawCables();
    updateMetrics();
  }

  // Draw cable wires between nodes
  function drawCables() {
    svgOverlay.innerHTML = '';

    // Draw established connections
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.fromId);
      const toNode = nodes.find(n => n.id === conn.toId);
      
      if (fromNode && toNode) {
        // Output port coords (Right side of fromNode)
        const fromX = fromNode.x + 180;
        const fromY = fromNode.y + 25; // 50px height roughly center
        
        // Input port coords (Left side of toNode)
        const toX = toNode.x;
        const toY = toNode.y + 25;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = calculateBezierCurve(fromX, fromY, toX, toY);
        path.setAttribute('d', d);
        path.setAttribute('stroke', 'rgba(99, 102, 241, 0.45)');
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('fill', 'none');
        path.setAttribute('class', 'connection-wire');
        svgOverlay.appendChild(path);
      }
    });

    // Draw temporary cable if currently connecting
    if (drawingCable) {
      const startNode = nodes.find(n => n.id === drawingCable.startNodeId);
      if (startNode) {
        const startX = drawingCable.startPortType === 'out' ? startNode.x + 180 : startNode.x;
        const startY = startNode.y + 25;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = calculateBezierCurve(startX, startY, drawingCable.curX, drawingCable.curY);
        path.setAttribute('d', d);
        path.setAttribute('stroke', '#6366f1');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-dasharray', '5,5');
        path.setAttribute('fill', 'none');
        svgOverlay.appendChild(path);
      }
    }
  }

  function calculateBezierCurve(x1, y1, x2, y2) {
    const controlOffset = Math.max(50, Math.abs(x2 - x1) * 0.5);
    return `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
  }

  // Handle dragging and connecting ports
  canvasContainer.addEventListener('mousemove', (e) => {
    const canvasRect = canvasContainer.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    if (draggingNode) {
      // Limit bounds inside canvas
      let newX = mouseX - dragStartX;
      let newY = mouseY - dragStartY;
      newX = Math.max(10, Math.min(canvasRect.width - 190, newX));
      newY = Math.max(10, Math.min(canvasRect.height - 60, newY));

      draggingNode.x = newX;
      draggingNode.y = newY;

      // Realtime reposition the card
      const nodeEl = document.getElementById(draggingNode.id);
      if (nodeEl) {
        nodeEl.style.left = newX + 'px';
        nodeEl.style.top = newY + 'px';
      }
      drawCables();
    } 
    else if (drawingCable) {
      drawingCable.curX = mouseX;
      drawingCable.curY = mouseY;
      drawCables();
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (draggingNode) {
      draggingNode = null;
    }
    
    if (drawingCable) {
      // Check if mouse is over an input port
      const target = e.target;
      if (target.classList.contains('node-port') && target.dataset.portType === 'in') {
        const toNodeId = target.dataset.nodeId;
        const fromNodeId = drawingCable.startNodeId;
        
        // Ensure no loops/self-connections or double links
        const linkExists = connections.some(c => c.fromId === fromNodeId && c.toId === toNodeId);
        if (toNodeId !== fromNodeId && !linkExists) {
          connections.push({
            id: `conn_${fromNodeId}_${toNodeId}`,
            fromId: fromNodeId,
            toId: toNodeId
          });
          log(`Connected [${nodes.find(n=>n.id===fromNodeId).name}] to [${nodes.find(n=>n.id===toNodeId).name}].`, 'system-log');
        }
      }
      drawingCable = null;
      drawCables();
      updateMetrics();
    }
  });

  // Listen to port connection clicks
  canvasContainer.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('node-port') && e.target.dataset.portType === 'out') {
      const nodeId = e.target.dataset.nodeId;
      const canvasRect = canvasContainer.getBoundingClientRect();
      
      drawingCable = {
        startNodeId: nodeId,
        startPortType: 'out',
        curX: e.clientX - canvasRect.left,
        curY: e.clientY - canvasRect.top
      };
      
      e.stopPropagation();
      e.preventDefault();
    }
  });

  // Toolbox buttons click
  document.querySelectorAll('.toolbox-node-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const templateKey = btn.dataset.template;
      // Spawn node in center area
      const canvasRect = canvasContainer.getBoundingClientRect();
      const x = 50 + Math.random() * 80;
      const y = 150 + Math.random() * 100;
      
      const node = createNode(templateKey, x, y);
      if (node) {
        nodes.push(node);
        renderGraph();
        log(`Added node: ${node.name}`, 'system-log');
        
        // Select new node
        selectedNodeId = node.id;
        renderGraph();
        openPropertiesDrawer(node);
      }
    });
  });

  // Drawer Properties handlers
  function openPropertiesDrawer(node) {
    drawer.classList.add('open');
    propIdInput.value = node.id;
    propNameInput.value = node.name;
    propDescTextarea.value = node.config.prompt;

    if (node.type === 'agent') {
      propModelGroup.style.display = 'flex';
      propModelSelect.value = node.config.model || 'claude-3-5';
    } else {
      propModelGroup.style.display = 'none';
    }
  }

  function closePropertiesDrawer() {
    drawer.classList.remove('open');
    selectedNodeId = null;
    document.querySelectorAll('.studio-node').forEach(el => el.classList.remove('selected'));
  }

  btnCloseDrawer.addEventListener('click', closePropertiesDrawer);

  btnSaveProperties.addEventListener('click', () => {
    const id = propIdInput.value;
    const node = nodes.find(n => n.id === id);
    if (node) {
      node.name = propNameInput.value.trim() || node.name;
      node.config.prompt = propDescTextarea.value.trim();
      
      if (node.type === 'agent') {
        node.config.model = propModelSelect.value;
      }
      
      showToast(`Updated parameters for node: ${node.name}`, 'success');
      closePropertiesDrawer();
      renderGraph();
    }
  });

  btnDeleteNode.addEventListener('click', () => {
    const id = propIdInput.value;
    const nodeIndex = nodes.findIndex(n => n.id === id);
    if (nodeIndex !== -1) {
      const name = nodes[nodeIndex].name;
      nodes.splice(nodeIndex, 1);
      
      // Delete any connections associated
      connections = connections.filter(c => c.fromId !== id && c.toId !== id);
      
      log(`Deleted node: ${name}`, 'system-log');
      closePropertiesDrawer();
      renderGraph();
    }
  });

  // Metrics logic
  function updateMetrics() {
    const metricTime = document.getElementById('metric-time');
    const metricManualTime = document.getElementById('metric-manual-time');
    const metricCost = document.getElementById('metric-cost');
    const metricAccuracy = document.getElementById('metric-accuracy');
    const metricAccuracySub = document.getElementById('metric-accuracy-sub');
    const metricRoi = document.getElementById('metric-roi');
    const metricRoiCash = document.getElementById('metric-roi-cash');

    if (!metricTime) return;

    if (nodes.length === 0) {
      metricTime.textContent = '0.0s';
      metricManualTime.textContent = '0.0h';
      metricCost.textContent = '$0.00';
      metricAccuracy.textContent = '0%';
      metricAccuracySub.textContent = 'Ready to test';
      metricRoi.textContent = '0%';
      metricRoiCash.textContent = 'Reclaims $0/year';
      return;
    }

    // Math calculation logic
    let totalSec = 0;
    let manualHrs = 0;
    let cost = 0;
    let accuracyBase = 98.5; // Base high accuracy for agency standard
    
    nodes.forEach(node => {
      if (node.type === 'trigger') {
        totalSec += 0.4;
        manualHrs += 0.2;
      } else if (node.type === 'agent') {
        totalSec += 1.8;
        manualHrs += 1.5;
        // Cost based on model weights
        if (node.config.model === 'claude-3-5' || node.config.model === 'gpt-4o') {
          cost += 0.035;
        } else {
          cost += 0.012;
        }
        
        if (node.template === 'web-scraper') {
          accuracyBase -= 0.6; // Scrapers can break
        } else if (node.template === 'pdf-parser') {
          accuracyBase += 0.3;
        }
      } else if (node.type === 'integration') {
        totalSec += 0.6;
        manualHrs += 0.8;
        cost += 0.002;
      } else if (node.type === 'gateway') {
        totalSec += 2.5;
        manualHrs += 2.0;
        accuracyBase += 1.1; // Human in loop makes it 99.9% accurate
      }
    });

    accuracyBase = Math.min(99.98, accuracyBase);
    
    // Extrapolate hourly wages
    const weeklyHoursSaved = manualHrs * 20; // assume 20 runs per week average
    const annualSavings = Math.round(weeklyHoursSaved * 52 * 30); // $30/hr
    const roiMultiplier = Math.max(120, Math.round((annualSavings / 2400) * 100)); // implementation amortised

    metricTime.textContent = totalSec.toFixed(1) + 's';
    metricManualTime.textContent = manualHrs.toFixed(1) + 'h';
    metricCost.textContent = '$' + cost.toFixed(3);
    metricAccuracy.textContent = accuracyBase.toFixed(2) + '%';
    
    if (accuracyBase > 99.5) {
      metricAccuracySub.textContent = 'Institutional Quality';
      metricAccuracySub.style.color = '#10b981';
    } else {
      metricAccuracySub.textContent = 'High Operational Trust';
      metricAccuracySub.style.color = '#38bdf8';
    }

    metricRoi.textContent = roiMultiplier + '% ROI';
    metricRoiCash.textContent = `Reclaims $${annualSavings.toLocaleString()}/year`;
  }

  // Swarm configuration presets loading logic
  const presets = {
    'lead-gen': [
      { template: 'webhook-listener', x: 60, y: 240, name: 'Lead Webhook Listener' },
      { template: 'web-scraper', x: 280, y: 140, name: 'LinkedIn Scraper' },
      { template: 'llm-classifier', x: 280, y: 340, name: 'Score & Segment Agent' },
      { template: 'crm-sync', x: 500, y: 240, name: 'HubSpot Sync Agent' }
    ],
    'invoice-audit': [
      { template: 'email-watcher', x: 60, y: 240, name: 'Invoice Mail Watcher' },
      { template: 'pdf-parser', x: 280, y: 140, name: 'Document OCR Reader' },
      { template: 'llm-classifier', x: 280, y: 340, name: 'Reconciliation Agent' },
      { template: 'human-in-loop', x: 500, y: 240, name: 'Variance Approver' },
      { template: 'db-porter', x: 720, y: 140, name: 'SQL Ledger Writer' },
      { template: 'slack-notifier', x: 720, y: 340, name: 'Slack Alerts Bot' }
    ],
    'customer-support': [
      { template: 'webhook-listener', x: 60, y: 240, name: 'Zendesk Ticket Webhook' },
      { template: 'llm-classifier', x: 280, y: 240, name: 'Sentiment Triage Core' },
      { template: 'web-scraper', x: 500, y: 140, name: 'KB Scraper Agent' },
      { template: 'human-in-loop', x: 500, y: 340, name: 'Support Draft Review' },
      { template: 'email-sender', x: 720, y: 240, name: 'Client Responder API' }
    ]
  };

  const presetConnMap = {
    'lead-gen': [
      [0, 1], [0, 2], [1, 3], [2, 3]
    ],
    'invoice-audit': [
      [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5]
    ],
    'customer-support': [
      [0, 1], [1, 2], [1, 3], [2, 4], [3, 4]
    ]
  };

  function loadPreset(presetKey) {
    // Reset state
    nodes = [];
    connections = [];
    selectedNodeId = null;
    closePropertiesDrawer();
    
    if (presetKey === 'clear') {
      renderGraph();
      log('Cleared Studio workspace. Architect grid ready.', 'system-log');
      return;
    }

    const presetNodes = presets[presetKey];
    if (!presetNodes) return;

    // Load nodes
    presetNodes.forEach(pn => {
      const node = createNode(pn.template, pn.x, pn.y);
      if (node) {
        node.name = pn.name;
        nodes.push(node);
      }
    });

    // Map connections based on index indices map
    const map = presetConnMap[presetKey];
    if (map) {
      map.forEach(([fromIdx, toIdx]) => {
        const fromN = nodes[fromIdx];
        const toN = nodes[toIdx];
        if (fromN && toN) {
          connections.push({
            id: `conn_${fromN.id}_${toN.id}`,
            fromId: fromN.id,
            toId: toN.id
          });
        }
      });
    }

    renderGraph();
    log(`Loaded preset blueprint template: "${presetKey.toUpperCase()}". Grid aligned.`, 'system-log');
  }

  // Bind presets click
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-preset').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      
      const presetKey = btn.dataset.preset;
      loadPreset(presetKey);
    });
  });

  // Load default preset initially
  loadPreset('lead-gen');

  // Logs and telemetry stream helper
  function log(message, className = 'system-log') {
    const time = new Date().toLocaleTimeString().split(' ')[0];
    const entry = document.createElement('div');
    entry.className = `log-entry ${className}`;
    entry.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
    consoleOutput.appendChild(entry);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  clearLogsBtn.addEventListener('click', () => {
    consoleOutput.innerHTML = `<div class="log-entry system-log">&gt;&gt; System log reset. Ready.</div>`;
  });

  // Simulation execution sequencer logic
  runBtn.addEventListener('click', () => {
    if (simulationActive) return;
    if (nodes.length === 0) {
      showToast('Please add nodes to run a simulation.', 'error');
      return;
    }

    simulationActive = true;
    runBtn.disabled = true;
    statusLabel.textContent = 'SYS_RUNNING';
    statusLabel.classList.add('running');
    consolePulse.classList.add('active');

    log('Starting sequential workflow simulation...', 'system-log');
    
    // Sort nodes topologically to compile execution steps
    // Since this is a visual representation, we group nodes into layers to execute
    const triggers = nodes.filter(n => n.type === 'trigger');
    const intermediates = nodes.filter(n => n.type === 'agent' || n.type === 'gateway');
    const integrations = nodes.filter(n => n.type === 'integration');

    let currentStep = 0;
    
    function playStep() {
      if (!simulationActive) return;
      currentStep++;

      // Flash active states on DOM nodes and animate particle wires
      if (currentStep === 1) {
        // Trigger Nodes Layer
        triggers.forEach(t => {
          const el = document.getElementById(t.id);
          if (el) el.classList.add('executing');
          log(`[TRIGGER] Node [${t.name}] triggered event details. Scanning inputs.`, 'coordinator-log');
        });
        
        // Spawn particles towards intermediates
        connections.forEach(conn => {
          if (triggers.some(t => t.id === conn.fromId)) {
            spawnParticlesAlongConnection(conn);
          }
        });

        setTimeout(() => {
          triggers.forEach(t => {
            const el = document.getElementById(t.id);
            if (el) el.classList.remove('executing');
          });
          playStep();
        }, 1600);
      } 
      else if (currentStep === 2) {
        // Agent & Gateway Layer
        intermediates.forEach(item => {
          const el = document.getElementById(item.id);
          if (el) el.classList.add('executing');
          
          if (item.type === 'agent') {
            log(`[COGNITIVE] Agent [${item.name}] parsed JSON data payloads. Model processing...`, 'researcher-log');
          } else {
            log(`[GATEWAY] Validation trigger [${item.name}] checking parameters for compliance.`, 'auditor-log');
          }
        });

        connections.forEach(conn => {
          if (intermediates.some(item => item.id === conn.fromId)) {
            spawnParticlesAlongConnection(conn);
          }
        });

        setTimeout(() => {
          intermediates.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) el.classList.remove('executing');
          });
          playStep();
        }, 2000);
      } 
      else if (currentStep === 3) {
        // Integrations Layer
        integrations.forEach(item => {
          const el = document.getElementById(item.id);
          if (el) el.classList.add('executing');
          log(`[INTEGRATION] Output system [${item.name}] pushing transactions payload database. Status: 200 OK.`, 'coder-log');
        });

        setTimeout(() => {
          integrations.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) el.classList.remove('executing');
          });
          playStep();
        }, 1400);
      } 
      else {
        // Successful Simulation end
        log(`Swarm simulation run completed successfully. All tasks committed.`, 'success-log');
        showToast('Swarm Execution complete!', 'success');
        
        // Clean simulation flags
        simulationActive = false;
        runBtn.disabled = false;
        statusLabel.textContent = 'SYS_IDLE';
        statusLabel.classList.remove('running');
        consolePulse.classList.remove('active');
        stopParticlesAnimation();
      }
    }

    startParticlesAnimation();
    playStep();
  });

  // Animated particles along paths logic
  function spawnParticlesAlongConnection(conn) {
    const fromNode = nodes.find(n => n.id === conn.fromId);
    const toNode = nodes.find(n => n.id === conn.toId);
    if (!fromNode || !toNode) return;

    // Path positions
    const fromX = fromNode.x + 180;
    const fromY = fromNode.y + 25;
    const toX = toNode.x;
    const toY = toNode.y + 25;

    // Spawn 3 sequential particles
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (!simulationActive) return;
        dataParticles.push({
          startX: fromX,
          startY: fromY,
          endX: toX,
          endY: toY,
          progress: 0,
          speed: 0.02 + Math.random() * 0.01,
          size: 4 + Math.random() * 2,
          color: '#6366f1'
        });
      }, i * 300);
    }
  }

  function startParticlesAnimation() {
    if (particleAnimationId) return;

    function anim() {
      // Draw SVG overlay paths and render particles
      drawCables();
      
      // Update dataParticles
      dataParticles = dataParticles.filter(p => {
        p.progress += p.speed;
        
        // Bezier interpolation logic
        const t = p.progress;
        const controlOffset = Math.max(50, Math.abs(p.endX - p.startX) * 0.5);
        const cp1x = p.startX + controlOffset;
        const cp1y = p.startY;
        const cp2x = p.endX - controlOffset;
        const cp2y = p.endY;

        // Cubic Bezier formula
        const x = Math.pow(1-t, 3)*p.startX + 3*Math.pow(1-t, 2)*t*cp1x + 3*(1-t)*Math.pow(t, 2)*cp2x + Math.pow(t, 3)*p.endX;
        const y = Math.pow(1-t, 3)*p.startY + 3*Math.pow(1-t, 2)*t*cp1y + 3*(1-t)*Math.pow(t, 2)*cp2y + Math.pow(t, 3)*p.endY;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', p.size);
        circle.setAttribute('fill', p.color);
        circle.setAttribute('style', `filter: drop-shadow(0 0 6px ${p.color});`);
        svgOverlay.appendChild(circle);

        return p.progress < 1;
      });

      if (simulationActive || dataParticles.length > 0) {
        particleAnimationId = requestAnimationFrame(anim);
      } else {
        particleAnimationId = null;
      }
    }

    anim();
  }

  function stopParticlesAnimation() {
    dataParticles = [];
    if (particleAnimationId) {
      cancelAnimationFrame(particleAnimationId);
      particleAnimationId = null;
    }
    drawCables();
  }

  // Modal Blueprint generator logic
  compileBtn.addEventListener('click', () => {
    if (nodes.length === 0) {
      showToast('Please add nodes to compile a blueprint.', 'error');
      return;
    }

    modalNodesCount.textContent = `${nodes.length} Active Nodes`;
    
    // Feasibility Math
    let score = 96.5;
    let triggersCount = nodes.filter(n=>n.type==='trigger').length;
    let agentsCount = nodes.filter(n=>n.type==='agent').length;
    let gatewayCount = nodes.filter(n=>n.type==='gateway').length;
    let integrationsCount = nodes.filter(n=>n.type==='integration').length;

    if (triggersCount > 1) score -= 4.0;
    if (gatewayCount === 0) score -= 8.0; // Human verification makes it high feasibility B2B
    score = Math.max(72, Math.min(99, score));
    modalFeasibility.textContent = `${score}% (${score >= 90 ? 'High Match' : 'Medium Feasibility'})`;
    modalWorkflowType.textContent = triggersCount > 0 ? 'Triggered Event Swarm' : 'Manual Run Swarm';

    // Annualised Cash estimation
    let manualHrs = 0;
    nodes.forEach(n => {
      if (n.type === 'trigger') manualHrs += 0.2;
      else if (n.type === 'agent') manualHrs += 1.5;
      else if (n.type === 'integration') manualHrs += 0.8;
      else if (n.type === 'gateway') manualHrs += 2.0;
    });

    const weeklyHoursSaved = manualHrs * 20;
    const annualSavings = Math.round(weeklyHoursSaved * 52 * 30);
    modalSavings.textContent = `$${annualSavings.toLocaleString()}`;
    
    const speedRatio = Math.max(8, (manualHrs * 3600 / (nodes.length * 2.5)).toFixed(1));
    modalEfficiency.textContent = `${speedRatio}x faster`;

    // Populate flow diagram html
    modalFlowDiagram.innerHTML = '';
    const triggers = nodes.filter(n=>n.type==='trigger');
    const list = [];
    
    // Simple traversal tracing
    if (triggers.length > 0) {
      list.push(triggers[0]);
      let current = triggers[0];
      let depth = 0;
      while (depth < 5) {
        const nextConn = connections.find(c => c.fromId === current.id);
        if (nextConn) {
          const nextNode = nodes.find(n => n.id === nextConn.toId);
          if (nextNode && !list.includes(nextNode)) {
            list.push(nextNode);
            current = nextNode;
            depth++;
          } else {
            break;
          }
        } else {
          break;
        }
      }
    } else {
      // fallback just list first 3 nodes
      nodes.slice(0, 3).forEach(n => list.push(n));
    }

    list.forEach((n, idx) => {
      const span = document.createElement('span');
      span.className = 'flow-node-tag';
      span.textContent = n.name;
      modalFlowDiagram.appendChild(span);

      if (idx < list.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'flow-arrow';
        arrow.textContent = ' ➔ ';
        modalFlowDiagram.appendChild(arrow);
      }
    });

    modalBackdrop.classList.add('open');
  });

  // Modal close handlers
  btnCloseModal.addEventListener('click', () => {
    modalBackdrop.classList.remove('open');
  });

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.remove('open');
    }
  });

  btnModalDeploy.addEventListener('click', () => {
    modalBackdrop.classList.remove('open');
    
    // Compile JSON blueprint report text
    let blueprintStr = `Hi Mazin,\n\nI have architected a custom AI Swarm Blueprint using the Swarm Architect Studio. Below are my configuration details:\n\n- Active Nodes (${nodes.length}):\n`;
    nodes.forEach(n => {
      blueprintStr += `  * [${n.name}] (${NODE_TEMPLATES[n.template].name} - ${n.type.toUpperCase()})\n`;
    });
    blueprintStr += `\n- Connections Flow:\n`;
    connections.forEach(c => {
      const fromN = nodes.find(n => n.id === c.fromId);
      const toN = nodes.find(n => n.id === c.toId);
      if (fromN && toN) {
        blueprintStr += `  * ${fromN.name} ➔ ${toN.name}\n`;
      }
    });
    blueprintStr += `\n- Estimated Annual Savings: ${modalSavings.textContent}\n- Feasibility Rating: ${modalFeasibility.textContent}\n- Speed multiplier: ${modalEfficiency.textContent}\n\nLet's get this swarm set up in production.`;

    const contactMessage = document.getElementById('contact-message');
    if (contactMessage) {
      contactMessage.value = blueprintStr;
    }
    
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }

    showToast('Blueprint data compiled and synced with the briefing form below!', 'success');
  });
}

/* ==========================================================================
   ROI AUTOMATION CALCULATOR WIDGET
   ========================================================================== */

function initRoiCalculator() {
  const inputEmployees = document.getElementById('input-employees');
  const inputHours = document.getElementById('input-hours');
  const inputWage = document.getElementById('input-wage');

  const valEmployees = document.getElementById('val-employees');
  const valHours = document.getElementById('val-hours');
  const valWage = document.getElementById('val-wage');

  const outHoursSaved = document.getElementById('calc-hours-saved');
  const outFte = document.getElementById('calc-fte');
  const outMonthlyCash = document.getElementById('calc-monthly-cash');
  const outAnnualCash = document.getElementById('calc-annual-cash');

  if (!inputEmployees) return;

  function calculate() {
    const employees = parseInt(inputEmployees.value);
    const hours = parseInt(inputHours.value);
    const wage = parseInt(inputWage.value);

    valEmployees.textContent = employees;
    valHours.textContent = `${hours} hrs`;
    valWage.textContent = `$${wage}`;

    const weeklyHoursSaved = employees * hours;
    const monthlyHoursSaved = weeklyHoursSaved * 4.33;
    const weeklyCashSaved = weeklyHoursSaved * wage;
    
    const monthlyCashSaved = weeklyCashSaved * 4.33;
    const annualCashSaved = weeklyCashSaved * 52;
    const fte = (weeklyHoursSaved / 40).toFixed(1);

    outHoursSaved.textContent = `${weeklyHoursSaved.toLocaleString()} hrs`;
    outFte.textContent = `${fte} FTEs`;
    outMonthlyCash.textContent = `$${Math.round(monthlyCashSaved).toLocaleString()}`;
    outAnnualCash.textContent = `$${Math.round(annualCashSaved).toLocaleString()}`;
  }

  inputEmployees.addEventListener('input', calculate);
  inputHours.addEventListener('input', calculate);
  inputWage.addEventListener('input', calculate);

  calculate();
}

/* ==========================================================================
   CONTACT FORM & TOAST POPUP BINDINGS
   ========================================================================== */

function initContactForm() {
  const form = document.getElementById('agency-contact-form');
  if (!form) return;

  const btnSubmit = document.getElementById('btn-submit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const nameInput = document.getElementById('contact-name');
    const companyInput = document.getElementById('contact-company');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');

    if (!nameInput.value.trim()) { invalidateField(nameInput, true); isValid = false; }
    else { invalidateField(nameInput, false); }

    if (!companyInput.value.trim()) { invalidateField(companyInput, true); isValid = false; }
    else { invalidateField(companyInput, false); }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) { invalidateField(emailInput, true); isValid = false; }
    else { invalidateField(emailInput, false); }

    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) { invalidateField(messageInput, true); isValid = false; }
    else { invalidateField(messageInput, false); }

    if (isValid) {
      btnSubmit.disabled = true;
      const originalText = btnSubmit.innerHTML;
      btnSubmit.innerHTML = `<span>Aligning Swarm...</span><svg class="pulse-emerald" style="margin-left: 8px; width: 8px; height: 8px;"></svg>`;
      
      setTimeout(() => {
        showToast("Briefing submitted successfully! Mazin Munir's team will contact you in 12 hours.", "success");
        form.reset();
        invalidateAllFields(false);
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
      }, 1500);
    } else {
      showToast("Please review form parameters. Active audit fields are missing.", "error");
    }
  });

  function invalidateField(inputElement, isInvalid) {
    const group = inputElement.parentElement;
    if (isInvalid) group.classList.add('has-error');
    else group.classList.remove('has-error');
  }

  function invalidateAllFields(isInvalid) {
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => invalidateField(input, isInvalid));
  }
}

/* ==========================================================================
   DYNAMIC TOAST NOTIFICATION UI SYSTEM
   ========================================================================== */

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '';
  if (type === 'success') {
    icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color:#10b981"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else {
    icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color:#ef4444"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5100);
}