import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'
import googleTagManager from '@analytics/google-tag-manager'

const analytics = Analytics({
  app: 'contribution-tracker',
  debug: true,
  plugins: [
    googleAnalytics({
        trackingId: 'G-2RSPNCH2FD',
      }),
      googleTagManager({
        containerId: 'G-2RSPNCH2FD'
      }),
    // ... more analytics integrations here
  ]
})

/* export the instance for usage in your app */
export default analytics