/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LEMON_SQUEEZY_NAME_CHANGE_CHECKOUT_URL: string;
  // add more env variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
