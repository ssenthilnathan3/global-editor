import { useCallback, useState } from 'react'

import RichTextEditor, {
  Attachment,
  BaseKit,
  Blockquote,
  Bold,
  BulletList,
  Clear,
  Code,
  CodeBlock,
  Color,
  ColumnActionButton,
  Emoji,
  Excalidraw,
  ExportPdf,
  ExportWord,
  FontFamily,
  FontSize,
  FormatPainter,
  Heading,
  Highlight,
  History,
  HorizontalRule,
  Iframe,
  Image,
  ImageGif,
  ImageUpload,
  ImportWord,
  Import,
  Indent,
  Italic,
  Katex,
  LineHeight,
  Link,
  Mention,
  MoreMark,
  OrderedList,
  SearchAndReplace,
  SlashCommand,
  Strike,
  Table,
  TableOfContents,
  TaskList,
  TextAlign,
  TextDirection,
  TrackChange,
  Underline,
  Video,
  VideoUpload,
  locale,
  PaginationExtension,
  PageNode,
} from 'global-editor'

import 'global-editor/style.css'
import { Extension } from '@tiptap/core'

function convertBase64ToBlob(base64: string) {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

const extensions = [
  BaseKit.configure({
    placeholder: {
      showOnlyCurrent: true,
    },
    characterCount: {
      limit: 50_000,
    },
  }),
  TrackChange,
  History,
  SearchAndReplace,
  TableOfContents,
  FormatPainter.configure({ spacer: true }),
  Clear,
  FontFamily,
  Heading.configure({ spacer: true }),
  FontSize,
  Bold,
  Italic,
  Underline,
  Strike,
  MoreMark,
  Katex,
  Emoji,
  Color.configure({ spacer: true }),
  Highlight,
  BulletList,
  OrderedList,
  TextAlign.configure({ types: ['heading', 'paragraph'], spacer: true }),
  Indent,
  LineHeight,
  TaskList.configure({
    spacer: true,
    taskItem: {
      nested: true,
    },
  }),
  Link,
  Image,
  ImageUpload.configure({
    upload: (files: File) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(files))
        }, 500)
      })
    },
  }),
  Video,
  VideoUpload.configure({
    upload: (files: File[]) => {
      const f = files.map(file => ({
        src: URL.createObjectURL(file),
        alt: file.name,
      }))
      return Promise.resolve(f)
    },
  }),
  // ImageGif.configure({
  //   GIPHY_API_KEY: '',
  // }),
  Blockquote,
  SlashCommand,
  HorizontalRule,
  Code.configure({
    toolbar: false,
  }),
  CodeBlock.configure({ defaultTheme: 'dracula' }),
  ColumnActionButton,
  Table,
  Iframe,
  ExportPdf.configure({ spacer: true }),
  ImportWord.configure({
    upload: async (files: File[]) => {
      console.log("Upload function called with files:", files.length);
      const f = files.map(file => ({
        src: URL.createObjectURL(file),
        alt: file.name,
      }));
      console.log("Processed files:", f);
      return f;
    },
  }),
  Import.configure({
    appId: 'ok082489',
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MjkxMTQyOTMsIm5iZiI6MTcyOTExNDI5MywiZXhwIjoxNzI5MjAwNjkzLCJpc3MiOiJodHRwczovL2Nsb3VkLnRpcHRhcC5kZXYiLCJhdWQiOiI2ODc3YzA3NS05MjlkLTRiMDMtYTVjYS05ZTVlM2NmOTZkOGYifQ.0KIkH9VkSEbXEn9G0vWVBiCtFqDYD1Z5UnMq_E-RzFQ'
  }),
  PaginationExtension,
  PageNode,
  ExportWord,
  Excalidraw,
  TextDirection,
  Mention,
  Attachment.configure({
    upload: (file: any) => {
      // fake upload return base 64
      const reader = new FileReader()
      reader.readAsDataURL(file)

      return new Promise((resolve) => {
        setTimeout(() => {
          const blob = convertBase64ToBlob(reader.result as string)
          resolve(URL.createObjectURL(blob))
        }, 300)
      })
    },
  }),
]

const DEFAULT = `<h1 style="text-align: center">Rich Text Editor</h1><p>A modern WYSIWYG rich text editor based on <a target="_blank" rel="noopener noreferrer nofollow" class="link" href="https://github.com/scrumpy/tiptap">tiptap</a> and <a target="_blank" rel="noopener noreferrer nofollow" class="link" href="https://ui.shadcn.com/">shadcn ui</a> for Reactjs</p><p></p><p style="text-align: center"></p><div style="text-align: center;" class="image"><img height="auto" src="https://picsum.photos/1920/1080.webp?t=1" align="center" width="500"></div><p></p><div data-type="horizontalRule"><hr></div><h2>Demo</h2><p>👉<a target="_blank" rel="noopener noreferrer nofollow" class="link" href="https://global-editor.vercel.app/">Demo</a></p><h2>Features</h2><ul><li><p>Use <a target="_blank" rel="noopener noreferrer nofollow" class="link" href="https://ui.shadcn.com/">shadcn ui</a> components</p></li><li><p>Markdown support</p></li><li><p>TypeScript support</p></li><li><p>I18n support (vi, en, zh, pt)</p></li><li><p>React support</p></li><li><p>Slash Commands</p></li><li><p>Multi Column</p></li><li><p>TailwindCss</p></li><li><p>Support emoji</p></li><li><p>Support iframe</p></li></ul><h2>Installation</h2><pre><code class="language-bash">pnpm add global-editor</code></pre><p></p>`

function debounce(func: any, wait: number) {
  let timeout: NodeJS.Timeout
  return function (...args: any[]) {
    clearTimeout(timeout)
    // @ts-ignore
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

function App() {
  const [content, setContent] = useState(DEFAULT)
  const [theme, setTheme] = useState('light')
  const [disable, setDisable] = useState(false)

  const onValueChange = useCallback(
    debounce((value: any) => {
      setContent(value)
    }, 300),
    [],
  )
  return (
    <div
      className="p-[24px] flex flex-col w-full max-w-screen-lg gap-[24px] mx-[auto] my-0"
      style={{
        maxWidth: 1024,
        margin: '40px auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: 10,
        }}
      >
        <button type="button" onClick={() => locale.setLang('vi')}>Vietnamese</button>
        <button type="button" onClick={() => locale.setLang('en')}>English</button>
        <button type="button" onClick={() => locale.setLang('zh_CN')}>Chinese</button>
        <button type="button" onClick={() => locale.setLang('pt_BR')}>Português</button>
        <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        <button type="button" onClick={() => setDisable(!disable)}>{disable ? 'Editable' : 'Readonly'}</button>
      </div>

      <RichTextEditor
        output="html"
        content={content as any}
        onChangeContent={onValueChange}
        extensions={extensions}
        dark={theme === 'dark'}
        disabled={disable}
      />

      {typeof content === 'string' && (
        <textarea
          style={{
            marginTop: 20,
            height: 500,
          }}
          readOnly
          value={content}
        />
      )}
    </div>
  )
}

export default App
