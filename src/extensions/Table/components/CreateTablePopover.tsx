/* eslint-disable react/no-duplicate-key */
import React, { useState } from 'react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components'
import {
  TABLE_DEFAULT_SELECTED_GRID_SIZE,
  TABLE_INIT_GRID_SIZE,
  TABLE_MAX_GRID_SIZE,
} from '@/constants'
import { isMobile } from '@/utils/is-mobile'

const createArray = (length: number) => Array.from({ length }).map((_, index) => index + 1)

interface IPropsCreateTablePopover {
  createTable: any
  children: any
}

export interface GridSize {
  rows: number
  cols: number
}

export interface CreateTablePayload extends GridSize {
  withHeaderRow: boolean
}

function CreateTablePopover(props: IPropsCreateTablePopover) {
  const [withHeaderRow, setWithHeaderRow] = useState<boolean>(true)
  const [tableGridSize, setTableGridSize] = useState<GridSize>({
    rows: isMobile() ? TABLE_MAX_GRID_SIZE : TABLE_INIT_GRID_SIZE,
    cols: isMobile() ? TABLE_MAX_GRID_SIZE : TABLE_INIT_GRID_SIZE,
  })

  const [selectedTableGridSize, setSelectedTableGridSize] = useState<GridSize>({
    rows: TABLE_DEFAULT_SELECTED_GRID_SIZE,
    cols: TABLE_DEFAULT_SELECTED_GRID_SIZE,
  })

  function selectTableGridSize(rows: number, cols: number): void {
    if (rows === tableGridSize.rows) {
      setTableGridSize((prev) => {
        return {
          ...prev,
          rows: Math.min(rows + 1, TABLE_MAX_GRID_SIZE),
        }
      })
    }

    if (cols === tableGridSize.cols) {
      setTableGridSize((prev) => {
        return {
          ...prev,
          cols: Math.min(cols + 1, TABLE_MAX_GRID_SIZE),
        }
      })
    }

    setSelectedTableGridSize({
      rows,
      cols,
    })
  }

  function onMouseDown(rows: number, cols: number) {
    props?.createTable({ rows, cols, withHeaderRow })
    resetTableGridSize()
  }

  function resetTableGridSize(): void {
    setWithHeaderRow(false)

    setTableGridSize({
      rows: TABLE_INIT_GRID_SIZE,
      cols: TABLE_INIT_GRID_SIZE,
    })

    setSelectedTableGridSize({
      rows: TABLE_DEFAULT_SELECTED_GRID_SIZE,
      cols: TABLE_DEFAULT_SELECTED_GRID_SIZE,
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {props?.children}
      </PopoverTrigger>
      <PopoverContent className="richtext-w-full !richtext-p-2" align="start" side="bottom">
        <div className="richtext-p-0 table-grid-size-editor">
          <div className="richtext-flex richtext-flex-col richtext-flex-wrap richtext-justify-between richtext-gap-1">
            {createArray(tableGridSize?.rows)?.map((row: any) => {
              return (
                <div key={`r-${row}`} className="richtext-flex richtext-gap-1">
                  {createArray(tableGridSize?.cols)?.map((col: any) => {
                    return (
                      <div
                        key={`c-${col}`}
                        className={`richtext-cursor-pointer richtext-border-border ${
                          col <= selectedTableGridSize.cols
                          && row <= selectedTableGridSize.rows
                          && '!richtext-bg-foreground tableCellActive'
                        }`}
                        onMouseOver={() => selectTableGridSize(row, col)}
                        onMouseDown={() => onMouseDown(row, col)}
                      >
                        <div className="richtext-w-4 richtext-h-4 richtext-p-1 !richtext-border richtext-rounded-[2px] richtext-box-border richtext-border-solid !richtext-border-border"></div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
          <div className="richtext-mt-2 richtext-text-sm richtext-text-center richtext-text-zinc-600">
            {selectedTableGridSize.rows}
            {' '}
            x
            {selectedTableGridSize.cols}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default CreateTablePopover
