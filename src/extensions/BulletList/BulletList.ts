import type { BulletListOptions as TiptapBulletListOptions } from '@tiptap/extension-bullet-list'
import { BulletList as TiptapBulletList } from '@tiptap/extension-bullet-list'

import { ActionButton } from '@/components'
import type { GeneralOptions } from '@/types'

export interface BulletListOptions
  extends TiptapBulletListOptions,
  GeneralOptions<BulletListOptions> {}

export const BulletList = TiptapBulletList.extend<BulletListOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      button: ({ editor, t }) => ({
        component: ActionButton,
        componentProps: {
          action: () => editor.commands.toggleBulletList(),
          isActive: () => editor.isActive('bulletList') || false,
          disabled: false,
          shortcutKeys: ['shift', 'mod', '8'],
          icon: 'List',
          tooltip: t('editor.bulletlist.tooltip'),
        },
      }),
    }
  },
})
