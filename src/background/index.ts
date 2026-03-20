import { streamCompletion, type ChatMessage } from '../shared/api';
import { SYSTEM_PROMPT, analyzeAlertPrompt, generateRunbookPrompt, correlateAlertsPrompt, classifySeverityPrompt } from '../shared/prompts';
import type { MessagePayload, PerfMetrics, K8sAlertType } from '../shared/types';

const metrics: PerfMetrics = {
  requestCount: 0,
  avgResponseTime: 0,
  lastResponseTime: 0,
  throughput: 0,
  startTime: Date.now(),
};

function updateMetrics(responseTime: number) {
  metrics.requestCount++;
  metrics.lastResponseTime = responseTime;
  metrics.avgResponseTime =
    (metrics.avgResponseTime * (metrics.requestCount - 1) + responseTime) / metrics.requestCount;
  const elapsed = (Date.now() - metrics.startTime) / 1000;
  metrics.throughput = metrics.requestCount / (elapsed || 1);
}

// Open side panel on action click
chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: false }).catch(() => {});

chrome.runtime.onMessage.addListener((message: MessagePayload, _sender, sendResponse) => {
  if (message.type === 'GET_METRICS') {
    sendResponse({ type: 'METRICS_RESULT', data: { ...metrics } });
    return true;
  }

  const requestId = message.requestId || crypto.randomUUID();
  const startTime = Date.now();

  const handleStream = (messages: ChatMessage[]) => {
    streamCompletion(
      messages,
      (chunk) => {
        chrome.runtime.sendMessage({
          type: 'STREAM_CHUNK',
          data: chunk,
          requestId,
        }).catch(() => {});
      },
      () => {
        updateMetrics(Date.now() - startTime);
        chrome.runtime.sendMessage({
          type: 'STREAM_DONE',
          requestId,
        }).catch(() => {});
      },
      (error) => {
        chrome.runtime.sendMessage({
          type: 'STREAM_ERROR',
          data: error,
          requestId,
        }).catch(() => {});
      }
    );
  };

  switch (message.type) {
    case 'ANALYZE_ALERT': {
      const alert = message.data as string;
      handleStream([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: analyzeAlertPrompt(alert) },
      ]);
      sendResponse({ requestId });
      break;
    }
    case 'GENERATE_RUNBOOK': {
      const alertType = message.data as K8sAlertType;
      handleStream([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: generateRunbookPrompt(alertType) },
      ]);
      sendResponse({ requestId });
      break;
    }
    case 'CORRELATE_ALERTS': {
      const alerts = message.data as string[];
      handleStream([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: correlateAlertsPrompt(alerts) },
      ]);
      sendResponse({ requestId });
      break;
    }
    case 'CLASSIFY_SEVERITY': {
      const alert = message.data as string;
      handleStream([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: classifySeverityPrompt(alert) },
      ]);
      sendResponse({ requestId });
      break;
    }
  }
  return true;
});

// Context menu for quick analysis
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus?.create({
    id: 'analyze-selection',
    title: 'Analyze K8s Alert',
    contexts: ['selection'],
  });
});

chrome.contextMenus?.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyze-selection' && info.selectionText && tab?.id) {
    chrome.sidePanel?.open({ tabId: tab.id }).catch(() => {});
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: 'ANALYZE_ALERT',
        data: info.selectionText,
      }).catch(() => {});
    }, 500);
  }
});
