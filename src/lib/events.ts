// import va from '@vercel/analytics';
import { z } from 'zod';

import { logger } from '@/lib/logger';

const eventSchema = z.object({
  name: z.enum(['set_layout']),
  // declare type AllowedPropertyValues = string | number | boolean | null
  properties: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()])
    )
    .optional(),
});

export type Event = z.infer<typeof eventSchema>;

export function trackEvent(input: Event): void {
  const event = eventSchema.parse(input);
  if (event) {
    // va.track(event.name, event.properties);
    if (process.env.NODE_ENV === 'development') {
      logger.forAnalytics().info(
        {
          name: event.name,
          properties: event.properties,
        },
        'Tracking event'
      );
    }
  }
}
