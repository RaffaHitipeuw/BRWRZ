import React, { useState } from 'react'
import Button from '../components/ui/button'
import { MeshLogo } from '../assets/DynamicAssets'

function Settings() {
  const [page, setPage] = useState('get-started');
  return (
    <>
    <aside className='w-[20%]'>
      <h1 className="text-[32px] font-semibold">Settings</h1>
      <nav>
        <ul className='flex flex-col text-th-grey'>
          <li className='flex items-center gap-4 p-4 rounded-xl'><i className="fi fi-rs-globe text-base/70" /> Get Started <span className="flex w-1 h-full bg-th-grey rounded-2xl" /></li>
        </ul>
        <Button><MeshLogo/> About Mesh <span className='ml-auto text-th-offgrey'>v1.0.0</span></Button>
      </nav>
    </aside>
    <main className='flex flex-col flex-1 min-w-0 gap-12'>
      <span className="relative flex items-center pr-3 border rounded-lg pl-11 has-focus:outline-2 has-focus:outline-offset-1 border-th-offgrey">
        <i className="absolute fi fi-rs-search text-base/70 text-th-grey left-3" />
        <input type="text" placeholder='Search Settings' className='flex-1 h-10 min-w-0 text-xs text-th-grey placeholder:text-offgrey focus:outline-0' />
      </span>
      <div className='flex flex-col gap-12'></div>
    </main>
    </>
  )
}

export default Settings