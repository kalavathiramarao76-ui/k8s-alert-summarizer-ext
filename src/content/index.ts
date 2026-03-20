// Content script for PagerDuty, Grafana, and Datadog pages
// Injects "Analyze Alert" buttons near alert content

function createAnalyzeButton(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.textContent = '🔍 Analyze Alert';
  btn.setAttribute('data-k8s-analyzer', 'true');
  Object.assign(btn.style, {
    position: 'relative',
    zIndex: '10000',
    padding: '6px 14px',
    margin: '4px 8px',
    backgroundColor: '#326ce5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    boxShadow: '0 2px 6px rgba(50,108,229,0.3)',
    transition: 'all 0.2s',
  });
  btn.addEventListener('mouseenter', () => {
    btn.style.backgroundColor = '#4a85f0';
    btn.style.transform = 'translateY(-1px)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.backgroundColor = '#326ce5';
    btn.style.transform = 'translateY(0)';
  });
  return btn;
}

function extractAlertText(element: HTMLElement): string {
  // Try to find structured alert data first
  const pre = element.querySelector('pre, code, [class*="json"], [class*="alert-body"]');
  if (pre?.textContent) return pre.textContent.trim();

  // Fall back to the element's text content
  const title = element.querySelector('[class*="title"], [class*="summary"], h1, h2, h3');
  const body = element.querySelector('[class*="body"], [class*="detail"], [class*="description"]');

  let text = '';
  if (title?.textContent) text += `Title: ${title.textContent.trim()}\n`;
  if (body?.textContent) text += `Details: ${body.textContent.trim()}\n`;
  if (!text) text = element.textContent?.trim().slice(0, 2000) || '';

  return text;
}

function injectButtons() {
  // Don't double-inject
  if (document.querySelector('[data-k8s-analyzer]')) return;

  const hostname = window.location.hostname;
  let alertContainers: NodeListOf<Element> | Element[] = [];

  if (hostname.includes('pagerduty.com')) {
    alertContainers = document.querySelectorAll(
      '[class*="incident"], [class*="alert"], [data-type="incident"]'
    );
  } else if (hostname.includes('grafana')) {
    alertContainers = document.querySelectorAll(
      '[class*="alert-rule"], [class*="alerting"], [data-testid*="alert"]'
    );
  } else if (hostname.includes('datadoghq.com')) {
    alertContainers = document.querySelectorAll(
      '[class*="monitor"], [class*="alert"], [data-test-id*="monitor"]'
    );
  }

  if (alertContainers.length === 0) {
    // Generic: look for elements with "alert" in class/id
    alertContainers = document.querySelectorAll(
      '[class*="alert"]:not(button):not(a), [id*="alert"]:not(button):not(a)'
    );
  }

  alertContainers.forEach((container) => {
    if (container.querySelector('[data-k8s-analyzer]')) return;

    const btn = createAnalyzeButton();
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      const alertText = extractAlertText(container as HTMLElement);
      if (!alertText) {
        btn.textContent = 'No alert data found';
        setTimeout(() => { btn.textContent = '🔍 Analyze Alert'; }, 2000);
        return;
      }

      btn.textContent = '⏳ Opening...';

      chrome.runtime.sendMessage({
        type: 'ANALYZE_ALERT',
        data: alertText,
      });

      // Try to open side panel
      chrome.runtime.sendMessage({ type: 'OPEN_SIDEPANEL' });

      setTimeout(() => { btn.textContent = '🔍 Analyze Alert'; }, 2000);
    });

    // Insert at the top of the container
    const el = container as HTMLElement;
    el.style.position = el.style.position || 'relative';
    el.insertBefore(btn, el.firstChild);
  });
}

// Run on load and observe DOM changes
function init() {
  injectButtons();

  const observer = new MutationObserver(() => {
    setTimeout(injectButtons, 500);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
