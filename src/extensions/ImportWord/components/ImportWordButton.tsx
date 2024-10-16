import React, { useEffect, useRef, useState } from 'react'
import { ActionButton } from '@/components'

function base64ToBlob(base64: any, mimeType: any) {
  const byteCharacters = atob(base64.split(',')[1])
  const byteNumbers = Array.from({ length: byteCharacters.length })
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers as any)
  return new Blob([byteArray], { type: mimeType })
}

function blobToFile(blob: any, fileName: any) {
  return new File([blob], fileName, { type: blob.type })
}

function ImportWordButton(props: any) {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<any>()
  const fileInput: any = useRef()

  useEffect(() => {
    console.log('ImportWordButton props:', props)
  }, [props])

  function triggerFileInput() {
    console.log('Triggering file input')
    fileInput.current.click()
  }

  function handleFileChange(event: any) {
    console.log('File selected')
    const f = event.target.files[0]
    setFile(f)
    if (f) {
      importWord()
    }
  }

  async function importWord() {
    console.log('Importing word document')
    if (file && props.editor) {
      setLoading(true)
      console.log('Starting import process')
      props.editor.chain().import({
        file,
        onImport(context: any) {
          console.log('Import completed')
          context.setEditorContent()
          setLoading(false)
        },
      }).run()
    }
    else {
      console.error('File or editor not available', { file, editor: props.editor })
    }
  }

  return (
    <div>
      <ActionButton
        loading={loading}
        disabled={props?.disabled}
        icon={props?.icon}
        tooltip={props?.tooltip}
        action={triggerFileInput}
      />
      <input
        type="file"
        accept=".docx"
        ref={fileInput}
        style={{
          display: 'none',
        }}
        onChange={handleFileChange}
      />
    </div>
  )
}

export default ImportWordButton
