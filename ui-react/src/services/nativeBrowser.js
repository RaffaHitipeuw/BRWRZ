import { bridge, subscribe } from './bridge'

const blankTab = (id = `tab-${Date.now()}`) => ({
  id: String(id),
  type: 'new-tab',
  title: 'New Tab',
  url: '',
  icon: null,
})

function normalizeTab(raw) {
  if (!raw) return null
  const url = String(raw.url || raw.currentUrl || '')
  return {
    id: String(raw.id ?? raw.tabId ?? `tab-${Date.now()}`),
    type: url ? 'web' : 'new-tab',
    title: String(raw.title || (url ? url.replace(/^https?:\/\//, '').split('/')[0] : 'New Tab')),
    url,
    icon: raw.icon || raw.favicon || null,
  }
}

function extractTabs(result) {
  const list = Array.isArray(result) ? result : result?.tabs
  return Array.isArray(list) ? list.map(normalizeTab).filter(Boolean) : []
}

export function createNativeBrowserAdapter(set, get) {
  let cancelSubscription = null
  let started = false
  let sessionTimer = null
  let nativeQueue = Promise.resolve()
  let nativeRevision = 0

  const replaceTabs = (nextTabs, activeId) => {
    const tabs = nextTabs.length ? nextTabs : [blankTab()]
    set((state) => ({
      tabs,
      activeTabId: activeId ? String(activeId) : state.activeTabId && tabs.some((tab) => tab.id === state.activeTabId) ? state.activeTabId : tabs[0].id,
      nativeReady: true,
    }))
  }

  const updateTab = (id, patch) => {
    if (id == null) return
    const tabId = String(id)
    set((state) => ({
      tabs: state.tabs.map((tab) => tab.id === tabId ? { ...tab, ...patch, type: patch.url ? 'web' : (patch.type || tab.type) } : tab),
    }))
  }

  const persistSession = () => {
    clearTimeout(sessionTimer)
    sessionTimer = setTimeout(() => {
      const state = get()
      bridge.sessionSet({
        tabs: state.tabs.map(({ id, title, url }) => ({ id, title, url })),
        activeTabId: state.activeTabId,
      }).catch(() => {})
    }, 150)
  }

  // All native view mutations pass through one queue. A newer request invalidates
  // the remaining steps of an older request, preventing stale show/hide commands.
  const enqueueNative = (task) => {
    const revision = ++nativeRevision
    nativeQueue = nativeQueue
      .catch(() => {})
      .then(async () => {
        if (revision !== nativeRevision) return
        await task(revision)
      })
      .catch((error) => {
        console.error('[mesh] native browser synchronization failed', error)
      })
    return nativeQueue
  }

  const isCurrent = (revision, tabId) =>
    revision === nativeRevision && String(get().activeTabId) === String(tabId)

  const syncActiveNativeView = (revision, tabId, navigateUrl = null) => {
    const active = get().tabs.find((tab) => tab.id === String(tabId))
    if (!active || active.type !== 'web') {
      if (revision === nativeRevision) return bridge.browserShow(false)
      return Promise.resolve()
    }

    return (async () => {
      if (!isCurrent(revision, tabId)) return
      await bridge.browserEnsureTab(tabId)
      if (!isCurrent(revision, tabId)) return
      await bridge.browserActivateTab(tabId)
      if (!isCurrent(revision, tabId)) return
      await bridge.browserShow(true)
      if (!isCurrent(revision, tabId)) return
      if (navigateUrl) await bridge.browserNavigate(navigateUrl, tabId)
    })()
  }

  const syncVisibilityFromCurrentState = () => enqueueNative(async (revision) => {
    const activeId = get().activeTabId
    const active = get().tabs.find((tab) => tab.id === String(activeId))
    if (!active || active.type !== 'web') {
      if (revision === nativeRevision) await bridge.browserShow(false)
      return
    }
    if (isCurrent(revision, activeId)) await bridge.browserShow(true)
  })

  const onEvent = (event) => {
    if (!event?.type) return
    const id = event.tabId ?? event.id
    switch (event.type) {
      case 'tab.created': {
        const tab = normalizeTab({ ...event, id })
        if (!tab) return
        set((state) => ({
          tabs: state.tabs.some((item) => item.id === tab.id) ? state.tabs.map((item) => item.id === tab.id ? { ...item, ...tab } : item) : [...state.tabs, tab],
          activeTabId: event.activate ? tab.id : state.activeTabId,
          nativeReady: true,
        }))
        if (event.activate) syncVisibilityFromCurrentState()
        break
      }
      case 'tab.activated':
        if (id != null) {
          set({ activeTabId: String(id), nativeReady: true })
          syncVisibilityFromCurrentState()
        }
        break
      case 'tab.closed':
        set((state) => {
          const tabs = state.tabs.filter((tab) => tab.id !== String(id))
          const safeTabs = tabs.length ? tabs : [blankTab()]
          return {
            tabs: safeTabs,
            activeTabId: safeTabs.some((tab) => tab.id === state.activeTabId) ? state.activeTabId : safeTabs[0].id,
          }
        })
        enqueueNative((revision) => syncActiveNativeView(revision, get().activeTabId))
        break
      case 'navigate':
      case 'address':
      case 'loading':
      case 'title': {
        const url = event.url || ''
        updateTab(id ?? get().activeTabId, {
          ...(url ? { url, type: 'web' } : {}),
          ...(event.title ? { title: event.title } : {}),
        })
        if (id == null || String(id) === String(get().activeTabId)) syncVisibilityFromCurrentState()
        break
      }
      case 'session': {
        const tabs = extractTabs(event)
        if (tabs.length) {
          replaceTabs(tabs, event.activeTabId)
          syncVisibilityFromCurrentState()
        }
        break
      }
      default:
        break
    }
    persistSession()
  }

  async function start() {
    if (started) return
    started = true

    // Subscribe before fetching state so activation/close events are not missed
    // while session and native tabs are being loaded.
    try {
      const handle = await subscribe('browser', onEvent)
      if (!started) {
        handle?.cancel?.()
        return
      }
      cancelSubscription = handle?.cancel || null
    } catch (_) {
      set({ nativeReady: false })
    }

    try {
      const session = await bridge.sessionGet()
      const sessionTabs = extractTabs(session?.session)
      if (sessionTabs.length && started) replaceTabs(sessionTabs, session.session.activeTabId)
    } catch (_) {}

    try {
      const result = await bridge.tabsList()
      const tabs = extractTabs(result)
      if (tabs.length && started) replaceTabs(tabs, result.activeTabId ?? result.activeId)
    } catch (_) {}

    if (!get().tabs.length) replaceTabs([blankTab()])
    if (started) syncVisibilityFromCurrentState()
  }

  function stop() {
    started = false
    cancelSubscription?.()
    cancelSubscription = null
    clearTimeout(sessionTimer)
    // Invalidate pending visibility operations from the previous lifecycle.
    nativeRevision += 1
  }

  function openTab(initialUrl = '') {
    const id = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const tab = blankTab(id)
    set((state) => ({ tabs: [...state.tabs, tab], activeTabId: id }))

    enqueueNative(async (revision) => {
      await bridge.browserEnsureTab(id)
      if (!isCurrent(revision, id)) return
      await bridge.browserActivateTab(id)
      if (!isCurrent(revision, id)) return
      if (initialUrl) {
        const value = String(initialUrl).trim()
        const url = /^(https?:|file:|about:|mesh:)/i.test(value)
          ? value
          : `https://www.google.com/search?q=${encodeURIComponent(value)}`
        updateTab(id, { url, type: 'web', title: url.replace(/^https?:\/\//, '').split('/')[0] || 'Loading…' })
        await bridge.browserShow(true)
        if (!isCurrent(revision, id)) return
        await bridge.browserNavigate(url, id)
      } else {
        await bridge.browserShow(false)
      }
    })

    persistSession()
    return id
  }

  function closeTab(id) {
    const tabId = String(id)
    const current = get()
    if (current.tabs.length <= 1 || !current.tabs.some((tab) => tab.id === tabId)) return

    const index = current.tabs.findIndex((tab) => tab.id === tabId)
    const tabs = current.tabs.filter((tab) => tab.id !== tabId)
    const wasActive = String(current.activeTabId) === tabId
    const nextActiveId = wasActive ? tabs[Math.min(index, tabs.length - 1)].id : current.activeTabId
    set({ tabs, activeTabId: nextActiveId })

    enqueueNative(async (revision) => {
      await bridge.browserCloseTab(tabId)
      if (!wasActive) return
      if (revision !== nativeRevision) return
      await syncActiveNativeView(revision, nextActiveId)
    })

    persistSession()
  }

  function activateTab(id) {
    const tabId = String(id)
    if (!get().tabs.some((tab) => tab.id === tabId)) return
    set({ activeTabId: tabId })
    enqueueNative((revision) => syncActiveNativeView(revision, tabId))
    persistSession()
  }

  function navigate(raw, id = get().activeTabId) {
    const value = String(raw || '').trim()
    if (!value) return
    const url = /^(https?:|file:|about:|mesh:)/i.test(value)
      ? value
      : `https://www.google.com/search?q=${encodeURIComponent(value)}`
    const tabId = String(id)
    updateTab(tabId, { url, type: 'web', title: url.replace(/^https?:\/\//, '').split('/')[0] || 'Loading…' })

    if (String(get().activeTabId) === tabId) {
      enqueueNative((revision) => syncActiveNativeView(revision, tabId, url))
    } else {
      // Prepare the background native tab without changing the visible tab.
      enqueueNative(async (revision) => {
        await bridge.browserEnsureTab(tabId)
        if (revision !== nativeRevision) return
        await bridge.browserNavigate(url, tabId)
      })
    }

    set({ reloadingTabId: tabId })
    setTimeout(() => set((state) => state.reloadingTabId === tabId ? { reloadingTabId: null } : state), 350)
    persistSession()
  }

  function goBack() { bridge.browserBack().catch(() => {}) }
  function goForward() { bridge.browserForward().catch(() => {}) }
  function reload() { bridge.browserReload(false).catch(() => {}) }

  function goHome() {
    const id = String(get().activeTabId)
    set((state) => ({
      tabs: state.tabs.map((tab) => tab.id === id ? blankTab(id) : tab),
    }))
    enqueueNative(async (revision) => {
      await bridge.browserClear()
      if (revision !== nativeRevision || String(get().activeTabId) !== id) return
      await bridge.browserShow(false)
    })
    persistSession()
  }

  return { start, stop, openTab, closeTab, activateTab, navigate, goBack, goForward, reload, goHome }
}
