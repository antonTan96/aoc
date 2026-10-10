/**
 * Advent of Code Python Solutions Explorer - Frontend Application Logic
 */

(function () {
  'use strict';

  // State Management
  const state = {
    days: [],
    selectedDayId: null,
    selectedFilename: null,
    currentFileContent: '',
    viewMode: 'single', // 'single' or 'diff'
    wrapLines: false,
    drawerOpen: false,
    drawerFilename: null,
    searchDebounceTimer: null,
  };

  // DOM Elements
  const el = {
    sidebar: document.getElementById('sidebar'),
    btnToggleSidebar: document.getElementById('btnToggleSidebar'),
    daysStripNav: document.getElementById('daysStripNav'),
    daysAccordionList: document.getElementById('daysAccordionList'),
    sidebarFilterInput: document.getElementById('sidebarFilterInput'),
    btnClearSidebarFilter: document.getElementById('btnClearSidebarFilter'),
    sidebarDaysBadge: document.getElementById('sidebarDaysBadge'),
    statDaysCount: document.getElementById('statDaysCount'),
    statFilesCount: document.getElementById('statFilesCount'),
    
    // Breadcrumbs & tabs
    bcDay: document.getElementById('bcDay'),
    bcFile: document.getElementById('bcFile'),
    solutionTabs: document.getElementById('solutionTabs'),
    
    // View modes
    btnModeSingle: document.getElementById('btnModeSingle'),
    btnModeDiff: document.getElementById('btnModeDiff'),
    singleCodeView: document.getElementById('singleCodeView'),
    diffView: document.getElementById('diffView'),
    
    // Code viewer elements
    codeWorkspace: document.getElementById('codeWorkspace'),
    lineNumbersCol: document.getElementById('lineNumbersCol'),
    codeBlock: document.getElementById('codeBlock'),
    codePre: document.getElementById('codePre'),
    btnToggleWrap: document.getElementById('btnToggleWrap'),
    btnCopyCode: document.getElementById('btnCopyCode'),
    btnRawCode: document.getElementById('btnRawCode'),
    
    // Metadata
    metaLines: document.getElementById('metaLines'),
    metaSize: document.getElementById('metaSize'),
    metaRelatedChips: document.getElementById('metaRelatedChips'),
    
    // Diff view elements
    diffLeftTitle: document.getElementById('diffLeftTitle'),
    diffLeftLines: document.getElementById('diffLeftLines'),
    diffLeftGutter: document.getElementById('diffLeftGutter'),
    diffLeftCode: document.getElementById('diffLeftCode'),
    diffRightTitle: document.getElementById('diffRightTitle'),
    diffRightLines: document.getElementById('diffRightLines'),
    diffRightGutter: document.getElementById('diffRightGutter'),
    diffRightCode: document.getElementById('diffRightCode'),
    
    // Data drawer
    dataDrawer: document.getElementById('dataDrawer'),
    dataDrawerHeader: document.getElementById('dataDrawerHeader'),
    dataDrawerContent: document.getElementById('dataDrawerContent'),
    drawerTabs: document.getElementById('drawerTabs'),
    drawerCode: document.getElementById('drawerCode'),
    btnToggleDrawer: document.getElementById('btnToggleDrawer'),
    
    // Search modal
    btnOpenSearch: document.getElementById('btnOpenSearch'),
    btnCloseSearch: document.getElementById('btnCloseSearch'),
    searchModalBackdrop: document.getElementById('searchModalBackdrop'),
    globalSearchInput: document.getElementById('globalSearchInput'),
    searchResultsContainer: document.getElementById('searchResultsContainer'),
    
    // Toast
    toast: document.getElementById('toastNotification'),
    toastMsg: document.getElementById('toastMsg'),
  };

  // Utility: Format file size
  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Toast Notification
  function showToast(message) {
    el.toastMsg.textContent = message;
    el.toast.classList.add('show');
    setTimeout(() => {
      el.toast.classList.remove('show');
    }, 2500);
  }

  // Fetch Days Manifest
  async function loadDaysManifest() {
    try {
      const res = await fetch('/api/days');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      state.days = data.days || [];

      // Calculate total files
      let totalPythonFiles = 0;
      state.days.forEach(d => {
        totalPythonFiles += d.python_files.length;
      });

      // Update statistics
      el.statDaysCount.textContent = state.days.length;
      el.statFilesCount.textContent = totalPythonFiles;
      el.sidebarDaysBadge.textContent = `${state.days.length} Days`;

      // Render components
      renderDaysStripNav();
      renderSidebarAccordion();

      // Default selection: day_1 or first available
      if (state.days.length > 0) {
        const firstDay = state.days[0];
        const firstFile = firstDay.python_files[0] || { name: 'attempt.py' };
        selectDayAndFile(firstDay.id, firstFile.name);
      }
    } catch (err) {
      console.error('Failed to load days:', err);
      el.daysAccordionList.innerHTML = `
        <div class="search-empty-state">
          <p>⚠️ Unable to load solutions from backend server.</p>
          <small>${err.message}</small>
        </div>`;
    }
  }

  // Render Horizontal Day Strip
  function renderDaysStripNav() {
    el.daysStripNav.innerHTML = '';
    state.days.forEach(day => {
      const pill = document.createElement('button');
      pill.className = `strip-day-pill ${state.selectedDayId === day.id ? 'active' : ''}`;
      pill.textContent = `Day ${day.day_number}`;
      pill.dataset.dayId = day.id;
      pill.addEventListener('click', () => {
        const pyFile = day.python_files[0] ? day.python_files[0].name : 'attempt.py';
        selectDayAndFile(day.id, pyFile);
      });
      el.daysStripNav.appendChild(pill);
    });
  }

  // Render Sidebar Day List Accordion
  function renderSidebarAccordion(filterQuery = '') {
    const q = filterQuery.toLowerCase().trim();
    el.daysAccordionList.innerHTML = '';

    const filteredDays = state.days.filter(d => {
      if (!q) return true;
      if (d.title.toLowerCase().includes(q)) return true;
      if (d.id.toLowerCase().includes(q)) return true;
      return d.python_files.some(f => f.name.toLowerCase().includes(q));
    });

    if (filteredDays.length === 0) {
      el.daysAccordionList.innerHTML = `
        <div class="search-empty-state">
          <p>No matching days found.</p>
        </div>`;
      return;
    }

    filteredDays.forEach(day => {
      const isSelected = state.selectedDayId === day.id;
      const card = document.createElement('div');
      card.className = `day-card ${isSelected ? 'active expanded' : ''}`;
      card.id = `card-${day.id}`;

      // Card Header
      const header = document.createElement('div');
      header.className = 'day-header';
      header.innerHTML = `
        <div class="day-header-left">
          <span class="day-arrow">▶</span>
          <span class="day-name">${day.title}</span>
        </div>
        <div class="day-badges">
          <span class="count-badge" title="${day.python_files.length} solution parts">${day.python_files.length} sol</span>
        </div>
      `;

      header.addEventListener('click', () => {
        const wasExpanded = card.classList.contains('expanded');
        // Toggle expanded
        card.classList.toggle('expanded');
        if (!wasExpanded && day.python_files.length > 0) {
          selectDayAndFile(day.id, day.python_files[0].name);
        }
      });

      // Files List
      const filesList = document.createElement('div');
      filesList.className = 'day-files-list';

      // Python files first
      day.python_files.forEach(f => {
        const isFileActive = isSelected && state.selectedFilename === f.name;
        const partLabel = f.name === 'attempt.py' ? 'Part 1' : (f.name === 'attempt2.py' ? 'Part 2' : f.name);
        
        const row = document.createElement('div');
        row.className = `file-row ${isFileActive ? 'active' : ''}`;
        row.innerHTML = `
          <div class="file-row-left">
            <span class="file-tag py">PY</span>
            <span class="file-title">${partLabel}</span>
          </div>
          <span class="file-meta">${f.lines}L</span>
        `;
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          selectDayAndFile(day.id, f.name);
        });
        filesList.appendChild(row);
      });

      // Other files (input.in, test.in)
      day.other_files.forEach(f => {
        const row = document.createElement('div');
        row.className = 'file-row';
        row.innerHTML = `
          <div class="file-row-left">
            <span class="file-tag in">DATA</span>
            <span class="file-title">${f.name}</span>
          </div>
          <span class="file-meta">${formatBytes(f.size)}</span>
        `;
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          selectDayAndFile(day.id, day.python_files[0]?.name || 'attempt.py');
          openDrawerWithFile(day.id, f.name);
        });
        filesList.appendChild(row);
      });

      card.appendChild(header);
      card.appendChild(filesList);
      el.daysAccordionList.appendChild(card);
    });
  }

  // Select a Day and File to Display
  async function selectDayAndFile(dayId, filename) {
    state.selectedDayId = dayId;
    state.selectedFilename = filename;

    // Update strip active pill
    document.querySelectorAll('.strip-day-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.dayId === dayId);
    });

    // Update sidebar active highlights
    document.querySelectorAll('.day-card').forEach(card => {
      const isCardSelected = card.id === `card-${dayId}`;
      card.classList.toggle('active', isCardSelected);
      if (isCardSelected) card.classList.add('expanded');
    });

    // Update breadcrumbs
    const currentDay = state.days.find(d => d.id === dayId);
    el.bcDay.textContent = currentDay ? currentDay.title : dayId;
    el.bcFile.textContent = filename;

    // Render solution part tabs
    renderSolutionTabs(currentDay);

    // Fetch and display code
    await fetchAndRenderCode(dayId, filename);

    // Update diff view button visibility
    const hasMultiplePy = currentDay && currentDay.python_files.length >= 2;
    el.btnModeDiff.style.display = hasMultiplePy ? 'flex' : 'none';

    // If currently in diff mode, update diff panes
    if (state.viewMode === 'diff') {
      loadDiffView(currentDay);
    }

    // Update raw button href
    el.btnRawCode.href = `/api/raw?day=${encodeURIComponent(dayId)}&filename=${encodeURIComponent(filename)}`;

    // Update related files in metadata bar
    updateRelatedChips(currentDay);
  }

  // Render Tabs (Part 1, Part 2, etc.)
  function renderSolutionTabs(day) {
    el.solutionTabs.innerHTML = '';
    if (!day) return;

    day.python_files.forEach(f => {
      const tab = document.createElement('button');
      const isActive = f.name === state.selectedFilename;
      tab.className = `sol-tab ${isActive ? 'active' : ''}`;
      const label = f.name === 'attempt.py' ? '★ Part 1' : (f.name === 'attempt2.py' ? '★★ Part 2' : f.name);
      tab.textContent = label;
      tab.addEventListener('click', () => {
        selectDayAndFile(day.id, f.name);
      });
      el.solutionTabs.appendChild(tab);
    });
  }

  // Update Related Files Chips
  function updateRelatedChips(day) {
    el.metaRelatedChips.innerHTML = '';
    if (!day || !day.other_files.length) {
      el.metaRelatedChips.innerHTML = '<span style="color:var(--text-dim);font-size:0.7rem">None</span>';
      return;
    }

    day.other_files.forEach(f => {
      const btn = document.createElement('button');
      btn.className = 'meta-chip-btn';
      btn.textContent = f.name;
      btn.title = `Preview ${f.name} in data drawer`;
      btn.addEventListener('click', () => {
        openDrawerWithFile(day.id, f.name);
      });
      el.metaRelatedChips.appendChild(btn);
    });
  }

  // Fetch and Render Code Content
  async function fetchAndRenderCode(dayId, filename) {
    el.codeBlock.textContent = '# Fetching solution code...';
    el.lineNumbersCol.innerHTML = '';

    try {
      const res = await fetch(`/api/file?day=${encodeURIComponent(dayId)}&filename=${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      state.currentFileContent = data.content || '';

      // Update Metadata
      el.metaLines.textContent = data.line_count || 0;
      el.metaSize.textContent = formatBytes(data.size_bytes || 0);

      // Render Code & Line Numbers
      renderCodeWithGutter(state.currentFileContent, el.codeBlock, el.lineNumbersCol);

    } catch (err) {
      el.codeBlock.textContent = `# Error loading code: ${err.message}`;
      el.lineNumbersCol.innerHTML = '<span class="line-num">!</span>';
    }
  }

  // Render Line Numbers & Code with Prism Syntax Highlighting
  function renderCodeWithGutter(codeText, codeElement, gutterElement) {
    const lines = codeText.split('\n');
    
    // Gutter line numbers
    let gutterHTML = '';
    for (let i = 1; i <= lines.length; i++) {
      gutterHTML += `<span class="line-num">${i}</span>`;
    }
    gutterElement.innerHTML = gutterHTML;

    // Syntax Highlight
    codeElement.textContent = codeText;
    if (window.Prism) {
      window.Prism.highlightElement(codeElement);
    }
  }

  // Load Diff / Compare View (attempt.py vs attempt2.py)
  async function loadDiffView(day) {
    if (!day || day.python_files.length < 2) return;

    const file1 = day.python_files[0].name;
    const file2 = day.python_files[1].name;

    el.diffLeftTitle.textContent = `${file1} (Part 1)`;
    el.diffRightTitle.textContent = `${file2} (Part 2)`;

    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/file?day=${day.id}&filename=${file1}`).then(r => r.json()),
        fetch(`/api/file?day=${day.id}&filename=${file2}`).then(r => r.json())
      ]);

      el.diffLeftLines.textContent = `${res1.line_count} lines`;
      el.diffRightLines.textContent = `${res2.line_count} lines`;

      renderCodeWithGutter(res1.content, el.diffLeftCode, el.diffLeftGutter);
      renderCodeWithGutter(res2.content, el.diffRightCode, el.diffRightGutter);

    } catch (err) {
      console.error('Diff loading failed:', err);
    }
  }

  // Open Drawer with Specific Data File
  async function openDrawerWithFile(dayId, filename) {
    el.dataDrawerContent.style.display = 'block';
    state.drawerOpen = true;
    el.btnToggleDrawer.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>';
    el.drawerCode.textContent = 'Loading file content...';

    const day = state.days.find(d => d.id === dayId);
    if (day) {
      el.drawerTabs.innerHTML = '';
      day.other_files.forEach(f => {
        const tab = document.createElement('button');
        tab.className = `drawer-tab-btn ${f.name === filename ? 'active' : ''}`;
        tab.textContent = f.name;
        tab.addEventListener('click', () => openDrawerWithFile(dayId, f.name));
        el.drawerTabs.appendChild(tab);
      });
    }

    try {
      const res = await fetch(`/api/file?day=${encodeURIComponent(dayId)}&filename=${encodeURIComponent(filename)}`);
      const data = await res.json();
      el.drawerCode.textContent = data.content || '(Empty file)';
    } catch (err) {
      el.drawerCode.textContent = `Error loading file: ${err.message}`;
    }
  }

  // Global Code Search
  async function executeSearch(query) {
    if (!query || query.trim().length < 2) {
      el.searchResultsContainer.innerHTML = `
        <div class="search-placeholder-state">
          <span>Type at least 2 characters to search across Day 1 to Day 12.</span>
        </div>`;
      return;
    }

    el.searchResultsContainer.innerHTML = `
      <div class="loading-state" style="padding:1.5rem">
        <div class="spinner"></div>
        <span>Searching solution files...</span>
      </div>`;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        el.searchResultsContainer.innerHTML = `
          <div class="search-empty-state">
            <p>No results found for "${escapeHTML(query)}".</p>
          </div>`;
        return;
      }

      let html = '';
      data.results.forEach(res => {
        html += `
          <div class="search-result-card" data-day="${res.day}" data-file="${res.filename}">
            <div class="search-result-header">
              <span class="search-result-day">Day ${res.day_number} &bull; ${res.filename}</span>
              <span class="search-result-line-tag">Line ${res.line_number}</span>
            </div>
            <div class="search-result-snippet">${escapeHTML(res.line_content)}</div>
          </div>`;
      });
      el.searchResultsContainer.innerHTML = html;

      // Click card to navigate
      el.searchResultsContainer.querySelectorAll('.search-result-card').forEach(card => {
        card.addEventListener('click', () => {
          closeSearchModal();
          selectDayAndFile(card.dataset.day, card.dataset.file);
        });
      });

    } catch (err) {
      el.searchResultsContainer.innerHTML = `<div class="search-empty-state"><p>Search error: ${err.message}</p></div>`;
    }
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // Open & Close Search Modal
  function openSearchModal() {
    el.searchModalBackdrop.style.display = 'flex';
    el.globalSearchInput.focus();
    el.globalSearchInput.select();
  }

  function closeSearchModal() {
    el.searchModalBackdrop.style.display = 'none';
  }

  // Copy Code to Clipboard
  function copyActiveCode() {
    if (!state.currentFileContent) return;
    navigator.clipboard.writeText(state.currentFileContent).then(() => {
      showToast('✓ Code copied to clipboard!');
    }).catch(err => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = state.currentFileContent;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('✓ Code copied to clipboard!');
    });
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Sidebar toggle for mobile
    el.btnToggleSidebar.addEventListener('click', () => {
      el.sidebar.classList.toggle('open');
    });

    // Sidebar filter
    el.sidebarFilterInput.addEventListener('input', (e) => {
      const val = e.target.value;
      el.btnClearSidebarFilter.style.display = val ? 'block' : 'none';
      renderSidebarAccordion(val);
    });

    el.btnClearSidebarFilter.addEventListener('click', () => {
      el.sidebarFilterInput.value = '';
      el.btnClearSidebarFilter.style.display = 'none';
      renderSidebarAccordion('');
    });

    // Copy Code
    el.btnCopyCode.addEventListener('click', copyActiveCode);

    // Line Wrap toggle
    el.btnToggleWrap.addEventListener('click', () => {
      state.wrapLines = !state.wrapLines;
      el.codeWorkspace.classList.toggle('wrap-lines', state.wrapLines);
      el.btnToggleWrap.classList.toggle('active', state.wrapLines);
    });

    // Single vs Diff view toggle
    el.btnModeSingle.addEventListener('click', () => {
      state.viewMode = 'single';
      el.btnModeSingle.classList.add('active');
      el.btnModeDiff.classList.remove('active');
      el.singleCodeView.style.display = 'flex';
      el.diffView.style.display = 'none';
    });

    el.btnModeDiff.addEventListener('click', () => {
      state.viewMode = 'diff';
      el.btnModeDiff.classList.add('active');
      el.btnModeSingle.classList.remove('active');
      el.singleCodeView.style.display = 'none';
      el.diffView.style.display = 'flex';
      const day = state.days.find(d => d.id === state.selectedDayId);
      loadDiffView(day);
    });

    // Data drawer header toggle
    el.dataDrawerHeader.addEventListener('click', () => {
      state.drawerOpen = !state.drawerOpen;
      el.dataDrawerContent.style.display = state.drawerOpen ? 'block' : 'none';
      el.btnToggleDrawer.innerHTML = state.drawerOpen ? 
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>' :
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    });

    // Search Modal events
    el.btnOpenSearch.addEventListener('click', openSearchModal);
    el.btnCloseSearch.addEventListener('click', closeSearchModal);

    el.searchModalBackdrop.addEventListener('click', (e) => {
      if (e.target === el.searchModalBackdrop) closeSearchModal();
    });

    el.globalSearchInput.addEventListener('input', (e) => {
      clearTimeout(state.searchDebounceTimer);
      state.searchDebounceTimer = setTimeout(() => {
        executeSearch(e.target.value);
      }, 250);
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearchModal();
      }
      // Escape to close search
      if (e.key === 'Escape' && el.searchModalBackdrop.style.display !== 'none') {
        closeSearchModal();
      }
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadDaysManifest();
  });

})();
