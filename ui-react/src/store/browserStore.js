import { create } from 'zustand'
import { MeshLogo } from '../assets/DynamicAssets'
import { createNativeBrowserAdapter } from '../services/nativeBrowser'

let reloadTimeout

const initialTabs = [
  { id: 1, type: 'web', title: 'GitHub', url: 'https://github.com', icon: 'https://cdn.simpleicons.org/github/181717' },
  { id: 2, type: 'web', title: 'YouTube', url: 'https://youtube.com', icon: 'https://cdn.simpleicons.org/youtube/FF0000' },
  { id: 3, type: 'web', title: 'Figma Community', url: 'https://figma.com/community', icon: 'https://cdn.simpleicons.org/figma/F24E1E' },
  { id: 4, type: 'web', title: 'Spotify Web Player', url: 'https://open.spotify.com', icon: 'https://cdn.simpleicons.org/spotify/1DB954' },
  { id: 5, type: 'web', title: 'Google Search', url: 'https://google.com', icon: 'https://cdn.simpleicons.org/google/4285F4' },
]

const useBrowserStore = create((set, get) => {
  const native = createNativeBrowserAdapter(set, get)

  return {
    user: {
      id: 1,
      username: 'bernard.bear',
      name: 'Bernard Bear',
      email: 'bernard.bear@example.com',
    },
    tabs: initialTabs,
    activeTabId: initialTabs[0].id,
    reloadingTabId: null,
    popupId: null,
    nativeReady: false,
    addNewTab: (type, title, icon) => {
      if (type === 'system') {
        const id = `system-${Date.now()}`
        set((state) => ({
          tabs: [...state.tabs, { id, type: 'system', title: title || 'Settings', icon: icon || MeshLogo }],
          activeTabId: id,
        }))
        return id
      }
      return native.openTab()
    },
    closeTab: native.closeTab,
    setPopupId: (popup) => set({ popupId: popup }),
    setActiveTabId: native.activateTab,
    navigate: native.navigate,
    goBack: native.goBack,
    goForward: native.goForward,
    reload: native.reload,
    goHome: native.goHome,
    startNative: native.start,
    stopNative: native.stop,
    startReload: () => {
      clearTimeout(reloadTimeout)
      const reloadingTabId = get().activeTabId
      set({ reloadingTabId })
      native.reload()
      reloadTimeout = setTimeout(() => {
        set({ reloadingTabId: null })
        reloadTimeout = undefined
      }, 3000)
    },
  }
})

export default useBrowserStore
