import type { Extensions } from '@tiptap/core'

import type { Group } from './types'
import type { HeadingOptions } from '@/extensions'
import { localeActions } from '@/locales'

export function renderGroups(extensions: Extensions) {
  const groups: Group[] = [
    {
      name: 'format',
      title: localeActions.t('editor.slash.format'),
      commands: [],
    },
    {
      name: 'insert',
      title: localeActions.t('editor.slash.insert'),
      commands: [],
    },
  ]

  extensions.forEach((extension) => {
    /* Format */
    if (extension.name.toLowerCase() === 'heading') {
      extension.options.levels.forEach((level: HeadingOptions['levels'][number]) => {
        groups[0].commands.push({
          name: `heading${level}`,
          label: localeActions.t(`editor.heading.h${level}.tooltip`),
          aliases: [`h${level}`, 'bt', `bt${level}`],
          iconName: `Heading${level}`,
          action: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHeading({ level }).run()
          },
        })
      })
    }

    if (extension.name.toLowerCase() === 'bulletlist') {
      groups[0].commands.push({
        name: 'bulletList',
        label: localeActions.t('editor.bulletlist.tooltip'),
        aliases: ['ul', 'yxlb'],
        iconName: 'List',
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run()
        },
      })
    }

    if (extension.name.toLowerCase() === 'orderedlist') {
      groups[0].commands.push({
        name: 'numberedList',
        label: localeActions.t('editor.orderedlist.tooltip'),
        aliases: ['ol', 'yxlb'],
        iconName: 'ListOrdered',
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run()
        },
      })
    }

    if (extension.name.toLowerCase() === 'tasklist') {
      groups[0].commands.push({
        name: 'taskList',
        label: localeActions.t('editor.tasklist.tooltip'),
        iconName: 'ListTodo',
        description: 'Task list with todo items',
        aliases: ['todo'],
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleTaskList().run()
        },
      })
    }

    if (extension.name.toLowerCase() === 'blockquote') {
      groups[0].commands.push({
        name: 'blockquote',
        label: localeActions.t('editor.blockquote.tooltip'),
        description: '插入引入格式',
        aliases: ['yr'],
        iconName: 'TextQuote',
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setBlockquote().run()
        },
      })
    }

    if (extension.name.toLowerCase() === 'codeblock') {
      groups[0].commands.push({
        name: 'codeBlock',
        label: localeActions.t('editor.codeblock.tooltip'),
        iconName: 'Code2',
        description: 'Code block with syntax highlighting',
        shouldBeHidden: editor => editor.isActive('columns'),
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setCodeBlock().run()
        },
      })
    }

    /* Insert */
    if (extension.name.toLowerCase() === 'image') {
      groups[1].commands.push({
        name: 'image',
        label: localeActions.t('editor.image.tooltip'),
        iconName: 'ImageUp',
        description: 'Insert a image',
        aliases: ['image', 'tp', 'tupian'],
        shouldBeHidden: editor => editor.isActive('columns'),
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setImageUpload().run()
        },
      })
    }

    if (extension.name.toLowerCase() === 'video') {
      groups[1].commands.push({
        name: 'video',
        label: localeActions.t('editor.video.tooltip'),
        iconName: 'Video',
        description: 'Insert a video',
        aliases: ['video', 'sp', 'shipin'],
        shouldBeHidden: editor => editor.isActive('columns'),
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setVideoUpload().run()
        },
      })
    }

    if (extension.name.toLowerCase() === 'table') {
      groups[1].commands.push({
        name: 'table',
        label: localeActions.t('editor.table.tooltip'),
        iconName: 'Table',
        description: 'Insert a table',
        aliases: ['table', 'bg', 'biaoge', 'biao'],
        shouldBeHidden: editor => editor.isActive('columns'),
        action: ({ editor, range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertTable({ rows: 3, cols: 3, withHeaderRow: false })
            .run()
        },
      })
    }

    if (extension.name.toLowerCase() === 'horizontalrule') {
      groups[1].commands.push({
        name: 'horizontalRule',
        label: localeActions.t('editor.horizontalrule.tooltip'),
        iconName: 'Minus',
        description: 'Insert a horizontal divider',
        aliases: ['hr', 'fgx', 'fg'],
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setHorizontalRule().run()
        },
      })
    }

    if (extension.name.toLowerCase() === 'columns') {
      groups[1].commands.push({
        name: 'columns',
        label: localeActions.t('editor.columns.tooltip'),
        iconName: 'Columns2',
        description: 'Add two column content',
        action: ({ editor }) => {
          editor.chain().focus().insertColumns({ cols: 2 }).run()
        },
      })
    }
  })

  return groups
}
