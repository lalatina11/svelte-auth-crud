import { writable } from "svelte/store"
import type { PostWithUser } from "../../types"

const usePostStore = () => {
   const { subscribe, set, update } = writable<PostWithUser[]>([])
   return {
      subscribe,
      setPosts: (allPost: PostWithUser[]) => set(allPost),
      insertPost: (newPost: PostWithUser) => update(prev => [newPost, ...prev]),
      deletePost: (id: number) => update(prev => prev.filter(prevPost => prevPost.id !== id))
   }
}
export const postStore = usePostStore()