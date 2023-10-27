import { For } from 'solid-js'

import { Content } from "../types"

import { LineComponent } from './LineComponent'

import styles from './ContentComponent.module.css'

export type ContentProps = {
  initial?: boolean
  content: Content

  onCheckToggle(indices: number[]): void
}

export const ContentComponent = (props: ContentProps) => {
  const { content, initial } = props

  return <div class={initial ? styles['content-initial'] : styles.content}>
    <For each={content}>{
      ([key, value], i) => <>
        <LineComponent key={key} onCheckToggle={() => props.onCheckToggle([i()])} />
        <ContentComponent content={value} onCheckToggle={(indices) => props.onCheckToggle([i(), ...indices])} />
      </>
    }</For>
  </div>
}
