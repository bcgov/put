# StatusCake False Positive Downtime

This note explains how to mark StatusCake downtime rows as false positives for the uptime percentage workflow.

The workflow stores imported downtime in:

```sql
public.statuscake_downtime_periods
```

The uptime percentage webhook only counts rows where:

```sql
is_valid = true
```

So a false positive should usually be marked invalid instead of deleted.

## Find Downtime Rows

List recent downtime rows for one cluster:

```sql
SELECT cluster, test_id, period_id, started_at, ended_at, duration_seconds, is_valid, note
FROM public.statuscake_downtime_periods
WHERE cluster = 'emerald'
ORDER BY started_at DESC;
```

Supported cluster names:

```text
clab, klab, emerald, gold, golddr, silver
```

## Mark One Row Invalid

Use the `period_id` from the query above:

```sql
UPDATE public.statuscake_downtime_periods
SET is_valid = false,
    note = 'False positive',
    updated_at = now()
WHERE period_id = 'PASTE_PERIOD_ID_HERE';
```

Verify the row:

```sql
SELECT cluster, period_id, started_at, ended_at, duration_seconds, is_valid, note
FROM public.statuscake_downtime_periods
WHERE period_id = 'PASTE_PERIOD_ID_HERE';
```

## Mark A Range Invalid

If every downtime after a timestamp is false positive:

```sql
UPDATE public.statuscake_downtime_periods
SET is_valid = false,
    note = 'False positive after 2026-04-25 14:01:17+00',
    updated_at = now()
WHERE cluster = 'emerald'
  AND ended_at > '2026-04-25 14:01:17+00'::timestamptz;
```

Use `ended_at > cutoff` instead of `started_at > cutoff` when you want to catch long downtime rows that started before the cutoff but overlap the false-positive period.

Check remaining valid rows after the cutoff:

```sql
SELECT count(*) AS remaining_valid_after_cutoff
FROM public.statuscake_downtime_periods
WHERE cluster = 'emerald'
  AND is_valid = true
  AND ended_at > '2026-04-25 14:01:17+00'::timestamptz;
```

## Undo A False Positive Mark

Undo one row:

```sql
UPDATE public.statuscake_downtime_periods
SET is_valid = true,
    note = null,
    updated_at = now()
WHERE period_id = 'PASTE_PERIOD_ID_HERE';
```

Undo a range:

```sql
UPDATE public.statuscake_downtime_periods
SET is_valid = true,
    note = null,
    updated_at = now()
WHERE cluster = 'emerald'
  AND ended_at > '2026-04-25 14:01:17+00'::timestamptz;
```

## Verify The Uptime Metric

After updating rows, call the uptime percentage webhook again. The webhook recalculates from the table each time, so no writer rerun is needed.

Example:

```text
/webhook/statuscake/uptime-percentage?cluster=emerald&days=30&bucket_hours=1
```

If you want to test directly in `psql` for one timestamp:

```sql
WITH params AS (
  SELECT
    '2026-06-10T03:00:00Z'::timestamptz AS bucket_ts,
    2592000::numeric AS rolling_seconds
),
uptime AS (
  SELECT
    p.bucket_ts,
    COALESCE(SUM(CASE
      WHEN d.period_id IS NULL THEN 0
      ELSE EXTRACT(EPOCH FROM (
        LEAST(d.ended_at, p.bucket_ts)
        - GREATEST(d.started_at, p.bucket_ts - interval '30 days')
      ))
    END), 0)::numeric AS down_seconds,
    p.rolling_seconds
  FROM params p
  LEFT JOIN public.statuscake_downtime_periods d
    ON d.cluster = 'emerald'
   AND d.is_valid = true
   AND d.started_at < p.bucket_ts
   AND d.ended_at > p.bucket_ts - interval '30 days'
  GROUP BY p.bucket_ts, p.rolling_seconds
)
SELECT
  bucket_ts,
  down_seconds,
  GREATEST(0, LEAST(100, ROUND((100 * (1 - (down_seconds / NULLIF(rolling_seconds, 0))))::numeric, 4))) AS uptime_percentage
FROM uptime;
```
