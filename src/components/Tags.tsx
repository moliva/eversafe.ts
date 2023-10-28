import { Accessor, For } from "solid-js";

import appStyles from '../App.module.css'
import styles from './Tags.module.css'

export type TagsProps = {
  tags: Accessor<string[] | undefined>

  class?: string

  onTagClicked(tag: string): void
}

export function Tags(props: TagsProps) {
  const { tags, onTagClicked } = props;

  return <div class={`${props.class ?? ''} ${styles['note-tags']}`}>
    <For each={tags() ?? []}>{
      (tag) => <label class={`${styles['note-tag']} ${appStyles.button}`} onClick={() => onTagClicked(tag)}>{tag}</label>
    }</For>
  </div>
}
