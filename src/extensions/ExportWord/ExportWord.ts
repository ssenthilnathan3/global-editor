import { Extension } from '@tiptap/core'
import { DocxSerializer, defaultMarks, defaultNodes } from 'prosemirror-docx'
import { Packer } from 'docx'
import { ActionButton } from '@/components'
import type { GeneralOptions } from '@/types'
import { downloadFromBlob } from '@/utils/download'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    exportWord: {
      exportToWord: () => ReturnType
    }
  }
}
export interface ExportWordOptions extends GeneralOptions<ExportWordOptions> {}

const nodeSerializer = {
  ...defaultNodes,
  hardBreak: defaultNodes.hard_break,
  codeBlock: defaultNodes.code_block,
  orderedList: defaultNodes.ordered_list,
  listItem: defaultNodes.list_item,
  bulletList: defaultNodes.bullet_list,
  horizontalRule: defaultNodes.horizontal_rule,
  // Requirement Buffer on browser
  image(state: any, node: any) {
    // No image
    state.renderInline(node)
    state.closeBlock(node)
  },
}
const docxSerializer = new DocxSerializer(nodeSerializer, defaultMarks)

export const ExportWord = Extension.create<ExportWordOptions>({
  name: 'exportWord',
  addOptions() {
    return {
      ...this.parent?.(),
      button: ({ editor, t }: any) => ({
        component: ActionButton,
        componentProps: {
          icon: 'ExportWord',
          action: () => {
            editor?.commands.exportToWord()
          },
          tooltip: t('editor.exportWord.tooltip'),
          isActive: () => false,
          disabled: false,
        },
      }),
    }
  },
  // @ts-expect-error
  addCommands() {
    return {
      exportToWord:
        () =>
          async ({ editor }) => {
            const opts: any = {
              getImageBuffer: async (src: string) => {
                const response = await fetch(src)
                const arrayBuffer = await response.arrayBuffer()
                return new Uint8Array(arrayBuffer)
              },
            }

            const wordDocument = docxSerializer.serialize(editor.state.doc, opts)

            Packer.toBlob(wordDocument).then(blob => downloadFromBlob(new Blob([blob]), 'export-document.docx'))

            return true
          },
    }
  },
})
