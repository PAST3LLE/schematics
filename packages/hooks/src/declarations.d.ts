declare module '*.ttf' {
  const src: string
  export default src
}
declare module '*.svg' {
  const src: string
  export default src
}
declare module '*.png' {
  const src: string
  export default src
}

interface Window {
  __PSTL_HOOKS_CONTEXT_LISTENERS: EventListener[]
}
