-- Table: public.events

-- DROP TABLE public.events;

CREATE TABLE IF NOT EXISTS public.events
(
    id serial NOT NULL,
    "aggregateId" character varying(50) COLLATE pg_catalog."default" NOT NULL,
    index integer,
    "eventType" character varying(500) COLLATE pg_catalog."default" NOT NULL,
    payload jsonb NOT NULL,
    "aggregateType" character varying(500) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    "previousEventIndex" integer NOT NULL DEFAULT 0,
    CONSTRAINT events_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_events
    ON public.events USING gin
    (payload jsonb_path_ops)
    TABLESPACE pg_default;

 CREATE INDEX IF NOT EXISTS idx_aggregateId_events
    ON public.events ("aggregateId")
    TABLESPACE pg_default;

