import { Extension, Mark } from '@tiptap/core'
import { ReplaceAroundStep, ReplaceStep } from '@tiptap/pm/transform'
import { Plugin, PluginKey } from 'prosemirror-state'

export interface TrackChangeOptions {
  HTMLAttributes: Record<string, any>
}

export const InsertionMark = Mark.create({
  name: 'insertion',

  renderHTML({ HTMLAttributes }) {
    return ['span', { class: 'insertion', style: 'color: green;' }, 0]
  },

  parseHTML() {
    return [
      {
        tag: 'span.insertion',
      },
    ]
  },
})

export const DeletionMark = Mark.create({
  name: 'deletion',

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        class: 'deletion',
        style: 'color: red; text-decoration: line-through;',
      },
      0,
    ]
  },

  parseHTML() {
    return [
      {
        tag: 'span.deletion',
      },
    ]
  },
})

export const TrackChange = Extension.create<TrackChangeOptions>({
  name: 'trackChange',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addProseMirrorPlugins() {
    const { editor } = this

    return [
      new Plugin({
        key: new PluginKey('trackChange'),
        appendTransaction: (transactions, oldState, newState) => {
          const tr = newState.tr
          let modified = false

          transactions.forEach((transaction) => {
            transaction.steps.forEach((step) => {
              if (step instanceof ReplaceStep || step instanceof ReplaceAroundStep) {
                const { from, to } = step
                const newContent = step.slice.content
                const oldContent = oldState.doc.slice(from, to).content

                // Handle insertions
                if (newContent.size > oldContent.size) {
                  const insertFrom = from + oldContent.size
                  const insertTo = from + newContent.size
                  tr.addMark(insertFrom, insertTo, editor.schema.marks.insertion.create())
                  modified = true
                }

                // Handle deletions
                if (oldContent.size > newContent.size) {
                  tr.insert(from + newContent.size, oldContent.cut(newContent.size))
                  tr.addMark(from + newContent.size, to, editor.schema.marks.deletion.create())
                  modified = true
                }
              }
            })
          })

          return modified ? tr : null
        },
      }),
    ]
  },

  addExtensions() {
    console.log('Adding marks:', InsertionMark, DeletionMark)
    return [InsertionMark, DeletionMark]
  },
})
