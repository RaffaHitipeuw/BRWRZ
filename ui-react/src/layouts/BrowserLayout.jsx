import { useEffect } from 'react'
import AddressBar from '../components/shared/AddressBar'
import useBrowserStore from '../store/browserStore'
import Popup from '../components/shared/Popup'
import Button from '../components/ui/button'
import { NewTabIcon, NewWindowIcon } from '../assets/DynamicAssets'
import defaultLightBg from '../assets/default-light-new-tab.png'
import defaultNFLight from '../assets/default-notfound-light.png'
import NewTab from '../pages/NewTab'
import Settings from '../pages/Settings'
import Auth from '../pages/Auth'

function TabWrapper({ children }) {
  return (
    <div className='flex flex-col w-full h-full gap-6 overflow-hidden rounded-xl'>
      {children}
    </div>
  )
}

function BrowserLayout() {
  const activeTabId = useBrowserStore(state => state.activeTabId)
  const tabs = useBrowserStore(state => state.tabs)
  const activeTab = tabs.find((tab) => tab.id === activeTabId)
  const reloadingTabId = useBrowserStore(state => state.reloadingTabId)
  const isReloading = activeTabId === reloadingTabId
  const popupId = useBrowserStore(state => state.popupId)
  const user = useBrowserStore(state => state.user)
  const isSignedIn = user !== null
  const setPopupId = useBrowserStore(state => state.setPopupId)
  const addNewTab = useBrowserStore(state => state.addNewTab)
  const startNative = useBrowserStore(state => state.startNative)
  const stopNative = useBrowserStore(state => state.stopNative)

  useEffect(() => {
    startNative()
    return () => stopNative()
  }, [startNative, stopNative])

  // Notes buat Backend: Logic new tab sekarang belum nge save antar beda new tab, masih pake satu template. Beda tempat kalo input di search bar (bukan address bar ya) masih kebawa ke semua new tab. Tambahin tabID jangan lupa~!
  const tabContent = activeTab && (
    activeTab.type === 'web' ? (
      <div className="flex flex-col justify-end w-full h-full gap-6 overflow-hidden text-page rounded-xl">
        <div className='flex flex-col justify-end w-full h-full gap-6 p-6 bg-mesh-red'>
          <img src={activeTab.icon} className='size-10' />
          <h1 className="font-bold text-2xl/90">{activeTab.title}</h1>
        </div>
      </div>
    ) : activeTab.type === 'new-tab' ? (
      <NewTab/>
    ) : activeTab.type === 'system' ? (
      <TabWrapper>
        <div className='flex justify-end w-full h-full gap-12 p-12'>
          <Settings/>
        </div>
      </TabWrapper>
    ) : (
      <TabWrapper>
        <div style={{ backgroundImage: `url(${defaultNFLight})`}} className="w-full h-full flex flex-col items-center justify-start gap-6 mt-[11%] text-center bg-cover bg-bottom">
          <h1 className="text-3xl font-semibold">Page not found</h1>
          <p className="text-3xl">Oops! you’ve encountered a<br />nonexisting website.</p>
        </div>
      </TabWrapper>
    )
  )

  return (
    <div className='flex flex-col w-full h-full bg-center bg-cover min-w-2xl' style={{
      backgroundImage: `url(${defaultLightBg})`
    }}>
      {isSignedIn ? (
        <>
        <AddressBar/>
        <div className={`transition-all duration-300 w-full relative h-full p-2 overflow-hidden`}>
          {popupId == 'profile' && (
            <Popup className={'top-0 right-8 z-3 gap-2 w-91'}>
              <div className="flex flex-col gap-4 p-6">
                <img src="https://images.unsplash.com/photo-1764428950472-14984adb7b99?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" alt="" className='object-cover size-24 rounded-xl' />
                <h1 className='flex flex-col font-semibold'>
                  Albar Abdul Malik
                  <span className='font-normal text-th-offgrey'>abdulmalik@gmail.com</span>
                </h1>
              </div>
              <div className="h-px bg-page" />
              <div className="flex flex-col px-4 py-2">
                <Button><i className="text-base/70 fi fi-rs-pencil" />Customize Profile</Button>
                <Button><i className="text-base/70 fi fi-rs-key" />Passwords & autofills</Button>
                <Button><i className="text-base/70 fi fi-rs-user-gear" />Manage your account</Button>
              </div>
            </Popup>
          )}
          {popupId == 'menu' && (
            <Popup className={'top-0 right-8 z-3 gap-2 w-116 '}>
              <div className="flex flex-col px-4 py-2">
                <Button onClick={() => { addNewTab(); setPopupId(null) }}><NewTabIcon className={'size-4 text-th-grey'}/>New Tab <span className='ml-auto text-th-offgrey'>Ctrl + T</span></Button>
                <Button><NewWindowIcon className={'size-4 text-th-grey'} />New Window <span className='ml-auto text-th-offgrey'>Ctrl + N</span></Button>
                <Button><i className="text-base/70 fi fi-rs-incognito" />New Private window <span className='ml-auto text-th-offgrey'>Ctrl + Shift + N</span></Button>
              </div>
              <div className="h-px bg-page" />
              <div className="flex flex-col px-4 py-2">
                <Button><i className="text-base/70 fi fi-rs-time-past" />History <i className='ml-auto fi fi-rs-angle-small-right text-th-offgrey'/></Button>
                <Button><i className="text-base/70 fi fi-rs-download" />Downloads <i className='ml-auto fi fi-rs-angle-small-right text-th-offgrey'/></Button>
                <Button><i className="text-base/70 fi fi-rs-bookmark" />Bookmarks <i className='ml-auto fi fi-rs-angle-small-right text-th-offgrey'/></Button>
                <Button><i className="text-base/70 fi fi-rs-puzzle-alt" />Extensions & Themes <i className='ml-auto fi fi-rs-angle-small-right text-th-offgrey'/></Button>
              </div>
              <div className="h-px bg-page" />
              <div className="flex flex-col px-4 py-2">
                <div className='flex items-center gap-4 px-4 h-14 text-th-grey rounded-xl'>
                  <i className="text-base/70 fi fi-rs-pencil" />
                  Zoom
                  <span className='flex items-center gap-2 ml-auto text-th-offgrey'>
                    <Button className={'bg-page hover:bg-th-offgrey p-2 rounded-lg'}><i className="fi fi-rs-minus-small text-base/70" /></Button>
                    100%
                    <Button className={'bg-page hover:bg-th-offgrey p-2 rounded-lg'}><i className="fi fi-rs-plus-small text-base/70" /></Button>
                    <div className="w-px h-full bg-page" />
                    <Button className={'p-2 rounded-lg'}><i className="fi fi-rs-expand text-base/70" /></Button>
                  </span>
                </div>
              </div>
              <div className="h-px bg-page" />
              <div className="flex flex-col px-4 py-2">
                <Button><i className="text-base/70 fi fi-rs-print" />Print <span className='ml-auto text-th-offgrey'>Ctrl + P</span></Button>
                <Button onClick={() => { addNewTab('system', 'Settings'); setPopupId(null) }}><i className="text-base/70 fi fi-rs-settings" />Settings</Button>
              </div>
            </Popup>
          )}
          {/* Main Browser Wrapper */}
          <div className={`transition-all duration-300 w-full h-full rounded-xl border border-page relative`}>
            <main className={`w-full h-full relative z-2`}>
              {/* Main Browser Content goes here..  */}
              {tabContent}
              <div id="reload-ring" style={{
                mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) border-box',
                WebkitMaskComposite: 'xor', // Required for Safari and Chrome/Blink browsers
                maskComposite: 'exclude',     // Standard syntax for modern browsers
                width: 'calc(100% + (4px * 2))',
                height: 'calc(100% + (4px * 2))',
              }} className={`transition-all duration-300 absolute -top-1 -left-1 -z-1 ${isReloading && 'border-4'} rounded-2xl flex items-center justify-center`}>
                <div id="reload-colorant" style={{ 
                  background: 'conic-gradient(from 45deg, var(--color-mesh-red), var(--color-mesh-green) 33%, var(--color-mesh-blue) 67%, var(--color-mesh-red) 100%)',
                }} className={`w-screen h-auto scale-150 aspect-square absolute ${isReloading && 'animate-spin'}`} />
              </div>
            </main>
          </div>
        </div>
        </>
      ) : (
        <Auth/>
      )}
    </div>
  )
}

export default BrowserLayout
