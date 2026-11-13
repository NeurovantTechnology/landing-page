import { createClient } from '@supabase/supabase-js';
import './mission-control.css';

const env = /** @type {ImportMeta & { env: { VITE_SUPABASE_URL?: string, VITE_SUPABASE_PUBLISHABLE_KEY?: string } }} */ (import.meta).env;
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabasePublishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

const workflowOrder = [
  'marketing',
  'leads',
  'meetings',
  'support',
  'projects',
  'research',
  'administration',
  'website',
];
const staleAfterMs = 30 * 60 * 1000;

function formatUpdatedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function mountMissionControlStatus(rootElement) {
  if (!(rootElement instanceof HTMLElement)) {
    throw new TypeError('mountMissionControlStatus requires an HTMLElement.');
  }

  const connection = rootElement.querySelector('[data-mc-connection]');
  const headline = rootElement.querySelector('[data-mc-headline]');
  const message = rootElement.querySelector('[data-mc-message]');
  const updated = rootElement.querySelector('[data-mc-updated]');
  const cards = new Map(
    [...rootElement.querySelectorAll('[data-mc-workflow]')]
      .map((card) => [card.dataset.mcWorkflow, card]),
  );

  if (!supabaseUrl || !supabasePublishableKey) {
    if (connection) connection.textContent = 'Live status unavailable';
    if (headline) headline.textContent = 'Status feed is not configured';
    if (message) message.textContent = 'The Neurovant office cannot reach its status service.';
    rootElement.dataset.state = 'disconnected';
    return () => {};
  }

  const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  let rows = [];
  let hasSnapshot = false;
  let feedConnected = false;
  let refreshError = false;

  function setConnection(label, connected) {
    feedConnected = connected;
    if (connection) connection.textContent = label;
    rootElement.dataset.connection = connected ? 'connected' : 'disconnected';
  }

  function render() {
    const now = Date.now();
    const rowByKey = new Map(rows.map((row) => [row.workflow_key, row]));
    const missing = workflowOrder.filter((key) => !rowByKey.has(key));
    const working = rows.filter((row) => row.status === 'working' && now - Date.parse(row.updated_at) <= staleAfterMs);
    const stale = rows.filter((row) => row.status === 'working' && now - Date.parse(row.updated_at) > staleAfterMs);
    const failed = rows.filter((row) => row.status === 'failed');

    if (!hasSnapshot || refreshError) {
      rootElement.dataset.state = 'disconnected';
      if (headline) headline.textContent = hasSnapshot ? 'Status feed disconnected' : 'Connecting to the office…';
      if (message) message.textContent = hasSnapshot
        ? 'The live connection is unavailable. Reconnecting now.'
        : 'Waiting for the scheduled workflow feed.';
    } else if (!feedConnected) {
      rootElement.dataset.state = 'disconnected';
      if (headline) headline.textContent = 'Status feed disconnected';
      if (message) message.textContent = 'The live connection is unavailable. Reconnecting now.';
    } else if (missing.length > 0) {
      rootElement.dataset.state = 'disconnected';
      if (headline) headline.textContent = 'Status feed incomplete';
      if (message) message.textContent = 'Some workflow statuses are missing from the live feed.';
    } else if (stale.length > 0) {
      rootElement.dataset.state = 'delayed';
      if (headline) headline.textContent = 'Activity update delayed';
      if (message) message.textContent = 'A workflow stopped sending updates. Check the scheduled run before treating the office as idle.';
    } else if (working.length > 0) {
      rootElement.dataset.state = 'working';
      if (headline) headline.textContent = working.length === 1 ? 'The office is working' : 'The office is working';
      if (message) message.textContent = working.map((row) => row.workflow_label).join(' · ');
    } else if (failed.length > 0) {
      rootElement.dataset.state = 'attention';
      if (headline) headline.textContent = 'A workflow needs attention';
      if (message) message.textContent = failed.map((row) => row.workflow_label).join(' · ');
    } else {
      rootElement.dataset.state = 'free';
      if (headline) headline.textContent = 'We are free for any work!';
      if (message) message.textContent = 'All scheduled workflows are standing by.';
    }

    for (const workflowKey of workflowOrder) {
      const card = cards.get(workflowKey);
      if (!(card instanceof HTMLElement)) continue;
      const row = rowByKey.get(workflowKey);
      const detail = card.querySelector('[data-mc-detail]');
      const state = card.querySelector('[data-mc-state]');
      const label = card.querySelector('[data-mc-label]');
      if (!row) {
        if (detail) detail.textContent = 'Status unavailable';
        if (state) state.textContent = 'Unavailable';
        card.dataset.state = 'disconnected';
        continue;
      }

      if (label) label.textContent = row.workflow_label;
      const isFreshWorking = row.status === 'working' && now - Date.parse(row.updated_at) <= staleAfterMs;
      const isStaleWorking = row.status === 'working' && !isFreshWorking;
      card.dataset.state = isFreshWorking ? 'working' : isStaleWorking ? 'delayed' : row.status;

      if (isFreshWorking) {
        if (detail) detail.textContent = row.station + ' · ' + row.activity;
        if (state) state.textContent = 'Working';
      } else if (isStaleWorking) {
        if (detail) detail.textContent = 'Last update ' + formatUpdatedAt(row.updated_at);
        if (state) state.textContent = 'Update delayed';
      } else if (row.status === 'failed') {
        if (detail) detail.textContent = 'Last update ' + formatUpdatedAt(row.updated_at);
        if (state) state.textContent = 'Needs attention';
      } else {
        if (detail) detail.textContent = 'Office Floor · Standing by';
        if (state) state.textContent = 'Standing by';
      }
    }

    const latest = rows
      .map((row) => row.updated_at)
      .filter(Boolean)
      .sort((left, right) => Date.parse(right) - Date.parse(left))[0];
    if (updated) {
      updated.textContent = latest ? 'Last update ' + formatUpdatedAt(latest) : '';
      if (latest) updated.dateTime = latest;
      else updated.removeAttribute('datetime');
    }
  }

  async function refresh() {
    const { data, error } = await supabase
      .from('mission_control_activity')
      .select('workflow_key, workflow_label, status, station, activity, updated_at')
      .order('workflow_key');

    if (error) {
      refreshError = true;
      setConnection('Disconnected · reconnecting', false);
    } else {
      rows = data ?? [];
      hasSnapshot = true;
      refreshError = false;
    }
    render();
  }

  const channel = supabase
    .channel('neurovant-mission-control-status')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'mission_control_activity' },
      () => { void refresh(); },
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        refreshError = false;
        setConnection('Live status connected', true);
        void refresh();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        setConnection('Disconnected · reconnecting', false);
        render();
      }
    });

  void refresh();
  const staleTimer = window.setInterval(render, 30_000);

  return () => {
    window.clearInterval(staleTimer);
    void supabase.removeChannel(channel);
  };
}
