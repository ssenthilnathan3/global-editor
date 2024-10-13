import { Node } from '@tiptap/core'

import { VIDEO_SIZE } from '@/constants'
import { getCssUnitWithDefault } from '@/utils/utils'

/**
 * Represents the interface for video options, extending GeneralOptions.
 */
export interface VideoOptions {
  /**
   * Indicates whether fullscreen play is allowed
   *
   * @default true
   */
  allowFullscreen: boolean
  /**
   * Indicates whether to display the frameborder
   *
   * @default false
   */
  frameborder: boolean
  /**
   * Width of the video, can be a number or string
   *
   * @default VIDEO_SIZE['size-medium']
   */
  width: number | string
  /** HTML attributes object for passing additional attributes */
  HTMLAttributes: {
    [key: string]: any
  }
  upload?: (file: File) => Promise<string>
}

/**
 * Represents the type for setting video options
 */
interface SetVideoOptions {
  /** The source URL of the video */
  src: string
  /** The width of the video */
  width: string | number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      /**
       * Add an video
       */
      setVideo: (options: Partial<SetVideoOptions>) => ReturnType
      /**
       * Update an video
       */
      updateVideo: (options: Partial<SetVideoOptions>) => ReturnType
    }
  }
}

function linkConvert(src: string) {
  // Convert youtube links
  src = src
    .replace('https://youtu.be/', 'https://www.youtube.com/watch?v=')
    .replace('watch?v=', 'embed/')

  // Convert vimeo links
  src = src.replace('https://vimeo.com/', 'https://player.vimeo.com/video/')

  // Convert bilibili links
  const isBilibiliLink = /^https?:\/\/www.bilibili.com\/video\/.*/i.test(src)
  if (isBilibiliLink) {
    src = src
      .replace(/\?.*$/, '')
      .replace('https://www.bilibili.com/video/', 'https://player.bilibili.com/player.html?bvid=')
  }

  // Convert google drive links
  if (src.includes('drive.google.com')) {
    src = src.replace('/view', '/preview')
  }

  return src
}

export const Video = Node.create<VideoOptions>({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: {
        default: null,
        renderHTML: ({ src }) => ({
          src: src ? linkConvert(src) : null,
        }),
      },
      width: {
        default: this.options.width,
        renderHTML: ({ width }) => ({
          width: getCssUnitWithDefault(width),
        }),
      },
      frameborder: {
        default: this.options.frameborder ? 1 : 0,
        parseHTML: () => (this.options.frameborder ? 1 : 0),
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => this.options.allowFullscreen,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video] iframe',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { width = '100%' } = HTMLAttributes ?? {}

    const iframeHTMLAttributes = {
      ...HTMLAttributes,
      width: '100%',
      height: '100%',
    }

    const responsiveStyle = `position: relative;overflow: hidden;display: flex;flex: 1;max-width: ${width};`
    const responsiveSizesStyle = `flex: 1;padding-bottom: ${(9 / 16) * 100}%;`

    const iframeDOM = ['iframe', iframeHTMLAttributes]
    const sizesDOM = ['div', { style: responsiveSizesStyle }]
    const responsiveDOM = ['div', { style: responsiveStyle }, sizesDOM, iframeDOM]

    const divAttrs = {
      ...this.options.HTMLAttributes,
      'data-video': '',
    }

    return ['div', divAttrs, responsiveDOM]
  },

  addCommands() {
    return {
      setVideo:
        options =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: options,
            })
          },
      updateVideo:
        options =>
          ({ commands }) => {
            return commands.updateAttributes(this.name, options)
          },
    }
  },

  addOptions() {
    return {
      divider: false,
      spacer: false,
      allowFullscreen: true,
      upload: undefined,
      frameborder: false,
      width: VIDEO_SIZE['size-medium'],
      HTMLAttributes: {
        class: 'iframe-wrapper',
        style: 'display: flex;justify-content: center;',
      },
    }
  },
})
