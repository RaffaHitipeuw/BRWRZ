function NewTab() {
  const resizeSearch = (event) => {
    const textarea = event.currentTarget
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  return (
    <div className='flex flex-col items-center justify-center w-full h-full gap-10 overflow-y-auto scrollbar-none'>
      <h1 className="text-4xl">Good morning!</h1>
      <div className='relative px-6 min-h-16 flex items-center gap-6 border rounded-4xl border-th-grey text-th-grey min-w-129 max-w-[80%]'>
        <i className="fi fi-rs-search text-lg/70 absolute top-5.5" />
        <textarea
          rows={1}
          placeholder='Search the Web'
          onInput={resizeSearch}
          className='placeholder:text-th-grey text-th-grey focus:outline-0 flex-1 resize-none min-h-6 ml-10.5 overflow-hidden py-4.5'
        />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-21 w-3xl auto-rows-auto">
        <div className="flex flex-col items-center justify-center gap-4 border cursor-pointer bg-th-grey/15 border-th-grey rounded-2xl h-52">
          <img className="size-14" src="https://cdn.simpleicons.org/spotify/1DB954" />
          <p>Website Title</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 border cursor-pointer bg-th-grey/15 border-th-grey rounded-2xl h-52">
          <img className="size-14" src="https://cdn.simpleicons.org/spotify/1DB954" />
          <p>Website Title</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 border cursor-pointer bg-th-grey/15 border-th-grey rounded-2xl h-52">
          <img className="size-14" src="https://cdn.simpleicons.org/spotify/1DB954" />
          <p>Website Title</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 border cursor-pointer bg-th-grey/15 border-th-grey rounded-2xl h-52">
          <img className="size-14" src="https://cdn.simpleicons.org/spotify/1DB954" />
          <p>Website Title</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 border cursor-pointer bg-th-grey/15 border-th-grey rounded-2xl h-52">
          <img className="size-14" src="https://cdn.simpleicons.org/spotify/1DB954" />
          <p>Website Title</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 border cursor-pointer border-th-grey rounded-2xl">
          <i className="fi fi-rr-plus text-xs/70" />
        </div>
      </div>
    </div>
  )
}

export default NewTab