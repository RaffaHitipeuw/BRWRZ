import React, { useState } from 'react'
import { MeshLogo } from '../assets/DynamicAssets'
import GoogleG from '../assets/google2025.svg'

function Auth() {
  const [stage, setStage] = useState('signin')
  const [showPassword, setShowPassword] = useState({
    confirm: false,
    main: false,
  })
  const [message, setMessage] = useState(null)

  return (
    <div className='flex flex-col items-center justify-center size-full'>
      <div className='flex flex-col items-center gap-4 w-113'>
        <form className='flex flex-col w-full gap-12 px-9'>
          <MeshLogo className={'w-8 h-auto text-th-grey'}/>
          <h1 className='flex flex-col gap-2 pb-6 text-4xl font-semibold border-b border-th-grey'>
            {stage === 'signin' ? 'Welcome back!' : 'Start using Mesh!'}
            <span className='text-base font-normal text-th-grey'>{stage === 'signin' ? 'Log in to continue' : 'Sign up to continue'}</span>
          </h1>
          <fieldset className='flex flex-col gap-6'>
            {stage === 'signup' && (
              <div className='flex flex-col gap-2'>
                <label className='font-medium' htmlFor="email">Username</label>
                <input className="w-full h-10 px-4 bg-white border rounded-lg focus:border-th-grey text-th-grey border-th-offgrey placeholder:text-th-offgrey" type="text" placeholder='bernard.bear' />
              </div>
            )}
            <div className='flex flex-col gap-2'>
              <label className='font-medium' htmlFor="email">Email Address</label>
              <input className="w-full h-10 px-4 bg-white border rounded-lg focus:border-th-grey text-th-grey border-th-offgrey placeholder:text-th-offgrey" type="text" placeholder='email@company.com' />
            </div>
            <div className='flex flex-col gap-2'>
              <span className='flex items-center justify-between'>
                <label className='font-medium' htmlFor="email">Password</label>
                <p>Forgot Password?</p>
              </span>
              <span className="relative flex items-center">
                <input className="w-full h-10 px-4 bg-white border rounded-lg focus:border-th-grey text-th-grey border-th-offgrey placeholder:text-th-offgrey" type={showPassword.main ? "text" : "password"} placeholder='Enter your password' />
                <i onClick={() => setShowPassword(state => ({...state, main: !state.main}))} className={`fi ${showPassword.main ? 'fi-rs-crossed-eye' : 'fi-rs-eye'} text-base/70 text-th-grey absolute right-4`} />
              </span>
            </div>
            {stage === 'signup' && (
              <div className='flex flex-col gap-2'>
                <label className='font-medium' htmlFor="email">Confirm Password</label>
                <span className="relative flex items-center">
                  <input className="w-full h-10 px-4 bg-white border rounded-lg focus:border-th-grey text-th-grey border-th-offgrey placeholder:text-th-offgrey" type={showPassword.confirm ? "text" : "password"} placeholder='Enter your password' />
                  <i onClick={() => setShowPassword(state => ({...state, confirm: !state.confirm}))} className={`fi ${showPassword.confirm ? 'fi-rs-crossed-eye' : 'fi-rs-eye'} text-base/70 text-th-grey absolute right-4`} />
                </span>
              </div>
            )}
          </fieldset>
          <button type="submit" className='flex items-center justify-center h-12 px-4 text-white cursor-pointer bg-th-grey rounded-2xl'>Sign {stage === 'signin' ? 'in' : 'up'} with Email</button>
        </form>
        <p className='text-xs text-th-grey'>or</p>
        <button className='flex items-center justify-center gap-6 px-8 py-4 font-medium bg-white border cursor-pointer border-th-offgrey text-th-grey rounded-2xl'><img src={GoogleG} className='size-5' alt="" /> Continue with Google</button>
        <p>{stage === 'signin' ? `Don't have an account?` : `Already have an account?`} <span className="font-medium cursor-pointer" onClick={() => setStage(state => state === 'signin' ? 'signup' : 'signin')}>{stage === 'signin' ? `Sign Up` : `Sign In`}</span></p>
      </div>
    </div>
  )
}

export default Auth