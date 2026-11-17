import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'ktzuz4y1',
    dataset: 'production',
  },
  deployment: {
    autoUpdates: true,
    appId: 'a1h4axu27rde60j0261z9e3r',
  },
  studioHost: 'backoffice-mathieu-breliere', // Visit https://www.sanity.io/docs/environment-variables to learn more about using environment variables for local & production.
  schemaExtraction: {
    enabled: true,
  },
  typegen: {
    path: '../web/app/sanity-api/*.{ts,tsx}',
    generates: '../web/app/sanity-api/types/sanity.types.ts',
    overloadClientMethods: true,
  },
})
