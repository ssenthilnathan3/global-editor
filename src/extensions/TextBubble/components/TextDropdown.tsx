/* eslint-disable react/no-duplicate-key */
import React, { useMemo } from 'react'

import { ChevronDown } from 'lucide-react'

import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, icons } from '@/components'
import { useLocale } from '@/locales'

interface IPropsTextDropdown {
  editor: any
  disabled?: boolean
  color?: string
  maxHeight?: string | number
  icon?: any
  tooltip?: string
}

function TextDropdown(props: IPropsTextDropdown) {
  const { t } = useLocale()

  const menus = useMemo(() => {
    return [
      {
        name: 'paragraph',
        label: t('editor.paragraph.tooltip'),
        iconName: 'Heading1',
        isActive: () =>
          props.editor.isActive('paragraph')
          && !props.editor.isActive('orderedList')
          && !props.editor.isActive('bulletList')
          && !props.editor.isActive('taskList'),
        action: () => props.editor.chain().focus().clearNodes().run(),
      },
      {
        name: 'heading1',
        label: t('editor.heading.h1.tooltip'),
        isActive: () => props.editor.isActive('heading', { level: 1 }),
        iconName: 'Heading1',
        action: () => props.editor.chain().focus().clearNodes().toggleHeading({ level: 1 }).run(),
      },
      {
        name: 'heading2',
        label: t('editor.heading.h2.tooltip'),
        isActive: () => props.editor.isActive('heading', { level: 2 }),
        iconName: 'Heading2',
        action: () => props.editor.chain().focus().clearNodes().toggleHeading({ level: 2 }).run(),
      },
      {
        name: 'heading3',
        label: t('editor.heading.h3.tooltip'),
        isActive: () => props.editor.isActive('heading', { level: 3 }),
        iconName: 'Heading3',
        action: () => props.editor.chain().focus().clearNodes().toggleHeading({ level: 3 }).run(),
      },
      {
        name: 'bulletList',
        label: t('editor.bulletlist.tooltip'),
        isActive: () => props.editor.isActive('bulletList'),
        iconName: 'List',
        action: () => props.editor.chain().focus().clearNodes().toggleBulletList().run(),
      },
      {
        name: 'numberedList',
        label: t('editor.orderedlist.tooltip'),
        isActive: () => props.editor.isActive('orderedList'),
        iconName: 'ListOrdered',
        action: () => props.editor.chain().focus().clearNodes().toggleOrderedList().run(),
      },
      {
        name: 'taskList',
        label: t('editor.tasklist.tooltip'),
        isActive: () => props.editor.isActive('taskList'),
        iconName: 'ListTodo',
        action: () => props.editor.chain().focus().clearNodes().toggleTaskList().run(),
      },
      {
        name: 'blockquote',
        label: t('editor.blockquote.tooltip'),
        isActive: () => props.editor.isActive('blockquote'),
        iconName: 'TextQuote',
        action: () => props.editor.chain().focus().clearNodes().toggleBlockquote().run(),
      },
      {
        name: 'codeBlock',
        label: t('editor.codeblock.tooltip'),
        isActive: () => props.editor.isActive('codeBlock'),
        iconName: 'Code2',
        action: () => props.editor.chain().focus().clearNodes().toggleCodeBlock().run(),
      },
    ]
  }, [props.editor, t])

  const activeItem = useMemo(() => {
    return (
      menus.filter(item => item.isActive()).pop() ?? {
        label: 'Empty',
      }
    )
  }, [menus])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="richtext-h-[32px] richtext-flex richtext-gap-1 richtext-px-1.5">
          <span className="richtext-text-sm richtext-font-normal richtext-whitespace-nowrap">
            {' '}
            {activeItem?.label}
          </span>
          <ChevronDown className="richtext-w-4 richtext-h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent hideWhenDetached className="richtext-w-full richtext-p-1" align="start" sideOffset={5}>
        {menus.map((item, index) => {
          const Icon = icons[item.iconName as any]

          return (
            <DropdownMenuCheckboxItem
              key={`text-bubble-${index}`}
              checked={item.isActive?.() || false}
              onClick={() => item.action()}
              className="richtext-cursor-pointer"
            >
              <div className="richtext-flex richtext-items-center richtext-gap-2 richtext-px-2">
                <Icon className="richtext-w-3 richtext-h3" />
                <span>
                  {' '}
                  {item.label}
                </span>
              </div>
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TextDropdown
