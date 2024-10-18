/* eslint-disable react/no-unstable-default-props */
import { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react'

import type { AnyExtension, Editor as CoreEditor } from '@tiptap/core'
import type { UseEditorOptions } from '@tiptap/react'
import { EditorContent, useEditor } from '@tiptap/react'
import { differenceBy, throttle } from 'lodash-es'

import type { BubbleMenuProps } from '@/types'
import { BubbleMenu, Toolbar, TooltipProvider } from '@/components'
import { EDITOR_UPDATE_WATCH_THROTTLE_WAIT_TIME } from '@/constants'
import { RESET_CSS } from '@/constants/resetCSS'
import { themeActions } from '@/theme/theme'
import { hasExtension } from '@/utils/utils'
import { removeCSS, updateCSS } from '@/utils/dynamicCSS'

import '../styles/index.scss'
import CharactorCount from '@/components/CharactorCount'
import { PageLayoutExtension } from '@/extensions/Pagination'

/**
 * Interface for RichTextEditor component props
 */
export interface RichTextEditorProps {
  /** Content of the editor */
  content: string
  /** Extensions for the editor */
  extensions: AnyExtension[]

  /** Output format */
  output: 'html' | 'json' | 'text'
  /** Model value */
  modelValue?: string | object
  /** Dark mode flag */
  dark?: boolean
  /** Dense mode flag */
  dense?: boolean
  /** Disabled flag */
  disabled?: boolean
  /** Label for the editor */
  label?: string
  /** Hide toolbar flag */
  hideToolbar?: boolean
  /** Disable bubble menu flag */
  disableBubble?: boolean
  /** Hide bubble menu flag */
  hideBubble?: boolean
  /** Remove default wrapper flag */
  removeDefaultWrapper?: boolean
  /** Maximum width */
  maxWidth?: string | number
  /** Minimum height */
  minHeight?: string | number
  /** Maximum height */
  maxHeight?: string | number
  /** Editor class */
  editorClass?: string | string[] | Record<string, any>
  /** Content class */
  contentClass?: string | string[] | Record<string, any>
  /** Content change callback */
  onChangeContent?: (val: any) => void
  /** Bubble menu props */
  bubbleMenu?: BubbleMenuProps

  /** Use editor options */
  useEditorOptions?: UseEditorOptions

  /** Use editor options */
  resetCSS?: boolean
}

function RichTextEditor(props: RichTextEditorProps, ref: React.ForwardedRef<{ editor: CoreEditor | null }>) {
  const { content, extensions, useEditorOptions = {} } = props

  const sortExtensions = useMemo(() => {
    const diff = differenceBy(extensions, extensions, 'name')
    const exts = extensions.map((k: any) => {
      const find = extensions.find((ext: any) => ext.name === k.name)
      if (!find) {
        return k
      }
      return k.configure(find.options)
    })
    return [...exts, ...diff].map((k, i) => k.configure({ sort: i }))
  }, [extensions])

  const onValueChange = throttle((editor) => {
    const output = getOutput(editor, props.output as any)

    props?.onChangeContent?.(output as any)
  }, EDITOR_UPDATE_WATCH_THROTTLE_WAIT_TIME)

  const editor = useEditor({
    extensions: [
      ...sortExtensions,
      PageLayoutExtension.configure({
        headerContent: '<h1>Document Header</h1>',
        footerContent: '<p>Page {page}</p>',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      if (onValueChange)
        onValueChange(editor)
    },
    ...useEditorOptions,
  })

  useImperativeHandle(ref, () => {
    return {
      editor,
    }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', props.dark)
    themeActions.setTheme(props.dark ? 'dark' : 'light')
  }, [props.dark])

  useEffect(() => {
    editor?.setEditable(!props?.disabled)
  }, [editor, props?.disabled])

  useEffect(() => {
    if (props?.resetCSS !== false) {
      updateCSS(RESET_CSS, 'react-tiptap-reset')
    }

    return () => {
      removeCSS('react-tiptap-reset')
    }
  }, [props?.resetCSS])

  function getOutput(editor: CoreEditor, output: RichTextEditorProps['output']) {
    if (props?.removeDefaultWrapper) {
      if (output === 'html') {
        return editor.isEmpty ? '' : editor.getHTML()
      }
      if (output === 'json') {
        return editor.isEmpty ? {} : editor.getJSON()
      }
      if (output === 'text') {
        return editor.isEmpty ? '' : editor.getText()
      }
      return ''
    }

    if (output === 'html') {
      return editor.getHTML()
    }
    if (output === 'json') {
      return editor.getJSON()
    }
    if (output === 'text') {
      return editor.getText()
    }
    return ''
  }

  useEffect(() => {
    return () => {
      editor?.destroy?.()
    }
  }, [])

  const hasExtensionValue = hasExtension(editor as any, 'characterCount')

  if (!editor) {
    return <></>
  }

  return (
    <div className="global-editor">
      <TooltipProvider delayDuration={0}>
        <div className="richtext-rounded-[0.5rem] richtext-bg-background richtext-shadow richtext-overflow-hidden richtext-outline richtext-outline-1">

          <div className="richtext-flex richtext-flex-col richtext-w-full richtext-max-h-full">
            {!props?.hideToolbar && <Toolbar editor={editor} disabled={!!props?.disabled} />}

            <EditorContent className={`richtext-relative ${props?.contentClass || ''}`} editor={editor} />

            {hasExtensionValue && <CharactorCount editor={editor} extensions={extensions} />}

            {!props?.hideBubble && <BubbleMenu bubbleMenu={props?.bubbleMenu} editor={editor} disabled={props?.disabled} />}
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}

export default forwardRef(RichTextEditor)
