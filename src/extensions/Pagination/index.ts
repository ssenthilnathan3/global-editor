import { Extension, Node, mergeAttributes } from '@tiptap/core'
import { keymap } from '@tiptap/pm/keymap'
import type { Node as PMNode } from '@tiptap/pm/model'
import { Plugin, PluginKey, Selection, TextSelection } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pagination: {
      /**
         * Update page numbers
         */
      updatePageNumbers: () => ReturnType
    }
  }
}

export const PageNode = Node.create({
  name: 'page',
  group: 'block',
  content: 'block*',
  defining: true,
  isolating: false,

  addAttributes() {
    return {
      pageNumber: {
        default: 1,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-page]',
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-page': true,
      'class': 'page',
      'data-page-number': node.attrs.pageNumber,
    }), 0]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.setAttribute('data-page', 'true')
      dom.classList.add('page')
      dom.style.height = '297mm' // A4 height in mm
      dom.style.width = '210mm' // A4 width in mm
      dom.style.padding = '25.4mm' // 1 inch padding
      dom.style.border = '1px solid #ccc'
      dom.style.background = 'white'
      dom.style.overflow = 'hidden'
      dom.style.position = 'relative'

      const contentDOM = document.createElement('div')
      dom.appendChild(contentDOM)

      const pageNumber = document.createElement('div')
      pageNumber.classList.add('page-number')
      pageNumber.textContent = `Page ${node.attrs.pageNumber}`
      dom.appendChild(pageNumber)

      return {
        dom,
        contentDOM,
      }
    }
  },
})

export const PaginationPlugin = new Plugin({
  key: new PluginKey('pagination'),
  view() {
    let isPaginating = false

    return {
      update(view: EditorView, prevState) {
        if (isPaginating) {
          return
        }

        const { state } = view
        const { schema } = state
        const pageType = schema.nodes.page

        if (!pageType) {
          return
        }

        const docChanged = !view.state.doc.eq(prevState.doc)
        const initialLoad = prevState.doc.content.size === 0 && state.doc.content.size > 0

        let hasPageNodes = false
        state.doc.forEach((node) => {
          if (node.type === pageType) {
            hasPageNodes = true
          }
        })

        if (!docChanged && hasPageNodes && !initialLoad) {
          return
        }

        isPaginating = true

        // Collect content nodes and their old positions
        const contentNodes: { node: PMNode, pos: number }[] = []
        state.doc.forEach((node, offset) => {
          if (node.type === pageType) {
            node.forEach((child, childOffset) => {
              contentNodes.push({ node: child, pos: offset + childOffset + 1 })
            })
          }
          else {
            contentNodes.push({ node, pos: offset + 1 })
          }
        })

        // Measure node heights
        const MIN_PARAGRAPH_HEIGHT = 20 // Adjust as needed for your styling
        const nodeHeights = contentNodes.map(({ pos, node }) => {
          const dom = view.nodeDOM(pos)
          if (dom instanceof HTMLElement) {
            let height = dom.getBoundingClientRect().height
            if (height === 0) {
              if (node.type.name === 'paragraph' || node.isTextblock) {
                // Assign a minimum height to empty paragraphs or textblocks
                height = MIN_PARAGRAPH_HEIGHT
              }
            }
            return height
          }
          return MIN_PARAGRAPH_HEIGHT // Default to minimum height if DOM element is not found
        })

        // Record the cursor's old position
        const { selection } = view.state
        const oldCursorPos = selection.from

        const pages = []
        let currentPageContent: PMNode[] = []
        let currentHeight = 0
        const pageHeight = ((297 - 25.4 * 2) / 25.4) * 96

        const oldToNewPosMap: { [key: number]: number } = {}
        let cumulativeNewDocPos = 0

        let pageNumber = 1
        for (let i = 0; i < contentNodes.length; i++) {
          const { node, pos: oldPos } = contentNodes[i]
          const nodeHeight = nodeHeights[i]

          if (currentHeight + nodeHeight > pageHeight && currentPageContent.length > 0) {
            const pageNode = pageType.create({ pageNumber }, currentPageContent)
            pages.push(pageNode)
            cumulativeNewDocPos += pageNode.nodeSize
            currentPageContent = []
            currentHeight = 0
            pageNumber++
          }

          if (currentPageContent.length === 0) {
            cumulativeNewDocPos += 1 // Start of the page node
          }

          // Record the mapping from old position to new position
          const nodeStartPosInNewDoc
              = cumulativeNewDocPos + currentPageContent.reduce((sum, n) => sum + n.nodeSize, 0)
          oldToNewPosMap[oldPos] = nodeStartPosInNewDoc

          currentPageContent.push(node)
          currentHeight += Math.max(nodeHeight, MIN_PARAGRAPH_HEIGHT)
        }

        if (currentPageContent.length > 0) {
          const pageNode = pageType.create({ pageNumber }, currentPageContent)
          pages.push(pageNode)
        }

        const newDoc = schema.topNodeType.create(null, pages)

        // Compare the content of the documents
        if (newDoc.content.eq(state.doc.content)) {
          isPaginating = false
          return
        }

        const tr = state.tr.replaceWith(0, state.doc.content.size, newDoc.content)
        tr.setMeta('pagination', true)

        // Map the cursor position
        let newCursorPos = null
        for (let i = 0; i < contentNodes.length; i++) {
          const { node, pos: oldNodePos } = contentNodes[i]
          const nodeSize = node.nodeSize

          if (oldNodePos <= oldCursorPos && oldCursorPos <= oldNodePos + nodeSize) {
            const offsetInNode = oldCursorPos - oldNodePos
            const newNodePos = oldToNewPosMap[oldNodePos]
            newCursorPos = newNodePos + offsetInNode
            break
          }
        }

        if (newCursorPos !== null) {
          const $pos = tr.doc.resolve(newCursorPos)
          let selection

          if ($pos.parent.isTextblock) {
            // The position is valid for a TextSelection
            selection = Selection.near($pos)
          }
          else if ($pos.nodeAfter && $pos.nodeAfter.isTextblock) {
            // Move into the next textblock
            selection = Selection.near(tr.doc.resolve($pos.pos + 1))
          }
          else if ($pos.nodeBefore && $pos.nodeBefore.isTextblock) {
            // Move into the previous textblock
            selection = Selection.near(tr.doc.resolve($pos.pos - 1), -1)
          }
          else {
            // Find the nearest valid cursor position
            selection = Selection.findFrom($pos, 1, true) || Selection.findFrom($pos, -1, true)
          }

          if (selection) {
            tr.setSelection(selection)
          }
          else {
            // Fallback to a safe selection at the end of the document
            tr.setSelection(TextSelection.create(tr.doc, tr.doc.content.size))
          }
        }
        else {
          tr.setSelection(TextSelection.create(tr.doc, tr.doc.content.size))
        }

        view.dispatch(tr)

        isPaginating = false
      },
    }
  },
})

export const PaginationExtension = Extension.create({
  name: 'pagination',
  addCommands() {
    return {
      updatePageNumbers: () => ({ state, dispatch }) => {
        if (dispatch) {
          let pageNumber = 1
          const tr = state.tr
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'page') {
              tr.setNodeMarkup(pos, null, { ...node.attrs, pageNumber })
              pageNumber++
            }
          })
          dispatch(tr)
        }
        return true
      },
    }
  },
  addProseMirrorPlugins() {
    return [
      keymap({
        Enter: (state, dispatch) => {
          const { from, to } = state.selection

          // Proceed only if dispatch is provided and we're working with a valid range
          if (dispatch && from === to) {
            const tr = state.tr

            // Get the resolved position in the document
            const $pos = state.doc.resolve(from)

            // Ensure that the position is within a valid block (paragraph)
            if ($pos.parent.type.name === 'paragraph') {
              // Create a new empty paragraph node
              const paragraph = state.schema.nodes.paragraph.create()

              // Insert the empty paragraph at the cursor's current position
              tr.insert(from, paragraph)

              // Find the nearest valid cursor position inside the new paragraph
              const newSelection = Selection.near(tr.doc.resolve(from + 1), 1)

              // Set the selection to be inside the new paragraph
              tr.setSelection(newSelection)

              // Dispatch the transaction properly
              dispatch(tr)

              return true
            }
          }

          return false
        },
      }),
      PaginationPlugin,
    ]
  },
})
