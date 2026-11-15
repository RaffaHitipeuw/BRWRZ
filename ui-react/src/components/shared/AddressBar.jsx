import React, { useEffect, useRef, useState } from 'react'
import useBrowserStore from '../../store/browserStore'
import { TLButton } from '../ui/button'
import { bridge } from '../../services/bridge'

function AddressBar() {
  const tabs = useBrowserStore(state => state.tabs)
  const activeTabId = useBrowserStore(state => state.activeTabId)
  const reloadingTabId = useBrowserStore(state => state.reloadingTabId)
  const popupId = useBrowserStore(state => state.popupId)
  const setPopupId = useBrowserStore(state => state.setPopupId)
  const setActiveTabId = useBrowserStore(state => state.setActiveTabId)
  const addNewTab = useBrowserStore(state => state.addNewTab)
  const closeTab = useBrowserStore(state => state.closeTab)
  const [openAddressBar, setOpenAddressBar] = useState(false)
  const [tabStripWidth, setTabStripWidth] = useState(0)
  const tabStripRef = useRef(null)
  const addressBarRef = useRef(null)
  const startReload = useBrowserStore(state => state.startReload)
  const navigate = useBrowserStore(state => state.navigate)
  const goBack = useBrowserStore(state => state.goBack)
  const goForward = useBrowserStore(state => state.goForward)
  // Ganti dengan logic window maximized, logic ini dipakai di window action button
  const [isMaximized, setIsMaximized] = useState(false)
  
  useEffect(() => {
    bridge.windowIsMaximized()
      .then((result) => {
        const value = typeof result === 'boolean'
          ? result
          : Boolean(result?.isMaximized ?? result?.maximized)
  
        setIsMaximized(value)
      })
      .catch((error) => {
        console.error('Failed to get window state:', error)
      })
  }, [])
  
  const toggleMaximize = async () => {
    try {
      await bridge.windowToggleMaximize()
  
      const result = await bridge.windowIsMaximized()
      const value = typeof result === 'boolean'
        ? result
        : Boolean(result?.isMaximized ?? result?.maximized)
  
      setIsMaximized(value)
    } catch (error) {
      console.error('Failed to toggle window:', error)
    }
  }

  useEffect(() => {
    const tabStrip = tabStripRef.current
    if (!tabStrip || typeof ResizeObserver === 'undefined') return

    const updateWidth = () => setTabStripWidth(tabStrip.clientWidth)
    const observer = new ResizeObserver(updateWidth)
    observer.observe(tabStrip)
    updateWidth()

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!openAddressBar) return

    const handlePointerDown = (event) => {
      if (event.target instanceof Node && !addressBarRef.current?.contains(event.target)) {
        setOpenAddressBar(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [openAddressBar])

  const showTabTitles = tabStripWidth / tabs.length >= 90

  return (
    <header className='window-drag-region z-3 py-3 px-2 w-full flex justify-between gap-3'>
      <div className={`window-no-drag flex items-center min-w-max ${openAddressBar && 'flex-1'} justify-start`}>
        <TLButton onClick={startReload} ><i className="flex items-center justify-center rounded-2xl hover:bg-page size-12 fi fi-rs-rotate-right text-lg/70"/></TLButton>
        <TLButton onClick={goBack}><i className="flex items-center justify-center rounded-2xl hover:bg-page size-12 fi fi-rs-arrow-left text-lg/70"/></TLButton>
        <TLButton onClick={goForward}><i className="flex items-center justify-center rounded-2xl hover:bg-page size-12 fi fi-rs-arrow-right text-lg/70"/></TLButton>
        <span ref={addressBarRef} className={`shrink-0 flex items-center p-3.5 bg-page rounded-2xl h-11 transition-all duration-300 ${openAddressBar ? 'flex-1' : 'w-11'}`} onClick={() => setOpenAddressBar(true)}>
          <i className="fi fi-rs-search text-base/70 text-th-grey"/>
          <input type="text" placeholder='Search the web' onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); navigate(event.currentTarget.value); setOpenAddressBar(false) } }} className={`ml-2 text-sm/90 focus:outline-0 w-full placeholder:text-th-offgrey text-th-grey ${!openAddressBar && 'w-0'}`} />
        </span>
      </div>

      <div className={`window-no-drag min-w-0 ${openAddressBar && 'shrink-0'} self-center flex items-center justify-center p-1`}>
        <div
          className="min-w-0 flex p-1 gap-1 bg-page rounded-2xl shadow-subtle"
          style={{
            width: openAddressBar ? '11rem' : `${tabs.length * 12 + 3.25}rem`,
            maxWidth: openAddressBar ? '100%' : 'min(70vw, 100%)',
          }}
        >
          <div ref={tabStripRef} className="min-w-0 flex-1 flex items-center overflow-x-auto scrollbar-none py-2 -my-2 fade-end fade-size-xs gap-0.5 rounded-xl">
            {tabs.map((tab, index) => (
              <React.Fragment key={tab.id}>
                <button
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex flex-1 min-w-19 max-w-47 items-center justify-between px-4 h-10 rounded-xl cursor-pointer ${tab.id === activeTabId ? 'bg-white shadow-subtle' : 'bg-transparent hover:bg-white/60'}`}
                >
                  <span className={`${showTabTitles ? 'gap-2' : 'gap-0'} min-w-0 flex-1 flex items-center`}>  
                    {typeof tab.icon === 'string'
                      ? <div className='relative shrink-0 flex items-center justify-center'>
                          <div className={`transition-all duration-300 w-full h-full scale-120 rounded-full absolute border-transparent border-0 ${tab.id === reloadingTabId && 'animate-spin border-2'}`} style={{ background: 'conic-gradient(from 45deg, var(--color-mesh-red), var(--color-mesh-green) 33%, var(--color-mesh-blue) 67%, var(--color-mesh-red) 100%)', backgroundClip: 'border-area' }} />
                          <img src={tab.icon} alt="" className={`transition-all duration-300 size-5 ${tab.id === reloadingTabId && 'p-0.5'}`} />
                        </div>
                      : tab.icon && 
                      <div className='relative shrink-0 flex items-center justify-center'>
                          <div className={`transition-all duration-300 w-full h-full scale-120 rounded-full absolute border-transparent border-0 ${tab.id === reloadingTabId && 'animate-spin border-2'}`} style={{ background: 'conic-gradient(from 45deg, var(--color-mesh-red), var(--color-mesh-green) 33%, var(--color-mesh-blue) 67%, var(--color-mesh-red) 100%)', backgroundClip: 'border-area' }} />
                          {React.createElement(tab.icon, { className: `transition-all duration-300 size-5 shrink-0 ${tab.id === reloadingTabId && 'p-0.5'}`})}
                        </div>
                      }
                    {showTabTitles && <span className={`${tab.id === activeTabId && 'font-semibold'} overflow-hidden whitespace-nowrap fade-blur-frame fade-end fade-size-sm fade-travel-3xl`}>{tab.title}</span>}
                  </span>
                  <i
                    onClick={(event) => {
                      event.stopPropagation()
                      closeTab(tab.id)
                    }}
                    className="fi fi-rs-cross-small shrink-0 text-base/70 hover:bg-th-grey/20 rounded-full p-0.5 text-th-grey"
                  />
                </button>
                <span className={`h-6 w-0.5 shrink-0 ${index < tabs.length - 1 && tab.id !== activeTabId && tabs[index + 1].id !== activeTabId ? 'bg-th-offgrey' : 'bg-transparent'}`} />
              </React.Fragment>
            ))}
          </div>
          <button onClick={addNewTab} className='flex items-center justify-center size-10 rounded-xl shrink-0 bg-white shadow-subtle cursor-pointer'><i className="fi fi-rs-plus-small text-lg/70" /></button>
        </div>
      </div>

      <div className={`window-no-drag flex items-center min-w-max ${openAddressBar && 'shrink-0'} justify-end gap-2`}>
        <TLButton onClick={() => popupId === 'menu' ? setPopupId(null) : setPopupId('menu')}><i className="flex items-center justify-center rounded-2xl hover:bg-page size-12 fi fi-rs-menu-dots-vertical text-sm/70" /></TLButton>
        <div className="relative flex flex-col">
          <img onClick={() => popupId === 'profile' ? setPopupId(null) : setPopupId('profile')} src="https://images.unsplash.com/photo-1764428950472-14984adb7b99?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" alt="" className='border-4 border-page shadow-subtle cursor-pointer aspect-square size-10 object-cover rounded-xl' />
        </div>
        <span className='flex'>
          <TLButton onClick={() => bridge.windowMinimize().catch(console.error)}>
            <i className="flex items-center justify-center rounded-2xl hover:bg-mesh-green size-12 fi fi-rs-minuss text-sm/70" />
          </TLButton>
        
          <TLButton onClick={toggleMaximize}>
            <i className={`flex items-center justify-center rounded-2xl hover:bg-mesh-blue size-12 fi ${isMaximized ? 'fi-rs-clone' : 'fi-rs-rectangle-horizontal'} text-sm/70`} />
          </TLButton>
        
          <TLButton onClick={() => bridge.windowClose().catch(console.error)}>
            <i className="flex items-center justify-center rounded-2xl hover:bg-mesh-red size-12 fi fi-rs-cross text-sm/70" />
          </TLButton>
        </span>
      </div>
    </header>
  )
}

export default AddressBar
