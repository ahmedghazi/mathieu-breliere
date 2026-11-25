import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'ktzuz4y1',
    dataset: 'production',
  },
  deployment: {
    autoUpdates: true,
    appId: 'snko1zysgr372rprvy0ve0ji',
  },
  studioHost: 'backoffice--mathieu-breliere', // Visit https://www.sanity.io/docs/environment-variables to learn more about using environment variables for local & production.
  schemaExtraction: {
    enabled: true,
  },
  typegen: {
    enabled: true,
    path: '../web/app/sanity-api/*.{ts,tsx}',
    generates: '../web/app/sanity-api/types/sanity.types.ts',
    overloadClientMethods: true,
  },
})
