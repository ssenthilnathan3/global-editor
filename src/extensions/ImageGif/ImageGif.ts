import { mergeAttributes } from '@tiptap/core'
import type { ImageOptions } from '@tiptap/extension-image'
import TiptapImage from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'

import ImageGifView from '@/extensions/ImageGif/components/ImageGifView'
import ImageGifActionButton from '@/extensions/ImageGif/components/ImageGifActionButton'

export interface SetImageAttrsOptions {
  src?: string
  /** The alternative text for the image. */
  alt?: string
  /** The title of the image. */
  title?: string
  /** The width of the image. */
  width?: number | string | null
  /** The alignment of the image. */
  align?: 'left' | 'center' | 'right'
}

interface ImageGifOptions extends ImageOptions {
  /**
   * The key for the gif https://giphy.com/
   */
  GIPHY_API_KEY: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    // @ts-expect-error
    imageResize: {
      /**
       * Add an image gif
       */
      setImageGif: (options: Partial<SetImageAttrsOptions>) => ReturnType
      /**
       * Update an image gif
       */
      updateImageGif: (options: Partial<SetImageAttrsOptions>) => ReturnType
      /**
       * Set image alignment
       */
      setAlignImageGif: (align: 'left' | 'center' | 'right') => ReturnType
    }
  }
}

export const ImageGif = TiptapImage.extend<ImageGifOptions>({
  name: 'imageGif',
  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      content: '',
      marks: '',
      group: 'block',
      GIPHY_API_KEY: '',
      draggable: false,
      selectable: true,
      atom: true,
      button: ({ editor, extension, t }: any) => {
        const giphyApiKey = extension?.options?.GIPHY_API_KEY || ''

        return {
          component: ImageGifActionButton,
          componentProps: {
            editor,
            action: () => {},
            isActive: () => false,
            disabled: false,
            icon: 'GifIcon',
            tooltip: t('editor.imageGif.tooltip'),
            giphyApiKey,
          },
        }
      },
    }
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.style.width || element.getAttribute('width') || '10'
          return width === undefined ? null : Number.parseInt(`${width}`, 10)
        },
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
          }
        },
      },
      align: {
        default: 'left',
        parseHTML: element => element.getAttribute('align'),
        renderHTML: (attributes) => {
          return {
            align: attributes.align,
          }
        },
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageGifView)
  },
  addCommands() {
    return {
      ...this.parent?.(),
      updateImageGif:
        (options: any) =>
          ({ commands }: any) => {
            return commands.updateAttributes(this.name, options)
          },
      setAlignImageGif:
          (align: any) =>
            ({ commands }: any) => {
              return commands.updateAttributes(this.name, { align })
            },
    }
  },
  renderHTML({ HTMLAttributes }) {
    const { align } = HTMLAttributes

    const style = align ? `text-align: ${align};` : ''
    return [
      'div', // Parent element
      {
        style,
        class: 'image',
      },
      [
        'img',
        mergeAttributes(
          // Always render the `height="auto"`
          {
            height: 'auto',
          },
          this.options.HTMLAttributes,
          HTMLAttributes,
        ),
      ],
    ]
  },
  parseHTML() {
    return [
      {
        tag: 'div[class=image]',
        getAttrs: (element) => {
          const img = element.querySelector('img')

          const width = img?.getAttribute('width')

          return {
            src: img?.getAttribute('src'),
            alt: img?.getAttribute('alt'),
            title: img?.getAttribute('title'),
            width: width ? Number.parseInt(width as string, 10) : null,
            align: img?.getAttribute('align') || element.style.textAlign || null,
          }
        },
      },
    ]
  },
})

export default ImageGif
